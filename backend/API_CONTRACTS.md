# API Contracts

## Purpose

This document hardens `API_SPEC.md` into implementation-ready contracts. It defines common response shapes, pagination, idempotency, status codes, SSE events, job lifecycle endpoints, handoff endpoints, worker endpoints, memory control endpoints, and rate limits.

The target repository may express this as OpenAPI, route tests, typed handlers, or framework-native schemas.

## API Versioning

All endpoints should be versioned.

Recommended prefix:

```text
/v1
```

Example:

```text
GET /v1/conversations
```

Breaking contract changes require a new version or explicit migration plan.

## Common Headers

Request headers:

```text
Authorization: Bearer <user-token-or-worker-token>
X-Correlation-ID: <optional-client-generated-id>
Idempotency-Key: <required-for-mutations>
X-Client-Platform: ios | desktop | claude_code | codex | worker
```

Response headers:

```text
X-Correlation-ID: <id>
Content-Type: application/json
```

Streaming response headers:

```text
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Correlation-ID: <id>
```

## Common Error Shape

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human-readable error.",
    "correlation_id": "id",
    "details": {}
  }
}
```

## Standard Status Codes

- `200 OK`: successful read or mutation with response body.
- `201 Created`: resource created.
- `202 Accepted`: async job accepted.
- `204 No Content`: successful mutation with no body.
- `400 Bad Request`: malformed request.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated but not authorized.
- `404 Not Found`: resource absent or not visible.
- `409 Conflict`: idempotency conflict or invalid state transition.
- `422 Unprocessable Entity`: schema-valid but semantically invalid.
- `429 Too Many Requests`: rate limited.
- `500 Internal Server Error`: unexpected server error.
- `502 Bad Gateway`: provider or upstream failure.
- `503 Service Unavailable`: dependency unavailable.
- `504 Gateway Timeout`: provider, worker, or backend timeout.

## Pagination

Use cursor pagination.

Request:

```text
GET /v1/conversations?limit=25&cursor=<cursor>
```

Response:

```json
{
  "data": [],
  "page": {
    "next_cursor": "opaque-cursor-or-null",
    "has_more": false,
    "limit": 25
  }
}
```

Cursor rules:

- Cursor is opaque to clients.
- Cursor should encode stable ordering fields.
- Default limit: `25`.
- Maximum limit: `100`.
- Deleted records should not appear unless explicitly requested and authorized.

## Idempotency

Mutation endpoints require `Idempotency-Key` unless the endpoint is explicitly read-only or naturally idempotent.

Behavior:

- Same key + same user + same request fingerprint returns the original result.
- Same key + different request fingerprint returns `409 Conflict`.
- Keys expire after a configured window, recommended `24 hours`.

Idempotency record fields:

- `user_id`
- `idempotency_key`
- `request_fingerprint`
- `response_status`
- `response_body`
- `created_at`
- `expires_at`

## Conversations

### `GET /v1/conversations`

Query:

- `status`
- `limit`
- `cursor`

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "status": "active",
      "title": "Conversation title",
      "client_source": "ios",
      "metadata": {},
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "page": {
    "next_cursor": null,
    "has_more": false,
    "limit": 25
  }
}
```

### `POST /v1/conversations`

Request:

```json
{
  "title": "Optional title",
  "client_source": "ios",
  "metadata": {}
}
```

Response `201`:

```json
{
  "conversation": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "active",
    "title": "Optional title",
    "client_source": "ios",
    "metadata": {},
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### `GET /v1/conversations/{conversation_id}`

Response `200`:

```json
{
  "conversation": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "active",
    "title": "Conversation title",
    "metadata": {},
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

## Messages

### `GET /v1/conversations/{conversation_id}/messages`

Query:

- `limit`
- `cursor`
- `order=asc|desc`

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "role": "user",
      "content": "Message text",
      "metadata": {},
      "agent_id": null,
      "job_id": null,
      "created_at": "timestamp"
    }
  ],
  "page": {
    "next_cursor": null,
    "has_more": false,
    "limit": 25
  }
}
```

### `POST /v1/conversations/{conversation_id}/messages`

Creates a user message and optionally starts an agent job.

Request:

```json
{
  "role": "user",
  "content": "Message text",
  "metadata": {},
  "start_agent": true,
  "agent_id": "mentor",
  "stream": true
}
```

Response `202` when agent job starts:

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
  "job": {
    "id": "uuid",
    "status": "queued",
    "agent_id": "mentor",
    "correlation_id": "id"
  },
  "stream_url": "/v1/jobs/uuid/events"
}
```

