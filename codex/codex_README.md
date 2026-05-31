# The Researcher — Codex Setup (Full Tier)

## What This Folder Is

A full-tier deployment of The Researcher for OpenAI Codex (or any OpenAI-compatible agent with file access). The Researcher is the Filter stage of a three-stage operator intelligence system: SOURCE → THE RESEARCHER → PRAECEPTOR.

This is the full tier: identity, rules, examples, voice files, and reference files. File read/write supported. Mentor Brief emission auto-generates.

---

## The Full System (Claude Code)

For the complete orchestrated flywheel — routing, memory compounding, calibration sessions, and PRAECEPTOR engagement planner — the canonical full-tier deployment runs via Claude Code from the repository root. The root `CLAUDE.md` orchestrator handles:

- Stage routing (SOURCE → THE RESEARCHER → PRAECEPTOR)
- Auto-writes to `engagement/`, `mentor-brief/`, and `memory/`
- Morning Brief at every session start
- Calibration loop at engagement close

This `codex/` folder gives Codex users the full specialist context for The Researcher. Connect it to a downstream mentorship system to replicate the PRAECEPTOR stage. The `[MENTOR_BRIEF_UPDATE]` blocks are the handoff mechanism.

---

## Setup

### System prompt

Paste `codex_identity.md` and `codex_rules.md` as the system prompt. The rules.md is formatted as JSON-compatible structured rules that Codex parses natively.

### File access

Codex reads:
- `reference/*.md` on demand
- `icm/voice/*.md` for character maintenance
- Engagement brief files (operator-provided)

Codex writes:
- Engagement brief output
- `[MENTOR_BRIEF_UPDATE]` blocks (stripped by downstream system before display)

### File order

1. `codex_identity.md` — role and architectural opinion
2. `codex_rules.md` — behavioral contract (JSON-formatted)
3. `reference/codex_engagement-intake-framework.md` — domain-first intake
4. `reference/codex_source-hierarchy.md` — T1–T4 schema
5. `reference/codex_source-infrastructure.md` — reference pipeline
6. `reference/codex_friction-types.md` — Mentor Brief tiers
7. `reference/codex_research-tooling.md` — skill specs
8. `codex_examples.md` — BAD/GOOD pairs
9. `icm/voice/codex_refusals.md`
10. `icm/voice/codex_blind-spots.md`
11. `icm/voice/codex_signature-questions.md`
12. `icm/voice/codex_signal-misreads.md`

---

## How To Use

### First session

The Researcher opens with the domain question. Operator answers. Intake proceeds through Domain → Problem → Scope → Context → Gaps. Search begins only after Stage 1 gate clears.

### Sources

Codex pulls sources via available tools (web fetch, file read, transcript extraction via yt-dlp). The Researcher classifies tier on receipt and integrates into the working brief.

### Brief delivery

Brief output written to file (operator-named path). Format:

```
# ENGAGEMENT BRIEF — [Operator] / [Client domain]
## Domain
## Problem
## Findings (cited)
## Hypotheses (labeled)
## Gaps
## Recommended Tooling
## Route
```

---

## Mentor Brief Emission

The Researcher emits `[MENTOR_BRIEF_UPDATE]` blocks for three friction tiers (execution / decision / capability). Downstream mentorship system reads them at next session open.

---

## Skill Recommendations

- `transcript_extraction` (yt-dlp) — triggered when video source named
- `multi_source_synthesis` (NotebookLM) — triggered when 3+ documents accumulate

Neither blocks research. Continues without if not installed.

---

## Required API Keys

See `SERVICES_AND_KEYS.md` at the repository root.

ICM folder requires no keys — methodology only. Keys are only needed if you also run the upstream signal pipeline.

---

## License

MIT. See `LICENSE` at the repository root.
