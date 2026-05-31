# Friction Types
## Three Tiers for Mentor Brief Emission

<friction>

The Researcher does not just produce briefs. Once an engagement enters execution, The Researcher continues to observe — and emits friction signals into the Mentor Brief that downstream mentorship layers read.

There are three friction tiers. Each has a different downstream effect.

---

## Tier 1 — Execution Friction (log only)

<tier name="execution" priority="log-only">

**What it looks like:**
- A task delays by a day because of an external dependency
- A workflow bumps against a tooling limit (rate limit, API quota, file size)
- A small process slip that the operator notices and corrects

**Downstream effect:**
- Logged in the Mentor Brief as context.
- Does not surface prominently.
- Does not trigger a plan revision.

**Example brief entry:**
```
[MENTOR_BRIEF_UPDATE]
type: execution_friction
date: 2026-05-29
context: Firecrawl rate-limited during competitor scrape — pipeline sleep retry worked.
no_action_needed: true
[/MENTOR_BRIEF_UPDATE]
```
</tier>

## Tier 2 — Decision Friction (medium priority)

<tier name="decision" priority="medium">

**What it looks like:**
- The operator pauses on a judgment call ("should I send this email now or wait?")
- A multi-option choice without a clear default
- A tradeoff that needs naming before it gets resolved

**Downstream effect:**
- Available in the Mentor Brief — surfaced when a mentor session opens.
- Does not block execution.
- Mentor may ask about it directly if the same decision recurs.

**Example brief entry:**
```
[MENTOR_BRIEF_UPDATE]
type: decision_friction
date: 2026-05-29
context: Operator delayed Phase 2 outreach by 3 days — uncertain whether to lead with case study or value prop.
recurring: false
[/MENTOR_BRIEF_UPDATE]
```
</tier>

## Tier 3 — Capability Friction (high priority — surfaced prominently)

<tier name="capability" priority="high">

**What it looks like:**
- The operator doesn't know how to proceed
- A skill gap that's blocking execution
- An assumption in the plan that turns out not to hold

**Downstream effect:**
- Surfaced at the top of the Mentor Brief.
- Mentor is oriented to it before the session begins.
- Triggers a plan adjustment.

**Example brief entry:**
```
[MENTOR_BRIEF_UPDATE]
type: capability_friction
date: 2026-05-29
context: Operator stuck on financial modeling for fractional CFO pricing tier — has never modeled outcome-based pricing before.
plan_adjustment_needed: true
suggested_route: Mentor + research brief on outcome-based pricing in fractional services
[/MENTOR_BRIEF_UPDATE]
```
</tier>

---

## Why Three Tiers (and not one)

A single "friction" category over-surfaces noise and under-surfaces real signal. Three tiers:

- Let the operator proceed when the friction is execution-level (most friction is)
- Make decision-level friction available without blocking
- Force capability-level friction into the foreground where mentorship can intervene

The architecture inverts the standard mentorship pattern. Most systems require the mentee to brief the mentor. This one lets the execution layer brief the mentor — so the operator arrives at the session with a friction point, and the mentor is already oriented.

## Who Emits Friction Signals

- The execution layer emits Tier 1 and Tier 2.
- The Researcher emits Tier 3 when investigation surfaces a capability gap in the engagement.

## The Brief's Active Section

The mentor reads the "active" section of the Mentor Brief — typically the last 7 days. Older entries archive but stay queryable. The active section is what shapes the next conversation.

</friction>
