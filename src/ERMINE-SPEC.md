# Ermine — Shared Machine-Consumer Spec (derived)

> **Derived artifact. Do not edit here.** This document is a *mechanical extraction* of
> `constitution/ERMINE.md`: the shared registry schema and generated axis registry used by both
> machine consumers. Register-flat, predicate-form, no metaphors, no rationale, no history. If this
> drifts from the constitution, the constitution wins — fix it there and re-extract.

## Two machine roles share one registry

This shared core contains the record schema (§1) and generated registry (§2). The two consumers
converge here, then follow separate contracts:

- **Validator / linter:** `src/LINT-SPEC.md` (§0 validation path and §§4–§8 predicates,
  invariants, trust boundary, and implementation reference).
- **Author / LLM:** `src/LLM-AUTHORING.md` (§3 generation contract and P1–P10 obligations).

---

## 1. Registry record schema  ‹SHARED›

This section is a **direct rendering of the real `registry.ts` interfaces** — not a simplification.
(A friendlier restatement belongs in the guide, not here; if you're implementing a validator or
generator from this spec, this is the contract you must match.)

A `Token` is what the linter actually matches against an authored word — distinct from the
conceptual `valueSpace`, which is the scale/word set the grammar *reasons* in:

```ts
interface Token {
  pattern: RegExp;
  shape: string;                        // human label, e.g. "gap-<density>" or "grow-N"
  valueDomain?: "density-step" | "size-step" | "breakpoint-step" | "integer-≥0" | "enum";
  // P3: this token recognizes the axis's WORD SHAPE but not a sanctioned parameter value
  // (`grow-abc` after `grow-<digits>`). Listed after the valid-value token; a word resolving
  // via a fallback token gets `bad-parameter`, not P2 `unknown-word`.
  fallback?: boolean;
}
```

A `StateMember` is one word inside a state-group axis:

```ts
interface StateMember {
  word: string;
  arity: "binary" | "enumerated" | "continuous";
  driver: "interaction" | "input" | "environmental";
  stateCategory: "capability" | "instance" | "conditioned-skin" | "relational";
  entails?: string[];                   // backing SET — any-one satisfies (Law 6b disjunction)
  relationalBacking?: { containerAttr: string };  // relational only
  enumValues?: string[];                // arity === "enumerated": the closed value set
  note?: string;
}
```

An `Alias` is a single word that fixes a whole open axis at once (the m2 "corner" mechanism —
`elastic` = `grow-1 shrink-1`), mutually exclusive with every other word on that axis:

```ts
interface Alias {
  word: string;
  expands: string;                      // canonical full expansion, e.g. "grow-1 shrink-1"
}
```

The axis record itself:

```ts
interface AxisRecord {
  axis: string;                         // unique id; state groups use "state.<group>"
  sibling: "layout" | "state" | "motion" | "layering" | "skin";
  role: "container" | "member" | "self" | "none";
  signature: "set-with-exclusivity" | "ordered-chain"
           | "container-operation" | "negotiated-field";
  vocabulary: "closed" | "open";        // open = admits a stated parameter only
  regime: "free" | "negotiated";

  valueSpace: readonly string[];        // conceptual member/value space (the scale/word set)
  tokens: Token[];                      // emitted tokens — matched against real class strings

  default: string | null;
  controls: string[];                   // concrete CSS properties (transcribed; see LINT-SPEC §7)
  mustNeverTouch: string[];             // explicit out-of-scope ("*" = everything else)

  // OPEN axes with independent sub-dials (e.g. m2 grow/shrink; constraints min/max-width/height).
  // Parametric tokens on DIFFERENT dials compose; two values for the SAME dial conflict.
  subDials?: string[];
  dialOf?: (member: string) => string | null;

  // OPEN axes may carry whole-axis aliases (m2 corners): a complete value, conflicts with any
  // other word on the axis.
  aliases?: Alias[];
  // Some axes' whole-axis form is a PATTERN, not a fixed word (padding's `padding-<density>`
  // vs. the per-side dials). aliasMatch tags such a word as whole-axis for P1.
  aliasMatch?: (word: string) => boolean;

  // CLOSED axes whose member set includes PARAMETRIC members — a fixed word carrying an open
  // value (m3 `basis-exact-<size>`, m5 `span-<N>`). `open` at MEMBER scope inside a `closed`
  // axis, same mechanism as enumerated states — not a third vocabulary primitive. Documentation/
  // codegen only; the linter treats these as ordinary members (closed membership, validated value).
  parametricMembers?: string[];

  // state-group axes only:
  stateGroup?: {
    exclusivity: "one" | "many";        // "one" = alternatives; "many" = co-present predicates
    conflicts?: [string, string][];     // pairs that cannot co-occur even when exclusivity="many"
    // REFINEMENT, not conflict: [narrower, wider] — the narrower state is a platform SUBSET of
    // the wider one (`:focus-visible` ⊂ `:focus`). Writing both is never an error, only redundant.
    implies?: [string, string][];
    members: StateMember[];
  };

  // environmental scope-prefix axis only:
  scopePrefix?: boolean;

  notes?: string;
}
```

