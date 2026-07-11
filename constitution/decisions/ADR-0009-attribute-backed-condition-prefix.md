---
register: history
---

# ADR-0009 — Attribute-backed condition prefix

source: Phase C — resolving the `aria-current` rows the assimilation pilots kept holding back.

Monky's modal navigation tab colours itself under `[aria-current="page"]`: accent ink, subtle
ground, accent bottom-rule. Three pilots in a row (color/background, border/rule, Phase B)
classified those rows "not Ermine's `selected:` and not to be silently recast" — correctly, since
`aria-current` asserts currency within a set, not selection. The current ledger carries them as a
named `aria-current` reason code.

The general shape was already solved twice: compose carrier words, scope them with a prefix
(R-STATE-10 platform conditions, R-STATE-11 backed states). The open question was backing.
R-STATE-11's verification model — capability word on the element, state asserted by the container
— does not transfer, because `aria-current` has no distributed container contract; the element
itself carries the attribute. Options weighed:

- Reuse `selected:` and let projects back it with `aria-current`. Rejected: collapses two ARIA
  semantics into one word; the serialized selector would also be wrong.
- Invent a capability word (`navigable`) so `current:` matches the R-STATE-11 shape. Rejected:
  the linter would verify a word that entails nothing real — ceremony, not backing.
- Back the prefix with the attribute itself: `current:` serializes to
  `[aria-current]:not([aria-current="false"])`, so the override cannot fire on an element the
  application never asserted. The `:not` guard respects `aria-current="false"` as an explicit
  negative. Chosen.

Introduces ruling: R-STATE-12. Refines R-STATE-10, R-STATE-11.
