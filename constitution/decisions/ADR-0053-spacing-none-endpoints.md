---
register: history
---

# ADR-0053 — Spacing none endpoints

Status: accepted

## Context

ADR-0043 admitted physical padding and margin edge facets, but deliberately left zero/reset rows
out of scope. Monky's refreshed residue now carries repeated zero spacing facts:
`padding: 0`, `margin: 0`, mixed scale-plus-zero shorthands such as
`padding: var(--spacing-md) var(--spacing-sm) 0 0`, and one-edge resets such as
`margin-left: 0`.

These rows are not new spacing magnitudes. They are the absence endpoint for an already ruled
padding or margin footprint. Leaving them local forces projects to keep component CSS around only
to say "no padding here" or "no margin on this side."

## Decision

Padding and margin gain a `none` endpoint on every already-ruled footprint:

- `padding-none`, `padding-inline-none`, `padding-block-none`, and
  `padding-top/right/bottom/left-none`
- `margin-none`, `margin-inline-none`, `margin-block-none`, and
  `margin-top/right/bottom/left-none`

Each emits `0` on its chosen property or longhand. `none` is not added to the shared spacing scale:
`gap-none`, `flow-none`, and `control-size-none` are not admitted by this ruling.

The existing footprint conflict model still applies. Whole-axis `padding-none` conflicts with every
padding sub-dial; `padding-left-none padding-right-sm` composes because the physical edge footprints
are disjoint. Margin follows the same rule, including conflicts with `centered` and `flush-block`
when footprints overlap.

## Consequences

Projects can decompose asymmetric zero/scale shorthands into edge-only facts instead of keeping
local CSS. For example:

`padding-top-md padding-right-sm padding-bottom-none padding-left-none`

expresses `padding: var(--spacing-md) var(--spacing-sm) 0 0` without admitting raw shorthand
recipes or adding zero to the spacing scale.

Amends R-PADDING-01 and ADR-0043.
