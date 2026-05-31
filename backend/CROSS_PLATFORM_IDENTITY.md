# Cross-Platform Identity

## Purpose

Agent identity should feel consistent across iOS, desktop, Claude Code, and Codex even when each runtime has different memory access.

Identity and memory scope are separate. The agent can be the same mentor while having different available context on each platform.

## Identity Envelope

Each agent run should include:

```json
{
  "agent_id": "mentor",
  "identity_version": "2026-05-30",
  "conversation_id": "uuid",
  "job_id": "uuid",
  "correlation_id": "id",
  "client_platform": "ios",
  "memory_scope": ["supabase", "promoted_memory"]
}
```

## Identity Components

Agent identity consists of:

- `agent_id`
- `identity_version`
- role description
- behavioral constraints
- allowed actions
- default memory priorities
- tool permissions
- user-facing tone/style rules

Identity should not include private chain-of-thought or hidden platform-specific behavior.

## Platform Memory Scopes

### iOS

Available:

- Supabase conversations.
- Recent messages.
- Summaries.
- Facts.
- Promoted memories.
- Small encrypted app cache.
- Handoff requests.

Unavailable by default:

- PALACE.
- CORPUS.
- GRAPH.
- CORTEX.
- Raw local files.

Behavior:

- Answer from shared/promoted memory.
- Create handoff when local-only context is required.
- Do not imply access to local memory.

### Desktop

Available:

- Supabase.
- Promoted memory.
- Local-first memory when configured.
- Optional local worker.
- Optional local gateway.

Behavior:

- Use local memory when authorized and relevant.
- Promote compact memory when policy allows.
- Surface when answer used local context.

### Claude Code / Codex

Available:

- Supabase where configured.
- Promoted memory.
- Local files where authorized.
- GRAPH.
- Local-first memory if configured.

Behavior:

- Prefer GRAPH before raw code reads.
- Respect project-specific instructions.
- Do not promote codebase details without policy approval.

## Memory Scope Disclosure

Agents should not produce noisy disclaimers on every answer. They should disclose memory limitations when it affects answer quality.

Disclose when:

- User asks for local-only context but runtime lacks it.
- Answer is provisional because local handoff is pending.
- A memory conflict affects the answer.
- Local context was used for a sensitive decision.

Do not disclose when:

- Shared memory is sufficient.
- Memory scope differences are irrelevant.
- Disclosure would add noise without improving trust.

## Cross-Platform Continuity

Continuity is maintained through:

- Shared conversations.
- Promoted memories.
- Summaries.
- Facts.
- Handoff results.
- Identity versioning.

Continuity is not guaranteed through:

- Raw local archives.
- Unsynced local memory.
- Device-only cache.

## Identity Versioning

Identity changes should be versioned.

Version when:

- Role behavior changes.
- Tool permissions change.
- Memory priorities change.
- User explicitly updates coaching/mentor style.

Do not version for:

- Ordinary conversation messages.
- New memories.
- Backend implementation changes that do not affect behavior.

## Acceptance Criteria

- Same `agent_id` can run on iOS and desktop.
- Each run declares memory scope.
- iOS does not imply local memory access.
- Desktop/Codex can use local memory when authorized.
- Handoff results improve later iOS answers.
- Identity version is included in agent run metadata.
- Memory limitations are disclosed only when relevant.
