# Ermine — Machine-Consumer Spec (derived)

> **Derived artifact. Do not edit here.** This document is a *mechanical extraction* of
> `ERMINE.md` (the constitution): the axis registry plus the laws, restated for the two
> *machine* consumers of the grammar. Register-flat, predicate-form, no metaphors, no rationale, no
> history. If this drifts from the constitution, the constitution wins — fix it there and re-extract.
> (The friendly, example-led document for *human* authors is the separate **human guide**.)

## Two machine roles share one registry

This spec serves two roles that **converge on the registry (§2) but diverge on what they do with it**.
The registry is the single source of truth — its *predicate face* is the linter, its *generative face*
is the LLM, its *generated face* is the shipped CSS. Both roles read the same records; they differ only
in direction.

| Role | Direction | Question | Reads |
|---|---|---|---|
| **Validator / linter** | judges a string that exists | "is this well-formed, and if not, *why*?" | §1 schema · §2 registry · §4 per-axis predicates · §5 cross-cutting predicates · §6 negotiated invariants · §7 trust boundary |
| **Author / LLM (generation)** | emits a string from intent | "what string expresses this, *without coining*?" | §1 schema · §2 registry · §3 generation contract · §4–§5 (as obligations, not just rejections) |

**Read-path — validator.** Skip §3. Run the three passes in §4–§5 in order; emit the error/warn codes
verbatim. §6 tells you what you must *not* flag (the negotiated regime is not part-wise checkable). §7
bounds how much to trust property-disjointness today.

