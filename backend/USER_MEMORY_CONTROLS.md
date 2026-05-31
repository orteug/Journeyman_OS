# User Memory Controls

## Purpose

Users need direct control over what the system remembers, where memory lives, and how memory is used. This is especially important in a hybrid architecture where private local memory can be promoted into shared Supabase memory.

## Core Controls

The product should support:

- Show what you remember about me.
- Explain why this memory was retrieved.
- Correct this memory.
- Forget this memory.
- Delete this memory.
- Keep this memory local only.
- Promote this memory to shared memory.
- Sync this memory to iOS.
- Show source.

These controls should be backed by lifecycle events, authorization checks, and audit records.

## Memory Inspection

Users should be able to inspect memories by:

- Type.
- Source system.
- Scope.
- Status.
- Confidence.
- Created time.
- Last retrieved time.
- Validity window.

Memory inspection should show source references without exposing raw local-only source content unless the current runtime is authorized to view it.

## Explanation

For any retrieved memory, the system should be able to answer:

- Why was this memory selected?
- Which query or agent run used it?
- What source created it?
- Is it current or superseded?
- What other memories conflicted with it?

Explanation should use concise retrieval reasons, not private chain-of-thought.

## Correction

When a user corrects memory:

1. Create a new user-corrected memory.
2. Mark the prior memory as superseded or invalidated.
3. Recompute or disable stale retrieval artifacts.
4. Preserve an audit event.
5. Prefer the corrected memory in future retrieval.

User-corrected memory should outrank model-extracted memory.

## Forgetting and Deletion

Forgetting means the memory should no longer be used in retrieval. Deletion means the memory and required derived artifacts should be removed according to [RETENTION_POLICY.md](RETENTION_POLICY.md).

Forgetting should:

- Mark the memory as `forgotten`.
- Exclude it from normal retrieval.
- Disable or remove embeddings as needed.
- Write a lifecycle event.

Deletion should:

- Remove the memory record where legally and operationally allowed.
- Remove derived embeddings and promoted copies.
- Preserve minimal audit metadata if required.

## Local-Only Control

Users should be able to mark memory as local-only. Local-only memories must not be promoted to Supabase unless the user explicitly changes the setting.

Local-only is appropriate for:

- Sensitive personal archives.
- Raw meeting notes.
- Private documents.
- Local codebase context.
- Experimental scratch memory.

## Promotion Control

Promotion makes selected local memory available across clients through Supabase.

Promotion should be used for:

- Stable user preferences.
- Active goals.
- Important decisions.
- Current constraints.
- Mentor-relevant context.
- Summaries safe for iOS use.

Promotion should preserve source references, confidence, timestamps, and validity windows.

## UI Requirements

The interface should make memory state visible without overwhelming the user.

Minimum useful views:

- Current profile memory.
- Active projects and goals.
- Recent memories used.
- Pending handoffs.
- Promoted memories.
- Local-only memories.
- Forgotten or superseded memories.

Each memory item should expose actions appropriate to its state and source.
