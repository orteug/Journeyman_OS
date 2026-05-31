"""
SOURCE — Perplexity Puller

Runs Perplexity Sonar queries against each item on the operator's
engagement-domain watchlist and saves raw results to disk for the
digest generator to synthesize.

This is the gap/competition/demand signal layer of SOURCE. The Researcher
reads the synthesized digest at Stage 2 — it does not read this file directly.

Usage:
    python pull_perplexity.py [--dry-run] [--id 01,03]

Flags:
    --dry-run    Print queries without calling the API (no cost)
    --id         Comma-separated list of watchlist IDs to run (default: all)

Output:
    data/perplexity_YYYY-MM-DD.json  — array of result objects (one per item)
    data/perplexity_latest.json      — copy for the digest generator

Cost estimate: ~$0.005 per query (Sonar model).
At the default 20-item watchlist × 3 query types = ~$0.30 per full run.

Watchlist configuration: config/watchlist.json (see config/watchlist_example.json
for the schema). Each item defines the engagement domain question the operator
wants the pipeline to answer.
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import date
from pathlib import Path

from load_env import load_env
load_env()

CONFIG_DIR = Path(__file__).parent / "config"
DATA_DIR = Path(__file__).parent / "data"
WATCHLIST_FILE = CONFIG_DIR / "watchlist.json"

PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
PERPLEXITY_MODEL = "sonar"

# System prompt: frames Perplexity as an engagement-domain intelligence analyst.
# Generalized so the same prompt works for any engagement domain the operator
# configures in watchlist.json — HVAC, fintech, healthcare ops, anything.
SYSTEM_PROMPT = (
    "You are a market intelligence analyst supporting an operator entering a new "
    "client engagement. Answer concisely with specific, actionable observations. "
    "Focus on real pain points, workarounds, pricing complaints, regulatory shifts, "
    "and gaps in existing tools or services. Cite specific sources where possible. "
    "Keep responses under 300 words."
)


def load_watchlist(ids_filter: list[str] | None = None) -> list[dict]:
    with open(WATCHLIST_FILE) as f:
        items = json.load(f)
    if ids_filter:
        items = [i for i in items if i["id"] in ids_filter]
    return items


def call_perplexity(query: str, api_key: str) -> dict:
    """Single Perplexity API call. Returns the full response dict."""
    payload = json.dumps({
        "model": PERPLEXITY_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": query},
        ],
        "max_tokens": 400,
        "return_citations": True,
    }).encode("utf-8")

    req = urllib.request.Request(
        PERPLEXITY_API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extract_answer(response: dict) -> str:
    """Pull the assistant message content from a Perplexity response."""
    try:
        return response["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return "[no content]"


def extract_citations(response: dict) -> list[str]:
    """Extract citation URLs if present."""
    try:
        return response.get("citations", [])
    except Exception:
        return []


def run(dry_run: bool = False, ids_filter: list[str] | None = None) -> None:
    api_key = os.environ.get("PERPLEXITY_API_KEY", "")
    if not api_key and not dry_run:
        print("ERROR: PERPLEXITY_API_KEY not set in environment.")
        print("  Set it in .env or export PERPLEXITY_API_KEY=your_key")
        sys.exit(1)

    if not WATCHLIST_FILE.exists():
        example_file = CONFIG_DIR / "watchlist_example.json"
        if dry_run and example_file.exists():
            print(f"[dry-run] {WATCHLIST_FILE.name} not found — falling back to watchlist_example.json")
            global_watchlist = example_file
            with open(global_watchlist) as f:
                items = json.load(f)
            if ids_filter:
                items = [i for i in items if i["id"] in ids_filter]
        else:
            print(f"ERROR: {WATCHLIST_FILE} not found.")
            print("  Copy config/watchlist_example.json to config/watchlist.json and")
            print("  configure it for your engagement domain before running.")
            sys.exit(1)
    else:
        items = load_watchlist(ids_filter)
    today = date.today().isoformat()
    results = []
    query_count = 0
    error_count = 0

    print(f"Perplexity puller — {today}")
    print(f"Items: {len(items)} | Model: {PERPLEXITY_MODEL} | Dry run: {dry_run}")
    print("-" * 60)

    for item in items:
        item_results = {
            "id": item["id"],
            "label": item["label"],
            "shape": item.get("shape", ""),
            "duration": item.get("duration", ""),
            "date": today,
            "queries": {},
        }

        queries = item.get("queries", {})
        for query_type, query_text in queries.items():
            query_count += 1
            print(f"  [{item['id']}] {item['label']} — {query_type}")

            if dry_run:
                print(f"    DRY RUN: {query_text[:80]}...")
                item_results["queries"][query_type] = {
                    "query": query_text,
                    "answer": "[dry run — no API call]",
                    "citations": [],
                }
                continue

            try:
                response = call_perplexity(query_text, api_key)
                answer = extract_answer(response)
                citations = extract_citations(response)
                item_results["queries"][query_type] = {
                    "query": query_text,
                    "answer": answer,
                    "citations": citations,
                }
                print(f"    OK — {len(answer)} chars, {len(citations)} citations")
            except urllib.error.HTTPError as e:
                error_count += 1
                body = e.read().decode("utf-8", errors="replace")
                print(f"    ERROR HTTP {e.code}: {body[:120]}")
                item_results["queries"][query_type] = {
                    "query": query_text,
                    "answer": f"[error: HTTP {e.code}]",
                    "citations": [],
                }
            except Exception as e:
                error_count += 1
                print(f"    ERROR {e}")
                item_results["queries"][query_type] = {
                    "query": query_text,
                    "answer": f"[error: {e}]",
                    "citations": [],
                }

            # Rate limit: 1 request/second (Sonar is generous but be polite)
            time.sleep(1)

        results.append(item_results)

    # Save
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_file = DATA_DIR / f"perplexity_{today}.json"
    latest_file = DATA_DIR / "perplexity_latest.json"

    if not dry_run:
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2)
        with open(latest_file, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\nWrote {len(results)} items -> {output_file}")
        print(f"  Latest -> {latest_file}")
    else:
        print(f"\nDRY RUN complete — {query_count} queries previewed, nothing saved")

    print(f"\n-- Summary --")
    print(f"  Items processed : {len(results)}")
    print(f"  Queries run     : {query_count}")
    print(f"  Errors          : {error_count}")
    if not dry_run and query_count > 0:
        est_cost = query_count * 0.005
        print(f"  Est. cost       : ~${est_cost:.2f}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pull Perplexity signals for the engagement watchlist")
    parser.add_argument("--dry-run", action="store_true", help="Print queries without calling API")
    parser.add_argument("--id", type=str, help="Comma-separated watchlist IDs to run (e.g. 01,03)")
    args = parser.parse_args()

    ids_filter = [i.strip().zfill(2) for i in args.id.split(",")] if args.id else None
    run(dry_run=args.dry_run, ids_filter=ids_filter)


if __name__ == "__main__":
    main()
