# Project State

## Current Objective

Prepare a v3+ hybrid local-first memory architecture package for handoff to Claude Code, which will implement the architecture in a target repository with project-specific context.

## What Exists

The workspace contains architecture and handoff documentation only. No application code has been implemented here.

The intended target repository has been inspected read-only:

`https://github.com/orteug/Journeyman_OS`

Observed target shape: a file-state ICM/orchestrator system using SOURCE, FILTER, DEVELOP, EXECUTE, and CALIBRATION stages. Current canonical state lives in Markdown files such as `engagement/context.md`, `engagement/plan.md`, `mentor-brief/brief.md`, `memory/operator-profile.md`, and SOURCE digests. The architecture package now includes `TARGET_REPO_ALIGNMENT.md` to preserve that context.

The intended iOS app repository has also been inspected read-only:

`https://github.com/orteug/praeceptor`

Observed iOS shape: a SwiftUI voice app that currently uses direct device-to-provider calls, Keychain-held user API keys, local protected JSON files for session history and KNOWING layer state, and a Data & Privacy screen for local reset/delete controls. The architecture package now includes `TARGET_IOS_ALIGNMENT.md` so hosted shared-memory mode is designed as an explicit extension, not an accidental replacement.

The docs now cover:

- Shared Supabase memory architecture.
- Local-first memory architecture.
- v0/v1/v2/v3 implementation sequence.
- Trust boundaries.
- Database schema.
- API contracts.
- State machines.
- Handoff jobs.
- Local worker protocol.
- Promotion and sensitivity policy.
- Retention policy.
- Prompt-injection and tool safety.
- Retrieval routers for v1 and v3.
- Cross-platform agent identity.
- Operations and observability.
- Memory eval fixtures.
- Claude Code handoff prompt.
- Target repository discovery checklist.
- Decision register.
- Documentation status.

## Recommended Next Step

Start a new conversation or hand this folder to Claude Code with:

1. [BUILD_HANDOFF.md](BUILD_HANDOFF.md)
2. [CLAUDE_CODE_PROMPT.md](CLAUDE_CODE_PROMPT.md)
3. [TARGET_REPO_ALIGNMENT.md](TARGET_REPO_ALIGNMENT.md)
4. [TARGET_IOS_ALIGNMENT.md](TARGET_IOS_ALIGNMENT.md)
5. [TARGET_REPO_DISCOVERY.md](TARGET_REPO_DISCOVERY.md)
6. [DECISION_REGISTER.md](DECISION_REGISTER.md)
7. [DOC_STATUS.md](DOC_STATUS.md)

Claude Code should inspect the target repo first and produce a discovery report before implementation.

## Do Not Do Next

Do not start by implementing V2 or V3.

Do not start by writing migrations before confirming migration tooling.

Do not replace the target repo's existing file-state protocol with Supabase state in the first pass.

Do not replace the Praeceptor iOS app's direct-provider local-sovereign mode unless the product decision is explicit.

Do not treat these docs as frozen if the target repo has established patterns.

Do not give local workers Supabase service role keys by default.

Do not skip RLS, idempotency, prompt-injection, or memory eval tests.

## Build Direction

Build v0 first:

- Preserve the existing file-state protocol.
- Add a read-only adapter from local Markdown state to normalized memory candidates.
- Supabase schema and RLS.
- Conversations.
- Messages.
- One provider adapter.
- Basic recent-message retrieval.
- Summaries.
- Embeddings.
- Correlation ids.
- Audit events.

Then build v1:

- Promoted memory.
- Memory lifecycle events.
- User correction and forgetting.
- Deterministic retrieval router.
- Memory eval fixtures.
- API contracts.

Only then move to v2:

- Local worker registration.
- Handoff leasing.
- Worker completion/failure.
- Promotion policy enforcement.

Then v3:

- Multi-client hybrid behavior.
- Multi-backend router.
- Cross-platform identity.
- Operations dashboards/runbooks.

## Open Decisions To Resolve In Target Repo

Tracked in [DECISION_REGISTER.md](DECISION_REGISTER.md):

- Backend runtime.
- Migration tooling.
- Embedding model and dimension.
- SSE vs WebSockets.
- Organization/workspace model.
- Provider adapter shape.
- First local backend integration.
- Backup retention window.
- Memory control UI surface.
- Eval runner location.

## Final Handoff Note

This package is designed to preserve the v3+ destination while forcing implementation through safe gates. The next agent should use the target repo's actual context to adapt the docs, not blindly implement every draft detail.
