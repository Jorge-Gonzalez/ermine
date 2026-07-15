---
register: history
---

# ADR-0029 — `center-x`: positioned horizontal centering

source: `reports/adoption/monky/RESIDUE-INVARIANCE.md`; `docs/proportional-plane.md`

Monky uses the pair `left: 50%` and `transform: translateX(-50%)` to horizontally center positioned
elements such as suggestion arrows and the editor toast. The declarations form a single relation:
anchor the element at the containing block's inline midpoint, then compensate by half of the
element's own inline size. Neither declaration is useful evidence by itself.

`center-x` writes exactly that pair. It does not imply a position mode; authors still compose it
with `position-absolute` or `position-fixed`. It also does not admit a general transform axis.
Vertical centering, flow centering (`margin-inline:auto`), and edge attachment remain separate
members because they use different properties and different relata.

Introduces ruling: R-SIZE-06 (SIZE/proportional layout plane).
