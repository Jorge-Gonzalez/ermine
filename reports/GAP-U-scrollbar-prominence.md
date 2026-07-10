# Gap Report — scrollbar prominence

## What I was doing
Closing the U2 uncertain ledger tail (U8f). The U8b triage isolated 24 declarations that
style scrollbars as an explicit UI affordance: `::-webkit-scrollbar` width/height,
track/thumb colour and radius, thumb hover treatment, `scrollbar-width`, and
`scrollbar-color` — defined both globally (with `!important`) and per-surface, with a
manual `.dark` variant in the popup that bypasses the theme socket plane entirely.

## The decision that is missing
Whether Ermine names scrollbars as an explicit affordance. Concretely:
- Is scrollbar prominence (subtle/visible/none) a grammar word, a skin treatment, or
  project identity?
- Do track/thumb colours become theme sockets (the popup's literal hexes are today the
  only colour residual outside the socket plane), independent of whether prominence is
  ruled?
- Does the answer subsume `scrollbar-width`/`scrollbar-color` and the `::-webkit-*`
  pseudo family behind one word, so projects stop writing engine-specific selectors?

## Where I looked
Monky evidence: `src/styles/skin/controls.css` (global `::-webkit-scrollbar*` with
`!important`), `src/popup/popup.css` (`.popup-results` scrollbar with literal hexes and a
`.dark` override), historical `src/styles.css` search-results scrollbar (retired), and
`:root` `scrollbar-color` in the old sheet. Ledger rows carry `gap` dispositions pointing
here. Related: the skin colour plane (R-SKIN-02…08) covers every other themed colour;
`GAP-U-interaction-affordance` covers affordance words generally.

## Options I can see (NOT a recommendation)
- Rule a `scrollbar-*` prominence treatment in the skin plane, with track/thumb sockets
  in the theme contract; emit both the standard and `::-webkit-*` forms.
- Rule only the two sockets (track/thumb) and leave geometry/prominence project-owned.
- Declare scrollbars project identity; require projects to consume existing sockets
  (ground/rule) instead of literals, without new vocabulary.

## What is blocked
Nothing structural — Monky's scrollbars render today. Blocked is honest closure of the
popup's literal-hex scrollbar colours (the last off-socket colours in the project) and
retirement of the duplicated global/per-surface scrollbar styling.
