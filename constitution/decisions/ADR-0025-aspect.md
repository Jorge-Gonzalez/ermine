---
register: history
---

# ADR-0025 — `aspect`/`square`: the self-relatum proportional word

source: `docs/non-ermine.txt` (invariance-test analysis pass); `docs/proportional-plane.md`

The invariance-test re-analysis of the residue (`docs/non-ermine.txt`) found `aspect-ratio: 1`
in the `component-contract` bucket reads as **relational**, not identity — a proportion between
the element's own two dimensions that survives any re-resolution. It is admitted as `square`.

`square` is the second member of the proportional layout plane and its **self-relatum** case:
where `fill` (R-SIZE-01) relates the element to its container, `aspect` relates the element's own
width and height by a ratio. Like `fill`, it is a relational metric — the value is the ratio, so
it reads no theme socket, and ownership is clean (`aspect-ratio` is owned by no other axis, no P7
sanction).

Named `square` (the shape), not `aspect-ratio` (the property), per R-SKIN-01 (what-not-how).
Further ratios are reserved pending their own evidence: `wide` (16:9) is the obvious sibling, and
arbitrary ratios stay out of v0 — the admit-one-member pattern. Reserving `wide` also avoids
colliding with R-PADDING-02, which separately rejected `wide` as a spacing step; should `wide`
return here it is an aspect ratio, a different axis.

Introduces ruling: R-SIZE-02 (SIZE area).
