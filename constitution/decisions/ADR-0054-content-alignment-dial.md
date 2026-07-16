---
register: history
---

# ADR-0054 — `content-align-*` container alignment dial

Status: accepted

## Context

Monky's search results grid needed `align-content: start`: a container-level packing rule for the
grid/content tracks, not an `align-items` child-alignment rule and not spacing. Ermine already had a
container alignment axis split into `align-*` (`align-items`) and `justify-*` (`justify-content`),
but no word for the neighboring `align-content` property.

## Decision

Extend the existing `alignment-container` axis with a third exclusive sub-dial:
`content-align-start|center|end|stretch|between|around`.

The dial writes `align-content`. `between` and `around` map to the CSS `space-*` values; `start`,
`center`, `end`, and `stretch` emit their Box Alignment values directly. The existing `align-*`
dial continues to write `align-items`, so `align-start` is not reused for `align-content`.

## Consequences

`align-center justify-between content-align-start` composes because the three dials own different
properties. Two `content-align-*` words conflict. This resolves the Monky result-list grid row
without introducing project-specific layout recipes or folding grid packing into spacing.
