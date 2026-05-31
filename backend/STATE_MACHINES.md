# State Machines

## Purpose

This document defines the core state machines that keep the memory platform auditable and implementable. State transitions should be explicit, validated, logged, and tested.

State machines covered:

- Agent jobs.
- Memory lifecycle.
- Deletion workflows.
- Promotion review.
- Provider calls.
- Handoff jobs.

The handoff job state machine is defined in detail in [HANDOFF_STATE_MACHINE.md](HANDOFF_STATE_MACHINE.md). This document references it and defines the adjacent machines.

## General Rules

Every state transition should:

- Validate current state.
- Validate actor permission.
- Write `updated_at`.
- Write audit event when user-visible or privileged.
- Include `correlation_id`.
- Be idempotent where possible.
- Reject invalid transitions with `409 Conflict`.

State transition records should include:

- `target_type`
- `target_id`
- `previous_state`
- `next_state`
- `actor`
- `reason`
- `correlation_id`
- `created_at`

## Agent Job State Machine

Agent jobs represent model/agent execution started by a message or maintenance process.

### States

- `queued`
- `retrieving_context`
- `running`
- `streaming`
- `completed`
- `failed_retryable`
- `failed_terminal`
- `cancelled`
- `expired`

### Transitions

```text
queued -> retrieving_context
retrieving_context -> running
running -> streaming
running -> completed
streaming -> completed
retrieving_context -> failed_retryable
retrieving_context -> failed_terminal
running -> failed_retryable
running -> failed_terminal
streaming -> failed_retryable
streaming -> failed_terminal
queued -> cancelled
retrieving_context -> cancelled
running -> cancelled
streaming -> cancelled
queued -> expired
retrieving_context -> expired
running -> expired
failed_retryable -> queued
```

### Invalid Transitions

Reject:

- `completed -> running`
- `completed -> failed_retryable`
- `cancelled -> completed`
- `failed_terminal -> queued`
- `expired -> completed`

### Required Fields

- `id`
- `user_id`
- `conversation_id`
- `agent_id`
- `status`
- `correlation_id`
- `idempotency_key`
- `created_at`
- `updated_at`
- `completed_at`
- `expires_at`
- `error`

### Retry Rules

Retry only from `failed_retryable`.

Retryable failures:

- Provider timeout.
- Temporary provider error.
- Retrieval dependency timeout.
- Network interruption.

Terminal failures:

- Unauthorized resource.
- Invalid prompt contract.
- Invalid tool permission.
- User cancellation.
- Safety policy violation.

## Memory Lifecycle State Machine

Memory lifecycle state applies to facts, promoted memories, and derived memory records.

### States

- `captured`
- `extracted`
- `validated`
- `promoted`
- `retrieved`
- `corrected`
- `superseded`
- `invalidated`
- `forgotten`
- `deleted`

### Transitions

```text
captured -> extracted
extracted -> validated
validated -> promoted
validated -> retrieved
promoted -> retrieved
validated -> corrected
promoted -> corrected
validated -> superseded
promoted -> superseded
validated -> invalidated
promoted -> invalidated
retrieved -> superseded
retrieved -> invalidated
corrected -> validated
superseded -> deleted
invalidated -> deleted
forgotten -> deleted
validated -> forgotten
promoted -> forgotten
retrieved -> forgotten
```

`retrieved` may be represented as an event rather than a durable row status when the memory should remain `validated` or `promoted`. If implemented as an event, do not mutate the memory's status on every retrieval.

### Invalid Transitions

Reject:

- `deleted -> *`
- `forgotten -> retrieved`
- `invalidated -> retrieved`
- `superseded -> promoted` unless creating a new replacement memory.
- `secret/local_only source -> promoted` unless policy explicitly allows reclassification.

### Event Requirements

Each transition writes a `memory_lifecycle_events` row.

Fields:

- `memory_id`
- `memory_table`
- `event_type`
- `previous_status`
- `next_status`
- `actor`
- `reason`
- `correlation_id`

## Deletion Workflow State Machine

Deletion workflows coordinate deletion across source records, embeddings, summaries, promoted memories, local indexes, backups, and audit-safe tombstones.

### States

- `requested`
- `authorized`
- `planning`
- `deleting_shared_records`
- `deleting_embeddings`
- `regenerating_summaries`
- `queuing_local_deletion`
- `waiting_for_local_runtime`
- `completed`
- `completed_with_pending_local`
- `failed_retryable`
- `failed_terminal`
- `cancelled`

