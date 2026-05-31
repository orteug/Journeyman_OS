# Intelligence Sources — Engagement Source Map
## Knowledge Department · Reference

Where intelligence lives in this system. Query what exists before treating anything as new.

**Protocol:** Memory-first. The domain library may already contain this signal from a prior engagement. Check `memory/` before conducting or filing new research.

---

## Tier 1 — Highest Signal Sources

| Source | What it provides | Location | Freshness | Notes |
|--------|-----------------|----------|-----------|-------|
| `memory/domain-library/[domain].md` | Accumulated operator ground truth — what was learned from direct engagement, not from external sources | Local file | Per engagement | Query first. T1 because it represents lived experience, not published intelligence. |
| `memory/calibration-log.md` | Which signals proved accurate, which failed, source tier accuracy by domain | Local file | Per calibration session | Tells you which sources to trust in this domain before you look at any of them. |
| `memory/operator-profile.md` | Operator tacit knowledge — what they know from experience that doesn't appear in any source | Local file | Per engagement | Often the highest-quality signal in the system. Surfaces during Context step of intake. |
| `source/digests/digest_latest.md` | Most recent SOURCE pipeline output — Reddit, Trends, Firecrawl, Perplexity signals scored by tier | Local file | Weekly (when pipeline runs) | Read this before any external research in an active engagement domain. |

---

## Tier 2 — Validated External Sources

| Source | What it provides | Access | Freshness | Domain quality notes |
|--------|-----------------|--------|-----------|---------------------|
| Competitor job postings (Indeed, ZipRecruiter) | Technician/operator compensation — leading indicator for pricing moves | Web search | Real-time | Check `memory/source-quality.md` for domain-specific rating. Mid-market HVAC: ★★★★★ |
| Google Reviews (competitor profiles) | Service failure patterns, client complaints, what clients actually say | Web search | Continuous | Read across 3+ competitors to find industry-wide patterns vs. single-operator issues |
| Competitor websites (service pages, pricing) | Positioning baseline, service tier language | Web fetch | Often stale | Verified against source quality ratings |
| Trade association listings (ACCA, MCAA, BOMA, etc.) | Contract structure norms, certification requirements, regulatory context | Web | Quarterly | Domain-specific quality — check source-quality.md before relying |

---

## Tier 3 — Contextual Sources

| Source | What it provides | Access | Freshness | Notes |
|--------|-----------------|--------|-----------|-------|
| Google Trends | Seasonal demand signal, macro trajectory | Web | Real-time | Useful for leading questions, not for specific market claims |
| Industry association publications | Standards, regulatory updates, benchmark surveys | Web | Annual/quarterly | Good for structural context, weak on ground-level market dynamics |
| LinkedIn (operator profiles, company pages) | Personnel history, organizational structure signals | Web | Continuous | Use to map decision-makers and authority structures |

---

## Tier 4 — Context Only — Never Synthesize Alone

| Source | Why it's T4 | When to use |
|--------|------------|------------|
| Perplexity synthesis | Synthesizes from T3/T4 sources and news. Adds no information above those sources and introduces false confidence. | Use only to generate initial search queries or as a lead to T1/T2 sources — never as an endpoint. |
| IBISWorld, analyst reports | Lag 12–18 months. Too aggregated for pricing or labor market intelligence. | Macro statistics only. Never for pricing, labor market, or competitive intelligence. |
| General news articles | Too slow, too generic, too far from ground truth. | Background only. |

---

## Source Query Protocol

**Before any external research:**
1. Check `memory/domain-library/[domain].md` — what do we already know?
2. Check `memory/source-quality.md` — which sources have been validated for this domain?
3. Check `memory/calibration-log.md` — any prior signals that inform how to weight what you're about to find?

If all three are populated and current (under 90 days) → prioritize verification over new research. Confirm what is known before searching for what is not.

**After any external research:**
The finding goes into `memory/` before the invocation closes. Every research pass makes the next one cheaper. This is the compounding logic of the system.
