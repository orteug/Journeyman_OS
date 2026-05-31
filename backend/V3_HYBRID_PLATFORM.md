# V3 Hybrid Platform

## Purpose

V3 is the first version where the system behaves as a full hybrid local-first platform across clients. Supabase remains the shared coordination and audit layer. Local-first memory becomes a first-class retrieval substrate through workers, adapters, and optional live gateway access.

V3 is not a rewrite. It extends the v0 shared memory spine, v1 auditable memory product, and v2 local handoff bridge.

## V3 Goals

V3 should deliver:

- Consistent agent identities across iOS, desktop, Claude Code, and Codex.
- Supabase shared memory across all clients.
- Local-first memory access where available.
- Promotion from local memory into shared memory.
- Local-only guarantees.
- Multi-backend memory routing.
- User-visible memory controls.
- Prompt-injection defenses.
- Device revocation.
- Continuous retrieval quality measurement.

## V3 Non-Goals

V3 does not require:

- Fully local model inference for all agent runs.
- Peer-to-peer memory sync.
- Multi-user organization permissions unless the target product requires it.
- Automatic promotion from all local sources.
- Live local gateway as the default path.

## Required Capabilities

### Cross-Platform Agent Identity

Agent identity must be stable across platforms.

Example:

```json
{
  "agent_id": "mentor",
  "identity_version": "2026-05-30",
  "client_platform": "ios",
  "memory_scope": ["supabase", "promoted_memory"],
  "local_memory_available": false
}
```

The same `mentor` identity may run on desktop with broader memory:

```json
{
  "agent_id": "mentor",
  "identity_version": "2026-05-30",
  "client_platform": "desktop",
  "memory_scope": ["supabase", "promoted_memory", "palace", "corpus", "graph", "cortex"],
  "local_memory_available": true
}
```

The agent should act consistently, but must not imply it has memory scopes that are unavailable in the current runtime.

### Multi-Backend Memory Router

The router must support:

- Supabase recent messages.
- Supabase summaries.
- Supabase facts.
- Supabase promoted memories.
- Supabase embeddings.
- PALACE episodic memory.
- CORPUS document retrieval.
- GRAPH code graph retrieval.
- CORTEX structured state.

The v3 router is defined in [V3_MEMORY_ROUTER.md](V3_MEMORY_ROUTER.md).

### Local Worker Fleet

V3 may support multiple workers per user.

Examples:

- Mac Mini memory worker.
- Desktop app worker.
- Codex local worker.
- CI worker for code graph refresh.

Workers must follow [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md).

### Optional Live Local Gateway

The live local gateway is optional in V3. Use it only when deferred handoffs are too slow for an important workflow.

Gateway requirements:

- Explicit user enablement.
- Mutual authentication.
- Request allowlist.
- Query limits.
- Rate limits.
- Redaction.
- Audit logs.
- Timeout fallback to handoff.
- Device revocation.

Gateway behavior should be treated as privileged local access, not ordinary cloud retrieval.

### Promotion Governance

Promotion must follow [PROMOTION_POLICY.md](PROMOTION_POLICY.md).

V3 should add:

- User-visible promotion review queue.
- Bulk approval/rejection for low-risk memory.
- Local-only source inheritance.
- Sensitivity reclassification.
- Redacted source labels.

### Memory Controls

Users should be able to inspect and control memory across shared and local surfaces.

Required V3 controls:

- Inspect shared memory.
- Inspect promoted memory.
- Inspect recent retrieved memories.
- Inspect pending handoffs.
- Approve or reject promotions.
- Correct shared memory.
- Forget shared memory.
- Mark source local-only.
- Revoke local worker.

Local raw source inspection may require the local runtime to be available.

### Security and Prompt-Injection Controls

V3 must treat local and ingested content as untrusted context. The controls in [SECURITY_APPENDIX.md](SECURITY_APPENDIX.md) are required before live gateway or multi-backend retrieval is broadly enabled.

Detailed prompt-injection and tool-safety rules are defined in [PROMPT_INJECTION_AND_TOOL_SAFETY.md](PROMPT_INJECTION_AND_TOOL_SAFETY.md).

### Operations

V3 requires operational visibility across:

- API requests.
- Provider calls.
- Retrieval routing.
- Local workers.
- Handoff jobs.
- Promotion decisions.
- Memory controls.
- Eval regressions.

Operational requirements are defined in [OPERATIONS.md](OPERATIONS.md).

## V3 User Flows

### iOS Mentor Uses Promoted Memory

1. User chats with mentor on iOS.
2. Backend retrieves recent messages and promoted memory.
3. Router detects no local memory access.
4. Mentor answers using available memory.
5. If local memory is likely needed, backend creates handoff.

### iOS Mentor Requests Local Context

1. User asks about prior context not in Supabase.
2. Router emits `missing_memory_scope`.
3. Backend creates handoff job.
4. Local worker leases and completes job.
5. Backend applies promotion policy.
6. Promoted result becomes available to iOS.

### Desktop Mentor Uses Local Memory

1. User chats with mentor on desktop.
2. Backend or local runtime identifies local memory availability.
3. Router queries Supabase and local backends.
4. Context bundle includes source-scoped local results.
5. Mentor answers with explicit memory scope metadata.

### Codex Uses GRAPH

1. User asks architecture/codebase question.
2. Router sees `graph` available.
3. GRAPH returns symbols, communities, and relevant files.
4. Agent reads graph summaries before raw files.
5. Agent uses fewer tokens and records source refs.

## V3 Acceptance Criteria

- iOS mentor works without live local memory.
- Desktop/Codex mentor can use authorized local memory.
- Missing local memory creates handoff instead of silent context loss.
- At least two local backends are supported.
- Worker revocation prevents future leases and late completions.
- Promotion policy blocks secret and local-only memory.
- User can approve or reject sensitive promotion.
- Retrieval evals cover Supabase-only, hybrid, and missing-scope scenarios.
- Prompt-injection tests cover ingested document/email/tool-output instructions.
- Operations dashboard or logs expose handoff and retrieval health.

## V3 Readiness Gates

Do not enable V3 broadly until:

- V1 retrieval evals are passing.
- V2 worker leasing is stable.
- Promotion policy is enforced.
- RLS and service-role tests pass.
- Device revocation works.
- Prompt-injection controls exist.
- Retention and deletion workflows are tested.
- User memory controls exist for correction and forgetting.