### Transitions

```text
requested -> authorized
authorized -> planning
planning -> deleting_shared_records
deleting_shared_records -> deleting_embeddings
deleting_embeddings -> regenerating_summaries
regenerating_summaries -> queuing_local_deletion
queuing_local_deletion -> waiting_for_local_runtime
queuing_local_deletion -> completed
waiting_for_local_runtime -> completed
waiting_for_local_runtime -> completed_with_pending_local
requested -> cancelled
authorized -> cancelled
planning -> failed_retryable
deleting_shared_records -> failed_retryable
deleting_embeddings -> failed_retryable
regenerating_summaries -> failed_retryable
queuing_local_deletion -> failed_retryable
failed_retryable -> planning
planning -> failed_terminal
```

### Completion Rules

Use `completed` when:

- Shared records are deleted or tombstoned.
- Embeddings are removed or disabled.
- Derived summaries are regenerated or marked stale.
- Local deletion completed or no local source exists.

Use `completed_with_pending_local` when:

- Shared deletion is complete.
- Local runtime is unreachable.
- Pending local deletion is recorded.
- Future promotion from affected local refs is blocked.

### Audit Rules

Audit records should preserve:

- Actor.
- Target id or tombstone id.
- Action.
- Completion status.
- Correlation id.

Audit records should not preserve raw deleted content.

## Promotion Review State Machine

Promotion review governs local-to-shared memory promotion.

### States

- `proposed`
- `classified`
- `blocked`
- `approval_required`
- `approved`
- `rejected`
- `promoted`
- `failed_retryable`
- `failed_terminal`

### Transitions

```text
proposed -> classified
classified -> blocked
classified -> approval_required
classified -> approved
approval_required -> approved
approval_required -> rejected
approved -> promoted
approved -> failed_retryable
approved -> failed_terminal
failed_retryable -> approved
```

### Blocking Rules

Move to `blocked` when:

- Secret detected.
- Source is local-only and not reclassified.
- User lacks permission.
- Source is deleted, forgotten, or invalidated.
- Source reference cannot be safely redacted.

### Approval Rules

Require `approval_required` when:

- Sensitivity is `sensitive`.
- Source is meeting notes, financial, health, relationship, private code, or private business strategy.
- Promotion would expose source labels.

Allow direct `approved` when:

- Sensitivity is `normal` or `public`.
- Confidence threshold passes.
- No local-only or secret source is involved.
- Policy permits automatic promotion.

## Provider Call State Machine

Provider calls represent model API calls or local model calls.

### States

- `prepared`
- `sent`
- `streaming`
- `completed`
- `failed_retryable`
- `failed_terminal`
- `timed_out`
- `cancelled`

### Transitions

```text
prepared -> sent
sent -> streaming
sent -> completed
streaming -> completed
sent -> failed_retryable
sent -> failed_terminal
streaming -> failed_retryable
streaming -> failed_terminal
sent -> timed_out
streaming -> timed_out
prepared -> cancelled
sent -> cancelled
streaming -> cancelled
failed_retryable -> prepared
```

### Retryable Failures

- Provider timeout.
- Provider 429 with retry-after.
- Provider 5xx.
- Temporary network failure.

### Terminal Failures

- Invalid API key.
- Prompt rejected by safety policy.
- Request too large after truncation.
- Unsupported model.
- Invalid structured output after retry budget exhausted.

### Logging

Log:

- Provider.
- Model.
- Request token estimate.
- Response token count.
- Latency.
- Status.
- Error code.
- Correlation id.

Do not log raw prompt content by default.

## Handoff State Machine

Use [HANDOFF_STATE_MACHINE.md](HANDOFF_STATE_MACHINE.md) for the authoritative handoff state machine.

Important integration points:

- Agent job may create a handoff during `retrieving_context` or `running`.
- Handoff completion may create a promoted memory.
- Promotion review must pass before handoff result becomes shared memory.
- Cancelled handoff rejects late worker completion.

## Test Requirements

State machine tests should cover:

- Every valid transition.
- Representative invalid transitions.
- Idempotent replay of completed mutations.
- Retryable failure retry.
- Terminal failure rejection.
- Cancellation.
- Expiration.
- Audit event creation.
- Correlation id propagation.

## Implementation Notes

State machines can be implemented in application code, database functions, or a workflow engine. The implementation must still enforce the same transition rules and produce the same audit/lifecycle effects.
