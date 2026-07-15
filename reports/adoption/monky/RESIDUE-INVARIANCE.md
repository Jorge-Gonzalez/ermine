# Monky Residue Invariance Overlay

This report overlays the current-ledger residue with the two-metric invariance test from
`docs/proportional-plane.md` and `docs/non-ermine.txt`. It does not change any ledger code:
`CURRENT-LEDGER.md` remains the source of live adoption counts, while this file explains which
parts of the ledger are true local boundary and which are future grammar evidence.

## Current Ledger Baseline

| measure | count |
|---|---:|
| current declarations | 516 |
| adopted/infrastructure declarations | 223 |
| project-owned residue declarations | 293 |
| assimilable declarations | 0 |
| shadowed words | 0 |

`assimilable = 0` means no existing Ermine word can consume more current declarations today. It
does not mean every remaining declaration is final product identity.

## Invariance Sample

The corrected pass sampled the two buckets most likely to hide the metric trap:
`identity-geometry` and `component-contract`.

| bucket | declarations | relational | scale-backed | off-grid identity | substrate/reset |
|---|---:|---:|---:|---:|---:|
| `identity-geometry` | 59 | 18 | 17 | 17 | 7 |
| `component-contract` | 55 | 28 | 8 | 16 | 3 |
| **combined** | **114** | **46** | **25** | **33** | **10** |

Reading:

- **Relational** values survive re-resolution: order, proportion, edge attachment, centering,
  self-ratio, fit/hug, measure, and grid proportions. These are future grammar words.
- **Scale-backed** values already ride Monky/Ermine scales but may need a missing shape, such as
  per-edge spacing, before they can migrate cleanly.
- **Off-grid identity** values are raw constants with no continuum or scale behind them. This is
  the hard local floor.
- **Substrate/reset** rows are mechanics or absence values, not positive style carriers.

## Status Of The Plane

Already admitted and migrated:

| word | ruling | effect |
|---|---|---|
| `fill` / `fill-inline` / `fill-block` | R-SIZE-01 / ADR-0024 | `inline-size` / `block-size: 100%` |
| `square` | R-SIZE-02 / ADR-0025 | `aspect-ratio: 1` |

Admitted in Ermine; Monky migration still pending:

| word | ruling | effect |
|---|---|---|
| `cover` | R-SIZE-03 / ADR-0026 | `inset: 0` |

Next candidates by cleanliness:

| candidate | evidence shape | note |
|---|---|---|
| `push` | `margin-left: auto` / auto-margin push | Clean, but needs axis/reference wording. |
| `center` | `left: 50%` + translate, `margin: 0 auto` | Valuable, but needs transform/position framing. |
| `fit` / `hug` | `width: fit-content`, `fit-content(...) 1fr` | Related to existing flex/content sizing words. |
| `measure` | readable/clamped widths | Needs a ruled relation to size scale or viewport. |
| `columns-12` + intent proportions | `1fr 3fr`, `fit-content(...) 1fr` | Highest leverage; should be a deliberate ruling cycle. |

## Consequence

The boundary manifest is still correct as an adoption gate: current Monky has no assimilable
declarations and no shadowed words. But the identity-looking residue is not all identity. The
next Ermine work should treat `identity-geometry` and `component-contract` as mixed buckets:
some local floor, some scale repair, and a large relational roadmap.
