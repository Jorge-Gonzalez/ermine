# Gap Report — `fill` (100% container sizing)

> **Resolved.** Admitted as `fill` (R-SIZE-01, ADR-0024): `fill` (both), `fill-inline`
> (`inline-size: 100%`), `fill-block` (`block-size: 100%`), the overflow/padding dial shape —
> the first member of the proportional layout plane (`docs/proportional-plane.md`). A relational
> metric (no socket), ownership clean. Consumed in Monky at `386c4fb` (7 container-100% sites;
> recipe `.input`, substrate reset, and viewport `100vh` stay local — the last two reserved).

## What I was doing
Adopting Monky's spatial residue (Phase 3). Roughly nine selectors across popup, search,
settings, editor, and the extension pages set `width: 100%`, `height: 100%`, or
`min-height: 100vh` to make an element span its container. There is no Ermine word for it: the
element *fills* its container's inline or block size, and today that intent can only be written
as raw CSS.

## The decision that is missing
Whether to admit a **`fill`** sizing word (an element spans 100% of its container along an
axis), and if so its shape: a whole word plus inline/block sub-dials (`fill` = both,
`fill-inline` → `width: 100%`, `fill-block` → `height: 100%`, the same dial pattern as
`padding`/`margin`), or an endpoint of the existing `constraints` axis, and whether the
viewport case (`100vh`/`100dvh`) is the same word or a distinct one.

## Where I looked
`src/registry.ts`: the `constraints` axis owns `min-width`/`max-width`/`min-height`/`max-height`
on the size scale (with a `-none` endpoint) but explicitly lists `width` in `mustNeverTouch`, so
plain `width` is an opening, not an oversight; `m3-self-size` owns `flex-basis` (content/ratio/
exact); `m2-flex` `grow-1`/`expandable` already fills a *flex* container's main axis — so the gap
is specifically the *block/explicit* 100% case, not flex growth. Monky evidence: `width: 100%`
in `popup.css`, `controls.css` (`.input`), `search`/`settings`/`macroEditor` views;
`min-height: 100vh` in `pages.css`. (Recipe- and substrate-owned `width: 100%` cases — `.input`,
resets — would stay local under R-SKIN-10 regardless.)

## Options I can see (NOT a recommendation)
- A `fill` word with inline/block sub-dials (`fill`, `fill-inline`, `fill-block`) emitting
  `width`/`height: 100%`, mirroring the padding/margin dial shape.
- An endpoint on the `constraints` axis (e.g. `width-full`/`height-full`), reusing that axis's
  dial machinery and its `-none` precedent.
- Keep 100% sizing as component identity; only min/max constraints and flex growth are grammar.

## What is blocked
Roughly nine Monky declarations stay component identity. No broad blockage.

## Related (the rest of the spatial arc, for context — separate decisions)
The wider spatial residue triages mostly to *bespoke* identity, not gaps: exact offsets
(`bottom: 52px`, `top: calc(100% + 4px)`, dynamic `var(--pill-left)`) and molecule internals
(caret/keycap/selection-indicator placement) are project-exact. Two smaller general primitives
sit alongside `fill`: **`cover`** (`inset: 0`, fill the positioned parent — one site today, and
`inset` is a deliberate opening in `position-mode.mustNeverTouch`) and **absolute-centering**
(`left: 50%` + `translateX(-50%)`, ~4 sites — but it needs a `transform`/`translate` concept
Ermine does not yet have). `fill` is filed first because it has the clearest intent and the
highest recurrence.
