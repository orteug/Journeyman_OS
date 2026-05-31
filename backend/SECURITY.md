# Security

## Purpose

This document defines the first security baseline for a backend-mediated, multi-client, multi-agent system using Supabase, optional local-first memory, and AI providers. The trust-zone model and credential placement rules are defined in [TRUST_BOUNDARIES.md](TRUST_BOUNDARIES.md).

Implementation-facing RLS, service-role, prompt-injection, promotion-consent, and device-revocation controls are defined in [SECURITY_APPENDIX.md](SECURITY_APPENDIX.md).

## Authentication

Clients authenticate with user tokens. The backend validates tokens before performing any read or write.

Maintenance workers authenticate with a service worker token. Service credentials must never be shipped to clients.

## Authorization

Authorization must be enforced at both the backend and database layers.

Required controls:

- Enforce row level security for user data in Supabase.
- Scope user queries by authenticated user id and explicit access grants.
- Keep service role operations server-side only.
- Restrict service role usage to approved maintenance functions and schemas.
- Deny cross-user access by default.

## Row Level Security

RLS policies should protect:

- Conversations.
- Messages.
- Summaries.
- Facts.
- Embeddings.
- Agent jobs.
- Audit views where user-visible.

Service role access should bypass RLS only in controlled server-side paths that perform their own authorization and audit logging.

## PII and Retention

The system should minimize stored PII and avoid storing sensitive data unless it is required for product behavior.

Required practices:

- Store only necessary PII.
- Encrypt sensitive fields when appropriate.
- Redact sensitive values from logs.
- Define retention windows for messages, summaries, facts, embeddings, and audit records.
- Provide deletion workflows for user data.
- Keep source lineage so derived records can be deleted or regenerated when source data is removed.
- Ensure forgotten or deleted memories are removed from retrieval indexes and promoted-memory views.

Detailed retention, forgetting, deletion, backup, and eval fixture behavior is defined in [RETENTION_POLICY.md](RETENTION_POLICY.md).

## Secrets

Secrets must be stored in a secret manager or environment variables managed by the deployment platform.

Secrets include:

- Supabase service role key.
- Supabase database URL.
- AI provider keys.
- Maintenance worker token.
- Signing secrets.

Secret handling requirements:

- Do not commit secrets to source control.
- Do not expose service keys to clients.
- Rotate keys regularly.
- Rotate immediately after suspected exposure.
- Prefer separate keys for development, staging, and production.

## Provider Data Boundaries

The backend should send providers only the context needed for the current task. Provider requests should avoid unnecessary PII and sensitive metadata.

Provider calls should record:

- Provider name.
- Model.
- Request metadata.
- Token counts.
- Latency.
- Error class.
- Correlation id.

Private chain-of-thought should not be requested, persisted, or displayed.

## Audit Logging

Admin and maintenance actions must be recorded with:

- Actor.
- Time.
- Action.
- Target resource.
- Change summary.
- Correlation id.
- Request source.
- Success or failure status.

Audit logs should cover:

- Maintenance RPCs.
- Service role mutations.
- PII scrubbing.
- Data deletion.
- Embedding refreshes.
- Summary compaction.
- Permission changes.
- Memory promotion from local-first systems.
- Local-memory handoff completion.
- User memory corrections, forgetting, promotion, and local-only controls.

## Local-First Memory Security

Local-first memory contains private source material and should be treated as a sensitive local data store.

Required controls:

- Encrypt local databases and indexes where supported.
- Keep local service tokens out of client bundles.
- Require explicit authorization before exposing local memory through a gateway or handoff worker.
- Do not sync raw local archives to Supabase by default.
- Promote only distilled, source-linked memories that are useful across clients.
- Store local-only source references without leaking sensitive raw content.
- Support revocation when a local device should no longer participate in sync or handoffs.
- Honor local-only flags during promotion and sync.

The first version should prefer promoted memory and deferred handoffs over a live inbound local memory gateway.

## Platform Boundaries

Clients have different memory access:

- iOS should assume Supabase and promoted memory only, plus a small encrypted app cache.
- Desktop may access local memory if configured on the user's machine.
- Claude Code and Codex may access local files, Graphify, and local memory only within authorized local environments.

Agent outputs should not hide these differences. If a platform lacks local memory, the system should create a handoff or state that the answer is based on available shared memory.

## Logging Safety

Structured logs should be useful for debugging without becoming a second data leak.

Logs should not include:

- Provider API keys.
- Service role keys.
- Full authorization headers.
- Sensitive PII.
- Full message content unless explicitly allowed for a secure environment.

Logs should include:

- Correlation id.
- Job id.
- Conversation id.
- User id where appropriate.
- Action.
- Status.
- Latency.
- Error class.

Logs for memory retrieval should also include memory scope names, not raw memory content.

Operational logging, metrics, dashboards, alerts, and runbooks are defined in [OPERATIONS.md](OPERATIONS.md).

## Memory Control Safety

User memory controls are security-sensitive because they can change what future agents believe.

Required controls:

- Require user authorization for forgetting, deletion, broad promotion, and local-only changes.
- Audit every correction, promotion, forgetting, deletion, and source-view action.
- Prevent model-only flows from silently deleting or promoting sensitive memory.
- Ensure forgotten memories are excluded from normal retrieval.
- Ensure deleted memories trigger cleanup of embeddings, summaries, promoted memories, and derived records where required.

## Incident Response Baseline

The first production version should have a minimal incident process:

1. Identify affected users, resources, and time range.
2. Revoke or rotate exposed credentials.
3. Disable affected workers or endpoints if needed.
4. Preserve relevant audit logs.
5. Delete or regenerate compromised derived records.
6. Document the incident and remediation.
