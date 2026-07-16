# Engine registry schema

The contract for any registry that can drive the vocabulary-independent engine
(`createLinter(records, scopes)`), documented field-by-field against
`engine/types.ts`. A registry author who has never seen the first client's data
should be able to write a valid registry from this document alone; structural
well-formedness is checkable with `validateRegistry` (see the last section).

## The enumerations

| Type | Values | Meaning |
|---|---|---|
| `Role` | `container` \| `member` \| `self` \| `none` | Whom the axis's declarations act on: the element's children, the element as a flex/grid item, the element itself, or nothing (pure condition). |
| `Signature` | `set-with-exclusivity` \| `ordered-chain` \| `container-operation` \| `negotiated-field` | The axis's algebraic shape: pick-at-most-one from a set, a step on an ordered scale, an operation a container applies, or a value negotiated among siblings. |
| `Vocabulary` | `closed` \| `open` | Closed: the member list is exhaustive. Open: new *values* are admitted through a sanctioned parameter, never new words. |
| `Regime` | `free` \| `negotiated` | Free: the word's effect is independent of siblings. Negotiated: the outcome depends on all participants (flex sizing). |
| `StateCategory` | `capability` \| `instance` \| `conditioned-skin` \| `relational` | What a state word asserts: distributed potential (entails nothing), the element's own state (self-backed), a look driven by a condition (entails nothing), or a state the *container* asserts about this member (inverted backing). |
| `Arity` | `binary` \| `enumerated` \| `continuous` | How many values the state carries: on/off, one of a closed value set, or a continuous input. |
| `Driver` | `interaction` \| `input` \| `environmental` | What supplies the condition: user interaction, a continuous input stream, or the environment (viewport, preferences). |

## `Scales`

`Record<string, readonly string[]>` — named ordered value sets that tokens
reference by domain (see the `<name>-step` convention below). Step *names* are
the stable grammar surface; the numbers behind them belong to themes.

Example: `{ density: ["tight", "snug", "comfortable"] }`

## `Token`

What the parser matches against one authored word. Tried in declaration order.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `pattern` | `RegExp` | yes | Matches the authored word (after any scope prefix is stripped). Capture group 1 is the member, group 2 the parameter value. | `/^(grow\|shrink)-(\d+)$/` |
| `shape` | `string` | yes | Human label for the matched form, used in diagnostics. | `"grow-N \| shrink-N"` |
| `valueDomain` | `string` | no | The parameter value's domain. `<name>-step` marks it as a step of the declared scale `<name>`; anything else (`"enum"`, `"integer-≥0"`) is descriptive. | `"density-step"` |
| `fallback` | `boolean` | no | Marks a token that recognizes the axis's word *shape* but not a sanctioned value — the parse gets `openFallback: true` and P3 flags it (`bad-parameter`), a more specific diagnosis than P2 `unknown-word`. | `true` |

## `StateMember`

One member of a state-group axis.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `word` | `string` | yes | The grammar word. | `"selected"` |
| `arity` | `Arity` | yes | See the enumerations table. | `"binary"` |
| `driver` | `Driver` | yes | See the enumerations table. | `"interaction"` |
| `stateCategory` | `StateCategory` | yes | Dispatches entailment: `instance` → P8 (element backing), `relational` → P8b (container backing), the other two entail nothing. | `"instance"` |
| `entails` | `string[]` | no | The element-side platform truths backing an `instance` member — attributes, pseudo-classes, or `attr=value` pairs. Any ONE present satisfies P8. These are platform facts, not registry words. | `["aria-selected", ":checked"]` |
| `relationalBacking` | `{ containerAttr: string }` | no | For `relational` members: the container attribute that must point at this element's id. | `{ containerAttr: "aria-activedescendant" }` |
| `enumValues` | `string[]` | no | For `enumerated` arity: the closed value set the word must carry (`word-value`). | `["ascending", "descending"]` |
| `misuse` | `{ whenBacking: readonly string[]; msg: string }` | no | P6 form (b): writing this binary word is a misuse when the element's real backing carries one of these truths (a sibling word owns that state); `msg` is the full diagnosis. | `{ whenBacking: ["aria-checked=mixed"], msg: "use 'checked-mixed'" }` |
| `note` | `string` | no | Free commentary; the engine never reads it. | `"Law 6b merge"` |

## `Alias`

