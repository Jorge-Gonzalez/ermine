---
register: history
---

# ADR-0057 — Semantic fragments discovered by adoption

source: Monky adoption after `RULE-RESIDUE-ANALYSIS.md` named authored-content substrate,
control-state recipe, and private drawing boundaries.

The Monky adoption reached a point where the current ledger had no assimilable or
latent-generalizable declarations left, but the residue was not arbitrary local CSS. After
Ermine's flat, application-agnostic words explained what they could, several compact object
shapes remained:

- keycap drawing;
- callout arrow drawing;
- segmented-control active-pill drawing;
- engine scrollbar part styling;
- generated placeholder drawing;
- authored-content substrate;
- control-state recipe contracts.

These are not Ermine words. They are also not Bootstrap-like components. They are a middle
layer: semantic fragments whose meaning is portable enough to recur across projects, but whose
implementation is selector-aware, pseudo-element-backed, stateful, or internally multi-rule.

Options weighed:

- Admit them as words. Rejected: their meaning is object-shaped, not a single property choice.
  Flattening `keycap` into spacing/radius/shadow words or `callout-arrow` into border facts
  would erase the object being styled.
- Treat them as ordinary project identity. Rejected: the adoption contrast exposed repeatable
  semantic units. They are application-shaped but not application-bound; future projects can
  reuse the ideas without inheriting Monky's whole components.
- Record a semantic-fragment layer in adoption memory. Chosen: Ermine's word layer remains
  application-agnostic, while the adoption tooling can recognize portable fragments above the
  word layer and below conventional component libraries.

This is semantic distillation by subtraction: inverse emission removes what Ermine can already
say, boundary analysis removes substrate and product identity, and the remaining authored rule
clusters reveal reusable fragments.

Consequence: `adoption/playbook.ts` may carry fragment boundaries as reusable adoption memory.
They are not grammar admissions. A future framework layer may model fragments with sockets,
selector contracts, pseudo-element ownership, state assumptions, and composed Ermine words.

Documents the perspective in `docs/SEMANTIC-FRAGMENTS.md`.
