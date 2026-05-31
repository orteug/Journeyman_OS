# QUICK-START
## Platform Selection Guide

The Researcher ships as four platform-specific ICM folders — two AI providers (Anthropic · OpenAI), two tiers (full · lite). The same methodology, the same voice, the same refusals on every platform. Pick the one matching the platform you already use.

**Why four platforms:** A tool that only runs in one environment reaches one operator. The Researcher is built for whoever is doing the work — whether that's Claude Code in a terminal, a Claude Project on claude.ai, OpenAI Codex in a dev environment, or a ChatGPT Project on chatgpt.com. The architecture is portable because the operator's engagement is portable. Their client doesn't care which AI provider they use.

Each folder has its own README with setup instructions.

---

## Which Folder for Which User

| You use… | Tier | Folder | What you get |
|----------|------|--------|--------------|
| Claude Code (file system, autonomous) | **Full** | [`claude-code/`](./claude-code/) | File read/write · autonomous source pulls · Mentor Brief emission |
| Claude Projects (claude.ai) | **Lite** | [`claude-projects/`](./claude-projects/) | Project Knowledge upload · manual source paste · in-chat Mentor Brief blocks |
| Codex / OpenAI agent | **Full** | [`codex/`](./codex/) | File read/write · JSON-structured rules · Mentor Brief emission |
| ChatGPT Projects (chatgpt.com) | **Lite** | [`chatgpt-projects/`](./chatgpt-projects/) | Project Knowledge + Memory feature for persistence |

---

## Full Tier vs Lite Tier — What's the Difference

| Capability | Full | Lite |
|-----------|------|------|
| File system read/write | ✅ | ❌ |
| Autonomous source pulls (URLs, transcripts, threads) | ✅ | ❌ (operator pastes) |
| Mentor Brief auto-emission to downstream system | ✅ | ❌ (emitted in chat, operator copies) |
| Persistence between sessions | ✅ (file-based) | ✅ (ChatGPT Memory) / ❌ (Claude Projects) |
| Engagement intake framework | ✅ | ✅ |
| T1–T4 credibility weighting | ✅ | ✅ |
| Refusal-based architecture | ✅ | ✅ |
| Voice files (refusals, blind-spots, signature-questions, signal-misreads) | ✅ | ✅ |

**The methodology is identical across tiers and across providers.** The architectural opinion, the seven-step intake, the refusals, the blind spots, the signature questions, and the signal-misread documentation all carry to every platform. The difference is whether the operating environment supports autonomous execution or requires manual workarounds.

---

## Setup Order

For any platform:

1. **Read [`SERVICES_AND_KEYS.md`](./SERVICES_AND_KEYS.md)** — only if you also want to run the upstream signal pipeline. The ICM folder itself requires no API keys.

2. **Open the platform-specific README.** Each folder has setup instructions tailored to that platform's deployment model.

3. **Upload or paste the files** per the README's load order.

4. **Set the system prompt or project instructions** per the README.

5. **Start a conversation.** The Researcher opens with: *"What domain are we operating in for this engagement?"*

---

## If You Want to Run the Upstream Pipeline

The Operator Signal pipeline is the reference implementation of the SOURCE stage — the upstream signal layer that feeds The Researcher with weekly market intelligence.

To run it:

1. See [`SERVICES_AND_KEYS.md`](./SERVICES_AND_KEYS.md) for the four required API keys (Perplexity, Anthropic, Firecrawl, Resend)
2. Run cost is ~$0.35 per weekly cadence
3. Pipeline architecture documented in `reference/[platform]_source-infrastructure.md` in any full-tier folder

You do not need to run the pipeline to evaluate or use The Researcher. The Researcher works with manually-pasted sources, autonomously-pulled sources, or pipeline-emitted packages — interchangeably.

---

## When to Upgrade from Lite to Full

Upgrade when:
- You want autonomous source pulls (instead of pasting)
- You want `[MENTOR_BRIEF_UPDATE]` blocks to flow into a downstream mentorship system automatically
- You want file-based persistence across sessions
- You want to wire The Researcher into an upstream signal pipeline

Migration is straightforward: same methodology, same intake framework, same voice files — the full-tier folder adds autonomy on top of what the lite tier already provides. No re-learning. The Researcher behaves identically; it just does more automatically.

---

## License

MIT. See [`LICENSE`](./LICENSE).
