# Gap Report — K6 (skin-type)

## What I was doing
Completing the EMISSION table (work order K6): every axis in `REGISTRY` gets a
word→declaration mapping in `src/emit.ts`, derived from its constitution ruling or the
existing `var(--…)` conventions. `skin-type` was on the worklist of axes without an
emission story.

## The decision that is missing
Which words, if any, the GRAMMAR sanctions for `skin-type`. The registry record has
`tokens: []` and a placeholder `valueSpace` of `["<type-step>"]` — no word can parse to this
axis, so there is nothing for an EMISSION entry to map. R-TYPE-01 rules that type belongs to
skin (font size / line height as generative-proportional skin; typeface / weight as
connotative skin) and R-SKIN-01 defines the grammar/theme seam categories, but no ruling
names a type-step scale (no `SCALES` entry exists for it), a step spelling, or any fixed
word. Writing a vocabulary or a scale here would be coining (R2 / R-VOCAB-03).

## Where I looked
- `constitution/ERMINE.md` — R-TYPE-01 "Type belongs to skin" (line 365); R-SKIN-01
  "Grammar/theme seam" (line 509); R-VOCAB-03 (line 137)
- `constitution/ERMINE-RATIONALE.md` — RAT:R-SKIN-01 (source pointer: pre-split lines 1624–1652)
- `src/registry.ts` — the `skin-type` record (lines 517–526), the SKIN section header
  ("sampled", line 502), and `SCALES` (no type scale declared)
- `src/emit.ts` — the scale-bound conventions (`--spacing-<step>`, `--size-<step>`), which
  presuppose a declared scale to index

## Options I can see (NOT a recommendation)
- Rule a type-step scale (analogous to `SCALES.size`) with `var(--type-<step>)` values,
  giving the axis real tokens.
- Rule skin-type a fully open socket: themes own vocabulary and values; the axis stays
  lint-only (disjointness law).
- Split the axis per R-TYPE-01's own distinction: scale-bound words for the
  generative-proportional part (size/leading), open socket for the connotative part
  (typeface/weight).

## What is blocked
K6's acceptance criterion "every axis has an EMISSION entry" for this axis; any test emitting
a skin-type word; downstream theme guidance for type tokens.

## B4 follow-up — authoritative ownership

B4 cannot derive ownership for this axis because it still has no emittable word. P7 therefore
falls back to the declared type properties and emits an `unverified-ownership` warning. No current
emitted axis overlaps that fallback set, but the clean result is provisional rather than verified;
the warning remains until this report rules the type vocabulary/theme boundary.
