# Typed surface — law enforcement, honestly

One row per law: what the class-string surface (the linter) enforces, what the
typed props surface enforces, and where. "Compile" means the TypeScript checker
rejects the authoring — proven by `@ts-expect-error` cases in
`test/typed-surface.test.ts` (a passing suppression IS the proof). "Runtime"
means `toClassString`'s dev-mode lint gate throws. "Not enforced" means the
typed surface cannot see the fact at all and says so here rather than
pretending. This table is the precise answer to "why not just Sprinkles": the
typed surface natively enforces the *compositional* laws, and it is honest that
the *entailment* laws live at runtime or nowhere.

| law | class-string surface (linter) | typed surface | notes |
|---|---|---|---|
| coining (no new words) | P2 `unknown-word`, error | **compile** | every prop value is a union/template of registry words; a non-word does not typecheck |
| P1 one word per axis, per scope | error | **compile** (with one stated leak) | one prop = one word by construction; scope objects reproduce per-scope P1; exclusivity-"one" state groups are single-valued unions. Leak: exclusivity-"many" group arrays admit registry-conflicting pairs (`selected` + `checked-mixed`) — caught at **runtime** by the dev gate (`state-conflict`) |
| P2 unknown word | error | **compile** | see coining |
| P3 open parameter domains | error (`bad-parameter`) | **partial compile** | scale steps and alias unions are compile-checked; numeric dials (`grow`, `shrink`) are typed `number`, which is wider than integer-≥0 — floats/negatives are caught at **runtime** by the dev gate |
| P4 enumerated arity carries a value | error (`enum-arity`) | **compile** | enumerated members exist only as `word-value` literals in the group union; a bare `sorted` is not a type |
| P5 whole-axis alias vs dials | error (folded into P1) | **compile** | four generated XOR families: `FlexExclusive`, `PaddingExclusive`, `MarginExclusive`, `OverflowExclusive` — combining a whole-axis value with a dial is a compile error, one `@ts-expect-error` each |
| P6 arity misuse (binary word, tri-state backing) | error, given backing | **not enforced** | the misuse is defined by the element's real backing, which no props object carries |
| P7 dimensional purity | not a per-authoring law | not a per-authoring law | a registry/emission invariant, enforced for both surfaces by the build gates (`ownership:check`, P7 tests) |
| P8 state entailment (instance) | error when backing is supplied; skipped without | **not enforced** | plainly: emitting `selection: "selected"` compiles and passes the dev gate. The backing obligation (`aria-selected` on the element) is a runtime DOM truth; the dev gate deliberately filters `state-entailment` because a class string cannot prove it either way |
| P8b relational entailment | error when container context is supplied | **not enforced** | same, inverted: the backing lives on the container (`aria-activedescendant`) |
| P9 no-coining (extension contract) | error | **compile** | same mechanism as P2/coining; new *values* enter only through the sanctioned numeric dials and scale unions |
| P10 divider × wrap hazard | **warning** | **not enforced** | the dev gate throws on errors only; the hazard surfaces when the produced string is linted (the class-string toolchain warns) |
| P11 flow-participation inertness | warning, given parent context | **not enforced** | requires the parent's classes; a props object has no parent |

Two axes generate no props at all: `skin-surface` and `skin-type` have no
sanctioned vocabulary (pending rulings `reports/GAP-K6-skin-surface.md`,
`reports/GAP-K6-skin-type.md`). The typed surface cannot author what the
grammar has not ruled.

Canonical order: `toClassString` emits words in registry order, scopes last in
environment order. The equivalence property (D2) asserts that both surfaces
serialize to byte-identical CSS.
