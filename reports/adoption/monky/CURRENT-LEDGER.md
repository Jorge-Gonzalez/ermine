# Ermine current ledger — monky

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write --gate
```

## Provenance

| source | commit |
|---|---|
| Ermine | `3596610363fbac8e5fe6a0fce442a44e97bd4f7a` |
| monky | `1faa1cc0f0db95d00588ad6a5a3e210c265e3225` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Project-wide judgments are recorded in
`project.json`; any one-off overrides live in `current-overrides.json` and are
re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | 591 |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | 213 |
| **residue — project-owned declarations** | **378** |
| assimilable now (work list below) | 0 |
| shadowed words (R-IMPL-02) | 0 undeclared / 0 declared |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
| `ermine-emitted` | 121 | the generated Ermine grammar surface (adopted, not residue) |
| `substrate` | 52 | reset, base typography, and font delivery below grammar authoring |
| `theme-metric` | 39 | project scale values and Ermine scale bindings (deliberate non-coverage) |
| `config-departure` | 1 | explicit project departure recorded in ermine.config.css |
| `recipe-identity` | 102 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `brand-identity` | 11 | project brand typography and type treatment |
| `component-contract` | 65 | component-owned mechanics, exact geometry, or product contract |
| `state-mechanics` | 5 | JS/native state mechanics outside backed Ermine conditions |
| `aria-current` | 1 | aria-current-conditioned remainder (current: itself is ruled, R-STATE-12) |
| `parent-relational` | 9 | guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13) |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 9 | engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15) |
| `motion-followup` | 23 | transition/animation timing (deferred to GAP-U-animation-plane) |
| `opacity-followup` | 4 | opacity state treatment (named follow-up question) |
| `elevation-followup` | 3 | box-shadow outside the elevated treatment — rings and identity signatures (R-SKIN-09) |
| `reset-absence` | 15 | absence/reset mechanics, not a positive carrier |
| `user-content` | 43 | rich-text defaults inside user-authored content |
| `identity-geometry` | 65 | project-exact geometry on a grammar-family property |

## Residue by file

| file | declarations |
|---|---:|
| `src/styles/skin/controls.css` | 100 |
| `src/styles/components/content-editor.css` | 78 |
| `src/content/overlays/views/search/searchViewStyles.css` | 42 |
| `src/content/overlays/views/settings/settingsViewStyles.css` | 42 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | 30 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | 29 |
| `src/popup/popup.css` | 19 |
| `src/content/overlays/modal/modalStyles.css` | 14 |
| `src/styles/theme/metrics.css` | 9 |
| `src/styles/entries/pages.css` | 8 |
| `src/options/options.css` | 5 |
| `src/content/overlays/deleteConfirm/deleteConfirmStyles.css` | 2 |

No assimilable declarations remain — the residue is declared boundary and follow-up questions.

No shadowed words — every paragraph is true or silent about every property (R-IMPL-02).

Every record with its code is in `current-ledger.json`.