Field rules:
- `vocabulary` default expectation: numeric ratio/count/degree → **open**; perceptual or
  platform-mirrored (fixed scale, ARIA state set, named z-ladder) → **closed**.
- `entails` (on `StateMember`) is a **set** (any-one satisfies), supporting Law 6b merges. For an
  `enumerated` member, entailment is checked against `attr=value` (the specific captured value), not
  bare attribute presence — see P8 in `src/LINT-SPEC.md` §5.
- `controls` lists must eventually be *generated from shipped CSS*, not transcribed; until then treat
  property-disjointness checks as indicative, not authoritative (see `src/LINT-SPEC.md` §7).
- State groups are first-class axes (`axis: "state.<group>"`) — the same P1 one-word-per-axis
  machinery applies to them via `stateGroup.exclusivity`/`conflicts`/`implies`, not a separate code
  path. `conflicts` is for genuinely incompatible pairs (hard error); `implies` is for a narrower
  state that's a platform subset of a wider one — co-occurrence is redundant, not incompatible, and
  the linter surfaces it as a `warn`, not an error.

---

<!-- BEGIN GENERATED: registry (do not edit between markers) -->
> Generated from src/registry.ts by src/generate-spec.ts — do not edit.

## 2. The axis registry (56 axes)  ‹SHARED›

layout=21 · layering=4 · motion=4 · state=9 · skin=18. Every fact below is rendered directly from `REGISTRY`, `SCALES`, or `ENVIRONMENT_SCOPES`.

### Registry scales

| Scale | Ordered values |
|---|---|
| `spacing` | `xs` `sm` `md` `lg` `xl` `2xl` `3xl` |
| `size` | `sm` `md` `lg` `xl` `2xl` |
| `breakpoint` | `sm` `md` `lg` `xl` |
| `zTier2` | `base` `content` `raised` `dropdown` `sticky` `tooltip` |
| `duration` | `quick` `settled` |

### 2.1 LAYOUT (21 axes)

#### structure

- role: `container` · signature: `container-operation` · vocabulary: `closed` · regime: `free`
- value space: `horizontal` `vertical` `grid` `grid-fit-<size>` `columns-12` `subgrid`
- default: `flow`
- controls: `display.inner` `flex-direction` `grid-template-columns` `grid-auto-flow`
- must never touch: `gap` `padding` `margin` `align-self` `flex` `flex-wrap` `background` `border` `display.outer`
- parametric members: `grid-fit`
- notes: `grid-fit-<size>` is a grid structure variant: first track fit-content(var(--size-<size>)), second track 1fr. It replaces, not composes with, plain `grid` because both choose the inner display/grid-template shape.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<structure>` | `/^(horizontal\|vertical\|grid\|subgrid)$/` | — | no |
| `columns-12` | `/^columns-12$/` | — | no |
| `grid-fit-<size>` | `/^grid-fit-(sm\|md\|lg\|xl\|2xl)$/` | `size-step` | no |
| `grid-fit-<bad>` | `/^grid-fit-.+$/` | `size-step` | yes |

#### m1-flow-participation

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `inline` `boxed` `boxed-inline`
- default: `natural`
- controls: `display.outer`
- must never touch: `gap` `padding` `background`
- notes: surface names provisional (alias-law, guide-level). OUTCOME CONSTRAINT (browser-verified, demo/test): the outer display is INERT on a flex/grid ITEM — CSS blockifies a flex/grid item's outer display, so `inline`/`boxed-inline` are no-ops on a child of a flex/grid container. Enforced by lint WARNING P11 (`flow-participation-inert`, lint.ts), which reads the parent's classes from LintContext. Not a property collision, so P7 can't see it — it needs parent context.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<flow-participation>` | `/^(inline\|boxed\|boxed-inline)$/` | — | no |

#### m2-flex

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `open` · regime: `negotiated`
- value space: `grow-N` `shrink-N` `rigid` `compressible` `expandable` `elastic`
- default: `compressible`
- controls: `flex-grow` `flex-shrink`
- must never touch: `flex-basis` `min-width` `max-width` `gap` `align-self` `flex`
- sub-dials: `grow` `shrink`
- dial resolver: declared in `registry.ts`
- whole-axis aliases:

  | Alias | Expansion |
  |---|---|
  | `rigid` | `grow-0 shrink-0` |
  | `compressible` | `grow-0 shrink-1` |
  | `expandable` | `grow-1 shrink-0` |
  | `elastic` | `grow-1 shrink-1` |
- notes: open axis, two independent longhand dials grow-N (flex-grow) / shrink-N (flex-shrink) — compose one-per-dial (`grow-2 shrink-1`). The 4 corners are WHOLE-AXIS aliases writing BOTH longhands, so an alias conflicts with any other m2 word (`expandable shrink-2`, `rigid grow-2`). Per-dial default = CSS initial: an unspecified dial keeps flex-grow:0 / flex-shrink:1, so `grow-2` is NOT grow-only (it grows AND shrinks); grow-only at weight 2 is `grow-2 shrink-0`.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `grow-N \| shrink-N` | `/^(grow\|shrink)-(\d+)$/` | `integer-≥0` | no |
| `<flex-corner alias>` | `/^(rigid\|compressible\|expandable\|elastic)$/` | — | no |
| `grow-<bad> \| shrink-<bad>` | `/^(grow\|shrink)-.+$/` | `integer-≥0` | yes |

