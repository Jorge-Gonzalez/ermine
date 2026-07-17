---
register: history
---

# ADR-0060 — Offset and single-edge attachment

Status: accepted

## Context

ADR-0045 admitted direct edge attachment for positioned popups: `attach-below`,
`attach-above`, and `stretch-inline`. It deliberately left offset anchors such as
`top: calc(100% + 4px)` out of scope.

Monky's content-editor style dropdown is the missing narrower case. It is positioned below its
trigger, separated by one spacing step, and pinned only to the trigger's left edge:

```css
top: calc(100% + 4px);
left: 0;
```

Using `attach-below stretch-inline` would over-state the layout by adding `right: 0`. Keeping both
declarations local would also miss that the offset is not arbitrary: Monky's `4px` is
`--spacing-xs`.

## Decision

Amend R-SIZE-10 with:

- `attach-left` and `attach-right`, single physical edge pins emitting `left: 0` and `right: 0`.
- `attach-below-<spacing>` and `attach-above-<spacing>`, scale-backed offset forms emitting
  `calc(100% + var(--spacing-<step>))` on `top` or `bottom`.

The offset forms own the same footprints as their direct forms, so `attach-below attach-below-xs`
conflicts. Single edge pins conflict with `stretch-inline` only on the overlapping edge.

## Consequences

Anchored overlays can now say "below with a small ruled gap and pinned to one edge" without
becoming a dropdown recipe and without opening arbitrary pixel offsets. The words remain physical
because the current positioned-relation axis reasons in `left`/`right` slots; direction-aware
logical inset words remain a separate future question if RTL evidence appears.

Amends R-SIZE-10 and ADR-0045.
