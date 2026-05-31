# Promotion Policy

## Purpose

Promotion moves selected local-first memory into Supabase so it can be used across clients. This policy defines what can be promoted, what requires approval, what must stay local, and how source references are redacted.

Promotion is the main bridge between private local memory and cross-platform memory. It must be conservative.

The promotion review state machine is defined in [STATE_MACHINES.md](STATE_MACHINES.md).

## Promotion Principles

- Promote summaries, not raw archives.
- Preserve source lineage.
- Redact sensitive source references.
- Respect local-only flags.
- Require approval for sensitive memory.
- Never promote secrets.
- Prefer user-corrected memory over model-extracted memory.
- Make promotion auditable and reversible.

## Sensitivity Labels

Allowed labels:

- `public`
- `normal`
- `sensitive`
- `secret`
- `local_only`

### `public`

Safe to sync across authorized clients.

Examples:

- Non-sensitive project names.
- Public business facts.
- Published content summaries.

Promotion:

- Allowed automatically if source policy permits.

### `normal`

Appropriate for the user's shared memory.

Examples:

- Stable preferences.
- Active goals.
- Current constraints.
- High-level project summaries.
- Mentor-relevant context.

Promotion:

- Allowed automatically when confidence is high and no local-only source is involved.

### `sensitive`

Potentially private or personally sensitive.

Examples:

- Meeting notes.
- Personal relationships.
- Financial context.
- Health context.
- Private business strategy.
- Sensitive codebase references.

Promotion:

- Requires explicit user approval or a preconfigured trusted rule.

### `secret`

Must not be promoted.

Examples:

- API keys.
- Passwords.
- Tokens.
- Private keys.
- Recovery phrases.
- Credentials.

Promotion:

- Blocked.

### `local_only`

Must remain local unless the user explicitly reclassifies it.

Examples:

- Raw local archives.
- Raw email exports.
- Raw meeting transcripts.
- Full code graph payloads.
- Local scratch memory.

Promotion:

- Blocked by default.

## Default Classification

Default classifications:

- PALACE episodic snippets: `normal` or `sensitive` depending on content.
- CORPUS document chunks: `sensitive` unless source is public.
- GRAPH code structure: `sensitive` or `local_only`.
- CORTEX structured state: depends on schema; financial/contacts/calendar are `sensitive`.
- INGEST raw data: `local_only`.
- User corrections: inherit target memory sensitivity unless user overrides.

## Promotion Gates

Before promotion, verify:

1. User owns the source.
2. Source is not deleted, forgotten, invalidated, or secret.
3. Source is not local-only unless user explicitly reclassified it.
4. Sensitivity permits promotion.
5. Content is compact.
6. Source references are redacted where required.
7. Confidence meets threshold.
8. Promotion writes audit and lifecycle events.

Default confidence threshold:

- `0.80` for automatic `normal` promotion.
- `0.90` for automatic `public` promotion.
- No automatic promotion for `sensitive`, `secret`, or `local_only`.

## Approval Modes

Allowed approval modes:

- `automatic`
- `user_approved`
- `policy_approved`
- `blocked`

Automatic approval:

- Only for `public` and low-risk `normal` memory.

User approval:

- Required for sensitive memory.

Policy approval:

- Allowed for explicit user-created rules such as "sync high-level coaching summaries to iOS."

Blocked:

- Required for secret and local-only memory.

## Redaction Rules

Redact source references when they reveal sensitive details.

Sensitive fields:

- Local filesystem paths.
- Contact names.
- Meeting titles.
- Email subjects.
- Client names.
- Repository names when private.
- Document filenames when sensitive.

Redacted source ref:

```json
{
  "source_system": "palace",
  "source_type": "drawer",
  "source_id": "opaque-local-ref",
  "display_label": "Private local memory",
  "redacted": true
}
```

Non-redacted source ref:

```json
{
  "source_system": "corpus",
  "source_type": "document",
  "source_id": "doc-ref",
  "display_label": "Published article draft",
  "redacted": false
}
```

## Promoted Memory Shape

Promotion should write:

- `memory_type`
- `scope`
- `text`
- `confidence`
- `source_system`
- `source_refs`
- `sensitivity`
- `local_only = false`
- `observed_at`
- `valid_from`
- `valid_to`
- `metadata.approval_mode`
- `metadata.promotion_reason`

## Local-Only Inheritance

If any source is `local_only`, the derived memory is `local_only` unless:

- The user explicitly reclassifies it.
- The promoted text is fully detached from the raw local source.
- The source reference is redacted.
- The approval event is audited.

Default: local-only propagates.

## Secret Detection

Before promotion, scan for:

- API key patterns.
- Private key markers.
- Tokens.
- Password labels.
- Recovery phrases.
- Environment variable secrets.

If detected:

- Block promotion.
- Mark promotion result `blocked`.
- Write audit event without storing the secret in logs.

## Promotion Lifecycle

Promotion flow:

1. Worker or backend proposes memory.
2. Classifier assigns sensitivity.
3. Policy evaluates gates.
4. If approval needed, create pending memory control action.
5. If approved, write promoted memory.
6. Write lifecycle event.
7. Write audit event.
8. Refresh embedding if needed.

## User-Facing Controls

Users should be able to:

- Approve promotion.
- Reject promotion.
- Mark source local-only.
- Reclassify sensitivity.
- Redact source label.
- Delete promoted memory.
- View promotion source.

## V2 Acceptance Criteria

- Secret memory cannot be promoted.
- Local-only memory cannot be promoted by default.
- Sensitive memory requires approval.
- Normal memory can be promoted when confidence threshold passes.
- Source refs are redacted when sensitive.
- Every promotion writes audit and lifecycle events.
- Rejected promotions do not write promoted memories.