#### m3-self-size

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `negotiated`
- value space: `basis-content` `basis-ratio` `basis-exact-<size>`
- default: `basis-content`
- controls: `flex-basis`
- must never touch: `flex-grow` `flex-shrink` `min-width` `max-width` `align-self`
- parametric members: `basis-exact`
- notes: closed-with-parametric-member: membership is closed {content, ratio, exact}; `exact` carries a token-indexed size value (arbitrary lengths OUT in v0). Same member-level mechanism as the enumerated states — NOT open at axis scope.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `basis-content \| basis-ratio` | `/^(basis-content\|basis-ratio)$/` | — | no |
| `basis-exact-<size>` | `/^basis-exact-(sm\|md\|lg\|xl\|2xl)$/` | `size-step` | no |
| `basis-exact-<bad>` | `/^basis-exact-.+$/` | `size-step` | yes |

#### m4-self-alignment

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `self-start` `self-center` `self-end` `self-stretch` `self-baseline`
- default: `inherit-group`
- controls: `align-self`
- must never touch: `align-items` `justify-content` `gap`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `self-<align>` | `/^self-(start\|center\|end\|stretch\|baseline)$/` | — | no |

#### m5-grid-placement

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `span-N` `row-span-N` `span-all` `half` `third` `quarter` `two-thirds` `three-quarters` `sixth`
- default: `auto-place`
- controls: `grid-column` `grid-row`
- must never touch: `align-self` `flex` `gap`
- parametric members: `span` `row-span`
- notes: closed-with-parametric-member: membership {span, row-span, span-all} plus the intent-proportions (half/third/quarter/two-thirds/three-quarters/sixth). span/row-span carry integers; span-all is contextual. The intent-proportions are the readable form of a column span over the ruled `columns-12` grid (R-M5-02): `third` = span 4, `quarter` = span 3, etc. — the number lands on an integer track only because 12 is the chosen grain. They emit `grid-column: span N` and are meaningful only under `columns-12`.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `span-N \| row-span-N` | `/^(span\|row-span)-(\d+)$/` | `integer-≥0` | no |
| `span-all (contextual)` | `/^span-all$/` | — | no |
| `<intent-proportion>` | `/^(half\|third\|quarter\|two-thirds\|three-quarters\|sixth)$/` | — | no |
| `span-<bad> \| row-span-<bad>` | `/^(span\|row-span)-.+$/` | `integer-≥0` | yes |

#### density

- role: `container` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `xs` `sm` `md` `lg` `xl` `2xl` `3xl`
- default: `md`
- controls: `gap`
- must never touch: `padding` `margin` `structure`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `gap-<spacing>` | `/^gap-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |

#### flow-spacing

- role: `container` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `xs` `sm` `md` `lg` `xl` `2xl` `3xl`
- default: none
- controls: `margin-block-start`
- must never touch: `gap` `padding` `display`
- notes: correct only for single-line, source-ordered block/prose flow

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `flow-<spacing>` | `/^flow-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |

#### padding

- role: `self` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `xs` `sm` `md` `lg` `xl` `2xl` `3xl`
- default: none
- controls: `padding` `padding-inline` `padding-block` `padding-top` `padding-right` `padding-bottom` `padding-left`
- must never touch: `margin` `gap` `display`
- sub-dials: `inline` `block` `top` `right` `bottom` `left`
- dial resolver: declared in `registry.ts`
- whole-axis pattern matcher: declared in `registry.ts`
- notes: spacing sub-dials: inline (left+right), block (top+bottom), plus physical edges. Overlapping footprints conflict (`padding-inline-sm padding-left-xs`); disjoint edges compose (`padding-left-xs padding-right-sm`). `padding-<spacing>` is the WHOLE-AXIS form.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `padding-<spacing>` | `/^padding-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `padding-inline-<spacing>` | `/^padding-inline-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `padding-block-<spacing>` | `/^padding-block-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `padding-<edge>-<spacing>` | `/^padding-(top\|right\|bottom\|left)-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |

#### margin

- role: `member` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `centered` `flush-block`
- default: none
- controls: `margin` `margin-inline` `margin-block` `margin-top` `margin-right` `margin-bottom` `margin-left`
- must never touch: `margin-inline-start` `margin-inline-end` `padding` `gap` `display`
- sub-dials: `inline` `block` `top` `right` `bottom` `left`
- dial resolver: declared in `registry.ts`
- whole-axis pattern matcher: declared in `registry.ts`
- notes: spacing sub-dials: inline (left+right), block (top+bottom), plus physical edges. Overlapping footprints conflict; disjoint edges compose. `centered` owns the inline footprint and `flush-block` owns the block footprint. `push` owns auto inline-start margin separately because auto is relational to one side, not both inline margins.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `margin-<spacing>` | `/^margin-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `margin-inline-<spacing>` | `/^margin-inline-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `margin-block-<spacing>` | `/^margin-block-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `margin-<edge>-<spacing>` | `/^margin-(top\|right\|bottom\|left)-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `centered \| flush-block` | `/^(centered\|flush-block)$/` | — | no |

