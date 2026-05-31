# Calibration Session Protocol
*Run at the end of each engagement cycle, or when key signals resolve mid-engagement.*
*This is how the flywheel improves. Each session makes the next engagement sharper.*

---

## What Calibration Is

The researcher that never checks whether it was right eventually becomes the researcher no one trusts.

Calibration is the mechanism by which this system learns from its own record. Every signal that proved true confirms a source. Every signal that proved false exposes a misread. Both update the system. Neither gets edited away.

The system that documents its own errors is the system worth trusting.

---

## When to Run

Run calibration when any of these conditions are true:

- The engagement has ended (final deliverable delivered)
- A key ACT NOW signal has resolved — proved true or false
- A source cited heavily in the brief proved unreliable
- Execution revealed something important the researcher missed
- The plan required a major adjustment that wasn't anticipated

You do not wait until the engagement ends. If a signal resolves in week 3, calibrate week 3. The fresher the post-mortem, the more accurate it is.

---

## How to Run

Open Claude Code in this repo. Type:
> "Run calibration session for [engagement domain]."

The orchestrator runs this protocol:

### Step 1 — Pull the record
Read:
- `source/handoffs/` — what did SOURCE find?
- `engagement/handoffs/research_YYYY-MM-DD.md` — what did THE RESEARCHER claim?
- `engagement/plan.md` — what did PRAECEPTOR plan?
- `mentor-brief/brief.md` — what friction surfaced during execution?

### Step 2 — Signal review
For each ACT NOW and WATCH signal from the SOURCE digest, the orchestrator asks:

> "Signal: [signal description] — Source: [T1/T2/T3/T4]. Did this prove true, false, or unresolved?"

Operator answers. Orchestrator records in `memory/calibration-log.md`.

### Step 3 — Miss review
The orchestrator asks:

> "What did the researcher miss that mattered? What showed up during execution that wasn't in the brief?"

Operator answers. If the miss came from a bad source or a wrong tier assignment — that becomes a signal-misread entry.

### Step 4 — Source quality review
The orchestrator asks:

> "Which source proved most reliable? Which proved weakest?"

Updates `memory/source-quality.md` for this domain.

### Step 5 — Writes (automatic)

| File | What changes |
|------|-------------|
| `memory/calibration-log.md` | New signal outcome rows added |
| `memory/source-quality.md` | Domain source ratings adjusted |
| `memory/operator-profile.md` | Engagement History row closed, Growth Edges checked |
| `memory/domain-library/[domain].md` | Signal History updated, What Works / Doesn't Work updated |
| `claude-code/icm/voice/claude-code_signal-misreads.md` | New documented misread added with post-mortem (if any signals were refuted) |
| `source/config/watchlist_example.json` | Low-signal items flagged for removal; newly discovered items flagged for addition |

### Step 6 — Calibration summary
The orchestrator delivers:

```
CALIBRATION COMPLETE — [domain] — [date]

Signals reviewed: [n]
Confirmed: [n] | Refuted: [n] | Unresolved: [n]

Source performance:
  Best: [source] — [n] confirmed signals
  Weakest: [source] — [n] refuted signals

System updates written:
  [list of files updated]

What changed for next engagement in this domain:
  [1–3 specific changes — what the system will do differently]
```

---

## The Compounding Rule

A calibration session takes 15 minutes.

It makes every future engagement in this domain faster, more precise, and more reliable.

Skip it and the system stays static — it will repeat the same misreads, cite the same weak sources, miss the same gaps.

Run it and the system compounds — each engagement builds on the last. After 5 calibrations in a domain, the researcher knows which sources to go to immediately, which signals to weight higher, and what the operator is likely to miss. That knowledge doesn't exist anywhere else.

---

## What Gets Better

After 1 calibration:
- Signal accuracy is on record — the system knows what it got right and wrong

After 3 calibrations in the same domain:
- Source quality is calibrated — the system skips weak sources and goes directly to what works
- The domain library has real signal history — not theory

After 5 calibrations across different domains:
- Cross-domain patterns emerge — what the operator is consistently strong at, what they miss
- Growth edges are visible — PRAECEPTOR can anticipate and pre-plan around them
- The operator profile has a track record — the system serves the operator, not a generic user

---

*The researcher that learns from its mistakes is the researcher that earns its place in the operator's workflow.*
