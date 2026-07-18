---
register: history
---

# ADR-0065 — Family cores are admission targets

source: continuation of the Monky combine-mining adoption pass after ADR-0064.

## Decision

The adoption miner treats promotion records as evidence, not as the final thing to name.
Family cores are now valid admission targets and the review pack presents them first.
Individual paragraphs remain evidence, but the preferred review unit is the shared core of a
family because that is where a reusable semantic unit can be judged.

## Rationale

The first promotion miner improved the Monky adoption loop by replacing scalar scores with
evidence and dispositions. Its remaining weakness was target granularity: a repeated full
paragraph could be a variant, while a once-written paragraph could be important evidence for a
more general core. Asking the reviewer to name individual paragraphs risks admitting sibling
near-synonyms instead of the common intention behind them.

The family model captures the stronger shape:

- promotion records include count-one paragraphs, so a singleton variant can still support a
  family;
- families carry total occurrences, distinct files, distinct directories, usage contexts, and
  member variants;
- short or divergent cores are `fluency` families: useful structure, usually held as good
  composition;
- three-word or larger cores spread across files are `idiom` families: the primary combine
  review evidence;
- identity-shaped records remain outside families because component identity is not
  vocabulary structure.

The admission intake validates both mined paragraphs and family cores. This keeps the file
boundary from ADR-0064 intact: Ermine writes the pack, an outside reviewer returns verdicts,
and Ermine mechanically checks that each verdict refers to real mined evidence.

## Consequences

Review packs should ask for one verdict per idiom family target. Paragraph candidates are
still listed as supporting evidence because they explain spread, cohesion, usage, and role
binding.

Admission verdicts may copy a family core as `paragraph`. If that core is also a mined
paragraph, the family target takes precedence so the rendered evidence reflects the whole
family rather than the single paragraph only.

Fluency families are not errors. They are useful negative evidence: the grammar already
expresses the idea clearly, so a combine admission needs unusually strong surplus meaning.
