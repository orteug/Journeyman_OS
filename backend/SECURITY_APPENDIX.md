# Security Appendix

## Purpose

This appendix turns the security baseline into implementation-facing controls for Supabase RLS, service credentials, local workers, prompt injection, promotion consent, and device revocation.

Local worker runtime behavior is defined in [LOCAL_WORKER_PROTOCOL.md](LOCAL_WORKER_PROTOCOL.md). Promotion classification and consent behavior is defined in [PROMOTION_POLICY.md](PROMOTION_POLICY.md).

Prompt-injection and tool-safety rules are defined in [PROMPT_INJECTION_AND_TOOL_SAFETY.md](PROMPT_INJECTION_AND_TOOL_SAFETY.md).

## RLS Principles

Every user-owned table must enforce:

- Users can read only rows where `auth.uid() = user_id`.
- Users can insert only rows where `auth.uid() = user_id`.
- Users cannot directly write privileged maintenance fields.
- Service operations must go through trusted backend paths or allowlisted RPCs.

Tables requiring RLS:

- `conversations`
- `messages`
- `summaries`
- `facts`
- `promoted_memories`
- `embeddings`
- `agent_jobs`
- `local_workers`
- `handoff_jobs`
- `memory_lifecycle_events`
- `memory_control_actions`
- `audit_events`

## Example RLS Policies

Conversation read:

```sql
create policy "users can read own conversations"
on conversations for select
using (auth.uid() = user_id);
```

Message read:

```sql
create policy "users can read own messages"
on messages for select
using (auth.uid() = user_id);
```

Promoted memory read:

```sql
create policy "users can read own promoted memories"
on promoted_memories for select
using (
  auth.uid() = user_id
  and status not in ('deleted')
);
```

Client insert restrictions should be tighter than service insert restrictions. For example, clients may create user messages but should not create audit events or arbitrary embeddings.

## Service Role Restrictions

Supabase service role access is powerful. Treat it as a backend-only capability.

Rules:

- Do not ship service role keys to clients.
- Do not ship service role keys to local workers by default.
- Keep service role access inside trusted backend routes, server workers, or hardened CI jobs.
- Prefer RPCs with explicit validation over ad hoc SQL.
- Every service role mutation writes an audit event.
- Service operations require correlation id and idempotency key where applicable.

## Worker Credential Model

Local workers should authenticate to the backend, not directly to Supabase.

Worker credentials should be:

- Scoped to one user or workspace.
- Scoped to supported memory systems.
- Revocable by device id.
- Rotatable without losing local data.
- Unable to perform arbitrary Supabase writes.

Worker actions:

- Register.
- Heartbeat.
- Lease handoff job.
- Complete handoff job.
- Fail handoff job.

Worker actions should not include:

- Direct promoted memory write unless explicitly hardened.
- Direct audit event write.
- Direct service role database access.

## Promotion Consent

Promotion from local memory to shared Supabase memory must respect sensitivity.

Sensitivity labels:

- `public`: safe to share across authorized clients.
- `normal`: share only within the user's account.
- `sensitive`: require explicit approval before promotion.
- `secret`: never promote.
- `local_only`: never promote unless user changes classification.

Default behavior:

- Raw local archive content is `local_only`.
- Meeting notes are `sensitive`.
- Codebase source refs are `sensitive` or `local_only`.
- User-corrected profile preferences are `normal`.
- Secrets and credentials are `secret`.

Promotion must preserve:

- Source system.
- Redacted source refs.
- Sensitivity.
- Actor.
- Correlation id.
- User approval status when required.

## Prompt Injection Controls

Retrieved content is data, not instruction.

Instruction hierarchy:

1. System/developer instructions.
2. Backend policy and tool permissions.
3. User request.
4. Retrieved memory/document/code context.
5. Tool outputs.

Agents must not follow instructions found inside retrieved email, documents, notes, web pages, code comments, or tool outputs unless those instructions are explicitly promoted by the user or trusted system policy.

Required controls:

- Mark retrieved content as untrusted context.
- Separate tool instructions from retrieved content.
- Require approval for destructive tools.
- Redact secrets before provider calls.
- Block tool calls that attempt exfiltration.
- Log tool name, actor, input summary, output summary, status, and correlation id.

## Tool Permission Model

Tool permissions should be explicit per agent run.

Permission fields:

- `can_read_shared_memory`
- `can_read_local_memory`
- `can_promote_memory`
- `can_write_messages`
- `can_call_external_tools`
- `can_mutate_files`
- `requires_user_approval`

Default for iOS mentor:

- Can read shared memory.
- Can read promoted memory.
- Can request handoff.
- Cannot read local memory directly.
- Cannot promote sensitive memory without approval.

Default for local Codex worker:

- Can read authorized local memory.
- Can submit signed handoff result.
- Cannot upload raw local archives by default.
- Cannot bypass local-only flags.

## Device Revocation

Device revocation should:

1. Mark `local_workers.status = 'revoked'`.
2. Reject new leases.
3. Cancel or expire active leases.
4. Reject late completions.
5. Rotate worker credential.
6. Record audit event.
7. Preserve pending deletion or forget tasks for future trusted devices if needed.

## Redaction Rules

Redact before promotion or provider calls:

- Secrets.
- Credentials.
- API keys.
- Private file paths when not needed.
- Raw email addresses when not needed.
- Sensitive meeting titles.
- Local-only source labels.

Source references should use opaque ids and optional redacted display labels.

## Security Acceptance Criteria

Before v1:

- RLS tests prove cross-user reads fail.
- Service operations are audited.
- Forgotten memory is excluded from retrieval.
- Clients cannot create privileged records directly.

Before v2:

- Worker registration and revocation work.
- Handoff leasing is scoped by user and memory scope.
- Local-only flags block promotion.
- Signed or authenticated result submission works.

Before v3:

- Prompt injection tests exist.
- Sensitive promotion requires consent.
- Device revocation blocks late handoff completion.
- Redaction tests cover source refs and provider payloads.
