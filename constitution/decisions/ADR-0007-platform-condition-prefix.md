---
register: history
---

# ADR-0007 — Platform-condition skin prefix

source: session design discussion (`what about over, or float?`);
`reports/adoption/monky` conditioned-skin evidence pass.

The conditioned-skin evidence pass over Monky found 46 state-conditioned skin rules — hover
dominant (28), then focus (10) and app-asserted selected/checked (6). The hover tones resolve to
values that are already carrier/role words (`ground-subtle`, `ink-accent`, `ground-fail-faint`),
but the *condition* has no grammar surface, so every one of them stays as hand-written local CSS.
Because the tones are per-element design choices rather than element-kind defaults, the
platform-first cascade cannot absorb them; promoting the condition into the class paragraph is the
only way to make that design legible in the grammar.

The resolution is a variant prefix — the same shape R-STATE-07 gave environmental scopes — carrying
a closed set of platform interaction conditions (`hover:`, `active:`, `focus:`). It scopes an
existing skin declaration rather than introducing a value, and R-STATE-09 already licenses the
override. Platform conditions need no backing, which draws the line against app-asserted selection
(`selected`/`checked`), which keep the backed `selectable` path (R-STATE-08). The paragraph omits
UA-supplied decoration (the focus ring) by design.

`hover` is admitted now as the proven-recurrent member; `active`/`focus` are the family the rule
opens, admitted as their own evidence lands. `over` and `float` were rejected as names.

Introduces ruling: R-STATE-10. Refines R-STATE-07.
