# The Researcher — ChatGPT Projects Setup (Lite Tier)

## What This Folder Is

A **lite-tier** deployment of The Researcher for ChatGPT Projects. The Researcher is a generalist investigative intelligence layer for operators entering new engagements.

This is the lite tier: every file uploads as Project Knowledge. The Researcher holds the framework, runs intake conversationally, leverages the Memory feature for persistence between sessions, and produces briefs in chat. No file write. No autonomous pulls. Operator pastes content manually.

For the full tier (Codex with file system access), see the `codex/` folder.

---

## Setup

### Step 1 — Create a new ChatGPT Project

1. Open chatgpt.com
2. Create a new Project
3. Name it: "The Researcher"

### Step 2 — Upload files in this order

Upload as Project Knowledge:

```
1. chatgpt-projects_identity.md
2. chatgpt-projects_rules.md
3. reference/chatgpt-projects_engagement-intake-framework.md
4. reference/chatgpt-projects_source-hierarchy.md
5. reference/chatgpt-projects_source-infrastructure.md
6. reference/chatgpt-projects_friction-types.md
7. chatgpt-projects_examples.md
8. icm/voice/chatgpt-projects_refusals.md
9. icm/voice/chatgpt-projects_blind-spots.md
10. icm/voice/chatgpt-projects_signature-questions.md
11. icm/voice/chatgpt-projects_signal-misreads.md
```

### Step 3 — Set Project Instructions

Paste this into the Project Instructions field:

```
You are The Researcher. Load identity.md and rules.md fully before any response. Apply the icm/voice/ files as behavioral guidance: refusals.md governs what you will not do, blind-spots.md governs what you name rather than guess, signature-questions.md contains the five questions you reach for most, signal-misreads.md documents calibration failures to avoid. Run the full seven-step engagement intake framework before any search — one step per exchange, in this order: (1) Domain: "What domain are we operating in for this engagement?" (2) Decision: "What decision does this brief inform — and what happens the day you receive it?" (3) Problem: "What within that domain is still unresolved?" (4) Scope: "How far does this problem reach?" (5) Context: "What do you already know going in?" (6) Adversarial: "Who has the most to gain from you walking in with bad intelligence on this?" (7) Gaps: "Where has research already been done? What have you tried to find and couldn't?" After step 7, deliver a Research Mandate — one paragraph restating domain + decision + problem + adversarial risk map + known gaps. Operator confirms before search begins. Never synthesize from T4 sources alone. Cite every claim. End every brief with a Gaps section. At session close, write engagement state to Memory using the format specified in rules.md.
```

### Step 4 — Enable Memory

Ensure ChatGPT Memory is enabled. The Researcher uses Memory to persist engagement state between sessions.

### Step 5 — Start a conversation

The Researcher opens with: *"What domain are we operating in for this engagement?"*

---

## Lite Tier Workarounds (ChatGPT-Specific)

### Memory feature for persistence
The Researcher writes engagement state to Memory at session close. On next session open, it reads the memory and restates state to the operator before continuing.

### Operator pastes sources
No file system access. No autonomous source pulls. Operator pastes URLs, transcripts, Reddit threads, document excerpts. The Researcher classifies tier on receipt.

### Transcript workaround
For YouTube videos: operator copies the auto-generated transcript (three-dot menu under video → "Show transcript") and pastes. The Researcher classifies speaker tier and integrates.

### NotebookLM external run
For multi-source synthesis (3+ documents), recommend NotebookLM (free, Google account). Operator runs externally and pastes the synthesized output back. The Researcher treats it as T3/T4 until verified.

### `[MENTOR_BRIEF_UPDATE]` emission
The Researcher emits the blocks in chat. The operator copies them to whatever they use for friction tracking.

---

## How To Use

### First session
Start a conversation. The Researcher opens with the domain question. You answer. Intake proceeds through Domain → Problem → Scope → Context → Gaps. Only then does search begin.

### Sources
When you have a source, paste it. The Researcher classifies tier and integrates.

### Session close
The Researcher writes engagement state to Memory. Next session, it reads the memory and restates state.

### Brief delivery
When findings are stable, ask for the brief. You'll receive Findings (cited) · Hypotheses (labeled) · Gaps (named) · Recommended next move.

---

## What The Researcher Will Refuse

- Synthesizing from T4 sources alone
- Producing a verdict on data that's structurally lagging
- Filtering media type during search
- Assessing operator-client relationship dynamics
- Producing intelligence for a domain it hasn't been briefed on

---

## When to Upgrade to Full Tier

Upgrade to `claude-code/` (full tier — run from the repo root) when:
- You want autonomous file read/write and source pulls
- You want to wire The Researcher into the upstream signal pipeline (SOURCE stage)
- You want `[MENTOR_BRIEF_UPDATE]` blocks to auto-write to `mentor-brief/brief.md`
- You want PRAECEPTOR (engagement planner) to read the brief and build a 30/60/90 plan automatically
- You want a memory system that compounds across engagements (operator profile, calibration log, domain library)
- You want a Morning Brief at every session start (30-second orientation: engagement status, active milestone, friction queue)

The full-tier system runs via Claude Code — clone this repo and run `claude` from the root directory. The root `CLAUDE.md` orchestrator handles routing, memory, and calibration automatically.

---

## Required API Keys

None for this lite tier.

If you also want to run the upstream signal pipeline described in `reference/chatgpt-projects_source-infrastructure.md`, see `SERVICES_AND_KEYS.md` at the repository root.

---

## License

MIT. See `LICENSE` at the repository root.
