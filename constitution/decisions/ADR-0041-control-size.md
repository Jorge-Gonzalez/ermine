---
register: history
---

# ADR-0041 — Control size

source: `reports/adoption/monky/DIMENSION-CONSTRAINT-PILOT.md`, generated from the
Monky rule-action review after the `max-width-none` migration.

Monky has repeated physical control/icon boxes in the dimension bucket. The clearest first
slice is the 16px control square: radio and checkbox controls each set both `width` and
`height` to `16px`, exactly Monky's `--spacing-lg` binding. This is not product identity in
the same way an off-scale 18px or 28px glyph treatment might be; it is the general control-box
role riding the shared spacing scale.

Options weighed:

- Reuse `square`. Rejected: `square` is already the relational aspect word
  (`aspect-ratio: 1`) and intentionally does not size either axis.
- Add raw `width-*` / `height-*` dials. Rejected for this pass: the evidence is a paired
  control box, not arbitrary physical dimensions.
- Add `square-<spacing>`. Rejected for now: it would blur the existing ratio meaning of
  `square` and make the word sound like geometry rather than control affordance.
- Admit `control-size-<spacing>`. Chosen. It names an interactive control/icon box, writes
  both logical axes, and reads the shared spacing scale. The first Monky migration will use
  `control-size-lg` for the repeated 16px rows; off-scale 18px/28px rows remain future
  evidence rather than being forced into the scale.

Amends ruling: R-SIZE-09.
