---
register: history
---

# ADR-0014 — Focus ring treatment

source: `GAP-U-focus-ring`, filed by the residue pattern screen (`pilots/PATTERN-SCREEN.md`).

Seven `outline: none` suppressions pair with seven themed box-shadow rings across every
text-entry surface — one design decision, implemented per component, with the drift hazard
already realized once (`.editor-content` suppresses without ringing) and one ring inheriting
its suppression from a parent recipe.

Options weighed:

- Bless the redraw: a `ring` treatment owning `box-shadow` under focus, plus the suppression.
  Rejected twice over: `box-shadow` belongs to elevation (P7), and RAT:R-STATE-10 is right
  that replacing the platform's indicator is the anti-pattern — a ruling should remove the
  hazard, not standardize it.
- Declare focus indication project identity. Rejected: seven identical occurrences with a
  counted drift case is the admission bar, met, with an accessibility argument attached.
- Restyle the platform's own mechanism: `ring` owns `outline`/`outline-offset` (verified
  unowned), reads the `--ring` socket (default `2px solid var(--ground-defined)` — the tone
  the evidence uses), and is authored as `focus:ring` through the existing R-STATE-10
  condition prefix. Nothing is suppressed, so suppression-without-indicator becomes
  inexpressible. Chosen.

Recorded refinement: serialize under `:focus-visible` once the platform-condition family
admits it; today's sites are text inputs where `:focus` and `:focus-visible` agree.
Out of scope: the `.input-error:focus` inset wash ring (recipe conditional identity,
R-SKIN-10); box-shadow rings generally (elevation's property).

Introduces ruling: R-SKIN-13. Refines R-STATE-10's rationale. Resolves GAP-U-focus-ring.
