---
register: history
---

# ADR-0043 — Per-edge spacing facets

source: `reports/adoption/monky/RULE-ACTION-REVIEW.md` and the current Monky spacing residue
containing repeated scale-backed one-edge padding and margin rows.

Monky still carries local declarations such as `padding-left: var(--spacing-xs)`,
`padding-right: var(--spacing-xs)`, `padding-top: var(--spacing-sm)`, and
`margin-right: var(--spacing-xl)`. These are not product-specific identities; they are the same
spacing scale already admitted by Ermine, applied to a narrower physical edge.

Options weighed:

- Leave local. Rejected: the declarations repeat across surfaces and are ordinary scale-backed
  spacing facts.
- Treat the rows as recipes over existing inline/block words. Rejected: inline and block variants
  are symmetric two-edge facts and cannot express only left, right, top, or bottom without changing
  the authored behavior.
- Admit physical edge facets. Chosen: `padding-top-*`, `padding-right-*`, `padding-bottom-*`,
  `padding-left-*`, and the matching `margin-*` edge facets read the shared spacing scale and emit
  the corresponding physical longhand.

The composition law becomes footprint-based for spacing sub-dials. A compound dial owns the
physical slots it covers: inline owns left and right; block owns top and bottom; a physical edge
owns only itself. Overlapping footprints conflict (`padding-inline-sm padding-left-xs`,
`margin-block-sm margin-top-xs`), while disjoint physical edges compose
(`padding-left-xs padding-right-sm`).

`centered` and `flush-block` participate in the same margin-footprint model: `centered` owns the
inline footprint and `flush-block` owns the block footprint. `push` remains separate because it
writes `margin-inline-start: auto`, a one-sided relational auto margin rather than a scale-backed
spacing value.

Out of scope: zero/reset rows, shorthand recipes that bundle unrelated axes, and raw pixel micro
padding such as `3px 6px`. Those need separate rulings if they prove general.

Amends rulings: R-PADDING-01, R-SPACE-02.
