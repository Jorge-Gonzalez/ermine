# Ermine current ledger — monky

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write --gate
```

## Provenance

| source | commit |
|---|---|
| Ermine | `ed12f35b46a9e139bbdec298ae11fe98d4a86840` |
| monky | `092f22d6f2648d3cae55cd9701e1a2617a44e9af` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Project-wide judgments are recorded in
`project.json`; any one-off overrides live in `current-overrides.json` and are
re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | 498 |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | 398 |
| **residue — project-owned declarations** | **100** |
| assimilable now (work list below) | 0 |
| shadowed words (R-IMPL-02) | 0 undeclared / 0 declared |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
| `ermine-emitted` | 283 | the generated Ermine grammar surface (adopted, not residue) |
| `substrate` | 53 | reset, base typography, and font delivery below grammar authoring |
| `theme-metric` | 61 | project scale values and Ermine scale bindings (deliberate non-coverage) |
| `config-departure` | 1 | explicit project departure recorded in ermine.config.css |
| `recipe-identity` | 22 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `state-mechanics` | 1 | JS/native state mechanics outside backed Ermine conditions |
| `parent-relational` | 1 | guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13) |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 8 | engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15) |
| `opacity-followup` | 2 | opacity state treatment (named follow-up question) |
| `user-content` | 43 | rich-text defaults inside user-authored content |

## Residue by file

| file | declarations |
|---|---:|
| `src/styles/fragments/semantic-fragments.css` | 92 |
| `src/styles/skin/controls.css` | 8 |

No assimilable declarations remain — the residue is declared boundary and follow-up questions.

No shadowed words — every paragraph is true or silent about every property (R-IMPL-02).

Every record with its code is in `current-ledger.json`.
