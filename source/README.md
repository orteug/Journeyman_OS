# SOURCE — Engagement Intelligence Pipeline

This is Stage 1 of the three-stage flywheel:

```
SOURCE (collect)  ->  FILTER (The Researcher)  ->  DEVELOP (Praeceptor)
```

SOURCE is a live Python pipeline that pulls market signals for the operator's
engagement domain from four sources, then asks an LLM to synthesize them into
a digest. The Researcher reads that digest at session start as upstream signal.

The pipeline is stdlib-only except for one optional dependency (`pytrends` for
Google Trends). It runs in a single command and writes a Markdown digest to
disk. No infrastructure required.

---

## What it does

| Step | Source | Tier | Cost | Cadence |
|------|--------|------|------|---------|
| 1. `pull_perplexity.py` | Perplexity Sonar | T4 (synthesized) | ~$0.30/run | configurable |
| 2. `pull_reddit.py` | Reddit public JSON API | T1 (operator ground truth) | Free | configurable |
| 3. `pull_trends.py` | Google Trends via pytrends | T3 (market structure) | Free | configurable |
| 4. `pull_firecrawl.py` | Firecrawl scrape API | T2 (competitive signal) | ~5 credits/run | configurable |
| 5. `generate_digest.py` | Anthropic claude-haiku | LLM synthesis | ~$0.05/run | per pipeline run |

Total cost per full run with the default 20-item watchlist: **~$0.35**.

The Researcher weights signals at synthesis: T1 > T2 > T3 > T4. T4 alone is
never sufficient for an ACT NOW recommendation.

---

## Prerequisites

- Python 3.9 or newer
- `pip` for installing the one optional dependency (`pytrends`)
- API keys for Perplexity, Anthropic, Firecrawl (see Setup step 2)

You can run the pipeline **without any keys** using `--dry-run`. That mode
prints what would happen and exits with no API calls. Judges with no keys
should start there.

---

## Setup

### 1. Copy the env template

```bash
cp .env.example .env
```

Open `.env` and add your keys. The file is `.gitignore`'d at the repo root
— never commit it.

### 2. Get the keys

- **Perplexity:** https://www.perplexity.ai/settings/api (Sonar tier)
- **Anthropic:** https://console.anthropic.com/settings/keys
- **Firecrawl:** https://www.firecrawl.dev/app/api-keys

### 3. Configure for your engagement domain

Three config files drive the pipeline. Each ships with a `_example.json`
template showing the schema.

```bash
cp config/watchlist_example.json config/watchlist.json
cp config/competitors_example.json config/competitors.json
cp config/reddit_config_example.json config/reddit_config.json
```

Then edit each to match the engagement domain you're entering.

**`watchlist.json`** — the engagement-domain questions you want Perplexity to
answer each run. One entry per question topic. The example uses mid-market
HVAC operators in the Southeast US. Replace with whatever domain your
engagement is in.

Each watchlist item has three query types:
- `gap` — what's broken or missing in this market?
- `competition` — what are the dominant players doing right now?
- `demand` — what are operators actively asking about in their communities?

**`competitors.json`** — the URLs you want monitored for changes. Pricing
pages, job postings, blog/changelog endpoints. Each entry specifies which
keywords to watch within the page (e.g., `["pricing", "tier", "jobs"]`).

**`reddit_config.json`** — the subreddits and keywords for the T1 community
monitor. The example uses HVAC subreddits. Replace with subreddits and trade
communities relevant to your engagement domain.

### 4. (Optional) Set up the Trends venv

`pull_trends.py` is the only step that uses an external dependency. Set up
a venv so `run_pipeline.py` can call it without polluting the rest of your
environment.

```bash
python3 -m venv .venv
.venv/bin/pip install pytrends
```

If you skip this step, run the pipeline with `--skip-trends`.

---

## Running it

### Full run (with API calls)

```bash
python3 run_pipeline.py --skip-send
```

Expected output: each step logs its progress, then the digest writes to
`digests/digest_latest.md`. The full run takes 5–10 minutes (rate limits
on Reddit and Trends are the main throttle).

### Dry run (no cost, no keys required)

```bash
python3 run_pipeline.py --dry-run
```

This prints what every step would do and exits without calling any API.
Useful for judges, smoke tests, and verifying configuration before spending
a single credit.

### Skip the Trends step

```bash
python3 run_pipeline.py --skip-trends
```

Skip Google Trends if pytrends isn't installed or you're getting rate-limited.

### Run a single step in isolation

```bash
python3 pull_perplexity.py --dry-run
python3 pull_reddit.py --dry-run --subreddit HVAC,smallbusiness
python3 pull_firecrawl.py --dry-run --id c01
python3 generate_digest.py --dry-run
```

Every script accepts `--dry-run` and runs independently. The digest
generator uses whatever data files exist — partial runs still produce a
useful digest.

---

## What the output looks like

`digests/digest_latest.md` is a Markdown file with five sections:

```
-- ENGAGEMENT INTELLIGENCE DIGEST — YYYY-MM-DD --

## ACT NOW
[Strong signals worth integrating into the engagement plan immediately.]

## WATCH
[Emerging signals — not urgent but context-building.]

## COMPETITIVE
[Competitor moves the client may not be tracking.]

## COMMUNITY SIGNALS
[Operator-community threads worth reading. T1 source tier.]

-- GAPS --
[What this digest did not find. Where to seek stronger signal.]
```

Every item is tagged with a source tier (T1–T4). ACT NOW items require at
least one T1 or T2 corroboration — the digest generator will refuse to
elevate a T4-only signal to ACT NOW. If your watchlist only produced T4
data, the digest will say so in the Gaps section rather than fabricating
confidence.

---

## How this feeds The Researcher

The Researcher (Stage 2) reads `digests/digest_latest.md` at session start.
If the file exists and contains fresh signal, The Researcher summarizes it
for the operator before intake begins. If the file is missing or stale,
The Researcher runs intake without upstream signal and pulls from
operator-direct sources during research.

You can run SOURCE every week, every engagement-start, or every time
execution surfaces a gap. The Researcher works either way. The pipeline
is opinionated about format — what writes to `digest_latest.md` is what
The Researcher reads.

---

## Costs (recap)

| Watchlist size | Cost per full run | Cadence | Monthly cost |
|----------------|-------------------|---------|--------------|
| 5 items | ~$0.10 | weekly | ~$0.40 |
| 20 items (default) | ~$0.35 | weekly | ~$1.40 |
| 50 items | ~$0.85 | weekly | ~$3.40 |

Firecrawl credits are tracked separately. 5 competitor URLs = ~5 credits
per run. Trends and Reddit are free.

---

## Troubleshooting

- **`PERPLEXITY_API_KEY not set`** — `.env` is missing or not in this directory.
- **`pytrends` not found** — run the venv setup in Setup step 4, or use `--skip-trends`.
- **Reddit `HTTP 429`** — rate limited. Reddit's public API allows 1 request/second; the script respects this but parallel runs will trip it. Wait 60 seconds and retry.
- **Empty digest** — every signal source returned errors or empty data. Check `data/` for the raw files — the digest reflects what was collected.

---

*SOURCE collects. The Researcher filters. The operator executes.*
