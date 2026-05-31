# Desktop App Design Brief
## The Researcher — Electron Demonstration Surface
*Paste into Claude Design (claude.ai) to generate the desktop app mockup.*

---

## Product Context

The desktop app is a **Loom demonstration surface** — not a judge-facing demo. macOS Gatekeeper blocks unsigned Electron apps, and there is no code-signing budget for this competition. So the desktop app exists to be filmed running locally, not to be downloaded.

What the film shows: the full five-stage flywheel running in real time.

```
SOURCE → FILTER → DEVELOP → EXECUTE → CALIBRATION
  ↑                                         |
  └─────────────────────────────────────────┘
```

The Operator Signal pipeline pulling sources in the terminal. The Researcher filtering and emitting a brief. PRAECEPTOR reading the brief and generating the 30/60/90 engagement plan. The Mentor Brief updating live as friction surfaces during execution. The loop closing at calibration. The system is the demonstration, not the feature tour.

This brief is for the **visual design of what the camera sees** — the Electron window — not for the runtime architecture. The runtime is the existing Operator Signal pipeline plus a thin Electron wrapper.

---

## Who This Is For

- **Primary:** The Loom camera. The audience watching the Loom is the competition judge.
- **Secondary:** The operator running the system locally — visual feedback that the flywheel is alive.

---

## Layout — Three Panel Design

```
┌──────────────────────────────────────────────────────────────────────┐
│  The Researcher — Operator Engagement Intelligence                   │
│  STAGE: [ SOURCE ] → [ FILTER ] → [ DEVELOP ] → [ EXECUTE ] → [ CAL ]│
├────────────────────────┬────────────────────────┬────────────────────┤
│                        │                        │                    │
│  TERMINAL (left)       │  ENGAGEMENT STATE      │  MENTOR BRIEF      │
│                        │  (center)              │  (right)           │
│  Live pipeline output  │                        │                    │
│  pull_perplexity.py    │  Domain: [active]      │  [MENTOR_BRIEF_    │
│  signals scored        │  Problem: [restatement]│   UPDATE]          │
│  digest generated      │  Decision: [named]     │  type: capability_ │
│  SOURCE → FILTER →     │                        │   friction         │
│  RESEARCHER intake     │  Plan status:          │  date: 2026-05-29  │
│  brief delivered       │  Day 12 · Milestone 2  │                    │
│  PRAECEPTOR planning   │  On track              │  New entries       │
│  plan.md written       │                        │  fade in from top  │
│                        │  Next action:          │                    │
│  Scrolling real-time   │  [active milestone]    │                    │
└────────────────────────┴────────────────────────┴────────────────────┘
```

### Top bar — Flywheel Stage Indicator
- A single horizontal indicator showing all five stages: SOURCE · FILTER · DEVELOP · EXECUTE · CALIBRATION
- The active stage lights up. Completed stages are dimmed but visible. The operator always knows where in the loop they are.
- This is the system's primary navigation. There is no other nav.

### Left panel — Terminal
- Looks like a real terminal. Mono font. Dark background.
- Pipeline output streams in as each script and stage completes.
- Color coding: green for completed steps, yellow for in-progress, red for gaps or friction logged.
- Cost ticks up as the pipeline runs ("$0.27... $0.31... $0.35").
- Stage transitions emit visibly: `[RESEARCHER → PRAECEPTOR handoff]`, `[plan.md written]`, `[EXECUTE activated]`.
- The terminal is alive — not a static image.

### Center panel — Engagement State
- Structured read-only view of the current engagement.
- Shows: Domain · Decision · Problem (from intake) · Plan status (day count, active milestone, on-track/watch/behind) · Next action (from plan.md).
- Updates automatically as the system writes state to file.
- This panel is what the operator checks before starting each session. It answers: "Where am I? What's next?"
- Visual weight: medium. Not dominant, but never hidden.

### Right panel — Mentor Brief
- Structured document, not a terminal. Off-white background, dark text.
- Active section renders as cards — one card per `[MENTOR_BRIEF_UPDATE]` block.
- Three card styles by friction type:
  - **Execution friction:** subtle, small — it is the protocol that it shouldn't dominate
  - **Decision friction:** medium prominence, visible but not loud
  - **Capability friction:** high prominence, top of panel, accent color highlight
- New entries fade in from the top.

---

## Loom Shot — What the Camera Sees

The shot is a screen recording of the Electron window. No webcam overlay. No talking head. The system runs. The viewer watches.

### The sequence (Loom ~3-4 minutes)

**Act 1 — SOURCE (0:00–0:45)**
1. **Open.** Window loads. All three panels visible. Stage indicator shows FILTER as active (engagement is mid-research). Terminal shows last pipeline run. Mentor Brief shows existing entries.
2. **Operator triggers a fresh SOURCE run.** Stage indicator shifts left to SOURCE. Terminal lights up. `pull_perplexity.py` fires. Cost ticks. Signals score.
3. **Reddit pull completes.** Terminal output mentions a thread that surfaced an operator pain point in the engagement domain.
4. **Digest generated.** Terminal shows `digest_latest.md written`. Stage indicator: SOURCE complete, FILTER activating.

