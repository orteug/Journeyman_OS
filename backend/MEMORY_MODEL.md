# Memory Model

## Purpose

The memory model defines how conversation state, summaries, facts, embeddings, local-first memory, and promoted memory are stored and retrieved for multi-agent operations. The goal is to provide useful context while keeping token usage bounded, preserving auditability, and making memory availability explicit across platforms.

## Memory Tiers

### Short-Term Memory

Short-term memory stores the recent message window for a conversation. It is the highest-fidelity context and should be preferred whenever the token budget allows.

Short-term memory includes:

- Recent user messages.
- Recent assistant or agent messages.
- Recent tool results that are needed to understand the current task.
- Message metadata such as client source, agent id, job id, and correlation id.

### Mid-Term Memory

Mid-term memory stores rolling summaries and agent briefs. It is used when a conversation is too long to fit in context but recent continuity still matters.

Mid-term memory includes:

- Conversation summaries.
- Agent handoff briefs.
- Decision summaries.
- Open questions.
- Current plan and acceptance criteria.

### Long-Term Memory

Long-term memory stores distilled facts and knowledge with embeddings. It is used to recall stable information across long conversations, clients, and agent runs.

Long-term memory includes:

- User or project facts.
- Stable preferences.
- Decisions.
- Entity records.
- Document-derived knowledge.
- Embeddings linked to source records.

## Memory Types

The system should distinguish at least four memory types:

- Semantic memory: stable facts, preferences, and knowledge.
- Episodic memory: conversations, events, decisions, and dated experiences.
- Procedural memory: durable instructions, workflows, preferences, and agent behavior rules.
- Structural memory: code graphs, document graphs, entities, and relationships.

Different memory types have different retrieval and lifecycle rules. Procedural memories should be high precision and user-editable. Episodic memories should preserve time and source lineage. Structural memories should prefer graph traversal over raw text expansion.

## Memory Classes

The system uses three memory classes.

### Shared Memory

Shared memory lives in Supabase and is available to all authorized clients. It is the canonical cross-platform state.

Shared memory includes:

- Conversations.
- Messages.
- Summaries.
- Facts.
- Embeddings.
- Agent jobs.
- Handoff records.
- Audit events.

The concrete Supabase tables and constraints are defined in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

### Private Local Memory

Private local memory lives in the local-first runtime. It is available only to desktop, Claude Code, Codex, local workers, or other environments that can reach the user's local infrastructure.

Private local memory includes:

- CORTEX structured state.
- PALACE episodic memories.
- CORPUS document retrieval indexes.
- GRAPH codebase graphs.
- INGEST pipeline outputs.

### Promoted Memory

Promoted memory is distilled from private local memory into Supabase so it can be used across clients. It should be compact, source-linked, and safe to expose to the relevant client or agent.

Promoted memory includes:

- Stable preferences.
- Active goals.
- Important decisions.
- Current projects.
- Current constraints.
- Mentor-relevant context.
- Summaries of prior sessions.
- References to local-only source records.

## Core Schemas

### Conversations

Conversations represent user-visible threads or work sessions.

Required fields:

- `id`
- `user_id`
- `status`
- `created_at`
- `updated_at`

Recommended additional fields:

- `title`
- `client_source`
- `metadata`
- `archived_at`

### Messages

Messages are the source-of-truth event stream for a conversation.

Required fields:

- `id`
- `conversation_id`
- `role`
- `content`
- `metadata`
- `created_at`

Recommended additional fields:

- `agent_id`
- `job_id`
- `correlation_id`
- `token_count`
- `visibility`

### Summaries

Summaries compact conversation history while preserving lineage.

Required fields:

- `id`
- `conversation_id`
- `version`
- `summary_text`
- `source_message_ids`

Recommended additional fields:

- `summary_type`
- `created_by`
- `created_at`
- `validated_at`
- `metadata`

### Facts

Facts store distilled knowledge that may be retrieved independently of the original message window.

Required fields:

- `id`
- `scope`
- `fact_text`
- `confidence`
- `observed_at`

Recommended additional fields:

- `user_id`
- `conversation_id`
- `source_type`
- `source_id`
- `source_message_ids`
- `valid_from`
- `valid_to`
- `superseded_by`
- `status`
- `created_at`
- `updated_at`
- `expires_at`
- `metadata`

### Embeddings

Embeddings provide semantic retrieval over messages, summaries, facts, and documents.

Required fields:

- `id`
- `source_type`
- `source_id`
- `vector`
- `metadata`

Recommended additional fields:

- `user_id`
- `conversation_id`
- `model`
- `content_hash`
- `created_at`
- `updated_at`

### Promoted Memories

Promoted memories are cross-platform distillations of local-first memory.

Required fields:

