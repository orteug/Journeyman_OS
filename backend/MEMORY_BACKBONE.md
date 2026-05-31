# Memory Backbone
## The Layer That Makes the Flywheel Compound
*Not a feature — the infrastructure that converts ephemeral conversations into accumulated operator intelligence.*

---

## The Problem

The flywheel runs across four environments.

**Claude Code** is where this submission lives — where the flywheel executes, engagements run, and the full local memory stack (PALACE, CORPUS, GRAPH, CORTEX) accumulates. **Codex** is where AI agents run against local files and produce structured outputs. **iOS PRAECEPTOR** is the voice-first coach — the surface the operator touches every morning, where friction surfaces in real-time and the KNOWING layer captures it in structured form. **CF_OS** is the coming desktop client, a permanent home for the system outside any one AI provider.

Each of these environments has memory. None of them share it.

Claude Code knows which domain the operator has been working in and what signals proved accurate. iOS PRAECEPTOR knows the operator's open tensions, drift patterns, and unresolved commitments — because the KNOWING layer extracts them from every voice session. Codex has run agents against the local corpus and produced outputs. None of that crosses environments.

The result: every session starts with the operator re-explaining context the system already has in another window. The flywheel resets instead of compounding. The RESEARCHER runs intake it's already run. PRAECEPTOR plans without the friction data the iOS session captured. The calibration log from the last engagement never reaches the next one.

Without a memory backbone, the flywheel is a process — well-structured, but stateless. With it, the flywheel becomes a system — one that gets more precise with every engagement the operator runs.

---

## What the Memory Backbone Is

The memory backbone is a three-layer architecture that connects all four client environments under a single shared intelligence layer.

**Layer 1 — Local-first memory.** The high-recall, private memory layer running on the operator's own hardware. Five systems: CORTEX (structured state, local Postgres), PALACE (long-term episodic memory, the operator's working history), CORPUS (document retrieval, the local knowledge index), GRAPH (codebase graphs, code navigation without raw file loading), INGEST (continuous ingestion from email, calendar, notes). Claude Code, Codex, and the desktop client have full access to this layer. iOS does not — by design.

**Layer 2 — Supabase shared spine.** The cross-platform canonical layer. Conversations, messages, summaries, facts, promoted memories, handoff jobs, and audit records live here. Every client can read and write to this layer. It is the only layer iOS can access by default. It is the coordination surface for everything else.

**Layer 3 — Promoted memory.** The bridge between local-first and cross-platform. When local memory contains something compact, stable, and useful across environments — a key decision, an active project constraint, a recurring operator friction pattern — it is promoted into Supabase. The full local record stays private. A compact, source-linked distillation crosses to shared memory. This is what allows iOS to benefit from context that only exists in the desktop environment.

The backend API sits between these layers and all clients. No client calls an AI provider directly in this architecture. The backend mediates every request, authenticates it, routes retrieval, assembles context, calls the model, and persists the result. The clients see stable contracts. The intelligence layer evolves underneath.

---

## The KNOWING Layer as Promoted Memory

The iOS PRAECEPTOR app already does something important without a backend: it extracts structured facts from voice sessions and stores them locally in the KNOWING layer.

After three user turns, a Haiku call updates the KNOWING layer. The fields it populates:

| KNOWING field | What it captures | Promoted memory type |
|--------------|-----------------|---------------------|
| `openTensions` | Unresolved friction the operator is carrying | Active fact — current constraint |
| `thesisDrift` | Where the operator is diverging from their own principles | High-signal pattern — mentor context |
| `hisDirective` | Active commitments and follow-ups from prior sessions | Current goal — cross-session continuity |
| `patternsHeSees` | Recurring behaviors the coach has named | Structured observation — growth edge |
| `supplementalContext` | Background context the operator has surfaced | Local-only reference context |
| `lastThreeSessions` | Rolling session summaries | Mid-term memory — episodic summary |

Every one of these fields is a promoted memory candidate. When the iOS session ends, the KNOWING layer has captured the friction, the patterns, the open commitments. In the current architecture, that data stays on the device.

With the memory backbone in place: the KNOWING layer is the input to the promotion pipeline. After review (the operator decides what crosses), compact promoted memories flow to Supabase. The next time the operator opens Claude Code and runs a calibration session or starts a new engagement, the RESEARCHER and PRAECEPTOR already know what iOS captured. The systems compare notes. The operator doesn't have to re-explain where they are.

---

## Handoff Jobs

iOS cannot reach the local memory stack directly. By design — the local stack runs on the operator's hardware, not on a mobile connection. This is a feature, not a limitation.

