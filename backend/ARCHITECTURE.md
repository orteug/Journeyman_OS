# Architecture

## Purpose and Scope

This system provides reliable, auditable multi-agent operations across multiple clients using a shared backend, Supabase for shared storage and retrieval, and an optional local-first memory runtime for high-recall private memory. The orchestration layer is AI-provider agnostic: clients and agent workflows depend on backend contracts, not on a specific model vendor or model API shape.

For implementation handoff, start with [BUILD_HANDOFF.md](BUILD_HANDOFF.md).

Accepted, open, deferred, and rejected architecture decisions are tracked in [DECISION_REGISTER.md](DECISION_REGISTER.md).

The initial supported clients are:

- iOS coach client
- Desktop client
- Claude Code client

All clients call the backend API. Clients do not call model providers directly. Clients may have different memory scopes depending on platform capabilities and local runtime availability.

## System Overview

The backend is the trust boundary and orchestration layer. It is responsible for:

- Authenticating client requests.
- Authorizing access to user, conversation, and agent data.
- Loading and writing Supabase data.
- Performing retrieval and context assembly.
- Routing memory queries across shared, promoted, and local-first memory backends.
- Calling AI providers through provider adapters.
- Persisting model outputs, agent results, summaries, facts, and embeddings.
- Recording audit trails for maintenance and administrative actions.

Supabase provides the shared canonical persistence layer. It uses Postgres for relational data and `pgvector` for semantic retrieval. Core stored entities include:

- Users
- Conversations
- Messages
- Summaries
- Facts
- Embeddings
- Agent jobs and handoff records
- Memory lifecycle events
- Memory control actions
- Audit events

The local-first runtime provides private, user-controlled memory and retrieval where available. It is not required for every client, but desktop and local agent environments can use it directly.

Local-first layers:

- CORTEX: local Postgres plus `pgvector` for structured state.
- PALACE: MemPalace using ChromaDB plus SQLite knowledge graph for long-term episodic memory.
- CORPUS: LightRAG plus RAG-Anything for document graph and vector retrieval.
- GRAPH: Graphify codebase graphs for token-efficient code navigation.
- INGEST: n8n pipelines for continuous ingestion from email, calendar, notes, SEO data, and other sources.

The backend should treat Supabase and local memory systems as retrieval backends behind a common context assembly interface. Supabase remains the shared truth for cross-platform state, permissions, sync, promoted memory, and auditability. The local stack remains the high-recall, low-cost, provider-neutral memory substrate for environments that can reach it.

## Deployment Modes

The architecture supports three deployment modes:

- `cloud-primary`: Supabase and hosted providers are the main runtime. Local memory is unavailable.
- `local-primary`: local memory and local models are preferred. Supabase is used for sync, shared state, and audit where needed.
- `hybrid`: Supabase provides shared state and promoted memory everywhere; local memory is used by desktop, Claude Code, Codex, and local workers when available.

The target production architecture is `hybrid`. The implementation path should start with the smaller releases defined in [IMPLEMENTATION_SEQUENCE.md](IMPLEMENTATION_SEQUENCE.md), then grow toward hybrid operation through explicit gates.

Recommended sequence:

- v0: shared Supabase memory spine.
- v1: auditable memory product.
- v2: local handoffs and promotion.
- v3+: full hybrid local-first platform.

The full V3 platform contract is defined in [V3_HYBRID_PLATFORM.md](V3_HYBRID_PLATFORM.md).

## High-Level Flow

1. A client sends an authenticated request to the backend.
2. The backend validates authorization and creates or loads the relevant conversation/job.
3. The memory router classifies the request and determines which memory scopes are relevant and available.
4. The backend retrieves the recent message window, summaries, facts, and embeddings needed for context.
5. The backend retrieves from Supabase, promoted memory, and any available local memory backends.
6. The backend assembles a bounded context bundle with source references, validity metadata, and retrieval reasons.
7. The backend invokes one or more agent runs through model-provider adapters.
8. Agent outputs are validated against structured response contracts.
9. The backend persists messages, job results, facts, summaries, embeddings, promoted memories, lifecycle events, and audit records.
10. The backend streams progress or returns the completed result to the client.

## Backend Responsibilities

