# The Praeceptor — KNOWING Layer Template

The variable context layer. ≤800 tokens. Written by The Praeceptor at session end or on phase transitions.

---

## Schema

```json
{
  "updated": "ISO8601 timestamp",
  "person": {
    "name": "string",
    "primary_mission": "one sentence — what they're actually building",
    "sovereignty_stage": "string — where they are in their operator journey",
    "original_thesis": "one sentence — what they said they were building when they started"
  },
  "current_state": {
    "active_project": "string",
    "active_phase": "string",
    "what_they_are_doing": "one sentence — observable activity",
    "what_they_said_they_would_do": "one sentence — last stated intention"
  },
  "last_three_sessions": [
    {
      "date": "YYYY-MM-DD",
      "what_surfaced": "one sentence",
      "what_was_decided": "one sentence or null",
      "what_was_avoided": "one sentence or null"
    }
  ],
  "open_tensions": [
    "string — one sentence per tension, maximum 3"
  ],
  "thesis_drift": "null or one sentence describing how the original thesis has shifted",
  "his_directive": "null or one sentence — something he left with them that hasn't been acknowledged",
  "patterns_he_sees": [
    "string — from the Seven Blind Spots, only those confirmed visible"
  ],
  "next_session_intent": "one sentence — what he plans to open with or return to"
}
```

---

## Rules for Writing the KNOWING Layer

1. **Write at session end.** Not during. He doesn't take notes while talking.
2. **≤800 tokens always.** Compress if necessary. Remove the oldest session from `last_three_sessions` first.
3. **`thesis_drift` is the most important field.** If the original thesis and the current state have diverged, it must be named here explicitly.
4. **`his_directive`** is the thing he left them with. If they haven't acted on it by next session, it opens the conversation.
5. **`open_tensions`** — maximum 3. Not observations, not notes — tensions. Things that are unresolved and matter.
6. **Never write what can be derived.** If the current state is visible from what the person said in the session, don't restate it — synthesize it.

---

## Example KNOWING Layer (filled)

```json
{
  "updated": "2026-05-15T09:00:00Z",
  "person": {
    "name": "Marcus",
    "primary_mission": "Build a B2B SaaS product on top of the consulting relationships he already has",
    "sovereignty_stage": "Consulting covers expenses — wants to stop trading time for money within 18 months",
    "original_thesis": "Productize the retainer: same work, fixed price, scalable delivery"
  },
  "current_state": {
    "active_project": "Pitch deck for seed raise",
    "active_phase": "Refinement — third revision",
    "what_they_are_doing": "Polishing financial model and competitive analysis section",
    "what_they_said_they_would_do": "Send the deck to two warm contacts by end of last week"
  },
  "last_three_sessions": [
    {
      "date": "2026-05-15",
      "what_surfaced": "Deck has been in refinement for four months with no investor conversations started",
      "what_was_decided": "Deck is ready — the refinement loop is avoidance, not preparation",
      "what_was_avoided": "Whether the consulting work is actually fundable or just a lifestyle business"
    },
    {
      "date": "2026-05-08",
      "what_surfaced": "Two practice runs done, last one two months ago — no external feedback since",
      "what_was_decided": "Need real feedback from investors, not co-founder and friends",
      "what_was_avoided": null
    },
    {
      "date": "2026-05-01",
      "what_surfaced": "Revenue projections built on assumptions that have never been tested with a paying customer",
      "what_was_decided": null,
      "what_was_avoided": "Conversation about whether the product has been validated at all"
    }
  ],
  "open_tensions": [
    "Deck is a proxy for the real fear — that the first investor conversation will expose the thesis",
    "Consulting clients are comfortable with him as a person, not committed to the product"
  ],
  "thesis_drift": "Original thesis was productize the retainer. Current pitch is a platform play with ARR projections. The productized retainer never shipped.",
  "his_directive": "Send the deck to two contacts this week. Not polish it. Send it.",
  "patterns_he_sees": [
    "Motion mistaken for momentum — active refinement, no forward movement",
    "Mistaking learning for action — more research instead of first conversation"
  ],
  "next_session_intent": "Open with: did you send it? If not, that's what we're talking about."
}
```
