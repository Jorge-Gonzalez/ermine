---
register: history
---

# ADR-0056 — Text decoration treatment

source: Monky rule-residue absorption after `RULE-RESIDUE-ANALYSIS.md`.

Monky's remaining residue included two different kinds of text-decoration evidence:

- link-button recipes: `.btn-link` and `.btn-link-danger` suppress decoration at rest and
  restore underline on hover;
- editor content: `u`, `s`, and `a` descendants inside `.content-editor-body` carry semantic
  user-authored rich-text defaults.

Options weighed:

- Admit a `link` word. Rejected: link-like behaviour is a recipe/component decision involving
  colour, cursor, spacing, hover policy, disabled policy, and semantics. A single word would name
  a thing rather than one property treatment.
- Keep all text-decoration local. Rejected: underline, strike-through, and decoration absence are
  property-level text treatments, repeated across contexts, and state-scopable without new
  selector machinery.
- Admit the property treatment only. Chosen: `underlined`, `struck`, and `undecorated` own
  `text-decoration` and nothing else. Recipes can compose them when the element can carry words;
  user-content descendant selectors remain an authored-content substrate boundary.

Introduces ruling: R-SKIN-20.