The backend owns all privileged operations:

- Service role Supabase access.
- Maintenance jobs.
- Summary compaction.
- Embedding refreshes.
- PII scrubbing.
- Provider API keys.
- Cross-agent handoffs.
- Memory promotion from local-only systems into Supabase.
- Local-memory handoff jobs when a client cannot directly access local memory.
- Memory lifecycle transitions such as validation, promotion, invalidation, forgetting, and deletion.
- User-facing memory controls.

Clients should only receive data they are authorized to view. Client-visible APIs should be stable even if model providers, prompts, retrieval logic, or worker implementations change.

Credential placement, local worker authority, and retrieval paths are defined in [TRUST_BOUNDARIES.md](TRUST_BOUNDARIES.md).

## AI Provider Abstraction

Provider integrations should be wrapped behind a narrow adapter interface. The orchestration layer should pass normalized request objects and receive normalized response objects.

Provider adapters should handle:

- Model selection.
- Request formatting.
- Streaming protocol differences.
- Timeout behavior.
- Retryable provider errors.
- Provider-specific metadata capture.

The rest of the system should treat providers as interchangeable execution backends, subject to capability differences.

## Supabase Storage and Retrieval

Supabase stores shared source-of-truth records and cross-platform retrieval artifacts.

Relational tables hold users, conversations, messages, summaries, facts, jobs, and audits. Vector tables hold embeddings linked to source records. Retrieval should preserve source lineage so that generated outputs can be audited back to the messages, facts, summaries, and documents used to produce them.

Row level security should protect user-owned data. Service role operations must remain server-side only.

The concrete schema, indexes, enums, RLS baseline, and RPC allowlist are defined in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## Memory Router

The memory router decides which memory systems to query for a given request. It should be a backend service, not client logic.

Router responsibilities:

- Classify the request type and likely memory needs.
- Determine available memory scopes for the client and agent.
- Query shared memory, promoted memory, local-first memory, or code graphs as appropriate.
- Detect missing memory scopes and create handoff jobs when needed.
- Rank results across vector, keyword, graph, temporal, and recency signals.
- Filter stale, invalidated, low-confidence, or unauthorized memories.
- Return context items with source references and retrieval reasons.

The router should support hybrid retrieval: recent messages, structured facts, semantic search, graph traversal, full-text search, and code graph navigation. It should prefer Graphify summaries and symbols before raw code reads.

The deterministic first implementation is defined in [V1_RETRIEVAL_ROUTER.md](V1_RETRIEVAL_ROUTER.md).

The V3 multi-backend router is defined in [V3_MEMORY_ROUTER.md](V3_MEMORY_ROUTER.md).

## Memory Lifecycle

Memory should move through explicit lifecycle states:

```text
captured -> extracted -> validated -> promoted -> retrieved -> superseded -> invalidated -> deleted
```

Not every memory needs every state. The important requirement is that changes are explicit, auditable, and reversible where possible.

Lifecycle rules:

- Captured data is raw source material.
- Extracted memory is model- or rule-derived and not trusted until validated.
- Validated memory can be used for retrieval.
- Promoted memory can be used across clients.
- Superseded memory is preserved for audit but should lose retrieval priority.
- Invalidated memory should not be used for normal context assembly.
- Deleted memory and its derived artifacts should be removed according to [RETENTION_POLICY.md](RETENTION_POLICY.md).

Temporal validity is required for facts and promoted memories that may change over time.

Agent job, memory lifecycle, deletion, promotion review, and provider-call state machines are defined in [STATE_MACHINES.md](STATE_MACHINES.md).

## Local-First Memory Runtime

The local-first runtime is a platform capability, not a universal dependency. Desktop, Claude Code, Codex, and local maintenance workers can access the local stack directly when running in the user's environment. iOS should not assume direct access to the local stack.

Local memory should improve:

- Offline operation.
- Provider portability.
- Token reduction.
- High-recall episodic retrieval.
- Codebase navigation without raw-file context loading.
- User control over private infrastructure.

Local memory should not silently create cross-platform inconsistency. Any agent run must declare which memory scopes were available.

## Platform Memory Access

Memory availability differs by client:

