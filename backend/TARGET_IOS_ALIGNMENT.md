# Target iOS Alignment

## Purpose

This document records read-only observations from the intended iOS app project:

`https://github.com/orteug/praeceptor`

The target iOS project should not be modified from this architecture workspace. Claude Code should use these facts as starting context, then re-run discovery inside the target repository before implementation.

## Observed Shape

The iOS project is a native SwiftUI voice application for The Praeceptor.

Core properties:

- Swift 6 / SwiftUI / iOS 18+.
- Native voice-first session flow.
- Claude is the required model provider.
- Apple Speech and Apple TTS are the default local/on-device voice path.
- OpenAI Whisper and OpenAI TTS are optional upgrades.
- ElevenLabs TTS is also supported.
- The ICM character layer is embedded in app-side prompt construction.
- The KNOWING layer is local, compact, and user-resettable.

The current app is not backend-mediated. It calls providers directly from the device using user-entered API keys.

## Current Runtime Facts

Observed files and behavior:

- `ios/Praeceptor/Services/ClaudeService.swift` streams directly from Anthropic's Messages API.
- `ios/Praeceptor/Services/APIKeyManager.swift` stores API keys in iOS Keychain.
- `ios/Praeceptor/Core/SessionStore.swift` persists messages to `praeceptor-session.json`.
- `ios/Praeceptor/Bridge/KnowingLayer.swift` persists `praeceptor-knowing.json`.
- `ios/Praeceptor/Models/KnowingLayerModel.swift` defines the KNOWING layer.
- `ios/Praeceptor/Services/KnowingLayerUpdater.swift` updates the KNOWING layer through a Haiku call after at least three user turns.
- `ios/Praeceptor/ICM/SystemPromptBuilder.swift` builds the fixed CHARACTER layer plus local KNOWING context.
- `ios/Praeceptor/Views/Settings/DataPrivacyView.swift` exposes local deletion/reset controls.
- Local files use complete file protection where observed.

The app already has the product distinction the architecture must preserve:

```text
CHARACTER layer: fixed, portable, not compressed away
KNOWING layer: variable, local, compact, resettable
```

## Architecture Implications

The shared-backend architecture should not assume the current app must immediately stop direct provider calls.

There are two valid iOS modes:

### Local Sovereign Mode

Current behavior:

- User supplies provider keys.
- Device calls model providers directly.
- Messages and KNOWING layer are stored locally.
- Apple voice path can minimize extra provider dependency.
- User can clear conversation history, reset KNOWING layer, or delete all data locally.

This mode is consistent with local-first sovereignty.

### Hosted Shared-Memory Mode

Future behavior:

- iOS calls backend API.
- Backend handles provider calls, Supabase retrieval, audit, correlation ids, and cross-platform memory.
- iOS can access promoted memories from desktop/Codex/Claude Code workflows.
- iOS can request deferred local handoffs when local-only context is missing.

This mode is consistent with multi-client orchestration.

The implementation should treat backend mediation as a mode or migration path, not as an immediate deletion of current local-sovereign behavior.

## Recommended iOS Migration Path

### Phase 0: Preserve Current Device Behavior

Do not remove:

- Keychain-based user provider keys.
- Direct Claude streaming path.
- Local `praeceptor-session.json`.
- Local `praeceptor-knowing.json`.
- Local data deletion/reset controls.
- CHARACTER plus KNOWING prompt structure.

### Phase 1: Add Backend Client Abstraction

Introduce an app-side protocol that can support both:

- direct provider client
- backend-mediated client

Do not force the UI to know which path is active.

Conceptual shape:

```text
SessionViewModel -> MentorResponseClient
MentorResponseClient.direct -> ClaudeService
MentorResponseClient.backend -> backend /v1/messages or /v1/agent-runs
```

### Phase 2: Add Shared-Memory Sync Controls

User-facing controls should distinguish:

- local session history
- local KNOWING layer
- promoted shared memories
- synced conversation records
- local-only memory

The existing Data & Privacy screen is the natural surface for this, but exact UI should follow the app's design system.

### Phase 3: Add Missing-Scope Behavior

When iOS asks something requiring local desktop/Codex context:

1. Backend retrieves Supabase shared context.
2. Backend detects missing local-only scope.
3. Backend returns a response that names the missing scope or creates a handoff job.
4. Local desktop worker can later answer or propose a promoted memory.
5. iOS displays the result only after policy/audit checks.

The iOS app should not silently pretend local-only memory is available.

## Memory Mapping

Current iOS concepts map to the architecture package as follows:

| iOS Concept | Current Storage | Architecture Mapping |
| --- | --- | --- |
| `ChatMessage` | `praeceptor-session.json` | messages / short-term memory |
| `KnowingLayer` | `praeceptor-knowing.json` | local fact bundle / promoted-memory candidate source |
| `lastThreeSessions` | KNOWING layer | rolling summary / mid-term memory |
| `openTensions` | KNOWING layer | active fact or unresolved issue |
| `thesisDrift` | KNOWING layer | high-signal mentor fact |
| `hisDirective` | KNOWING layer | active commitment / follow-up |
| `patternsHeSees` | KNOWING layer | structured observed pattern |
| `supplementalContext` | KNOWING layer / context folder | local-only context unless promoted |

Raw KNOWING layer data should be local-only by default. Promoted memories should be compact, user-visible, and lifecycle-tracked.

## Security And Privacy Implications

The iOS target creates one important exception to the baseline architecture:

- The architecture package says clients should call the backend instead of provider APIs.
- The existing iOS app deliberately calls providers directly for local sovereignty.

This is not automatically a defect. It is a deployment-mode distinction.

Claude Code should not remove direct provider calls unless the product decision is to move the app into hosted shared-memory mode.

If hosted mode is added:

- Backend provider keys must remain server-side.
- User-supplied device keys must not be uploaded.
- Backend auth must be explicit.
- Shared memory sync must be opt-in or clearly disclosed.
- Local deletion controls must clarify what is deleted locally versus remotely.

## Target-Specific Open Decisions

- Should iOS keep local sovereign mode after backend mode exists?
- Is backend mode required for all users, optional for cross-platform users, or only for hosted production?
- Does the app use user-supplied provider keys, backend-owned provider keys, or both depending on mode?
- Which local KNOWING fields may become promoted shared memories?
- Should iCloud-backed local files be considered single-device local, multi-device Apple-local, or shared memory for policy purposes?
- How should the current Data & Privacy screen expose shared memory deletion and promotion controls?
- Should backend-mediated streaming use SSE, WebSockets, or a Swift-native URLSession byte stream contract?

## Recommended Claude Code Behavior

Claude Code should:

- Treat the iOS app as read-only until explicitly asked to implement there.
- Preserve the existing direct-provider path unless a product decision changes it.
- Add backend mediation as an abstraction/mode, not as a hard replacement.
- Preserve the CHARACTER/KNOWING separation.
- Preserve local reset/delete semantics.
- Map iOS KNOWING fields to memory candidates before writing any sync code.
- Add tests for local-only memory not leaking into Supabase without promotion.
