---
register: history
---

# ADR-0048 — Rule presence edge dials

Status: accepted

## Context

R-SKIN-11 already split line presence from line colour with `ruled` and the per-side
`ruled-top/right/bottom/left` forms. The linter still treated the family as a plain closed axis:
only one rule-presence word could appear on an element. Monky's command dropdown exposed the
hole: it needs left, right, and bottom line presence, but not top. The local CSS therefore drew
`ruled` and then suppressed `border-top`.

## Decision

Per-side rule-presence words are edge dials. `ruled-top`, `ruled-right`, `ruled-bottom`, and
`ruled-left` compose when their physical edge footprints are disjoint. `ruled` remains the
whole-box alias and conflicts with every side dial.

This is a composition amendment, not new vocabulary. No negative words such as `rule-top-none`
or transparent-rule carriers are admitted.

## Consequences

Elements can truthfully state partial rule presence as markup, for example
`ruled-left ruled-right ruled-bottom`, without component-layer suppression. Whole-box `ruled`
continues to be the concise form for all edges, and colour remains owned separately by `rule*`.

Monky's remaining transparent/none rows are still recipe or reset evidence unless they can be
removed by choosing the right positive edge facts in markup.

Amends R-SKIN-11.
