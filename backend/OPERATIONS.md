# Operations

## Purpose

The hybrid memory platform needs operational visibility across backend APIs, retrieval routing, local workers, handoffs, provider calls, promotion decisions, and memory controls.

## Correlation IDs

Every request should carry a `correlation_id`.

The same id should appear in:

- API logs.
- Retrieval router logs.
- Provider calls.
- Agent jobs.
- Handoff jobs.
- Local worker logs.
- Promotion decisions.
- Audit events.
- Error responses.

If the client does not provide one, the backend creates one.

## Structured Logs

Required fields:

- `timestamp`
- `level`
- `correlation_id`
- `user_id`
- `conversation_id`
- `job_id`
- `agent_id`
- `client_platform`
- `action`
- `status`
- `duration_ms`
- `error_code`

Memory-specific fields:

- `memory_scopes_requested`
- `memory_scopes_used`
- `backends_queried`
- `candidate_count`
- `selected_count`
- `missing_memory_scopes`
- `handoff_recommended`

Worker-specific fields:

- `worker_id`
- `device_id`
- `handoff_id`
- `lease_attempt`
- `leased_until`
- `local_backend`

Promotion-specific fields:

- `promotion_id`
- `source_system`
- `sensitivity`
- `approval_mode`
- `promotion_result`

Do not log raw memory content by default.

## Metrics

API metrics:

- Request count.
- Request latency p50/p95/p99.
- Error rate.
- Rate limit count.

Provider metrics:

- Provider latency.
- Provider error rate.
- Timeout rate.
- Token usage.
- Cost estimate.

Retrieval metrics:

- Retrieval latency by backend.
- Candidate count by backend.
- Selected context count.
- Missing memory scope rate.
- Handoff recommendation rate.
- Stale memory usage rate.
- False recall rate from evals.

Worker metrics:

- Active worker count.
- Worker heartbeat age.
- Lease success rate.
- Lease expiration rate.
- Handoff completion rate.
- Dead-letter count.
- Local backend timeout rate.

Promotion metrics:

- Promotion proposals.
- Approved promotions.
- Rejected promotions.
- Blocked secret/local-only promotions.
- Sensitive approvals pending.

## Alerts

Alert on:

- API error spike.
- Provider timeout spike.
- Retrieval latency spike.
- Worker heartbeat stale.
- Handoff dead-letter increase.
- Lease expiration spike.
- Promotion policy violations.
- Secret detection in promotion payload.
- RLS/security test failure.
- Eval regression.

## Dashboards

Minimum dashboards:

- API health.
- Retrieval health.
- Worker and handoff health.
- Promotion and memory controls.
- Provider cost and latency.
- Eval trends.

## Audit Events

Audit events are required for:

- Service role mutations.
- Memory promotion.
- Memory correction.
- Memory forgetting.
- Memory deletion.
- Handoff creation.
- Handoff lease.
- Handoff completion.
- Worker registration.
- Worker revocation.
- Permission changes.

Audit records should not include raw secret or deleted content.

## Runbooks

Required runbooks:

- Provider outage.
- Supabase outage.
- Local worker offline.
- Handoff dead-letter spike.
- Promotion policy violation.
- Secret detected in memory.
- User deletion request.
- Device revocation.
- Eval regression.

## V3 Operational Gates

Before enabling V3 broadly:

- Correlation ids work across backend, worker, and provider calls.
- Worker heartbeats are visible.
- Dead-letter jobs are visible.
- Promotion blocks are visible.
- Eval regressions are visible.
- User deletion runbook exists.
- Device revocation runbook exists.
