---
register: history
---

# ADR-0034 — `columns-12` and intent proportions

source: `docs/proportional-plane.md`; `reports/adoption/monky/RESIDUE-INVARIANCE.md`;
Monky `.settings-group { grid-template-columns: 1fr 3fr }`

The grid model of the proportional plane is admitted in two halves:

- **`columns-12`** (R-STRUCTURE-03) — a structure member declaring the shared twelve-column grid
  (`display: grid`, `grid-auto-flow: row`, `grid-template-columns: repeat(12, 1fr)`). It replaces
  plain `grid`. Twelve is the ruled grain: the common proportions land on exact integer tracks over
  it, and only over it. Fixed, not per-container, so the intent-proportions stay exact.
- **Intent proportions** (R-M5-02) — `half`/`third`/`quarter`/`two-thirds`/`three-quarters`/`sixth`
  as `m5-grid-placement` members emitting `grid-column: span 6/4/3/8/9/2`. The readable form of a
  span, demoting raw `span-N` to an escape. Coupled to `columns-12` by construction (a `quarter` is
  span-3 only because the grid is twelve).

**Byte-identical vs render-identical.** An earlier pass deferred this over a byte-identical concern:
migrating `.settings-group { grid-template-columns: 1fr 3fr }` (label `quarter`, content
`three-quarters`) changes the container's computed `grid-template-columns` from `300px 900px` to
twelve `100px` tracks. That was the wrong invariant. At the settings-group's **column-gap of 0**, the
twelve-track grid with `span-3`/`span-9` renders pixel-identically — the children are still 300px /
900px. The visible layout is unchanged; only the template string differs. The style-smoke probe was
updated to assert the child widths (the real invariant) rather than the container template string.

**Caveat (recorded in the plane doc).** A twelve-track grid equals explicit fractional tracks only
at column-gap 0 (or when spans absorb the gaps). With a gap > 0, twelve tracks carry eleven internal
gaps versus a two-track's one, so widths diverge — a genuine rendering change. Applies to any future
gridded container that carries a column gap.

Introduces rulings: R-STRUCTURE-03, R-M5-02.
