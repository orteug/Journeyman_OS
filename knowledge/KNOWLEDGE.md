# Knowledge Department
## Filter Stage — Intelligence Infrastructure · 3 specialists

THE RESEARCHER produces the brief. KNOWLEDGE files it, synthesizes it, and hands PRAECEPTOR a structured intelligence package. Without KNOWLEDGE, research is produced and lost. With KNOWLEDGE, every engagement makes the next one cheaper.

**Role in the flywheel:** Filter Stage 2B. Receives THE RESEARCHER's brief → files findings into memory → synthesizes for PRAECEPTOR → updates source quality from calibration.

---

## On Every Invocation

1. Read `memory/operator-profile.md` — what domains does this operator have history in?
2. Read `memory/domain-library/[current-domain-slug].md` — what does the system already know?
3. Read `memory/source-quality.md` — what sources have been validated in this domain?
4. Classify the brief and route using the table below.

---

## Brief Classification

| Brief type | Specialist sequence | When |
|-----------|-------------------|------|
| `domain_research` | 01 → 02 → 03 | After RESEARCHER delivers a new brief |
| `calibration_update` | 01 → 02 → 03 | After a signal resolves (confirmed/refuted/partial) |
| `source_rating` | 02 → 03 | After a source performs above or below expectation |
| `synthesis_only` | 02 | Researcher brief exists; no new external research needed |
| `distribute` | 03 | Synthesis complete; package for PRAECEPTOR |

---

## Invocation Format (from orchestrator or THE RESEARCHER)

```
→ knowledge/KNOWLEDGE.md
brief_type: [domain_research | calibration_update | source_rating | synthesis_only | distribute]
domain: [engagement domain slug]
consuming_stage: [PRAECEPTOR | CALIBRATION | memory]
context: [one-line summary of what was researched or what resolved]
researcher_brief_path: [path to handoff file, if applicable]
```

---

## Specialist Sequence

| Specialist | Role |
|-----------|------|
| `01_research_analyst` | Queries memory before any external research. Identifies gaps. Organizes raw findings. |
| `02_synthesis_engine` | Extracts cross-source patterns. Writes structured assets to domain-library. Never touches external sources. |
| `03_intel_distributor` | Packages synthesis for PRAECEPTOR. Updates source-quality. Routes to memory files. |

---

## Moat Mandate

Every invocation must leave at least one updated or created file in `memory/`. If nothing was written, the invocation is incomplete. The domain library deepens from every pass — including passes that confirm what is already known.

---

## Storage

**Read:** `memory/` (all files) · `engagement/context.md` · `engagement/handoffs/` · `source/digests/`
**Write:** `memory/domain-library/[domain].md` · `memory/source-quality.md` · `memory/calibration-log.md` · `memory/operator-profile.md`

---

## Sanitization Note

This department contains no references to proprietary internal systems. `memory/` is the only persistence layer. There are no external databases, local AI pipelines, or mobile delivery systems. All state lives in files the operator can read.
