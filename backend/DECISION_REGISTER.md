# Decision Register

## Purpose

This document records which architecture decisions are accepted, which are open, and which are deliberately deferred. Claude Code should use this to avoid accidentally making major product or infrastructure decisions during implementation.

## Decision Statuses

Allowed statuses:

- `accepted`
- `open`
- `deferred`
- `rejected`
- `superseded`

## Accepted Decisions

### D001: Backend-Mediated Provider Calls

Status: `accepted`

Decision:

- Clients call the backend API.
- Clients do not call model providers directly.
- Provider keys remain server-side.

Reason:

- Preserves provider portability, auditability, authorization, and operational control.

### D002: Supabase Is Shared Canonical State

Status: `accepted`

Decision:

- Supabase stores shared conversations, messages, summaries, facts, promoted memories, embeddings, jobs, handoffs, lifecycle events, controls, and audits.

Reason:

- Provides cross-platform availability, RLS, Postgres semantics, and pgvector retrieval.

### D003: Local Memory Is Private By Default

Status: `accepted`

Decision:

- CORTEX, PALACE, CORPUS, GRAPH, and INGEST outputs are local-first memory.
- Raw local memory is not synced to Supabase by default.

Reason:

- Preserves local sovereignty and avoids unnecessary private-data exposure.

### D004: Promoted Memory Bridges Local And Shared Context

Status: `accepted`

Decision:

- Local memory becomes cross-platform only through promoted, compact, source-linked memory records.

Reason:

- Lets iOS and cloud-primary clients benefit from local context without requiring live local access.

### D005: Deferred Handoffs Before Live Local Gateway

Status: `accepted`

Decision:

- V2 uses local worker handoffs.
- Live local gateway is optional V3+ behavior.

Reason:

- Handoffs are easier to secure, audit, retry, and operate than inbound live local access.

### D006: Local Workers Do Not Receive Supabase Service Role Keys By Default

Status: `accepted`

Decision:

- Local workers authenticate to backend.
- Local workers submit signed/authenticated results.
- Backend performs Supabase writes.

Reason:

- Keeps service role credentials out of local runtime and centralizes authorization/audit.

### D007: Retrieved Content Is Context, Not Instruction

Status: `accepted`

Decision:

- Retrieved memory, documents, code, email, tool outputs, and local worker results are untrusted context unless explicitly promoted by user or backend policy.

Reason:

- Prevents prompt injection and tool misuse.

### D008: V0/V1 Ship Before V2/V3

Status: `accepted`

Decision:

- Implement shared memory and auditable memory before local workers and full hybrid routing.

Reason:

- Reduces implementation risk while preserving the V3+ architecture path.

### D009: Existing iOS Local-Sovereign Mode Is Preserved Until Replaced Deliberately

Status: `accepted`

Decision:

- The existing Praeceptor iOS app may continue direct device-to-provider calls with user-supplied keys while backend-mediated shared-memory mode is designed.
- Backend mediation is required for hosted shared-memory mode, not automatically required for every local-sovereign iOS session.

Reason:

- The current iOS app intentionally supports data sovereignty, local KNOWING storage, Keychain-held user keys, and local deletion controls.

## Open Decisions

### O001: Target Backend Runtime

Status: `open`

Question:

- What backend runtime and framework does the target repository use?

Resolution source:

- Target repo discovery.

Affected docs:

- `API_CONTRACTS.md`
- `LOCAL_DEV.md`
- `BUILD_HANDOFF.md`

### O002: Migration Tooling

Status: `open`

Question:

- Will schema changes be implemented through Supabase SQL migrations, Drizzle, Prisma, another migration system, or existing project tooling?

Resolution source:

- Target repo discovery.

Affected docs:

- `DATABASE_SCHEMA.md`
- `BUILD_HANDOFF.md`

### O003: Embedding Model And Dimension

Status: `open`

Question:

- Which embedding model and vector dimension should be used?

Default draft assumption:

- `vector(1536)` appears in `DATABASE_SCHEMA.md` as an implementation placeholder.

Resolution source:

- Target repo provider strategy and cost/performance requirements.

Affected docs:

- `DATABASE_SCHEMA.md`
- `V1_RETRIEVAL_ROUTER.md`
- `MEMORY_EVAL_FIXTURES.md`

### O004: SSE vs WebSockets

Status: `open`

Question:

- Should streaming use server-sent events, WebSockets, or the target repo's existing streaming pattern?

Default draft assumption:

- SSE is the first contract in `API_CONTRACTS.md`.

Resolution source:

- Target repo client and backend capabilities.

Affected docs:

- `API_CONTRACTS.md`
- `LOCAL_DEV.md`

### O005: Organization/Workspace Model

