# Gap Report — min-content escape

## What I was doing
Screening the Monky residue for repeated patterns (`pilots/PATTERN-SCREEN.md`). Six
selectors across four surfaces set `min-width: 0` or `min-height: 0` on flex items —
`.modal-content`, `.editor-form`, the editor body chain (twice), `.settings-rows`, and the
suggestions command item.

## The decision that is missing
Whether the grammar names "this item may shrink below its content's natural size". This is
pure structure plane — Ermine's core territory. The m2 axis already grades shrink
*willingness* (`compressible` = `shrink: 1`), but CSS's automatic minimum size means a
shrinking item still stops at min-content; escaping that floor requires the separate
`min-width/height: 0`, which today is invisible mechanics in component CSS. Every
occurrence in Monky guards the same real situation: a scrollable or truncating region
inside a flex column/row that must not force its container open.

## Where I looked
Monky: the six selectors above — each one paired with an inner `overflow` or truncation,
which is the tell that the floor escape is intent, not accident. Ermine: m2-flex
(`compressible`/`elastic`), m3-self-size, the constraints axis (`min-width-<size>` scale
words — a zero step does not exist and `0` is not on the size scale). Prior art: the
canonical flexbox min-size gotcha; Tailwind `min-w-0`.

## Options I can see (NOT a recommendation)
- An m2-adjacent word (`collapsible`?) meaning "may shrink past min-content", emitting the
  axis-appropriate `min-width: 0`/`min-height: 0` from the parent's direction — which would
  need the parent-context awareness the linter already has (P11).
- A zero endpoint on the constraints scale (`min-width-none`), keeping it a plain
  constraints word with no direction inference.
- Leave it as component mechanics; six occurrences of one declaration is small.

## What is blocked
Nothing structural. Blocked is the legibility of a load-bearing layout decision: today the
difference between a flex layout that works and one that overflows is an unexplained `0` in
a component sheet.
