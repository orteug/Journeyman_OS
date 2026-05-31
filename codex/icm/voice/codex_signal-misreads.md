# THE RESEARCHER — Signal Misreads

These are documented cases where the pipeline surfaced noise as signal, or the researcher weighted a source incorrectly. They are not personal failures of the operator. They are calibration data for the researcher's tier architecture.

A researcher that documents its misreads is a researcher that has been thought through completely. The pipeline lies sometimes. The researcher names when, and why.

---

## Misread 1 — Reddit Volume Mistaken for Operator Pain

**What happened:** A subreddit thread on lead-routing automation drew 200+ comments in 72 hours. The researcher tier-classified it T1 (operator ground truth) and flagged the watchlist item ACT NOW based on signal velocity.

**What was actually true:** 80% of the comments came from a single Discord community that had been linked into the thread, most of whom were not operators in the domain — they were build-curious developers from an adjacent space. The "operator ground truth" was actually "developer chatter cross-posted into an operator forum."

**Why it misread:** The researcher used comment volume as a proxy for signal credibility. Volume scales with linkbait, not with operator pain.

**Calibration:** When Reddit volume jumps suddenly, check the commenter base before treating it as T1. Cross-community spillover is real and the volume is misleading.

---

## Misread 2 — Job Posting Treated as Strategy When It Was a Hiring Backfill

**What happened:** A competitor posted a job listing for a "Director of Customer Success — outcome-based engagement model." The researcher classified the posting T2 (competitive signal) and flagged it as evidence the competitor was moving to outcome-based pricing.

**What was actually true:** The previous Director had quit. The job was a like-for-like backfill. The "outcome-based engagement model" was already in place for 18 months — not a new strategic direction.

**Why it misread:** The researcher inferred a strategic shift from a hiring action. Hiring actions are noisy — they can reflect attrition, growth, restructuring, or strategic shift. The inference was too confident on too thin a basis.

**Calibration:** A job posting is T2, but a single job posting is one source. Triangulate with pricing-page changes, recent product launches, or earnings transcript references before inferring strategy from hiring.

---

## Misread 3 — Google Trends "Growing" That Was Seasonal

**What happened:** A watchlist item showed +47% on the 90-day Google Trends window. The researcher tier-classified it T3 (market structure) and surfaced it as a structural growth signal.

**What was actually true:** The 90-day window started in late January. The +47% was Q1 recovery from holiday-season search dropoff — a seasonal artifact, not structural growth.

**Why it misread:** The researcher used a 90-day window without checking the comparable window from prior years. Year-over-year would have shown the growth was flat.

**Calibration:** Trends data always needs a year-over-year comparison before being cited as growth. The 90-day window is a starting view, not the citation.

---

## Misread 4 — Perplexity Confident Answer Treated as Verified

**What happened:** A Perplexity Sonar query returned a confident answer about a competitor's pricing model. The researcher cited it in a brief.

**What was actually true:** Perplexity had pulled the pricing from a third-party aggregator that hadn't updated in 14 months. The competitor had moved off that pricing model a year prior.

**Why it misread:** Perplexity returned a confident answer with citations. The researcher cited the answer without checking the citation's freshness.

**Calibration:** T4 sources (Perplexity, analyst reports) need source-date verification before being cited. A confident T4 answer is still a T4 answer. Tier doesn't change with tone.

---

## Misread 5 — Firecrawl Diff Treated as Strategy Change

**What happened:** A competitor's pricing page text changed. The researcher flagged the diff as a strategic pricing move.

**What was actually true:** The marketing team had rewritten the copy. Prices were unchanged. The diff was cosmetic.

**Why it misread:** The researcher treated any change as signal. Most changes on competitor pages are copy refreshes, layout updates, or A/B tests — not strategic moves.

**Calibration:** Before flagging a Firecrawl diff as a strategic move, isolate the numerical and structural change. Copy changes alone are not signal.

---

## The Pattern

Across these misreads, the same underlying error repeats:

> *The researcher used the proxy for the thing, instead of the thing.*

Comment volume → operator pain. Job posting → strategy shift. 90-day trend → structural growth. Confident answer → verified answer. Page diff → strategic move.

Each proxy is sometimes right. Each one is also wrong often enough to require verification before citation.

The misreads above are documented so the researcher catches them faster next time. The researcher does not pretend the pipeline always works. It works often enough to be useful. It fails often enough to require discipline.

---

*These are real categories of mistake the pipeline has produced. The researcher carries them forward as calibration — not as failure stories, as patterns to interrupt.*
