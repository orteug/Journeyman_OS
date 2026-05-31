"""
SOURCE — Reddit Community Monitor

Searches operator-configured subreddits for posts matching the engagement
domain's keyword set. Scores threads by recency, engagement, and keyword
density. Flags threads with engagement opportunity (unanswered, low-response)
for outreach prioritization by the operator.

Reddit is the T1 (operator ground truth) tier of the SOURCE pipeline.
The Researcher weights this signal highest at synthesis.

No auth required — uses Reddit's public JSON API.

Usage:
    python pull_reddit.py [--dry-run] [--subreddit one,two]

Flags:
    --dry-run       Print query targets without making API calls (no cost)
    --subreddit     Comma-separated subreddit names to limit scope

Output:
    data/reddit_YYYY-MM-DD.json  — array of scored thread objects
    data/reddit_latest.json      — copy for the digest generator

Cost: Free (Reddit public JSON API, no auth needed)
Rate limit: 1 request/second (Reddit standard — do not increase)

Configuration: config/reddit_config.json (see config/reddit_config_example.json
for the schema). The operator configures subreddits and keywords for their
specific engagement domain — the pipeline is otherwise domain-agnostic.
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import date, datetime, timezone
from pathlib import Path

CONFIG_DIR = Path(__file__).parent / "config"
DATA_DIR = Path(__file__).parent / "data"
CONFIG_FILE = CONFIG_DIR / "reddit_config.json"

USER_AGENT = "OperatorEngagementResearcher/1.0 (engagement intelligence monitor)"
REDDIT_BASE = "https://www.reddit.com"


def load_config() -> dict:
    with open(CONFIG_FILE) as f:
        return json.load(f)


def reddit_get(url: str) -> dict:
    """Single Reddit JSON API call with required User-Agent."""
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_subreddit(subreddit: str, keyword: str, limit: int = 5) -> list[dict]:
    """Search a single subreddit for a keyword. Returns raw post data list."""
    params = urllib.parse.urlencode({
        "q": keyword,
        "sort": "new",
        "limit": limit,
        "restrict_sr": 1,
        "t": "week",
    })
    url = f"{REDDIT_BASE}/r/{subreddit}/search.json?{params}"
    data = reddit_get(url)
    return [child["data"] for child in data.get("data", {}).get("children", [])]


def search_global(keyword: str, limit: int = 5) -> list[dict]:
    """Search Reddit-wide for a keyword. Returns raw post data list."""
    params = urllib.parse.urlencode({
        "q": keyword,
        "sort": "new",
        "limit": limit,
        "t": "week",
    })
    url = f"{REDDIT_BASE}/search.json?{params}"
    data = reddit_get(url)
    return [child["data"] for child in data.get("data", {}).get("children", [])]


def classify_opportunity(post: dict, age_hours: float) -> str:
    """Classify a post's engagement opportunity for outreach prioritization."""
    num_comments = post.get("num_comments", 0)
    score = post.get("score", 0)

    if num_comments == 0 and age_hours < 48:
        return "unanswered"
    if num_comments <= 2 and age_hours < 72:
        return "low_response"
    if num_comments >= 10 or score >= 50:
        return "active_discussion"
    return "general"


def score_relevance(post: dict, keywords: list[str]) -> tuple[float, list[str]]:
    """
    Score a post's relevance to the configured keyword set.
    Returns (relevance_score 0.0–1.0, matched_keywords list).
    """
    title = post.get("title", "").lower()
    body = post.get("selftext", "").lower()
    full_text = f"{title} {body}"

    matched = [kw for kw in keywords if kw.lower() in full_text]
    if not matched:
        return 0.0, []

    # Base: keyword match density (each match adds 0.25, cap at 1.0)
    base = min(len(matched) * 0.25, 1.0)

    # Boost: keyword in title is stronger signal
    title_matches = [kw for kw in matched if kw.lower() in title]
    title_boost = min(len(title_matches) * 0.15, 0.3)

    # Boost: recent + engaged
    score = post.get("score", 0)
    num_comments = post.get("num_comments", 0)
    engagement_boost = min((score / 100 + num_comments / 20) * 0.1, 0.2)

    return round(min(base + title_boost + engagement_boost, 1.0), 2), matched


def process_post(post: dict, keywords: list[str], lookback_days: int) -> dict | None:
    """
    Normalize a raw Reddit post into a scored signal object.
    Returns None if post is outside the lookback window or below relevance threshold.
    """
    created_utc = post.get("created_utc", 0)
    now_utc = datetime.now(timezone.utc).timestamp()
    age_hours = (now_utc - created_utc) / 3600
    age_days = age_hours / 24

    if age_days > lookback_days:
        return None

    relevance, matched = score_relevance(post, keywords)
    if not matched:
        return None

    return {
        "subreddit": post.get("subreddit", ""),
        "title": post.get("title", ""),
        "url": f"https://reddit.com{post.get('permalink', '')}",
        "score": post.get("score", 0),
        "num_comments": post.get("num_comments", 0),
        "created_utc": int(created_utc),
        "age_hours": round(age_hours, 1),
        "opportunity": classify_opportunity(post, age_hours),
        "keywords_matched": matched,
        "relevance_score": relevance,
    }


