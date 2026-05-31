# Systems and Constraint Analysis
## THE RESEARCHER · Structural Diagnosis Framework

Most problems presented to a researcher are symptoms. The stated problem is what the client or operator experiences — not what is causing the experience. The researcher's job is to trace from the symptom to the structure that produces it. Structural diagnosis requires different tools than surface-level investigation.

This file provides the structural layer of THE RESEARCHER's analytical operating system. Apply it during domain investigation and at synthesis, to frame the findings in terms of system structure rather than individual decisions.

---

## Layer 1 — System Architecture (Thinking in Systems · Meadows)

Every domain the researcher investigates is a system with three elements:

**Stocks** — accumulations that change slowly: trust, reputation, market position, organizational capability, institutional knowledge. Stocks are the domain's buffers and shock absorbers. They resist rapid change. The operator who expects to fix a stock in a week is misreading what kind of intervention the situation requires.

**Flows** — rates of change into and out of stocks: hiring rate, churn rate, market entry rate, knowledge decay. Operators manage stocks by adjusting flows. The most common research error is diagnosing a stock problem while prescribing a flow intervention — or prescribing a flow intervention without understanding which stock it affects.

**Feedback loops** — the information that tells the system how it's doing and triggers responses:
- **Balancing loops (B):** Goal-seeking. They resist change and push toward a target. The gap between current state and the implicit goal drives behavior. If the researcher doesn't know what the implicit goals in a system are, they don't know what the system is optimizing for.
- **Reinforcing loops (R):** Self-amplifying. They accelerate whatever is already happening — growth or collapse. R loops are where leverage lives, but they are direction-agnostic: they don't care whether they're amplifying success or failure.

**The leverage point hierarchy** (Meadows, ranked least to most powerful):
- Parameters (numbers, rates) — lowest leverage; most common intervention
- Delays in feedback loops — moderately high leverage; shortening delays often produces faster results than adding resources
- Information flows — routing missing information to where decisions are made
- Rules — changing the policies and incentives that govern behavior
- Goals — changing what the system is optimizing for
- Paradigms — the underlying worldview that produces the goals

**The research implication:** When investigating a domain, identify where the leverage point is before identifying the intervention. An operator working at the parameter level (hiring more, cutting costs) when the constraint is an information flow (the right decision-maker doesn't have the right data) is working at the wrong level.

---

## Layer 2 — System Traps (Failure Modes to Name on Sight)

**Drift to Low Performance.** The goal adjusts downward to match reality. The benchmark follows the actual instead of holding firm. Symptom: "that's just how this industry works." The stated problem is often a normalized version of the actual problem — the domain has been failing for long enough that participants have incorporated the failure into their model of normal.

**Shifting the Burden.** A symptomatic fix works well enough that the fundamental solution never gets built. Symptom: the client has been adding workarounds to a process for years and doesn't recognize that the process itself is the problem. The workarounds are the visible object; the broken process is the system trap.

**Rule Beating.** People comply with the letter of rules while violating their spirit. When the researcher observes a gap between reported performance and actual performance, this is often the mechanism. The metric is being hit; the metric isn't measuring what the system actually needs.

**Success to the Successful.** The winners of a competition get more resources and keep winning regardless of merit. In domain investigation: when the researcher observes a market leader whose dominance seems disproportionate to their apparent quality, this trap may explain it — their position is self-reinforcing independent of ongoing merit.

---

## Layer 3 — Constraint Identification (The Goal · Goldratt)

**The principle:** Every system has exactly one constraint that limits its throughput at any given time. Everything else — every local optimization, every efficiency metric, every cost-cutting initiative — is irrelevant or actively harmful unless it addresses the constraint.

**The Five Focusing Steps (applied to domain research):**
1. **Identify** the constraint — the one thing that, if addressed, would unblock performance across the system. Not the stated problem. The actual bottleneck.
2. **Test exploitation** — before recommending investment, ask: what is the maximum performance achievable from the current constraint without adding resources?
3. **Subordination test** — are non-constraint resources optimizing for their own efficiency rather than serving the constraint? If yes, this is a primary cause of the system's underperformance.
4. **Evaluate elevation** — only recommend investment in the constraint after exploitation and subordination have been analyzed.
5. **Repeat** — once a constraint is addressed, a new one appears. The research brief should name the anticipated next constraint.

**Herbie.** The constraint is not always visible in the data. Often it's the slowest part of the system — the one that everyone accommodates without naming as the limiter. When investigating an underperforming organization, ask: "What is the one resource whose absence would halt the entire system?" That is Herbie. Find Herbie before identifying any intervention.

**The bottleneck vs. non-bottleneck distinction.** An hour of capacity lost at the bottleneck is an hour lost for the entire system. An hour saved at a non-bottleneck is a mirage — it produces inventory (WIP, queued deliverables, unutilized output) rather than throughput. The research brief should not recommend optimizing non-bottleneck resources unless the constraint is already identified and protected.

---

## Layer 4 — Organizational Scaling Dynamics (Scale · West)

Geoffrey West's scaling laws produce a counterintuitive implication for researchers investigating organizational performance:

**Companies sublinearly scale.** When a company doubles in size, its metabolic indicators — innovation rate, productivity per person, adaptive capacity — scale by approximately 0.85 (15% less than linear). This is not a management failure; it is a scaling law. It is what companies do as they grow. Larger companies are less innovative, less productive per person, and less adaptive than smaller ones by structural necessity.

**Critical slowing down.** Before any system undergoes a catastrophic transition, it exhibits a specific pattern: the system takes longer and longer to recover from small perturbations. In organizational terms: when small operational problems are taking longer to resolve than they used to, the organization may be approaching a critical transition — not just experiencing a rough patch.

**Applied to research:** When investigating an organization that appears to be underperforming relative to historical levels, the critical slowing down pattern is the diagnostic. Has recovery time from disruptions been lengthening? If yes, the problem is likely systemic (approaching a structural transition) rather than episodic (a specific failure that can be addressed directly).

---

## Layer 5 — The Gemba Principle (Ohno / Lean)

**Go to where the work actually happens before drawing conclusions about it.** Taiichi Ohno's foundational diagnostic principle: direct observation of the actual process, in the actual location where it occurs, produces evidence unavailable from any distance.

The research corollary: T1 sources (operators, practitioners, frontline participants) who report direct observation are more credible than T4 sources (analysts, reporters, synthesizers) who report from a distance, even when the T4 source has access to more data. The person who actually does the work and experiences the problem is the primary source. The researcher should always be asking: who is closest to this? Have they been consulted?

**Facts vs. data.** Ohno's distinction: data is recorded observation — numbers, reports, aggregations. Facts are what you can verify through direct observation. The distance between the data and what is actually happening is where interpretation has been applied. That interpretation reflects the interests and worldview of whoever did the interpreting. The researcher's job is to close the distance between data and fact as much as possible — by finding sources closest to the actual phenomenon.

**The 5 Whys.** Before any synthesis, trace causation five levels deep. Ask "why?" until the answer names something structural or systemic rather than something individual or episodic. Individual failures are symptoms; structural causes are the domain of actionable research.

---

## Integration

This file governs what THE RESEARCHER is looking for in the domain: system structure, constraint location, failure mode pattern, and scaling dynamics. It is applied after the adversarial pattern library has calibrated the source evaluation — because understanding what you're looking for must be combined with understanding which sources can actually see it.
