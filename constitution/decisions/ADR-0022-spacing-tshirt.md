---
register: history
---

# ADR-0022 — Spacing scale: density words → T-shirt

source: `reports/adoption/monky/DENSITY-WORDS-RETIRED.md`;
`reports/adoption/monky/WORKORDER-SPACING-TSHIRT.md`;
`reports/adoption/monky/RESIDUE-THREE-WAY.md`

The Monky adoption's spacing residue and a readability comparison of real Monky class strings
retired the named **density** scale (`tight`, `snug`, `comfortable`, `relaxed`, `loose`,
`separated`) in favour of a **T-shirt** magnitude scale (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`,
`3xl`, anchor `md`), shared by `gap`/`density`, `flow-spacing`, `padding`, and `margin`.

The density words passed the grammar-admission test as words but were the wrong structure for a
magnitude: non-self-evident order, an extensibility wall already hit (`GAP-U-density-2xl` — the
missing 24px step between `loose` and `separated`, which the T-shirt scale simply names `2xl`),
and a memorization cost that the universal named scales (`weight`: `medium`/`bold`) do not carry.
The in-situ proof was `font-md font-medium`: Ermine already composes a T-shirt magnitude scale
beside a named universal scale in one word. Spacing, a pure magnitude, takes T-shirt and aligns
with the already-T-shirt `corner`/`type`/`size` scales.

The retired words are reserved, not deleted: R-PROPORTION-01 already admits a single-word reading
returning as an alias earned by recurrence. Should a container-level density *intent* earn it, the
words return as a small (≤3-step) named alias set over the T-shirt steps — never as per-property
words, which is what conflated magnitude with intent in the first place.

Monky's migration is value-identical: its `metrics.css` already defined each density var as a
T-shirt var (the U5 binding), so the change unwinds that indirection. Note `separated` → `3xl`
(40px), not `2xl`.

Amends ruling: R-DENSITY-01 (scale). Touches wording of R-SPACE-02, R-DENSITY-02, R-DENSITY-03,
R-DENSITY-04, R-PADDING-01.
