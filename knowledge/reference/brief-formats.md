# Brief Formats — By Consuming Stage
## Knowledge Department · Reference

Each consuming stage receives intelligence in a format matched to how it uses it. The `03_intel_distributor` uses this file when packaging output.

---

## PRAECEPTOR — after domain_research

**When:** After THE RESEARCHER delivers a brief and KNOWLEDGE has filed findings into the domain library.

```markdown
# Domain Intelligence Package — [Domain]
**Prepared for:** PRAECEPTOR · engagement planning
**Domain:** [slug]
**Verified:** [YYYY-MM-DD]
**Library status:** [New domain — first engagement | Existing domain — [N] prior engagements]

## What the System Already Knew
[Summary of what existed in memory/domain-library before this research pass.]

## What This Research Added
[Net new findings — by source tier. Only what was not previously in the library.]

## Key Signals for the 30/60/90 Plan
| Signal | Source Tier | Confidence | Implication for Plan |
|--------|------------|-----------|---------------------|
| | | | |

## Source Quality (this domain)
[Top sources by rating — what to use first in future research. What to skip.]

## Gaps the Plan Must Acknowledge
[Named gaps — what was searched for and not found. Where the plan operates on incomplete information.]

## Adversarial Risk Map Update
[Any new information about who has an interest in the operator having bad intelligence in this domain.]
```

---

## PRAECEPTOR — after calibration_update

**When:** After a signal resolves and KNOWLEDGE has updated the calibration log.

```markdown
# Calibration Intelligence Brief — [Domain] — [YYYY-MM-DD]
**Prepared for:** PRAECEPTOR · plan adjustment

## Signals Resolved
| Signal | Predicted | Actual | Result | Lesson |
|--------|-----------|--------|--------|--------|

## What This Changes for Future Plans in This Domain
[Specific adjustments — not generic cautions. What the next plan should do differently.]

## Source Quality Changes
[Any source that moved up or down based on outcome performance.]
```

---

## CALIBRATION — record update

**When:** Running the calibration session at engagement end.

```markdown
# KNOWLEDGE Calibration Record — [Domain] — [YYYY-MM-DD]

## Calibration Session Summary
Engagement: [domain — problem]
Signals reviewed: [N]
Confirmed: [N] | Refuted: [N] | Partial: [N] | Unresolved: [N]

## Memory Files Updated
- memory/calibration-log.md — [N] new rows
- memory/source-quality.md — [N] source ratings updated
- memory/domain-library/[domain].md — Signal History updated
- memory/operator-profile.md — [if friction patterns resolved]

## Misreads Filed
[Any signal-misreads entries. Root cause + lesson for each.]

## Watchlist Adjustments
[Any watchlist changes made as a result of calibration.]
```

---

## Format Rules

1. Every package carries a `Verified:` date.
2. Every package has a `Gaps` section — never omit.
3. Confirmed signal and hypothesis are always separated — never blended.
4. Source tier is stated on every claim — T1 through T4, never unlabeled.