def deduplicate(posts: list[dict]) -> list[dict]:
    """Remove duplicate posts by URL, keeping highest relevance_score."""
    seen: dict[str, dict] = {}
    for post in posts:
        url = post["url"]
        if url not in seen or post["relevance_score"] > seen[url]["relevance_score"]:
            seen[url] = post
    return list(seen.values())


def run(dry_run: bool = False, subreddits_filter: list[str] | None = None) -> None:
    if not CONFIG_FILE.exists():
        example_file = CONFIG_DIR / "reddit_config_example.json"
        if dry_run and example_file.exists():
            print(f"[dry-run] {CONFIG_FILE.name} not found — falling back to reddit_config_example.json")
            with open(example_file) as f:
                config = json.load(f)
        else:
            print(f"ERROR: {CONFIG_FILE} not found.")
            print("  Copy config/reddit_config_example.json to config/reddit_config.json")
            print("  and configure subreddits + keywords for your engagement domain.")
            sys.exit(1)
    else:
        config = load_config()
    subreddits = subreddits_filter or config["subreddits"]
    keywords = config["keywords"]
    max_posts = config.get("max_posts_per_query", 5)
    lookback_days = config.get("lookback_days", 7)
    min_score = config.get("min_relevance_score", 0.2)
    global_keywords = config.get("global_search_keywords", [])

    today = date.today().isoformat()
    results: list[dict] = []
    query_count = 0
    error_count = 0

    print(f"Reddit monitor — {today}")
    print(f"Subreddits: {len(subreddits)} | Keywords: {len(keywords)} | Dry run: {dry_run}")
    print("-" * 60)

    if dry_run:
        print("\nDRY RUN — query targets:")
        for sub in subreddits:
            for kw in keywords[:3]:
                print(f"  r/{sub} <- \"{kw}\"")
        print(f"\n  ... {len(subreddits)} x {len(keywords)} = {len(subreddits) * len(keywords)} queries planned")
        if global_keywords:
            print(f"  + {len(global_keywords)} global-search keywords")
        print("\n[DRY RUN — no API calls made, nothing saved]")
        return

    # Per-subreddit keyword search
    for sub in subreddits:
        for kw in keywords:
            query_count += 1
            print(f"  r/{sub} <- \"{kw}\"", end="", flush=True)
            try:
                posts = search_subreddit(sub, kw, limit=max_posts)
                found = 0
                for raw in posts:
                    processed = process_post(raw, keywords, lookback_days)
                    if processed and processed["relevance_score"] >= min_score:
                        results.append(processed)
                        found += 1
                print(f" -> {found} hits")
            except urllib.error.HTTPError as e:
                error_count += 1
                print(f" ERROR HTTP {e.code}")
            except Exception as e:
                error_count += 1
                print(f" ERROR {e}")

            time.sleep(1)  # Reddit rate limit: 1 req/sec

    # Global search for highest-signal keywords (operator-configured in
    # reddit_config.json under "global_search_keywords")
    if global_keywords:
        print(f"\n  [global] high-signal keywords ({len(global_keywords)} terms)")
        for kw in global_keywords:
            query_count += 1
            print(f"  [global] <- \"{kw}\"", end="", flush=True)
            try:
                posts = search_global(kw, limit=max_posts)
                found = 0
                for raw in posts:
                    processed = process_post(raw, keywords, lookback_days)
                    if processed and processed["relevance_score"] >= min_score:
                        results.append(processed)
                        found += 1
                print(f" -> {found} hits")
            except urllib.error.HTTPError as e:
                error_count += 1
                print(f" ERROR HTTP {e.code}")
            except Exception as e:
                error_count += 1
                print(f" ERROR {e}")
            time.sleep(1)

    # Deduplicate and sort by relevance then recency
    results = deduplicate(results)
    results.sort(key=lambda p: (p["relevance_score"], -p["age_hours"]), reverse=True)

    # Summary stats
    unanswered = [r for r in results if r["opportunity"] == "unanswered"]
    low_response = [r for r in results if r["opportunity"] == "low_response"]
    active = [r for r in results if r["opportunity"] == "active_discussion"]

    # Save
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    output_file = DATA_DIR / f"reddit_{today}.json"
    latest_file = DATA_DIR / "reddit_latest.json"

    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    with open(latest_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nWrote {len(results)} posts -> {output_file}")
    print(f"  Latest -> {latest_file}")

    print(f"\n-- Summary --")
    print(f"  Queries run     : {query_count}")
    print(f"  Errors          : {error_count}")
    print(f"  Total posts     : {len(results)}")
    print(f"  Unanswered      : {len(unanswered)}  <- highest outreach priority")
    print(f"  Low response    : {len(low_response)}")
    print(f"  Active thread   : {len(active)}")

    if unanswered:
        print(f"\n-- Top unanswered threads --")
        for p in unanswered[:3]:
            print(f"  r/{p['subreddit']}: {p['title'][:70]}")
            print(f"    {p['url']}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Monitor Reddit for engagement-domain ground signal")
    parser.add_argument("--dry-run", action="store_true", help="Print targets without API calls")
    parser.add_argument("--subreddit", type=str, help="Comma-separated subreddit names to limit scope")
    args = parser.parse_args()

    subreddits_filter = [s.strip() for s in args.subreddit.split(",")] if args.subreddit else None
    run(dry_run=args.dry_run, subreddits_filter=subreddits_filter)


if __name__ == "__main__":
    main()
