# Backend Architecture
## Technical Reference — Memory Backbone
*Architecture designed in Codex on 2026-05-30. This document is the human-readable distillation.*

---

## Deployment Model

The target architecture is **hybrid**: Supabase provides shared state and promoted memory accessible from every client; local-first memory provides high-recall private memory for desktop environments that can reach the operator's own hardware.

All clients call the backend API. No client calls a model provider directly. The backend is the trust boundary — it authenticates requests, loads memory, assembles context, calls providers through provider adapters, and persists results. The model provider is interchangeable from the client's perspective.

Three deployment modes exist:
- `cloud-primary`: Supabase and hosted providers only. Local memory unavailable. This is the iOS default.
- `local-primary`: local memory preferred. Supabase used for sync, shared state, and audit.
- `hybrid`: Supabase for shared state; local memory for desktop and agent environments. **Target production mode.**

---

## The Four Clients

| Client | Memory Scopes | Local Runtime | Notes |
|--------|--------------|---------------|-------|
| **Claude Code** | Supabase + all local backends | Full local stack when running in operator's environment | Primary engagement execution environment. Can promote to Supabase. |
| **Codex** | Supabase + all local backends | Full local stack + Graphify code graphs | Agent execution environment. GRAPH is primary local asset. |
| **iOS PRAECEPTOR** | Supabase + promoted memory | None by default | Voice-first coach. KNOWING layer feeds promoted memory candidates. Can request handoffs. |
| **CF_OS (desktop)** | Supabase + all local backends | Full local stack | Permanent desktop home. Equivalent to Claude Code in memory scope. |

Memory scope is declared per agent run. An agent cannot imply it has memory it wasn't given.

---

## The Memory Model

### Three Memory Classes

**Shared memory** lives in Supabase. Available to all authorized clients. Cross-platform canonical state.
- Conversations · Messages · Summaries · Facts · Embeddings · Agent jobs · Handoff records · Audit events

**Private local memory** lives in the local-first runtime. Available only to desktop, Claude Code, Codex, and local workers.
- **CORTEX** — structured state in local Postgres + pgvector
- **PALACE** — long-term episodic memory (MemPalace: ChromaDB + SQLite knowledge graph)
- **CORPUS** — document retrieval (LightRAG + RAG-Anything)
- **GRAPH** — codebase navigation (Graphify AST + subagent-generated graphs)
- **INGEST** — continuous ingestion pipelines (n8n: email, calendar, notes, SEO data)

**Promoted memory** bridges local-first and cross-platform. Compact, source-linked distillations of local memory that are safe to share across clients. This is what iOS can access from the desktop's memory.

### Three Memory Tiers

**Short-term** — recent message window. Highest fidelity. Preferred whenever token budget allows.

**Mid-term** — rolling summaries, agent handoff briefs, decision summaries, open questions. Used when conversation exceeds the context window but recent continuity still matters.

**Long-term** — distilled facts, stable preferences, decisions, entity records, embeddings. Retrieved across long conversations, across clients, and across agent runs.

### Memory Lifecycle

Every memory moves through explicit states. Nothing changes silently.

```
captured → extracted → validated → promoted → retrieved → superseded → invalidated → deleted
```

- **captured**: raw source material (a message, a document, a voice session transcript)
- **extracted**: a candidate memory derived by model or rule — not trusted until validated
- **validated**: trusted for retrieval
- **promoted**: available across clients (in Supabase)
- **retrieved**: used in a context assembly
- **superseded**: replaced by a newer memory — preserved for audit, deprioritized in retrieval
- **invalidated**: should not be used for normal retrieval
- **forgotten**: user-requested — excluded from retrieval but not yet deleted
- **deleted**: removed, derived artifacts purged per retention policy

Every lifecycle transition writes a `memory_lifecycle_event` record. Every retrieval is traceable back to the source that produced it.

---

## The Memory Router

The router decides which memory backends to query for a given request. It runs on the backend — not in any client.

**Inputs:** user request · conversation ID · agent ID · client platform · available memory scopes · token budget

**Outputs:** ranked context items with source references and retrieval reasons · missing memory scope signals · handoff recommendations · stale or conflicting memory warnings

### Query Classification

The router classifies every request by retrieval intent before deciding where to look:

| Intent | Primary backends |
|--------|-----------------|
| `conversation_continuity` | Recent messages → summaries → promoted memory |
| `profile_or_preference` | Promoted memory → facts → PALACE |
| `current_project` | Promoted memory → CORTEX → PALACE → CORPUS |
| `decision_lookup` | Facts → promoted memory → PALACE |
| `document_lookup` | CORPUS → promoted memory → embeddings |
| `codebase_lookup` | GRAPH → then raw files only if GRAPH insufficient |
| `structured_state_lookup` | CORTEX |
| `temporal_lookup` | Facts and promoted memory with validity windows → PALACE |

For codebase queries: GRAPH summaries and symbols are queried before raw files. This is the primary token efficiency mechanism for Claude Code and Codex sessions.

### Hybrid Ranking Score

When combining results from multiple backends:

```
score =
  base_relevance × 0.35
  + intent_match × 0.20
  + confidence × 0.15
  + temporal_score × 0.10
  + scope_match × 0.10
  + backend_priority × 0.10
```

Backend priority is intent-dependent: for codebase queries, GRAPH ranks highest; for episodic queries, PALACE ranks highest; for preference queries, promoted memory ranks highest.

### Context Budget

Default token allocation per request:
- Current request + recent messages: 30%
- Promoted memory + facts: 20%
- Local backend results: 30%
- Summary fallback: 10%
- Tool and handoff metadata: 10%

