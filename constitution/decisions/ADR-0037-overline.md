---
register: history
---

# ADR-0037 — `overline` label

source: Monky `.settings-section-label { text-transform: uppercase; letter-spacing: 0.07em }`

`overline` is admitted as the small-uppercase eyebrow/label type role: `text-transform: uppercase`
plus a tracking treatment socket (`letter-spacing: var(--overline-tracking, 0.07em)`, the 0.07em
default matching Monky, a theme owning the number). Bundled as one treatment word rather than two
raw declarations, named for the role not the mechanism (R-SKIN-01). Introduces R-SKIN-19.
