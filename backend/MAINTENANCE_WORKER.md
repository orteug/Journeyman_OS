# Maintenance Worker

## Purpose

The maintenance worker performs server-side data maintenance tasks such as summarization, embedding refreshes, thread compaction, PII scrubbing, memory promotion, and local-memory handoffs. It operates with elevated credentials and must therefore be tightly scoped, auditable, and idempotent.

## Permissions and Scope

The worker uses server-side credentials appropriate to its runtime. The preferred local-worker model is signed result submission through the backend, not direct Supabase service role writes. Credential placement is defined in [TRUST_BOUNDARIES.md](TRUST_BOUNDARIES.md).

Required restrictions:

- Restrict worker access to approved schemas and functions.
- Allowlist maintenance RPCs.
- Allowlist network egress to Supabase, approved AI providers, and observability systems.
- Allowlist access to local-first services only when running in an authorized local environment.
- Use separate credentials for development, staging, and production.
- Record every mutation in audit logs.

The worker should avoid direct ad hoc database writes where a typed repository or approved RPC exists.

## Supported Jobs

Initial worker jobs:

- `summarize_thread`
- `refresh_embeddings`
- `compact_thread`
- `scrub_pii`
- `promote_memory`
- `complete_handoff`
- `validate_memory`
- `invalidate_memory`
- `cleanup_deleted_memory`
- `run_memory_evals`

Each job must accept an idempotency key and produce a structured result.

## Local-First Worker Responsibilities

When running in the local environment, the worker may query:

- CORTEX for structured local state.
- PALACE for episodic memory.
- CORPUS for document retrieval.
- GRAPH for codebase structure.
- INGEST outputs for newly imported data.

The worker should not upload raw local archives to Supabase by default. It should promote compact, source-linked memory records that are useful across platforms.

The worker should also detect stale or conflicting memories and mark them for validation, supersession, or user review rather than overwriting them silently.

## Model Policy

Prefer a small local model for maintenance transforms where quality is sufficient. Use a hosted fallback for heavier tasks with strict timeouts and output caps.

Recommended defaults:

- Local model for summary validation, simple extraction, and PII classification in development.
- Hosted model fallback for difficult summarization or extraction.
- Mock model for automated tests.

Provider usage should be logged with provider name, model, latency, token counts, and correlation id.

## Execution Limits

Jobs must be bounded.

Required limits:

- 10 to 30 second timeout per job or provider call.
- Output caps for model responses.
- Input caps for context bundles.
- Idempotency keys for all mutation jobs.
- Write rate limits.
- Retry limits with exponential backoff and jitter.

The worker should fail closed when output validation fails.

## No-Think Protocol

Maintenance model calls must require structured outputs only. Prompts and schemas should forbid chain-of-thought and request concise rationale fields only when needed for auditability.

Allowed:

- JSON outputs.
- Classification labels.
- Short explanations.
- Source references.
- Confidence values.

Not allowed:

- Private chain-of-thought.
- Free-form hidden reasoning.
- Unbounded prose.
- Provider-specific reasoning traces.

## Idempotency

Every mutation job must be safe to retry.

The worker should use the idempotency key plus job type and target resource to determine whether a job has already completed.

Idempotent behavior:

- Return the existing result if the same job already succeeded.
- Resume or retry if the previous job failed in a retryable state.
- Refuse conflicting requests that reuse the same key for different inputs.

## Monitoring

The worker should emit structured logs, metrics, and alerts.

Required log fields:

- `correlation_id`
- `job_id`
- `job_type`
- `target_resource`
- `memory_scope`
- `actor`
- `status`
- `duration_ms`
- `mutation_count`
- `error_class`

Recommended metrics:

- Job count by type and status.
- Job latency.
- Retry count.
- Provider timeout count.
- Validation failure count.
- Mutation count.
- Queue depth if using a queue.
- Memory eval recall and precision.
- Stale memory usage.
- False recall rate.
- Handoff completion quality.

Alerts should cover repeated failures, timeout spikes, provider error spikes, and unexpected mutation volume.

## Audit Requirements

Every mutation must write an audit record with:

- Actor.
- Time.
- Job type.
- Target resource.
- Change summary.
- Source lineage.
- Correlation id.
- Idempotency key.

Audit records should be immutable in normal application flows.

## Run Mode

Preferred run modes:

- Server worker for production.
- CI worker for scheduled or release-related maintenance.
- Local worker for development and testing.

Development should use local or mock models by default. Production-critical jobs may use hosted models when quality, latency, and reliability requirements justify it.

The first production version should prefer deferred handoff workers over a live inbound local memory gateway. A gateway can be added later if low-latency iOS access to local memory becomes necessary.

Handoff worker registration, leasing, heartbeats, retries, cancellation, and dead-letter behavior are defined in [HANDOFF_STATE_MACHINE.md](HANDOFF_STATE_MACHINE.md).

The local worker execution contract is defined in [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md), and promotion decisions are governed by [PROMOTION_POLICY.md](PROMOTION_POLICY.md).

## Failure Handling

On failure, the worker should:

1. Persist a structured failure state.
2. Include the correlation id in logs and responses.
3. Avoid partial untracked writes.
4. Retry only when the error is classified as retryable.
5. Alert when repeated failures cross the configured threshold.

Partial writes should either be avoided through transactions or recorded clearly enough to reconcile.
