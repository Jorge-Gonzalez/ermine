# Ermine current ledger — monky

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write --gate
```

## Provenance

| source | commit |
|---|---|
| Ermine | `05362f5266005b000f253ba4f1b5e548dfba62d3` |
| monky | `31c571782ecc03ccc22f8dcd04d8b37f9e8b918a` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Project-wide judgments are recorded in
`project.json`; any one-off overrides live in `current-overrides.json` and are
re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | 714 |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | 189 |
| **residue — project-owned declarations** | **525** |
| assimilable now (work list below) | 0 |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
| `ermine-emitted` | 98 | the generated Ermine grammar surface (adopted, not residue) |
| `substrate` | 51 | reset, base typography, and font delivery below grammar authoring |
| `theme-metric` | 39 | project scale values and Ermine scale bindings (deliberate non-coverage) |
| `config-departure` | 1 | explicit project departure recorded in ermine.config.css |
| `recipe-identity` | 116 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `rule-mechanics` | 49 | border/rule mechanics held for GAP-K6-skin-surface |
| `brand-identity` | 22 | project brand typography and type treatment |
| `affordance-mechanics` | 12 | cursor/user-select affordance mechanics (GAP-U-interaction-affordance) |
| `component-contract` | 74 | component-owned mechanics, exact geometry, or product contract |
| `state-mechanics` | 5 | JS/native state mechanics outside backed Ermine conditions |
| `focus-state` | 4 | focus-conditioned remainder — rings and mechanics (focus: itself is ruled, R-STATE-10) |
| `aria-current` | 1 | aria-current-conditioned remainder (current: itself is ruled, R-STATE-12) |
| `parent-relational` | 12 | ancestor state drives a descendant (GAP-U-parent-relational-state) |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 19 | scrollbar prominence (GAP-U-scrollbar-prominence) |
| `motion-followup` | 23 | transition/animation timing (deferred to GAP-U-animation-plane) |
| `opacity-followup` | 6 | opacity state treatment (named follow-up question) |
| `elevation-followup` | 3 | box-shadow outside the elevated treatment — rings and identity signatures (R-SKIN-09) |
| `reset-absence` | 26 | absence/reset mechanics, not a positive carrier |
| `user-content` | 43 | rich-text defaults inside user-authored content |
| `identity-geometry` | 87 | project-exact geometry on a grammar-family property |

## Residue by file

| file | declarations |
|---|---:|
| `src/styles/skin/controls.css` | 104 |
| `src/styles/components/content-editor.css` | 97 |
| `src/content/overlays/views/search/searchViewStyles.css` | 71 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | 48 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | 47 |
| `src/popup/popup.css` | 47 |
| `src/content/overlays/views/settings/settingsViewStyles.css` | 45 |
| `src/content/overlays/modal/modalStyles.css` | 19 |
| `src/styles/skin/surfaces.css` | 18 |
| `src/styles/entries/pages.css` | 10 |
| `src/styles/theme/metrics.css` | 9 |
| `src/content/overlays/deleteConfirm/deleteConfirmStyles.css` | 5 |
| `src/options/options.css` | 5 |

No assimilable declarations remain — the residue is declared boundary and follow-up questions.

Every record with its code is in `current-ledger.json`.