**Act 2 — FILTER (0:45–1:45)**
5. **RESEARCHER picks up the digest.** Terminal shows `[SIGNAL_PACKAGE] → THE RESEARCHER`. Stage indicator: FILTER active.
6. **Intake fires.** Terminal shows the seven-step intake sequence running — Domain confirmed, Decision named, Problem restated, Adversarial identified.
7. **Research mandate delivered.** `engagement/context.md` written. Terminal confirms file write.
8. **Brief delivered.** Terminal shows brief classification. One T2 signal promoted to T1 because the underlying source was a practitioner thread. `research_[date].md` handoff written. Stage indicator: FILTER complete, DEVELOP activating.

**Act 3 — DEVELOP (1:45–2:45)**
9. **PRAECEPTOR activates.** Stage indicator: DEVELOP active. Terminal shows PRAECEPTOR loading the brief.
10. **30/60/90 plan generated.** Center panel updates — engagement state now shows plan status: Day 1, Milestone 1: Orientation, On track. `engagement/plan.md` written. Terminal confirms.
11. **PRAECEPTOR handoff emitted.** Terminal shows `[PRAECEPTOR → EXECUTE]` routing. Stage indicator: DEVELOP complete, EXECUTE activating.

**Act 4 — EXECUTE (2:45–3:30)**
12. **EXECUTE activates.** Stage indicator: EXECUTE active. Terminal shows operator bringing a live situation.
13. **DELIVER dept fires.** Terminal shows dept loading + workflow reference (`WF_02_ENGAGEMENT_DELIVERY.md` loaded).
14. **Capability friction surfaces.** Operator's situation reveals a gap the plan didn't anticipate. Terminal emits `[MENTOR_BRIEF_UPDATE]` block. Right panel updates: a new capability friction card fades in at the top with the accent color.
15. **Camera holds — 3-4 seconds.** The viewer sees the card. The system has done its job.

**Act 5 — Loop closes (3:30–4:00)**
16. **Stage indicator.** Camera holds on the flywheel indicator: SOURCE · FILTER · DEVELOP · ▶EXECUTE · CALIBRATION. The loop is visible. The operator hasn't left the system. They've compounded.

The Loom voice-over (Ariel) describes what's happening as it happens. The film is the architecture, alive.

---

## Visual Tone

- Terminal is dark. Engagement state is neutral. Mentor Brief is light. Three tonal registers — different surfaces for different layers of the stack.
- Same restrained palette across all panels. Typography-led. Mono in the terminal; sans elsewhere.
- Stage indicator: minimal, horizontal, matches the flywheel diagram in the repo docs.
- No animations beyond card fade-in and stage indicator transitions. No flashy reveals.
- The seriousness of the tool is the aesthetic.

---

## Key UI States to Show in the Mockup

1. **Idle state** — pipeline not running, engagement active, center panel shows Day 12 of plan, Mentor Brief shows 3 existing entries
2. **SOURCE running state** — terminal active, signals scoring, cost ticking, stage indicator: SOURCE lit
3. **FILTER state** — intake running, seven-step sequence visible in terminal, stage indicator: FILTER lit
4. **DEVELOP state** — PRAECEPTOR active, center panel shows plan being written, stage indicator: DEVELOP lit
5. **EXECUTE + friction state** — capability friction card fading in on right, stage indicator: EXECUTE lit, center panel shows plan status

The mockup should produce one image per state, or one composite image showing the progression.

---

## What This Mockup Is NOT

- Not a polished marketing visual
- Not a feature tour screenshot
- Not a "look how clean this UI is" exercise
- Not a chat interface clone

It is the visual evidence that the five-stage flywheel exists and runs. The Loom uses it to show, not tell.

---

## Technical Constraints (informational — not part of the mockup)

- Electron app, local only
- Wraps the existing Operator Signal Python pipeline
- File system watcher on `engagement/context.md`, `engagement/plan.md`, and `mentor-brief/brief.md`
- Terminal panel pipes from `run_pipeline.py` and Claude Code subprocess
- Stage indicator reads from `engagement/context.md` status field
- No backend. No auth. No distribution.

---

## Acceptance Criteria for the Mockup

1. Three-panel layout is immediately legible — different surfaces for different layers
2. Flywheel stage indicator is visible at top — operator always knows where in the loop they are
3. Terminal panel reads as a real terminal
4. Center panel reads as a structured engagement state document — not a chat surface
5. Mentor Brief panel reads as a structured document with cards visually differentiated by friction type
6. Capability friction is visually dominant in the right panel — top, accent color
7. All three panels use the same palette — tonal variation, not color chaos

---

## Paste Format for Claude Design

Paste this entire brief into Claude Design. Ask Claude Design to generate:

1. A high-fidelity mockup of the Electron window at idle state (engagement active, no pipeline running)
2. A mockup at EXECUTE + friction state (pipeline complete, capability friction card visible on right)
3. A composite strip showing the five states in sequence (SOURCE → FILTER → DEVELOP → EXECUTE → loop closes)

Save outputs to `mockups/desktop-app/` in the repo.

---

*This brief is paste-ready. Do not modify before pasting.*
