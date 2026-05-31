# Database Schema

## Purpose

This document defines the Supabase/Postgres schema required for the shared memory spine, auditable memory lifecycle, handoff jobs, and v3+ hybrid local-first architecture.

It is implementation-facing but repository-agnostic. Claude Code should adapt naming and migration style to the target project.

## Extensions

Required extensions:

```sql
create extension if not exists vector;
create extension if not exists pgcrypto;
```

Recommended extensions:

```sql
create extension if not exists citext;
```

## Enum Types

Recommended enums:

```sql
create type conversation_status as enum (
  'active',
  'archived',
  'deleted'
);

create type message_role as enum (
  'system',
  'user',
  'assistant',
  'agent',
  'tool'
);

create type memory_status as enum (
  'captured',
  'extracted',
  'validated',
  'promoted',
  'retrieved',
  'superseded',
  'invalidated',
  'forgotten',
  'deleted'
);

create type memory_lifecycle_event_type as enum (
  'captured',
  'extracted',
  'validated',
  'promoted',
  'retrieved',
  'corrected',
  'superseded',
  'invalidated',
  'forgotten',
  'deleted'
);

create type memory_type as enum (
  'semantic',
  'episodic',
  'procedural',
  'structural',
  'decision',
  'preference',
  'goal',
  'constraint',
  'project',
  'profile'
);

create type memory_scope as enum (
  'user',
  'conversation',
  'project',
  'organization',
  'local_only'
);

create type source_system as enum (
  'supabase',
  'cortex',
  'palace',
  'corpus',
  'graph',
  'ingest',
  'user_correction',
  'maintenance_worker'
);

create type sensitivity_label as enum (
  'public',
  'normal',
  'sensitive',
  'secret',
  'local_only'
);

create type handoff_status as enum (
  'queued',
  'leased',
  'running',
  'completed',
  'failed_retryable',
  'failed_terminal',
  'expired',
  'cancelled',
  'dead_lettered'
);

create type worker_status as enum (
  'active',
  'paused',
  'revoked',
  'offline'
);

create type audit_action as enum (
  'create',
  'update',
  'delete',
  'forget',
  'promote',
  'correct',
  'retrieve',
  'handoff_create',
  'handoff_lease',
  'handoff_complete',
  'worker_register',
  'worker_revoke',
  'maintenance_run'
);
```

## Core Tables

### `profiles`

Use Supabase auth users as the identity source. `profiles.id` should reference `auth.users.id`.