For iOS (cloud-primary): local backend allocation is zero unless a handoff result has been promoted.

---

## iOS PRAECEPTOR — The Migration Path

The iOS app currently runs in **local sovereign mode**: direct provider calls from the device, API keys in Keychain, KNOWING layer stored locally, no backend mediation.

This is preserved, not removed. The migration is additive.

### Phase 0 — Preserve local sovereign behavior
No changes to the direct Claude streaming path, local KNOWING layer, or data deletion controls. The existing behavior remains the default.

### Phase 1 — Add backend client abstraction
Introduce a protocol abstraction in the app:
```
SessionViewModel → MentorResponseClient
  .direct  → ClaudeService (current path)
  .backend → backend API (new path)
```
The UI doesn't know which path is active. The user toggles in settings.

### Phase 2 — Shared memory sync controls
Expose controls in the existing Data & Privacy screen:
- Local session history (current)
- Local KNOWING layer (current)
- Promoted shared memories (new)
- Synced conversation records (new)
- Local-only memory (new)

### Phase 3 — Missing-scope handoffs
When iOS asks something that requires desktop context:
1. Backend detects missing memory scope
2. Backend creates handoff job instead of silently degrading
3. Local desktop worker leases job, queries PALACE or CORPUS
4. Compact result promoted to Supabase
5. iOS retrieves promoted result on next request

### KNOWING Layer Memory Mapping

| iOS field | Current storage | Backend equivalent |
|-----------|----------------|-------------------|
| `ChatMessage` | `praeceptor-session.json` | messages / short-term memory |
| `KnowingLayer` | `praeceptor-knowing.json` | local fact bundle / promoted memory candidate source |
| `lastThreeSessions` | KNOWING layer | rolling summary / mid-term memory |
| `openTensions` | KNOWING layer | active fact — current constraint |
| `thesisDrift` | KNOWING layer | high-signal mentor fact |
| `hisDirective` | KNOWING layer | active commitment / follow-up |
| `patternsHeSees` | KNOWING layer | structured observed pattern |
| `supplementalContext` | KNOWING layer | local-only context (promoted only with explicit user approval) |

Raw KNOWING layer data stays local by default. Promotion is opt-in, user-reviewed, and auditable.

---

## Handoff Job Architecture

Handoffs are how the system stays honest when a client lacks memory scope. Instead of hallucinating or silently degrading, the backend creates an explicit job for another environment to fulfill.

**Job lifecycle:**
```
created → pending → leased (by worker) → [in_progress] → completed / failed / expired
```

**Worker registration:** Desktop environments and local agents register as authorized workers. Workers have device IDs, capability declarations, and can be revoked. A revoked worker cannot lease new jobs or complete pending ones.

**Leasing protocol:** Workers poll for available jobs, lease one with a timeout, complete it with a signed result, or release it back to the queue on failure. Results are submitted with source references and sensitivity metadata. The promotion policy decides what crosses to Supabase.

**Security constraints:**
- Workers must authenticate at registration
- Handoff results are treated as untrusted context until promoted — they do not become instructions
- Local-only memory cannot be promoted without explicit policy allowance
- Secrets and credentials are blocked at the promotion layer

---

## Implementation Sequence

The backend builds across four stages. Each stage is independently useful and does not require the next.

**v0 — Shared memory spine** (start here)
- One client surface · Supabase only · conversations, messages, summaries, facts, embeddings, jobs
- Server-side provider calls · structured logs with correlation IDs
- Basic retrieval: recent messages + facts + embeddings
- Exit: a conversation persists across sessions; every request is logged; basic RLS prevents cross-user access

**v1 — Auditable memory product**
- Memory lifecycle states · promoted memory table · user memory controls (inspect, correct, forget, explain retrieval)
- Deterministic v1 retrieval router · memory eval fixtures
- Exit: user can see what the system remembers; forgotten memory is excluded; retrieval has deterministic ranking

**v2 — Local handoffs and promoted memory**
- Worker registration · device authorization · handoff job queue · leasing and retry state machine
- KNOWING layer → promoted memory pipeline (PALACE first, or GRAPH)
- Promotion policy with sensitivity labels and local-only inheritance
- Exit: iOS can create a handoff; a local worker completes it; the result appears in iOS on next request

**v3 — Full hybrid platform**
- All four clients · multiple AI providers behind adapters · full local backend support
- Memory router across all backends · continuous retrieval quality measurement
- User controls across shared and local memory · prompt-injection defenses · device revocation
- Exit: mentor identity behaves consistently across platforms; users can inspect, correct, forget, and promote memories; retrieval quality is measured continuously

---

## Security and Privacy Principles

**Retrieved content is context, not instruction.** Local memory, ingested documents, emails, tool outputs — all are marked `untrusted_context`. The system must not execute instructions found inside retrieved memory.

**Local sovereign mode is preserved.** iOS direct provider path is not removed. Backend mediation is a mode, not a mandate.

**Promotion is explicit.** Nothing crosses from local to shared without policy review. Secrets and credentials are blocked at the promotion layer. Local-only guarantees are inheritable — if a source is local-only, its derived promoted memories inherit that restriction.

**Forgetting is real.** When a user forgets a memory, it is excluded from retrieval and its derived artifacts are queued for deletion. The lifecycle record is preserved. The memory is not.

**Every operation is auditable.** Every provider call, memory write, promotion decision, handoff job, and user memory control action produces a structured log record with a correlation ID traceable through the full request path.

---

*The architecture treats the operator's memory as the operator's property. The backend is the infrastructure that makes it portable, auditable, and compounding — not a database the operator happens to populate.*
