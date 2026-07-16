---
register: history
---

# ADR-0018 — Relational condition prefix and concealment treatment

source: `GAP-U-parent-relational-state` — filed by the residue pattern screen; fourteen rows,
dominated by the reveal-on-row-state affordance appearing independently in two surfaces.

Two decisions land together because the evidence needs both: a mechanism for "an ancestor's
state drives this element", and words for what it drives (the revealed property is opacity,
which had no vocabulary).

Options weighed for the mechanism:

- Component-owned (wait for the affordance arc). Rejected: two independent surfaces with one
  shape is the admission bar `hover:` itself was held to.
- A reveal-only treatment word (one word emitting base + conditioned rules). Rejected: it
  covers the dominant pattern but not the row-tinting rows, and it hides the relational
  condition inside an emitter special case instead of the prefix grammar.
- Relational prefixes, narrowly admitted (`parent-hover:`, `parent-selected:`), anchored on
  the `selectable` capability. The anchor solves the correctness problem a naive
  `*:hover descendant` serialization has (hover propagates through every ancestor) and reuses
  R-STATE-08's contract: the ancestor that declares itself the interactive unit is the one
  whose state speaks. Verification is the P11 shape — checked through parent context when
  available, safe without it because unmarked ancestors never match. Chosen.

For the words: `concealed` (opacity 0) / `revealed` (opacity 1) as a treatment owning the
semantic endpoints. Mid-scale opacity stayed unruled here (three occurrences, three different
emphasis intents — the R-SKIN-14 leading argument) and was later admitted as bounded `alpha-*`
by ADR-0055. Pointer-events stays out of `concealed`: the evidence keeps hidden controls
clickable; interactivity does not belong in a visibility word.

Left local by choice: the `:not([data-state="confirming-delete"])` guarded tinting rows
(guards are component mechanics), and the `[data-state]`-driven action reveal (JS state, not
a ruled backing) — though consumption made the latter unnecessary by construction.

Introduces rulings: R-STATE-13, R-SKIN-16. Refines R-STATE-08, R-STATE-10/11.
Resolves GAP-U-parent-relational-state.
