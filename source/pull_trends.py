"""
SOURCE — Google Trends Puller

Pulls 90-day interest trajectory for each item in the engagement watchlist
using pytrends. This is the T3 (market structure) tier of the SOURCE pipeline.

Trends gives directional signal — growing, stable, declining — over a 90-day
window. The Researcher uses this to confirm or challenge T1/T2 ground signal:
operators may complain about something declining in trend, or growth signal
may appear without matching operator demand.

Usage:
    .venv/bin/python pull_trends.py [--dry-run] [--id 01,03]

Note: requires pytrends, which is the one non-stdlib dependency in this
pipeline. Install in a venv:

    python3 -m venv .venv
    .venv/bin/pip install pytrends

Then call this script via .venv/bin/python (run_pipeline.py does this
automatically when invoking the Trends step).

Output:
    data/trends_YYYY-MM-DD.json   — array of trend result objects
    data/trends_latest.json       — copy for the digest generator

Cost: Free (Google Trends has no paid API; pytrends scrapes the public site).

Important: Google Trends returns *relative* interest (0–100), not absolute
volume. This is a direction signal (growing / stable / declining), not a
volume gate. Combine with Reddit + Perplexity for full intelligence.

Rate limiting: pytrends respects Google's limits. 1 request per 5 seconds.
"""

import argparse
import json
import time
from datetime import date
from pathlib import Path

CONFIG_DIR = Path(__file__).parent / "config"
DATA_DIR = Path(__file__).parent / "data"
WATCHLIST_FILE = CONFIG_DIR / "watchlist.json"

SLEEP_BETWEEN = 5  # seconds between requests


def load_watchlist(ids_filter: list[str] | None = None) -> list[dict]:
    with open(WATCHLIST_FILE) as f:
        items = json.load(f)
    if ids_filter:
        items = [i for i in items if i["id"] in ids_filter]
    return items


def build_search_term(item: dict) -> str:
    """
    Derive a clean Google Trends search term from a watchlist label.
    Strips common suffixes that hurt trend-match accuracy.
    Operators can also provide an explicit `trends_term` field in their
    watchlist item to override the derived term.
    """
    if item.get("trends_term"):
        return item["trends_term"]
    label = item["label"]
    for suffix in [" Directory", " Tool", " Platform", " SaaS", " Software"]:
        label = label.replace(suffix, "")
    return label.strip()


def classify_trajectory(values: list[int]) -> dict:
    if not values or len(values) < 6:
        return {"direction": "insufficient_data", "pct_change": None, "peak": None, "avg": None}

    third = max(len(values) // 3, 1)
    early_avg = sum(values[:third]) / third
    recent_avg = sum(values[-third:]) / third
    overall_avg = sum(values) / len(values)
    peak = max(values)

    if early_avg == 0:
        pct_change = None
        direction = "stable"
    else:
        pct_change = round((recent_avg - early_avg) / early_avg * 100, 1)
        if pct_change >= 20:
            direction = "growing"
        elif pct_change <= -20:
            direction = "declining"
        else:
            direction = "stable"

    return {
        "direction": direction,
        "pct_change": pct_change,
        "peak": peak,
        "avg": round(overall_avg, 1),
    }


def run(dry_run: bool = False, ids_filter: list[str] | None = None) -> None:
    if not WATCHLIST_FILE.exists():
        example_file = CONFIG_DIR / "watchlist_example.json"
        if dry_run and example_file.exists():
            print(f"[dry-run] {WATCHLIST_FILE.name} not found — falling back to watchlist_example.json")
            with open(example_file) as f:
                items = json.load(f)
            if ids_filter:
                items = [i for i in items if i["id"] in ids_filter]
        else:
            print(f"ERROR: {WATCHLIST_FILE} not found.")
            print("  Copy config/watchlist_example.json to config/watchlist.json first.")
            return
    else:
        items = load_watchlist(ids_filter)
    today = date.today().isoformat()
    results = []
    flagged = []

    # Defer pytrends import so --dry-run works without the dependency installed
    if not dry_run:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl="en-US", tz=360)
    else:
        pytrends = None

    print(f"Google Trends puller — {today}")
    print(f"Items: {len(items)} | Geo: US | Window: 90 days | Dry run: {dry_run}")
    print("-" * 60)

    for item in items:
        term = build_search_term(item)
        print(f"  [{item['id']}] {term}")

        if dry_run:
            print(f"    DRY RUN — would query: {term!r}")
            results.append({
                "id": item["id"],
                "label": item["label"],
                "search_term": term,
                "date": today,
                "values": [],
                "trajectory": {"direction": "dry_run"},
            })
            continue

        try:
            pytrends.build_payload([term], cat=0, timeframe="today 3-m", geo="US")
            df = pytrends.interest_over_time()

            if df.empty or term not in df.columns:
                raise ValueError("Empty response")

            values = [int(v) for v in df[term].tolist()]
            trajectory = classify_trajectory(values)

            print(
                f"    OK {trajectory['direction'].upper()} | "
                f"pct_change: {trajectory['pct_change']}% | "
                f"peak: {trajectory['peak']} | avg: {trajectory['avg']}"
            )

            if trajectory["direction"] == "growing" and (trajectory["pct_change"] or 0) >= 20:
                flagged.append(f"[{item['id']}] {item['label']} — +{trajectory['pct_change']}%")

            results.append({
                "id": item["id"],
                "label": item["label"],
                "search_term": term,
                "date": today,
                "values": values,
                "trajectory": trajectory,
            })

        except Exception as e:
            print(f"    ERROR: {e}")
            results.append({
                "id": item["id"],
                "label": item["label"],
                "search_term": term,
                "date": today,
                "values": [],
                "trajectory": {"direction": "error"},
            })

        time.sleep(SLEEP_BETWEEN)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_file = DATA_DIR / f"trends_{today}.json"
    latest_file = DATA_DIR / "trends_latest.json"

    if not dry_run:
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2)
        with open(latest_file, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\nWrote {len(results)} items -> {output_file}")

    print(f"\n-- Summary --")
    print(f"  Items processed : {len(results)}")
    if flagged:
        print(f"  Growing (>20%)  : {len(flagged)}")
        for f_item in flagged:
            print(f"    GROWING {f_item}")
    else:
        print(f"  Growing (>20%)  : 0")


def main() -> None:
    parser = argparse.ArgumentParser(description="Pull Google Trends data for the engagement watchlist")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--id", type=str, help="Comma-separated watchlist IDs to run")
    args = parser.parse_args()

    ids_filter = [i.strip().zfill(2) for i in args.id.split(",")] if args.id else None
    run(dry_run=args.dry_run, ids_filter=ids_filter)


if __name__ == "__main__":
    main()