A whole-axis alias: one word naming a COMPLETE value of the axis (it fixes
every sub-dial at once), so it is mutually exclusive with every other word on
the axis — other aliases and parametric dials included.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `word` | `string` | yes | The alias word. | `"elastic"` |
| `expands` | `string` | yes | Its canonical full expansion — every piece must parse against the registry's own tokens (`validateRegistry` checks this). | `"grow-1 shrink-1"` |

## `CompositionHazard`

A P10 declaration: composing a word of the declaring axis with a word of
another axis is a hazard the author must acknowledge.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `ownWords` | `readonly string[]` | yes | Words of the declaring axis that participate. | `["divided"]` |
| `otherAxis` | `string` | yes | The other axis's id. | `"wrapping"` |
| `otherWords` | `readonly string[]` | yes | The other axis's participating words. | `["wrap-allowed"]` |
| `level` | `"warn" \| "error"` | yes | Issue severity. | `"warn"` |
| `rule` | `string` | yes | The issue's rule id. | `"divider-wrap"` |
| `msg` | `(own, other) => string` | yes | Diagnosis text, given the two matched words. | `(a, b) => \`'${a}' with '${b}' — …\`` |

## `ParentInertness`

A P11 declaration: words of the declaring axis are silently inert when the
PARENT carries any word of `parentAxis` (an outcome-level platform fact the
declaring client established).

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `parentAxis` | `string` | yes | Any parent word on this axis marks the inerting context. | `"structure"` |
| `inertWords` | `readonly string[]` | yes | The declaring axis's words that become no-ops there. | `["inline"]` |
| `level` | `"warn" \| "error"` | yes | Issue severity. | `"warn"` |
| `rule` | `string` | yes | The issue's rule id. | `"flow-participation-inert"` |
| `msg` | `(word) => string` | yes | Diagnosis text, given the inert word. | `(w) => \`'${w}' is a no-op here\`` |

## `AxisRecord`

One axis of the vocabulary.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `axis` | `string` | yes | Unique axis id; state groups conventionally use `state.<group>`. | `"m2-flex"` |
| `sibling` | `string` | yes | The client's plane taxonomy bucket. | `"layout"` |
| `role` | `Role` | yes | See the enumerations table. | `"member"` |
| `signature` | `Signature` | yes | See the enumerations table. | `"set-with-exclusivity"` |
| `vocabulary` | `Vocabulary` | yes | See the enumerations table. | `"open"` |
| `regime` | `Regime` | yes | See the enumerations table. | `"negotiated"` |
| `valueSpace` | `readonly string[]` | yes | The conceptual vocabulary; parametric forms use `<…>` placeholders and are excluded from literal-word checks. | `["grow-N", "rigid"]` |
| `tokens` | `Token[]` | yes | What the parser matches, in order — see the token-ordering contract below. | see `Token` |
| `default` | `string \| null` | yes | The unmarked default member, or `null` when absence means "not in play". | `"compressible"` |
| `controls` | `string[]` | yes | Concrete CSS properties the axis owns (the emitter/purity layer consumes this; the linter does not). | `["flex-grow"]` |
| `mustNeverTouch` | `string[]` | yes | Properties the axis is forbidden to emit; `["*"]` means "controls nothing". | `["gap"]` |
| `subDials` | `string[]` | no | Independent sub-dials of an open axis; parametric tokens on DIFFERENT dials compose, two on the SAME dial conflict (P1). | `["grow", "shrink"]` |
| `dialOf` | `(word) => string \| null` | no | Maps a full authored word to its dial name. | `w => w.startsWith("grow-") ? "grow" : null` |
| `dialFootprint` | `(dial) => readonly string[]` | no | Expands a dial into lower-level slots for overlap checks. Use when compound dials and physical dials share ownership, e.g. `inline` = `left` + `right`; omitted means the dial owns only itself. | `d => d === "inline" ? ["left", "right"] : [d]` |
| `aliases` | `Alias[]` | no | Whole-axis aliases — see `Alias` and the exclusivity contract below. | see `Alias` |
| `aliasMatch` | `(word) => boolean` | no | Tags PATTERN-shaped whole-axis forms an `aliases` list can't enumerate (e.g. `padding-<step>` as the both-sides form beside per-side dials). | `w => /^padding-\w+$/.test(w)` |
| `parametricMembers` | `string[]` | no | Closed-axis members that carry an open value (documentation/codegen; the linter treats them as ordinary members). | `["basis-exact"]` |
| `stateGroup` | see below | no | Marks a state-group axis and declares its members. | see below |
| `compositionHazards` | `CompositionHazard[]` | no | Declared P10 data. | see `CompositionHazard` |
| `parentInertness` | `ParentInertness` | no | Declared P11 data. | see `ParentInertness` |
| `scopePrefix` | `boolean` | no | Marks a prefix-only scope declaration (not an ordinary word axis). | `true` |
| `notes` | `string` | no | Free commentary; the engine never reads it. | — |

