---
register: history
---

# ADR-0026 — `cover`: all-edge attachment

source: `reports/adoption/monky/RESIDUE-INVARIANCE.md`; `docs/proportional-plane.md`

The invariance overlay for Monky identified `inset: 0` as relational residue: it means "attach
this positioned box to every edge of its containing block", not "use a zero length from a scale".
The value survives re-resolution unchanged, so it is admitted as `cover`.

`cover` is the container-relatum edge member of the proportional layout plane. It is deliberately
separate from `position-mode`: `position-absolute cover` and `position-fixed cover` are meaningful
compositions, while bare `cover` only names the edge relation and does not establish positioning.
That keeps property ownership clean (`cover` owns `inset`; `position-mode` owns `position`) and
preserves the existing split that already forbids `position-mode` from touching `inset`.

The name is the intent, not the property (`inset-0`), per R-SKIN-01. Directional edge attachment
(`top:100%`, `bottom:100%`, `left:0`, `right:0`) remains reserved: those are adjacent members, not
the same all-edge relation.

Introduces ruling: R-SIZE-03 (SIZE/proportional layout plane).
