# Changelog — Journeyman OS

## v3.0 — 2026-06-17 — Guardrails Layer

Adds a structural safety layer. Safety posture is now load-order enforced, not embedded in stage prose.

### Added

- `_guardrails/shared/output-disclaimers.md` — required disclaimers on all output; plain English
- `_guardrails/shared/confidence-floor.md` — 🟢 HIGH / 🟡 MEDIUM / 🔴 LOW confidence levels; hard STOP conditions
- `_guardrails/shared/escalation-triggers.md` — professional escalation gates
- `_guardrails/shared/adversarial-input-flags.md` — one-sided input detection
- `_guardrails/domain/operator-research-guardrails.md` — 5 escalation triggers (investment decision, named private individual, financial projections, acute operator pressure, legal-sensitive sources) + 5 input flags (presupposed conclusion, unsourced benchmarks, self-reported metrics, urgency bypass pressure, source tier misrepresentation)
- `routing.md` updated with Step 0: load all guardrails before any session routing
- `_modes/session-mode.md` updated with structural slots: Input Integrity Flag, confidence level, Professional Required block, Disclaimer Block

### Changed

- `CLAUDE.md` — pointer added to `routing.md` and `_guardrails/` at top of file

---

## v2.0 — 2026-06-17 — ICM Architecture Upgrade

Applies the Interpretable Context Methodology (ICM) framework from Van Clief & McDermott (arXiv:2603.16021).

### Added

- `routing.md` — L1 routing extracted from `CLAUDE.md`: Step 0 (guardrails), Step 1 (session state reads), Step 2 (stage routing table + routing scripts), Step 3 (data currency check), standing rules
- `_modes/session-mode.md` — explicit L2 task contract for orchestrator sessions
- `memory/_patterns.md` — cross-session pattern tracker (complements existing `memory/calibration-log.md`)

### Changed

- `CLAUDE.md` — pointer to `routing.md` added; stage execution content preserved in place (surgical extraction — stage specs remain in CLAUDE.md as L2 content; full _modes/ migration is a future upgrade)

### Structural Changes Summary

| v1 location | v2 location | Reason |
|-------------|-------------|--------|
| Session Start Protocol in `CLAUDE.md` | `routing.md` Step 1 | L1 routing separated from L0 identity |
| Stage Routing table in `CLAUDE.md` | `routing.md` Step 2 | Same |

### Note on CLAUDE.md scope

`CLAUDE.md` in Journeyman OS combines L0 (orchestrator identity) and L2 (stage execution specs). The stage routing table (L1) has been extracted to `routing.md`. Full extraction of stage specs to `_modes/` is architecturally correct but deferred — stage specs are tightly coupled to the flywheel sequencing and require careful migration. The current state is a partial v2 upgrade; complete upgrade to full ICM layer separation is a future version.

---

## v1.0 — 2026-05 — Initial Release

Built for the Jeff van Clief Skool community (Week 6).

**What it did well:**
- Five-stage flywheel with explicit stage sequencing — strongest structural instinct in the v1 portfolio
- memory/ folder with calibration-log.md — proto-L4, correct instinct
- source-quality.md — explicit source tier tracking, no other v1 repo had this
- Auto-write state after each stage — correct L4 persistence pattern
- Session start protocol with state reads — proto-L1 routing
- PRAECEPTOR voice layer — strong L0 character design

**What v2 fixes:**
- Session Start Protocol and Stage Routing table embedded in CLAUDE.md (L1/L0 mixing)
- No explicit task contract at the orchestrator session level (stage specs existed but no session contract)
- No _guardrails/ layer
- memory/_patterns.md missing (calibration-log existed but no cross-session pattern surface)
