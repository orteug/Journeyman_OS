# The Researcher
## Operator Engagement Intelligence Layer

**GitHub:** https://github.com/orteug/Journeyman_OS · **Live demo:** https://journeyman-os.vercel.app

**An engagement intelligence layer for operators who move between domains — built to deploy on day one, not after day thirty.**

For fractional executives, interim operators, and consultants who need to understand a new client's landscape quickly — before the first deliverable, not after.

---

## The Problem

The firehose doesn't stop. The operator is not the bottleneck. The filter is.

You walk into a new engagement and spend the first thirty days rebuilding the same thing every time — a map of the market the client operates in, the competitors they aren't watching, the operators in the space who know things that don't appear in any report.

This is that map, productized. Built to deploy on day one of the next engagement, not after day thirty.

---

## How to Run It

### Path 1 — Run it yourself (ICM folders)

Four platform-specific folders — two AI providers (Anthropic · OpenAI), two tiers (full · lite). Same methodology, same voice, same refusals on every platform. Pick the one you already use:

| Platform | Tier | Folder |
|----------|------|--------|
| **Claude Code** | Full — file read/write, autonomous pulls, Mentor Brief emission | [`claude-code/`](./claude-code/) |
| **Claude Projects** | Lite — Project Knowledge upload, manual workarounds | [`claude-projects/`](./claude-projects/) |
| **Codex (OpenAI)** | Full — file read/write, JSON-structured rules, Mentor Brief emission | [`codex/`](./codex/) |
| **ChatGPT Projects** | Lite — Project Knowledge + Memory feature for persistence | [`chatgpt-projects/`](./chatgpt-projects/) |

Each folder has its own README with setup instructions. Pick one. Drop it in. The Researcher opens with the domain question.

For setup order and required API keys: see [`SERVICES_AND_KEYS.md`](./SERVICES_AND_KEYS.md).

---

## How the Flywheel Runs

The Researcher is the Filter stage of a five-stage flywheel. Each stage hands
off to the next via files on disk — no servers, no orchestration layer, no
state that lives only in chat.

```
SOURCE → FILTER → DEVELOP → EXECUTE → CALIBRATION
  ↑                                         |
  └─────────────────────────────────────────┘
```

FILTER has two components: Stage 2A (The Researcher produces the brief) and Stage 2B (KNOWLEDGE files it and packages it for PRAECEPTOR).

### Start the system

Open a terminal at the repo root and run:

```bash
claude
```

The orchestrator (`CLAUDE.md`) reads system state and routes you to the
appropriate stage automatically:

- No `engagement/context.md` -> intake (Stage 2)
- Active engagement, fresh `digests/digest_latest.md` -> signal summary
- Capability friction logged in `mentor-brief/brief.md` -> Stage 3 (Praeceptor)

You never invoke a stage by name. You bring what you have. The orchestrator
routes.

### The auto-write file system

State lives in three files. The orchestrator writes them automatically —
the operator watches them update.

| File | Written by | When |
|------|-----------|------|
| `engagement/context.md` | The Researcher | After intake confirmation |
| `mentor-brief/brief.md` | The Researcher / Praeceptor | On every `[MENTOR_BRIEF_UPDATE]` block |
| `engagement/plan.md` | Praeceptor | After the 30/60/90 plan is produced |

This is how the system persists across sessions. The next time you open
`claude`, the orchestrator reads these files and knows exactly where the
engagement stands.

### Run SOURCE (Stage 1)

If you want fresh upstream signal before intake:

```bash
cd source
python3 run_pipeline.py --skip-send
```

For judges with no API keys (no cost, no credentials, end-to-end demo):

```bash
cd source
python3 run_pipeline.py --dry-run
```

The pipeline writes `source/digests/digest_latest.md`. The Researcher
reads it the next time you start a session.

See [`source/README.md`](./source/README.md) for full setup, configuration,
and cost details.

### The loop

```
SOURCE collects     ->  digest_latest.md
THE RESEARCHER      ->  engagement/context.md + mentor-brief/brief.md
PRAECEPTOR plans    ->  engagement/plan.md
EXECUTION reveals   ->  new gaps appear in mentor-brief/brief.md
Loop back           ->  SOURCE refresh, RESEARCHER follow-up, or PRAECEPTOR adjustment
```

Execution always reveals what you didn't know going in. The system is built
to absorb that — every new gap routes back to the right stage. The
operator compounds across cycles.

---

## Built by THE_TEAM

This entry wasn't built by one developer. It was built by an AI-enabled execution layer that one solo operator spent six months assembling — orchestrators, specialists, handoff protocols, knowledge layer, finance layer, delivery layer — and the system built this submission inside its own protocol.

The Researcher you're evaluating is also the proof of the system that built it. Each architectural decision in this folder was produced through the same protocol that any future engagement-intelligence work will run through. There is no other path.

See [`BEHIND_THE_BUILD.md`](./BEHIND_THE_BUILD.md) for the story of how the system built itself.

---

## Stack Context

The Researcher is the Filter stage of a five-stage operator flywheel:

```
SOURCE → FILTER → DEVELOP → EXECUTE → CALIBRATION
  ↑                                         |
  └─────────────────────────────────────────┘
```

Built across six competitions. Each competition was a case study proving a principle. Comp #6 — this one — is the piece that closes the loop.

See [`STACK_CONTEXT.md`](./STACK_CONTEXT.md) for the full arc.

---

## Documentation

| File | Purpose |
|------|---------|
| [`WRITEUP.md`](./WRITEUP.md) | The architectural argument — three paragraphs, one opinion, one gap |
| [`STACK_CONTEXT.md`](./STACK_CONTEXT.md) | The flywheel arc, four principles, four case studies |
| [`BEHIND_THE_BUILD.md`](./BEHIND_THE_BUILD.md) | How the system built itself |
| [`JUDGE_GUIDE.md`](./JUDGE_GUIDE.md) | 5-minute evaluation path |
| [`QUICK-START.md`](./QUICK-START.md) | Platform selection guide |
| [`SERVICES_AND_KEYS.md`](./SERVICES_AND_KEYS.md) | API and service setup checklist |
| [`PROCESS_LOG.md`](./PROCESS_LOG.md) | THE_TEAM executing this build in real time |
| [`workflows/`](./workflows/) | Canonical operator protocols — what the flywheel executes against |
| [`backend/`](./backend/) | Memory backbone — cross-platform persistence architecture |

---

## License

MIT. See [`LICENSE`](./LICENSE).