#### push

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `push`
- default: none
- controls: `margin-inline-start`
- must never touch: `margin` `margin-inline` `margin-block` `margin-inline-end` `padding` `gap` `display`
- notes: auto inline-start margin; consumes available inline-start free space to push the member toward inline end. Relational and socket-free, distinct from scale-backed margin.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<push>` | `/^push$/` | — | no |

#### alignment-container

- role: `container` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `align-start` `align-center` `align-end` `align-stretch` `align-baseline` `justify-start` `justify-center` `justify-end` `justify-between` `justify-around`
- default: none
- controls: `align-items` `justify-content`
- must never touch: `align-self` `gap` `padding`
- sub-dials: `align` `justify`
- dial resolver: declared in `registry.ts`
- notes: two sub-dials: align (align-items) and justify (justify-content). They write different properties, so `align-center justify-between` composes; two align-* or two justify-* conflict.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `align-<x>` | `/^align-(start\|center\|end\|stretch\|baseline)$/` | — | no |
| `justify-<x>` | `/^justify-(start\|center\|end\|between\|around)$/` | — | no |

#### divider

- role: `container` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `divided` `undivided`
- default: `undivided`
- controls: `row-rule` `column-rule`
- must never touch: `border` `gap` `padding` `background`
- notes: divided + wrap/order/reversed REQUIRES native gap-decoration; else degrade (P10 warn)

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `divided \| undivided` | `/^(divided\|undivided)$/` | — | no |

#### wrapping

- role: `container` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `wrap-allowed` `wrap-prevent` `wrap-reverse`
- default: none
- controls: `flex-wrap`
- must never touch: `gap` `display` `flex`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `wrap-<x>` | `/^wrap-(allowed\|prevent\|reverse)$/` | — | no |

#### overflow

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `scroll-y` `scroll-x` `scroll-auto` `clip` `hidden`
- default: none
- controls: `overflow-x` `overflow-y`
- must never touch: `display` `padding`
- sub-dials: `x` `y`
- dial resolver: declared in `registry.ts`
- whole-axis pattern matcher: declared in `registry.ts`
- notes: two sub-dials: scroll-x (overflow-x) and scroll-y (overflow-y) compose; scroll-auto, clip, and hidden are whole-axis (both directions), so they conflict with a per-axis dial. hidden establishes a clipping scroll container; clip forbids scrolling (R-OVERFLOW-01).

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<overflow>` | `/^(scroll-y\|scroll-x\|scroll-auto\|clip\|hidden)$/` | — | no |

#### constraints

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `open` · regime: `free`
- value space: `min-width-<size>` `max-width-<size>` `min-height-<size>` `max-height-<size>` `max-width-none`
- default: none
- controls: `min-width` `max-width` `min-height` `max-height`
- must never touch: `flex-grow` `flex-shrink` `flex-basis` `width`
- sub-dials: `min-width` `max-width` `min-height` `max-height`
- dial resolver: declared in `registry.ts`
- notes: four sub-dials, one per longhand. min-width/max-width compose as a width band; min-height/max-height compose as a height band; all four can co-occur. A future semantic check (not yet implemented) should warn when a band is inverted, e.g. min-width-lg max-width-sm.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `min/max-width/height-<size>` | `/^(min-width\|max-width\|min-height\|max-height)-(sm\|md\|lg\|xl\|2xl)$/` | `size-step` | no |
| `min-width/height-none \| max-width-none` | `/^(min-width\|min-height\|max-width)-(none)$/` | — | no |
| `min/max-width/height-<bad>` | `/^(min-width\|max-width\|min-height\|max-height)-.+$/` | `size-step` | yes |

#### fill

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `fill` `fill-inline` `fill-block` `hug-inline` `control-size-<spacing>`
- default: none
- controls: `inline-size` `block-size`
- must never touch: `display` `gap` `flex` `flex-grow` `flex-basis` `position` `margin` `padding` `border-radius` `font-size` `aspect-ratio`
- sub-dials: `inline` `block`
- dial resolver: declared in `registry.ts`
- whole-axis pattern matcher: declared in `registry.ts`
- notes: explicit self-size dials. Whole-axis `fill` and `control-size-<spacing>` set both inline-size and block-size, so each conflicts with per-axis dials; `fill-inline fill-block` and `hug-inline fill-block` compose. `hug-inline` sets inline-size from content (`fit-content`). `control-size-<spacing>` is scale-bound physical control/icon box size over the shared spacing scale; it does not imply display, alignment, padding, glyph size, radius, or `aspect-ratio`.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `fill[-<axis>] \| hug-inline` | `/^(?:fill(?:-(inline\|block))?\|hug-inline)$/` | — | no |
| `control-size-<spacing>` | `/^control-size-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | `spacing-step` | no |
| `control-size-<bad>` | `/^control-size-.+$/` | `spacing-step` | yes |

#### aspect

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `square`
- default: none
- controls: `aspect-ratio`
- must never touch: `display` `gap` `flex` `position` `inline-size` `block-size` `width` `height`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<aspect>` | `/^(square)$/` | — | no |