- `id`
- `user_id`
- `memory_type`
- `text`
- `confidence`
- `source_system`
- `source_refs`
- `observed_at`
- `status`
- `created_at`
- `updated_at`

Recommended additional fields:

- `scope`
- `conversation_id`
- `agent_id`
- `visibility`
- `expires_at`
- `valid_from`
- `valid_to`
- `superseded_by`
- `last_validated_at`
- `metadata`

### Memory Lifecycle Events

Lifecycle events record changes to memory state.

Required fields:

- `id`
- `memory_id`
- `memory_table`
- `event_type`
- `actor`
- `correlation_id`
- `created_at`

Recommended additional fields:

- `previous_status`
- `next_status`
- `reason`
- `source_refs`
- `metadata`

Allowed event types:

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

### Memory Control Actions

Memory control actions represent user-initiated inspection or mutation.

Required fields:

- `id`
- `user_id`
- `action`
- `target_type`
- `target_id`
- `status`
- `correlation_id`
- `created_at`

Recommended additional fields:

- `request_text`
- `result_summary`
- `metadata`

Allowed actions:

- `inspect`
- `explain_retrieval`
- `correct`
- `forget`
- `promote`
- `keep_local_only`
- `sync_to_shared`
- `show_source`

### Handoff Jobs

Handoff jobs represent requests for another environment or agent to retrieve, analyze, or promote memory that the current platform cannot access.

Required fields:

- `id`
- `user_id`
- `conversation_id`
- `requesting_agent_id`
- `target_runtime`
- `status`
- `task`
- `correlation_id`
- `created_at`
- `updated_at`

Recommended additional fields:

- `required_memory_scopes`
- `acceptance_criteria`
- `result_summary`
- `result_refs`
- `error`
- `metadata`

## Local-First Layers

Local-first memory is separated by responsibility:

- CORTEX: structured data in local Postgres plus `pgvector`.
- PALACE: long-term episodic memory in MemPalace using ChromaDB and SQLite graph storage.
- CORPUS: document graph and vector retrieval through LightRAG and RAG-Anything.
- GRAPH: codebase structure through Graphify AST and subagent-generated graphs.
- INGEST: continuous ingestion through n8n pipelines.

These systems should expose retrieval results through a normalized context item shape so the backend can assemble provider-neutral context bundles.

## Platform Memory Scopes

Every agent run should declare memory availability.

Example iOS mentor scope:

```json
{
  "agent_id": "mentor",
  "memory_scope": ["supabase", "promoted_memory"],
  "local_memory_available": false,
  "can_request_handoff": true
}
```

Example desktop/Codex mentor scope:

```json
{
  "agent_id": "mentor",
  "memory_scope": ["supabase", "promoted_memory", "cortex", "palace", "corpus", "graph"],
  "local_memory_available": true,
  "can_promote_memory": true
}
```

Agents must not imply they used local memory unless it was available for that run.

## Memory Router

The memory router decides which retrieval systems to query.

Router inputs:

- User request.
- Conversation id.
- Agent id.
- Client platform.
- Available memory scopes.
- Token budget.
- Required permissions.
- Current time.

Router outputs:

- Ranked context items.
- Retrieval reasons.
- Missing memory scopes.
- Handoff recommendations.
- Stale or conflicting memory warnings.

The router should combine signals:

- Recency.
- Similarity.
- Keyword/full-text match.
- Graph proximity.
- Temporal validity.
- Confidence.
- Source reliability.
- User pinning or correction.
- Agent-specific relevance.

The router should down-rank or exclude memories where `status` is `invalidated`, `forgotten`, or `deleted`, and should down-rank memories that are superseded or outside their validity window.

The v1 ranking and truncation algorithm is defined in [V1_RETRIEVAL_ROUTER.md](V1_RETRIEVAL_ROUTER.md).

The V3 multi-backend routing algorithm is defined in [V3_MEMORY_ROUTER.md](V3_MEMORY_ROUTER.md).

## Retrieval Rules

Retrieval should happen in a predictable order:

1. Retrieve the most recent `N` messages for the conversation.
2. Retrieve relevant promoted memories and facts by scope and similarity.
3. Retrieve relevant Supabase embeddings by similarity with a configured threshold.
4. Retrieve from local-first memory backends only when the run's memory scope allows it.
5. Add summaries only when needed for continuity or when the token budget is tight.
6. Deduplicate context items by source id and source system.
7. Preserve source references in the assembled context bundle.
8. Include retrieval reasons and validity metadata in the context bundle.

The retrieval layer should enforce token budgets before provider calls. If the full context does not fit, it should degrade in this order:

1. Keep the current user request and immediate recent messages.
2. Keep high-confidence facts directly relevant to the request.
3. Keep compact agent briefs and decision summaries.
4. Drop low-similarity embeddings.
5. Drop local-only details unless directly required.
6. Fall back to the latest validated summary.