### `AxisRecord.stateGroup`

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `exclusivity` | `"one" \| "many"` | yes | `one`: at most one member per scope (genuine alternatives). `many`: members are independent co-occurring predicates. | `"many"` |
| `conflicts` | `[string, string][]` | no | Member pairs that cannot co-occur even under `many` (P1 `state-conflict`). | `[["selected", "checked-mixed"]]` |
| `implies` | `[string, string][]` | no | `[narrower, wider]` refinement pairs: writing both is redundant, never an error (P1 warns `state-redundant`). | `[["focus-visible", "focus"]]` |
| `members` | `StateMember[]` | yes | The group's members. | see `StateMember` |

## `ScopePrefix`

An environment scope prefix — NOT an axis member. A prefix opens a condition
scope; the word after the colon is an ordinary grammar word from some axis,
and the one-word-per-axis law (P1) runs per scope.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `id` | `string` | yes | The scope family's id. | `"viewport-bp"` |
| `pattern` | `RegExp` | yes | Matches the PREFIX part (before the colon). | `/^viewport-(sm\|md)$/` |
| `shape` | `string` | yes | Human label. | `"viewport-<bp>:"` |
| `role` | `Role` | yes | Whether the condition distributes (container scopes) or not. | `"none"` |
| `note` | `string` | no | Free commentary. | — |

## The linter's I/O types

| Type | Field | Meaning |
|---|---|---|
| `Parsed` | `raw` | The full authored word, prefix included. |
| | `scope` | `"base"` or the matched prefix (e.g. `"viewport-md"`). |
| | `axis` / `member` | The resolved axis id and member, or `null` when unknown (P2). |
| | `value` | The captured open-axis parameter, numeric when digits. |
| | `isAlias` / `dial` | Whole-axis alias flag; which sub-dial a parametric token set. |
| | `stateMember` | The resolved `StateMember`, for state-group axes. |
| | `openFallback` | Matched a `fallback` token — shape ok, value not sanctioned (P3). |
| `Issue` | `level`, `rule`, `msg`, `target?` | One diagnostic: severity, stable rule id, text, and optionally the word it targets. |
| `LintContext` | `elementId`, `containerAttrs`, `parentClasses` | Facts the class string alone can't carry. Every field is optional; an absent field SKIPS the checks that need it (P8b, P11) — isolated linting never false-positives. |

## Behavioral contracts the types cannot express

1. **Token ordering.** Valid-value tokens MUST be listed before `fallback`
   tokens for the same shape — the parser returns the first match, so a
   fallback listed first would swallow every valid word of that shape.
2. **Alias exclusivity.** A whole-axis alias (or an `aliasMatch`-tagged form)
   is a COMPLETE value: it conflicts with every other word on its axis —
   another alias or any dial — and P1 enforces exactly that.
3. **Scale domains.** A `Token.valueDomain` of the form `<name>-step` declares
   that the token's values are steps of the scale named `<name>`; the bundle's
   `scales` must declare it (`validateRegistry` checks this when scales are
   provided).
4. **Parse order is precedence.** Axes are tried in record order; a word
   matching two axes' tokens resolves silently to the first. Keep the literal
   vocabulary collision-free (`validateRegistry` reports offenders).

## Validating a registry

`validateRegistry(input) → string[]` (from `engine/validate-registry.ts`)
takes either a bare `AxisRecord[]` or a bundle
`{ records, scopes?, scales? }` and returns human-readable structural errors:
duplicate axis ids, literal words matching multiple axes' tokens (the P0
generalization), alias expansions that don't parse, and — when `scales` is
provided — `<name>-step` domains referencing undeclared scales. An empty array
means structurally well-formed. Entailment targets are deliberately NOT
checked: they are platform truths (aria attributes, pseudo-classes), not
registry words.

## Future work

- A JSON-schema export of this contract (machine-checkable in non-TypeScript
  clients). Not yet needed by any consumer; noted here so it isn't forgotten.