#### cover

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `cover`
- default: none
- controls: `inset`
- must never touch: `position` `display` `gap` `flex` `inline-size` `block-size` `width` `height` `margin` `padding`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<cover>` | `/^cover$/` | — | no |

#### positioned-centering

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `center-x` `center-y`
- default: none
- controls: `left` `top` `transform`
- must never touch: `position` `inset` `right` `bottom` `margin` `inline-size` `block-size` `width` `height`
- notes: positioned centering pairs: `center-x` = `left: 50%` plus `translateX(-50%)`; `center-y` = `top: 50%` plus `translateY(-50%)`. Requires a positioned element from `position-mode`; flow centering and transform-general composition remain separate rulings.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `center-<axis>` | `/^center-(x\|y)$/` | — | no |

#### viewport-fill

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `fill-viewport`
- default: none
- controls: `min-block-size`
- must never touch: `display` `gap` `flex` `position` `inline-size` `block-size` `height` `min-height`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<viewport-fill>` | `/^(fill-viewport)$/` | — | no |

### 2.2 LAYERING (4 axes)

#### z-scale

- role: `member` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `base` `content` `raised` `dropdown` `sticky` `tooltip`
- default: `base`
- controls: `z-index`
- must never touch: `position` `isolation` `display`
- notes: tier-2 only; only meaningful within an isolation:isolate context. tier-2 member list is a [RULING] (values), structure frozen.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<z-step>` | `/^(base\|content\|raised\|dropdown\|sticky\|tooltip)$/` | — | no |

#### top-layer-mechanism

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `overlay` `modal` `popover` `toast`
- default: none
- controls: —
- must never touch: `z-index` `position`
- notes: joined by OPENING; ordered at runtime by last-opened-is-topmost. choosing `modal` = promotion, not a number.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<top-layer>` | `/^(overlay\|modal\|popover\|toast)$/` | — | no |

#### position-mode

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `position-static` `position-relative` `position-absolute` `position-fixed` `position-sticky`
- default: `position-static`
- controls: `position`
- must never touch: `z-index` `display` `inset`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `position-<mode>` | `/^position-(?:static\|relative\|absolute\|fixed\|sticky)$/` | — | no |

#### stacking-context

- role: `container` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `isolate`
- default: none
- controls: `isolation`
- must never touch: `z-index` `position`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `isolate` | `/^isolate$/` | — | no |

### 2.3 MOTION (4 axes)

#### tween

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `tween-quick` `tween-settled` `tween-ground-quick` `tween-ground-settled` `tween-ink-quick` `tween-ink-settled` `tween-rule-quick` `tween-rule-settled` `tween-ground-ink-quick` `tween-ground-ink-settled` `tween-opacity-ground-quick` `tween-opacity-ground-settled` `tween-opacity-ground-ink-quick` `tween-opacity-ground-ink-settled` `tween-opacity-transform-quick` `tween-opacity-transform-settled`
- default: none
- controls: `transition-property` `transition-duration`
- must never touch: `animation` `transform` `background` `color` `opacity` `transition-timing-function` `transition-delay` `transition`
- notes: open transition envelope: state supplies the target value; duration reads --duration-<step>. Bare `tween-<duration>` targets all changed properties; targeted forms narrow transition-property to repeated UI paint/presence sets.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `tween-<duration>` | `/^tween-(quick\|settled)$/` | — | no |
| `tween-<target>-<duration>` | `/^tween-(ground\|ink\|rule\|ground-ink\|opacity-ground\|opacity-ground-ink\|opacity-transform)-(quick\|settled)$/` | — | no |
| `tween-<bad>` | `/^tween-.+$/` | `duration-step` | yes |

#### motion-micro

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `decelerate` `accelerate` `standard` `emphasized` `symmetric` `asymmetric`
- default: none
- controls: `transition-timing-function` `--motion-direction`
- must never touch: `animation` `transform` `background`
- notes: easing/direction only; duration is consumed by the open `tween-<duration>` envelope (R-MOTION-08).

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<easing>` | `/^(decelerate\|accelerate\|standard\|emphasized)$/` | — | no |
| `<direction>` | `/^(symmetric\|asymmetric)$/` | — | no |

#### motion-macro

- role: `container` · signature: `container-operation` · vocabulary: `closed` · regime: `free`
- value space: `together` `sequence` `cascade`
- default: none
- controls: `--stagger`
- must never touch: `transition-duration` `transition-delay` `transform`
- notes: stagger magnitude is an open skin scale; composes via calc(own-delay + --stagger).

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<choreography>` | `/^(together\|sequence\|cascade)$/` | — | no |

