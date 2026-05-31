# Web App Design Brief
## The Researcher — Operator-Facing Product Surface
*Paste into Claude Design (claude.ai) to generate the web app mockup.*

---

## Product Context

The Researcher is a generalist investigative intelligence layer for operators entering new client engagements — fractional executives, interim operators, consultants. The web app is the **operator-facing product surface**: the interface an operator reaches for on the day they sign a new engagement, before day one.

This is not a marketing site. This is the product, exposed.

The architectural opinion is domain-first intake — seven steps before any search begins. The first question is always *"What domain are we operating in for this engagement?"* and the page must surface that immediately, without prelude. The web app is where that conversation happens for operators who aren't running Claude Code or Codex locally.

The four ICM folders (claude-code · claude-projects · codex · chatgpt-projects) are the self-hosted paths. The web app is the zero-setup path for operators who want to deploy on day one without any configuration.

---

## Who This Is For

- **Primary:** An operator who has just signed a new engagement and needs an intelligence layer running before day one. They want to answer the domain question now, not after setting up a local environment.
- **Secondary:** A fractional executive who bounces between three platforms and wants one URL that always works.

---

## Demo Path (under 3 steps)

```
1. Operator opens the URL
2. Page loads. First question visible at the top, input already focused.
3. Operator types. The researcher runs the seven-step intake. Research begins.
```

No login. No signup. No marketing copy above the fold. The product is the page.

---

## UI Requirements

### Layout
- Single page. Centered column, max-width ~720px.
- Top: minimal masthead — "The Researcher" + one-line tagline ("Engagement intelligence for operators who move between domains.")
- Middle: conversation surface. The researcher's first message is pre-rendered on load — the domain question, already visible.
- Below the first message: a subtle intake progress indicator showing where in the seven-step sequence the conversation is (step 1 of 7, step 2 of 7…). Disappears after intake confirms.
- Bottom: input field, focused automatically on load. Submit on Enter.
- No sidebar. No nav. No footer except attribution + GitHub link.

### Visual tone
- Operator-grade. Not consumer. Functional over decorative.
- Typography-led design. Mono or near-mono for the conversation. Sans for chrome.
- Color: restrained. Off-white background. Dark text. One accent color (deep blue or graphite) for the researcher's messages.
- No illustrations, no gradients, no marketing patterns. The seriousness of the tool is the aesthetic.

### Interaction
- The first message from the researcher is **pre-rendered on load** — not streamed in. The operator sees the question the moment the page settles.
- After operator input, the researcher's reply streams in (token-by-token feel).
- No "thinking..." spinner. The stream is the indicator.
- After intake confirms (step 7 + Research Mandate acknowledged), the intake progress indicator disappears. The conversation becomes unbounded.
- After brief delivery, a Gaps section renders inline — plain text, no special component. Structure is in the prose, not the UI.

### Mobile
- Mobile-first responsive. Works in iOS Safari without horizontal scroll. Same single-column layout, slightly tighter padding.

---

## The Researcher's First Message (spec it exactly)

The page renders this message before the operator types anything:

```
What domain are we operating in for this engagement?

The first move. Always. Before problem, before scope, before search.

(Mid-market HVAC operators in the Southeast? Boutique real estate brokerages
in Austin? Solo fractional CFOs serving SaaS under $5M ARR? One sentence.)
```

This is non-negotiable. The first message is the architectural opinion in action. Seven steps follow — but the operator only sees one question at a time.

### The intake sequence (each fires after the previous is answered)

```
Step 1 — Domain:     "What domain are we operating in for this engagement?"
Step 2 — Decision:   "What decision does this brief inform — and what happens the day you receive it?"
Step 3 — Problem:    "What within that domain is still unresolved?"
Step 4 — Scope:      "How far does this problem reach?"
Step 5 — Context:    "What do you already know going in?"
Step 6 — Adversarial:"Who has the most to gain from you walking in with bad intelligence on this?"
Step 7 — Gaps:       "Where has research already been done? What have you tried to find and couldn't?"
```

After step 7: the researcher delivers a **Research Mandate** — one paragraph restating domain + decision + problem + adversarial risk map + known gaps. Operator confirms. Search begins.

The page design should accommodate this conversation depth. Not just one question — a full intake that runs seven exchanges before anything is synthesized.

---

## Refusal State (UI requirement)

When the researcher refuses — T4-only synthesis, verdict on lagging data, operator-client dynamics — the refusal renders inline. No modal. No warning panel. The refusal is part of the conversation and must feel like a considered response, not a system error.

Example of how a refusal reads:
> *"There are no T1 or T2 sources in this set. I have Perplexity output and two analyst reports. That's not enough to brief on. Before I write findings, I need either: (a) a Reddit/forum thread from operators in this space, (b) a competitor URL you can paste, or (c) 30 minutes with a practitioner. Which is easiest to get?"*

This is not an error state. It is the researcher working correctly.

---

## Off-Surface Footer

Below the conversation (visible at bottom of viewport or after scroll):

- "Built by [Ariel]. Full system → [GitHub link]"
- "Deploy on your platform: claude-code · claude-projects · codex · chatgpt-projects"
- "This is the FILTER stage of a five-stage flywheel. The others are in the repo."

The footer does not interrupt the demo. It exists so a curious operator can find the full system.

---

## Technical Constraints

- **Vercel deployment.** SSR for the initial render so the first message is in the HTML (no flash, no JS-required loading state).
- **Backend:** `api/researcher.js` (Vercel Function) calls Anthropic API with ICM context injected as system prompt. Context loads from the `claude-code/` folder — same content as the full-tier system, same behavioral contract.
- **No authentication.** No accounts. Refresh starts a new conversation.
- **Rate limiting.** IP-based via Vercel Edge or Upstash. Cost per conversation ~$0.01–$0.05.
- **Streaming response.** SSE or Vercel built-in streaming.

---

## What This Page Is NOT

- Not a landing page
- Not a marketing site
- Not a chatbot clone (no "regenerate," no thumbs-up/thumbs-down, no model picker)
- Not a feature tour
- Not a demo that walks you through capabilities — it IS the capability

---

## Acceptance Criteria

1. Page loads in under 1.5s on a clean connection
2. First message is in the initial HTML (verify by viewing source before JS runs)
3. Input is focused on load
4. Submit-on-Enter works
5. Intake progress indicator shows current step through steps 1–7
6. Refusal renders inline — same surface as normal responses
7. Stream renders without flicker
8. Mobile Safari works without horizontal scroll
9. No login or signup at any point
10. Gaps section renders in-line at brief close — no special component

---

## Paste Format for Claude Design

Paste this entire brief into Claude Design. Ask Claude Design to generate:

1. A high-fidelity desktop mockup showing: idle state (first message visible, input focused)
2. A desktop mockup showing: mid-intake state (step 4 of 7 visible, progress indicator active)
3. A desktop mockup showing: brief delivered state (Findings · Hypotheses · Gaps · Route rendered inline)
4. A mobile mockup showing: idle state
5. A refusal state mockup — the researcher's inline refusal rendered in the conversation

Save outputs to `mockups/web-app/` in the repo.

---

*This brief is paste-ready. Do not modify before pasting.*
