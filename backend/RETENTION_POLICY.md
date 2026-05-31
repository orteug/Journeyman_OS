# Retention Policy

## Purpose

This policy defines what happens when memory is forgotten, deleted, superseded, or retained. It covers shared Supabase records, promoted memory, local-first memory references, embeddings, summaries, audit events, backups, and eval fixtures.

The deletion workflow state machine is defined in [STATE_MACHINES.md](STATE_MACHINES.md).

## Terms

Forget:

- Stop using the memory in retrieval.
- Preserve minimal records needed for audit and abuse prevention.
- Disable or remove derived retrieval artifacts.

Delete:

- Remove the memory and required derived artifacts where legally and operationally allowed.
- Preserve only minimal audit metadata if required.

Supersede:

- Keep the old memory for history.
- Prefer the replacement memory in retrieval.
- Down-rank or exclude the superseded memory from normal context assembly.

Invalidate:

- Mark memory as unsafe, wrong, or unusable.
- Exclude it from retrieval.

## Default Retention Classes

| Class | Examples | Default Behavior |
| --- | --- | --- |
| Conversation source | messages, tool results | Retain until user deletes conversation |
| Derived memory | facts, promoted memories | Retain while valid; supersede when replaced |
| Retrieval artifacts | embeddings, summaries | Regenerate or delete with source |
| Audit metadata | actor, action, timestamp | Retain for operational audit |
| Local-only source | PALACE/CORPUS/GRAPH refs | Keep local; do not sync raw content |
| Eval fixture | synthetic or approved test data | Must not include unapproved private data |

## Forget Workflow

When a user forgets a memory:

1. Mark the memory `forgotten`.
2. Write a lifecycle event.
3. Exclude it from retrieval.
4. Disable or delete its embedding.
5. Exclude it from promoted memory views.
6. Preserve minimal audit metadata.
7. Propagate the forget action to local indexes if the source is local and reachable.

Forget does not necessarily delete source messages unless the user requests source deletion.

## Delete Workflow

When a user deletes a memory:

1. Verify authorization.
2. Mark the deletion request as pending.
3. Delete or tombstone the memory record.
4. Delete derived embeddings.
5. Delete generated summaries that only exist because of the deleted source.
6. Remove promoted copies.
7. Queue local deletion for reachable local systems.
8. Write minimal audit metadata.
9. Mark completion or partial completion.

Deletion must be idempotent.

## Source Message Deletion

Deleting a source message should trigger derived-artifact cleanup:

- Facts sourced only from that message should be deleted or invalidated.
- Summaries should be regenerated or marked stale.
- Embeddings should be deleted.
- Promoted memories should be invalidated unless they have independent sources.
- Handoff results should be checked for source dependency.

## Local Memory Deletion

Local memory deletion depends on whether the local runtime is reachable.

If reachable:

- Send a deletion task to the local worker.
- Worker deletes or tombstones local index records.
- Worker reports completion.

If unreachable:

- Record pending local deletion.
- Prevent future promotion from the affected source ids.
- Retry when the local worker reconnects.

## Backups

Backups may retain deleted data temporarily. The policy must define:

- Backup retention duration.
- Restore procedure that replays deletion tombstones.
- How forgotten/deleted memory stays excluded after restore.

## Provider Logs

Provider logs are outside direct system control once data is sent. The backend should minimize provider payloads and avoid sending unnecessary PII.

For high-sensitivity memory:

- Prefer local transforms.
- Redact before provider calls.
- Do not send local-only raw content unless explicitly allowed.

## Audit Records

Audit records should retain:

- Actor.
- Action.
- Target id or tombstone id.
- Timestamp.
- Correlation id.
- Completion status.

Audit records should not retain raw deleted content unless legally required.

## Evals

Eval fixtures must not silently capture real private user data.

Allowed:

- Synthetic data.
- Explicitly approved anonymized examples.
- Redacted source references.

Not allowed:

- Raw private messages.
- Raw local archive content.
- Secrets.
- Sensitive personal data without explicit approval.

## Open Product Decisions

Before production, decide:

- Default conversation retention period.
- Whether users can delete audit metadata or only content.
- Backup retention window.
- Whether provider logging is disabled or controlled by contract.
- Whether local-only memory can ever be promoted automatically.
