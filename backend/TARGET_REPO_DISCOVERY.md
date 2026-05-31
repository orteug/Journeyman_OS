# Target Repo Discovery

## Purpose

Before implementation, Claude Code must inspect the target repository and map this architecture package onto the real codebase. This prevents the drafts from forcing the wrong framework, migration style, or runtime assumptions.

## Discovery Checklist

### Target Repo Alignment

If implementing in `operator-engagement-researcher`, read `TARGET_REPO_ALIGNMENT.md` before this checklist.

If implementing in `praeceptor`, read `TARGET_IOS_ALIGNMENT.md` before this checklist.

Confirm or correct these observed facts:

- The project is currently a file-state ICM/orchestrator system.
- Root `CLAUDE.md` routes SOURCE, FILTER, DEVELOP, EXECUTE, and CALIBRATION.
- SOURCE is a Python pipeline under `source/`.
- Canonical current-state files include `engagement/context.md`, `engagement/plan.md`, `mentor-brief/brief.md`, `memory/operator-profile.md`, and `source/digests/digest_latest.md`.
- Supabase/backend/auth implementation is not yet confirmed.
- The Praeceptor iOS app currently supports local-sovereign direct provider calls.
- The Praeceptor iOS app stores API keys in Keychain and local memory in protected files.

Do not overwrite the file-state protocol while adding shared memory.

Do not replace iOS direct-provider behavior with backend-mediated behavior unless that product decision has been made explicitly.

### Repository Shape

Record:

- Monorepo or single app.
- Main app directories.
- Backend directories.
- Client directories.
- Shared packages.
- Existing docs.
- Existing architecture notes.

### Backend Runtime

Identify:

- Runtime language.
- API framework.
- Route structure.
- Middleware pattern.
- Validation library.
- Error handling pattern.
- Logging pattern.

Examples:

- Next.js route handlers.
- Express/Fastify.
- Supabase Edge Functions.
- Swift server.
- Python/FastAPI.
- Other.

### Auth

Identify:

- Auth provider.
- User id source.
- Token validation path.
- Session handling.
- Existing authorization helpers.
- Admin/service role patterns.

Questions:

- Does `auth.uid()` map directly to app users?
- Are there teams/workspaces/orgs?
- Are there existing RLS policies?

### Supabase

Identify:

- Supabase project config.
- Local Supabase setup.
- Migration folder.
- Seed scripts.
- Generated types.
- Existing tables.
- Existing RPCs.
- Existing RLS tests.

### Migrations

Identify migration tooling:

- Supabase SQL migrations.
- Prisma.
- Drizzle.
- Knex.
- Rails-style migrations.
- Other.

Do not create migrations until the tool is known.

### API

Identify:

- Existing route naming.
- Versioning strategy.
- Request validation.
- Response envelope.
- Pagination style.
- Idempotency support.
- Streaming support.
- Rate limiting.

Compare with `API_CONTRACTS.md`.

### AI Provider Integration

Identify:

- Existing provider SDKs.
- Provider abstraction layer.
- Streaming implementation.
- Prompt assembly.
- Tool calling.
- Error handling.
- Timeout handling.

### Memory and Retrieval

Identify:

- Existing conversation storage.
- Existing summaries.
- Existing embeddings.
- Existing vector search.
- Existing Graphify usage.
- Existing local memory adapters.
- Existing retrieval tests.
- Existing file-state memory sources.
- Which Markdown files are source-of-truth, generated outputs, examples, or reference material.
- How auto-written state blocks should map to memory lifecycle events.

### Workers and Jobs

Identify:

- Existing background job queue.
- Cron/worker process.
- CI jobs.
- Supabase scheduled functions.
- Retry conventions.
- Dead-letter handling.

Map existing job states to `STATE_MACHINES.md`.

### Security

Identify:

- RLS policies.
- Service role usage.
- Secret management.
- Logging redaction.
- Prompt-injection defenses.
- Tool approval gates.
- Device or worker credential patterns.

### Tests

Identify:

- Unit test framework.
- Integration test framework.
- Database test strategy.
- API test strategy.
- E2E test strategy.
- CI commands.

## Discovery Output

Claude Code should produce:

```markdown
# Target Repo Discovery

## Summary

## Existing Stack

## Architecture Fit

## Required Adaptations

## Build Slice Recommendation

## Files Likely To Change

## Tests To Add

## Risks

## Open Questions
```

## Adaptation Rules

Use existing repo patterns unless they conflict with security or correctness.

Allowed adaptations:

- Change migration syntax to match repo.
- Change endpoint implementation style.
- Use existing job queue.
- Use existing logging library.
- Use existing test framework.
- Use existing provider abstraction.

Require explicit note:

- Changing schema semantics.
- Removing lifecycle states.
- Removing RLS protections.
- Giving service role credentials to local workers.
- Skipping idempotency.
- Skipping evals.
- Treating retrieved content as instructions.

## Discovery Acceptance Criteria

Discovery is complete when Claude Code can answer:

- Where will migrations live?
- Where will API routes live?
- How will auth be enforced?
- How will RLS be tested?
- How will provider calls be made?
- How will retrieval be tested?
- How will idempotency be stored?
- How will audit events be written?
- What is the first safe implementation slice?
