---
register: history
---

# ADR-0011 — Recipes are project compositions

source: Phase C — the button-recipe decision three pilots named as their blocker.

The colour/background pilot left `.settings-view .btn-outlined` local because changing it
"requires a button recipe decision, not just adding `ground-subtle` to markup". Phase B skipped
every `.btn-*` row for the same reason and parked them as validated overrides. The question:
when a project styles a component kind as a named bundle — button, alert, card, input — does
that bundle belong in the grammar?

Options weighed:

- Admit recipe words (`btn`, `btn-secondary`, `alert-error`). Rejected by the admission test:
  a recipe word names a thing, not a property choice (what-not-how fails at the word level),
  and its content is one project's decisions (general-not-specific fails at the value level).
- Dissolve recipes into markup composition — every button carries
  `ground-subtle ink rule corner-md padding-block-snug padding-inline-relaxed hover:ground-defined …`.
  Rejected: a recipe is one decision made in many places; repeating the word string is
  repetition masquerading as flexibility, and the conditional identity (disabled, active,
  the settings-view context override) still needs a stylesheet home.
- Rule the boundary. The grammar owns the planes recipes compose (carriers, treatments,
  condition prefixes, capabilities); the project owns the bundle as a recipe class whose
  discipline is socket consumption — no colour literals (Monky's Phase B stylelint guard is
  the reference enforcement). The affordance half of "button-ness" stays an open capability
  question (GAP-U-interaction-affordance). Chosen.

Consequence for adoption accounting: recipe declarations are terminal project identity when
they consume sockets; they stop appearing as pending skin work.

Introduces ruling: R-SKIN-10. Refines R-SKIN-01. Leaves GAP-U-interaction-affordance open.
