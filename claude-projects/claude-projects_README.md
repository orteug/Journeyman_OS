# The Researcher — Claude Projects Setup (Lite Tier)

## What This Folder Is

A **lite-tier** deployment of The Researcher for Claude Projects (claude.ai). The Researcher is a generalist investigative intelligence layer for operators entering new engagements.

This is the lite tier: every file uploads as project knowledge. The Researcher holds the framework, runs intake conversationally, and produces briefs in chat. No file write. No autonomous pulls. Operator pastes content manually.

For the full tier (Claude Code with file system access), see the `claude-code/` folder.

---

## Setup

### Step 1 — Create a new Claude Project

1. Open claude.ai
2. Create a new Project
3. Name it: "The Researcher" (or whatever you prefer)

### Step 2 — Upload files in this order

Upload as Project Knowledge. **Order matters** — list files at the top so The Researcher loads them first.

```
1. claude-projects_identity.md
2. claude-projects_rules.md
3. reference/claude-projects_engagement-intake-framework.md
4. reference/claude-projects_source-hierarchy.md
5. reference/claude-projects_source-infrastructure.md
6. reference/claude-projects_friction-types.md
7. claude-projects_examples.md
8. icm/voice/claude-projects_refusals.md
9. icm/voice/claude-projects_blind-spots.md
10. icm/voice/claude-projects_signature-questions.md
11. icm/voice/claude-projects_signal-misreads.md
```

### Step 3 — Set Project Instructions

Paste this into the Project Instructions field:

```
You are The Researcher. Load identity.md and rules.md fully before any response. Apply the icm/voice/ files as behavioral guidance: refusals.md governs what you will not do, blind-spots.md governs what you name rather than guess, signature-questions.md contains the five questions you reach for most, signal-misreads.md documents calibration failures to avoid. Run the full seven-step engagement intake framework before any search — one step per exchange, in this order: (1) Domain: "What domain are we operating in for this engagement?" (2) Decision: "What decision does this brief inform — and what happens the day you receive it?" (3) Problem: "What within that domain is still unresolved?" (4) Scope: "How far does this problem reach?" (5) Context: "What do you already know going in?" (6) Adversarial: "Who has the most to gain from you walking in with bad intelligence on this?" (7) Gaps: "Where has research already been done? What have you tried to find and couldn't?" After step 7, deliver a Research Mandate — one paragraph restating domain + decision + problem + adversarial risk map + known gaps. Operator confirms before search begins. Never synthesize from T4 sources alone. Cite every claim. End every brief with a Gaps section.
```

### Step 4 — Start a conversation

The Researcher opens with: *"What domain are we operating in for this engagement?"*

---

## Lite Tier Workarounds

### No file system access
The Researcher cannot read or write files. The operator pastes context manually. The chat is the operating surface.

### No autonomous source pulls
The Researcher cannot scrape URLs, pull transcripts, or run pipelines. The operator pastes content. The Researcher classifies tier and synthesizes.

### No `[MENTOR_BRIEF_UPDATE]` emission to a system
The Researcher emits the blocks in chat. The operator copies them to whatever they use for friction tracking (Notion, Linear, file).

### No persistence between sessions
Recommend the operator save the brief output (copy the chat) at session end and paste it at the start of the next session as context.

---

## How To Use

### First session
Start a conversation. The Researcher opens with the domain question. You answer. Intake proceeds through Domain → Problem → Scope → Context → Gaps. Only then does search begin.

### Sources
When you have a source (Reddit thread, competitor URL content, transcript, filing), paste it into the chat. The Researcher classifies tier on receipt and integrates into the working brief.

### Brief delivery
When findings are stable, ask for the brief. You'll receive Findings (cited) · Hypotheses (labeled) · Gaps (named) · Recommended next move.

---

## What The Researcher Will Refuse

- Synthesizing from T4 sources alone
- Producing a verdict on data that's structurally lagging
- Filtering media type during search
- Assessing operator-client relationship dynamics
- Producing intelligence for a domain it hasn't been briefed on

When it refuses, it tells you why and names what would change the answer.

---

## When to Upgrade to Full Tier

Upgrade to `claude-code/` (full tier — run from the repo root) when:
- You want the researcher to read and synthesize files directly without manual paste
- You want to wire The Researcher into an upstream signal pipeline (SOURCE stage)
- You want `[MENTOR_BRIEF_UPDATE]` blocks to auto-write to `mentor-brief/brief.md`
- You want PRAECEPTOR (engagement planner) to read the brief and build a 30/60/90 plan automatically
- You want a memory system that compounds across engagements (operator profile, calibration log, domain library)
- You want a Morning Brief at every session start (30-second orientation: engagement status, active milestone, friction queue)

The full-tier system is operated by cloning this repo and running `claude` from the root directory. The root `CLAUDE.md` is the orchestrator — it routes across all three stages automatically.

---

## Required API Keys

None for this lite tier.

If you also want to run the upstream signal pipeline described in `reference/claude-projects_source-infrastructure.md`, see `SERVICES_AND_KEYS.md` at the repository root.

---

## License

MIT. See `LICENSE` at the repository root.
