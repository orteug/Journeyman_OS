# Target Repo Alignment

## Purpose

This document records the read-only facts observed from the intended target project:

`https://github.com/orteug/Journeyman_OS`

The target project should not be modified from this architecture workspace. Claude Code should use these facts as a starting point, then re-run discovery inside the target repository before implementation.

## Observed Shape

The target project is currently an operator-intelligence system organized around a file-state flywheel, not a conventional backend application.

Current stages:

```text
SOURCE -> FILTER -> DEVELOP -> EXECUTE -> CALIBRATION
```

Core state is written to Markdown files:

- `engagement/context.md`
- `engagement/plan.md`
- `mentor-brief/brief.md`
- `source/digests/digest_latest.md`
- `memory/operator-profile.md`
- `memory/domain-library/*.md`

The project uses platform-specific instruction folders:

- `claude-code/`
- `claude-projects/`
- `codex/`
- `chatgpt-projects/`
- `praeceptor/`
- `execute/`
- `knowledge/`

The first implementation pass must preserve this file-state protocol rather than replacing it prematurely with database state.

## Current Runtime Facts

Observed from the target docs and source files:

- SOURCE is a Python pipeline under `source/`.
- `source/run_pipeline.py` orchestrates Perplexity, Reddit, Google Trends, Firecrawl, and digest synthesis.
- The pipeline writes `source/digests/digest_latest.md`.
- The root `CLAUDE.md` is the system orchestrator.
- The orchestrator reads session state from local Markdown files before routing.
- No active engagement is currently present in `engagement/context.md`.
- No active plan is currently present in `engagement/plan.md`.
- No mentor friction is currently logged in `mentor-brief/brief.md`.
- The repo already distinguishes SOURCE, FILTER, DEVELOP, EXECUTE, and CALIBRATION responsibilities.

Unknown until target-repo discovery:

- Whether a backend app exists outside the currently visible file-state system.
- Whether Supabase is already configured.
- Whether a web app or desktop app has implementation code beyond design briefs/mockups.
- Whether there is an existing auth model.
- Whether deployment is Vercel, local-only, desktop-first, or mixed.

## Architecture Implications

The hybrid memory architecture should map onto the current system in stages:

### Stage A: Preserve Local File State

Do not immediately migrate `engagement/context.md`, `engagement/plan.md`, `mentor-brief/brief.md`, or `memory/operator-profile.md` into Supabase.

Instead, treat them as the existing local canonical state for the current prototype.

The first useful bridge is an adapter that can read these files and produce normalized memory candidates.

### Stage B: Add Supabase As Shared Memory Spine

Supabase should first store shared, auditable records that need cross-platform access:

- conversations
- messages
- summaries
- promoted memories
- memory lifecycle events
- audit events
- handoff jobs

This should not erase the local file protocol. It should create a shared layer that clients can use when they cannot access local files.

### Stage C: Introduce File-To-Memory Promotion

The target repo already has valuable local state. The safest first local-memory bridge is a promotion path:

```text
local Markdown state -> normalized candidate -> policy review -> promoted memory -> Supabase
```

Candidate sources:

- operator profile facts
- active engagement context
- confirmed research mandate
- mentor brief updates
- completed engagement plan milestones
- source digest findings

Raw files should not be synced by default.

### Stage D: Add Handoffs Before Live Local Access

For clients that cannot read the local repo directly, especially iOS, use deferred handoff jobs before live local gateway behavior.

Example:

```text
iOS mentor asks a question
backend checks Supabase
backend detects missing local-only scope
backend creates a handoff job
desktop/local worker leases the job
worker reads local files or local memory
worker returns a compact answer or promotion candidate
backend writes audited result
iOS receives answer when available
```

This matches the current architecture package and avoids exposing local runtime directly to mobile clients.

## Revised First Build Slice For This Target

Because this target is file-state-first, Claude Code should not start by assuming there is already a backend route tree.

Recommended first target-specific slice:

1. Inventory the file-state protocol.
2. Identify which files are canonical state, generated state, examples, and reference material.
3. Define a normalized memory-event model that can represent:
   - engagement intake
   - research mandate
   - source digest signal
   - mentor brief update
   - plan milestone
   - calibration outcome
4. Add Supabase only after deciding where backend/API code belongs.
5. Build a read-only file adapter before any file-to-database migration.
6. Add promotion review before syncing local file facts into shared memory.

## Target-Specific Open Decisions

These decisions should be resolved before implementation:

- Is the first product surface a web app, desktop app, Claude Code workflow, or iOS coach backend?
- Should Supabase be introduced as a new backend service or as a companion service to the local file system?
- Which local files are source-of-truth versus generated outputs?
- Should `memory/operator-profile.md` become a promoted-memory source, or remain local-only until explicit approval?
- How should auto-written Markdown blocks map to memory lifecycle events?
- What is the first cross-platform user value: iOS continuity, web demo persistence, desktop local retrieval, or Claude Code orchestration?

## Risks If Ignored

- A backend-first implementation could break the current working ICM protocol.
- Supabase could duplicate local files without clear source-of-truth rules.
- The iOS/web shared-memory layer could answer without knowing when local-only context is missing.
- Local operator-profile facts could be promoted without consent.
- The product could lose the useful property that it works from files with no server.

## Recommended Claude Code Behavior

Claude Code should:

- Treat the target repo as a local-first file-state product until proven otherwise.
- Read `CLAUDE.md`, `README.md`, `STACK_CONTEXT.md`, `source/README.md`, `memory/operator-profile.md`, `engagement/context.md`, `engagement/plan.md`, and `mentor-brief/brief.md` before proposing implementation.
- Avoid reading or copying secrets from `SERVICES_AND_KEYS.md`; only extract non-secret service names if needed.
- Produce a target-specific discovery report before editing.
- Preserve existing file-state behavior in v0.
- Add Supabase as an extension path, not a replacement path.
