# Gap Report — focus ring treatment

## What I was doing
Screening the Monky residue for repeated patterns (`pilots/PATTERN-SCREEN.md`). The
focus-conditioned remainder after the `focus:` admission is not scattered mechanics — it is
one treatment, seven times: `outline: none` on the element plus
`box-shadow: 0 0 0 2px var(--tone)` under `:focus`, on every text-entry surface (search
input, popup input, link input, editor body, `.input`, `.input-error`, `.btn`).

## The decision that is missing
Whether Ermine names the focus indicator. RAT:R-STATE-10 deliberately kept the UA focus
ring out of the prefix paragraph — "redrawing what the platform already provides is the
anti-pattern" — but the evidence shows the redraw is not incidental: the seven
`outline: none` suppressions pair one-to-one with seven themed ring draws. That is a
coherent, recurrent design decision (a soft halo in the theme's tone instead of the UA
outline), currently expressible only as per-component local CSS with an accessibility
hazard attached (suppression and redraw can drift apart — `.editor-content` already has the
`outline: none` without any ring).

## Where I looked
Monky: `controls.css`, `searchViewStyles.css`, `popup.css`, `content-editor.css` (ring +
suppression pairs); the current ledger's `focus-state` rows. Ermine: R-STATE-10/RAT (the
anti-pattern note), the `shadow`/`elevated` treatment shape (R-SKIN-09), `--fail-faint`
washes (the error ring variant `.input-error:focus` uses). Prior art: `:focus-visible`,
`outline-offset` (the platform-first alternative), Tailwind `ring-*`, WCAG 2.4.7/2.4.11
focus-appearance.

## Options I can see (NOT a recommendation)
- A `ring` treatment in the skin plane (socket `--ring`, default `0 0 0 2px` composed on a
  tone), emitted under `:focus-visible`; suppressing the UA outline becomes part of the
  treatment so the pair cannot drift.
- Platform-first: rule that projects keep the UA outline recoloured via
  `outline-color`/`outline-offset` (no box-shadow redraw); Monky's ring becomes identity.
- Leave focus indication project identity entirely; the ledger keeps carrying it as
  `focus-state` mechanics.

## What is blocked
Nothing renders wrong. Blocked is honest closure of the 14 paired rows, and the drift
hazard stays unguarded (one suppression already rides without its ring).
