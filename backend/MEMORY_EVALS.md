# Memory Evals

## Purpose

Memory quality must be measured directly. A memory system that retrieves the wrong context is worse than no memory because it makes agents confidently wrong.

The eval suite should measure recall, precision, source accuracy, temporal correctness, token cost, latency, and platform-specific memory behavior.

The v1 retrieval behavior under test is defined in [V1_RETRIEVAL_ROUTER.md](V1_RETRIEVAL_ROUTER.md).

V3 hybrid retrieval behavior is defined in [V3_MEMORY_ROUTER.md](V3_MEMORY_ROUTER.md).

Prompt-injection eval requirements are defined in [PROMPT_INJECTION_AND_TOOL_SAFETY.md](PROMPT_INJECTION_AND_TOOL_SAFETY.md).

Concrete fixture schemas, thresholds, baseline files, and regression gates are defined in [MEMORY_EVAL_FIXTURES.md](MEMORY_EVAL_FIXTURES.md).

## Baseline

The current PALACE layer has achieved 96.6% recall on LongMemEval. Treat this as the initial baseline for long-term episodic retrieval.

The target is not only high recall. The system must also avoid false recall, stale facts, unsupported claims, and unauthorized memory use.

## Eval Categories

### Recall

Measures whether the system finds the relevant memory.

Examples:

- Can it retrieve the correct prior decision?
- Can it find a relevant past conversation?
- Can it locate a document-derived answer?
- Can it retrieve the right code graph node?

### Precision

Measures whether retrieved context is actually relevant.

Examples:

- Did the top retrieved memories answer the query?
- Did unrelated memories enter the context bundle?
- Did the router over-fetch from local memory?

### Temporal Correctness

Measures whether the system respects time.

Examples:

- Does a current project supersede an old project?
- Does an expired preference get down-ranked?
- Does the agent avoid using invalidated facts?
- Can the system answer what was true at a prior point in time?

### Source Accuracy

Measures whether answers cite or reference the right source.

Examples:

- Does every important claim map to a message, fact, document, graph node, or tool output?
- Does the answer avoid citing memories that were not retrieved?
- Does a promoted memory preserve source references?

### Platform Scope

Measures whether clients respect memory availability.

Examples:

- iOS should use Supabase and promoted memory only.
- iOS should create handoffs when PALACE, CORPUS, GRAPH, or CORTEX are required.
- Desktop/Codex should use local memory when configured.
- Agents should not claim access to unavailable memory scopes.

### Handoff Quality

Measures whether deferred local retrieval produces useful promoted memory.

Examples:

- Was the handoff created for the right reason?
- Did the local worker retrieve the right source?
- Did the worker promote a compact and safe memory?
- Did the original client use the promoted result on retry?

### Cost and Latency

Measures whether the memory system reduces operational cost.

Examples:

- Token count before and after Graphify retrieval.
- Latency for Supabase-only retrieval.
- Latency for hybrid retrieval.
- Local worker timeout rate.
- Hosted-provider fallback rate.

## Metrics

Track:

- Recall@1, Recall@5, and Recall@10.
- Precision@K.
- Mean reciprocal rank.
- Source citation accuracy.
- Stale memory usage rate.
- False recall rate.
- Missing-memory detection rate.
- Handoff completion rate.
- Promotion acceptance rate.
- Average context tokens.
- Retrieval latency p50, p95, and p99.
- Cost per answered query.

## Fixtures

Eval fixtures should include:

- Conversation histories.
- Promoted memories.
- Superseded memories.
- Invalidated memories.
- Local-only PALACE records.
- CORPUS document chunks.
- GRAPH code nodes.
- Handoff jobs.
- Expected retrieval results.
- Expected source references.

## Regression Policy

Fail an eval run when:

- Source citation accuracy drops below threshold.
- Stale memory usage exceeds threshold.
- False recall increases beyond threshold.
- iOS retrieves or claims unavailable local memory.
- Forgetting fails to remove memory from retrieval.
- Graph retrieval causes raw code over-fetching.

Recall improvements should not be accepted if they create unacceptable precision or stale-context regressions.

## Reporting

Each eval run should produce:

- Summary metrics.
- Failed cases.
- Top stale or conflicting memories.
- Retrieval latency and token cost.
- Handoff performance.
- Recommended tuning actions.
