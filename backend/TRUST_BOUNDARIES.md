# Trust Boundaries

## Purpose

This document defines where credentials live, where retrieval runs, and how local-first memory participates without breaking authorization, auditability, or privacy.

## Boundary Model

The system uses three trust zones:

```text
Client Zone
  iOS, desktop UI, Claude Code client

Backend Zone
  API server, orchestrator, provider adapters, Supabase service access

Local Runtime Zone
  Mac Mini/local worker, CORTEX, PALACE, CORPUS, GRAPH, INGEST
```

Supabase is the shared persistence boundary. Local memory is private by default.

The concrete local worker runtime contract is defined in [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md).

## Credential Placement

Client Zone:

- User access token.
- No provider API keys.
- No Supabase service role key.
- No local worker token.

Backend Zone:

- Supabase service role key.
- Provider API keys.
- Maintenance worker token issuer or verifier.
- Signing keys for job and worker authorization.

Local Runtime Zone:

- Local memory credentials.
- Local worker credential.
- Optional local model credentials.
- No Supabase service role key unless the worker is explicitly server-side and hardened.

Preferred local worker behavior:

- The local worker authenticates to the backend with a worker credential.
- The backend authorizes the worker for specific job scopes.
- The worker submits signed results to the backend.
- The backend performs Supabase writes.

This keeps Supabase service role access out of the local runtime by default.

## Retrieval Paths

### Shared Retrieval

```text
client -> backend -> Supabase -> backend -> provider -> backend -> client
```

Use for:

- iOS.
- Cloud-primary mode.
- Promoted memory.
- Shared conversations and facts.

### Deferred Local Handoff

```text
client -> backend -> handoff job
local worker -> backend lease
local worker -> local memory
local worker -> backend signed result
backend -> Supabase promoted memory
client -> backend -> promoted memory
```

Use for:

- iOS needing local-only context.
- Offline local runtime that comes online later.
- High-sensitivity local retrieval where raw content should remain local.

### Direct Local Retrieval

```text
desktop/Codex -> local memory -> backend signed context/result -> Supabase audit/promoted memory
```

Use only in authorized local environments.

Direct local retrieval must still produce audit metadata when it affects shared state or model outputs.

### Live Local Gateway

```text
client -> backend -> local gateway -> local memory -> backend -> client
```

This is optional v3+ behavior. It should not be required for v1 or v2.

Required controls:

- Explicit user enablement.
- Mutual authentication.
- Request allowlist.
- Rate limits.
- Audit logs.
- Redaction.
- Timeout and fallback.
- Device revocation.

## Local Worker Contract

A local worker may:

- Poll for authorized jobs.
- Lease a job.
- Query local memory.
- Produce compact results.
- Submit source references and confidence.
- Recommend promotion.

A local worker must not:

- Upload raw local archives by default.
- Write directly to Supabase with service role credentials by default.
- Ignore local-only flags.
- Execute arbitrary tools from retrieved content.
- Promote sensitive source references without redaction.

Promotion and sensitivity rules are defined in [PROMOTION_POLICY.md](PROMOTION_POLICY.md).

## Source Reference Safety

Source references can leak sensitive information. Local paths, filenames, project names, contact names, and meeting titles may be sensitive even without raw content.

Source references should support redaction:

```json
{
  "source_system": "palace",
  "source_id": "local-ref",
  "display_label": "Private local memory",
  "redacted": true
}
```

## Authorization Rules

The backend must authorize:

- User access to conversations and memory.
- Worker access to jobs.
- Worker access to memory scopes.
- Promotion from local to shared memory.
- Memory control actions.
- Device revocation.

Authorization should use least privilege. A worker credential should be scoped to job leasing and result submission, not broad database writes.

## Audit Requirements

Every cross-boundary action should log:

- Actor.
- Runtime.
- Device id where applicable.
- Memory scopes requested.
- Memory scopes used.
- Source systems used.
- Whether raw content left the local runtime.
- Promotion decision.
- Correlation id.

## Open Design Choice

The recommended default is backend-brokered writes with local workers submitting signed results. This preserves audit and RLS control while still allowing local retrieval.

Direct client-local retrieval can exist for desktop/Codex, but any shared mutation should still pass through the backend.
