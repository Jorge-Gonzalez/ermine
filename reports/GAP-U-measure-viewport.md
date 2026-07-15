# Gap Report — measure and viewport extents
## What I was doing
I was continuing Monky's Phase 3 spatial/proportional assimilation after `grid-fit-sm`.
The next named candidate was "remaining measure": rows that cap readable content, clamp a
component against the viewport, or fill the viewport's block axis. The current ledger has no
assimilable rows, so migrating these requires deciding whether Ermine should name one or more
new layout words.
## The decision that is missing
The constitution does not say whether type-relative measure (`max-width: 8em`), viewport-clamped
component extents (`width: min(600px, calc(100vw - 2rem))`, `height: min(560px, 85vh)`), and
viewport block fill (`min-height: 100vh`) are one family, separate families, or project-local
component contracts. Existing size constraints cover scale-backed min/max dimensions, and the
explicit self-size axis covers container-relative `fill` plus content-relative `hug-inline`, but
neither axis admits type-relative measure or viewport-relative extents.
## Where I looked
- `constitution/ERMINE.md:425` to `constitution/ERMINE.md:433`: `hug-inline` is intrinsic
  content sizing, not a readable measure cap.
- `constitution/ERMINE.md:446` to `constitution/ERMINE.md:453`: `centered`/`flush-block` do not
  imply width constraints.
- `src/registry.ts:359` to `src/registry.ts:381`: `constraints` owns scale-backed
  `min-width`/`max-width`/`min-height`/`max-height`, and explicitly does not own plain `width`.
- `src/registry.ts:384` to `src/registry.ts:401`: `fill`/`hug-inline` own logical
  `inline-size`/`block-size` for container/content-relative self extent.
- `docs/proportional-plane.md:45` to `docs/proportional-plane.md:50`: viewport fill is recorded
  as a separate reserved word from container `fill`.
- `docs/proportional-plane.md:160` to `docs/proportional-plane.md:167`: viewport `fill` is still
  reserved pending evidence.
- Monky evidence: `src/content/overlays/modal/modalStyles.css:29` to
  `src/content/overlays/modal/modalStyles.css:30`, `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css:42`
  to `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css:43`, and
  `src/styles/entries/pages.css:10` to `src/styles/entries/pages.css:12`.
## Options I can see (NOT a recommendation)
- Admit a type-relative measure word for readable or label-like caps, covering `max-width: 8em`
  without treating it as a project size scale.
- Admit viewport-fit words for component extents clamped by viewport gutters, covering the modal
  `min(...)` width and height values as viewport-relative contracts.
- Admit viewport block fill separately from container `fill`, covering `min-height: 100vh` or a
  modern viewport-height variant.
- Keep the modal clamp, command label cap, and page viewport fill as Monky-local component
  geometry until another project supplies recurring evidence.
## What is blocked
Four Monky declarations remain project-owned: the modal dialog `width` and `height` viewport
clamps, the suggestions command item's `max-width: 8em`, and the page container's
`min-height: 100vh`. No existing Ermine word can migrate them without a ruling.
