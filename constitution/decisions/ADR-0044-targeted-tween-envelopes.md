---
register: history
---

# ADR-0044 — Targeted tween envelopes

source: `reports/adoption/monky/RULE-ACTION-REVIEW.md` motion-transition rows after the
per-edge spacing refresh.

The first open tween pass admitted `tween-quick` and `tween-settled` as universal transition
envelopes: `transition-property: all` plus a named duration socket. That retired broad button and
panel feedback, but Monky still carried repeated property-targeted rows such as
`border-color var(--transition-fast)`, `background-color var(--transition-fast)`,
`background-color ... color ...`, and `opacity ... background-color ... color ...`.

Options weighed:

- Keep them local. Rejected: the rows repeat across unrelated inputs, popups, search rows, toolbar
  buttons, and reveal actions. Their invariant is the transition target set, not component identity.
- Emit the CSS `transition` shorthand. Rejected: the shorthand resets easing/delay and breaks the
  longhand composition rule from ADR-0039.
- Add target sets to the existing tween axis. Chosen: targeted tween words narrow
  `transition-property` while continuing to read `--duration-<step>`.

Admitted targets:

- `ground` -> `background-color`
- `ink` -> `color`
- `rule` -> `border-color`
- `ground-ink` -> `background-color, color`
- `opacity-ground` -> `opacity, background-color`
- `opacity-ground-ink` -> `opacity, background-color, color`
- `opacity-transform` -> `opacity, transform`

The bare `tween-<duration>` word remains the `all` target. Targeted forms are not independent
sub-dials; they are whole tween envelopes, so `tween-rule-quick tween-ground-quick` conflicts like
`tween-quick tween-settled`.

Out of scope: transition suppression (`transition: none`), the segmented control's measured
`left`/`width` pill choreography, and new timing magnitudes. Those remain local evidence or later
motion-plane questions.

Introduces ruling: R-MOTION-09. Amends R-MOTION-08.
