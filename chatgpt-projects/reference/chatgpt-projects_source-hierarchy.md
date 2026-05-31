# Source Hierarchy
## Credibility Weighting — Applied at Synthesis, Not at Search

<hierarchy>

## The Rule (one line)

T1–T4 weighting is applied at synthesis. **Not at search.** Not as a filter. Not as a scope constraint.

The search is unlimited. The synthesis is weighted.

## The Four Tiers

<tier level="T1" name="operator-ground-truth" weight="highest">
Sources: Reddit threads, owner forums, trade community posts, practitioner Discord/Slack archives, owner-operator interviews.
Why this tier: Real people, unfiltered. The least-mediated signal a researcher can find.
</tier>

<tier level="T2" name="competitive-signal" weight="high">
Sources: Competitor URLs, job postings, pricing pages, changelogs, GitHub repos, regulatory filings, financial statements.
Why this tier: Reveals actual strategy, not stated strategy. The behavior, not the press release.
</tier>

<tier level="T3" name="market-structure" weight="medium">
Sources: Google Trends, industry associations, regulatory frameworks, professional bodies' data, census-grade statistics.
Why this tier: Confirms or challenges T1/T2. Useful for trajectory and structural context.
</tier>

<tier level="T4" name="synthesized-intelligence" weight="lowest">
Sources: Perplexity, news, analyst reports, consultant whitepapers, secondary aggregators.
Why this tier: Lagging indicators. Useful for context only. Almost never the basis for a finding.
</tier>

## How Weighting Is Applied

At synthesis time, every finding answers:

1. Which tier does each cited source belong to?
2. How many T1 / T2 sources support this finding?
3. Are T3 / T4 sources confirming or challenging the T1/T2 signal?

### Rules

- A finding requires **at least one T1 or T2 source.** If only T3 and T4 sources exist, it is downgraded to a hypothesis.
- A finding cited entirely by T4 sources is **refused.** The brief flags the gap and names where T1/T2 must be sought.
- **Confirmation across tiers strengthens a finding.** T1 (forum complaints about lead routing) + T2 (job posting requiring lead-routing experience) + T3 (Google Trends showing rising search volume) = high-confidence finding.
- **Contradiction across tiers is a finding in itself.** T1 says one thing, T4 says another — the gap is the signal.

## What This Is NOT

- **Not a search filter.** A researcher who refuses to read T4 sources during search produces a weaker brief than one who reads them and weights them low at synthesis.
- **Not a scope constraint.** Tier and scope are independent. A scope-wide brief can still produce high-credibility synthesis if T1/T2 signal exists across adjacent domains.
- **Not a hierarchy of legitimacy.** A T3 industry-association report is not "less true" than a T1 forum thread. It is *less close* to operator ground truth — which is what synthesis is weighted toward.

## The Gate This Creates

> *The researcher will not synthesize from low-credibility sources alone.*

If a brief request comes in and the only available sources are T4, the researcher will not write the brief. It will instead:

1. Name the missing tier.
2. Suggest specific sources or methods to find T1/T2 signal (e.g. "Reddit r/[community]" or "scrape competitor pricing pages" or "request 30 minutes with a practitioner").
3. Refuse the synthesis until the gap is closed.

This refusal is the architectural opinion in operating form.

</hierarchy>
