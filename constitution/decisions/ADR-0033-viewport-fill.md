---
register: history
---

# ADR-0033 — `fill-viewport`: the viewport relatum

source: `reports/GAP-U-measure-viewport.md`; `docs/proportional-plane.md`

`GAP-U-measure-viewport` bundled three things: type-relative measure (`max-width: 8em`),
viewport-clamped component extents (the modal `min(600px, 100vw − 2rem)` / `min(560px, 85vh)`),
and viewport block fill (`min-height: 100vh`). This ADR resolves only the last as grammar; the
other two are ruled component identity (below).

`fill-viewport` is admitted as the **viewport relatum** of the proportional plane, completing the
trio: container `fill` (100% of the parent), self `hug` (intrinsic), viewport `fill-viewport`.
It was reserved in R-SIZE-01's rationale and `docs/proportional-plane.md`. Relational metric, no
socket, clean ownership (`min-block-size` owned by no other axis).

Ruled a **block-axis minimum** (`min-block-size: 100vh`), not an exact fill: the full-height-page
shell must let taller content overflow and scroll, whereas `fill-block` (`block-size: 100%`) would
cap and clip. Emitted logical (`min-block-size`) per the plane's convention; identical to
`min-height: 100vh` in horizontal writing mode. The dynamic-viewport `dvh` variant and an inline
viewport extent are reserved pending evidence.

**Ruled identity (not grammar), from the same Gap Report:**
- The modal dialog `width: min(600px, calc(100vw − 2rem))` / `height: min(560px, 85vh)` are bespoke
  dialog geometry — tuned caps composed with viewport gutters. The intent (a readable dialog, kept
  viewport-safe) is general, but every number is a project constant and no single word fits without
  encoding a domain contract. Component identity (U-R2).
- `max-width: 8em` on the suggestion command item is a tuned, em-based label cap — an off-grid
  parametric value on the em axis, single-site. Component identity.

Introduces ruling: R-SIZE-08. Resolves `GAP-U-measure-viewport`.
