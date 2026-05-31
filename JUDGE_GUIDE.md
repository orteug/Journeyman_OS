# JUDGE GUIDE
## The Researcher — 5-Minute Evaluation Path

**GitHub:** https://github.com/orteug/Journeyman_OS · **Live demo:** https://journeyman-os.vercel.app

This guide is for the competition judge. The path below is designed for 5 minutes. Each step is testable.

---

## 5-Minute Path

### Step 0 — Start the flywheel (30 seconds)

Open a terminal. Navigate to this repo. Run:

```bash
claude
```

The orchestrator (`CLAUDE.md` at the repo root) reads system state and
routes you to the first stage automatically. No flags, no menus — you
bring what you have, the system routes.

On a fresh clone there's no active engagement, so the orchestrator goes
straight to Stage 2 (The Researcher) and asks the domain question. The
file system is the UI — watch `engagement/context.md`,
`mentor-brief/brief.md`, and `engagement/plan.md` update as the system
runs.

**No external API keys required for this path.** The ICM folders run entirely inside Claude Code. Perplexity, Firecrawl, and Resend are only needed for the SOURCE pipeline (`run_pipeline.py`), which is optional. The `--dry-run` flag shows the full pipeline structure with zero API calls if you want to see it without credentials.

### Step 1 — Pick a platform (60 seconds)

The Researcher ships as four platform-specific ICM folders — two AI providers (Anthropic · OpenAI), two tiers (full · lite). Pick whichever you already use:

| Platform | Folder | Tier |
|----------|--------|------|
| Claude Code (file system access, autonomous) | [`claude-code/`](./claude-code/) | Full |
| Claude Projects (claude.ai web) | [`claude-projects/`](./claude-projects/) | Lite |
| Codex / OpenAI agent | [`codex/`](./codex/) | Full |
| ChatGPT Projects (web) | [`chatgpt-projects/`](./chatgpt-projects/) | Lite |

If you don't want to set anything up, skip to Step 2.

### Step 2 — Read the architectural argument (90 seconds)

[`WRITEUP.md`](./WRITEUP.md) is three paragraphs. Read it before running anything — it explains the design opinion that makes this system different from a research chatbot. Pay attention to the third paragraph (The Gap): a system that knows what it cannot do is more useful than one that pretends it can do everything.

### Step 3 — Run the intake (90 seconds)

Open a terminal at the repo root. Run `claude`. The orchestrator (`CLAUDE.md`) reads system state and routes automatically. On a fresh clone there is no active engagement, so it goes straight to The Researcher and asks:

> *"What domain are we operating in for this engagement?"*

Answer with anything — a real engagement, a hypothetical, the world of competition judging. Watch the seven-step intake run. Watch `engagement/context.md` write itself to disk.

### Step 4 — Skim STACK_CONTEXT (60 seconds)

[`STACK_CONTEXT.md`](./STACK_CONTEXT.md) explains the flywheel. Four principles, four case studies. The competition entries weren't four separate tools — they were four principles, each tested against a domain, now wired into a loop.

### Step 5 — The voice folder (30 seconds, optional)

Most submissions stop at identity + rules + examples. This one ships `icm/voice/` files in every platform folder — full and lite:

- `refusals.md` — what The Researcher will not do
- `blind-spots.md` — what it cannot see from outside the engagement
- `signature-questions.md` — the five questions it reaches for most
- `signal-misreads.md` — documented cases where the pipeline surfaced noise as signal

This is the productionized opinion. The system knows its own failure modes.

---

## What to Look For

### The architectural opinion (one)

The problem determines the reach. The search is unlimited. The synthesis is weighted by source credibility — and these three dimensions are independent.

Most researchers conflate them. The Researcher refuses all three conflations. The refusal is structurally enforced — visible in the `rules.md` tier hierarchy and in the `icm/voice/refusals.md` content.

### Domain-first intake — seven steps, not one

The intake runs seven steps — **Domain → Decision → Problem → Scope → Context → Adversarial → Gaps** — before any search begins. This is rule A1, enforced in every platform's `rules.md`.

Two steps are non-obvious and worth testing:

**The Decision step** forces the operator to name what they will do with the findings the day they receive them. A brief for a go/no-go pitch is different from one that informs week-one deliverables. Without naming the decision, every brief becomes orphaned intelligence — found, but not acted on.

