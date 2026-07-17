---
register: history
---

# ADR-0061 — Positioned inset edge steps

Status: accepted

## Context

ADR-0060 admitted single-edge attachment (`attach-left`, `attach-right`) and scale-backed
attachment offsets beyond an anchor edge (`attach-below-xs`). Monky's macro search edit button
exposes a related but different pattern:

```css
right: var(--spacing-sm);
```

The button is already vertically centered with `center-y`; the remaining declaration offsets the
button from the containing row's right edge by a spacing step. `attach-right` would emit
`right: 0`, so it would place the button flush against the edge. The value is not arbitrary: it is
the existing spacing scale.

This also makes the previous `cover` modeling uncomfortable. `cover` emitted `inset: 0` from a
separate axis while positioned edge relations emitted `top`/`right`/`bottom`/`left`. That left a
latent shorthand/longhand overwrite hazard if `cover` composed with one-edge relations.

## Decision

Admit `inset-<edge>-<spacing>` on the positioned-relation axis. The admitted shape is physical:
`inset-top-*`, `inset-right-*`, `inset-bottom-*`, and `inset-left-*`, each reading the spacing
scale and emitting the matching positioned longhand.

Fold `cover` into the positioned-relation axis as the all-edge member. It keeps the same public
word and emission (`inset: 0`) but now owns the top/right/bottom/left footprint for conflict
checking.

## Consequences

`center-y inset-right-sm` can express a vertically centered control offset from the right edge.
`attach-right inset-right-sm`, `cover inset-right-sm`, and `cover center-y` now conflict instead
of relying on stylesheet order. Logical inset words remain a future question if RTL evidence
appears; the current family is deliberately physical because the underlying positioned-relation
axis is physical.

Amends R-SIZE-03, R-SIZE-10, ADR-0026, ADR-0045, and ADR-0060.
