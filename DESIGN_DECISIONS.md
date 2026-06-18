# Design Decisions — v2 & v3 Architecture
## Journeyman OS

> Maps structural changes to their source concept in:
> **Van Clief & McDermott, "ICM-Folder-Structure-as-Agentic-Architecture" (arXiv:2603.16021)**

---

## The Core Insight from the ICM Paper

Claude Projects are not just knowledge bases — they are **Interpretable Context Methodologies (ICMs)**. Folder position carries cognitive meaning. Files at different layers serve different roles. Mixing them degrades output.

| Layer | Role | Should contain |
|-------|------|----------------|
| L0 — Identity | Who the agent is | Fixed character, expertise, limits |
| L1 — Routing | Where inputs go | Stage routing, input classification |
| L2 — Task contract | How each task executes | Per-mode execution specs |
| L3 — Reference (stable) | Stable constraints | Frameworks that don't change per-session |
| L4 — Working (per-run) | Per-session data | Active engagement state, session logs |

---

## Decision 1: Extract Stage Routing from `CLAUDE.md` into `routing.md`

**v1 behavior:** `CLAUDE.md` contained the Session Start Protocol (L1 routing logic) and the Stage Routing table (L1) alongside the orchestrator's identity (L0) and full stage execution specs (L2). A single file served three distinct cognitive roles.

**v2 change:**
- `routing.md` — L1 only: Step 0 (guardrails), Step 1 (state reads), Step 2 (stage routing table + scripts), Step 3 (data currency), standing rules
- `CLAUDE.md` — L0 identity + L2 stage specs preserved in place (see Decision 1a below)

**ICM source:** L1 (routing) must be distinct from L0 (identity) and L2 (task contracts). The paper argues that mixing routing logic with identity forces the model to parse what type of instruction each line is — increasing the chance that routing behavior and character behavior blur together.

**What this fixes:** Reading `CLAUDE.md` required distinguishing between "who I am" (L0), "which stage to invoke" (L1), and "how to execute Stage 2" (L2). In v2, stage routing is unambiguous — it lives in `routing.md` and loads before any stage execution.

**Decision 1a — Why Stage Specs Remain in CLAUDE.md:**
Full extraction of stage specs to `_modes/` is architecturally correct. It is deferred because the five-stage specs in CLAUDE.md are tightly coupled — each stage references the next, and they collectively define the flywheel loop. Surgical extraction without breaking the sequencing requires a dedicated migration session. The current v2 is a partial upgrade. The pointer in CLAUDE.md marks where the full separation should happen.

---

## Decision 2: Add L2 Session-Level Task Contract (`_modes/session-mode.md`)

**v1 behavior:** There was no explicit execution contract for an orchestrator session — only stage specs for what happens inside each stage. A cold-start session had to infer how to open, what to read, what format to produce, before routing to a stage.

**v2 change:** `_modes/session-mode.md` — explicit pre-session checklist, session read output format, routing decision format, context package structure, session log entry format.

**ICM source:** Context Layer 2 (task contract). The paper distinguishes L2 from L1 (routing) and the stage specs embedded in CLAUDE.md. L2 is the execution contract for a specific mode — it answers "how does this session open and close?" independent of which stage fires.

**What this fixes:** Session opening format was inconsistent in v1. The session read ("You've been in [domain]...") existed as an example but not as a contract. v2 makes it a contract — the format is unambiguous, the guardrail hooks are pre-wired.

---

## Decision 3: Extend L4 Working Layer with `memory/_patterns.md`

**v1 behavior:** `memory/calibration-log.md` existed — one of the strongest v1 structural instincts in the portfolio. But calibration log entries were per-session, with no mechanism for surfacing cross-session patterns.

**v2 change:** `memory/_patterns.md` — when the same signal produces the same outcome in 2+ sessions, it surfaces here as a pattern candidate for promotion to stage rules or source-quality thresholds.

**ICM source:** Context Layer 4 (working/per-run data). The calibration log is per-run. The patterns tracker is the cross-run synthesis layer. Together they form a complete L4 feedback loop: log → surface → promote.

**What this fixes:** v1 had no mechanism for the calibration data to compound into system improvement. A source tier that was systematically miscalibrated would remain miscalibrated indefinitely. The patterns tracker closes the loop.

---

## Decision 4: Add `_guardrails/` as Structural Safety Layer (v3)

**v1+v2 behavior:** No safety layer. Escalation guidance existed implicitly in PRAECEPTOR's voice layer (refusals.md) but applied only to that specialist, not to the orchestrator or other stages.

**v3 change:**
- `_guardrails/shared/` — 4 files: always loaded, every stage, every session
- `_guardrails/domain/operator-research-guardrails.md` — 5 escalation triggers + 5 input flags for operator intelligence work
- `routing.md` Step 0: guardrails load before any state reads or routing

**ICM source:** Layer 3 stability principle. Safety posture embedded in a specialist's voice layer applies only to that specialist. Structural placement in `_guardrails/` makes it session-wide and load-order enforced.

**Operator research rationale:** The Journeyman OS produces research intelligence that operators use to make real decisions — entering new markets, hiring, pricing, client strategy. The risk profile is different from a real estate transaction (lower per-decision financial stakes, higher frequency of use) but the core failure mode is similar: a user who over-trusts research output and under-invests in independent verification. The guardrails are calibrated for this.

**Specific trigger calibration:** Research Trigger 1 (investment/acquisition decision) fires at the highest threshold — when the operator indicates the output will be used for capital commitment. Trigger 4 (acute operator pressure) fires on operator wellbeing signals, not just research quality — the system should not accelerate bad decisions by an operator in distress.

---

## What Didn't Change

- Stage specs in `CLAUDE.md` — preserved exactly. These are the flywheel's core logic. No structural changes.
- `memory/calibration-log.md`, `memory/operator-profile.md`, `memory/source-quality.md` — L4 working files, correct placement, correct function. No changes.
- `engagement/context.md`, `engagement/plan.md` — L4 active engagement state. Correct placement.
- Per-specialist files in `praeceptor/`, `execute/`, `chatgpt-projects/`, etc. — all L0/L2 content, correctly scoped. No changes.
- `CALIBRATION.md` — closing stage protocol, correct function.

---

## Journeyman OS v1 Was the Strongest v1 Architecture

Among the five repos in this upgrade wave, Journeyman OS had the most structurally sound v1:
- `memory/` folder with calibration-log → proto-L4, correct instinct
- `source-quality.md` → no other v1 repo had explicit source tier tracking
- Auto-write state after each stage → correct L4 persistence pattern
- Stage sequencing that cannot be skipped → proto-routing constraint

The v2 upgrade is smaller here than in other repos precisely because the v1 instincts were better. The main gap was L1/L0 mixing in CLAUDE.md and the absence of guardrails.

---

*Reference: Van Clief & McDermott, "ICM-Folder-Structure-as-Agentic-Architecture" (arXiv:2603.16021)*
*v2+v3 built: 2026-06-17*