#### effect

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `shake`
- default: none
- controls: `animation`
- must never touch: `transition-duration` `transition-timing-function` `transition-delay` `transition` `transform` `opacity`
- notes: each member references a motion-substrate @keyframes block (EFFECT_KEYFRAMES); reserve flash/pulse/bounce/spin (R-MOTION-07).

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<effect>` | `/^(shake)$/` | — | no |

### 2.4 STATE (9 axes)

#### state.focus

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `hover` `focus` `focus-visible` `active`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: —
- implications: `focus-visible` → `focus`
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `hover` | `binary` | `interaction` | `instance` | `:hover` | — | — | — |
| `focus` | `binary` | `interaction` | `instance` | `:focus` | — | — | — |
| `focus-visible` | `binary` | `interaction` | `instance` | `:focus-visible` | — | — | — |
| `active` | `binary` | `interaction` | `instance` | `:active` | — | — | the transient press; toggle `pressed` was folded into `selected` (Law 6b) |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<focus-state>` | `/^(hover\|focus\|focus-visible\|active)$/` | — | no |

#### state.selection

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `selectable` `selected` `checked-mixed` `current`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: `selected` → `checked-mixed`
- implications: —
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `selectable` | `binary` | `interaction` | `capability` | — | — | — | entails nothing; distributes capability down |
| `selected` | `binary` | `interaction` | `instance` | `aria-selected` `aria-pressed` `:checked` | — | — | Law 6b merge |
| `checked-mixed` | `binary` | `interaction` | `instance` | `aria-checked=mixed` `:indeterminate` | — | — | the tri-state 'mixed/indeterminate' value as a complete word (binary arity: the word IS the value, no enum suffix). |
| `current` | `enumerated` | `interaction` | `instance` | `aria-current` | `page` `step` `location` `date` `time` `true` | — | — |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `current-<value>` | `/^(current)-(page\|step\|location\|date\|time\|true)$/` | `enum` | no |
| `<selection-state>` | `/^(selectable\|selected\|checked-mixed)$/` | — | no |
| `current-<value?>` | `/^(current)(?:-.*)?$/` | `enum` | no |

#### state.availability

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `disabled` `read-only` `busy`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: —
- implications: —
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `disabled` | `binary` | `interaction` | `instance` | `:disabled` `aria-disabled` | — | — | — |
| `read-only` | `binary` | `interaction` | `instance` | `:read-only` `aria-readonly` | — | — | — |
| `busy` | `binary` | `interaction` | `instance` | `aria-busy` | — | — | visual updating sense only |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<availability-state>` | `/^(disabled\|read-only\|busy)$/` | — | no |

#### state.disclosure

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `expanded` `open`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `one`
- conflicts: —
- implications: —
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `expanded` | `binary` | `interaction` | `instance` | `aria-expanded` | — | — | in-place disclosure |
| `open` | `binary` | `interaction` | `instance` | `[open]` `:open` `:popover-open` | — | — | top-layer/details presentation |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<disclosure-state>` | `/^(expanded\|open)$/` | — | no |

#### state.validity

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `invalid` `user-invalid` `required` `out-of-range`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: —
- implications: `user-invalid` → `invalid`; `out-of-range` → `invalid`
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `invalid` | `binary` | `interaction` | `instance` | `:invalid` `aria-invalid` | — | — | — |
| `user-invalid` | `binary` | `interaction` | `instance` | `:user-invalid` | — | — | platform-typical subset of invalid — :user-invalid only matches after user interaction, so it fires only where :invalid already does |
| `required` | `binary` | `interaction` | `instance` | `:required` `aria-required` | — | — | — |
| `out-of-range` | `binary` | `interaction` | `instance` | `:out-of-range` | — | — | platform-typical subset of invalid (browsers generally flag out-of-range values as :invalid too, absent novalidate) |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<validity-state>` | `/^(invalid\|user-invalid\|required\|out-of-range)$/` | — | no |

#### state.sort

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `sorted`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: —
- implications: —
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `sorted` | `enumerated` | `interaction` | `instance` | `aria-sort` | `none` `ascending` `descending` | — | — |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `sorted-<value>` | `/^(sorted)-(none\|ascending\|descending)$/` | `enum` | no |
| `sorted-<value?>` | `/^(sorted)(?:-.*)?$/` | `enum` | no |

#### state.drag

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `dragging`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: —
- implications: —
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `dragging` | `binary` | `interaction` | `instance` | `@drag` | — | — | ARIA aria-grabbed/dropeffect deprecated; backing is the live DnD event |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<drag-state>` | `/^(dragging)$/` | — | no |

