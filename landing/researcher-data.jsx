// The Researcher — scripted fiction.
// One coherent engagement: an operator stepped in as interim VP of Operations
// at a mid-market last-mile delivery company twelve days ago. The standing
// decision is whether to consolidate a sprawling carrier base or renegotiate
// in place. The pipeline pulls signals, the Researcher briefs, PRAECEPTOR
// plans, and the Mentor Brief logs friction as the operator executes.
//
// Terminal lines are [kind, text]. kind drives color in TerminalPanel.

// ─────────────────────────── Flywheel stages ───────────────────────────
const STAGES = [
  { id: 'source',  label: 'Source',  num: '01' },
  { id: 'filter',  label: 'Filter',  num: '02' },
  { id: 'develop', label: 'Develop', num: '03' },
  { id: 'execute', label: 'Execute', num: '04' },
  { id: 'cal',     label: 'Calibration', num: '05' },
];

// ─────────────────────────── Engagement state ───────────────────────────
// Center panel content. Varies subtly by stage (idle vs re-planning).
const ENGAGEMENT = {
  ref: 'ENG-0440',
  domain: 'Last-mile delivery operations',
  role: 'Interim VP, Operations — mid-market regional carrier',
  decision: 'Consolidate the seven-carrier 3PL base to three — or renegotiate in place.',
  problem: 'Contribution margin is bleeding ~40 bps a quarter to carrier cost creep. The board wants a defensible plan inside ninety days.',
  adversarial: 'The incumbent carriers know the contracts better than the operator does.',
  horizon: '30 / 60 / 90 day',
  // plan status per stage
  plan: {
    idle:    { day: 12, milestone: 'Milestone 2 of 4', title: 'Carrier cost teardown', status: 'On track', tone: 'ok' },
    source:  { day: 12, milestone: 'Milestone 2 of 4', title: 'Carrier cost teardown', status: 'On track', tone: 'ok' },
    filter:  { day: 12, milestone: 'Milestone 2 of 4', title: 'Carrier cost teardown', status: 'On track', tone: 'ok' },
    develop: { day: 12, milestone: 'Milestone 3 — drafting', title: 'Negotiation posture', status: 'Revising', tone: 'warn' },
    execute: { day: 12, milestone: 'Milestone 2 of 4', title: 'Carrier cost teardown', status: 'Watch', tone: 'warn' },
  },
  nextAction: {
    idle:    'Isolate the three lanes driving 60% of overage. Pull unit economics by lane.',
    source:  'Isolate the three lanes driving 60% of overage. Pull unit economics by lane.',
    filter:  'Isolate the three lanes driving 60% of overage. Pull unit economics by lane.',
    develop: 'Stand up a walk-away position before the next carrier QBR. Build the BATNA.',
    execute: 'Stand up a walk-away position before the next carrier QBR. Build the BATNA.',
  },
};

// ─────────────────────────── Mentor brief entries ───────────────────────────
// type: capability (high prominence, accent), decision (medium), execution (subtle).
// `fresh` marks the card that fades in at the top during EXECUTE.
const BRIEF_BASE = [
  {
    id: 'b-cap-1', type: 'capability', date: '2026-05-26',
    head: 'No carrier unit-economics model',
    body: 'Operator reads the P&L fluently but has no frame for carrier cost per stop, per lane, per failed delivery. Keeps requesting lane data without a model to judge it against.',
    tag: 'capability_friction',
  },
  {
    id: 'b-dec-1', type: 'decision', date: '2026-05-25',
    head: 'Deferring the consolidate-vs-renegotiate call',
    body: 'Twelve days in. The decision keeps moving behind a request for “more data.” The threshold to decide has not been named, so it cannot be met.',
    tag: 'decision_friction',
  },
  {
    id: 'b-exe-1', type: 'execution', date: '2026-05-21',
    head: 'Weekly ops review runs long',
    body: 'Ninety minutes over. No decision log kept — actions evaporate between sessions.',
    tag: 'execution_friction',
  },
];

const BRIEF_FRESH = {
  id: 'b-cap-2', type: 'capability', date: '2026-05-29', fresh: true,
  head: 'Walked into the carrier QBR with no walk-away',
  body: 'The operator cannot anchor a renegotiation without a credible BATNA. The 30/60/90 assumed leverage that has not been built. This is the gap the plan did not anticipate — surfaced under live pressure, not in planning.',
  tag: 'capability_friction',
};

