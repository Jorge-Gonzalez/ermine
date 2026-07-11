---
register: history
---

# ADR-0013 — Truncation treatment and the hidden overflow word

source: the Monky residue pattern screen (`pilots/PATTERN-SCREEN.md`) — the truncation trio
(5 occurrences, filed as `GAP-U-truncation`) and the guarded-overflow family (14 rows,
long filed as `GAP-U-overflow-hidden`).

The two questions resolve together because the trio contains the unruled property: single-line
truncation is `text-overflow: ellipsis` + `white-space: nowrap` + a hidden inline overflow,
and the overflow axis (R-OVERFLOW-01) had no `hidden` — only `clip`, whose no-scrolling
semantics are a different intent (and insufficient for scroll-adjacent clipping).

Options weighed:

- `truncate` emits all three properties. Rejected: `overflow-x/y` belongs to the overflow
  axis (P7); folding it in means either an unsanctioned collision or inventing a new
  sanctioned-share mechanism for one word.
- Rule only `hidden` (close GAP-U-overflow-hidden) and leave the trio as a project utility.
  Rejected: the intent recurs across four surfaces and the project already coined a name for
  it — that is the admission bar, met.
- Both, composed: admit `hidden` to the overflow set (amending R-OVERFLOW-01; hidden = a
  clipping scroll container, clip = no scrolling at all), and rule `truncate` as a treatment
  owning only `text-overflow` + `white-space`, effective when composed — `hidden truncate`,
  the `rule ruled` seam. Chosen.

Out of scope, recorded: the multi-line clamp (`truncate-N`, one occurrence) stays reserved;
the search view's selected-state truncation release stays a local override until conditioned
treatments are ruled.

Introduces ruling: R-SKIN-12. Amends R-OVERFLOW-01. Resolves GAP-U-overflow-hidden and
GAP-U-truncation.
