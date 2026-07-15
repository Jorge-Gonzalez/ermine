---
register: history
---

# ADR-0035 — `subgrid`

source: Monky `.macro-search-item { grid-template-columns: subgrid }`; `docs/proportional-plane.md`

`subgrid` is admitted as a structure member: `display: grid`, `grid-auto-flow: row`,
`grid-template-columns: subgrid`, replacing plain `grid`. It lets a nested grid adopt its parent's
column tracks, resolving the long-standing design-system tension between component encapsulation and
page-level alignment (survey proposition 7) — a subgridded child aligns its content to the outer
grid without being a direct child of it.

Evidence: Monky's search-result item is `grid span-all` over a `grid-fit-sm` parent, with
`grid-template-columns: subgrid` aligning the item's command/text columns to the parent's tracks.
Only meaningful inside a grid parent. The inherited-row form (`grid-template-rows: subgrid`) is
reserved pending evidence.

Introduces ruling: R-STRUCTURE-04.
