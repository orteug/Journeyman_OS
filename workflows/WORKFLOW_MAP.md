# Workflow Map
## How the Operator OS Workflows Connect to the Flywheel
**Last updated:** 2026-05-30

---

The operator workflows are the canonical operating protocols that the flywheel executes against. The flywheel provides the intelligence and planning infrastructure. The workflows define what the operator is actually doing in each engagement type.

```
SOURCE → FILTER → DEVELOP → EXECUTE → CALIBRATION
  ↑                                         |
  └─────────────────────────────────────────┘
```

---

## Flywheel Stage → Workflow Mapping

| Flywheel Stage | Component | Workflow | What the workflow provides |
|----------------|-----------|----------|---------------------------|
| **SOURCE** | Signal collection pipeline | WF_07_INTELLIGENCE.md | The 6 watchlist categories, signal tiers, routing cadence, weak signal detection — what the pipeline is actually scanning for |
| **FILTER** | THE RESEARCHER intake | WF_01_BUSINESS_DEVELOPMENT.md | Trust equation, TRM assessment, discovery framework — the lens for reading BD and prospect signals |
| **FILTER** | THE RESEARCHER synthesis | WF_02_ENGAGEMENT_DELIVERY.md | Engagement diagnostic structure — what the researcher is mapping before Day 1 |
| **DEVELOP** | PRAECEPTOR plan generation | WF_05_OPERATOR_DEVELOPMENT.md | Mentor Brief pattern analysis, deliberate practice protocol, calibration tracking — how PRAECEPTOR develops the operator across engagements |
| **EXECUTE** | DELIVERY function | WF_02_ENGAGEMENT_DELIVERY.md | The complete engagement delivery manual — diagnostic phases, system installation, reporting cadence, mentor brief loop |
| **EXECUTE** | FINANCE function | WF_06_FINANCIAL_ARCHITECTURE.md | Financial Intelligence principles, SDE mechanics, ROIC framework — how the operator reads client financials during execution |
| **EXECUTE** | PARTNERSHIPS function | WF_01_BUSINESS_DEVELOPMENT.md | Trust equation, SPIN discovery, STATE framework — the client relationship architecture during execution |
| **EXECUTE** | MARKETING function | WF_02_ENGAGEMENT_DELIVERY.md (Stage 4) | Findings delivery, Amp It Up communication standards, change navigation |
| **CALIBRATION** | Signal retrospective | WF_07_INTELLIGENCE.md | Calibration tracking protocol — how signal accuracy is scored and recorded |

---

## The Relationship Between the Flywheel and the Workflows

The flywheel is routing infrastructure. It determines how intelligence flows from collection to action.

The workflows are operating protocols. They define what the operator does at each stage of a specific engagement type.

**Without the flywheel:** The operator has operating manuals but no intelligence layer, no diagnostic framework, no development system, and no compounding memory.

**Without the workflows:** The flywheel routes to empty stages — there's a system but no protocol to execute against.

Together: the flywheel provides the structure; the workflows provide the content. Each engagement the operator runs deposits into the memory layer, sharpens the source calibration, and improves the next cycle.

---

## Primary Workflow by Engagement Type

| Engagement type | Primary workflow | Supporting workflows |
|----------------|-----------------|---------------------|
| New fractional COO engagement | WF_02_ENGAGEMENT_DELIVERY.md | WF_01 (BD/trust), WF_06 (financial reading) |
| Business development / pipeline | WF_01_BUSINESS_DEVELOPMENT.md | WF_07 (signal detection) |
| Acquisition search / screening | WF_06 + WF_01 | WF_07 (deal signal) |
| Operator development session | WF_05_OPERATOR_DEVELOPMENT.md | WF_02 (engagement context) |
| Intelligence cycle | WF_07_INTELLIGENCE.md | All workflows (feeds all) |
