# Documentation Status

## Purpose

This file records the status of each architecture document so Claude Code does not treat every draft as equally final.

Statuses:

- `draft`: conceptually useful but expected to change.
- `implementation-candidate`: ready to guide implementation, pending target-repo adaptation.
- `accepted`: stable decision unless implementation proves otherwise.
- `implemented`: reflected in code.
- `superseded`: replaced by a newer doc or decision.

## Current Status

| Document | Status | Notes |
| --- | --- | --- |
| `BUILD_HANDOFF.md` | implementation-candidate | Start here for Claude Code. |
| `CLAUDE_CODE_PROMPT.md` | implementation-candidate | Prompt for target-repo handoff. |
| `TARGET_REPO_ALIGNMENT.md` | implementation-candidate | Read-only observations from the intended target repo. |
| `TARGET_IOS_ALIGNMENT.md` | implementation-candidate | Read-only observations from the Praeceptor iOS app. |
| `TARGET_REPO_DISCOVERY.md` | implementation-candidate | Must run before implementation. |
| `DECISION_REGISTER.md` | implementation-candidate | Open decisions must be resolved explicitly. |
| `IMPLEMENTATION_SEQUENCE.md` | accepted | Sequencing strategy: v0/v1 before v2/v3. |
| `ARCHITECTURE.md` | implementation-candidate | Top-level architecture direction. |
| `TRUST_BOUNDARIES.md` | implementation-candidate | Credential and retrieval boundary baseline. |
| `DATABASE_SCHEMA.md` | draft | Needs target migration tooling and embedding dimension decision. |
| `MEMORY_MODEL.md` | implementation-candidate | Core model and lifecycle concepts. |
| `API_SPEC.md` | draft | High-level API overview. Use `API_CONTRACTS.md` for implementation detail. |
| `API_CONTRACTS.md` | implementation-candidate | Endpoint contracts, pending target framework adaptation. |
| `STATE_MACHINES.md` | implementation-candidate | State transition baseline. |
| `SECURITY.md` | implementation-candidate | Security overview. |
| `SECURITY_APPENDIX.md` | implementation-candidate | RLS/service-role/prompt-injection/device controls. |
| `PROMPT_INJECTION_AND_TOOL_SAFETY.md` | implementation-candidate | Required before broad hybrid retrieval. |
| `HANDOFF_STATE_MACHINE.md` | implementation-candidate | V2 handoff queue contract. |
| `LOCAL_WORKER_PROTOCOL.md` | implementation-candidate | V2 worker contract. |
| `PROMOTION_POLICY.md` | implementation-candidate | V2 promotion/sensitivity policy. |
| `RETENTION_POLICY.md` | draft | Needs product/legal retention decisions. |
| `LOCAL_FIRST_MEMORY.md` | implementation-candidate | Local-first layer overview. |
| `V1_RETRIEVAL_ROUTER.md` | implementation-candidate | Deterministic v1 retrieval algorithm. |
| `V3_HYBRID_PLATFORM.md` | implementation-candidate | V3 target platform behavior. |
| `V3_MEMORY_ROUTER.md` | implementation-candidate | V3 multi-backend retrieval. |
| `CROSS_PLATFORM_IDENTITY.md` | implementation-candidate | Agent identity and memory-scope behavior. |
| `OPERATIONS.md` | implementation-candidate | V3 operational requirements. |
| `MEMORY_EVALS.md` | implementation-candidate | Eval categories and metrics. |
| `MEMORY_EVAL_FIXTURES.md` | implementation-candidate | Concrete eval fixtures and thresholds. |
| `USER_MEMORY_CONTROLS.md` | implementation-candidate | User-facing memory controls. |
| `LOCAL_DEV.md` | draft | Illustrative only; must adapt to target repo. |
| `MAINTENANCE_WORKER.md` | implementation-candidate | Worker/maintenance behavior baseline. |
| `AGENT_PROTOCOL.md` | implementation-candidate | Agent envelope, output, handoff, and memory-scope protocol. |

## Update Rule

When implementation begins:

1. Resolve target-repo facts through `TARGET_REPO_DISCOVERY.md`.
2. Update `DECISION_REGISTER.md` for each resolved open decision.
3. Update affected docs when implementation differs.
4. Change document status from `draft` to `implementation-candidate`, `accepted`, or `implemented` only when justified.

## Known Draft Areas

The most likely docs to change during target-repo implementation:

- `DATABASE_SCHEMA.md`
- `API_CONTRACTS.md`
- `LOCAL_DEV.md`
- `RETENTION_POLICY.md`
- `DECISION_REGISTER.md`

Reasons:

- Migration tooling is unknown.
- Backend runtime is unknown.
- Streaming protocol is open.
- Embedding model/dimension is open.
- Product/legal retention windows are open.
