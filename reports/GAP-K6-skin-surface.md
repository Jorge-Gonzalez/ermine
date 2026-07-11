# Gap Report — K6 (skin-surface)

> **Resolved.** R-SKIN-09 (shadow half) and R-SKIN-11 (line-presence half, ADR-0012); the skin-surface gap axis is retired and the ~49-row border-mechanics family consumed in Monky at 2218f6e.

## What I was doing
Completing the EMISSION table (work order K6): every axis in `REGISTRY` gets a
word→declaration mapping in `src/emit.ts`, derived from its constitution ruling or the
existing `var(--…)` conventions. `skin-surface` was on the worklist of axes without an
emission story.

## The decision that is missing
Which words, if any, the GRAMMAR sanctions for `skin-surface`. The registry record has
`tokens: []` ("skin tokens are theme-bound; sampled here only for disjointness tests") and a
placeholder `valueSpace` of `["<tone>", "<ink>", "<radius>"]` — no word can parse to this
axis, so there is nothing for an EMISSION entry to map. R-SKIN-01 defines three seam
categories (fixed words / scale-bound words / fully open sockets) but does not concretize
which of skin-surface's facets fall into which category, nor name any fixed word or scale.
Writing a vocabulary here would be coining (R2 / R-VOCAB-03).

## Where I looked
- `constitution/ERMINE.md` — R-SKIN-01 "Grammar/theme seam" (line 509); R-VOCAB-03 (line 137)
- `constitution/ERMINE-RATIONALE.md` — RAT:R-SKIN-01 (source pointer: pre-split lines 1624–1652)
- `src/registry.ts` — the `skin-surface` record (lines 507–516) and the SKIN section header
  ("sampled", line 502)
- `src/emit.ts` — the existing conditioned-skin entry (`selection-treatment`), whose custom
  properties ARE named in its registry `controls`, unlike skin-surface's

## Options I can see (NOT a recommendation)
- Rule a fixed word list per facet (tone/ink/radius) with theme-socket values, giving the axis
  real tokens.
- Rule skin-surface a fully open socket: the grammar never parses skin words; themes own both
  vocabulary and values, and the axis stays lint-only (disjointness law).
- Rule a scale-bound shape (e.g. radius steps) for some facets and open sockets for others.
- Retire the placeholder valueSpace and re-scope the axis to a pure property-ownership record.

## What is blocked
K6's acceptance criterion "every axis has an EMISSION entry" for this axis; any test emitting
a skin-surface word; downstream theme guidance for surface tokens.

## B4 follow-up — authoritative ownership

B4 derives `selection-treatment` as ultimately painting `background`, `color`, and `outline`
through the conditional selection sink. Because `skin-surface` has no emittable word, P7 must
fall back to its declared ownership, which also contains `background` and `color`. The overlap
cannot be classified authoritatively until this report is ruled: the ruling must say whether
conditional skin is a sanctioned share with base skin, whether the sink's final declarations
belong to the base-surface ownership record, or whether the surface socket has another boundary.
Until then B4 reports the two overlaps as `unverified-overlap` warnings and does not silently
choose an owner.
