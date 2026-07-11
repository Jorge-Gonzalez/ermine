---
register: history
---

# ADR-0012 — Line presence

source: the Monky residue pattern screen (`pilots/PATTERN-SCREEN.md`) — the border-mechanics
family it quantified at ~49 rows, held for `GAP-K6-skin-surface`.

Since the border/rule pilot, the working split has been: `rule` (carrier) owns the line's
colour; component CSS keeps `border-width`/`border-style`. That made every conversion
cascade-safe, but it stranded the presence half as unnameable mechanics — the single largest
remaining family, repeated verbatim on separators, container edges, list rows, and keycaps
across every surface.

Options weighed:

- Property utilities (`border-1`, `border-solid`). Rejected: how-not-what — they name CSS,
  not intent, and reopen the utility-grid door the adoption closed.
- A full border shorthand word (width+style+colour). Rejected: colour already belongs to the
  `rule` carrier, and recombining them undoes the cascade-safe split the pilots proved.
- Presence words composing with the carrier: `ruled` / `ruled-<side>` own width+style at a
  themed weight (`--rule-weight` socket, default 1px); `rule` keeps colour; `rule ruled`
  reads as one intent. Chosen.

Consequences:

- The `skin-surface` gap axis retires: its shadow half fell to R-SKIN-09, its border half
  falls here; `GAP-K6-skin-surface` closes.
- Explicit non-coverage: transparent/none sentinels, checked-state overlap suppression, the
  2px selection-indicator underline, and pseudo-element line drawing stay project mechanics.

Introduces ruling: R-SKIN-11. Refines R-SKIN-03. Resolves GAP-K6-skin-surface.
