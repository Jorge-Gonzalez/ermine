# Gap Report — parent-relational state

> **Resolved.** R-STATE-13 + R-SKIN-16 (ADR-0018): relational prefixes (`parent-hover:`/`parent-selected:`) anchored on the `selectable` capability, plus the `concealed`/`revealed` pair they scope. Consumed in Monky at f5bef9e; the guarded tinting rows and JS-state mechanics stay local as the ruling's boundary.

## What I was doing
Phase C of the Monky adoption: ruling the condition prefixes the evidence had earned
(`focus:` under R-STATE-10, `current:` as R-STATE-12). The remaining conditioned-skin
cluster the prefixes cannot express is parent-relational: an ancestor's state drives a
descendant's skin. The current ledger carries 12 rows under the `parent-relational`
reason code.

## The decision that is missing
Whether Ermine's condition prefixes stay same-element, or grow a relational form. The
evidence shows one dominant pattern, twice, independently:

- **Reveal-on-row-state**: the search view's edit icon and the suggestion list's delete
  action are `opacity: 0` until the *row* is hovered or asserted selected
  (`.row:hover .action`, `.row[aria-selected="true"] .action`).
- Secondary: row hover/selection recolouring child cells
  (`.macro-search-item:hover .macro-search-item-command`), and the segmented control's
  sliding-state suppressing the checked option's fill (`.seg-control.is-sliding .seg-option…`).

Two independent surfaces implementing the same reveal affordance is exactly the
recurrence bar earlier admissions used (hover: was admitted on the same kind of
evidence). But the mechanism question is bigger than one word: a relational prefix
(`parent-hover:`, group-variant style) changes the prefix grammar from "condition on this
element" to "condition on an ancestor", which touches R-STATE-08's distributed-state
model and the linter's backing story.

## Where I looked
Monky: `searchViewStyles.css` (edit icon reveal, row-state cell tinting),
`suggestionsOverlayStyles.css` / `editorViewStyles.css` (delete action reveal),
`settingsViewStyles.css` (sliding-pill suppression). Ermine: R-STATE-08 (distributed and
local states), R-STATE-10/11/12 (same-element condition prefixes). Prior art: Tailwind's
`group-hover:`, CSS `:has()` (inverts the direction), container style queries.

## Options I can see (NOT a recommendation)
- A relational condition prefix (`parent-hover:opacity-full`-shaped), backed the
  R-STATE-08 way: the ancestor declares a capability/group word, the linter verifies the
  pair, serialization compounds the ancestor selector.
- Rule only the *reveal* affordance as a treatment (the recurrent case), leaving general
  parent-relational styling component-owned.
- Keep parent-relational styling component-owned entirely; the pattern is interaction
  affordance and waits for GAP-U-interaction-affordance's larger arc.

## What is blocked
Nothing renders wrong today. Blocked is assimilation of the 12 parent-relational rows —
and, with them, the possibility of the reveal affordance being written in markup where
the design intent is currently invisible.