#### state.continuous-input

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `scroll-progress` `drag-progress`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: —
- implications: —
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `scroll-progress` | `continuous` | `input` | `instance` | `scroll()` `animation-timeline` | — | — | — |
| `drag-progress` | `continuous` | `input` | `instance` | `pointer` | — | — | — |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<continuous-input-state>` | `/^(scroll-progress\|drag-progress)$/` | — | no |

#### state.relational

- role: `none` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `active-descendant`
- default: none
- controls: —
- must never touch: `*`
- group exclusivity: `many`
- conflicts: —
- implications: —
- state members:

| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |
|---|---|---|---|---|---|---|---|
| `active-descendant` | `binary` | `interaction` | `relational` | — | — | `aria-activedescendant` | inverted entailment: backing on the container |

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<relational-state>` | `/^(active-descendant)$/` | — | no |

### 2.5 SKIN (18 axes)

#### skin-ground

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `ground` `ground-subtle` `ground-defined` `ground-hover` `ground-active` `ground-selected` `ground-accent` `ground-accent-soft` `ground-accent-faint` `ground-pass` `ground-pass-faint` `ground-warn` `ground-warn-faint` `ground-fail` `ground-fail-faint` `ground-note` `ground-note-faint`
- default: none
- controls: `background`
- must never touch: `display` `gap` `flex` `position` `color` `border-color` `border-radius` `font-size`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `ground[-<role\|step>[-<intensity>]]` | `/^ground(-(subtle\|defined\|hover\|active\|selected\|accent\|accent-soft\|accent-faint\|pass\|pass-faint\|warn\|warn-faint\|fail\|fail-faint\|note\|note-faint))?$/` | — | no |

#### skin-ink

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `ink` `ink-soft` `ink-muted` `ink-faint` `ink-inverse` `ink-selected` `ink-accent` `ink-accent-soft` `ink-accent-faint` `ink-pass` `ink-pass-faint` `ink-warn` `ink-warn-faint` `ink-fail` `ink-fail-faint` `ink-note` `ink-note-faint`
- default: none
- controls: `color`
- must never touch: `display` `gap` `flex` `position` `background` `border-color` `border-radius` `font-size`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `ink[-<role\|step>[-<intensity>]]` | `/^ink(-(soft\|muted\|faint\|inverse\|selected\|accent\|accent-soft\|accent-faint\|pass\|pass-faint\|warn\|warn-faint\|fail\|fail-faint\|note\|note-faint))?$/` | — | no |

#### skin-rule

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `rule` `rule-soft` `rule-accent` `rule-accent-soft` `rule-accent-faint` `rule-pass` `rule-pass-faint` `rule-warn` `rule-warn-faint` `rule-fail` `rule-fail-faint` `rule-note` `rule-note-faint`
- default: none
- controls: `border-color`
- must never touch: `display` `gap` `flex` `position` `background` `color` `border-radius` `font-size`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `rule[-<role\|step>[-<intensity>]]` | `/^rule(-(soft\|accent\|accent-soft\|accent-faint\|pass\|pass-faint\|warn\|warn-faint\|fail\|fail-faint\|note\|note-faint))?$/` | — | no |

#### corner

- role: `self` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `corner-sm` `corner-md` `corner-lg` `corner-xl` `corner-2xl` `corner-3xl`
- default: none
- controls: `border-radius`
- must never touch: `display` `gap` `flex` `position` `background` `color` `border-color` `font-size`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `corner-<step>` | `/^corner-(sm\|md\|lg\|xl\|2xl\|3xl)$/` | — | no |

#### rule-presence

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `ruled` `ruled-top` `ruled-bottom` `ruled-left` `ruled-right`
- default: none
- controls: `border-width` `border-style` `border-top-width` `border-top-style` `border-bottom-width` `border-bottom-style` `border-left-width` `border-left-style` `border-right-width` `border-right-style`
- must never touch: `display` `gap` `flex` `position` `background` `color` `border-color` `border-radius` `box-shadow`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `ruled[-<side>]` | `/^ruled(?:-(top\|bottom\|left\|right))?$/` | — | no |

#### font-size

- role: `self` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `font-xs` `font-sm` `font-md` `font-lg` `font-xl` `font-2xl` `font-3xl`
- default: none
- controls: `font-size`
- must never touch: `display` `gap` `flex` `margin` `font-weight` `font-family`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `font-<step>` | `/^font-(xs\|sm\|md\|lg\|xl\|2xl\|3xl)$/` | — | no |

#### font-weight

- role: `self` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `font-medium` `font-semibold` `font-bold`
- default: none
- controls: `font-weight`
- must never touch: `display` `gap` `flex` `margin` `font-size` `font-family`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `font-<step>` | `/^font-(medium\|semibold\|bold)$/` | — | no |

#### font-family

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `font-mono`
- default: none
- controls: `font-family`
- must never touch: `display` `gap` `flex` `margin` `font-size` `font-weight` `line-height`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `font-<typeface>` | `/^font-(mono)$/` | — | no |

#### text-align

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `text-start` `text-center`
- default: none
- controls: `text-align`
- must never touch: `display` `gap` `flex` `margin` `font-size` `font-weight` `font-family` `line-height`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `text-<alignment>` | `/^text-(start\|center)$/` | — | no |