// ─────────────────────────── Terminal scripts ───────────────────────────
// Each stage is the stream you'd see while that stage runs.
const TERM = {
  idle: [
    ['sys',  'operator-signal · run_pipeline.py — idle'],
    ['gap',  ''],
    ['dim',  '— last run 2026-05-29 06:14 ——————————————'],
    ['ok',   '✓ digest_latest.md written  ·  14 signals retained'],
    ['ok',   '✓ engagement/context.md current'],
    ['ok',   '✓ engagement/plan.md current  ·  Day 12'],
    ['gap',  ''],
    ['sys',  'watching engagement/  ·  mentor-brief/'],
    ['dim',  'no stage active. awaiting trigger.'],
    ['cursor', ''],
  ],
  source: [
    ['cmd',  'python pull_perplexity.py --domain last-mile-ops'],
    ['sys',  'SOURCE  ·  pulling operator signals'],
    ['out',  'query set: carrier cost creep, 3PL consolidation, freight renegotiation'],
    ['cost', 'tokens 3,180   ·   $0.21'],
    ['ok',   '✓ perplexity  ·  9 sources'],
    ['cmd',  'python pull_reddit.py --subs logistics,supplychain,3PL'],
    ['out',  'r/logistics  ·  thread: "renegotiating last-mile DSP rates — what worked"'],
    ['warn', '⟳ scoring  ·  practitioner thread, high signal'],
    ['score','  reddit:18kq2  relevance 0.91   practitioner 0.88   → T2'],
    ['score','  perplexity:fr-rate-bench  relevance 0.74        → T3'],
    ['cost', 'tokens 7,940   ·   $0.34'],
    ['ok',   '✓ reddit  ·  6 threads  ·  1 flagged practitioner'],
    ['path', '› writing digest_latest.md'],
    ['ok',   '✓ digest_latest.md written  ·  15 signals'],
    ['handoff', '[ SOURCE → FILTER ]  digest ready'],
    ['cursor', ''],
  ],
  filter: [
    ['handoff', '[ SIGNAL_PACKAGE → THE RESEARCHER ]'],
    ['sys',  'FILTER  ·  intake sequence'],
    ['ok',   '✓ 1 · domain confirmed       last-mile delivery operations'],
    ['ok',   '✓ 2 · decision named         consolidate vs renegotiate'],
    ['ok',   '✓ 3 · problem restated       margin creep, 90-day mandate'],
    ['ok',   '✓ 4 · adversarial identified incumbents hold contract knowledge'],
    ['ok',   '✓ 5 · constraints logged     board cycle, no signing authority yet'],
    ['warn', '⟳ 6 · classifying signals…'],
    ['warn', '  reddit:18kq2  T2 → T1   source is a practitioner thread'],
    ['ok',   '✓ 7 · mandate delivered'],
    ['path', '› writing engagement/context.md'],
    ['ok',   '✓ context.md written'],
    ['path', '› writing research_2026-05-29.md'],
    ['ok',   '✓ brief delivered  ·  1 promoted to T1'],
    ['handoff', '[ FILTER → DEVELOP ]  brief handed off'],
    ['cursor', ''],
  ],
  develop: [
    ['handoff', '[ THE RESEARCHER → PRAECEPTOR ]'],
    ['sys',  'DEVELOP  ·  PRAECEPTOR'],
    ['out',  'loading research_2026-05-29.md  ·  context.md  ·  plan.md'],
    ['cost', 'tokens 11,260   ·   $0.41'],
    ['warn', '⟳ reconciling new signal against active 30/60/90'],
    ['out',  'T1 promotion shifts the negotiation window forward'],
    ['warn', '⟳ drafting Milestone 3 — Negotiation posture'],
    ['out',  '  → prerequisite: credible walk-away (BATNA) not yet built'],
    ['path', '› revising engagement/plan.md'],
    ['ok',   '✓ plan.md written  ·  Day 12  ·  Milestone 3 queued'],
    ['handoff', '[ PRAECEPTOR → EXECUTE ]  routing operator'],
    ['cursor', ''],
  ],
  execute: [
    ['handoff', '[ EXECUTE activated ]'],
    ['sys',  'EXECUTE  ·  operator brought a live situation'],
    ['out',  'situation: carrier QBR moved up to Thursday'],
    ['path', '› loading dept DELIVER'],
    ['ok',   '✓ WF_02_ENGAGEMENT_DELIVERY.md loaded'],
    ['out',  'checking plan readiness against live demand…'],
    ['bad',  '✗ gap · no walk-away position prepared'],
    ['bad',  '✗ plan assumed leverage not yet built'],
    ['warn', '⟳ emitting mentor-brief update…'],
    ['handoff', '[ MENTOR_BRIEF_UPDATE ]  type: capability_friction'],
    ['path', '› appending mentor-brief/brief.md'],
    ['ok',   '✓ brief.md updated  ·  card surfaced'],
    ['cost', 'tokens 14,880   ·   $0.52'],
    ['cursor', ''],
  ],
};

Object.assign(window, { STAGES, ENGAGEMENT, BRIEF_BASE, BRIEF_FRESH, TERM });