Required columns:

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `conversations`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `status conversation_status not null default 'active'`
- `title text`
- `client_source text`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz`
- `deleted_at timestamptz`

Indexes:

- `(user_id, updated_at desc)`
- `(user_id, status, updated_at desc)`

### `messages`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `conversation_id uuid not null references conversations(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `role message_role not null`
- `content text not null`
- `metadata jsonb not null default '{}'`
- `agent_id text`
- `job_id uuid`
- `correlation_id text`
- `token_count integer`
- `visibility text not null default 'user'`
- `created_at timestamptz not null default now()`
- `deleted_at timestamptz`

Indexes:

- `(conversation_id, created_at desc)`
- `(user_id, created_at desc)`
- `(job_id)`
- `(correlation_id)`

Constraint:

- `messages.user_id` must match the owning conversation user. Enforce with trigger or write path validation.

### `summaries`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `conversation_id uuid not null references conversations(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `version integer not null`
- `summary_text text not null`
- `summary_type text not null default 'rolling'`
- `source_message_ids uuid[] not null default '{}'`
- `created_by text not null`
- `created_at timestamptz not null default now()`
- `validated_at timestamptz`
- `metadata jsonb not null default '{}'`

Indexes:

- `(conversation_id, version desc)`
- `(user_id, created_at desc)`

Unique constraint:

- `(conversation_id, version)`

### `facts`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `conversation_id uuid references conversations(id) on delete set null`
- `scope memory_scope not null`
- `fact_text text not null`
- `confidence numeric not null check (confidence >= 0 and confidence <= 1)`
- `status memory_status not null default 'extracted'`
- `source_type text not null`
- `source_id text not null`
- `source_message_ids uuid[] not null default '{}'`
- `observed_at timestamptz not null default now()`
- `valid_from timestamptz`
- `valid_to timestamptz`
- `superseded_by uuid references facts(id) on delete set null`
- `expires_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `metadata jsonb not null default '{}'`

Indexes:

- `(user_id, status, created_at desc)`
- `(user_id, scope, status)`
- `(conversation_id, created_at desc)`
- `(superseded_by)`

### `promoted_memories`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `conversation_id uuid references conversations(id) on delete set null`
- `agent_id text`
- `memory_type memory_type not null`
- `scope memory_scope not null`
- `text text not null`
- `confidence numeric not null check (confidence >= 0 and confidence <= 1)`
- `status memory_status not null default 'promoted'`
- `source_system source_system not null`
- `source_refs jsonb not null default '[]'`
- `visibility text not null default 'user'`
- `sensitivity sensitivity_label not null default 'normal'`
- `local_only boolean not null default false`
- `observed_at timestamptz not null default now()`
- `valid_from timestamptz`
- `valid_to timestamptz`
- `superseded_by uuid references promoted_memories(id) on delete set null`
- `expires_at timestamptz`
- `last_validated_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `metadata jsonb not null default '{}'`

Indexes:

- `(user_id, status, updated_at desc)`
- `(user_id, memory_type, status)`
- `(user_id, scope, status)`
- `(conversation_id, status, updated_at desc)`
- `(local_only)`

Important rule:

- `local_only = true` rows must not be returned to cloud-primary clients unless explicitly authorized by policy.

### `embeddings`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `conversation_id uuid references conversations(id) on delete set null`
- `source_type text not null`
- `source_id uuid not null`
- `embedding_model text not null`
- `content_hash text not null`
- `vector vector(1536) not null`
- `status memory_status not null default 'validated'`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:

- `(user_id, source_type, source_id)`
- `(conversation_id)`
- `(content_hash)`
- IVFFLAT or HNSW vector index depending on Supabase plan and expected scale.

Unique constraint:

- `(source_type, source_id, embedding_model, content_hash)`

### `agent_jobs`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `conversation_id uuid references conversations(id) on delete cascade`
- `agent_id text not null`
- `status text not null`
- `input jsonb not null default '{}'`
- `output jsonb`
- `correlation_id text not null`
- `idempotency_key text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `completed_at timestamptz`
- `error jsonb`

Indexes:

- `(user_id, created_at desc)`
- `(conversation_id, created_at desc)`
- `(correlation_id)`
- `(idempotency_key)`

Unique constraint:

- `(user_id, idempotency_key)` where `idempotency_key is not null`

## Handoff Tables

### `local_workers`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `device_id text not null`
- `runtime_name text not null`
- `supported_memory_scopes text[] not null default '{}'`
- `public_key text`
- `status worker_status not null default 'active'`
- `last_seen_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `revoked_at timestamptz`

Indexes:

- `(user_id, status)`
- `(device_id)`

Unique constraint:

- `(user_id, device_id)`

### `handoff_jobs`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `conversation_id uuid references conversations(id) on delete cascade`
- `requesting_agent_id text not null`
- `target_runtime text not null`
- `required_memory_scopes text[] not null default '{}'`
- `task text not null`
- `acceptance_criteria jsonb not null default '[]'`
- `status handoff_status not null default 'queued'`
- `correlation_id text not null`
- `idempotency_key text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `expires_at timestamptz not null`
- `leased_by_worker_id uuid references local_workers(id) on delete set null`
- `leased_until timestamptz`
- `lease_attempt integer not null default 0`
- `result_summary text`
- `result_refs jsonb not null default '[]'`
- `promotion_recommendation jsonb`
- `confidence numeric check (confidence >= 0 and confidence <= 1)`
- `completed_at timestamptz`
- `error_code text`
- `error_message text`
- `retry_after timestamptz`
- `attempt_count integer not null default 0`
- `metadata jsonb not null default '{}'`

Indexes:

- `(user_id, status, created_at desc)`
- `(status, expires_at)`
- `(leased_by_worker_id, leased_until)`
- `(correlation_id)`

Unique constraint:

- `(user_id, idempotency_key)`

## Lifecycle, Controls, and Audit

### `memory_lifecycle_events`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `memory_id uuid not null`
- `memory_table text not null`
- `event_type memory_lifecycle_event_type not null`
- `actor text not null`
- `correlation_id text not null`
- `previous_status memory_status`
- `next_status memory_status`
- `reason text`
- `source_refs jsonb not null default '[]'`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`

Indexes:

- `(user_id, created_at desc)`
- `(memory_table, memory_id, created_at desc)`
- `(correlation_id)`

### `memory_control_actions`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `action text not null`
- `target_type text not null`
- `target_id uuid not null`
- `status text not null`
- `request_text text`
- `result_summary text`
- `correlation_id text not null`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`
- `completed_at timestamptz`

Indexes:

- `(user_id, created_at desc)`
- `(target_type, target_id)`
- `(correlation_id)`

### `audit_events`

Required columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references profiles(id) on delete set null`
- `actor text not null`
- `action audit_action not null`
- `target_type text not null`
- `target_id text not null`
- `change_summary text`
- `correlation_id text not null`
- `request_source text`
- `status text not null`
- `metadata jsonb not null default '{}'`
- `created_at timestamptz not null default now()`

Indexes:

- `(user_id, created_at desc)`
- `(action, created_at desc)`
- `(target_type, target_id)`
- `(correlation_id)`

## RLS Policy Baseline

Enable RLS on all user-owned tables:

```sql
alter table conversations enable row level security;
alter table messages enable row level security;
alter table summaries enable row level security;
alter table facts enable row level security;
alter table promoted_memories enable row level security;
alter table embeddings enable row level security;
alter table agent_jobs enable row level security;
alter table local_workers enable row level security;
alter table handoff_jobs enable row level security;
alter table memory_lifecycle_events enable row level security;
alter table memory_control_actions enable row level security;
alter table audit_events enable row level security;
```

User-owned read policy pattern:

```sql
create policy "users can read own rows"
on conversations for select
using (auth.uid() = user_id);
```

User-owned insert policy pattern:

```sql
create policy "users can insert own rows"
on conversations for insert
with check (auth.uid() = user_id);
```

Repeat with table-specific restrictions. Do not allow clients to directly insert privileged rows such as audit events, embeddings, or maintenance results unless explicitly required.

## Service Access Pattern

Preferred pattern:

- Clients use user-scoped APIs.
- Backend uses service role only inside trusted server paths.
- Local workers do not receive Supabase service role keys by default.
- Local workers submit signed results to backend.
- Backend validates and writes shared records.

## RPC Allowlist

Maintenance operations should be exposed through explicit RPCs or server endpoints:

- `summarize_thread`
- `refresh_embeddings`
- `compact_thread`
- `scrub_pii`
- `promote_memory`
- `lease_handoff_job`
- `complete_handoff_job`
- `fail_handoff_job`
- `record_memory_lifecycle_event`

Each RPC must:

- Verify actor.
- Verify target ownership.
- Verify idempotency key where applicable.
- Write audit events.
- Return correlation id.

## Open Migration Decisions

Before implementation, decide:

- Embedding dimension and model.
- IVFFLAT vs HNSW vector index.
- Whether organizations/workspaces are needed in v1.
- Whether `visibility` should become an enum.
- Whether local source refs need encryption at rest.
- Whether audit events are append-only through database permissions or application policy.
