# Ermine current ledger — monky

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write --gate
```

## Provenance

| source | commit |
|---|---|
| Ermine | `5d1629d40d9299533158c0a871706fa4757b6ded` |
| monky | `f8cfd2f6cfef8f5f4162e6f97bc70b4e872cc3df` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Project-wide judgments are recorded in
`project.json`; any one-off overrides live in `current-overrides.json` and are
re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | 506 |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | 407 |
| **residue — project-owned declarations** | **99** |
| assimilable now (work list below) | 0 |
| shadowed words (R-IMPL-02) | 0 undeclared / 0 declared |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
| `ermine-emitted` | 292 | the generated Ermine grammar surface (adopted, not residue) |
| `substrate` | 53 | reset, base typography, and font delivery below grammar authoring |
| `theme-metric` | 61 | project scale values and Ermine scale bindings (deliberate non-coverage) |
| `config-departure` | 1 | explicit project departure recorded in ermine.config.css |
| `recipe-identity` | 23 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `parent-relational` | 1 | guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13) |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 9 | engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15) |
| `user-content` | 43 | rich-text defaults inside user-authored content |

## Residue by file

| file | declarations |
|---|---:|
| `src/styles/fragments/semantic-fragments.css` | 99 |

No assimilable declarations remain — the residue is declared boundary and follow-up questions.

No shadowed words — every paragraph is true or silent about every property (R-IMPL-02).

Every record with its code is in `current-ledger.json`.
