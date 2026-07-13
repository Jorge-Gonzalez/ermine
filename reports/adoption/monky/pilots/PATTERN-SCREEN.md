# Monky pilot — residue pattern screen

The border-mechanics family (49 rows waiting on GAP-K6-skin-surface) was found by eye. This
screen applies the same move systematically: mine all 525 residue rows of the current ledger
for recurrence — exact declarations repeated across distinct selectors, and multi-declaration
bundles that co-occur on one selector — then name each recurring pattern by *what the part is
doing* and test it against the admission bar (coherent, what-not-how, general-not-specific).

Method: group residue records by (file, selector); count exact `property: value` recurrence
across selectors; probe declaration co-occurrence signatures. Point-in-time analysis at the
Phase D-closed ledger (714 declarations, 525 residue).

## Patterns that clear the bar

Ranked by evidence × generality. "Rows" are distinct selectors carrying the pattern.

| pattern | what the part is doing | rows | destination |
|---|---|---:|---|
| **line presence** (`border-width: 1px` + `border-style: solid`, incl. per-side) | "this element has an edge line" — the presence half of `rule`, which owns only the colour | ~49 | `GAP-K6-skin-surface` — now quantified as the largest single family |
| **pressability** (`cursor: pointer` 21 + bare-control bundle 11 + `user-select`) | "this element invites the press" — affordance, not behaviour | ~30 | `GAP-U-interaction-affordance` — evidence attached |
| **interactive transition** (`transition: <skin> var(--transition-fast)`) | "state changes on this element are enveloped, not instant" | 20 | `GAP-U-animation-plane` — already holds the defer |
| **guarded overflow** (`overflow: hidden`) | "this box clips; children may not spill" | 14 | `GAP-U-overflow-hidden` — filed pre-adoption, now counted |
| **focus ring** (`box-shadow: 0 0 0 2px var(--tone)` + paired `outline: none`) | "focus is shown as a soft themed halo instead of the UA outline" | 7 + 7 | **new** — `GAP-U-focus-ring` |
| **truncation** (`overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap`; one `-webkit-line-clamp` sibling) | "this text yields to its container on one line" | 5 + 1 | **new** — `GAP-U-truncation` |
| **min-content escape** (`min-width: 0` / `min-height: 0` on flex items) | "this item may shrink below its content's natural size" | 6 | **new** — `GAP-U-min-content-escape` |
| **mono typeface** (`font-family: monospace`) | "these marks are code/keys" — the `mono` facet R-SKIN-07 already names | 5 | admit `font-mono` under R-SKIN-07 (the `focus:` admission shape) |
| **full-inline fill** (`width: 100%`, some `height: 100%`) | "this control fills its axis" | ~7 | below the bar — self-size axis extension; watch (search input, macro-search-input, popup input, editor command input, seg pieces…) |
| **edge-pin centring** (`left/top: 50%` + `translate(-50%)`) | "centred on the parent's edge regardless of own size" | 4 | below the bar — placement pattern; watch |
| **content-alignment** (`align-content: start` on grids) | "pack grid tracks to the start, don't stretch" | 1 | below the bar — grid alignment facet; watch |
| **inline-end push** (`margin-left: auto` on flex items) | "push me to the inline end of the row" | 2 | below the bar — the flex auto-margin idiom; watch |
| **centred text** (`text-align: center`) | type-plane alignment facet | 4 | `GAP-K6-skin-type` |

## Recurrence that is rightly boundary

The screen also re-confirms categories that recur but stay Monky-owned:

- **Keycap 3D** (both kbd variants), **caret/arrow geometry**, **sliding pill** — identity
  signatures drawn with border/pseudo mechanics; recurrence is internal to one product look.
- **Icon-box squares** (16/26/28px) — recurrent shape, divergent exact geometry; the
  squares are component contracts, not a scale.
- **Recipe state paint** (`background-color: var(--tone)` ×7 etc.) — lives inside R-SKIN-10
  recipe bundles; socket-consuming by construction.
- **Prose rhythm** (`0.75em` margins, `font-weight: 700`, italics) — user-content contract.
- `pointer-events: none` (3), `margin/padding: 0` resets, `box-sizing` — small mechanics
  below any naming bar.

## Reading

Two findings stand out. First, the residue is not noise: ~150 of 525 rows sit in just seven
nameable intents, each already pointing at a filed question or one filed by this screen.
Second, the pairing structure is real evidence — 7 `outline: none` suppressions against 7
ring draws, *almost* one-to-one: one suppression rides bare (`.editor-content`) and one ring
inherits its suppression (`.input-error:focus`). That both confirms the pattern and
demonstrates the drift hazard, which turns "focus ring" from an anti-pattern anecdote
(RAT:R-STATE-10) into a coherent, recurrent design decision that deserves its own ruling
rather than a per-component apology.
