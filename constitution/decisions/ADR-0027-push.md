---
register: history
---

# ADR-0027 — `push`: auto-margin inline push

source: `reports/adoption/monky/RESIDUE-INVARIANCE.md`; `docs/proportional-plane.md`

The Monky command-suggestion row uses `margin-left: auto` to move the action controls to the row's
inline end. The declaration is not a spacing value: the margin resolves to whatever free inline
space remains in the formatting context. That makes it relational and socket-free, so it is admitted
as `push`.

`push` writes `margin-inline-start: auto`. The logical property keeps the member aligned with
Ermine's existing inline/block vocabulary while preserving Monky's current horizontal writing-mode
behavior. It stays separate from the scale-backed `margin-*` axis because `auto` is not a token in
the spacing scale and because the computed amount comes from layout resolution.

The word is intentionally narrow. It does not imply `display:flex`, grid, flow, or
`justify-content`; those contexts remain authored with their own axes. `push` only names the member
relation once available inline space exists.

Introduces ruling: R-SIZE-04 (SIZE/proportional layout plane).
