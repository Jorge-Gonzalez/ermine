---
register: history
---

# ADR-0023 — Multi-line clamp admitted as `clamp-N`

source: `reports/GAP-U-truncate-clamp.md`;
`monky/src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css`

R-SKIN-12 reserved a multi-line-clamp member of the truncation axis under the placeholder name
`truncate-N`, pending evidence. Monky's suggestion preview clamps to three lines
(`display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3`) — the evidence —
so the member is admitted.

**Named `clamp-N`, not `truncate-N`.** The placeholder name was flawed: `truncate` is a verb of
removal, so `truncate-3` reads as "remove three lines" rather than "keep three." The number's
referent is ambiguous because truncation has no natural numeric value (unlike `grow-3`/`span-3`,
where the number is the property's own value). `clamp` means *constrain to a bound*, so `clamp-3`
reads as "clamped to three lines" — the number is unmistakably the retained-line limit. It also
matches the industry term (CSS `line-clamp`, Tailwind `line-clamp-3`) without being the raw
property name.

**One axis, two mechanisms.** `truncate` (single-line, `text-overflow` + `white-space`) and
`clamp-N` (multi-line, the `-webkit-box` trio) are members of the one truncation axis — an
element truncates OR clamps, never both — but they emit different property sets, so they are
distinct words, not `truncate` = `truncate-1`.

**Display overlap sanctioned as exclusion.** The clamp requires `display: -webkit-box`, a
whole-display legacy value that cannot split into the inner/outer facets structure and
m1-flow-participation use. It therefore overlaps the display facet twin. The overlap is a
*sanctioned exclusion*, not a composition: a clamped text block is never a flex/grid container,
so the words are mutually exclusive by intent. Recorded in `checkDimensionalPurity`
(`src/emit.ts`) as an explicit sanctioned pair, alongside the facet-twin and R-STATE-09
event-triggered sanctions.

Amends ruling: R-SKIN-12.
