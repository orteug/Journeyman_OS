# Local Development

## Purpose

This document describes the local development setup for the backend, Supabase storage, local-first memory, maintenance workers, and AI-provider-agnostic orchestration.

This document is illustrative. Claude Code should adapt commands to the target repository as described in [BUILD_HANDOFF.md](BUILD_HANDOFF.md).

## Environment Variables

Required variables:

```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MAINTENANCE_WORKER_TOKEN=
```

AI provider variables:

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

Optional local development variables:

```bash
APP_ENV=development
LOG_LEVEL=debug
AI_PROVIDER=mock
EMBEDDING_PROVIDER=mock
REQUEST_TIMEOUT_MS=30000
MEMORY_MODE=hybrid
LOCAL_MEMORY_ENABLED=false
MEMORY_EVAL_FIXTURES=fixtures/memory-evals
```

Use mock providers for automated tests whenever possible.

Optional local-first variables:

```bash
CORTEX_DATABASE_URL=
PALACE_CHROMA_URL=
PALACE_GRAPH_PATH=
CORPUS_LIGHTRAG_PATH=
GRAPHIFY_OUT_PATH=graphify-out
N8N_WEBHOOK_URL=
LOCAL_MEMORY_GATEWAY_URL=
LOCAL_MEMORY_WORKER_TOKEN=
```

## Tooling

Recommended local tooling:

- Supabase local stack.
- Database migrations.
- Seed scripts.
- Mock AI providers.
- Mock local memory providers.
- Structured log output.
- Test runner for API and worker behavior.
- Memory eval fixtures for recall, stale facts, source accuracy, and handoff behavior.

The local stack should support:

- Creating users and conversations.
- Seeding messages, summaries, facts, and embeddings.
- Running migrations from a clean database.
- Running maintenance jobs safely against local data.
- Running handoff jobs that simulate unavailable local memory.

## Supabase Local Stack

Typical commands:

```bash
supabase start
supabase status
supabase stop
```

Apply migrations:

```bash
supabase db reset
```

Generate or inspect types if the project uses generated database types:

```bash
supabase gen types typescript --local
```

## Seeding

Seed scripts should create deterministic test data:

- Test users.
- Conversations.
- Messages.
- Summaries.
- Facts.
- Embeddings.
- Agent jobs.
- Handoff jobs.
- Promoted memories.
- Memory lifecycle events.
- Memory control actions.

Example command:

```bash
npm run seed
```

The seed command should be safe to rerun against a local database.

## Running the API Server

Example command:

```bash
npm run dev
```

Expected local behavior:

- API listens on a documented port.
- Logs are structured and readable.
- Provider calls use mock providers by default.
- Correlation ids are created when not supplied.
- Memory scopes are explicit in request logs.

## Running Tests

Example commands:

```bash
npm test
npm run test:integration
```

Tests should cover:

- Authentication and authorization.
- Conversation and message endpoints.
- Retrieval ordering.
- Summary fallback behavior.
- Maintenance worker idempotency.
- Memory scope behavior.
- Handoff job creation.
- Promotion from local memory into Supabase.
- Memory lifecycle transitions.
- User correction and forgetting behavior.
- Memory eval suites.
- Error response format.

## Maintenance Jobs

Example local maintenance commands:

```bash
npm run worker:summarize -- --conversation-id <id>
npm run worker:embeddings -- --source-type message --source-id <id>
npm run worker:compact -- --conversation-id <id>
npm run worker:scrub-pii -- --scope conversation --scope-id <id>
npm run worker:promote-memory -- --source-system palace --source-ref <id>
npm run worker:handoff -- --handoff-id <id>
npm run worker:run-memory-evals
```

Maintenance jobs should require explicit local credentials and should write audit records even in development.

## Runbook: Fresh Local Reset

1. Start Supabase.
2. Reset the database.
3. Run seed scripts.
4. Start the API server.
5. Run tests.
6. Run one maintenance job against seeded data.

Example:

```bash
supabase start
supabase db reset
npm run seed
npm run dev
npm test
```

## Runbook: Debug Retrieval

1. Identify the `conversation_id`.
2. Fetch recent messages.
3. Inspect summaries for the conversation.
4. Run vector search with the query.
5. Check token budget decisions.
6. Inspect the final context bundle before provider invocation.

The backend should expose a safe development-only way to inspect context assembly without leaking secrets.

## Runbook: Test iOS Memory Gap

1. Start the API server with `LOCAL_MEMORY_ENABLED=false`.
2. Create or seed promoted mentor memories in Supabase.
3. Send a mentor request that requires local-only context.
4. Verify the response includes a missing memory scope or creates a handoff.
5. Run the local handoff worker.
6. Verify the worker writes a promoted result back to Supabase.
7. Repeat the mentor request and confirm it can now use promoted memory.

This runbook protects the platform behavior: iOS should not silently pretend it has PALACE, CORPUS, GRAPH, or CORTEX access.

## Runbook: Test Hybrid Desktop Retrieval

1. Start the API server with `MEMORY_MODE=hybrid`.
2. Enable local memory providers.
3. Seed Supabase messages and promoted memories.
4. Seed or point to local PALACE, CORPUS, and GRAPH data.
5. Send a desktop or Codex request.
6. Inspect the assembled context bundle.
7. Verify retrieved items include memory scope and source references.

Use mock local memory providers when the full Mac Mini stack is unavailable.

## Runbook: Test Memory Controls

1. Seed a promoted memory and a superseded memory.
2. Request an answer that would retrieve both.
3. Verify the current valid memory wins.
4. Correct the memory through the API.
5. Verify the old memory is superseded and the corrected memory is retrieved.
6. Forget the corrected memory.
7. Verify it is excluded from retrieval and derived embeddings are cleaned up or disabled.

## Runbook: Run Memory Evals

1. Load memory eval fixtures.
2. Run recall, stale fact, source citation, and handoff tests.
3. Compare recall, precision, latency, and token cost against the previous baseline.
4. Fail the run if source accuracy or stale-memory usage regresses beyond threshold.