Status: `open`

Question:

- Is this single-user first, or does the target product need organizations, workspaces, teams, or shared projects?

Default draft assumption:

- User-scoped first.

Resolution source:

- Product requirements and target repo data model.

Affected docs:

- `DATABASE_SCHEMA.md`
- `SECURITY_APPENDIX.md`
- `TRUST_BOUNDARIES.md`

### O006: Provider Adapter Shape

Status: `open`

Question:

- Does the target repo already have provider adapters, or should a new provider abstraction be introduced?

Resolution source:

- Target repo discovery.

Affected docs:

- `ARCHITECTURE.md`
- `API_CONTRACTS.md`
- `STATE_MACHINES.md`

### O007: Local Backend Integration Order

Status: `open`

Question:

- Which local memory backend should V2 integrate first: PALACE, GRAPH, CORPUS, or CORTEX?

Recommendation:

- Use PALACE if the first use case is mentor continuity.
- Use GRAPH if the first use case is Claude Code/Codex codebase work.

Resolution source:

- Product priority for first local-memory workflow.

Affected docs:

- `LOCAL_WORKER_PROTOCOL.md`
- `V3_MEMORY_ROUTER.md`
- `IMPLEMENTATION_SEQUENCE.md`

### O008: Backup Retention Window

Status: `open`

Question:

- How long do backups retain deleted data, and how are deletion tombstones replayed after restore?

Resolution source:

- Deployment platform and compliance posture.

Affected docs:

- `RETENTION_POLICY.md`
- `SECURITY.md`

### O009: Memory Control UI Surface

Status: `open`

Question:

- Where will users inspect, correct, forget, approve promotion, and mark memories local-only?

Resolution source:

- Target client design.

Affected docs:

- `USER_MEMORY_CONTROLS.md`
- `API_CONTRACTS.md`

### O010: Eval Runner Location

Status: `open`

Question:

- Should memory evals run in unit tests, integration tests, CI, a worker command, or a separate eval harness?

Resolution source:

- Target repo test strategy.

Affected docs:

- `MEMORY_EVALS.md`
- `MEMORY_EVAL_FIXTURES.md`
- `LOCAL_DEV.md`

### O011: iOS Backend Mode

Status: `open`

Question:

- Should the Praeceptor iOS app support local-sovereign mode only, hosted shared-memory mode only, or both selectable modes?

Default draft assumption:

- Preserve local-sovereign mode and add backend-mediated mode only through an explicit app-side abstraction.

Resolution source:

- Product decision and iOS target-repo implementation plan.

Affected docs:

- `TARGET_IOS_ALIGNMENT.md`
- `API_CONTRACTS.md`
- `TRUST_BOUNDARIES.md`
- `USER_MEMORY_CONTROLS.md`

## Deferred Decisions

### F001: Live Local Gateway

Status: `deferred`

Decision:

- Do not build until V2 handoffs are stable and a low-latency local retrieval need is proven.

### F002: Fully Local Model Inference

Status: `deferred`

Decision:

- Local model inference may support maintenance transforms or selected agent runs later, but is not required for v0, v1, or v2.

### F003: Peer-To-Peer Or Multi-Device Local Sync

Status: `deferred`

Decision:

- Not required for the initial hybrid platform. Supabase plus promoted memory is the cross-platform bridge.

### F004: Learned Retrieval Ranking

Status: `deferred`

Decision:

- Start with deterministic v1 and v3 ranking. Consider learned ranking only after eval baselines and sufficient usage data.

### F005: Organization-Scoped Workers

Status: `deferred`

Decision:

- Workers are user-scoped until product requirements demand organization/workspace-scoped local workers.

## Rejected Decisions

### R001: Direct Client-To-Provider Calls

Status: `rejected`

Reason:

- Breaks provider abstraction, auditability, centralized auth, cost controls, and backend-mediated memory assembly.

### R002: Raw Local Memory Sync By Default

Status: `rejected`

Reason:

- Violates local-first privacy goals and creates unnecessary data exposure.

### R003: Supabase Service Role In Local Workers By Default

Status: `rejected`

Reason:

- Expands blast radius and bypasses backend authorization/audit controls.

## Decision Update Process

When Claude Code or another implementer resolves an open decision:

1. Update this file.
2. Record the selected option.
3. Explain why the target repo requires or supports it.
4. Update affected docs.
5. Preserve the V3+ direction unless the strategy is deliberately changed.

Example update:

```markdown
### O004: SSE vs WebSockets

Status: `accepted`

Decision:

- Use WebSockets because the target desktop client already has a WebSocket event channel.

Updated docs:

- `API_CONTRACTS.md`
- `LOCAL_DEV.md`
```
