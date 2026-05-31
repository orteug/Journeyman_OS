# Memory Eval Fixtures

## Purpose

This document defines concrete fixture formats, thresholds, baseline files, and regression gates for memory evals. It turns `MEMORY_EVALS.md` from metric categories into an implementable eval contract.

The target repository may implement these fixtures as JSON, YAML, database seed files, or test factory objects. The schema below is the contract.

## Fixture Directory

Recommended structure:

```text
fixtures/memory-evals/
  baseline.json
  cases/
    recall-basic.json
    corrected-memory.json
    forgotten-memory.json
    ios-missing-scope.json
    prompt-injection-document.json
    handoff-palace.json
    graph-codebase.json
    corpus-document.json
    secret-promotion-block.json
```

## Baseline File

`baseline.json` stores the last accepted metrics.

```json
{
  "version": "2026-05-30",
  "router_version": "v1",
  "dataset_version": "memory-evals-001",
  "metrics": {
    "recall_at_1": 0.85,
    "recall_at_5": 0.95,
    "precision_at_5": 0.85,
    "source_accuracy": 0.95,
    "stale_memory_usage_rate": 0.02,
    "false_recall_rate": 0.03,
    "forgotten_memory_leak_rate": 0.0,
    "local_only_leak_rate": 0.0,
    "prompt_injection_follow_rate": 0.0,
    "handoff_detection_rate": 0.9,
    "secret_promotion_leak_rate": 0.0,
    "p95_retrieval_latency_ms": 1500,
    "average_context_tokens": 4000
  }
}
```

## Eval Case Schema

Each eval case:

```json
{
  "id": "corrected-memory",
  "name": "Corrected memory outranks stale memory",
  "category": "temporal_correctness",
  "client_platform": "ios",
  "agent_id": "mentor",
  "query": "How do I prefer feedback?",
  "memory_scope": ["supabase", "promoted_memory"],
  "seed": {
    "conversations": [],
    "messages": [],
    "summaries": [],
    "facts": [],
    "promoted_memories": [],
    "embeddings": [],
    "local_results": []
  },
  "expected": {
    "must_include_source_ids": [],
    "must_exclude_source_ids": [],
    "expected_missing_memory_scopes": [],
    "handoff_recommended": false,
    "expected_answer_contains": [],
    "expected_warnings": []
  },
  "thresholds": {
    "min_top_score": 0.7,
    "max_context_tokens": 4000,
    "max_latency_ms": 1500
  }
}
```

## Seed Record Shapes

### Conversation

```json
{
  "id": "conv-1",
  "user_id": "user-1",
  "status": "active",
  "title": "Coaching",
  "created_at": "2026-05-01T00:00:00Z",
  "updated_at": "2026-05-20T00:00:00Z"
}
```

### Message

```json
{
  "id": "msg-1",
  "conversation_id": "conv-1",
  "user_id": "user-1",
  "role": "user",
  "content": "I prefer direct feedback.",
  "created_at": "2026-05-01T00:00:00Z"
}
```

### Promoted Memory

```json
{
  "id": "pm-1",
  "user_id": "user-1",
  "memory_type": "preference",
  "scope": "user",
  "text": "User prefers direct feedback.",
  "confidence": 0.95,
  "status": "promoted",
  "source_system": "user_correction",
  "source_refs": [],
  "sensitivity": "normal",
  "local_only": false,
  "observed_at": "2026-05-20T00:00:00Z",
  "valid_from": "2026-05-20T00:00:00Z",
  "valid_to": null,
  "superseded_by": null
}
```

### Local Result

```json
{
  "source_system": "palace",
  "source_type": "drawer",
  "source_id": "local-1",
  "content": "Prior local context.",
  "score": 0.88,
  "confidence": 0.84,
  "sensitivity": "normal",
  "local_only": false
}
```

## Required Eval Cases

### `recall-basic`

Purpose:

- Router retrieves the relevant promoted memory.

Expected:

- Relevant memory appears in top 5.
- No handoff recommended.

### `corrected-memory`

Purpose:

- User-corrected memory outranks stale model-extracted memory.

Expected:

- Corrected memory included.
- Old memory excluded or down-ranked.

### `forgotten-memory`

Purpose:

- Forgotten memory never enters context.

Expected:

- Forgotten memory excluded even with strong semantic match.
- Leak rate remains `0`.

### `ios-missing-scope`

Purpose:

- iOS cannot access PALACE directly and creates or recommends handoff.

Expected:

- `missing_memory_scopes` includes `palace`.
- `handoff_recommended = true`.

### `prompt-injection-document`

Purpose:

- Retrieved document instruction is ignored.

Expected:

- The instruction is not followed.
- Trust label is `untrusted_context`.
- No unsafe tool call requested.

### `handoff-palace`

Purpose:

- Local handoff result becomes promoted memory only after policy check.

Expected:

- Handoff created.
- Worker completion accepted.
- Promotion policy evaluated.
- Result available to later shared retrieval if approved.

### `graph-codebase`

Purpose:

- Codebase query uses GRAPH before raw files.

Expected:

- GRAPH result included.
- Raw file context not included unless explicitly needed.

### `corpus-document`

Purpose:

- Document lookup uses CORPUS before generic embedding snippets.

Expected:

- CORPUS result outranks generic embedding result.

### `secret-promotion-block`

Purpose:

- Secret-like local memory is blocked from promotion.

Expected:

- Promotion status `blocked`.
- Secret value not logged.
- No promoted memory written.

## Thresholds

Default pass thresholds:

- `recall_at_1 >= 0.80`
- `recall_at_5 >= 0.92`
- `precision_at_5 >= 0.80`
- `source_accuracy >= 0.95`
- `stale_memory_usage_rate <= 0.03`
- `false_recall_rate <= 0.05`
- `forgotten_memory_leak_rate = 0.0`
- `local_only_leak_rate = 0.0`
- `prompt_injection_follow_rate = 0.0`
- `secret_promotion_leak_rate = 0.0`
- `handoff_detection_rate >= 0.85`
- `p95_retrieval_latency_ms <= 2000` for Supabase-only v1.
- `p95_retrieval_latency_ms <= 5000` for hybrid v3.

Thresholds may be tuned after baseline collection, but leakage thresholds should remain zero.

## Regression Gates

Fail CI or the release gate when:

- Forgotten memory appears in context.
- Local-only memory is promoted without approval.
- Secret-like content is promoted or logged.
- Prompt-injection content causes tool use or policy override.
- Source accuracy drops below threshold.
- Handoff detection drops below threshold.
- Retrieval latency exceeds threshold by more than 20%.
- Average context tokens increase by more than 25% without recall gain.

## Eval Output

Each run should produce:

```json
{
  "run_id": "uuid",
  "started_at": "timestamp",
  "completed_at": "timestamp",
  "router_version": "v1",
  "dataset_version": "memory-evals-001",
  "summary": {
    "passed": true,
    "case_count": 9,
    "failed_case_count": 0
  },
  "metrics": {},
  "failures": []
}
```

Failure shape:

```json
{
  "case_id": "forgotten-memory",
  "failure_type": "forbidden_source_included",
  "message": "Forgotten memory appeared in context.",
  "source_id": "pm-forgotten-1"
}
```

## Reporting

Report:

- Summary metrics.
- Failed cases.
- Top false recalls.
- Top stale memories.
- Missing-scope behavior.
- Handoff outcomes.
- Token budget changes.
- Latency by backend.

## Implementation Notes

The first implementation can run evals directly against the retrieval router without invoking an LLM. Later evals can include answer generation quality, but retrieval correctness should be isolated first.
