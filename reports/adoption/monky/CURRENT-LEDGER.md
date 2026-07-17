# Ermine current ledger — monky

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write --gate
```

## Provenance

| source | commit |
|---|---|
| Ermine | `6ec20ef0a92d902764558298509d83b644703760` |
| monky | `6714b7aede685f61d91289576df306c06eb03ddd` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Project-wide judgments are recorded in
`project.json`; any one-off overrides live in `current-overrides.json` and are
re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | 520 |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | 394 |
| **residue — project-owned declarations** | **126** |
| assimilable now (work list below) | 0 |
| shadowed words (R-IMPL-02) | 0 undeclared / 0 declared |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
| `ermine-emitted` | 279 | the generated Ermine grammar surface (adopted, not residue) |
| `substrate` | 53 | reset, base typography, and font delivery below grammar authoring |
| `theme-metric` | 61 | project scale values and Ermine scale bindings (deliberate non-coverage) |
| `config-departure` | 1 | explicit project departure recorded in ermine.config.css |
| `recipe-identity` | 26 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `brand-identity` | 4 | project brand typography and type treatment |
| `component-contract` | 1 | component-owned mechanics, exact geometry, or product contract |
| `state-mechanics` | 1 | JS/native state mechanics outside backed Ermine conditions |
| `parent-relational` | 1 | guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13) |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 8 | engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15) |
| `motion-followup` | 1 | transition/animation timing (deferred to GAP-U-animation-plane) |
| `opacity-followup` | 2 | opacity state treatment (named follow-up question) |
| `elevation-followup` | 2 | box-shadow outside the elevated treatment — rings and identity signatures (R-SKIN-09) |
| `reset-absence` | 3 | absence/reset mechanics, not a positive carrier |
| `user-content` | 43 | rich-text defaults inside user-authored content |
| `identity-geometry` | 11 | project-exact geometry on a grammar-family property |

## Residue by file

| file | declarations |
|---|---:|
| `src/styles/fragments/semantic-fragments.css` | 89 |
| `src/styles/skin/controls.css` | 16 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | 6 |
| `src/content/overlays/views/search/searchViewStyles.css` | 4 |
| `src/styles/entries/pages.css` | 4 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | 3 |
| `src/styles/components/content-editor.css` | 3 |
| `src/content/overlays/modal/modalStyles.css` | 1 |

No assimilable declarations remain — the residue is declared boundary and follow-up questions.

No shadowed words — every paragraph is true or silent about every property (R-IMPL-02).

Every record with its code is in `current-ledger.json`.
