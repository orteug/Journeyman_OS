# Handoff State Machine

## Purpose

Handoff jobs connect cloud-primary clients to local-first memory without requiring live local access. They must be durable, auditable, retryable, and safe when local workers are offline.

The worker runtime behavior that executes these jobs is defined in [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md).

Adjacent agent job, promotion, deletion, memory lifecycle, and provider-call machines are defined in [STATE_MACHINES.md](STATE_MACHINES.md).

## Job States

Allowed states:

- `queued`
- `leased`
- `running`
- `completed`
- `failed_retryable`
- `failed_terminal`
- `expired`
- `cancelled`
- `dead_lettered`

## State Transitions

```text
queued -> leased
leased -> running
running -> completed
running -> failed_retryable
running -> failed_terminal
failed_retryable -> queued
queued -> expired
leased -> expired
running -> expired
queued -> cancelled
leased -> cancelled
running -> cancelled
failed_retryable -> dead_lettered
```

Invalid transitions should be rejected.

## Required Fields

Handoff jobs require:

- `id`
- `user_id`
- `conversation_id`
- `requesting_agent_id`
- `target_runtime`
- `required_memory_scopes`
- `task`
- `acceptance_criteria`
- `status`
- `correlation_id`
- `idempotency_key`
- `created_at`
- `updated_at`
- `expires_at`

Lease fields:

- `leased_by_worker_id`
- `leased_until`
- `lease_attempt`

Result fields:

- `result_summary`
- `result_refs`
- `promotion_recommendation`
- `confidence`
- `completed_at`

Failure fields:

- `error_code`
- `error_message`
- `retry_after`
- `attempt_count`

## Worker Registration

Local workers must register before leasing jobs.

Worker registration stores:

- `worker_id`
- `device_id`
- `user_id`
- `runtime_name`
- `supported_memory_scopes`
- `public_key`
- `status`
- `last_seen_at`
- `created_at`

Workers should only see jobs matching their authorized memory scopes.

## Leasing Protocol

1. Worker requests a lease for jobs matching its scopes.
2. Backend verifies worker credential, device status, and scope authorization.
3. Backend atomically assigns one job and sets `leased_until`.
4. Worker starts the job and transitions it to `running`.
5. Worker sends heartbeats while running.
6. Worker completes or fails the job.

If `leased_until` passes without heartbeat or completion, the job can return to `queued` or move to `expired` depending on attempts and age.

## Retry Policy

Retryable failures:

- Local memory backend temporarily unavailable.
- Provider timeout.
- Worker interrupted.
- Network failure.
- Lease expired before completion.

Terminal failures:

- Unauthorized memory scope.
- Local-only policy violation.
- Invalid job payload.
- Source unavailable permanently.
- User cancelled the job.

Retry limits:

- Default maximum attempts: 3.
- After maximum attempts, move to `dead_lettered`.
- Use exponential backoff with jitter.

## Cancellation

Users and backend policy may cancel jobs.

Cancellation should:

- Mark job `cancelled`.
- Prevent new leases.
- Notify running worker on next heartbeat.
- Prevent promotion from late results.

## Completion Contract

Completed handoffs must return structured output:

```json
{
  "handoff_id": "uuid",
  "status": "completed",
  "result_summary": "Concise answer or memory summary.",
  "result_refs": [
    {
      "source_system": "palace",
      "source_id": "local-ref",
      "redacted": true
    }
  ],
  "confidence": 0.86,
  "promotion_recommendation": {
    "promote": true,
    "memory_type": "decision",
    "sensitivity": "normal"
  }
}
```

Raw local content should not be included unless the job explicitly allows it.

## Security Rules

- Workers cannot lease jobs for unauthorized users.
- Workers cannot lease jobs for unsupported scopes.
- Worker credentials are revocable.
- Late completion after cancellation is rejected.
- Results must be signed or submitted over an authenticated channel.
- Promotion still requires backend policy checks.

Promotion checks are defined in [PROMOTION_POLICY.md](PROMOTION_POLICY.md).

## Offline Behavior

If no local worker is online:

- Job remains `queued` until `expires_at`.
- Client receives `handoff_required` or provisional response.
- User may retry, cancel, or wait for follow-up.

This keeps iOS usable when local infrastructure is offline.