**The Adversarial step** asks: *"Who has the most to gain from you walking in with bad intelligence on this?"* Most research tools assume good-faith sources. This step accounts for competitive interests, former consultants who left narratives the client has absorbed, and data providers whose revenue depends on the operator believing a particular market story. If the operator says "no one," the researcher names two candidates and asks them to react. Every domain has them.

After all seven steps, the researcher delivers a **Research Mandate** — one paragraph restating domain + decision + problem + adversarial risk map + known gaps. The operator confirms it before the search begins. That confirmation is the contract. The brief will be traceable back to it.

The first question is rule A2, verbatim in every platform: *"What domain are we operating in for this engagement?"* Without a domain, nothing else begins.

### The gate

The Researcher will not synthesize from T4 sources alone. If only synthesized intelligence is available (Perplexity, analyst reports, news aggregators), it refuses the brief and names where T1/T2 ground signal must be sought.

This gate is the architectural opinion in operating form. Try it: set up any platform folder and ask for a synthesis with only news-grade sources. It will refuse.

### The Gaps section

Every brief ends with a Gaps section. What was not found. Where stronger signal should be sought. Why the gap matters.

This is mandatory per rule A7. A brief without it is incomplete by definition.

---

## Real Automation

The Researcher is one stage of a flywheel. The upstream stage — SOURCE — runs as a live Python pipeline (Perplexity + Reddit + Google Trends + Firecrawl) on weekly cadence at ~$0.35/run. The pipeline emits structured signal packages that The Researcher reads and filters.

This pipeline is documented in `reference/[platform]_source-infrastructure.md` in each full-tier folder. The setup checklist for running it locally is [`SERVICES_AND_KEYS.md`](./SERVICES_AND_KEYS.md) at the repository root.

The SOURCE pipeline itself ships in this repo under [`source/`](./source/). See [`source/README.md`](./source/README.md) for setup, configuration, and cost.

### To see the pipeline run (no cost):

```bash
cd source
python3 run_pipeline.py --dry-run
```

`--dry-run` prints every step the pipeline would execute and exits without making a single API call. No keys required. This is the verified no-cost demo path — judges can run it on a fresh clone in under a minute.

You do not need to run the pipeline to evaluate The Researcher. The pipeline is the reference implementation of how upstream signal feeds in. The Researcher itself works with operator-pasted sources, autonomously-pulled sources, or pipeline-emitted packages — interchangeably.

---

## The Build

This submission was not built by one developer. It was built by THE_TEAM — an AI-enabled execution layer the operator spent six months assembling. The Researcher itself was the first real test of the methodology it teaches.

See [`BEHIND_THE_BUILD.md`](./BEHIND_THE_BUILD.md) for the story.

See [`PROCESS_LOG.md`](./PROCESS_LOG.md) for the timestamped record of this build's execution sequence.

---

## What This Submission Is NOT

- Not a chatbot wrapper
- Not a feature tour
- Not a single-domain tool (HVAC, real estate, SaaS — the domain is the operator's input, not the product's claim)
- Not a research-as-a-service product
- Not yet a SaaS

It is methodology, productized into four platform folders (two providers × two tiers), with a complete documentation arc and a live upstream signal pipeline.

---

## File Index

| File | What it's for |
|------|---------------|
| [`README.md`](./README.md) | One-page entry point |
| [`WRITEUP.md`](./WRITEUP.md) | Three-paragraph architectural argument |
| [`STACK_CONTEXT.md`](./STACK_CONTEXT.md) | Flywheel arc, four case studies |
| [`BEHIND_THE_BUILD.md`](./BEHIND_THE_BUILD.md) | How the system built itself |
| [`QUICK-START.md`](./QUICK-START.md) | Which platform folder for which user |
| [`SERVICES_AND_KEYS.md`](./SERVICES_AND_KEYS.md) | Setup checklist for upstream pipeline |
| [`PROCESS_LOG.md`](./PROCESS_LOG.md) | This build, timestamped |
| [`workflows/`](./workflows/) | Canonical operator protocols the flywheel runs against |
| [`backend/`](./backend/) | Memory backbone architecture — cross-platform persistence layer |
| [`claude-code/`](./claude-code/) | Full-tier deployment for Claude Code |
| [`claude-projects/`](./claude-projects/) | Lite-tier deployment for Claude Projects |
| [`codex/`](./codex/) | Full-tier deployment for Codex |
| [`chatgpt-projects/`](./chatgpt-projects/) | Lite-tier deployment for ChatGPT Projects |

---

*Pick a platform. Open https://journeyman-os.vercel.app. Read the WRITEUP. Five minutes.*
