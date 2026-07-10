# Monky pilot — U8f frozen-ledger closure

This pass takes the U2 baseline ledger to a fully terminal state: the 329 remaining
`uncertain` records are classified, and no `pending` field survives. It edits
`ledger.json` dispositions and evidence only — record identity, count (1409), and
conservation are unchanged, and no Monky source changes here.

It executes exactly the resolution path the U8b triage prescribed, now that the rulings
it was waiting for exist (R-SKIN-02…08, R-STATE-09…11, R-SCALE-03, the U8e theme
binding), and it uses the new current-ledger generator's inverse-emission machinery
(`adoption/current-ledger.ts`) instead of hand judgment wherever a check can be
mechanical.

## Result

| Disposition | Before | After |
|---|---:|---:|
| grammar-exact | 104 | 128 |
| grammar-composition | 46 | 64 |
| skin-local | 339 | 472 |
| identity-local | 138 | 238 |
| substrate | 37 | 58 |
| gap | 0 | 33 |
| dead | 416 | 416 |
| uncertain | 329 | **0** |

## Method per U8b bucket

### Existing-Ermine candidates (93)

Three-way decision, mechanical first:

1. **Still present verbatim in current Monky** (43) → `identity-local`. Survival is
   selector-aware: the exact (selector, property, value) triple is parsed from current
   Monky CSS with the generated grammar file excluded. These were deliberately kept
   local by the U5–U8 pilots; where an Ermine word could express one today, the evidence
   says so and the record appears on the current ledger's `assimilable` work list.
2. **Gone, and inverse emission matches** (42) → `grammar-exact` (24) or
   `grammar-composition` (18). Every vocabulary word is compiled through `toCss()` and
   both sides resolved through the recorded scale bindings and socket bridge; shorthands
   are split (`padding: X Y` → block/inline pair, `flex-flow: row wrap` →
   `horizontal wrap-allowed`, `flex: 1` → `elastic basis-ratio`, `display: flex` paired
   with the sibling `flex-direction`), and legacy value syntax is canonicalized
   (`rem`→px at the recorded 16px root, `flex-start`→`start`). Spot-checked against
   `ermine.elements.json`: the inferred compositions appear verbatim in the current
   manifest (e.g. the toolbar's `horizontal wrap-allowed align-center gap-tight
   padding-block-tight padding-inline-snug`).
3. **Gone, no match** (8) → `identity-local` as superseded exact geometry: off-scale
   rem values the migration re-specified on the Ermine scale.

### Shared-ruling candidates (150)

- Scale-token definitions (`--spacing-*`, `--radius-*`, `--text-*`, `--transition-*`)
  (24) → `skin-local`: Monky metric configuration behind Ermine's bindings (R-SCALE-03,
  COVERAGE §6), conserved in current `theme/metrics.css`.
- Element/root selectors with no class hook (`body`, `:host`, `*`, `@font-face`, form
  inheritance) → `substrate` (21): base typography, font delivery, normalization —
  current home is `theme/font.css`, `theme/font-face.css`, `substrate/reset.css`.
- Component paint/type/border/radius (105) → `skin-local` under the ratified skin plane:
  expressed by theme-backed carriers or deliberately Monky-owned per the pilots'
  boundary reasons.

### Identity-local candidates (49)

→ `identity-local`, per the triage: component contract — exact dimensions, positioning,
overflow, list behavior, affordance geometry/timing. Generalization, if it happens, goes
through `GAP-U-interaction-affordance`.

### Ermine-evolution candidates (37)

- Scrollbar declarations (24) → `gap` pointing at the newly filed
  `reports/GAP-U-scrollbar-prominence.md`.
- Keyframes and `animation` (9) → `gap` pointing at `reports/GAP-U-animation-plane.md`.
- Opacity prominence treatment (4) → `skin-local`, a named follow-up question
  (opacity state treatment), Monky-owned pending a treatment ruling.

The 33 `gap` records are not regressions: they are the designed terminal state for
evidence awaiting an Ermine decision, now attached to filed reports instead of parked as
`uncertain`.

## Verification

| Check | Result |
|---|---|
| `npm run adoption:check` | valid, 1409 records, conservation holds |
| uncertain remaining | 0 |
| `pending` fields remaining | 0 |
| Gap reports referenced | both exist and are readable |

## What this means for status

The frozen U2 ledger is closed; it is now purely historical accounting. Current
migration status lives in the generated current ledger
(`current-ledger.json` / `CURRENT-LEDGER.md`), regenerated per pass by:

```sh
npm run adoption:current -- --project ../monky --name monky --write
```
