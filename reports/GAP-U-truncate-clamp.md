# Gap Report — multi-line clamp (`truncate-N`)

> **Resolved.** Admitted as **`clamp-N`** (R-SKIN-12 amended, ADR-0023) — named `clamp`, not
> the reserved `truncate-N`, because `truncate` is a removal verb so `truncate-3` misreads as
> "remove 3 lines"; `clamp-3` reads as "clamped to 3 lines" (the retained-line limit). Its
> `display: -webkit-box` overlap with the structure/m1 facet twin is sanctioned as a mutual
> exclusion in `checkDimensionalPurity`. Consumed in Monky at `1472c87`
> (`.macro-suggestions-text-preview` → `clamp-3`).

## What I was doing
Adopting Monky's suggestions overlay (residue Phase 1). `.macro-suggestions-text-preview`
clamps its preview to three lines with `display: -webkit-box; -webkit-line-clamp: 3;
-webkit-box-orient: vertical` — a multi-line ellipsis, not the single-line `truncate` the
grammar already has.

## The decision that is missing
Whether to admit the reserved `truncate-N` member of the truncation axis (R-SKIN-12 names it
"reserved pending evidence"), and if so how `N` is parameterized — a parametric line count
(like `span-N`/`grow-N`) or a bounded closed set — and what it emits.

## Where I looked
`constitution/ERMINE.md` R-SKIN-12 (truncation: `truncate` admitted; `truncate-N` clamp
reserved pending evidence; → ADR-0013); `src/registry.ts` truncation axis
(`valueSpace: ["truncate"]`, note "`truncate-N` (clamp) is the family member reserved pending
evidence"); `src/emit.ts` truncation emission (owns `text-overflow` + `white-space`);
`monky/src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css:53–55` (the 3-line
clamp). Note the clamp mechanism is the `-webkit-box` trio, a vendor idiom, not the two
properties `truncate` owns.

## Options I can see (NOT a recommendation)
- Admit `truncate-N` as a parametric member (N = line count) emitting the `-webkit-box`
  clamp trio (`display` + `-webkit-line-clamp` + `-webkit-box-orient`).
- Admit a small bounded closed set (`truncate-2`, `truncate-3`) instead of open N.
- Keep the multi-line clamp as component identity; only single-line `truncate` is grammar.

## What is blocked
One Monky bundle (the 3-declaration clamp on `.macro-suggestions-text-preview`) stays
component identity. No broad blockage; a second clamp site would raise the priority.
