# API Specification

## Purpose

This API gives clients a stable interface for conversations, messages, search, streaming model responses, memory scopes, handoffs, user memory controls, and maintenance jobs. Clients call this API rather than calling AI providers, Supabase, or local memory systems directly.

For implementation order and target-repo handoff, see [BUILD_HANDOFF.md](BUILD_HANDOFF.md).

Detailed implementable endpoint contracts are defined in [API_CONTRACTS.md](API_CONTRACTS.md).

## Authentication

Client calls use user tokens. The backend validates the token, resolves the user, and enforces authorization on every request.

Maintenance jobs use a service worker token. Service worker credentials must only be available in server-side or worker environments.

Authentication modes:

- User token: iOS, desktop, and Claude Code client requests.
- Service worker token: summarization, embedding refresh, compaction, PII scrubbing, and other maintenance jobs.

Credential placement and local worker permissions are defined in [TRUST_BOUNDARIES.md](TRUST_BOUNDARIES.md).

## Authorization

Every endpoint must enforce ownership or explicit access. User-scoped requests may only access conversations, messages, facts, summaries, and embeddings visible to that user.

Service worker endpoints must be restricted by token, schema/function allowlists, and audit logging.

## Common Headers

Recommended request headers:

- `Authorization: Bearer <token>`
- `X-Correlation-ID: <id>`
- `Idempotency-Key: <key>` for mutation requests
- `X-Client-Capabilities: <capability-list>` when the client can advertise local memory or offline features

Recommended response headers:

- `X-Correlation-ID: <id>`
- `Content-Type: application/json`

## Conversations

### `GET /conversations`

Returns conversations visible to the authenticated user.

Query parameters:

- `status`
- `limit`
- `cursor`

### `POST /conversations`

Creates a conversation.

Request body:

```json
{
  "title": "Optional title",
  "metadata": {}
}
```

Response body:

```json
{
  "conversation": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "active",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### `GET /conversations/{conversation_id}`

Returns a single conversation if the authenticated user is authorized to access it.

## Messages

### `GET /conversations/{conversation_id}/messages`

Returns messages for a conversation.

Query parameters:

- `limit`
- `cursor`
- `order`

### `POST /conversations/{conversation_id}/messages`

Creates a message and optionally starts an agent response.

Request body:

```json
{
  "role": "user",
  "content": "Message text",
  "metadata": {},
  "stream": true
}
```

Response body:

```json
{
  "message": {
    "id": "uuid",
    "conversation_id": "uuid",
    "role": "user",
    "content": "Message text",
    "metadata": {},
    "created_at": "timestamp"
  },
  "job_id": "uuid"
}
```

## Search

### `GET /search`

Searches messages, facts, summaries, promoted memories, and embeddings visible to the authenticated user.

Query parameters:

- `q`
- `conversation_id`
- `source_type`
- `limit`
- `threshold`
- `memory_scope`
- `include_retrieval_reasons`

Response body:

```json
{
  "results": [
    {
      "source_type": "fact",
      "source_id": "uuid",
      "score": 0.91,
      "content": "Relevant text",
      "retrieval_reason": "Matched current project and high-confidence promoted memory.",
      "metadata": {}
    }
  ]
}
```

## Memory Scopes

### `GET /memory/scopes`

Returns the memory scopes available for the current user, client, and runtime.

Response body:

```json
{
  "agent_id": "mentor",
  "available_scopes": ["supabase", "promoted_memory"],
  "local_memory_available": false,
  "can_request_handoff": true,
  "can_promote_memory": false
}
```

Desktop or local environments may return additional scopes:

```json
{
  "agent_id": "mentor",
  "available_scopes": ["supabase", "promoted_memory", "cortex", "palace", "corpus", "graph"],
  "local_memory_available": true,
  "can_request_handoff": true,
  "can_promote_memory": true
}
```

### `GET /memory`

Returns user-visible memories with filters for type, status, scope, and source system.

Query parameters:

- `memory_type`
- `status`
- `scope`
- `source_system`
- `limit`
- `cursor`

### `GET /memory/{memory_id}`

Returns one memory plus provenance, lifecycle events, and source references when authorized.

### `GET /memory/{memory_id}/explanation`

Explains why a memory was retrieved or eligible for retrieval.

Response body:

```json
{
  "memory_id": "uuid",
  "retrieval_reasons": ["semantic_match", "active_project", "high_confidence"],
  "source_refs": [],
  "validity": {
    "observed_at": "timestamp",
    "valid_from": "timestamp",
    "valid_to": null,
    "status": "validated"
  }
}
```

### `POST /memory/{memory_id}/correct`

Creates a user-corrected replacement memory and supersedes or invalidates the old memory.

Request body:

```json
{
  "corrected_text": "The corrected memory text.",
  "reason": "User corrected stale context."
}
```

### `POST /memory/{memory_id}/forget`

Marks a memory as forgotten and removes or disables derived retrieval artifacts according to policy.

Request body:

```json
{
  "reason": "User requested removal from future retrieval."
}
```

### `POST /memory/{memory_id}/keep_local_only`

Marks a memory or source reference as local-only and prevents future promotion unless explicitly changed.

### `POST /memory/{memory_id}/sync_to_shared`

Promotes or queues promotion of a memory into Supabase shared memory.

### `POST /memory/promotions`

Creates a promoted memory from local-first retrieval or user-approved distillation.

Request body:

```json
{
  "memory_type": "decision",
  "text": "A stable memory to make available across clients.",
  "confidence": 0.92,
  "source_system": "palace",
  "source_refs": [
    {
      "source_type": "drawer",
      "source_id": "local-ref"
    }
  ],
  "metadata": {}
}
```

Response body:

```json
{
  "promoted_memory": {
    "id": "uuid",
    "memory_type": "decision",
    "text": "A stable memory to make available across clients.",
    "confidence": 0.92,
    "source_system": "palace",
    "created_at": "timestamp"
  }
}
```

## Handoffs

Handoff state transitions, leases, worker registration, retries, cancellation, and offline behavior are defined in [HANDOFF_STATE_MACHINE.md](HANDOFF_STATE_MACHINE.md).

Worker request/response payloads are further specified in [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md).

### `POST /handoffs`

Creates a handoff job when the current client needs memory or execution from another runtime.

Request body:

```json
{
  "conversation_id": "uuid",
  "requesting_agent_id": "mentor",
  "target_runtime": "local",
  "required_memory_scopes": ["palace", "corpus", "graph"],
  "task": "Retrieve local context needed to answer the user's question.",
  "acceptance_criteria": ["Return a concise promoted summary with source references."]
}
```

Response body:

```json
{
  "handoff": {
    "id": "uuid",
    "status": "queued",
    "conversation_id": "uuid",
    "target_runtime": "local",
    "created_at": "timestamp"
  }
}
```

### `GET /handoffs/{handoff_id}`

Returns handoff status and result metadata.

### `POST /handoffs/{handoff_id}/complete`

Completes a handoff and optionally writes promoted memory.

Request body:

```json
{
  "status": "completed",
  "result_summary": "Local retrieval found the relevant prior decision.",
  "result_refs": [
    {
      "source_system": "palace",
      "source_id": "local-ref"
    }
  ],
  "promote": true
}
```

## Maintenance RPCs

Maintenance RPCs require a service worker token and must write audit records for every mutation.

### `POST /maintenance/summarize_thread`

Creates or updates a summary for a conversation.

Request body:

```json
{
  "conversation_id": "uuid",
  "idempotency_key": "key"
}
```

### `POST /maintenance/refresh_embeddings`

Refreshes embeddings for selected records.

Request body:

```json
{
  "source_type": "message",
  "source_ids": ["uuid"],
  "idempotency_key": "key"
}
```

### `POST /maintenance/compact_thread`

Compacts a thread by creating summaries and marking older context as summarized.

Request body:

```json
{
  "conversation_id": "uuid",
  "before_message_id": "uuid",
  "idempotency_key": "key"
}
```

### `POST /maintenance/scrub_pii`

Scrubs or flags PII according to the retention policy.

Request body:

```json
{
  "scope": "conversation",
  "scope_id": "uuid",
  "mode": "flag",
  "idempotency_key": "key"
}
```

### `POST /maintenance/promote_memory`

Distills selected local-first memory into Supabase promoted memory.

Request body:

```json
{
  "source_system": "palace",
  "source_refs": ["local-ref"],
  "target_scope": "user",
  "idempotency_key": "key"
}
```

## Streaming

Streaming responses may use server-sent events or WebSockets. Server-sent events are the preferred first implementation because they are simple, HTTP-friendly, and adequate for token streaming and progress events.

Recommended SSE event types:

- `job.started`
- `agent.step`
- `token`
- `tool.started`
- `tool.completed`
- `handoff`
- `memory.missing_scope`
- `memory.promoted`
- `memory.corrected`
- `memory.forgotten`
- `memory.invalidated`
- `job.completed`
- `job.failed`

Every event should include `correlation_id` and `job_id`.

## Error Format

Errors should use a standard shape:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Authentication is required.",
    "correlation_id": "id",
    "details": {}
  }
}
```

Recommended error codes:

- `unauthorized`
- `forbidden`
- `not_found`
- `validation_error`
- `rate_limited`
- `conflict`
- `provider_timeout`
- `provider_error`
- `missing_memory_scope`
- `handoff_required`
- `memory_conflict`
- `memory_invalidated`
- `maintenance_failed`
- `internal_error`

All error responses must include a correlation id.