But the operator may need context that only exists locally. They ask PRAECEPTOR on iOS: "What did I learn from the HVAC engagement last quarter?" That context lives in PALACE — the local episodic memory layer on the desktop. It hasn't been promoted to Supabase yet. It may never be promoted in full.

Without handoffs, the system has two bad options: pretend the context exists (hallucinate), or silently degrade (produce a worse answer without telling the operator why).

With handoffs, there is a third option:

1. The backend detects the missing memory scope.
2. It creates a handoff job: "iOS session is asking for HVAC engagement history. Fetch from PALACE."
3. A local worker — Claude Code, Codex, or a background daemon — leases the job.
4. The worker queries PALACE, retrieves the relevant episodic context, and produces a compact promoted result.
5. The result is submitted back to the backend with source references and a sensitivity review.
6. The backend applies the promotion policy. The result flows to Supabase.
7. iOS gets the answer on the next request — or receives a notification that the handoff completed.

The operator is told explicitly: "This answer came from desktop memory via handoff. Retrieved from PALACE." The scope limitation is surfaced, not hidden. The system stays honest about what it knew at the time of the answer.

---

## Cross-Platform Identity

PRAECEPTOR on iOS is the same `mentor` identity as PRAECEPTOR in Claude Code. The character layer — the ICM system prompt, the behavioral constraints, the refusals, the signature questions — is identical across environments. What differs is memory scope.

Each agent run declares its available memory:

```
iOS run:
  agent_id: mentor
  memory_scope: [supabase, promoted_memory]
  local_memory_available: false
  can_request_handoff: true

Desktop/Claude Code run:
  agent_id: mentor
  memory_scope: [supabase, promoted_memory, palace, corpus, graph, cortex]
  local_memory_available: true
  can_promote_memory: true
```

The mentor behaves consistently — same refusals, same signature questions, same diagnostic approach. The depth varies by platform because the memory depth varies. The operator experiences continuity, not capability whiplash.

When memory scope affects answer quality — when iOS can't answer something because the context is local-only — the system says so. "This question may have better context in your desktop session. A handoff has been created." Not a wall. A disclosure and a plan.

---

## The Build Path

This backend is not built in one release. It grows from a minimal shared spine to a full hybrid platform.

**v0 — Shared memory spine.** One client. Supabase only. Conversations persist. Every request has a correlation ID. Provider calls are server-side. The operator can close Claude Code and come back to a conversation that still knows where it left off. This alone is a step change from the current stateless system.

**v1 — Auditable memory.** The operator can see what the system remembers. Inspect it. Correct it. Forget it. Memory moves through explicit lifecycle states: captured → extracted → validated → promoted → retrieved → superseded → invalidated → deleted. Nothing disappears silently. Every change is auditable. This is the product distinction that separates this from a chatbot with a context window.

**v2 — Local handoffs and promoted memory.** The KNOWING layer feeds Supabase. Desktop ↔ iOS memory bridge is live. iOS can request local context; a local worker delivers it as a promoted memory. The first local backend integrated is PALACE — episodic memory for the operator's engagement history, the thing iOS most often needs from desktop.

**v3 — Full hybrid platform.** All four clients. Full local memory router. PALACE, CORPUS, GRAPH, CORTEX available to desktop environments. Continuous retrieval quality measurement. The operator can ask the system to show its sources, dispute a memory, or keep something local-only permanently. The system that built the engagement knows more about the operator than any single AI session could.

---

## What This Makes Possible

After 3 engagements run through the full flywheel with the memory backbone active:

- The domain library has real T1 source indexes — the RESEARCHER doesn't rebuild the source map from scratch
- The source quality log is calibrated — weak sources are skipped; high-signal sources are hit first
- The operator profile has friction patterns — PRAECEPTOR anticipates before the operator arrives
- The KNOWING layer from iOS has informed the desktop sessions — the operator's open tensions are context, not context the operator had to re-state

After 5 engagements across different domains:

- Cross-domain patterns are visible — what the operator consistently gets right, what they miss
- Growth edges are documented and compounding — PRAECEPTOR plans around the gaps the previous engagements revealed
- The calibration log has a track record — the system knows what it was wrong about and why

This is not a feature. It is the layer that converts a collection of well-built components into a system that compounds. The flywheel was always the mechanism. The memory backbone is what makes it spin faster over time instead of returning to zero.

---

*SOURCE collects. THE RESEARCHER filters. KNOWLEDGE files. PRAECEPTOR develops. EXECUTE deploys. Calibration compounds. The memory backbone is what makes each of those stages remember what the last one knew.*
