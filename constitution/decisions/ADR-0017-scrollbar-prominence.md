---
register: history
---

# ADR-0017 — Scrollbar prominence

source: `GAP-U-scrollbar-prominence` — filed at the U8f ledger closure (24 frozen `gap`
rows), narrowed by Phase B (the popup's literal hexes became sockets), counted by the
pattern screen (19 live rows).

Monky carries two scrollbar implementations: a global engine-drawn treatment
(`::-webkit-scrollbar*`, 12px, corner radii, hover accent, `!important`) and the popup's
standard-property form (`scrollbar-width: thin` + socketed `scrollbar-color`). The gap
report's three options, weighed:

- Rule the full treatment including the `::-webkit-*` forms. Rejected: one word would need
  multi-selector pseudo-element emission (new emitter machinery), the engine-drawn geometry
  is a look rather than a prominence, and the platform deprecates the pseudo styling when
  standard properties are set — ruling it would standardize the legacy form.
- Rule only the two colour sockets, no word. Rejected: Phase B already proved socket
  consumption without vocabulary; the recurring *intent* ("this region's scrollbar is
  quiet and themed") still had no name.
- Rule prominence on the standard properties: `scrollbar-subtle` owns
  `scrollbar-width`/`scrollbar-color`, thumb/track sockets default to the `rule` carrier
  over transparent, `scrollbar-hidden` reserved; engine-drawn scrollbars are declared
  identity outside the treatment (the R-SKIN-09 boundary shape). Chosen.

Consequence for the frozen ledger: the 24 `gap` rows reclassify — treatment-expressible
rows to `skin-local` under this ruling, engine-drawn rows to `identity-local`.

Introduces ruling: R-SKIN-15. Resolves GAP-U-scrollbar-prominence.
