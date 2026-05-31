# Source Infrastructure
## Reference Implementation — Operator Signal Pipeline

<infrastructure>

This file documents a live signal pipeline that feeds The Researcher with weekly market intelligence. It is included here as a **reference implementation** — not as a dependency. Any operator can adopt this architecture, swap providers, or run a subset.

The methodology is portable. The pipeline below is one concrete deployment of it.

---

## Pipeline Orchestration

```
run_pipeline.py
  ├── pull_perplexity.py  → data/perplexity_YYYY-MM-DD.json
  ├── pull_reddit.py      → data/reddit_YYYY-MM-DD.json
  ├── pull_trends.py      → data/trends_YYYY-MM-DD.json
  ├── pull_firecrawl.py   → data/firecrawl_YYYY-MM-DD.json
  └── generate_digest.py  → digests/digest_latest.md
```

Each script is independently runnable. Each writes its own dated JSON. The digest generator reads `_latest.json` pointers so a partial run still produces a complete-form digest with explicit gaps.

## Sources and Tier Mapping

| Pipeline source | Endpoint | Tier (at synthesis) | What it captures |
|-----------------|----------|---------------------|------------------|
| Perplexity Sonar | `https://api.perplexity.ai/chat/completions` (`sonar` model) | T4 | Synthesized market answers — gap, competition, demand queries per watchlist item |
| Reddit (public read) | Direct HTTP to subreddit JSON | T1 | Community signal — unanswered threads, low-response posts, real practitioner complaints |
| Google Trends (pytrends) | Library wrapping Google Trends | T3 | 90-day trajectory per watchlist label |
| Firecrawl | `https://api.firecrawl.dev/v0/scrape` | T2 | Competitor pricing pages, changelogs, job postings |

## Scoring (the LLM layer)

`generate_digest.py` uses Anthropic's `claude-haiku-4-5` to score every watchlist item against five engagement-focused criteria:

1. Ground truth — real signal from operators in this space (forums, communities, trade groups)
2. Competitive signal — what competitors are doing that the client isn't tracking
3. Market structure — what broader market data confirms or challenges
4. Engagement relevance — how directly this affects the operator's Day 1–30 priorities
5. Source credibility — T1 (operator ground truth) > T2 (competitive) > T3 (market structure) > T4 (synthesized)

The LLM then classifies each item: ACT NOW · WATCH · COMPETITIVE · COMMUNITY SIGNALS.

## Watchlist Format

```json
{
  "id": "21",
  "label": "...",
  "shape": "SaaS | Directory | Automation | Platform",
  "duration": "Short | Medium | Long",
  "queries": {
    "gap": "...",
    "competition": "...",
    "demand": "..."
  },
  "competitors": ["url1", "url2"],
  "watch_condition": "..."
}
```

## Delivery

`generate_digest.py` writes the formatted digest to `digests/digest_latest.md`. The Researcher reads this file at session start and surfaces ACT NOW signals relevant to the active engagement domain.

Optional email delivery via Resend is supported in extended deployments. See `SERVICES_AND_KEYS.md` for setup. Not required for local operation.

## Run Cost

| Step | Cost |
|------|------|
| Perplexity (20 × 3 queries) | ~$0.30 |
| Anthropic (1 digest gen) | ~$0.05 |
| Firecrawl (5 URLs) | ~5 credits (free tier) |
| Google Trends | Free |
| Reddit | Free |
| Resend | Free (well inside tier) |
| **Total** | **~$0.35/run · ~$1.40/month at weekly cadence** |

## Environment

Required environment variables (variable names only — no real keys here, ever):

```bash
PERPLEXITY_API_KEY
ANTHROPIC_API_KEY
FIRECRAWL_API_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_TO_EMAIL
```

Full setup checklist with obtain URLs and free tier limits: `SERVICES_AND_KEYS.md` at the repository root.

## What The Researcher Does with This Pipeline

The Researcher does not own the pipeline. The upstream collection system owns it. The Researcher reads the structured signal package output, scores each signal against the active engagement domain, and uses ACT NOW items as one input among many to the engagement brief.

The pipeline is a **standing signal source**, not the only source. Engagement-specific briefs draw from the pipeline plus operator-direct sources plus skill-extended sources (transcripts, multi-source synthesis) as needed.

## Reference Implementation Status

- All five pipeline stages implemented and independently runnable
- Dry-run path verified: `python3 source/run_pipeline.py --dry-run` — no API calls, no keys required
- Cost discipline: ~$0.35/run at weekly cadence
- Failure posture: a failed source layer reports the gap, never blocks the run

</infrastructure>
