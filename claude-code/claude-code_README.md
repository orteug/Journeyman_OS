# The Researcher — Claude Code Setup

## What This Folder Is

A full-tier deployment of The Researcher for Claude Code. The Researcher is the Filter stage of a three-stage operator intelligence system: SOURCE → THE RESEARCHER → PRAECEPTOR.

This is the **full tier**: every file is included — identity, rules, examples, voice files (refusals, blind-spots, signature-questions, signal-misreads), and reference files (engagement-intake-framework, source-hierarchy, source-infrastructure, friction-types, research-tooling).

For the lite tier (Claude Projects, ChatGPT Projects — context injection only, no file write), see the sibling folders in this repository.

---

## The Full System (Recommended Entry Point)

This folder contains The Researcher specialist context. For the complete orchestrated flywheel — routing, memory, calibration, PRAECEPTOR engagement planner — run Claude Code from the **repository root** instead:

```bash
cd operator-engagement-researcher
claude
```

The root `CLAUDE.md` is the system orchestrator. It:
- Routes across all three stages automatically (SOURCE → THE RESEARCHER → PRAECEPTOR)
- Auto-writes engagement state to `engagement/context.md`, `engagement/plan.md`, and `mentor-brief/brief.md`
- Maintains a growing memory system (`memory/`) that compounds across engagements
- Delivers a Morning Brief at every session open (30-second orientation)
- Runs calibration sessions at engagement close to update signal accuracy records

Use this `claude-code/` folder directly only if you want to deploy The Researcher as a standalone specialist without the full flywheel.

---

## Setup

### Option 1 — System prompt deployment (recommended)

1. Paste `claude-code_identity.md` and `claude-code_rules.md` as your system prompt
2. Load the reference and voice files as project files or attached context
3. The Researcher opens with: *"What domain are we operating in for this engagement?"*

### Option 2 — Inline context injection

Paste the contents of `claude-code_identity.md` + `claude-code_rules.md` at the start of every session. Attach reference files when their topic comes up.

---

## File Order

Load in this order:

1. `claude-code_identity.md` — who The Researcher is
2. `claude-code_rules.md` — behavioral contract
3. `reference/claude-code_engagement-intake-framework.md` — domain-first intake (rules.md references this — load it before first session)
4. `reference/claude-code_source-hierarchy.md` — T1–T4 schema, applied at synthesis only
5. `reference/claude-code_source-infrastructure.md` — reference implementation of an upstream signal pipeline
6. `reference/claude-code_friction-types.md` — three friction tiers for Mentor Brief emission
7. `reference/claude-code_research-tooling.md` — transcript extraction + multi-source synthesis spec
8. `claude-code_examples.md` — BAD/GOOD pairs with rule violations cited
9. `icm/voice/claude-code_refusals.md` — what The Researcher will not do
10. `icm/voice/claude-code_blind-spots.md` — what it cannot see from outside the engagement
11. `icm/voice/claude-code_signature-questions.md` — the five questions
12. `icm/voice/claude-code_signal-misreads.md` — documented cases where the pipeline surfaced noise as signal

---

## How To Use

### First session

Just start. The Researcher opens with the domain question. You answer. Intake proceeds through Domain → Problem → Scope → Context → Gaps. Only then does search begin.

### Mid-engagement

Bring any new signal — a document, a competitor URL, a YouTube link, a Reddit thread. The Researcher classifies it by tier, pulls what's needed, integrates into the working brief.

### Brief delivery

When findings are stable, ask for the brief. You'll receive Findings (cited) · Hypotheses (labeled) · Gaps (named) · Recommended next move (engagement planning or storage).

---

## What This Researcher Will Refuse

- Synthesizing from T4 sources alone (Perplexity / analyst reports without ground signal)
- Producing a verdict on data that's structurally lagging
- Filtering media type during search (everything is admissible)
- Assessing operator-client relationship dynamics (outside its sight line)
- Producing intelligence for a domain it hasn't been briefed on

When it refuses, it tells you why and names what would change the answer.

---

## Mentor Brief Emission

When operating in an execution workflow, The Researcher emits `[MENTOR_BRIEF_UPDATE]` blocks for three friction tiers (execution / decision / capability). Your downstream system strips these before display. See `reference/claude-code_friction-types.md`.

---

## Skill Recommendations

The Researcher will recommend two optional tools when triggers fire:

- **Transcript extraction** (yt-dlp) — when a video source is named
- **Multi-source synthesis** (NotebookLM or equivalent) — when 3+ documents accumulate

Neither is required. The Researcher continues without them if not installed. See `reference/claude-code_research-tooling.md`.

---

## Required API Keys

See `SERVICES_AND_KEYS.md` at the repository root.

The ICM folder itself requires no API keys — it is methodology. Keys are only needed if you also run the upstream signal pipeline (the live reference implementation documented in `reference/claude-code_source-infrastructure.md`).

---

## License

MIT. See `LICENSE` at the repository root.
