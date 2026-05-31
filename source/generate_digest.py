"""
SOURCE — Digest Generator

Combines Perplexity, Reddit, Google Trends, and Firecrawl signals collected
this run, then asks an LLM to score each watchlist item and produce the
engagement intelligence digest in the Act Now / Watch / Competitive /
Community Signals format.

This is the final step of Stage 1 (SOURCE). The Researcher (Stage 2 / FILTER)
reads digest_latest.md at session start as upstream signal before intake.

Usage:
    python3 generate_digest.py [--dry-run] [--date YYYY-MM-DD]

Flags:
    --dry-run    Print what would be sent to the LLM, don't call the API.
                 Judges with no API keys should use this — it shows the
                 context-building structure without spending money.
    --date       Use data files from a specific date (default: today)

Output:
    digests/digest_YYYY-MM-DD.md   — formatted engagement digest (Markdown)
    digests/digest_latest.md       — copy The Researcher reads automatically

LLM: Anthropic claude-haiku-4-5 (fast, cheap — ~$0.05 per digest run).
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import date
from pathlib import Path

from load_env import load_env
load_env()

DATA_DIR = Path(__file__).parent / "data"
DIGESTS_DIR = Path(__file__).parent / "digests"

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 4096

SCORING_SYSTEM_PROMPT = """You are an engagement intelligence analyst for an operator entering a new client engagement.

Your job is to evaluate market signals against the operator's engagement domain and produce a concise intelligence digest.

The operator's context:
- Entering a new engagement in a specific domain (configured in watchlist.json)
- Needs to understand: market dynamics, competitor moves, operator ground truth, regulatory environment
- Time horizon: first 30 days of engagement — rapid intelligence, not long-term research

Evaluation framework for each watchlist item:
1. Ground truth: Is there real signal from operators in this space (forums, communities, trade groups)?
2. Competitive signal: What are competitors doing that the client isn't tracking?
3. Market structure: What does the broader market data confirm or challenge?
4. Engagement relevance: How directly does this affect the operator's Day 1–30 priorities?
5. Source credibility: T1 (operator ground truth) > T2 (competitive signal) > T3 (market structure) > T4 (synthesized)

Classify each item as:
- ACT NOW: Strong, relevant signal the operator should integrate into their engagement plan immediately
- WATCH: Emerging signal worth tracking — not urgent but context-building
- COMPETITIVE: Moves in the engagement domain the client may not be watching

Format the digest as:
## ACT NOW
[3–5 items max. Specific. Cited. Each item: signal, source tier, why it matters for this engagement.]

## WATCH
[3–5 items max.]

