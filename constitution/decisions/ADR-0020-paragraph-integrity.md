---
register: history
---

# ADR-0020 — Paragraph integrity across cascade layers

source: `GAP-U-paragraph-integrity` — the layer-seam review after the surface-family
dissolution, with three lived cases as evidence (the nav-tab sentinel, the two editor
floors, one 88px smoke-caught regression).

The question: when non-Ermine CSS overrides a word, is that legal, and how does the honest
state stay enforced? The tension: the layer order is *designed* so local CSS beats words
(recipes and identity must win over generic vocabulary), yet an *undeclared* win makes the
class paragraph lie — and the paragraph-as-design-document is the system's core claim.

Options weighed:

- Global restriction (later layers may not declare grammar-owned properties). Rejected:
  it abolishes R-SKIN-10 recipes, which legitimately own bundled properties; their
  elements already honour the real invariant by not carrying competing words.
- Detection only, no rule. Rejected: a report nobody must act on decays; every gate in
  this adoption worked because it failed builds, not feelings.
- The per-element invariant as law, with three parts: (1) a paragraph must be true or
  silent about every property — undeclared shadowing is an error; (2) intentional
  overrides live in the `overrides` layer, making intent readable in the cascade itself;
  (3) all project CSS must be layered, because unlayered author styles outrank every
  layer and no in-system check can see them. Enforced by `findShadowedWords` in the
  reconciler, gated with the rest. Chosen.

The check reads markup class strings (not the manifest) because the invariant is about
what elements actually wear; it is conservative about conditions (a same-property hit
under any condition pair is flagged — disambiguation is the human's record to make).

Introduces ruling: R-IMPL-02. Refines R-IMPL-01, R-SKIN-10. Resolves
GAP-U-paragraph-integrity.
