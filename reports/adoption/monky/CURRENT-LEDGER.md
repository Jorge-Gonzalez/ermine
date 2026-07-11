# Ermine current ledger — monky

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write
```

## Provenance

| source | commit |
|---|---|
| Ermine | `60232eb8c098a7cead1b650b80749a79de9adbe2` |
| monky | `6b457f27870c2752330dcf9cd423f6795db1bcf2` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Human judgments are recorded in
`current-overrides.json` and re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | 718 |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | 185 |
| **residue — project-owned declarations** | **533** |
| assimilable now (work list below) | 0 |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
| `ermine-emitted` | 94 | the generated Ermine grammar surface (adopted, not residue) |
| `substrate` | 51 | reset, base typography, and font delivery below grammar authoring |
| `theme-metric` | 39 | project scale values and Ermine scale bindings (deliberate non-coverage) |
| `config-departure` | 1 | explicit project departure recorded in ermine.config.css |
| `state-review` | 19 | same-element state condition with no matching backed prefix yet |
| `focus-state` | 15 | focus treatment pending a focus condition ruling |
| `aria-current` | 3 | aria-current backing; deliberately not recast as selected:/checked: |
| `parent-relational` | 12 | ancestor state drives a descendant; conditions are same-element today |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 19 | scrollbar prominence (named follow-up question) |
| `motion-followup` | 28 | transition/animation timing (named follow-up question) |
| `opacity-followup` | 9 | opacity state treatment (named follow-up question) |
| `elevation-followup` | 5 | shadow geometry pending raised/sunken (named follow-up question) |
| `reset-absence` | 41 | absence/reset mechanics, not a positive carrier |
| `user-content` | 43 | rich-text defaults inside user-authored content |
| `identity-geometry` | 99 | project-exact geometry on a grammar-family property |
| `skin-review` | 122 | paint awaiting a carrier or recipe judgment |
| `identity-review` | 95 | awaiting project judgment |

## Residue by file

| file | declarations |
|---|---:|
| `src/styles/skin/controls.css` | 104 |
| `src/styles/components/content-editor.css` | 100 |
| `src/content/overlays/views/search/searchViewStyles.css` | 72 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | 48 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | 48 |
| `src/popup/popup.css` | 48 |
| `src/content/overlays/views/settings/settingsViewStyles.css` | 45 |
| `src/content/overlays/modal/modalStyles.css` | 21 |
| `src/styles/skin/surfaces.css` | 18 |
| `src/styles/entries/pages.css` | 10 |
| `src/styles/theme/metrics.css` | 9 |
| `src/content/overlays/deleteConfirm/deleteConfirmStyles.css` | 5 |
| `src/options/options.css` | 5 |

No assimilable declarations remain — the residue is boundary, follow-up questions, and open judgments.

Every record with its code is in `current-ledger.json`.
