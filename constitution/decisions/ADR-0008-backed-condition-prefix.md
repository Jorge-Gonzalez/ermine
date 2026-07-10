---
register: history
---

# ADR-0008 — Backed condition prefix

source: session — wiring Monky's selected/checked through `selection-treatment`.

The plan of record (CONDITIONED-SKIN-EVIDENCE.md) was to wire the 6 `[aria-selected]`/`[aria-checked]`
rules through the existing `selection-treatment` sink. Investigating it before migrating surfaced
that the sink does not fit: its two fixed levels (`selection-subtle`/`selection-strong`) are
hard-coded in the emitter to a harmonic hue and an `outline`, while Monky selects in its accent hue
and draws the edge with `border-color`. The values cannot be rebound by a theme.

The resolution is not to socket-ize the sink but to unify selection with the R-STATE-10 prefix: an
application-asserted state (`selected`, `checked`) scopes a conditioned-skin override as a variant
prefix (`selected:ground-defined selected:ink-accent selected:rule-accent`), composing the same
carriers `hover:` does. The one difference is backing — the platform supplies hover for free, but
the application asserts selection, so the linter verifies the `selectable` capability and the
container's assertion (R-STATE-08) and an unbacked prefix is an error. It serializes to the backing
attribute selector (`[aria-selected="true"]`), the mirror of `hover:`'s pseudo-class suffix.

This retires the fixed `selection-treatment` subtle/strong levels in favour of composable selection
that expresses a project's real selected look.

Introduces ruling: R-STATE-11. Refines R-STATE-08, R-STATE-10.
