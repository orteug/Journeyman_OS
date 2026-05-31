# SERVICES & API KEYS
## The Researcher — Operator Engagement Intelligence Layer
**Audited:** 2026-05-29 · **Source:** Source pipeline (`pull_*.py`, `generate_digest.py`, `run_pipeline.py`)

---

## How to Use This Document

This file is the complete checklist for anyone running The Researcher's source pipeline locally. Every external service and API used in the live reference implementation is listed here — read from actual code, not guessed.

- Required services run the live signal pipeline.
- Research tooling services extend research capability (optional).
- Delivery services email the digest to you.

**No real keys appear in this file.** Variable names and obtain URLs only.

If you only want to try the ICM folder (Claude Projects or ChatGPT Projects path), you can skip this file entirely — no external services required.

---

## Required Services — Core Pipeline

| Service | Used for | API Key | Free Tier | Obtain Key |
|---------|----------|---------|-----------|-----------|
| **Perplexity Sonar API** | Market signal queries (gap / competition / demand) per watchlist item | Yes | $5 free credit on signup | https://www.perplexity.ai/settings/api |
| **Anthropic API** | Digest generation via `claude-haiku-4-5` — scores and classifies signals | Yes | $5 free credit on signup | https://console.anthropic.com/settings/keys |
| **Firecrawl API** | Competitor URL monitoring (scraping pricing pages, changelogs) | Yes | 500 credits/month free | https://www.firecrawl.dev/app/api-keys |
| **Google Trends (pytrends)** | 90-day search trajectory per watchlist item | No (no key) | Free — rate-limited (1 call / 5 seconds) | No signup. `pip install pytrends` |
| **Reddit (public read)** | Community signal — subreddit threads, keyword tracking | No (no key) | Free — public endpoints | No signup. Direct HTTP. |

---

## Required Services — Delivery

| Service | Used for | API Key | Free Tier | Obtain Key |
|---------|----------|---------|-----------|-----------|
| **Resend** | Weekly digest email delivery | Yes | 3,000 emails/month free, 100/day | https://resend.com/api-keys |

Sender address must be a domain verified in Resend. The reference implementation sends from `listings@castructuralengineer.com`. Swap to your own verified sender before running.

---

## Research Tooling — Optional Extensions

These are not required for the pipeline. They extend research capability when invoked by The Researcher inside an engagement.

| Service | Used for | API Key | Free Tier | Obtain Key |
|---------|----------|---------|-----------|-----------|
| **YouTube Skill (yt-dlp)** | Downloads video transcripts when a video source is surfaced during research | No (no key — uses yt-dlp library) | Free | No signup. `pip install yt-dlp` |
| **NotebookLM** | Multi-source synthesis when 3+ documents have been gathered | No (Google account only) | Free | https://notebooklm.google.com |

---

## Setup Order

```
1. Anthropic API key — required first. Digest generation, ICM execution, and any Claude-API web demo all depend on it.
   Get key: https://console.anthropic.com/settings/keys
   Add to: .env as ANTHROPIC_API_KEY

2. Perplexity API key — required for market signal pulls.
   Get key: https://www.perplexity.ai/settings/api
   Add to: .env as PERPLEXITY_API_KEY

3. Firecrawl API key — required for competitor URL monitoring.
   Get key: https://www.firecrawl.dev/app/api-keys
   Add to: .env as FIRECRAWL_API_KEY

4. Resend API key — required for email digest delivery.
   Get key: https://resend.com/api-keys
   Verify your sender domain inside Resend before first send.
   Add to: .env as RESEND_API_KEY

5. Optional: yt-dlp — install if you want The Researcher to pull YouTube transcripts.
   pip install yt-dlp

6. Optional: NotebookLM — log in with a Google account when you have 3+ sources to synthesize.
   notebooklm.google.com
```

---

## Environment Variables Template

```bash
# Core pipeline
PERPLEXITY_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
FIRECRAWL_API_KEY=your_key_here

# Delivery
RESEND_API_KEY=your_key_here
RESEND_FROM_EMAIL=your_verified_sender@your-domain.com
RESEND_TO_EMAIL=where_you_want_the_digest@example.com

# Research tooling — no env vars required (yt-dlp is a CLI tool; NotebookLM uses a Google account)
```

---

## Cost Estimates (Monthly)

Based on the reference implementation: weekly cadence, 20-item watchlist, 5 competitor URLs.

| Service | Per run | Per month (4 runs) | Notes |
|---------|---------|--------------------|-------|
| Perplexity Sonar | ~$0.30 | ~$1.20 | 20 items × 3 queries each |
| Anthropic (claude-haiku-4-5) | ~$0.05 | ~$0.20 | Single digest generation call |
| Firecrawl | ~5 credits | ~20 credits | Well inside free tier |
| Google Trends | $0.00 | $0.00 | Free, rate-limited |
| Reddit | $0.00 | $0.00 | Free, public endpoints |
| Resend | $0.00 | $0.00 | Inside free tier (1 email/week) |
| **Total** | **~$0.35** | **~$1.40** | Solo operator cadence |

---

## Free Tier Limits — Know Before You Run

| Service | Limit | What happens when exceeded |
|---------|-------|---------------------------|
| Perplexity | $5 free credit on signup | API returns 402 — top up account or wait for next month |
| Anthropic | $5 free credit on signup | API returns 402 — top up account |
| Firecrawl | 500 credits / month | API returns 429 — scraping pauses until reset |
| Google Trends | 1 call / 5 seconds soft limit | Library throws TooManyRequestsError — pipeline sleeps and retries |
| Resend | 3,000 emails / month, 100 / day | 429 returned — pipeline keeps the digest file, retries delivery later |

For a solo operator running weekly cadence, none of these limits are hit in practice.

---

## Notes for Judges

**Zero-key path:** The ICM folders (`claude-code/`, `claude-projects/`, `codex/`, `chatgpt-projects/`) require none of these keys. Drop any folder into your platform of choice — Claude Code, Claude Projects, Codex, or ChatGPT Projects — and The Researcher runs entirely inside that environment. Intake, research, brief delivery, and auto-write all work with no external services.

**Pipeline keys are SOURCE-only:** The Perplexity, Firecrawl, and Resend keys are only needed if you want to run `run_pipeline.py` (the Stage 1 signal pipeline). To see the pipeline structure without any API calls, run `--dry-run`. All other functionality is independent of these keys.

**If a service is absent:** The pipeline degrades gracefully — that source returns empty and the digest notes the missing layer instead of failing. You can run with Perplexity only (`--skip-send` skips Firecrawl and Resend) and still get a valid digest.

All API keys live in your local `.env`. Nothing is hardcoded in the pipeline scripts.

---

*Audit complete. All services documented from actual repo files.*
*Reference in: JUDGE_GUIDE.md · QUICK-START.md · WRITEUP.md · README.md*
