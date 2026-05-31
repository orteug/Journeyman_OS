# Local-First Memory

## Purpose

The local-first memory runtime provides private, user-controlled memory that can operate without cloud storage or model-provider availability. It exists to reduce token usage, prevent context loss, preserve AI-provider portability, and support offline operation.

This runtime complements Supabase. It does not replace Supabase as the shared coordination, authorization, sync, and audit layer. The staged path from shared memory to full hybrid operation is defined in [IMPLEMENTATION_SEQUENCE.md](IMPLEMENTATION_SEQUENCE.md).

## Core Principle

Use Supabase for shared truth and cross-platform interoperability. Use the local-first stack for sovereign memory, high-recall retrieval, local documents, code graphs, and provider-neutral context assembly.

```text
Supabase = shared truth, permissions, sync, promoted memory, audit
Local stack = private memory, offline retrieval, token reduction, local control
```

## Five Layers

### Layer 1: CORTEX

CORTEX is local Postgres plus `pgvector` for structured state.

It stores data with clear schemas:

- Tasks.
- Financials.
- Contacts.
- Calendar events.
- Structured project state.

CORTEX maps cleanly to Supabase because both are Postgres-based. Supabase can hold the shared/canonical subset while CORTEX holds local-first structured state.

### Layer 2: PALACE

PALACE is MemPalace using ChromaDB plus a SQLite knowledge graph for long-term episodic memory.

It stores:

- Conversations.
- Decisions.
- Historical context.
- Past work artifacts.
- Episodic memories.

PALACE should remain specialized. Do not force all of PALACE into Supabase. Promote only stable, useful, source-linked distillations.

### Layer 3: CORPUS

CORPUS is LightRAG plus RAG-Anything for document graph and vector retrieval.

It handles:

- Document search.
- Knowledge retrieval.
- Cross-document relationships.
- Questions that require connecting concepts across files.

Supabase may store document metadata and promoted summaries. CORPUS should own local document retrieval.

### Layer 4: GRAPH

GRAPH is Graphify for codebase navigation using AST and subagent-generated graphs.

It handles:

- Codebase structure.
- God nodes and communities.
- Symbol navigation.
- Token-efficient architecture understanding.

Agents should prefer GRAPH before reading raw code files when answering architecture or codebase questions.

### Layer 5: INGEST

INGEST is n8n-based continuous ingestion.

It brings in:

- Gmail.
- Calendar.
- Meeting notes.
- SEO data.
- Obsidian sync.
- Other personal or business data streams.

INGEST should feed local systems first and promote only selected derived memory into Supabase.

## Cross-Platform Model

Not every client can access every memory layer.

```text
iOS:
  Supabase
  promoted memory
  small encrypted app cache
  handoff requests

Desktop:
  Supabase
  promoted memory
  local-first memory when configured

Claude Code/Codex:
  Supabase
  promoted memory
  local-first memory
  Graphify
  authorized local files
```

The mentor identity can be consistent across platforms, but its memory scope differs by runtime.

## Promoted Memory

Promoted memory is the bridge from local-first memory to cross-platform memory.

Promote:

- Stable user preferences.
- Current goals.
- Active projects.
- Important decisions.
- Current constraints.
- Mentor-relevant context.
- Summaries of prior coaching sessions.
- Source-linked references to local-only records.

Do not promote:

- Raw private archives by default.
- Full document bodies.
- Full code graphs.
- Secrets.
- Credentials.
- Low-confidence inferred facts.
- Temporary scratch state.

Promotion should preserve:

- Source system.
- Source references.
- Confidence.
- Timestamp.
- Actor.
- Correlation id.

Promotion policy, sensitivity labels, consent gates, and redaction rules are defined in [PROMOTION_POLICY.md](PROMOTION_POLICY.md).

## Handoffs

If a cloud-primary client needs local-only memory, it should create a handoff job.

Example:

```text
iOS mentor
  -> backend
  -> handoff job
  -> local worker queries PALACE/CORPUS/GRAPH/CORTEX
  -> local worker writes promoted memory to Supabase
  -> iOS mentor can use the promoted result
```

This avoids making iOS depend on live Mac Mini access. It also keeps local memory access auditable.

The concrete handoff queue and worker protocol is defined in [HANDOFF_STATE_MACHINE.md](HANDOFF_STATE_MACHINE.md).

The local worker runtime contract is defined in [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md).

## Live Local Gateway

A live local memory gateway is optional and should not be required in the first version.

If added, it must provide:

- Strong authentication.
- Request allowlists.
- Query limits.
- Rate limits.
- Audit logging.
- Redaction.
- Network egress controls.
- Clear user control over whether the gateway is online.

The default path should remain promoted memory plus deferred handoffs.

## Retrieval Contract

Every retrieval result should normalize to a common shape:

```json
{
  "source_system": "palace",
  "source_type": "drawer",
  "source_id": "local-ref",
  "content": "Retrieved context or summary.",
  "score": 0.91,
  "confidence": 0.88,
  "retrieval_reason": "Graph and vector match for active project context.",
  "observed_at": "timestamp",
  "valid_from": "timestamp",
  "valid_to": null,
  "status": "validated",
  "metadata": {}
}
```

The context assembler can then mix Supabase, promoted memory, PALACE, CORPUS, CORTEX, and GRAPH results without binding agents to one storage system.

## Memory Lifecycle

Local memory should move through explicit states:

```text
captured -> extracted -> validated -> promoted -> retrieved -> superseded -> invalidated -> deleted
```

This matters because personal context changes. Goals, projects, preferences, and constraints should not be treated as timeless facts. Local systems should preserve `observed_at`, `valid_from`, `valid_to`, confidence, and supersession links where possible.

## User Control Surface

The system should let the user inspect and control memory:

- What do you remember about me?
- Why did you retrieve this?
- Correct this.
- Forget this.
- Keep this local only.
- Promote this to shared memory.
- Sync this to iOS.
- Show source.

These controls should be backed by lifecycle events and audit records.

## Evaluation

Local-first memory should be measured continuously.

Minimum metrics:

- Recall accuracy.
- False recall rate.
- Stale fact usage.
- Source citation accuracy.
- Retrieval latency.
- Token cost reduction.
- Missing-memory handoff rate.
- Promotion quality.

The current PALACE LongMemEval result should be treated as a baseline, not a finish line. Evals should include single-hop, multi-hop, temporal, source-citation, and platform-scope tests.

## Recommended First Version

Use a hybrid-first architecture:

1. Supabase remains canonical for shared conversations, promoted memory, handoffs, permissions, and audit.
2. The local stack remains authoritative for private memory and local retrieval.
3. iOS uses Supabase and promoted memory.
4. Desktop/Codex use full local memory where available.
5. Missing local memory creates a handoff instead of producing silent context loss.

This keeps the system coherent across platforms while preserving the local-first benefits that matter: control, offline operation, token reduction, and AI-provider portability.

The first implementation should not attempt every local layer at once. Use [IMPLEMENTATION_SEQUENCE.md](IMPLEMENTATION_SEQUENCE.md) to select the current stage and defer later-stage local integrations until their gates are satisfied.

The full V3 hybrid platform behavior is defined in [V3_HYBRID_PLATFORM.md](V3_HYBRID_PLATFORM.md).
