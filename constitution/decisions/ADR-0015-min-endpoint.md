---
register: history
---

# ADR-0015 — Min-dial none endpoint

source: `GAP-U-min-content-escape`, filed by the residue pattern screen
(`pilots/PATTERN-SCREEN.md`).

Six selectors across four surfaces set `min-width: 0` or `min-height: 0` on flex items, each
guarding an inner scroll or truncation region against the automatic min-content floor. The
difference between a flex layout that works and one that overflows was an unexplained `0` in a
component sheet — structure-plane intent with no word.

Options weighed:

- An m2-adjacent word (`collapsible`) inferring the axis from the parent's direction.
  Rejected: direction inference needs parent context the emitter does not have at the
  element level; the two explicit dials already exist.
- A zero step on the size scale (`min-width-0`). Rejected: `0` names the number; the intent
  is "no minimum at all", and scale steps are measured values, not absences.
- A fixed `none` endpoint on the min dials — `min-width-none`, `min-height-none` — the
  R-SKIN-06 endpoint pattern (square/pill): interior scale-bound, endpoints are words.
  Chosen. Max endpoints reserved pending evidence.

Amends ruling: R-CONSTRAINT-01. Resolves GAP-U-min-content-escape.
