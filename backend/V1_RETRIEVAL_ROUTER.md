# V1 Retrieval Router

## Purpose

This document defines the deterministic v1 retrieval algorithm. It is intentionally narrower than the v3+ router so implementation and evals can start without ambiguity.

The v1 router should work before local-first memory integration. It uses Supabase shared memory, promoted memory, summaries, facts, messages, and embeddings.

Prompt-injection handling for retrieved context is defined in [PROMPT_INJECTION_AND_TOOL_SAFETY.md](PROMPT_INJECTION_AND_TOOL_SAFETY.md).

## Inputs

Router input:

```json
{
  "user_id": "uuid",
  "conversation_id": "uuid",
  "agent_id": "mentor",
  "client_platform": "ios",
  "query": "User request",
  "token_budget": 12000,
  "memory_scope": ["supabase", "promoted_memory"],
  "correlation_id": "id"
}
```

Required values:

- `user_id`
- `conversation_id`
- `query`
- `token_budget`
- `memory_scope`
- `correlation_id`

## Outputs

Router output:

```json
{
  "context_items": [],
  "retrieval_reasons": [],
  "missing_memory_scopes": [],
  "handoff_recommended": false,
  "token_estimate": 0,
  "warnings": []
}
```

Each context item:

```json
{
  "source_type": "promoted_memory",
  "source_id": "uuid",
  "source_system": "supabase",
  "content": "Memory text",
  "score": 0.83,
  "confidence": 0.9,
  "retrieval_reason": "active_project + semantic_match",
  "observed_at": "timestamp",
  "valid_from": "timestamp",
  "valid_to": null,
  "status": "promoted",
  "metadata": {}
}
```

## V1 Retrieval Order

1. Load conversation metadata.
2. Load recent messages.
3. Load latest validated summary.
4. Load promoted memories.
5. Load facts.
6. Run vector search over embeddings.
7. Merge and deduplicate results.
8. Apply temporal and status filters.
9. Rank results.
10. Fit context to token budget.
11. Return context bundle with retrieval reasons.

## Step 1: Conversation Metadata

Load the conversation by `conversation_id` and `user_id`.

Reject if:

- Conversation does not exist.
- Conversation belongs to another user.
- Conversation status is `deleted`.

## Step 2: Recent Messages

Retrieve the most recent messages for the conversation.

Defaults:

- `recent_message_limit = 20`
- Exclude deleted messages.
- Order ascending before context assembly.

Reason:

- Recent message context is usually more reliable than derived memory.

## Step 3: Latest Summary

Retrieve latest validated summary.

Use summary only when:

- Recent messages do not provide enough continuity.
- Token budget cannot include older messages.
- The conversation has more than `recent_message_limit` messages.

Default:

- Include at most one rolling summary.

## Step 4: Promoted Memories

Retrieve promoted memories for the user.

Filters:

- `status in ('validated', 'promoted')`
- `local_only = false` for cloud-primary clients.
- `valid_to is null or valid_to > now()`
- `expires_at is null or expires_at > now()`

Candidate selection:

- Exact scope matches first.
- Agent-specific memories second.
- User-level profile memories third.

Default limit:

- `promoted_memory_candidate_limit = 30`

## Step 5: Facts

Retrieve facts for the user and conversation.

Filters:

- `status = 'validated'`
- Validity window includes now, if set.
- Not superseded unless explicitly requested for audit.

Default limit:

- `fact_candidate_limit = 30`

## Step 6: Embeddings

Run vector search over authorized embeddings.

Defaults:

- `embedding_match_limit = 20`
- `similarity_threshold = 0.78`
- Exclude `status in ('invalidated', 'forgotten', 'deleted')`

V1 should search:

- Messages.
- Summaries.
- Facts.
- Promoted memories.

## Step 7: Deduplication

Deduplicate by:

- `source_type`
- `source_id`
- `source_system`

If two candidates point to the same source:

1. Keep the higher score.
2. Merge retrieval reasons.
3. Preserve the highest confidence.
4. Preserve source lineage.

## Step 8: Temporal and Status Filters

Exclude:

- `deleted`
- `forgotten`
- `invalidated`
- Expired memories.
- Local-only memories for cloud-primary clients.

Down-rank:

- `superseded`
- Low confidence.
- Old preferences without recent validation.

## Step 9: Ranking

V1 scoring:

```text
score =
  semantic_score * 0.45
  + recency_score * 0.20
  + confidence_score * 0.20
  + scope_match_score * 0.10
  + user_correction_boost * 0.05
```

For non-vector records, set `semantic_score` using text search or keyword match:

- exact entity match: `0.85`
- strong keyword match: `0.70`
- weak keyword match: `0.50`
- no match: `0.0`

Score components:

- `recency_score`: 1.0 for recent/current, decays toward 0.0.
- `confidence_score`: stored confidence.
- `scope_match_score`: 1.0 exact, 0.5 broad user scope, 0.0 mismatch.
- `user_correction_boost`: 1.0 only for user-corrected memory.

Tie-breakers:

1. User-corrected memory.
2. Current valid memory.
3. Higher confidence.
4. More recent `observed_at`.
5. Promoted memory before embedding snippet.
6. Lower token count.

## Step 10: Token Budget

Default context allocation:

- Current request: always included.
- Recent messages: up to 40%.
- Summary: up to 15%.
- Promoted memories and facts: up to 25%.
- Embedding snippets: up to 20%.

If over budget:

1. Keep current request.
2. Keep last 4 messages.
3. Keep user-corrected memories.
4. Keep high-confidence active goals, constraints, and decisions.
5. Keep latest summary.
6. Drop low-score embedding snippets.
7. Drop older messages beyond last 4.

## Missing Memory Scope Detection

Return `missing_memory_scopes` when:

- Query mentions local-only sources.
- Query asks about codebase structure and `graph` is unavailable.
- Query asks about documents known to live in CORPUS and `corpus` is unavailable.
- Query asks about past episodic context and promoted/Supabase retrieval is insufficient.

V1 should not over-trigger handoffs. It should recommend handoff only when:

- Top shared-memory score is below threshold.
- Query is explicitly about local/code/document memory.
- User asks for context likely absent from Supabase.

Default handoff threshold:

- Recommend handoff if top score `< 0.55` and a local scope is likely relevant.

## Conflict Handling

If two memories conflict:

1. Prefer user-corrected memory.
2. Prefer current validity window.
3. Prefer non-superseded memory.
4. Prefer higher confidence.
5. Include a conflict warning if both are high confidence.

Conflict warning shape:

```json
{
  "type": "memory_conflict",
  "source_ids": ["uuid-1", "uuid-2"],
  "message": "Two high-confidence memories conflict; the newer corrected memory was preferred."
}
```

## Observability

Log:

- Candidate counts by source.
- Selected counts by source.
- Dropped counts by reason.
- Token estimate.
- Missing memory scopes.
- Handoff recommendation.
- Correlation id.

Do not log raw memory content by default.

## V1 Evals

Minimum evals:

- Retrieves recent decision.
- Retrieves corrected preference over old preference.
- Excludes forgotten memory.
- Excludes local-only memory for iOS.
- Uses latest summary when token budget is low.
- Recommends handoff for code graph query when `graph` unavailable.
- Does not recommend handoff when promoted memory answers the query.

## V2+ Extensions

Later versions may add:

- Graph ranking.
- Local-first memory backends.
- Query decomposition.
- Point-in-time temporal queries.
- User-configurable memory priorities.
- Learned ranking.
