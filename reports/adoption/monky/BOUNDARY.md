# Monky / Ermine boundary manifest

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write --gate
```

This is the declared boundary for Monky's closed adoption. It supersedes the scattered
per-pilot "Left local" tables: those reports remain history, while this document is the
machine-checked current contract.

Important scope note: the reason codes below are current-ledger accounting buckets, not a
final grammar-floor analysis. A row can be project-owned today because no ruled Ermine word
exists yet and still be future grammar evidence. For Monky, the invariance-test pass in
`docs/non-ermine.txt` shows that the `identity-geometry` and `component-contract`
buckets contain a mix of relational values, scale-backed values, substrate/reset mechanics,
and truly off-grid identity. Treat this manifest as the checked adoption boundary, and the
invariance pass as the roadmap for future ruling cycles.

## Provenance

| source | commit |
|---|---|
| Ermine | `6ec20ef0a92d902764558298509d83b644703760` |
| monky | `6714b7aede685f61d91289576df306c06eb03ddd` |

## Closure Gate

| measure | count |
|---|---:|
| assimilable declarations | 0 |
| review-coded declarations | 0 |
| project-owned residue | 126 |

## Product Identity

Monky keeps recipe bundles, brand type, identity shadows, and the exact geometry that is
still project-owned in the current ledger. Some exact-looking geometry is true product
identity; some is relational or scale-backed evidence waiting on future words. The licensing
rules are R-SKIN-10 for recipes, U-R2 for project intent and exact geometry, and R-SKIN-09's
boundary clause for shadows that are signatures rather than the shared `elevated` treatment.

| code | count | boundary |
|---|---:|---|
| `recipe-identity` | 26 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `identity-geometry` | 11 | project-exact geometry on a grammar-family property |
| `brand-identity` | 4 | project brand typography and type treatment |
| `elevation-followup` | 2 | box-shadow outside the elevated treatment — rings and identity signatures (R-SKIN-09) |

## Relational / Scale-Backed Follow-Up

The current ledger keeps `identity-geometry` and `component-contract` separate from
`assimilable`, because no existing Ermine word can consume those declarations today. That
does not mean every row is final product identity. The invariance-test analysis in
`docs/non-ermine.txt` sampled those two buckets and found:

| sample | relational | scale-backed | off-grid identity | substrate/reset |
|---|---:|---:|---:|---:|
| `identity-geometry` + `component-contract` | 46 | 25 | 33 | 10 |

Relational rows are evidence for the proportional/relational plane (`cover`, `center`,
`push`, `hug-inline`, grid fit, `measure`, viewport fill, and grid intent-proportions). Scale-backed
rows are candidates for existing or near spacing/corner grammar, especially where per-edge
spacing is the missing shape. Only the off-grid slice is the hard local floor.

## Mechanics

Monky keeps mechanics that are selector or component contracts rather than reusable grammar:
pseudo-element geometry, absence sentinels, border/rule mechanics, native or JS-toggled state
mechanics, overlap/layer tricks, and exact component behavior. The cascade-layer seam — a local
rule in a later layer outranks generated grammar — is machine-checked under R-IMPL-02: the
shadowed-words gate holds every paragraph true or silent about every property.

| code | count | boundary |
|---|---:|---|
| `component-contract` | 1 | component-owned mechanics, exact geometry, or product contract |
| `state-mechanics` | 1 | JS/native state mechanics outside backed Ermine conditions |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `reset-absence` | 3 | absence/reset mechanics, not a positive carrier |

## User Content

The editor body's authored rich-text defaults remain a user-content contract. Ermine words style
Monky's UI chrome around that content; the content surface itself keeps its own HTML defaults.

| code | count | boundary |
|---|---:|---|
| `user-content` | 43 | rich-text defaults inside user-authored content |

## Filed Questions

These rows are not adoption work. They are pre-counted evidence for future Ermine ruling cycles.

| code | rows | evidence |
|---|---:|---|
| `parent-relational` | 1 | R-STATE-13 boundary: guarded/JS-state relational mechanics |
| `scrollbar-followup` | 8 | R-SKIN-15 boundary: engine-drawn identity outside the treatment |
| `motion-followup` | 1 | reports/GAP-U-animation-plane.md |
| `opacity-followup` | 2 | named follow-up: opacity prominence treatment (no report filed yet) |
| `elevation-followup` | 2 | R-SKIN-09 boundary clause |
