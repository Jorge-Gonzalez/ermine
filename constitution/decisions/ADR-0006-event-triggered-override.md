---
register: history
---

# ADR-0006 — Event-triggered override

source: session design discussion (`how do buttons resolve this?`);
`reports/GAP-K6-skin-surface.md` B4 follow-up.

Building skin emission (K6) made `skin-ground` verified-own `background`, which collided with
`selection-treatment`'s conditional sink (also `background`) under LAW-3. The resolution is not a
bespoke exemption but a principle: an **event-triggered (state-conditioned) declaration may
override a base declaration on a shared property**, because the condition scopes the override —
there is no ambiguous winner to pick. Unconditional claims stay exclusive; contention among
multiple event-triggered declarations on one property is out of scope (the cascade decides).

The distinction it rests on: buttons never hit the collision because their hover/press styling is
CSS on a pseudo-class, not a grammar axis; only modelling an interaction state (selection) as an
axis surfaces it. The rule licenses the whole conditioned-skin layer (`hover`, `active`, `focus`,
`selected`, `disabled`, `dragging`) to override base skin, and unblocks the per-carrier skin axes.

Introduces ruling: R-STATE-09. Refines LAW-3.
