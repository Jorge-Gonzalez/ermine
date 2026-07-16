---
register: history
---

# ADR-0040 — Max-width none endpoint

source: `reports/adoption/monky/DIMENSION-CONSTRAINT-PILOT.md`, generated from the
Monky rule-action review after the open-tween pass.

Monky has a delete-confirm option that must remove the inherited suggestion-chip cap:
`max-width: none`. The declaration is not a new measured size and not component identity.
It is the absence endpoint of the `max-width` constraint dial, symmetrical in intent with
the existing min-dial endpoints from ADR-0015: the interior of the dial remains scale-bound,
while the endpoint is a named escape.

Options weighed:

- Keep it local as reset absence. Rejected: the function is general constraint
  neutralization, and the max-width dial already exists.
- Add a zero/auto size step. Rejected: `none` is not a measurement and should not enter
  the size scale.
- Admit all max endpoints. Rejected for now: the evidence is `max-width: none`; `max-height:
  none` remains reserved until it appears in a comparable rule-action review.
- Admit `max-width-none` only. Chosen. It names the observed endpoint without widening the
  scale or guessing a symmetric member without evidence.

Amends ruling: R-CONSTRAINT-01.