Response `201` when no agent job starts:

```json
{
  "message": {
    "id": "uuid",
    "conversation_id": "uuid",
    "role": "user",
    "content": "Message text",
    "metadata": {},
    "created_at": "timestamp"
  }
}
```

## Agent Jobs

### `GET /v1/jobs/{job_id}`

Response `200`:

```json
{
  "job": {
    "id": "uuid",
    "conversation_id": "uuid",
    "agent_id": "mentor",
    "status": "running",
    "correlation_id": "id",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "completed_at": null,
    "error": null
  }
}
```

Allowed statuses:

- `queued`
- `running`
- `completed`
- `failed`
- `cancelled`

### `POST /v1/jobs/{job_id}/cancel`

Response `200`:

```json
{
  "job": {
    "id": "uuid",
    "status": "cancelled",
    "updated_at": "timestamp"
  }
}
```

Invalid transition returns `409 Conflict`.

Agent job transitions are defined in [STATE_MACHINES.md](STATE_MACHINES.md).

### `GET /v1/jobs/{job_id}/events`

SSE stream for job progress.

Events are defined in the SSE section below.

## Search

### `GET /v1/search`

Query:

- `q`
- `conversation_id`
- `source_type`
- `memory_scope`
- `threshold`
- `limit`
- `include_retrieval_reasons=true|false`

Response `200`:

```json
{
  "data": [
    {
      "source_type": "promoted_memory",
      "source_id": "uuid",
      "source_system": "supabase",
      "score": 0.91,
      "confidence": 0.88,
      "content": "Relevant text",
      "retrieval_reason": "semantic_match + active_project",
      "metadata": {}
    }
  ],
  "missing_memory_scopes": [],
  "handoff_recommended": false
}
```

## Memory

### `GET /v1/memory/scopes`

Response `200`:

```json
{
  "agent_id": "mentor",
  "client_platform": "ios",
  "available_scopes": ["supabase", "promoted_memory"],
  "local_memory_available": false,
  "can_request_handoff": true,
  "can_promote_memory": false
}
```

### `GET /v1/memory`

Query:

