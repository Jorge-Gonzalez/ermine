---
register: history
---

# ADR-0028 — `hug-inline`: content-sized inline extent

source: `reports/adoption/monky/RESIDUE-INVARIANCE.md`; `docs/proportional-plane.md`

The Monky options page uses `width: fit-content` for the replacement-mode row and labels so they hug
their contents instead of filling the page column. The value is not a theme size step: the used inline
size is resolved from intrinsic content size and available inline space. That makes it a relational,
socket-free extent and admits the word `hug-inline`.

`hug-inline` writes `inline-size: fit-content`. It is placed on the existing explicit self-size axis
with `fill` because it owns the same inline-size dial: `fill-inline` and `hug-inline` are alternatives,
while `hug-inline fill-block` composes. The logical property mirrors Ermine's `fill-inline` /
`fill-block` vocabulary and preserves Monky's current horizontal writing-mode behavior.

This does not revive the old retired `fit-content` member from the flex bundle. That member collapsed
to `rigid`/flex-basis behavior during the m1-m5 split; `hug-inline` is explicit logical self-size,
not flex negotiation.

Introduces ruling: R-SIZE-05 (SIZE/proportional layout plane).
