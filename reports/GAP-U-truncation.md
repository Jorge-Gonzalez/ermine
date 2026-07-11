# Gap Report — truncation treatment

> **Resolved.** R-SKIN-12 (ADR-0013): `truncate` ruled as a treatment composing with the `hidden` overflow word; consumed in Monky at 2bf5ab2. The clamp form stays reserved.

## What I was doing
Screening the Monky residue for repeated patterns (`pilots/PATTERN-SCREEN.md`). Five
distinct selectors across four surfaces carry the identical trio —
`overflow: hidden; text-overflow: ellipsis; white-space: nowrap` — and a sixth carries the
multi-line sibling (`-webkit-line-clamp: 3` block on the suggestions text preview).

## The decision that is missing
Whether "this text yields to its container" is a grammar word. The trio is a single intent
spread over three properties in two different responsibility areas (overflow is a ruled
layout axis; ellipsis/wrap are type-plane), so no lawful composition of current words can
express it and no single-property carrier can own it — it is a *treatment* in the R-SKIN-09
sense: one word, one intent, several coordinated declarations. Sub-questions: is single-line
truncation the atom with `clamp-N` the composition (mirroring tween/choreography)? And how
does it relate to `GAP-U-overflow-hidden`, since the trio contains the unruled
`overflow: hidden` but its intent is narrower than box clipping?

## Where I looked
Monky: `.popup-truncate` (the project even coined a utility name for it),
`.macro-suggestions-command-item`, `.command-suggestion-text`, search item cells (which
also *release* the truncation under `aria-selected` — evidence that the treatment wants a
conditioned form), `.macro-suggestions-text-preview` (line-clamp). Ermine: the overflow
axis (R-scroll words, `clip`), `GAP-U-overflow-hidden`, R-SKIN-07 type facets. Prior art:
Tailwind `truncate`/`line-clamp-N`, CSS `line-clamp` (the standardized form of the
`-webkit-box` hack).

## Options I can see (NOT a recommendation)
- Rule a truncation treatment: `truncate` (single line) emitting the trio, with
  `truncate-N` for the clamp form; the search view's selected-state release becomes a
  conditioned override (`selected:` composition).
- Rule only `overflow: hidden` (the filed GAP-U-overflow-hidden) and leave the trio as a
  project utility class consuming it.
- Keep it component-owned; five occurrences of three declarations is tolerable repetition.

## What is blocked
Nothing structural. Blocked is expressing in markup an intent the project has already
half-named for itself (`.popup-truncate`), plus the six selectors' worth of trio repetition.
