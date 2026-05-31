# Local Worker Protocol

## Purpose

The local worker connects the shared backend to local-first memory without giving cloud clients direct access to private local systems. It is the v2 bridge for PALACE, CORPUS, GRAPH, CORTEX, and later INGEST.

The worker retrieves local context, returns compact signed results to the backend, and recommends whether a result should be promoted to Supabase.

## Scope

The v2 worker supports:

- Worker registration.
- Device authorization.
- Heartbeats.
- Handoff job leasing.
- Local memory retrieval.
- Result submission.
- Failure reporting.
- Promotion recommendation.

The v2 worker does not support:

- Live inbound local memory gateway.
- Direct Supabase service role writes.
- Arbitrary tool execution.
- Automatic promotion of sensitive or local-only memory.

## Runtime Assumptions

The local worker runs in a user-controlled environment such as:

- Mac Mini.
- Desktop app background process.
- Claude Code/Codex local environment.
- Local server process.

The worker may access local memory systems according to local configuration:

- `palace`
- `corpus`
- `graph`
- `cortex`
- `ingest`

## Worker Identity

Each worker has:

- `worker_id`
- `user_id`
- `device_id`
- `runtime_name`
- `supported_memory_scopes`
- `public_key`
- `status`
- `last_seen_at`

Workers are user-scoped by default. Organization/workspace-scoped workers require explicit future design.

## Registration Flow

1. User authorizes local worker setup.
2. Worker generates or receives a device credential.
3. Worker registers with backend.
4. Backend stores `local_workers` record.
5. Backend returns allowed scopes and polling configuration.
6. Worker begins heartbeat.

Registration request:

```json
{
  "device_id": "mac-mini-001",
  "runtime_name": "Mac Mini Local Memory",
  "supported_memory_scopes": ["palace", "corpus", "graph"],
  "public_key": "base64-public-key"
}
```

Registration response:

```json
{
  "worker_id": "uuid",
  "status": "active",
  "allowed_memory_scopes": ["palace", "corpus", "graph"],
  "poll_interval_seconds": 15
}
```

## Heartbeat Flow

Workers send heartbeats while active.

Heartbeat request:

```json
{
  "worker_id": "uuid",
  "status": "active",
  "available_memory_scopes": ["palace", "corpus", "graph"],
  "current_job_id": "uuid-or-null"
}
```

Heartbeat response:

```json
{
  "status": "accepted",
  "revoked": false,
  "cancel_current_job": false
}
```

If `revoked = true`, the worker must stop leasing jobs and discard its credential.

## Lease Flow

Workers lease one job at a time in v2.

Lease request:

```json
{
  "worker_id": "uuid",
  "supported_memory_scopes": ["palace", "corpus", "graph"],
  "max_jobs": 1
}
```

Lease response when a job exists:

```json
{
  "job": {
    "id": "uuid",
    "conversation_id": "uuid",
    "required_memory_scopes": ["palace"],
    "task": "Retrieve relevant prior coaching context.",
    "acceptance_criteria": ["Return compact summary with source refs."],
    "leased_until": "timestamp",
    "correlation_id": "id"
  }
}
```

Lease response when no job exists:

```json
{
  "job": null,
  "poll_after_seconds": 15
}
```

## Execution Rules

The worker must:

- Treat the handoff task as untrusted input.
- Query only authorized local scopes.
- Prefer summaries and snippets over raw source dumps.
- Preserve source references.
- Redact sensitive source labels.
- Respect local-only flags.
- Avoid arbitrary tool execution.
- Enforce timeout and output caps.

Default limits:

- Job timeout: 30 seconds.
- Local retrieval timeout per backend: 10 seconds.
- Result summary cap: 2,000 characters.
- Source refs cap: 10.
- Raw content return: disabled by default.

## Local Backend Adapter Contract

Each local memory backend should expose a normalized retrieval function.

Input:

```json
{
  "query": "User request or handoff task",
  "limit": 10,
  "correlation_id": "id",
  "filters": {
    "source_types": [],
    "time_range": null
  }
}
```

Output:

```json
{
  "results": [
    {
      "source_system": "palace",
      "source_type": "drawer",
      "source_id": "local-ref",
      "content": "Compact retrieved context.",
      "score": 0.88,
      "confidence": 0.84,
      "observed_at": "timestamp",
      "metadata": {}
    }
  ]
}
```

Adapters:

- PALACE adapter returns episodic memory snippets and source refs.
- CORPUS adapter returns document summaries/chunks and source refs.
- GRAPH adapter returns code graph summaries, symbols, communities, and source refs.
- CORTEX adapter returns structured state summaries.

## Completion Flow

Completion request:

```json
{
  "worker_id": "uuid",
  "handoff_id": "uuid",
  "status": "completed",
  "result_summary": "Concise local retrieval result.",
  "result_refs": [
    {
      "source_system": "palace",
      "source_type": "drawer",
      "source_id": "local-ref",
      "display_label": "Private local memory",
      "redacted": true
    }
  ],
  "confidence": 0.86,
  "promotion_recommendation": {
    "promote": true,
    "memory_type": "episodic",
    "sensitivity": "normal",
    "reason": "Useful cross-platform coaching context."
  },
  "signature": "result-signature"
}
```

The backend validates:

- Worker identity.
- Lease ownership.
- Lease freshness.
- Job status.
- Scope authorization.
- Signature or authenticated channel.
- Promotion policy.

## Failure Flow

Failure request:

```json
{
  "worker_id": "uuid",
  "handoff_id": "uuid",
  "status": "failed_retryable",
  "error_code": "local_backend_timeout",
  "error_message": "PALACE retrieval timed out.",
  "retry_after": "timestamp"
}
```

Retryable failures:

- Local backend timeout.
- Temporary local process unavailable.
- Network interruption.
- Worker shutdown.

Terminal failures:

- Unauthorized memory scope.
- Source permanently unavailable.
- Local-only policy violation.
- Invalid handoff payload.

## Promotion Recommendation

Workers recommend promotion. The backend decides.

The backend must apply [PROMOTION_POLICY.md](PROMOTION_POLICY.md) before writing promoted memory.

## Revocation

If a worker is revoked:

- It cannot lease jobs.
- Active leases are cancelled or expired.
- Late completions are rejected.
- Its credential is invalidated.
- Audit event is written.

## Observability

Worker logs should include:

- `worker_id`
- `device_id`
- `handoff_id`
- `correlation_id`
- memory scopes queried
- local backend latency
- result count
- redaction count
- promotion recommendation
- status
- error code

Logs should not include raw local memory content by default.

## V2 Acceptance Criteria

- Worker can register.
- Worker can heartbeat.
- Worker can lease one authorized job.
- Worker cannot lease another user's job.
- Worker cannot lease unsupported memory scopes.
- Worker can complete a job with signed compact result.
- Worker can fail a job retryably or terminally.
- Revoked worker cannot lease or complete jobs.
- Backend applies promotion policy before shared writes.