- `memory_type`
- `status`
- `scope`
- `source_system`
- `limit`
- `cursor`

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "memory_type": "preference",
      "scope": "user",
      "text": "User prefers concise responses.",
      "confidence": 0.9,
      "status": "promoted",
      "source_system": "user_correction",
      "sensitivity": "normal",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "page": {
    "next_cursor": null,
    "has_more": false,
    "limit": 25
  }
}
```

### `GET /v1/memory/{memory_id}`

Response includes memory, lifecycle events, and source refs.

### `POST /v1/memory/{memory_id}/correct`

Request:

```json
{
  "corrected_text": "Corrected memory text.",
  "reason": "User corrected stale memory."
}
```

Response `200`:

```json
{
  "memory": {
    "id": "new-uuid",
    "status": "validated",
    "text": "Corrected memory text."
  },
  "superseded_memory_id": "old-uuid"
}
```

### `POST /v1/memory/{memory_id}/forget`

Request:

```json
{
  "reason": "User requested this not be used."
}
```

Response `200`:

```json
{
  "memory": {
    "id": "uuid",
    "status": "forgotten"
  }
}
```

### `POST /v1/memory/{memory_id}/sync_to_shared`

Creates a promotion request or promoted memory depending on policy.

Response `202` when approval is required:

```json
{
  "promotion": {
    "status": "approval_required",
    "memory_id": "uuid",
    "sensitivity": "sensitive"
  }
}
```

Response `201` when promoted:

```json
{
  "promoted_memory": {
    "id": "uuid",
    "status": "promoted"
  }
}
```

## Handoffs

### `POST /v1/handoffs`

Request:

```json
{
  "conversation_id": "uuid",
  "requesting_agent_id": "mentor",
  "target_runtime": "local",
  "required_memory_scopes": ["palace"],
  "task": "Retrieve local context needed to answer the user's question.",
  "acceptance_criteria": ["Return compact summary with source refs."]
}
```

Response `202`:

```json
{
  "handoff": {
    "id": "uuid",
    "status": "queued",
    "expires_at": "timestamp",
    "correlation_id": "id"
  }
}
```

### `GET /v1/handoffs/{handoff_id}`

Response `200`:

```json
{
  "handoff": {
    "id": "uuid",
    "status": "running",
    "required_memory_scopes": ["palace"],
    "result_summary": null,
    "result_refs": [],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### `POST /v1/handoffs/{handoff_id}/cancel`

Response `200`:

```json
{
  "handoff": {
    "id": "uuid",
    "status": "cancelled"
  }
}
```

## Worker Endpoints

Worker endpoints require worker authentication.

### `POST /v1/workers/register`

Defined by [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md).

### `POST /v1/workers/{worker_id}/heartbeat`

Defined by [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md).

### `POST /v1/workers/{worker_id}/leases`

Leases one handoff job.

### `POST /v1/workers/{worker_id}/handoffs/{handoff_id}/complete`

Completes a leased handoff job.

### `POST /v1/workers/{worker_id}/handoffs/{handoff_id}/fail`

Fails a leased handoff job.

## SSE Events

SSE frame format:

```text
event: job.started
data: {"job_id":"uuid","correlation_id":"id","timestamp":"timestamp"}
```

Required event payload fields:

- `correlation_id`
- `timestamp`

### `job.started`

```json
{
  "job_id": "uuid",
  "agent_id": "mentor",
  "correlation_id": "id",
  "timestamp": "timestamp"
}
```

### `token`

```json
{
  "job_id": "uuid",
  "content": "partial token text",
  "correlation_id": "id",
  "timestamp": "timestamp"
}
```

### `memory.missing_scope`

```json
{
  "job_id": "uuid",
  "missing_memory_scopes": ["palace"],
  "handoff_recommended": true,
  "correlation_id": "id",
  "timestamp": "timestamp"
}
```

### `handoff.created`

```json
{
  "job_id": "uuid",
  "handoff_id": "uuid",
  "required_memory_scopes": ["palace"],
  "correlation_id": "id",
  "timestamp": "timestamp"
}
```

### `job.completed`

```json
{
  "job_id": "uuid",
  "message_id": "uuid",
  "correlation_id": "id",
  "timestamp": "timestamp"
}
```

### `job.failed`

```json
{
  "job_id": "uuid",
  "error": {
    "code": "provider_timeout",
    "message": "Provider timed out."
  },
  "correlation_id": "id",
  "timestamp": "timestamp"
}
```

## Rate Limits

Recommended defaults:

- Conversation/message reads: `120/min/user`.
- Message creation: `30/min/user`.
- Agent job creation: `10/min/user`.
- Search: `60/min/user`.
- Memory mutation: `20/min/user`.
- Handoff creation: `10/min/user`.
- Worker lease: `60/min/worker`.
- Worker heartbeat: `12/min/worker`.

Rate limit response `429`:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests.",
    "correlation_id": "id",
    "details": {
      "retry_after_seconds": 30
    }
  }
}
```

## Validation Rules

General:

- Reject unknown enum values.
- Reject missing idempotency keys for mutation endpoints.
- Reject cross-user resource access as `404` or `403` depending on product policy.
- Reject invalid state transitions as `409`.
- Reject promotion of secret/local-only memory as `422`.

Content:

- Message content maximum should be configured.
- Metadata must be JSON object.
- Source refs must be arrays.
- Confidence must be `0 <= confidence <= 1`.

## Implementation Acceptance Criteria

- Every endpoint returns `X-Correlation-ID`.
- Every mutation has idempotency behavior.
- Pagination shape is consistent.
- SSE events use documented payloads.
- Worker endpoints require worker auth.
- Invalid state transitions return `409`.
- Forbidden memory promotion returns `422`.
- Rate limits return `429`.
