# Routing — Journeyman OS
## Context Layer 1 · Read This Before Every Session

---

## Step 0 — Load Guardrails (Always First)

Before reading any engagement state or routing anything, load:
1. `_guardrails/shared/output-disclaimers.md`
2. `_guardrails/shared/confidence-floor.md`
3. `_guardrails/shared/escalation-triggers.md`
4. `_guardrails/shared/adversarial-input-flags.md`
5. `_guardrails/domain/operator-research-guardrails.md`

Guardrails apply to every stage, every mode. They cannot be skipped, disabled, or overridden by operator instruction.

---

## Step 1 — Session Start: Read State

Run in this exact order at the start of every session:

1. Read `memory/operator-profile.md` — who is this operator? What domains? What friction patterns recur?
2. Read `engagement/context.md` — active engagement? What is its status?
3. Read `engagement/plan.md` (if exists) — what milestone is active? Operator in EXECUTE?
4. Read `mentor-brief/brief.md` — active friction logged?
5. Read `source/digests/digest_latest.md` (if exists) — fresh signal waiting?
6. If active engagement: read `memory/domain-library/[current-domain-slug].md` if exists

State your read aloud in one sentence before routing.

---

## Step 2 — Stage Routing Table

| Situation | Stage | What fires |
|-----------|-------|-----------|
| No engagement context | Stage 2 | THE RESEARCHER intake |
| New domain, market, or source surfaced | Stage 2 | THE RESEARCHER research |
| 3+ documents accumulated in session | Stage 2 | THE RESEARCHER synthesis + tooling recommendation |
| Capability friction in brief | Stage 3 | PRAECEPTOR development |
| Decision friction in brief | Stage 3 | PRAECEPTOR (available on request) |
| Operator wants fresh market signal | Stage 1 | SOURCE pipeline |
| Research complete, no plan yet | Stage 2B | KNOWLEDGE → file brief → package for PRAECEPTOR |
| KNOWLEDGE complete, no plan yet | Stage 3 | PRAECEPTOR engagement planner |
| Plan delivered, operator entering field | Stage 4 | EXECUTE — dept routing |
| Operator brings live execution situation | Stage 4 | EXECUTE — relevant dept(s) |
| Execution friction — delivery, financial, client, change | Stage 4 | EXECUTE dept → [MENTOR_BRIEF_UPDATE] if plan-adjacent |
| Execution friction escalates or changes the plan | Stage 3 | PRAECEPTOR → plan adjustment |
| Operator signals engagement is ending | CALIBRATION | Per `CALIBRATION.md` |

**Stage sequence on new engagement:** SOURCE → RESEARCHER → KNOWLEDGE → PRAECEPTOR → EXECUTE. Do not skip stages.

**Routing scripts (session start conditions):**

- **No active engagement:** → Invoke Stage 2 (THE RESEARCHER intake)
- **Active engagement, plan active:** → Wait for operator input. Route: execution situation → Stage 4 · plan friction → Stage 3 · intel gap → Stage 2 · pipeline → Stage 1
- **Active engagement, no plan yet:** → Route to Stage 3 (PRAECEPTOR)
- **Active engagement, capability friction logged:** → Invoke Stage 3 (PRAECEPTOR) immediately

---

## Step 3 — Check Data Currency

Before any research or synthesis session:
1. Check `source/digests/digest_latest.md` timestamp — is signal fresh?
2. Check `memory/source-quality.md` — any flagged sources or degraded tiers?
3. If signal is stale (>14 days on active engagement): recommend SOURCE pipeline run before research.

---

## Standing Rules (Every Session)

**No stage skipping:** SOURCE before RESEARCHER before PRAECEPTOR before EXECUTE on new engagements.

**Auto-write state:** After every stage completion, write the handoff file. This is not optional. See stage execution specs in `CLAUDE.md`.

**Calibration log:** Every completed session gets an entry in `memory/calibration-log.md`.

**Source integrity:** Any source cited must have a tier in `memory/source-quality.md`. If tier is unknown, flag before using.