#### elevation

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `elevated`
- default: none
- controls: `box-shadow`
- must never touch: `display` `gap` `flex` `position` `background` `color` `border-color` `border-radius` `font-size`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<elevation>` | `/^(elevated)$/` | — | no |

#### affordance

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `pressable`
- default: none
- controls: `cursor`
- must never touch: `display` `gap` `flex` `background` `color` `pointer-events` `user-select`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<affordance>` | `/^(pressable)$/` | — | no |

#### concealment

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `concealed` `revealed`
- default: none
- controls: `opacity`
- must never touch: `display` `visibility` `pointer-events` `background` `color`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<concealment>` | `/^(concealed\|revealed)$/` | — | no |

#### numeric

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `tabular`
- default: none
- controls: `font-variant-numeric`
- must never touch: `display` `gap` `flex` `font-size` `font-weight` `font-family`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<numeric>` | `/^(tabular)$/` | — | no |

#### type-label

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `overline`
- default: none
- controls: `text-transform` `letter-spacing`
- must never touch: `display` `gap` `flex` `font-size` `font-family`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<type-label>` | `/^(overline)$/` | — | no |

#### scrollbar

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `scrollbar-subtle`
- default: none
- controls: `scrollbar-width` `scrollbar-color`
- must never touch: `display` `gap` `flex` `overflow-x` `overflow-y` `background` `color`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `scrollbar-<prominence>` | `/^scrollbar-(subtle)$/` | — | no |

#### focus-ring

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `ring`
- default: none
- controls: `outline` `outline-offset`
- must never touch: `display` `gap` `flex` `box-shadow` `border-width` `border-color` `background` `color`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<focus-ring>` | `/^(ring)$/` | — | no |

#### truncation

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `truncate` `clamp-N` `text-nowrap` `text-pre-wrap`
- default: none
- controls: `text-overflow` `white-space` `display` `-webkit-box-orient` `-webkit-line-clamp`
- must never touch: `gap` `flex` `overflow-x` `overflow-y` `background` `color` `font-size`
- parametric members: `clamp`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<text-flow-treatment>` | `/^(truncate\|text-nowrap\|text-pre-wrap)$/` | — | no |
| `clamp-N` | `/^clamp-(\d+)$/` | `integer-≥1` | no |
| `clamp-<bad>` | `/^clamp-.+$/` | `integer-≥1` | yes |

#### selection-treatment

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `selection-subtle` `selection-strong`
- default: none
- controls: `--selection-bg` `--selection-ink` `--selection-outline`
- must never touch: `display` `gap` `flex` `position` `background` `color` `outline`
- notes: conditioned-skin: a CONDITIONAL VARIANT LAYER, not a base skin axis. It writes custom properties (--selection-bg/--selection-ink), NOT background/color directly — a sink rule reads them under the `selected` condition. This is why it does NOT collide with skin-surface's background/color (same discipline as m2 longhands / motion --stagger): conditioned layers compose with base skin by writing different variables. Entails nothing itself; conditioned by `selected`/`hover`/`active`; pairs with capability `selectable`.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `selection-<x>` | `/^selection-(subtle\|strong)$/` | — | no |

### Environmental condition scopes

These prefixes are closed condition scopes, not registry-axis members. The guarded suffix is an ordinary registry word.

| ID | Shape | Pattern | Role | Notes |
|---|---|---|---|---|
| `viewport-bp` | `viewport-<bp>:` | `/^viewport-(sm\|md\|lg\|xl)$/` | `none` | — |
| `viewport-orientation` | `viewport-<orientation>:` | `/^viewport-(portrait\|landscape)$/` | `none` | — |
| `container-bp` | `container-<bp>:` | `/^container-(sm\|md\|lg\|xl)$/` | `container` | conditions on container size; distributes to children |
| `prefers` | `prefers-<x>:` | `/^prefers-(reduced-motion\|color-scheme-dark\|contrast-more\|reduced-transparency)$/` | `none` | — |
| `hover` | `hover:` | `/^hover$/` | `none` | conditioned skin while the pointer is over the element |
| `focus` | `focus:` | `/^focus$/` | `none` | conditioned skin while the element holds focus |
| `active` | `active:` | `/^active$/` | `none` | conditioned skin during the press |
| `disabled` | `disabled:` | `/^disabled$/` | `none` | conditioned skin while the form control is disabled |
| `selected` | `selected:` | `/^selected$/` | `none` | backed conditioned skin while the element is asserted selected |
| `checked` | `checked:` | `/^checked$/` | `none` | backed conditioned skin while the element is asserted checked |
| `current` | `current:` | `/^current$/` | `none` | attribute-backed conditioned skin while the element is asserted current (aria-current) |
| `parent-hover` | `parent-hover:` | `/^parent-hover$/` | `none` | conditioned skin while the selectable ancestor is hovered |
| `parent-selected` | `parent-selected:` | `/^parent-selected$/` | `none` | conditioned skin while the selectable ancestor is asserted selected |
<!-- END GENERATED: registry -->

---

> Validator sections §0 and §§4–§8 live in `src/LINT-SPEC.md`.
>
> Authoring section §3 and its pre-emission obligations live in `src/LLM-AUTHORING.md`.