## COMPETITIVE
[1–3 items. Competitor moves with direct relevance to the client's position.]

## COMMUNITY SIGNALS
[Reddit/forum threads worth reading. T1 source tier. Engagement opportunity if unanswered.]

Be specific. Every claim needs a signal basis. If data is thin on an item, say so.
Do not pad. Thin signal is better acknowledged than fabricated."""


def load_json(path: Path) -> list | None:
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


def build_signal_context(target_date: str) -> str:
    """Build the combined signal context string to send to the LLM."""
    perplexity = load_json(DATA_DIR / f"perplexity_{target_date}.json")
    trends = load_json(DATA_DIR / "trends_latest.json")
    firecrawl = load_json(DATA_DIR / "firecrawl_latest.json")
    reddit = load_json(DATA_DIR / "reddit_latest.json")

    if not perplexity:
        perplexity = load_json(DATA_DIR / "perplexity_latest.json")

    lines = [f"# Signal Data — Engagement intelligence run, {target_date}\n"]

    # Perplexity signals (T4 — context only)
    if perplexity:
        lines.append("## PERPLEXITY SIGNALS (T4 — context only)\n")
        for item in perplexity:
            lines.append(f"### [{item['id']}] {item['label']}")
            lines.append(f"Shape: {item.get('shape', '?')} | Duration: {item.get('duration', '?')}")
            for query_type, qdata in item.get("queries", {}).items():
                answer = qdata.get("answer", "")
                if answer and "[error" not in answer and "[dry run" not in answer:
                    lines.append(f"\n**{query_type.upper()}:** {answer}")
            lines.append("")
    else:
        lines.append("## PERPLEXITY SIGNALS\n[No data available — run pull_perplexity.py first]\n")

    # Google Trends (T3 — market structure)
    if trends:
        lines.append("## GOOGLE TRENDS (T3 — 90-day trajectory)\n")
        growing = [t for t in trends if t.get("trajectory", {}).get("direction") == "growing"]
        stable = [t for t in trends if t.get("trajectory", {}).get("direction") == "stable"]
        declining = [t for t in trends if t.get("trajectory", {}).get("direction") == "declining"]
        no_data = [t for t in trends if t.get("trajectory", {}).get("direction") in ("error", "insufficient_data", "dry_run", None)]

        if growing:
            lines.append("**GROWING (>20%):**")
            for t in growing:
                pct = t.get("trajectory", {}).get("pct_change")
                lines.append(f"  - [{t['id']}] {t['label']}: +{pct}% | peak: {t['trajectory'].get('peak')}")
        if stable:
            lines.append("**STABLE:**")
            for t in stable:
                lines.append(f"  - [{t['id']}] {t['label']}: stable | avg: {t['trajectory'].get('avg')}")
        if declining:
            lines.append("**DECLINING:**")
            for t in declining:
                lines.append(f"  - [{t['id']}] {t['label']}: declining")
        if no_data:
            lines.append("**NO DATA:**")
            for t in no_data:
                lines.append(f"  - [{t['id']}] {t['label']}")
        lines.append("")
    else:
        lines.append("## GOOGLE TRENDS\n[No data available — run pull_trends.py first]\n")

    # Firecrawl competitor changes (T2 — competitive signal)
    if firecrawl:
        lines.append("## COMPETITOR MONITORING (T2 — competitive signal)\n")
        changed = [f for f in firecrawl if f.get("changed")]
        unchanged = [f for f in firecrawl if not f.get("changed")]

        if changed:
            lines.append("**CHANGES DETECTED:**")
            for f in changed:
                lines.append(f"  - [{f['id']}] {f['label']}: {f.get('diff', '')}")
                for monitor_key, section_text in f.get("sections", {}).items():
                    lines.append(f"    [{monitor_key}]: {section_text[:200]}")
        if unchanged:
            lines.append("**NO CHANGES:**")
            for f in unchanged:
                lines.append(f"  - [{f['id']}] {f['label']}")
        lines.append("")
    else:
        lines.append("## COMPETITOR MONITORING\n[No data available — run pull_firecrawl.py first]\n")

    # Reddit community signals (T1 — operator ground truth)
    if reddit:
        lines.append("## COMMUNITY SIGNALS (T1 — operator ground truth, Reddit)\n")
        unanswered = [r for r in reddit if r.get("opportunity") == "unanswered"]
        low_response = [r for r in reddit if r.get("opportunity") == "low_response"]
        active = [r for r in reddit if r.get("opportunity") == "active_discussion"]

        if unanswered:
            lines.append("**UNANSWERED (engagement opportunity):**")
            for r in unanswered[:5]:
                age = r.get("age_hours", 0)
                lines.append(
                    f"  - r/{r['subreddit']} ({age:.0f}h ago, 0 replies): {r['title'][:90]}"
                )
                lines.append(f"    Keywords: {', '.join(r.get('keywords_matched', []))}")
                lines.append(f"    {r['url']}")

        if low_response:
            lines.append("**LOW RESPONSE (<3 replies):**")
            for r in low_response[:4]:
                lines.append(
                    f"  - r/{r['subreddit']} ({r.get('num_comments', 0)} replies): {r['title'][:90]}"
                )
                lines.append(f"    {r['url']}")

        if active:
            lines.append("**ACTIVE DISCUSSIONS (demand signal):**")
            for r in active[:3]:
                lines.append(
                    f"  - r/{r['subreddit']} ({r.get('num_comments', 0)} comments, "
                    f"{r.get('score', 0)} upvotes): {r['title'][:80]}"
                )
                lines.append(f"    {r['url']}")

        if not (unanswered or low_response or active):
            lines.append("[No matching threads this run]\n")

        lines.append("")
    else:
        lines.append("## COMMUNITY SIGNALS\n[No data available — run pull_reddit.py first]\n")

    return "\n".join(lines)


def call_anthropic(context: str, api_key: str) -> str:
    """Call Anthropic API to generate the digest."""
    user_message = f"""{context}

---

Based on the signal data above, produce the engagement intelligence digest in this exact format:

```
-- ENGAGEMENT INTELLIGENCE DIGEST — {date.today().strftime("%Y-%m-%d")} --
[X] watchlist items scanned | [X] signals processed | [X] alerts fired

## ACT NOW
Strong, relevant signal the operator should integrate into their engagement plan immediately.

1. [Signal headline]
   Source tier: [T1 / T2 / T3 / T4]
   Signal: [what was observed — specific, cited]
   Why it matters for this engagement: [direct relevance to Day 1–30]
   Next step: [specific action — one sentence]

## WATCH
Emerging signal worth tracking — not urgent but context-building.

1. [Signal headline]
   Source tier: [T1 / T2 / T3 / T4]
   Pattern: [what's been observed, over what window]
   Status: Watch — [condition that would move it to Act Now]

## COMPETITIVE
Moves in the engagement domain the client may not be watching.

1. [Competitor / Market shift]
   Change: [what moved]
   Implication: [what it means for the client's position]

## COMMUNITY SIGNALS
Real operators asking real questions this week. Engagement opportunities.

1. [Thread title — subreddit]
   Question: [what they're asking]
   Opportunity: [Unanswered / Low-response — worth engaging]
   Link: [URL]

-- GAPS --
What this digest did not find. Where stronger signal should be sought before
the operator builds further conviction.

----------------------------------------------------
Next digest cadence: operator-configured | Watchlist: config/watchlist.json
```

Rules:
- ACT NOW: max 5 items. Only include items where signal is clear and directly relevant to the engagement domain.
- WATCH: max 5 items. Promising signals that need one more data point.
- COMPETITIVE: max 3 items. Focus on pricing changes, hiring shifts, positioning moves.
- COMMUNITY SIGNALS: max 5 items. Prioritize unanswered threads first, then low-response.
- GAPS section is mandatory. Name what data is thin and where to find ground signal.
- Be specific. Cite the source tier for every item. Include numbers (% changes, prices, dates) where the data supports it.
- If signal data is thin for an item, skip it — don't include it with fabricated detail.
- Never synthesize an ACT NOW recommendation from T4 sources alone. Require at least one T1/T2 corroboration or flag the gap.
"""

    payload = json.dumps({
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "system": SCORING_SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_message}],
    }).encode("utf-8")

    req = urllib.request.Request(
        ANTHROPIC_API_URL,
        data=payload,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["content"][0]["text"]


def run(dry_run: bool = False, target_date: str | None = None) -> None:
    if not target_date:
        target_date = date.today().isoformat()

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key and not dry_run:
        print("ERROR: ANTHROPIC_API_KEY not set in environment.")
        sys.exit(1)

    print(f"Digest generator — {target_date}")
    print(f"Model: {MODEL} | Dry run: {dry_run}")
    print("-" * 60)

    context = build_signal_context(target_date)

    print(f"Signal context built: {len(context)} chars")

    if dry_run:
        print("\n-- CONTEXT PREVIEW (first 1000 chars) --")
        print(context[:1000])
        print("\n[DRY RUN — LLM call skipped]")
        print("In a real run the digest would write to digests/digest_latest.md")
        print("and The Researcher would read it at the next session start.")
        return

    print("Calling LLM...")
    try:
        digest = call_anthropic(context, api_key)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"ERROR HTTP {e.code}: {body[:200]}")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR {e}")
        sys.exit(1)

    # Strip code fences if LLM wrapped output
    if digest.strip().startswith("```"):
        lines = digest.strip().split("\n")
        digest = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    # Save
    DIGESTS_DIR.mkdir(parents=True, exist_ok=True)
    output_file = DIGESTS_DIR / f"digest_{target_date}.md"
    latest_file = DIGESTS_DIR / "digest_latest.md"

    with open(output_file, "w") as f:
        f.write(digest)
    with open(latest_file, "w") as f:
        f.write(digest)

    print(f"Digest written -> {output_file}")
    print(f"  Latest -> {latest_file}")
    print(f"\n-- Digest preview (first 20 lines) --")
    for line in digest.split("\n")[:20]:
        print(line)
    print("\nThe Researcher will read digest_latest.md at the next session start.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the engagement intelligence digest")
    parser.add_argument("--dry-run", action="store_true", help="Skip LLM call")
    parser.add_argument("--date", type=str, help="Use data from this date (YYYY-MM-DD)")
    args = parser.parse_args()

    run(dry_run=args.dry_run, target_date=args.date)


if __name__ == "__main__":
    main()