If local-only context appears necessary but is unavailable, the retrieval layer should return a `missing_memory_scope` signal so the orchestrator can create a handoff job or produce a provisional answer.

## Similarity Thresholds

Similarity thresholds should be configurable per source type. A first version can use conservative defaults:

- Facts: retrieve only above a high relevance threshold unless explicitly scoped.
- Messages: retrieve by recency first, then semantic relevance.
- Summaries: retrieve latest validated summary before older summaries.
- Documents: retrieve by semantic relevance and source permissions.
- Local-first memory: retrieve only when the runtime is available and the requester is authorized for that source.
- Graphify code graphs: prefer graph summaries and symbols before raw files.

Every retrieved item should include enough metadata to explain why it was selected.

## Conflict and Staleness Rules

Memory conflicts are expected. The system should preserve conflict metadata rather than flattening everything into a single latest fact.

When memories conflict:

1. Prefer user-corrected memories.
2. Prefer currently valid memories over expired memories.
3. Prefer higher-confidence memories when source quality is comparable.
4. Prefer more recent memories for preferences, goals, and current projects.
5. Preserve older memories as superseded unless the user asks to delete them.

Memory that may change over time should include `valid_from`, `valid_to`, `observed_at`, and `superseded_by`. Examples include goals, active projects, preferences, constraints, relationships, and operating context.

## Summarization Policy

Summarize when either condition is met:

- The conversation exceeds the configured token budget.
- The conversation reaches a configured message-count or age threshold.

Summaries must preserve:

- Decisions.
- Key entities.
- Open tasks.
- Constraints.
- User preferences.
- Acceptance criteria.
- Important failures or rejected approaches.

Summaries must store source lineage through `source_message_ids` or equivalent source references. The system should validate summaries before using them as trusted mid-term memory.

## Summary Validation

Validation should check that the summary:

- Does not invent decisions.
- Preserves named entities accurately.
- Captures unresolved questions.
- Captures active constraints and acceptance criteria.
- Links back to source messages.
- Avoids private chain-of-thought.

Validation can start as a deterministic checklist plus schema validation. A later version can add model-assisted validation with strict structured output.

## Memory Mutation Rules

Memory writes should be explicit and auditable. Facts should not be created from every message by default. A fact should be stored only when it is stable, useful for future retrieval, and supported by source lineage.

Memory mutations should record:

- Actor.
- Source.
- Confidence.
- Reason for write.
- Correlation id.
- Timestamp.

## Memory Lifecycle Policy

Memory lifecycle states:

- `captured`: raw source material exists.
- `extracted`: a candidate memory has been derived.
- `validated`: the memory is trusted for retrieval.
- `promoted`: the memory is available across clients.
- `retrieved`: the memory was used in context assembly.
- `superseded`: a newer or more accurate memory replaces it.
- `invalidated`: the memory should not be used.
- `forgotten`: the user requested the memory not be used.
- `deleted`: the memory and derived artifacts have been removed.

Lifecycle transitions should write `memory_lifecycle_events`.

The authoritative memory lifecycle state machine is defined in [STATE_MACHINES.md](STATE_MACHINES.md).

## Promotion Policy

Promote local memory into Supabase when it is useful across platforms and safe to expose.

Promote:

- Stable preferences.
- Important decisions.
- Active goals.
- Current project summaries.
- Constraints that affect future answers.
- Mentor identity context.
- Pointers to local-only records where the raw source should remain local.

Do not promote:

- Raw private archives by default.
- Full document bodies unless needed.
- Full codebase graph payloads.
- Secrets or credentials.
- Low-confidence inferred facts.
- Temporary scratch context.

Promotion should preserve provenance through `source_system`, `source_refs`, confidence, and correlation id.

Promotion should also preserve `observed_at`, validity windows, and supersession links when the promoted memory replaces older shared memory.

## Missing Memory Behavior

When a client lacks the memory needed for a high-quality answer:

1. Return an explicit missing-scope signal from retrieval.
2. Create a handoff job if the user or agent can benefit from local retrieval.
3. Answer provisionally only when useful and clearly bounded by available context.
4. Promote the handoff result back into Supabase when complete.

This keeps iOS behavior honest while allowing desktop and local agents to enrich shared memory later.

The full handoff job state machine is defined in [HANDOFF_STATE_MACHINE.md](HANDOFF_STATE_MACHINE.md).

## User Correction Policy

User corrections should outrank model-extracted memories. When a user corrects a memory:

1. Mark the old memory as `superseded` or `invalidated`.
2. Create a new corrected memory with source type `user_correction`.
3. Preserve the correction event in lifecycle history.
4. Recompute or mark affected embeddings stale.
5. Prefer the corrected memory in future retrieval.

Forgetting and deletion behavior is governed by [RETENTION_POLICY.md](RETENTION_POLICY.md).