**Read-path — author / LLM.** Start at §3 (the generation contract: closed-vs-open priors, the
compose-don't-coin reframe, the stop-and-report protocol, intent→string patterns). Treat §4–§5 as
*obligations you must satisfy before emitting* — most importantly P8 entailment (emit `selected` ⇒ you
are responsible for the backing existing) and P9 no-coining. Use §2 to resolve every word; never emit a
word you cannot point to in `members` or derive from a `parameter` pattern.

> **On the eventual split.** This single document keeps progress centralized while the structure
> settles (mirroring the constitution's "hold until stable, then extract" discipline). It is
> *pre-cut* for a later split along section boundaries: a lift of §3 (+ the §4–§5 obligation framing)
> becomes `LLM-AUTHORING.md`; §1–§2 + §4–§7 become `LINT-SPEC.md`; §2 is the shared registry both
> import. Until the size asymmetry that justifies two files is real, the split is deferred, not
> reconciled away. Section boundaries below are marked `‹LINT›`, `‹LLM›`, or `‹SHARED›` so the cut is
> mechanical when it comes.

---

## 0. How a class string is validated  ‹SHARED›

**Precondition, checked once at the registry level, not per string: P0 token uniqueness.** Every
word in the finite/closed vocabulary must resolve to exactly one axis. `registry.ts` exports
`checkTokenUniqueness()`, run via `npx tsx registry.ts`; it fails the process (non-zero exit) if any
word matches more than one axis's tokens. This isn't a per-string lint rule — an ambiguous word
doesn't error at validation time, it silently resolves to whichever axis is listed first in
`REGISTRY`, permanently shadowing the other axis's meaning of that word. P0 catches the authoring bug
before it reaches a class string at all. (Caught a real collision this session: `sticky` matched both
`z-scale` and `position-mode`; fixed by prefixing `position-mode`'s members.)

A class string is a set of words. Validation is three passes, in order:

1. **Parse** each word to `(axis, member, value?)` against the registry (§2). A word that resolves to
   no axis is `unknown-word`.
2. **Per-axis laws** (§4): one-word-per-axis, closed/open vocabulary, enumerated arity, weight-implies-
   direction.
3. **Cross-cutting laws** (§5): dimensional purity (`must-never-touch`), state entailment, no-coining.

**Two regimes** (every axis declares one):
- **free** — independent; axes commute and unify. Well-formedness is *part-wise* (validate each word
  against its axis in isolation).
- **negotiated** — a per-member demand resolved by a global solve (member-role sizing only). Does not
  satisfy dimensional purity; validated by the §6 invariants, not part-wise.

**Two roles** (every axis declares one): `container` (governs direct children, `> *`), `member`
(governs the element itself within its parent), `self` (the element's own box), `none`.

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
  controls: string[];                   // concrete CSS properties (transcribed; see §7 trust boundary)
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
  bare attribute presence — see P8 in §5.
- `controls` lists must eventually be *generated from shipped CSS*, not transcribed; until then treat
  property-disjointness checks as indicative, not authoritative (see §7).
- State groups are first-class axes (`axis: "state.<group>"`) — the same P1 one-word-per-axis
  machinery applies to them via `stateGroup.exclusivity`/`conflicts`/`implies`, not a separate code
  path. `conflicts` is for genuinely incompatible pairs (hard error); `implies` is for a narrower
  state that's a platform subset of a wider one — co-occurrence is redundant, not incompatible, and
  the linter surfaces it as a `warn`, not an error.

---

<!-- BEGIN GENERATED: registry (do not edit between markers) -->
> Generated from src/registry.ts by src/generate-spec.ts — do not edit.

## 2. The axis registry (33 axes)  ‹SHARED›

layout=15 · layering=4 · motion=2 · state=9 · skin=3. Every fact below is rendered directly from `REGISTRY`, `SCALES`, or `ENVIRONMENT_SCOPES`.

### Registry scales

| Scale | Ordered values |
|---|---|
| `density` | `tight` `snug` `comfortable` `relaxed` `loose` `separated` |
| `size` | `sm` `md` `lg` `xl` |
| `breakpoint` | `sm` `md` `lg` `xl` |
| `zTier2` | `base` `content` `raised` `dropdown` `sticky` `tooltip` |

### 2.1 LAYOUT (15 axes)

#### structure

- role: `container` · signature: `container-operation` · vocabulary: `closed` · regime: `free`
- value space: `horizontal` `vertical` `grid`
- default: `flow`
- controls: `display.inner` `flex-direction` `grid-template-columns` `grid-auto-flow`
- must never touch: `gap` `padding` `margin` `align-self` `flex` `flex-wrap` `background` `border` `display.outer`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<structure>` | `/^(horizontal\|vertical\|grid)$/` | — | no |

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
| `basis-exact-<size>` | `/^basis-exact-(sm\|md\|lg\|xl)$/` | `size-step` | no |
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
- value space: `span-N` `row-span-N` `span-all`
- default: `auto-place`
- controls: `grid-column` `grid-row`
- must never touch: `align-self` `flex` `gap`
- parametric members: `span` `row-span`
- notes: closed-with-parametric-member: membership closed {span, row-span, span-all}; span/row-span carry integers, span-all is contextual (spans every column). Same member-level mechanism as m3 / enumerated states — NOT open at axis scope. Only meaningful under a grid parent.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `span-N \| row-span-N` | `/^(span\|row-span)-(\d+)$/` | `integer-≥0` | no |
| `span-all (contextual)` | `/^span-all$/` | — | no |
| `span-<bad> \| row-span-<bad>` | `/^(span\|row-span)-.+$/` | `integer-≥0` | yes |

#### density

- role: `container` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `tight` `snug` `comfortable` `relaxed` `loose` `separated`
- default: `comfortable`
- controls: `gap`
- must never touch: `padding` `margin` `structure`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `gap-<density>` | `/^gap-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |

#### flow-spacing

- role: `container` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `tight` `snug` `comfortable` `relaxed` `loose` `separated`
- default: none
- controls: `margin-block-start`
- must never touch: `gap` `padding` `display`
- notes: correct only for single-line, source-ordered block/prose flow

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `flow-<density>` | `/^flow-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |

#### padding

- role: `self` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `tight` `snug` `comfortable` `relaxed` `loose` `separated`
- default: none
- controls: `padding` `padding-inline` `padding-block`
- must never touch: `margin` `gap` `display`
- sub-dials: `inline` `block`
- dial resolver: declared in `registry.ts`
- whole-axis pattern matcher: declared in `registry.ts`
- notes: two sub-dials: inline (padding-inline-*) and block (padding-block-*). `padding-<density>` is the WHOLE-AXIS form (sets both sides), so it conflicts with a per-side dial; `padding-inline-relaxed padding-block-snug` composes.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `padding-<density>` | `/^padding-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |
| `padding-inline-<density>` | `/^padding-inline-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |
| `padding-block-<density>` | `/^padding-block-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |

#### margin

- role: `member` · signature: `ordered-chain` · vocabulary: `closed` · regime: `free`
- value space: `tight` `snug` `comfortable` `relaxed` `loose` `separated`
- default: none
- controls: `margin` `margin-inline` `margin-block`
- must never touch: `padding` `gap` `display`
- sub-dials: `inline` `block`
- dial resolver: declared in `registry.ts`
- whole-axis pattern matcher: declared in `registry.ts`
- notes: two sub-dials inline/block; `margin-<density>` is the whole-axis (both-sides) form. marked-by-preference: reach for it only outside container rhythm.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `margin-<density>` | `/^margin-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |
| `margin-inline-<density>` | `/^margin-inline-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |
| `margin-block-<density>` | `/^margin-block-(tight\|snug\|comfortable\|relaxed\|loose\|separated)$/` | `density-step` | no |

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
- value space: `scroll-y` `scroll-x` `scroll-auto` `clip`
- default: none
- controls: `overflow-x` `overflow-y`
- must never touch: `display` `padding`
- sub-dials: `x` `y`
- dial resolver: declared in `registry.ts`
- whole-axis pattern matcher: declared in `registry.ts`
- notes: two sub-dials: scroll-x (overflow-x) and scroll-y (overflow-y) compose; scroll-auto and clip are whole-axis (both directions), so they conflict with a per-axis dial.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `<overflow>` | `/^(scroll-y\|scroll-x\|scroll-auto\|clip)$/` | — | no |

#### constraints

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `open` · regime: `free`
- value space: `min-width-<size>` `max-width-<size>` `min-height-<size>` `max-height-<size>`
- default: none
- controls: `min-width` `max-width` `min-height` `max-height`
- must never touch: `flex-grow` `flex-shrink` `flex-basis` `width`
- sub-dials: `min-width` `max-width` `min-height` `max-height`
- dial resolver: declared in `registry.ts`
- notes: four sub-dials, one per longhand. min-width/max-width compose as a width band; min-height/max-height compose as a height band; all four can co-occur. A future semantic check (not yet implemented) should warn when a band is inverted, e.g. min-width-lg max-width-sm.

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| `min/max-width/height-<size>` | `/^(min-width\|max-width\|min-height\|max-height)-(sm\|md\|lg\|xl)$/` | `size-step` | no |
| `min/max-width/height-<bad>` | `/^(min-width\|max-width\|min-height\|max-height)-.+$/` | `size-step` | yes |

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

### 2.3 MOTION (2 axes)

#### motion-micro

- role: `member` · signature: `set-with-exclusivity` · vocabulary: `closed` · regime: `free`
- value space: `decelerate` `accelerate` `standard` `emphasized` `symmetric` `asymmetric`
- default: none
- controls: `transition-duration` `transition-timing-function` `transition-delay`
- must never touch: `animation` `transform` `background`
- notes: duration/delay magnitudes are open skin scales (R-MOTION-01), not grammar members.

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

### 2.5 SKIN (3 axes)

#### skin-surface

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `open` · regime: `free`
- value space: `<tone>` `<ink>` `<radius>`
- default: none
- controls: `background` `color` `border` `border-radius` `box-shadow`
- must never touch: `display` `gap` `flex` `position`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| — | — | — | — |

#### skin-type

- role: `self` · signature: `set-with-exclusivity` · vocabulary: `open` · regime: `free`
- value space: `<type-step>`
- default: none
- controls: `font-size` `line-height` `font-family` `font-weight` `text-align`
- must never touch: `display` `gap` `flex` `margin`

Tokens:

| Shape | Pattern | Value domain | Fallback |
|---|---|---|---|
| — | — | — | — |

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
<!-- END GENERATED: registry -->

---

## 3. Generation contract (author / LLM read-path)  ‹LLM›

This section is for the *generating* consumer — emitting a class string from intent. The validator can
skip it. Everything here is the constitution's anti-coining machinery restated as authoring priors. The
single dominant failure mode when generating is **inventing a plausible-sounding word**; every rule
below exists to prevent that.

### 3.1 The four moves, in order

When intent doesn't obviously map to a word, work down this list and **stop at the first that applies**:

1. **Find the member.** Resolve the intent to an existing `member` in §2. Most intent is one word on
   one axis. (`a row` → `horizontal`; `space between children` → `gap-*`.)
2. **Compose across axes.** If no single word fits, the felt gap is *usually a composition of existing
   axes*, not a missing word (Law 6). Combine one word each from several axes. ("Fill the parent" is
   not an axis — it is `expandable` (m2, main-axis) + `self-stretch` (m4, cross-axis). "A circle" is
   size grammar + a skin radius, not a `circle` word.)
3. **Use the open parameter.** If the axis is `open`, the distinction is a *value*, not a new word:
   `grow-2`, `span-3`, `basis-exact-md`, `padding-relaxed`. Emit a value matching the axis
   `parameter.pattern`; never a new word.
4. **Stop and report the gap.** If 1–3 fail on a `closed` axis, the word does **not** exist and you may
   **not** mint it. Surface a structured gap (§3.4) and stop. This is a legitimate terminal state, not
   a failure to try harder.

There is no fifth move. "Invent a word that sounds right" is never available.

### 3.2 Closed vs open — the prior that does the most work

- **closed** axis → the `members` list is *exhaustive*. A word not in it does not exist. Do not coin,
  do not pluralize, do not hyphenate two members together. (`structure`, `density`, `alignment`, all
  of state, the z-scale, easing, choreography are closed.)
- **open** axis → admits *only* its sanctioned parameter, by `parameter.pattern`. New **values**, never
  new **words**. (`m2` weights, `m3` `basis-exact-<size>`, `m5` spans, `constraints`.)

When unsure which an axis is, treat it as **closed** — that is the safe default and forces move 4 rather
than a guess.

### 3.3 Common coinages and their correct substitutions

These are the tempting inventions and what to emit instead. The pattern is always *compose or
parameterize*, never coin:

| Tempting coinage | Why it's wrong | Emit instead |
|---|---|---|
| `stretchy` | conflates two axes | `expandable` (grow) or `self-stretch` (cross-axis) — pick the one meant |
| `centered-grow` | bundles two axes | `expandable self-center` |
| `loose-wide` | density + a retired proportion idea | `padding-inline-relaxed padding-block-snug` (per-side) |
| `greedy` / `fill` | named a *symptom* of surplus | `elastic basis-ratio` |
| `circle` | plane-mix (size + skin) | size grammar + a skin radius token |
| `fixed` (sizing) | collides with `position:fixed` | `basis-exact-<size>` |
| `sticky-high` (z) | invents a scale rung | an existing `z-scale` member, within an `isolate` context |
| `dialog-on-top` | invents above-everything z | top-layer mechanism (tier-1), not a z-number |
| `stack` | a member that duplicates the default | `vertical` (the marked column) |

### 3.4 Stop-and-report protocol

When move 4 fires, do **not** emit a class. Emit a gap report the maintainer can act on:

```
GAP: axis=<axis or "unknown">, intent="<what was wanted>",
     tried=[member-lookup, composition, parameter],
     candidate-word="<the word you were tempted to coin>",
     note="<why composition/parameter did not cover it>"
```

A real missing distinction becomes a constitution `[RULING]`; a non-distinction is dropped. Either way
the decision is the maintainer's, made in the constitution, never improvised at generation time.

### 3.5 State entailment is an authoring *obligation*

Emitting a state word commits you to its truth. This is the one place generation carries a duty beyond
word choice (full predicate in §5, P8):
- Emit a **`state-instance`** word (`selected`, `open`, `invalid`, …) ⇒ you are responsible for *one of*
  its backing set existing on the element (`selected` ⇒ `aria-selected` ∨ `aria-pressed` ∨ `:checked`).
  A state class without backing renders something *visually true but semantically false* — never emit it.
- Emit a **`state-relational`** word (`active-descendant`) ⇒ the backing is on the **container**
  (`aria-activedescendant` pointing at this element's id), not the element.
- **`state-capability`** (`selectable`) and **conditioned-skin** entail nothing — safe to emit alone.

### 3.6 What is out of grammar — route, don't coin

Some intent has no grammar word *by design*. Route it; never invent a property:
- **ARIA wiring** (`aria-controls`, `aria-labelledby`, focus management, `inert`) → authoring/JS, not a
  state member.
- **"What is currently on top, place me above it"** → top-layer promotion (tier-1) or JS. There is no
  CSS-readable scalar for it; do not coin one.
- **Type, font, content size** → skin tokens (§5 of the constitution), not a layout word.
- **A specific component's one-off positioning** → identity residue, not grammar.

---

## 4. Per-axis predicates  ‹LINT› (authors: read as obligations)

### P1 — one word per axis, per condition scope (both regimes)
A well-formed string picks **at most one** member per axis **within each condition scope**. Parsing
assigns every word a `scope` (`base`, or an environment prefix like `viewport-md`). Bucket by scope,
then apply one-word-per-axis within each bucket.
- `horizontal vertical` → **error** `one-word-per-axis` (both `structure`, same `base` scope).
- `horizontal viewport-md:vertical` → **ok** (same axis, *different* scopes — the basis of responsive
  layout; Law 2 amended).
- `viewport-md:horizontal viewport-md:vertical` → **error** `one-word-per-axis` (same axis, same scope).
- Only **environmental** states open scopes; bare interaction/input states do not.
- **Sub-dial refinement:** axes with sub-dials (m2 grow/shrink, alignment align/justify, padding/margin
  inline/block, overflow x/y, constraints min/max-width/min/max-height) admit one value *per dial*,
  since dials write disjoint CSS properties: `align-center justify-between` and
  `padding-inline-relaxed padding-block-snug` and `min-width-sm max-width-lg` compose; two values on
  one dial conflict. A **whole-axis** word (an m2 corner, `padding-<density>`, `scroll-auto`/`clip`)
  writes every dial, so it is mutually exclusive with any other word on the axis. (Constraints has no
  whole-axis word — there's no single term that sets all four bounds at once.)
- **State-group refinement:** within a `one` group, a second member is an **error**. Within a `many`
  group, a declared `conflicts` pair is an **error**; a declared `implies` pair (the narrower state is
  a platform subset of the wider) present together is a **`warn`**, not an error — it's redundant, not
  incompatible. Everything else in a `many` group co-occurs silently.

### P2 — closed vocabulary admits no new members
On a `closed` axis, any word not in `members` is rejected.
- `stretchy`, `loose-wide`, `centered-grow` → **error** `unknown-word` / `coined-word`.
- A missing distinction on a closed axis is either a composition across axes or a gap to report
  (`[RULING]`), never a coined word.

### P3 — open vocabulary admits only its stated parameter  ‹IMPLEMENTED›
On an open/parametric axis, a word matching the axis's *shape* (its dash-prefix) but not a
*sanctioned value* gets a dedicated `bad-parameter` diagnosis, via a `fallback` token listed after
the valid-value token (same ordering discipline as the enumerated-state fallback tokens — valid
matches win first). This is deliberately narrower than "any word that merely resembles the concept":
a word with no structural match at all (no dash-prefix) still correctly falls through to P2
`unknown-word` — P3 only fires when the *shape* is right and the *value* isn't.
- `grow-3` → **ok**. `grow-abc` → **error** `bad-parameter` (shape `grow-` recognized, "abc" isn't a
  sanctioned non-negative integer). `growish` (no dash) → **error** `unknown-word` (P2), not P3 — the
  shape isn't recognized at all.
- Same mechanism on `basis-exact-<size>` (`basis-exact-240` → `bad-parameter`, raw px is OUT in v0),
  `span-<N>`/`row-span-<N>`, and `constraints`' four dials (`min-width-huge` → `bad-parameter`).

### P4 — enumerated arity must carry a value from its closed set  ‹IMPLEMENTED›
A state with `arity === "enumerated"` must be written WITH a value from `enumValues`. The parser
captures a valid value via the per-member valid-value token; a bare or wrong-valued word matches a
fallback token (no value captured), which P4 flags — distinguishing the two cases:
- `sorted` (no value) → **error** `enum-arity` (needs one of {none, ascending, descending}).
- `sorted-sideways` (value not in set) → **error** `enum-arity` (not in {none, ascending, descending}).
- `sorted-ascending` → **ok**. (P8 entailment is suppressed for a malformed enum word — P4 owns it.)

### P5 — whole-axis aliases & per-dial conflicts (folded into one-word-per-axis)
*(No longer a standalone "weight-implies-direction" predicate — that was a cross-class rule for the
retired m2 split. It is now a consequence of the single invariant: no CSS property written by two
co-present classes, at longhand granularity.)*
On an `open + whole-axis aliases` axis (m2):
- a **whole-axis alias** writes *both* longhands, so it conflicts with any other word on the axis:
  `rigid grow-2`, `elastic grow-2`, `expandable shrink-2` → **error** `one-word-per-axis`.
- **dials** compose one-per-longhand-dial: `grow-2 shrink-1` ok; `grow-2 grow-3` → **error**
  `one-word-per-axis` (two values for the `flex-grow` dial).

### P6 — arity misuse (binary can't hold a tri-state)  ‹IMPLEMENTED (form b)›
The implemented form: a **binary** state whose backing is a tri-state truth that has its own dedicated
word.
- `selected` with `aria-checked=mixed` (or `:indeterminate`) backing → **error** `arity-misuse`
  (use the dedicated word `checked-mixed`).
- A binary word written with a value suffix (`selected-mixed`) is caught by **P2 `unknown-word`** —
  there is no such token — rather than P6; this is accurate and avoids over-matching typos with
  binary "base + illegal tail" fallback tokens.

---

## 5. Cross-cutting predicates  ‹LINT› (authors: read as obligations)

### P7 — dimensional purity (free regime)
For the free regime, no two axes touch the same CSS property, so a word must touch only its own axis's
`controls` and none of its `mustNeverTouch`. The checkable form runs over the whole registry (the §10.1
predicate-4 family):
- **4a self-consistency:** no axis controls a property it also forbids.
- **4b cross-axis disjointness (free):** no two free axes control the same property, except the
  documented container/member **twin** on a facet-split property (only `display`: `structure` sets
  inner, `m1` sets outer — CSS resolves independently).
- **4c free-vs-negotiated:** a negotiated axis may share with other negotiated axes (the flex solve)
  but must be disjoint from every free axis.
- **4d state controls nothing:** any state axis with non-empty `controls` is a violation.

A grammar word touching a `must-never-touch` property (e.g. a layout word emitting `background`) →
**error** `plane-mix`. This is also the decomposition test: split a class that mixes planes.

### P8 — state entailment (category-dispatched)  ‹IMPLEMENTED›
- `instance`, binary: requires *one of* its backing set present on the element. None present →
  **error** `state-entailment` (e.g. `selected` with no `aria-selected`/`aria-pressed`/`:checked`).
  Suppressed for a word P6 already gave a more specific diagnosis (`selected` with mixed backing
  reports only `arity-misuse`, not also a redundant `state-entailment` — one fix, not two).
- `instance`, enumerated (**value-aware**, this revision): requires *one of* its backing set present
  **with the specific value the word carries** — `sorted-ascending` requires `aria-sort=ascending` on
  the element, not merely `aria-sort` present with any value (or a different one). Backing must be
  supplied as `attr=value` pairs for enumerated checks; bare-attribute backing no longer satisfies.
  Suppressed for a malformed enum word (P4 owns that diagnosis).
- `relational` ‹IMPLEMENTED›: requires the **container** to point at this element's id via the member's
  `relationalBacking.containerAttr` (e.g. listbox `aria-activedescendant` === this option's id).
  Otherwise → **error** `state-entailment-relational`. Needs a `LintContext` (`{elementId,
  containerAttrs}`); when no context is supplied the check is **skipped, not failed** (the linter can't
  see the container, so it doesn't guess).
- `capability` / `conditioned-skin`: entail nothing; never fire.

### P9 — no-coining (the extension contract)
1. Closed axes admit no new members (P2). A consumer that wants a word not present must **stop and
   report the gap**, never guess.
2. Open axes admit only their sanctioned parameter values (P3).
3. Aliases are **earned by recurrence**, never invented — codified only after a primitive combination
   demonstrably recurs in real use.

### P10 — divider/wrap interaction (warn)  ‹IMPLEMENTED›
`divided` composed with `wrap-allowed` or `wrap-reverse` → **warn** `divider-wrap`: the
between-children line assumes authored order, so verify it degrades to no divider rather than
mis-rendering once children can wrap or reverse. `wrap-prevent` is unaffected (order can't change).
Global check, not scope-bucketed. (There's no `order`/reordering axis in the registry yet to extend
this to — if one is added, it belongs in the same check.)

---

## 6. Negotiated regime — invariants (not part-wise)  ‹SHARED›

Member-role sizing (`m2` give↔grab, `m3` basis, the min/max band) does not commute and is not validated
part-wise. Its correctness is the solver's invariants (the oracle is the engine; tests in §10):
- **conservation** — Σ settled = available space.
- **monotonicity** — more `grab` never shrinks you; more `give` never grows you.
- **ratio-invariance** — scaling all weights by *c* leaves the result fixed.
- **order-equivariance** — permuting members permutes the result identically.
- **clamp-idempotence** — applying `bounds` twice = once.

Phase order is `place ∘ negotiate` (never the reverse): the solver fixes sizes globally first;
placement positions each settled box locally after. The two never interleave — so an element may
legitimately carry `expandable` (negotiated) and `self-center` (free) at once.

---

## 7. Trust boundary  ‹SHARED›

- `controls` lists are currently **transcribed from prose**, not generated from shipped CSS. Property-
  disjointness checks (P7) are therefore **indicative**, not authoritative, until `controls` is derived
  from the generated output (the real build gate). A property an axis emits but the prose didn't name
  could hide a collision.
- Property-disjointness is **necessary, not sufficient** for compositionality: two property-disjoint
  axes can still interact through layout side-effects. Those are caught by outcome/browser tests, not
  by this static spec.
- Skin is **sampled** (surface + type), not exhaustive; a fuller enumeration could surface a grammar/
  skin overlap.

---

## 8. Reference: what the linter implements  ‹SHARED›

**`lint.ts`** (runs under `npx tsx lint.ts`; smoke suite 70/70) implements, today:
- **P0** — token uniqueness (registry-build invariant, not per-string): every closed/finite word must
  resolve to exactly one axis. Run via `npx tsx registry.ts` (`checkTokenUniqueness()`), exits non-zero
  on any collision. Caught a real `sticky` collision between `z-scale` and `position-mode` this
  session — fixed by prefixing `position-mode`'s members (`position-static`, `position-sticky`, …).
- **P1** — one word per axis per condition scope, including the sub-dial refinement (m2, alignment,
  padding/margin, overflow, constraints) and per-group state exclusivity (`one`/`many` + pairwise
  `conflicts` as errors + pairwise `implies` as `warn`-level redundancy notices).
- **P2** — unknown/coined word.
- **P3** — bad-parameter: a word matching an open/parametric axis's *shape* (prefix) with an
  unsanctioned *value* (`grow-abc`, `basis-exact-240`, `span-abc`, `min-width-huge`) gets a specific
  `bad-parameter` diagnosis via a dedicated `fallback` token, rather than falling through to P2's
  coarser `unknown-word`.
- **P4** — enumerated arity (missing value vs value-not-in-set), via per-member valid + fallback tokens.
- **P6** — arity misuse, form (b): a binary word with a tri-state backing that has its own word. P6's
  target word is now suppressed from P8 (see below) so an author gets one diagnosis, not two.
- **P8 instance** — instance-state entailment (set-valued, Law-6b disjunction), **value-aware for
  enumerated states** (checks `attr=value`, not just attribute presence), suppressed for malformed
  enums and for any word P6 already gave a more specific diagnosis (`selected` with mixed backing
  reports only `arity-misuse`, not also `state-entailment`).
- **P8 relational** — inverted entailment against a container context (`LintContext`); skipped, not
  failed, when no context is supplied.
- **P10** — divider/wrap interaction: `divided` composed with `wrap-allowed`/`wrap-reverse` emits a
  `warn`-level `divider-wrap` notice (the between-children line assumes authored order).

**Not yet implemented in `lint.ts`** (specified above; deferred): P7 dimensional-purity *from
generated CSS* (the `controls` are still transcribed, not derived — the highest-value remaining
piece).

Earlier session scripts (not committed) that mechanized parts of this spec: `full-registry.ts` (P7 over
all axes + ownership index), `collision-analysis.ts` (the two predicate-4 collisions), `combobox-audit.ts`
/ `tree-audit.ts` (relational entailment). Folding their checks into `lint.ts` + CI is the open work.
