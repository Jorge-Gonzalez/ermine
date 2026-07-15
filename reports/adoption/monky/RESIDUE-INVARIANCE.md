# Monky Residue Invariance Overlay

This report overlays the current-ledger residue with the two-metric invariance test from
`docs/proportional-plane.md` and `docs/non-ermine.txt`. It does not change any ledger code:
`CURRENT-LEDGER.md` remains the source of live adoption counts, while this file explains which
parts of the ledger are true local boundary and which are future grammar evidence.

## Current Ledger Baseline

| measure | count |
|---|---:|
| current declarations | 516 |
| adopted/infrastructure declarations | 238 |
| project-owned residue declarations | 278 |
| assimilable declarations | 0 |
| shadowed words | 0 |

`assimilable = 0` means no existing Ermine word can consume more current declarations today. It
does not mean every remaining declaration is final product identity.

## Invariance Sample

The corrected pass originally sampled the two buckets most likely to hide the metric trap:
`identity-geometry` and `component-contract`. The table below remains that frozen
classification sample; the live ledger has since migrated `center-x`, `center-y`, the
page-container `max-width-2xl` slice, flow centering (`centered flush-block`), grid fit
(`grid-fit-sm`), and the `min-width-sm` scale follow-on, so the current bucket counts are now
`identity-geometry = 59` and `component-contract = 39`.

| bucket | declarations | relational | scale-backed | off-grid identity | substrate/reset |
|---|---:|---:|---:|---:|---:|
| `identity-geometry` | 59 | 18 | 17 | 17 | 7 |
| `component-contract` | 55 | 28 | 8 | 16 | 3 |
| **combined** | **114** | **46** | **25** | **33** | **10** |

Reading:

- **Relational** values survive re-resolution: order, proportion, edge attachment, centering,
  self-ratio, content sizing, measure, grid-track fit, and grid proportions. These are future grammar words.
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
| `cover` | R-SIZE-03 / ADR-0026 | `inset: 0` |
| `push` | R-SIZE-04 / ADR-0027 | `margin-inline-start: auto` |
| `hug-inline` | R-SIZE-05 / ADR-0028 | `inline-size: fit-content` |
| `center-x` | R-SIZE-06 / ADR-0029 | `left: 50%` + `transform: translateX(-50%)` |
| `center-y` | R-SIZE-06 / ADR-0030 | `top: 50%` + `transform: translateY(-50%)` |
| size `2xl` / `max-width-2xl` | R-SCALE-01 / ADR-0030 | `max-width: var(--size-2xl)` through constraints |
| `centered` + `flush-block` | R-SIZE-07 / ADR-0031 | `margin-inline: auto` + `margin-block: 0` |
| `grid-fit-sm` | R-STRUCTURE-02 / ADR-0032 | `grid-template-columns: fit-content(var(--size-sm)) 1fr` |

Next candidates by cleanliness:

| candidate | evidence shape | note |
|---|---|---|
| remaining measure | `max-width: 8em`, `width: min(...)`, viewport clamps | Filed as `reports/GAP-U-measure-viewport.md`; the page-container `672px` case already migrated via size `2xl`. |
| `columns-12` + intent proportions | `1fr 3fr` | Highest leverage; should be a deliberate ruling cycle. |

## Consequence

The boundary manifest is still correct as an adoption gate: current Monky has no assimilable
declarations and no shadowed words. But the identity-looking residue is not all identity. The
next Ermine work should treat `identity-geometry` and `component-contract` as mixed buckets:
some local floor, some scale repair, and a large relational roadmap.
