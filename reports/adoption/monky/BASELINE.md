# Ermine adoption baseline — monky

Generated artifact. Do not hand-edit; run the commands below.

## Provenance

| source | commit |
|---|---|
| Ermine analyzer | `bdabb07f18953043a9842ca52274c4b742791c97` |
| monky | `fc2af4525beadc0d0b85144f615e2f0fe8bd2acf` |

Reproduce from the Ermine repository root:

```sh
node --import tsx adoption/analyze.ts --project ../monky --name monky --write
node --import tsx adoption/analyze.ts --project ../monky --name monky --check
```

## Source and delivery inventory

| measure | count |
|---|---:|
| CSS files | 11 |
| CSS template literals | 1 |
| parsed declarations | 1409 |
| CSS `@import` edges | 4 |
| raw CSS imports | 6 |
| linked page stylesheets | 4 |
| style injection calls | 4 |
| Shadow Root creation sites | 1 |
| recorded bundles | 8 |
| inline style objects (limitation) | 16 |
| direct `.style` writes (limitation) | 13 |

The declaration ledger counts each physical CSS file and detected TypeScript CSS template once.
Imports and bundle assembly are delivery edges, not duplicate declarations.

## Ermine compatibility ceiling

The existing measurement library reports 1119/1367 real-property declarations
(81.9%) in property families Ermine can represent. This is a property
scope ceiling, not a semantic mapping rate.

| static-class diagnostic | count |
|---|---:|
| distinct static tokens | 222 |
| lawful Ermine words | 9 |
| recognized but unlawful words | 0 |
| foreign identity/skin candidates | 213 |
| unlawful known-word compositions | 0 |
| undefined static tokens | 41 |
| duplicate selector/property definitions | 48 |
| context-dependent class/property definitions | 117 |

Foreign tokens are candidates only. This baseline does not decide whether they are identity, skin,
dead code, or missing grammar.

## Initial declaration dispositions

| disposition | declarations |
|---|---:|
| grammar-exact | 0 |
| grammar-composition | 0 |
| skin-local | 0 |
| identity-local | 0 |
| substrate | 34 |
| gap | 0 |
| dead | 0 |
| uncertain | 1375 |

All non-reset declarations begin `uncertain`. Grammar-owned properties are only candidates until a
human confirms intent and a complete class string passes Ermine linting. The mechanically recognized
reset subset begins `substrate` under the protocol's reset test.

## Limitations

- Only src/ is scanned; ignored docs, fixtures, public test pages, build output, dependencies, and test files are excluded.
- Static syntax only: runtime-computed imports, class names, selectors, and CSSOM mutations are not interpreted.
- Template CSS detection is limited to const-assigned template literals containing declaration-shaped text.
- Dynamic class expressions contribute discoverable literal branches, but possible co-occurrence is not inferred.
- State and relational entailment are not judged from string extraction; application markup requires later review.
- Inline style objects and direct .style writes are counted as limitations and are not converted into declaration ledger records.
- The CSS parser handles ordinary nested at-rules but does not execute preprocessors, resolve the cascade, or observe computed styles.
- Property-family coverage comes from analysis/lib.ts and is a compatibility ceiling, not proof of semantic equivalence.

Detailed paths, class diagnostics, duplicate definitions, measurements, and non-stylesheet writes are
in `inventory.json`; every parsed declaration is in `ledger.json` exactly once.

No grammar or skin ruling is made here.
