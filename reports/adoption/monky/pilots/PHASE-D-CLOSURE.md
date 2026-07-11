# Monky pilot — Phase D closure

Phase D did not add vocabulary or change rendering. It converted the Phase A-C accounting into a
declared, machine-checked boundary and made the adoption tooling reusable for a second project.

## Closure Results

| measure | result |
|---|---:|
| current declarations | 714 |
| project-owned residue | 525 |
| assimilable declarations | 0 |
| `skin-review` | 0 |
| `identity-review` | 0 |
| `state-review` | 0 |

The 219 review-coded rows from Phase C were absorbed by the Monky project profile and terminal
reason codes. The current ledger now reports these terminal buckets:

| terminal bucket | current rows | basis |
|---|---:|---|
| `recipe-identity` | 116 | project recipes declared in `project.json`; R-SKIN-10 |
| `rule-mechanics` | 49 | border/rule mechanics held for `reports/GAP-K6-skin-surface.md` |
| `brand-identity` | 22 | brand type and typography treatment |
| `affordance-mechanics` | 12 | cursor/user-select evidence for `reports/GAP-U-interaction-affordance.md` |
| `component-contract` | 74 | exact component mechanics and product contracts |
| `state-mechanics` | 5 | JS/native state mechanics outside backed Ermine conditions |

## Artifacts

- `project.json` declares Monky's recipes, user-content root, and bridge file.
- `BOUNDARY.md` is generated when the current-ledger gate is closed.
- `CASE-STUDY.md` publishes the adoption narrative and lessons.
- Monky commit `31c5717` adds `npm run styles:reconcile`, which runs
  `adoption/current-ledger.ts --check --gate` against Ermine.

## Verification

| command | result |
|---|---|
| `npm run adoption:current -- --project ../monky --name monky --write --gate` | passed; wrote current ledger and boundary |
| `npm run styles:reconcile -- --ermine-root ../ermine` in Monky | passed; reports current |

Remaining work is deliberately outside adoption: animation-plane, scrollbar prominence,
parent-relational state, interaction affordance, dataviz palette, and skin-surface mechanics are
future Ermine ruling cycles with counted evidence.