- iOS coach: Supabase, promoted memory, recent local app cache, and handoff requests.
- Desktop client: Supabase, promoted memory, and local-first memory when configured.
- Claude Code client: Supabase plus local-first memory and code graph access when running in the local environment.
- Codex/local agents: Supabase plus local-first memory, Graphify, and local files where authorized.

The same agent identity may run on multiple platforms, but identity and memory availability are separate. For example, the mentor identity can be consistent on iOS and desktop, while the iOS run may only have access to Supabase and promoted memory.

Cross-platform identity rules are defined in [CROSS_PLATFORM_IDENTITY.md](CROSS_PLATFORM_IDENTITY.md).

## Promoted Memory

Promoted memory is the bridge between local-first memory and cross-platform operation. Local systems should distill selected private memory into structured Supabase records when that memory is stable, useful across clients, and safe to share.

Examples:

- Stable user preferences.
- Current goals.
- Active projects.
- Important decisions.
- Current constraints.
- Mentor-relevant context.
- Summaries of prior coaching sessions.
- References to local-only source records.
- Confidence and provenance metadata.

Promoted memory avoids syncing every local memory artifact. It gives iOS and other cloud-primary clients enough context to behave consistently without requiring live access to the full local runtime.

Promoted memory should be temporal. A current preference, project, or constraint should include when it was observed and whether it supersedes an older memory. This prevents old context from quietly becoming false.

## Local-Memory Handoffs

When a client needs local-only context that is not available in Supabase, the backend should create a handoff job instead of pretending the context exists.

Recommended behavior:

1. The client request is evaluated against available memory scopes.
2. If local-only context is likely required, the backend creates a retrieval or analysis handoff job.
3. An authorized desktop/local worker leases the job, queries PALACE, CORPUS, GRAPH, or CORTEX, and submits a signed result to the backend.
4. The original client can continue with a provisional answer, wait for the handoff, or receive a follow-up when the promoted result is ready.

A live local memory gateway may be added later, but it should not be a first requirement for iOS.

The implementable handoff queue, leasing, retry, cancellation, and worker registration contract is defined in [HANDOFF_STATE_MACHINE.md](HANDOFF_STATE_MACHINE.md).

## User Memory Controls

Users need direct control over memory. The product should expose enough controls to inspect, correct, promote, localize, and delete memory.

Core controls:

- Show what the system remembers.
- Explain why a memory was retrieved.
- Forget this memory.
- Correct this memory.
- Keep this memory local only.
- Promote this memory to shared/Supabase memory.
- Sync this memory to iOS.
- Show source references.

Memory controls should write audit records and lifecycle events.

Forgetting, deletion, supersession, backups, local deletion, and eval fixture retention are defined in [RETENTION_POLICY.md](RETENTION_POLICY.md).

## Operational Concerns

All request and worker flows should use structured logs. Every externally visible operation should carry a `correlation_id` from ingress through retrieval, provider calls, agent handoffs, persistence, and streaming responses.

Operational requirements:

- Use structured logs with fields for `correlation_id`, `user_id`, `conversation_id`, `job_id`, `agent_id`, action, status, latency, and error class.
- Use retries with exponential backoff and jitter for transient provider, database, and network failures.
- Use idempotency keys for mutation jobs such as message creation, summarization, embedding refreshes, compaction, and PII scrubbing.
- Use trace spans for retrieval, context assembly, model calls, tool calls, persistence, and agent handoffs.
- Persist enough metadata to reconstruct what happened during an agent run without storing private chain-of-thought.
- Track retrieval quality, stale memory usage, false recall, and missing-memory handoff rates.

V3 operational requirements are defined in [OPERATIONS.md](OPERATIONS.md).

## Reliability Principles

The system should prefer explicit state transitions over implicit side effects. Agent jobs should be durable enough to resume or safely retry after process failure. Mutation jobs should be idempotent. Maintenance workers should be able to process the same request more than once without corrupting user data.

## Initial Non-Goals

The first version does not need to support direct client-to-provider calls, provider-specific client behavior, unmanaged background mutations, unbounded conversation context, local-first memory runtime integration, handoff workers, or mandatory live access from iOS to the local memory stack. It should optimize for a clear backend contract, durable shared state, explicit memory scopes, and auditable operations while preserving the v3+ path.
