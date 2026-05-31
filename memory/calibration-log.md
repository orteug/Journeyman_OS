# Signal Calibration Log
*Updated after each engagement cycle via calibration session.*
*Feeds: signal-misreads.md (voice folder), source-quality.md, domain-library, watchlist adjustments.*

---

## How to Run a Calibration Session

At the end of each engagement — or when a key signal resolves mid-engagement — type:
> "Run calibration session for [engagement domain]."

The orchestrator will review handoff envelopes, walk through each ACT NOW and WATCH signal, and ask the operator to mark each outcome. Full protocol in `CALIBRATION.md`.

---

## Signal Outcomes

| Date | Engagement | Signal | Source Tier | Predicted | Actual | Result | Post-mortem |
|------|-----------|--------|-------------|-----------|--------|--------|-------------|
| 2025-10-08 | HVAC / Colorado | Technician wage inflation outpacing maintenance contract pricing → gross margin compression on multi-year contracts | T1 (r/HVAC forums, MCAA practitioner posts) | Gross margin on 3-year contracts 4–6 points lower than 1-year contracts | Confirmed: 4.3 points lower on average across 12 active multi-year contracts | CONFIRMED | T1 signal led correctly. Research was done against operator's prior conviction that "pricing is competitive." Adversarial audit caught the confirmation bias early. |
| 2025-11-12 | HVAC / Colorado | Seasonal cash trough would arrive mid-November requiring credit facility draw | T2 (13-week rolling cash model built during engagement) | Cash below $80K threshold by Nov 15 | Cash at $67K on Nov 12; line drawn Nov 10 | CONFIRMED | Model accurate. Operator initially resistant to drawing the line pre-emptively. Crucial Conversations framing was required. The 6-week advance warning from the model was the value. |
| 2025-12-01 | HVAC / Colorado | Competitor raising commercial contract minimums would push price-sensitive clients toward our client | T2 (Angi listing change) + T1 (client-reported inquiry) | 3–5 clients would inquire about switching | 2 clients inquired; 1 converted; 1 stayed at higher rate with competitor | PARTIAL | Directionally correct but overstated the conversion. T2 source detected the competitor move accurately; prediction of client behavior was too optimistic. Switching cost inertia in maintenance relationships is higher than estimated. |
| 2025-11-03 | CRE operations / Denver | Facilities manager at Anchor Client B had informal authority over renewal recommendation; formal process runs through ownership | T1 (operator direct knowledge) | Pitching ownership without FM relationship would produce a passive non-recommendation | Still unresolved — renewal decision expected Q1 2026 | UNRESOLVED | Signal came from operator tacit knowledge. Cannot validate until renewal decision is made. Structural pattern confirmed by BOMA publications; specific prediction pending. |

**Result codes:**
- `CONFIRMED` — signal proved accurate, prediction held
- `REFUTED` — signal was wrong, prediction failed → add to signal-misreads.md
- `UNRESOLVED` — engagement ended before signal could be confirmed
- `PARTIAL` — directionally correct but wrong on specifics

---

## Source Accuracy by Tier (running record)

| Tier | Total signals | Confirmed | Refuted | Partial | Accuracy |
|------|-------------|-----------|---------|---------|----------|
| T1 | 2 | 2 | 0 | 0 | 100% |
| T2 | 2 | 1 | 0 | 1 | 75% (50% fully confirmed) |
| T3 | 0 | 0 | 0 | 0 | — |
| T4 | 0 | 0 | 0 | 0 | — |

*T1 outperforming T2 as expected. T2 source correctly detected competitor move but overestimated behavioral impact — recalibrate magnitude estimates from T2 signals in maintenance contract domains.*

---

## Signal Misreads Log

| Date | Signal | Predicted | Actual | Root cause | Lesson |
|------|--------|-----------|--------|-----------|--------|
| 2025-12-01 | Competitor pricing change → client switching | 3–5 clients would switch | 1 converted, 1 stayed | Overweighted T2 source; didn't account for switching cost inertia in maintenance relationships | Apply 20% price threshold as default switching trigger in maintenance contracts. Price-sensitive clients call; they don't necessarily move. |

---

## Watchlist Adjustments Log

| Date | Action | Item | Reason |
|------|--------|------|--------|
| 2025-10-15 | ADDED | Competitor commercial pricing page — monthly check | Competitor moving on pricing; need early signal of further moves |
| 2025-11-20 | ADDED | r/HVAC technician wage posts — weekly digest | Labor cost is leading indicator of client margin compression |
| 2025-12-03 | PROMOTED | BOMA facilities manager survey — quarterly | Promoting from WATCH to ACT NOW given CRE engagement FM authority signal unresolved |

**Action codes:** `ADDED` / `REMOVED` / `PROMOTED` (Watch → ACT NOW criteria) / `DEMOTED`
