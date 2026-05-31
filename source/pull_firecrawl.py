"""
SOURCE — Firecrawl Competitor Monitor

Crawls operator-configured competitor URLs weekly and stores content snapshots.
On subsequent runs, diffs against the previous snapshot to detect changes
(pricing, features, positioning, job postings, etc.).

This is the T2 (competitive signal) tier of the SOURCE pipeline. The Researcher
weights this signal high — competitor moves are usually directly relevant to the
operator's engagement, and the client is rarely watching them closely enough.

Usage:
    python pull_firecrawl.py [--dry-run] [--id c01,c02]

Flags:
    --dry-run    Skip API calls (no cost). Prints what would be scraped.
    --id         Comma-separated competitor IDs to scope the run.

Output:
    data/firecrawl_YYYY-MM-DD.json   — array of crawl results with diffs
    data/firecrawl_latest.json       — copy for the digest generator
    data/snapshots/                  — raw page content by competitor id
                                       (used for diff comparison on next run)

Cost: uses Firecrawl credits. Targeted crawls only — 1 URL per competitor.
Default 5 competitors = ~5 credits per full run.

Configuration: config/competitors.json (see config/competitors_example.json
for the schema). Operators list the URLs they want monitored — usually
pricing pages, job postings, and blog/changelog endpoints.
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
SNAPSHOTS_DIR = DATA_DIR / "snapshots"
COMPETITORS_FILE = CONFIG_DIR / "competitors.json"

FIRECRAWL_SCRAPE_URL = "https://api.firecrawl.dev/v1/scrape"
SLEEP_BETWEEN = 2  # seconds between requests


def load_competitors(ids_filter: list[str] | None = None) -> list[dict]:
    with open(COMPETITORS_FILE) as f:
        items = json.load(f)
    if ids_filter:
        items = [i for i in items if i["id"] in ids_filter]
    return items


def load_previous_snapshot(competitor_id: str) -> str | None:
    """Load previous content snapshot for a competitor, if it exists."""
    path = SNAPSHOTS_DIR / f"{competitor_id}.txt"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None


def save_snapshot(competitor_id: str, content: str) -> None:
    SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    path = SNAPSHOTS_DIR / f"{competitor_id}.txt"
    path.write_text(content, encoding="utf-8")


def scrape_url(url: str, api_key: str) -> dict:
    """
    Scrape a URL with Firecrawl and return the result dict.
    Returns markdown content + metadata.
    """
    payload = json.dumps({
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": True,
        "waitFor": 1000,
    }).encode("utf-8")

    req = urllib.request.Request(
        FIRECRAWL_SCRAPE_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def extract_key_sections(content: str, monitor: list[str]) -> dict[str, str]:
    """
    Extract sections relevant to what we're monitoring (pricing, features, etc.).
    Crude but effective: look for keyword-adjacent paragraphs.
    The `monitor` list comes from the operator's competitors.json config.
    """
    sections = {}
    lines = content.split("\n")

    for keyword in monitor:
        relevant = []
        for i, line in enumerate(lines):
            if keyword.lower() in line.lower():
                # Grab surrounding context (2 lines before/after)
                start = max(0, i - 2)
                end = min(len(lines), i + 5)
                block = "\n".join(lines[start:end]).strip()
                if block:
                    relevant.append(block)
        if relevant:
            # Deduplicate and cap at 500 chars
            combined = "\n\n---\n\n".join(dict.fromkeys(relevant))
            sections[keyword] = combined[:500]

    return sections


def simple_diff(old: str, new: str) -> str | None:
    """
    Returns a simple change description if content differs, None if same.
    Compares word count and checks for key indicator phrases.
    """
    if not old:
        return "first snapshot — no previous to compare"

    old_words = set(old.lower().split())
    new_words = set(new.lower().split())

    added = new_words - old_words
    removed = old_words - new_words

    # Filter to meaningful words (>4 chars, not stop words)
    stop = {"that", "this", "with", "from", "have", "will", "your", "they", "what", "when", "where"}
    added = {w for w in added if len(w) > 4 and w not in stop}
    removed = {w for w in removed if len(w) > 4 and w not in stop}

    if not added and not removed:
        return None

    parts = []
    if added:
        sample = list(added)[:8]
        parts.append(f"New terms: {', '.join(sorted(sample))}")
    if removed:
        sample = list(removed)[:8]
        parts.append(f"Removed terms: {', '.join(sorted(sample))}")

    return " | ".join(parts) if parts else None


def run(dry_run: bool = False, ids_filter: list[str] | None = None) -> None:
    api_key = os.environ.get("FIRECRAWL_API_KEY", "")
    if not api_key and not dry_run:
        print("ERROR: FIRECRAWL_API_KEY not set in environment.")
        sys.exit(1)

    if not COMPETITORS_FILE.exists():
        example_file = CONFIG_DIR / "competitors_example.json"
        if dry_run and example_file.exists():
            print(f"[dry-run] {COMPETITORS_FILE.name} not found — falling back to competitors_example.json")
            with open(example_file) as f:
                competitors = json.load(f)
            if ids_filter:
                competitors = [c for c in competitors if c["id"] in ids_filter]
        else:
            print(f"ERROR: {COMPETITORS_FILE} not found.")
            print("  Copy config/competitors_example.json to config/competitors.json")
            print("  and add the URLs you want monitored for this engagement.")
            sys.exit(1)
    else:
        competitors = load_competitors(ids_filter)
    today = date.today().isoformat()
    results = []
    changes_detected = []

    print(f"Firecrawl competitor monitor — {today}")
    print(f"Competitors: {len(competitors)} | Dry run: {dry_run}")
    print("-" * 60)

    for comp in competitors:
        print(f"  [{comp['id']}] {comp['label']} — {comp['url']}")

        if dry_run:
            print(f"    DRY RUN — would scrape: {comp['url']}")
            results.append({
                "id": comp["id"],
                "label": comp["label"],
                "url": comp["url"],
                "date": today,
                "sections": {},
                "diff": "[dry run]",
                "changed": False,
            })
            continue

        try:
            response = scrape_url(comp["url"], api_key)
            content = response.get("data", {}).get("markdown", "")

            if not content:
                print(f"    ERROR Empty response from Firecrawl")
                results.append({
                    "id": comp["id"],
                    "label": comp["label"],
                    "url": comp["url"],
                    "date": today,
                    "sections": {},
                    "diff": "[empty response]",
                    "changed": False,
                })
                time.sleep(SLEEP_BETWEEN)
                continue

            # Extract monitored sections (the operator configures `monitor` or `watch`
            # in competitors.json — keywords like "pricing", "jobs", "features")
            monitor_keys = comp.get("monitor", comp.get("watch", []))
            sections = extract_key_sections(content, monitor_keys)

            # Diff against previous snapshot
            previous = load_previous_snapshot(comp["id"])
            diff = simple_diff(previous, content)
            changed = diff is not None and "first snapshot" not in diff

            if changed:
                changes_detected.append(f"[{comp['id']}] {comp['label']}: {diff}")
                print(f"    CHANGE DETECTED: {diff[:80]}...")
            elif diff and "first snapshot" in diff:
                print(f"    OK first snapshot saved ({len(content)} chars)")
            else:
                print(f"    OK no significant change ({len(content)} chars)")

            # Save new snapshot
            save_snapshot(comp["id"], content)

            results.append({
                "id": comp["id"],
                "label": comp["label"],
                "url": comp["url"],
                "date": today,
                "sections": sections,
                "diff": diff,
                "changed": changed,
            })

        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            print(f"    ERROR HTTP {e.code}: {body[:100]}")
            results.append({
                "id": comp["id"],
                "label": comp["label"],
                "url": comp["url"],
                "date": today,
                "sections": {},
                "diff": f"[error: HTTP {e.code}]",
                "changed": False,
            })
        except Exception as e:
            print(f"    ERROR {e}")
            results.append({
                "id": comp["id"],
                "label": comp["label"],
                "url": comp["url"],
                "date": today,
                "sections": {},
                "diff": f"[error: {e}]",
                "changed": False,
            })

        time.sleep(SLEEP_BETWEEN)

    # Save
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_file = DATA_DIR / f"firecrawl_{today}.json"
    latest_file = DATA_DIR / "firecrawl_latest.json"

    if not dry_run:
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2)
        with open(latest_file, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\nWrote {len(results)} items -> {output_file}")

    print(f"\n-- Summary --")
    print(f"  Competitors monitored : {len(results)}")
    print(f"  Changes detected      : {len(changes_detected)}")
    for c in changes_detected:
        print(f"    CHANGE {c}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Monitor competitor URLs with Firecrawl")
    parser.add_argument("--dry-run", action="store_true", help="Skip API calls")
    parser.add_argument("--id", type=str, help="Comma-separated competitor IDs to run")
    args = parser.parse_args()

    ids_filter = [i.strip() for i in args.id.split(",")] if args.id else None
    run(dry_run=args.dry_run, ids_filter=ids_filter)


if __name__ == "__main__":
    main()
