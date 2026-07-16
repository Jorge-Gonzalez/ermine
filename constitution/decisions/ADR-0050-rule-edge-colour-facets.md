---
register: history
---

# ADR-0050 — Rule edge colour facets

Status: accepted

## Context

ADR-0048 made rule presence footprint-aware but deliberately left colour whole-box only:
`rule` owned `border-color`, while `ruled-bottom` owned only bottom width and style. Monky's
modal navigation exposed the remaining seam. A tab needs an always-present bottom rule to
reserve the underline, coloured transparent at rest and accent only while `aria-current` is
true.

Leaving that in component CSS makes the current-state colour outrank generated grammar and
keeps a general edge-colour fact local. Making a negative presence word would be wrong: the
edge is present; only its colour changes.

## Decision

`skin-rule` gains physical edge colour dials:
`rule-top`, `rule-right`, `rule-bottom`, and `rule-left`, each accepting the same hue suffixes
as `rule` plus an edge-only `transparent` endpoint. Whole-box `rule` / `rule-<hue>` remain
aliases that conflict with every edge colour dial. Edge colour dials compose across disjoint
physical edges.

The transparent endpoint is not a broad reset family and no whole-box `rule-transparent` is
admitted. It exists for reserved-line sentinels where line presence is positive and the visible
state supplies colour under a condition, for example
`ruled-bottom rule-bottom-transparent current:rule-bottom-accent`.

## Consequences

Projects can express stateful underline and joined-edge colour without component-layer border
colour overrides. Rule presence stays separate from rule colour: `ruled-bottom` says there is a
bottom line, while `rule-bottom-transparent` and `current:rule-bottom-accent` say how that edge
is coloured in each condition.

Amends R-SKIN-11 and ADR-0048.
