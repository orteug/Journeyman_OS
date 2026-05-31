# Implementation Sequence

## Purpose

The target architecture is v3+. The implementation path should still start with narrow, testable releases. Each version must preserve the long-term direction without requiring every local-first capability on day one.

## Version Strategy

The system should advance through four stages:

- v0: prove shared backend memory with one client.
- v1: make memory auditable and controllable.
- v2: add local worker handoffs and promoted memory.
- v3+: operate as a hybrid local-first, cross-platform memory platform.

The design goal is not to shrink the ambition. It is to make each stage independently useful and hard to break.

## v0: Shared Memory Spine

Goal: build the smallest reliable backend-mediated memory system.

Scope:

- One client surface.
- One AI provider adapter.
- Supabase for users, conversations, messages, summaries, facts, embeddings, jobs, and audit events.
- Basic retrieval over recent messages, summaries, facts, and embeddings.
- Server-side provider calls only.
- Structured logs with correlation ids.
- Basic maintenance worker for summarization and embedding refresh.

Out of scope:

- Local-first memory runtime.
- Handoff jobs.
- Live local memory gateway.
- Multi-provider routing.
- Full user memory control UI.
- INGEST pipelines.

Exit criteria:

- A user can create a conversation, send messages, receive model responses, and retrieve prior context through Supabase.
- Every request has a correlation id.
- Every provider call and mutation is logged.
- Basic RLS policies prevent cross-user access.
- Summarization and embedding refresh are idempotent.

## v1: Auditable Memory Product

Goal: make memory inspectable, correctable, and safe enough for real use.

Scope:

- Memory lifecycle states.
- Promoted memory table, even if populated only from Supabase-derived data.
- User memory controls for inspect, correct, forget, and explain retrieval.
- Retention policy for shared Supabase data.
- Deterministic v1 retrieval router.
- Memory eval fixtures and baseline metrics.
- API status codes, pagination, idempotency behavior, SSE events, and job lifecycle endpoints.

Out of scope:

- Automated promotion from PALACE/CORPUS/GRAPH.
- Local worker fleet.
- Live local gateway.
- Full local-first ingestion.

Exit criteria:

- A user can inspect what the system remembers.
- A user can correct or forget memory.
- Forgotten memory is excluded from retrieval.
- The retrieval router has deterministic ranking and token-budget behavior.
- Memory evals can fail a regression.

## v2: Local Handoffs and Promotion

Goal: connect local-first memory without making mobile clients depend on live local availability.

Scope:

- Worker registration.
- Device authorization.
- Handoff job queue.
- Leasing and retry state machine.
- Local worker that can query one local memory backend first.
- Signed handoff completion.
- Promotion policy with sensitivity labels and local-only inheritance.
- Redaction rules for source references.

Recommended first local backend:

- PALACE for episodic memory, or GRAPH for code navigation.

Do not integrate all local layers at once.

Out of scope:

- Live inbound local memory gateway.
- Full CORTEX/PALACE/CORPUS/GRAPH/INGEST integration.
- Automated broad promotion.

Exit criteria:

- iOS or cloud-primary clients can create a handoff for unavailable local memory.
- A local worker can lease, complete, fail, retry, and expire handoff jobs.
- The worker can write a promoted memory with source references and sensitivity metadata.
- The original client can use the promoted memory on a later request.

## v3: Hybrid Local-First Platform

Goal: operate the full hybrid architecture across clients and memory scopes.

Scope:

- Multiple clients: iOS, desktop, Claude Code, Codex.
- Multiple AI providers behind provider adapters.
- Multiple local memory backends: CORTEX, PALACE, CORPUS, GRAPH.
- INGEST pipelines with source classification.
- Memory router across shared, promoted, local, graph, and document retrieval.
- User controls across shared and local memory.
- Local-only guarantees.
- Prompt-injection defenses for ingested content.
- Device revocation.
- Expanded eval suite.

Exit criteria:

- The mentor identity behaves consistently across platforms while declaring available memory scopes.
- Desktop/Codex can use full local memory.
- iOS can use promoted memory and request handoffs when local-only context is needed.
- Users can inspect, correct, forget, promote, and keep-local-only memories.
- Retrieval quality and stale-memory usage are continuously measured.

## v3+ Expansion

v3+ should focus on quality, scale, and sovereignty:

- Live local memory gateway for low-latency local retrieval when explicitly enabled.
- Local model inference for maintenance transforms and selected agent runs.
- Multi-device local replicas.
- Point-in-time temporal memory queries.
- Rich memory control UI.
- Advanced graph retrieval across documents, code, and episodic memory.
- Fine-grained permission grants across personal, project, and organization scopes.

## Build Order

Recommended order:

1. Supabase schema and RLS.
2. Conversation and message API.
3. Provider adapter and response streaming.
4. Basic retrieval router.
5. Maintenance worker for summaries and embeddings.
6. Memory lifecycle and promoted memory.
7. User memory controls.
8. Memory evals.
9. Handoff job system.
10. Local worker for one local backend.
11. Promotion policy and redaction.
12. Additional local backends.
13. Live local gateway only if handoffs are too slow.

## Non-Negotiable Gates

Do not advance to local handoffs until:

- Supabase RLS is tested.
- Service role usage is restricted.
- Idempotency behavior is implemented.
- Deletion/forgetting semantics are defined.
- Retrieval evals exist.

Do not advance to live local gateway until:

- Device authorization exists.
- Worker registration exists.
- Handoff security has been tested.
- Prompt-injection controls exist.
- Local-only promotion rules are enforced.
