---
register: normative
---

# ERMINE — the constitution

This register contains current law only. Explanations live in
`ERMINE-RATIONALE.md`; decision events live in `decisions/`.

## R-DOC-01 — Source-of-truth relationship

This constitution is the single upstream source. The registry is an extraction of the
constitution; the spec and guide are extractions of the registry; the CSS is the generated face.
Nothing downstream may invent what the constitution does not say.

→ rationale: RAT:R-DOC-01 · history: ADR-0004

## R-PLANE-01 — Three planes

Sort every style by function, not by file or by reusable-vs-app: Grammar governs how it
behaves or arranges, Skin governs how it looks, and Identity governs what specific thing it is.
A class that sets layout and appearance mixes planes and must be split.

→ rationale: RAT:R-PLANE-01 · history: ADR-0002

## R-SCOPE-01 — Radius of action

Every rule has a radius of action: element, container, ambient, or substrate/reset. Container
scope governs direct children only. Ambient scope inherits through its subtree until shadowed.
Substrate/reset removes variance and adds no style.

→ rationale: RAT:R-SCOPE-01 · history: unrecorded

## R-SCOPE-02 — Membership before ranking

Resolution runs in two stages. A hard boundary decides who is allowed to compete; within that
membership set, a property is governed by exactly one ranking metric. Open ambient uses
re-declaration depth. Bounded regional scope uses tree proximity with an explicit lower edge.
Never use both metrics on one property.

→ rationale: RAT:R-SCOPE-02 · history: unrecorded

## R-GRAMMAR-01 — Two composition regimes

The grammar has two regimes. Free-composition axes commute and unify. Negotiated composition is
a per-member demand resolved by a global solve over the parent's finite space and governs exactly
the member-role sizing family. The two regimes sequence as `place ∘ negotiate`.

→ rationale: RAT:R-GRAMMAR-01 · history: ADR-0002

## LAW-1 — Axis equals paradigm

Each axis is a choice-set; a word names one choice in it.

→ rationale: RAT:LAW-1 · history: ADR-0002 · code: src/registry.ts#AxisRecord

## LAW-2 — One word per axis per condition scope

A well-formed class string picks at most one word per axis per condition scope. Environmental-state
variant prefixes open a new scope; bare interaction and input states do not.

→ rationale: RAT:LAW-2 · history: ADR-0004 · code: src/lint.ts#p1_oneWordPerAxisPerScope

## LAW-3 — Dimensional purity

In the free regime, a word touches only its own axis's properties. No two free axes touch the same
property except a documented facet split. Negotiated axes replace purity with solver laws.

→ rationale: RAT:LAW-3 · history: ADR-0002, ADR-0003 · code: src/emit.ts#checkDimensionalPurity

## LAW-4 — Default equals markedness

Each axis declares an unmarked default. Defaults ride the cascade. Distributed defaults must have
zero specificity so an element-level override always wins.

→ rationale: RAT:LAW-4 · history: ADR-0002

## LAW-5 — Contrast

A word earns its place only by differing from its neighbors. Two words with the same effect are
one word with two spellings; delete one.

→ rationale: RAT:LAW-5 · history: ADR-0002

## LAW-6 — Name platform distinctions; mint no ontology

A word is a candidate only if it names a distinction the platform already makes. If the platform
does not draw the line, the candidate is a non-distinction and must not become a grammar member.

→ rationale: RAT:LAW-6 · history: ADR-0002 · code: src/lint.ts#p2_unknownWord

## LAW-6B — Contrast may rebut mirroring

A platform distinction is eligible but not automatically admitted. If two platform-named states
produce no actionable difference, they collapse to one grammar member carrying the richer backing
as an entailment set. This law may only reduce member count; it never increases it and never coins.

→ rationale: RAT:LAW-6B · history: ADR-0003 · code: src/lint.ts#p8_stateEntailment

## LAW-7 — Regime-scoped compositionality

In the free regime, the meaning of the whole is computable from the parts and these rules. The
negotiated regime claims outcome determinism and testable solver invariants, not part-wise
compositionality.

→ rationale: RAT:LAW-7 · history: ADR-0002

## LAW-8 — Negotiate then place

When an element carries negotiated demand and free placement, the effect is `place ∘ negotiate`,
never the reverse. The solver fixes the box; placement then positions it.

→ rationale: RAT:LAW-8 · history: ADR-0002

## R-AXIS-01 — Algebraic signatures

Every axis declares exactly one signature: `set-with-exclusivity`, `ordered-chain`,
`container-operation`, or `negotiated-field`. A negotiated field satisfies conservation,
monotonicity, ratio-invariance, order-equivariance, and clamp-idempotence.

→ rationale: RAT:R-AXIS-01 · history: ADR-0002 · code: src/registry.ts#Signature

## R-VOCAB-01 — Closed and open vocabularies

Every axis declares its vocabulary closed or open. Closed axes admit no new members. Open axes
admit only their stated parameter rule. Closed is the default.

→ rationale: RAT:R-VOCAB-01 · history: ADR-0002 · code: src/registry.ts#Vocabulary

## R-VOCAB-02 — Two primitives at any scope

Vocabulary has exactly two primitives: `closed` and `open`. Parametric members apply one of those
primitives at member scope; whole-axis aliases are earned sugar, not a third primitive.

→ rationale: RAT:R-VOCAB-02 · history: ADR-0004

## R-VOCAB-03 — No coining and earned aliases

Aliases are detected from repeated real usage, not invented speculatively. A consumer that wants
a word absent from a closed axis must stop and report a gap. Open axes admit values of their stated
parameter, not free-form new words.

→ rationale: RAT:R-VOCAB-03 · history: ADR-0002 · code: src/lint.ts#p2_unknownWord

## R-ROLE-01 — Container and member roles

Every element is simultaneously a container toward its children and a member toward its parent.
These directions are orthogonal. Every axis declares which role it speaks to. Role and composition
regime are orthogonal.

→ rationale: RAT:R-ROLE-01 · history: ADR-0002 · code: src/registry.ts#Role

## R-STRUCTURE-01 — Inner display structure

Structure is a closed container operation over `horizontal`, `vertical`, `grid`, and ruled
grid-structure variants, with unmarked default `flow`. It controls inner display only. `block` and
`inline` are outer display and belong to member role. `rows` is retired; use
`horizontal wrap-allowed`.

→ rationale: RAT:R-STRUCTURE-01 · history: ADR-0002 · code: src/registry.ts#LAYOUT

## R-STRUCTURE-02 — Grid Fit Track

A grid container may declare a content-fit first track and a filling second track:
`grid-fit-<size>` sets `display: grid`, `grid-auto-flow: row`, and
`grid-template-columns: fit-content(var(--size-<size>)) 1fr`. The size parameter is a layout size
scale token, not a raw CSS length. `grid-fit-*` is a structure member and replaces plain `grid`
rather than composing with it.

→ rationale: RAT:R-STRUCTURE-02 · history: ADR-0032 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-STRUCTURE-03 — Column grid

A container may declare the shared twelve-column grid: `columns-12` sets `display: grid`,
`grid-auto-flow: row`, and `grid-template-columns: repeat(12, 1fr)`. It is a structure member,
replacing plain `grid` rather than composing with it. Twelve is the ruled grain because the common
relational proportions land on exact integer tracks over it (`half` = 6, `third` = 4, `quarter` = 3,
`two-thirds` = 8, `three-quarters` = 9, `sixth` = 2). Other track counts are reserved pending
evidence; the grid is fixed at twelve so the intent-proportions (R-M5-02) stay exact.

→ rationale: RAT:R-STRUCTURE-03 · history: ADR-0034 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-STRUCTURE-04 — Subgrid

A nested grid may adopt its parent's tracks: `subgrid` sets `display: grid`, `grid-auto-flow: row`,
and `grid-template-columns: subgrid`. A structure member, replacing plain `grid`. It resolves the
design-system tension between component encapsulation and page-level alignment — a subgridded child
aligns its own content to the outer grid's tracks. Meaningful only inside a grid parent; the
inherited-row form (`grid-template-rows: subgrid`) is reserved pending evidence.

→ rationale: RAT:R-STRUCTURE-04 · history: ADR-0035 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-M1-01 — Flow participation

Flow participation is a closed member-role axis over `inline`, `boxed`, and `boxed-inline`, with
natural flow as the unmarked default. Its surface names remain open pending observed recurrence.
Inline-flavored values are inert on flex and grid items and require a lint warning there.

→ rationale: RAT:R-M1-01 · history: unrecorded · code: src/lint.ts#p11_m1OnFlexItem

## R-M2-01 — Flex character

Flex character is one open negotiated axis with independent `grow-N` and `shrink-N` dials. The four
corners are whole-axis aliases fixing both dials. Authors write either one alias or numbered dials,
never both. Emit longhands, never the `flex` shorthand.

→ rationale: RAT:R-M2-01 · history: ADR-0004 · code: src/registry.ts#Alias

## R-M2-02 — Per-dial defaults

An unspecified flex-character dial keeps its CSS initial value. `grow-2` grows and shrinks because
it leaves `flex-shrink` at `1`; grow-only weight two is `grow-2 shrink-0`.

→ rationale: RAT:R-M2-02 · history: ADR-0004 · code: src/registry.ts#LAYOUT

## R-M2-03 — Weight primitives

`grow-N` and `shrink-N` are independent complete primitives for non-default magnitudes. No separate
symmetric weight alias is minted.

→ rationale: RAT:R-M2-03 · history: ADR-0004 · code: src/registry.ts#LAYOUT

## R-M3-01 — Basis-only self size

The m3 self-size axis controls `flex-basis` only. Main-axis fill is m2 growth and cross-axis stretch
is m4 self-alignment. Minimum and maximum bounds are universal self/internal properties, not m3.

→ rationale: RAT:R-M3-01 · history: ADR-0003 · code: src/registry.ts#LAYOUT

## R-M3-02 — Basis source surface

Basis source is a closed axis over `basis-content`, `basis-ratio`, and `basis-exact-<size>`. Bare
`content`, `ratio`, and `exact` are value-space names and are never emitted as standalone classes.

→ rationale: RAT:R-M3-02 · history: ADR-0004 · code: src/registry.ts#LAYOUT

## R-M3-03 — Exact basis uses size tokens

The parameter of `basis-exact-*` is a size-scale token, not a raw CSS length. Arbitrary lengths are
outside the v0 grammar surface and remain an identity concern unless an escape hatch is separately
earned and ruled.

→ rationale: RAT:R-M3-03 · history: ADR-0004 · code: src/lint.ts#p3_badParameter

## R-M4-01 — Self alignment

Self alignment is a closed member-role axis over `self-start`, `self-center`, `self-end`,
`self-stretch`, and `self-baseline`. It is the member twin of container alignment.

→ rationale: RAT:R-M4-01 · history: unrecorded · code: src/registry.ts#LAYOUT

## R-M5-01 — Grid placement

Grid placement is a closed member-role axis with parametric `span-N` and `row-span-N` members plus
contextual `span-all`. It is meaningful only under a grid parent.

→ rationale: RAT:R-M5-01 · history: unrecorded · code: src/registry.ts#LAYOUT

## R-M5-02 — Intent proportions

Over the `columns-12` grid (R-STRUCTURE-03), a child may claim a readable proportion of the row
instead of an arithmetic span: `half`, `third`, `quarter`, `two-thirds`, `three-quarters`, `sixth`
emit `grid-column: span 6 / 4 / 3 / 8 / 9 / 2`. They are the intent-named form of `span-N`, demoting
raw span arithmetic to an escape. The number lands on an integer track only because twelve is the
chosen grain (R-STRUCTURE-03); the words are meaningful only under `columns-12`, and a different
track count would make them wrong. `whole` is not a member — full width is `span-all`.

→ rationale: RAT:R-M5-02 · history: ADR-0034 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-MEMBER-01 — Member deduplication

The m1–m5 split replaces the old bundled member names. `item`, `fit-content`, `fill`, `greedy`, and
unused `.items` duplicates are not live grammar primitives.

→ rationale: RAT:R-MEMBER-01 · history: ADR-0002

## R-MEMBER-02 — Default and override declaration sites

A container supplies normalized member defaults at zero specificity; an element asserts its
singularity locally. Container depth is one level. Wider reach belongs to substrate or ambient scope.

→ rationale: RAT:R-MEMBER-02 · history: ADR-0002

## R-MEMBER-03 — Sections removed

`sections` is dropped. Major divisions belong to HTML semantics, density plus structure, or a
composition, not a grammar primitive.

→ rationale: RAT:R-MEMBER-03 · history: ADR-0002

## R-MEMBER-04 — Equal circle decomposed

`equal-circle` is dropped because it fuses size grammar with radius skin. A circular shape composes
size grammar with a skin.

→ rationale: RAT:R-MEMBER-04 · history: ADR-0002

## R-SPACE-01 — Spatial property ownership

Gap owns space between siblings, padding owns space within self, and margin owns the member's space
toward the outside. Sibling rhythm belongs to `gap` or `flow`, not per-child margins.

→ rationale: RAT:R-SPACE-01 · history: ADR-0001

## R-SPACE-02 — Four spacing families

`gap-*`, `flow-*`, `padding-*`, and directional `margin-*` families are independent per-property
classes over one shared scale. Use the full property name followed by the T-shirt step. Margin
supports whole-axis, inline, block, and physical edge facets; overlapping footprints conflict
while disjoint edges compose.

→ rationale: RAT:R-SPACE-02 · history: ADR-0001, ADR-0043 · code: src/registry.ts#SCALES

## R-SPACE-03 — Flow and stack dissolution

There is no marked `stack` structure member. Vertical stacking is `vertical`; `flow` remains the
unmarked structure default. The `flow-*` spacing family remains distinct.

→ rationale: RAT:R-SPACE-03 · history: ADR-0002

## R-DENSITY-01 — Spacing scale

Spacing magnitude is a closed ordered T-shirt scale `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`,
with unmarked default `md`. The retired density words (`tight`…`separated`) are reserved as
future container-density aliases (R-PROPORTION-01), never as per-property words.

→ rationale: RAT:R-DENSITY-01 · history: ADR-0001, ADR-0022 · code: src/registry.ts#SCALES

## R-DENSITY-02 — Synonym collapse

`relaxed` and `spaced` are synonyms. Keep `relaxed`; drop `spaced`. (Historical: both words are
retired under R-DENSITY-01's T-shirt scale; this settled the synonym before retirement.)

→ rationale: RAT:R-DENSITY-02 · history: ADR-0001

## R-DENSITY-03 — Derived directional composites

A directional composite (e.g. `md`-inline with `lg`-block) is derived from per-side atomic spacing
classes, never hand-authored as a primitive. What is safe to derive is derived.

→ rationale: RAT:R-DENSITY-03 · history: ADR-0001

## R-DENSITY-04 — Shared spacing scale

Gap, padding, flow, and margin reference one shared spacing scale through independent per-property
classes. The runtime value channel is retired.

→ rationale: RAT:R-DENSITY-04 · history: ADR-0001 · code: src/registry.ts#SCALES

## R-PADDING-01 — Padding family

Padding is an independent per-property ordered-chain family over the shared spacing scale, including
whole-axis, inline, block, and physical edge variants. The same footprints admit a `none` endpoint
that emits zero without joining the shared spacing scale. A compound dial owns its physical
footprint: `padding-inline-*` owns left and right, `padding-block-*` owns top and bottom, and a
physical edge owns only itself. Overlapping footprints conflict; disjoint physical edges compose.

→ rationale: RAT:R-PADDING-01 · history: ADR-0002, ADR-0043, ADR-0053 · code: src/registry.ts#LAYOUT

## R-PADDING-02 — Wide is not a padding step

`wide` is not a density or padding step. Per-axis bias is expressed with inline and block spacing
classes.

→ rationale: RAT:R-PADDING-02 · history: ADR-0002

## R-PROPORTION-01 — Proportion axis retired

Proportion is not a grammar axis. Anisotropy is the composition of per-side per-property density
classes. A single-word reading may return only as an alias earned by recurrence.

→ rationale: RAT:R-PROPORTION-01 · history: ADR-0001

## R-ALIGN-01 — Container alignment

Container alignment is three closed exclusive sub-axes over the fixed `align-*`, `justify-*`, and
`content-align-*` keyword sets. `align-*` aligns child items, `justify-*` distributes inline/main
axis space, and `content-align-*` packs multi-line/grid content via `align-content`. It does not
control spacing or structure.

→ rationale: RAT:R-ALIGN-01 · history: ADR-0054 · code: src/registry.ts#LAYOUT

## R-DIVIDER-01 — Divider belongs to the container

Divider is a closed free container-role axis over `divided` and unmarked `undivided`. It owns a
separation stroke between adjacent members, never a member's own border.

→ rationale: RAT:R-DIVIDER-01 · history: ADR-0002 · code: src/registry.ts#LAYOUT

## R-DIVIDER-02 — Portable fallback boundary

The `* + *` fallback is conforming only for single-line, source-ordered containers without reversal
or ordering. Unsupported wrapped or reordered compositions degrade to no divider rather than a wrong
divider. Native gap decoration is the forward mechanism.

→ rationale: RAT:R-DIVIDER-02 · history: ADR-0003 · code: src/lint.ts#p10_dividerWrap

## R-WRAP-01 — Wrapping

Wrapping is a closed axis over `wrap-allowed`, `wrap-prevent`, and `wrap-reverse`.

→ rationale: RAT:R-WRAP-01 · history: unrecorded · code: src/registry.ts#LAYOUT

## R-OVERFLOW-01 — Overflow

Overflow is a closed axis over `scroll-y`, `scroll-x`, `scroll-auto`, `clip`, `hidden`, and
`overflow-visible`.
`hidden` and `clip` are distinct intents: `hidden` establishes a clipping scroll container
(programmatic scrolling remains possible, and `text-overflow` requires it); `clip` forbids
scrolling entirely. `overflow-visible` is the release endpoint for scoped overrides that need to
undo an authored clipping word. The whole-axis words conflict with per-axis scroll dials.

→ rationale: RAT:R-OVERFLOW-01 · history: ADR-0013, ADR-0049 · code: src/registry.ts#LAYOUT

## R-CONSTRAINT-01 — Independent bounds

Minimum and maximum width and height are four independent parametric sub-dials. A min and max on
the same dimension form a composable band; two values on one dial conflict. The min dials carry a
fixed `none` endpoint (`min-width-none`, `min-height-none`): no minimum at all, escaping the
automatic min-content floor a flex or grid item otherwise keeps. The max-width dial also carries
the fixed endpoint `max-width-none`: no cap at all, escaping an inherited or recipe-imposed inline
measure. The interior of each dial stays scale-bound; endpoints are words (the R-SKIN-06 endpoint
pattern). Other max-dial endpoints are reserved pending evidence.

→ rationale: RAT:R-CONSTRAINT-01 · history: ADR-0004, ADR-0015, ADR-0040 · code: src/registry.ts#LAYOUT

## R-SIZE-01 — Fill

An element may span 100% of its container along an axis: `fill` sets both, `fill-inline` the
inline axis, `fill-block` the block axis (whole-axis form conflicts with a per-axis dial; the two
dials compose). This is a **relational** metric — the value is the proportion 100%, so it reads no
theme socket. It is distinct from flex growth (`grow-1`/`expandable`), which fills a flex
container's main axis by distribution; `fill` is the explicit self-size case, and its relatum is
the container. Viewport-relative fill (`100vh`) and fractional sizes (`half`, `third`) are the
family members reserved pending evidence.

→ rationale: RAT:R-SIZE-01 · history: ADR-0024 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-02 — Aspect

An element's two dimensions may be related by a fixed ratio: `square` sets a 1:1 aspect ratio.
Like `fill` this is a **relational** metric — the value is the proportion between the element's
own width and height (the self relatum), so it reads no theme socket. Further ratios (`wide`
16:9, and arbitrary ratios) are the family members reserved pending evidence.

→ rationale: RAT:R-SIZE-02 · history: ADR-0025 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-03 — Cover

An element may attach to all four edges of its containing block: `cover` sets `inset: 0`.
Like `fill`, this is a container-relatum relational metric with no theme socket. It is not a
position mode and does not imply `position:absolute` or `position:fixed`; those remain authored
with the `position-mode` axis. `cover` only names the all-edge relation once a containing block
and positioned element already exist.

→ rationale: RAT:R-SIZE-03 · history: ADR-0026 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-04 — Push

An element may consume available inline-start free space with an automatic margin: `push` sets
`margin-inline-start: auto`. This is a relational metric with no theme socket: the margin is not a
spacing step, but the remaining available inline space in the current formatting context. `push`
does not imply flex, grid, flow, or container alignment; those remain authored by their own axes.

→ rationale: RAT:R-SIZE-04 · history: ADR-0027 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-05 — Hug Inline

An element may size its inline axis from its contents: `hug-inline` sets
`inline-size: fit-content`. This is a relational metric with no theme socket; the used value is
resolved from intrinsic content size and the available inline space, not from the spacing or size
scale. It shares the explicit self-size dial with `fill-inline`, so the two conflict; `hug-inline`
may still compose with `fill-block`.

→ rationale: RAT:R-SIZE-05 · history: ADR-0028 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-06 — Positioned Centering

A positioned element may align one of its centers with the containing block's matching midpoint:
`center-x` sets `left: 50%` and `transform: translateX(-50%)`; `center-y` sets `top: 50%` and
`transform: translateY(-50%)`. These are relational metrics with no theme socket: the midpoint
and compensation are resolved from the element and its containing block. They do not imply
`position:absolute` or `position:fixed`. Because both members write `transform`, they are exclusive
until a tuple transform composition rule is admitted.

→ rationale: RAT:R-SIZE-06 · history: ADR-0029, ADR-0030 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-07 — Flow Centering And Block Flush

A normal-flow block may center itself in the available inline space with automatic inline margins:
`centered` sets `margin-inline: auto`. The block-axis reset is a separate word:
`flush-block` sets `margin-block: 0`. Together, `centered flush-block` reproduces the common
`margin: 0 auto` idiom without making centering erase block-axis spacing or making a reset imply
centering. Both words are logical-property declarations, relational/socket-free, and do not imply
flex, grid, width constraints, text alignment, or positioned centering.

→ rationale: RAT:R-SIZE-07 · history: ADR-0031 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-08 — Viewport fill

A full-height page shell may be at least a viewport tall while still growing with its content:
`fill-viewport` sets a block-axis minimum of one viewport (`min-block-size: 100vh`). Its relatum
is the viewport, distinct from container `fill` (100% of the parent) and self `hug`; it is a
relational metric and reads no socket. It is a *minimum*, not a `fill` dial, so content taller
than the viewport still scrolls rather than clipping. The dynamic-viewport variant (`dvh`) and an
inline viewport extent are reserved pending evidence.

→ rationale: RAT:R-SIZE-08 · history: ADR-0033 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-09 — Control size

An interactive control or icon box may take a physical square from the shared spacing scale:
`control-size-<spacing>` sets both `inline-size` and `block-size` to
`var(--spacing-<spacing>)`. This is not the relational `square` aspect word; it is a
scale-bound control affordance size. It does not imply display, alignment, padding, icon glyph
size, or border radius, and it remains separate from the layout size scale used by constraints
and exact flex basis.

→ rationale: RAT:R-SIZE-09 · history: ADR-0041 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-10 — Positioned Edge Attachment

A positioned element may attach one of its edges to an anchor edge: `attach-below` sets
`top: 100%`; `attach-above` sets `bottom: 100%`; `stretch-inline` sets `left: 0` and `right: 0`.
These are relational metrics with no theme socket: the percentages and zero edge pins are resolved
against the containing block, not a project scale. They do not imply `position:absolute` or
`position:fixed`, and they do not admit arbitrary offsets. Edge footprints compose only when their
physical slots do not overlap; `attach-below stretch-inline` is valid, while centering and an edge
pin on the same slot conflict.

→ rationale: RAT:R-SIZE-10 · history: ADR-0045 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-SIZE-11 — Role-measured dimensions

Some dimensions are neither arbitrary component constants nor members of the generic layout size
scale. They are recurring role measures: dialog bounds, popover widths, result-list caps, editor
minimums, and control/icon chrome. These use role-specific words and sockets rather than expanding
`--size-*` into a mixed ladder.

The explicit self-size axis admits `dialog-measure`, `width-popover-<step>`,
`control-box-<step>`, `control-inline-<step>`, `control-block-<step>`, `separator-mark-<step>`,
plus the observed reset endpoints `width-auto` and `height-none`. Whole-box role words own both
inline and block footprints; per-axis role words compose only when their footprints are disjoint.

The constraint axis admits role-bound bounds: `min-width-popover-<step>`,
`max-width-popover-<step>`, `max-width-command`, `min-width-control-<step>`,
`min-height-control-<step>`, `min-height-editor`, and `max-height-results-<step>`. These remain
min/max bounds, so min and max bands compose while two values on the same bound conflict.

→ rationale: RAT:R-SIZE-11 · history: ADR-0047 · code: src/registry.ts#LAYOUT, src/emit.ts#emit

## R-TYPE-01 — Type belongs to skin

Type is not layout grammar. Font size and line height are generative-proportional skin; typeface and
weight are connotative skin. Layout reads content size as an input but does not own type.

→ rationale: RAT:R-TYPE-01 · history: ADR-0002 · code: src/registry.ts#SKIN

## R-STATE-01 — State is condition only

A state class names when a rule applies and must not carry skin or layout effects. State composes
with a plane to form a rule.

→ rationale: RAT:R-STATE-01 · history: ADR-0002 · code: src/registry.ts#STATE

## R-STATE-02 — Three arities

Every state has binary, enumerated, or continuous arity. Enumerated values form a closed exclusive
set; continuous values are normalized input values.

→ rationale: RAT:R-STATE-02 · history: ADR-0003 · code: src/registry.ts#Arity

## R-STATE-03 — Three drivers

Every state is interaction-driven, input-driven, or environmental-driven. Responsive conditions and
user preferences are environmental state drivers, not a fifth grammar sibling.

→ rationale: RAT:R-STATE-03 · history: ADR-0003 · code: src/registry.ts#Driver

## R-STATE-04 — State inclusion boundary

A platform attribute is a grammar state only when it names a condition under which a visual rule
should differ, is read rather than asserted as a relationship, and has a perceptual consequence.
Wiring, positional counts, and announcement scheduling are outside the state grammar.

→ rationale: RAT:R-STATE-04 · history: ADR-0003

## R-STATE-05 — Platform backing entailment

A visual state instance requires its ARIA, DOM, or CSS truth. State capability and conditioned skin
entail nothing. State instances check backing on self; state-relational members check backing on the
container.

→ rationale: RAT:R-STATE-05 · history: ADR-0003 · code: src/lint.ts#p8_stateEntailment, src/lint.ts#p8b_relationalEntailment

## R-STATE-06 — Mirrored closed vocabulary

The state vocabulary is the closed union of admitted ARIA states and CSS UI pseudo-classes, grouped
by independent state axes. New members enter only when the platform adds a state and the inclusion
boundary admits it.

→ rationale: RAT:R-STATE-06 · history: ADR-0003 · code: src/registry.ts#STATE

## R-STATE-07 — Environmental prefix syntax

Environmental state is a condition scope expressed as a variant prefix, not a bare class word.
Interaction and input states remain bare. Environmental prefixes form a closed validated set and
partition one-word-per-axis checking by scope.

→ rationale: RAT:R-STATE-07 · history: ADR-0004 · code: src/registry.ts#ENVIRONMENT_SCOPES, src/lint.ts#parseWord

## R-STATE-08 — Distributed and local states

States are element-local by default. Capabilities such as `selectable` distribute potential to
members; relational state asserts one member's current state from the container.

→ rationale: RAT:R-STATE-08 · history: ADR-0003

## R-STATE-09 — Event-triggered override

An event-triggered (state-conditioned) declaration may override a base declaration on a shared
property; the condition scopes the override, so it is a sanctioned share under LAW-3, not a
collision. An unconditional claim on a property stays exclusive. Contention among multiple
event-triggered declarations on the same property is out of scope — the cascade decides, and it
is the author's responsibility.

→ rationale: RAT:R-STATE-09 · history: ADR-0006 · code: src/emit.ts#checkDimensionalPurity

## R-STATE-10 — Platform-condition skin prefix

A conditioned-skin override triggered by a platform interaction condition — hover, active, focus,
disabled — is written as a variant prefix on the skin word (`hover:ground-subtle`), the same syntax
as an environmental scope (R-STATE-07) and licensed as an override by R-STATE-09. These prefixes form
a closed validated set. The platform supplies the condition, so no backing is required — the seam
with application-asserted states (selected, checked, pressed), which keep a backed capability path
(R-STATE-08). This refines R-STATE-07: an interaction state stays bare as a predicate, but takes
the prefix form when it scopes conditioned skin. `disabled` is platform-backed form state; its prefix
serializes to `:disabled`.

→ rationale: RAT:R-STATE-10 · history: ADR-0007, ADR-0021 · code: src/registry.ts#INTERACTION_SCOPES, src/lint.ts#parseWord

## R-STATE-11 — Backed condition prefix

An application-asserted state — selected, checked, pressed — scopes a conditioned-skin override as a
variant prefix (`selected:ground-defined`), the same shape as the platform-condition prefix
(R-STATE-10) and licensed as an override by R-STATE-09. Unlike a platform condition it must be
backed: the element carries the capability for that state (`selectable` for selected/checked,
`pressable` for pressed) and the application asserts the state (R-STATE-08), which the linter
verifies — an unbacked prefix is an error. It serializes to the backing attribute selector
(`[aria-selected="true"]`, `[aria-checked="true"]`, or `[aria-pressed="true"]`), not a
pseudo-class. Composing carrier words under the state supersedes fixed selection-treatment levels
or component CSS that could express neither a project's own state hue nor a border it drew with
`border-color` rather than `outline`.

→ rationale: RAT:R-STATE-11 · history: ADR-0008, ADR-0051 · code: src/registry.ts#STATE_SCOPES, src/lint.ts#parseWord

## R-STATE-12 — Attribute-backed condition prefix

An application-asserted state whose backing lives on the element itself — currently `current`,
backed by `aria-current`, and `expanded`, backed by `aria-expanded` — scopes a conditioned-skin
override as a variant prefix (`current:ink-accent`, `expanded:ground-defined`), the
R-STATE-10/11 shape. It differs from R-STATE-11 in how backing is verified: there is no capability
word, because the assertion contract is the attribute the element carries, not a container's
distributed state. The linter cannot see markup attributes, and does not need to — the override
serializes to the backing attribute selector (`[aria-current]:not([aria-current="false"])` or
`[aria-expanded="true"]`), so an element the application never marked with the state can never
match. The set is closed and validated; `current` and `expanded` are admitted on evidence.

→ rationale: RAT:R-STATE-12 · history: ADR-0009, ADR-0052 · code: src/registry.ts#STATE_SCOPES, src/css.ts#buildStylesheet

## R-STATE-13 — Relational condition prefix

An ancestor's state may scope a descendant's conditioned skin: `parent-hover:` and
`parent-selected:` are variant prefixes in the R-STATE-10/11 shape whose condition lives on an
ancestor rather than the element itself. The backing is R-STATE-08's distributed contract read
from below: the ancestor must carry the `selectable` capability — the linter verifies it through
parent context where available — and serialization compounds the ancestor
(`.selectable:hover .parent-hover\:word`, `.selectable[aria-selected="true"] .parent-selected\:word`),
so an unmarked ancestor can never fire the override. A naked relational condition
(`*:hover descendant`) is unexpressible by design: hover propagates through every ancestor, and
only the capability word bounds which one speaks. The set is closed and validated; further
relational members are reserved pending evidence.

→ rationale: RAT:R-STATE-13 · history: ADR-0018 · code: src/registry.ts#RELATIONAL_SCOPES, src/css.ts#buildStylesheet

## R-MOTION-01 — Closed motion grammar

Motion axes have closed grammar vocabularies. Duration, delay, and stagger are open external skin
scales, not motion-axis members.

→ rationale: RAT:R-MOTION-01 · history: ADR-0002 · code: src/registry.ts#MOTION

## R-MOTION-02 — Micro atom and macro operation

A micro edge is the motion atom. A macro is a container operation coordinating micro edges through
stagger and closed choreography. Macro is not a second kind of motion.

→ rationale: RAT:R-MOTION-02 · history: ADR-0002 · code: src/registry.ts#MOTION

## R-MOTION-03 — Additive stagger

Macro stagger must not emit raw `transition-delay`. It emits `--stagger`, which combines additively
with a member's own delay.

→ rationale: RAT:R-MOTION-03 · history: ADR-0003 · code: src/emit.ts#checkDimensionalPurity

## R-MOTION-04 — Closed easing vocabulary

Easing is a closed vocabulary over `decelerate`, `accelerate`, `standard`, and `emphasized`. New
curves enter only if the animation discipline names one.

→ rationale: RAT:R-MOTION-04 · history: ADR-0002 · code: src/registry.ts#MOTION

## R-MOTION-05 — Driver belongs to state

The input source driving an edge is a state concern, not a motion parameter. Discrete state produces
time-driven motion; continuous state supplies motion progress.

→ rationale: RAT:R-MOTION-05 · history: ADR-0002

## R-MOTION-06 — Reduced motion is state

`prefers-reduced-motion` is an environmental condition in the state grammar and conditions a motion
change. It is not a motion member.

→ rationale: RAT:R-MOTION-06 · history: ADR-0002

## R-MOTION-07 — Effect atoms

A named effect is a closed tween: the interpolated property and its target are baked into a
motion-substrate `@keyframes` block, and the word emits only `animation`. The library is closed —
`shake` is admitted; `flash`, `pulse`, `bounce`, `spin` are reserved and enter only when an
application authors one. The substrate block ships with the stylesheet only when its atom is used.

→ rationale: RAT:R-MOTION-07 · history: ADR-0038 · code: src/registry.ts#MOTION, src/emit.ts#EFFECT_KEYFRAMES, src/css.ts#buildStylesheet

## R-MOTION-08 — Open tween envelope

An open tween envelopes a state-driven change; the state supplies the target value and the tween
supplies the temporal envelope. Duration is a named theme-bound scale with admitted steps `quick`
and `settled`, read as `--duration-quick` and `--duration-settled`. The open tween emits transition
longhands (`transition-property`, `transition-duration`) rather than the `transition` shorthand, so
closed easing words compose without source-order resets. The first admitted property target is
`all`.

→ rationale: RAT:R-MOTION-08 · history: ADR-0039 · code: src/registry.ts#MOTION, src/emit.ts#emit, src/registry.ts#SKIN_PLANE

## R-MOTION-09 — Targeted tween envelopes

Repeated UI feedback may narrow the open tween's `transition-property` target while keeping the
same duration scale. Bare `tween-<duration>` remains the universal `all` target. Targeted forms
name the carrier/presence properties that actually animate: `tween-ground-*`, `tween-ink-*`,
`tween-rule-*`, `tween-ground-ink-*`, `tween-opacity-ground-*`,
`tween-opacity-ground-ink-*`, and `tween-opacity-transform-*`. A targeted tween is still one tween
envelope, not a second composable dial, so it conflicts with any other `tween-*` word on the same
element and scope.

→ rationale: RAT:R-MOTION-09 · history: ADR-0044 · code: src/registry.ts#MOTION, src/emit.ts#emit

## R-LAYER-01 — Tier-two named scale

The named z-scale is closed, never accepts raw integers, and governs only the tier-two in-page
middle within an isolated stacking context. Tier-one surface names are not z-scale members.

→ rationale: RAT:R-LAYER-01 · history: ADR-0004 · code: src/registry.ts#LAYERING

## R-LAYER-02 — Three layering tiers

Above-everything surfaces use the platform top layer. Structured in-page depth uses the named z-scale
inside isolation. Unknown-host deployment may use one quarantined body-root boundary constant.

→ rationale: RAT:R-LAYER-02 · history: ADR-0002 · code: src/registry.ts#LAYERING

## R-LAYER-03 — Top-layer mechanism set

`overlay`, `modal`, `popover`, and `toast` form a closed exclusive top-layer-mechanism set. The set is
not ordered and emits no `z-index`; runtime opening supplies the ordering.

→ rationale: RAT:R-LAYER-03 · history: ADR-0004 · code: src/registry.ts#LAYERING

## R-LAYER-04 — Declarative boundary

Querying what is currently on top and placing above it is outside grammar scope and requires runtime
code. Consumers route such needs to top-layer promotion or JavaScript, never a coined CSS mechanism.

→ rationale: RAT:R-LAYER-04 · history: ADR-0002

## R-LAYER-05 — Open tier-two values

The exact tier-two member list, ranges, surface spellings, and host-boundary value remain open. They
must not be guessed. The three-tier structure and declarative/runtime boundary are frozen.

→ rationale: RAT:R-LAYER-05 · history: unrecorded

## R-SKIN-01 — Grammar/theme seam

Skin is an interface and a theme is an implementation. Fixed words own their values, scale-bound
words own stable step names while themes own numbers, and fully open sockets leave vocabulary and
values to the theme.

→ rationale: RAT:R-SKIN-01 · history: ADR-0002 · code: src/registry.ts#SKIN

## R-SKIN-02 — Delimiter default

A sub-element's rectangle is delimited only by carrying a delimiter facet (ground, rule, or
corner); the undelimited state (flush) is the unnamed default. Ground, rule, corner, and
shadow are facets of one delimiter, not independent axes. A corner word without another
delimiter facet is a lint warning, except identity clipping of the element's own content.

→ rationale: RAT:R-SKIN-02 · history: ADR-0005

## R-SKIN-03 — Color carriers and composition

Color is authored as `<carrier>[-<role>][-<intensity>]`. The carriers are ink (owns color),
ground (owns background), and rule (owns border-color); each anchors a default hue and full
intensity, both unnamed. The role slot overrides the hue; the intensity slot overrides
prominence. A role never stands alone — it rides a carrier — so it cannot collide with a
property owner.

→ rationale: RAT:R-SKIN-03 · history: ADR-0005

## R-SKIN-04 — Intensity ramp

Intensity recedes from the unnamed full anchor through `soft`, `muted`, `faint`. The step
count is four provisionally; it may reduce toward three if evidence shows `soft` unused. The
theme owns realization (alpha or color-mix into ground); the grammar owns only the ordered
step names.

→ rationale: RAT:R-SKIN-04 · history: ADR-0005

## R-SKIN-05 — Color roles and the constrained palette

The interface color roles are `accent` (brand emphasis) and the status set `pass`, `warn`,
`fail`, `note` — a shared reporting register, not one ordered axis. `note` is kept distinct
from `accent` provisionally. Bare-role intensity is the full/solid color. The interface
palette is deliberately constrained; the data/graph color plane is a separate, versatile
concern and is out of scope for skin.

→ rationale: RAT:R-SKIN-05 · history: ADR-0005

## R-SKIN-06 — Corner

Corner is a radius magnitude over the theme radius scale. `corner-<step>` sets the whole box.
Side facets may set paired physical corners on the block edges: `corner-top-<step>` and
`corner-bottom-<step>` round only that side. Side facets also admit the `none` endpoint
(`corner-top-none`, `corner-bottom-none`) for joined seams where rounding must be removed on one
edge. A whole-box corner conflicts with any side facet; top and bottom side facets compose.
Broad `corner-none`, individual physical-corner words, and shape kinds beyond radius magnitude are
reserved pending evidence.

→ rationale: RAT:R-SKIN-06 · history: ADR-0005, ADR-0046 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-07 — Typography namespace

`font` is a multi-property responsibility area with sibling composable facets — size
(scale-bound), weight (`medium semibold bold`), and typeface variant (`mono`) — each owning
a disjoint property so they compose. It is a peer of `ink` at the description level: ink
describes the marks' color, font their typographic character; neither's CSS-property count
is grammar-visible.

→ rationale: RAT:R-SKIN-07 · history: ADR-0005

## R-SKIN-08 — Theme plane

A theme is a project-owned, exhaustive binding of the registry's skin sockets, resolved
across the selected theme and the resolved light/dark mode. Ermine owns the socket names,
the completeness contract, the resolution interface, and a framework-free application
helper; the project owns palette values, selection, persistence, and framework glue. The
socket list is registry-defined; a theme may not invent unregistered sockets.

→ rationale: RAT:R-SKIN-08 · history: ADR-0005

## R-SKIN-09 — Elevation treatment

Elevation is a skin treatment with a closed set: `elevated` (cast shadow), admitted on evidence;
`recessed` (inset) is the family member reserved pending its own. The treatment owns `box-shadow`.
The word reads its like-named socket (`--shadow-elevated`) with an Ermine default geometry
composed on the standalone `shadow` colour socket, so the theme owns the numbers and the colour it
already binds — the seam R-SKIN-03's plane data anticipated ("shadow is the cast-shadow colour;
its geometry belongs to the elevation treatment") made normative. The treatment describes visual
depth on the skin plane; it is disjoint from the z-scale's stacking tiers (whose `raised` names an
order, not a look). Identity shadows — multi-layer signatures, blend-mode compositing, rings — are
not elevation and stay project-owned.

→ rationale: RAT:R-SKIN-09 · history: ADR-0010 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-10 — Recipes are project compositions

A recipe — a named bundle of carrier values, geometry, and conditioned states styling a component
kind (button, alert, card, input) — is not grammar vocabulary. A recipe word fails admission
twice: it names a thing, not a property choice, and its content is one project's design decisions,
not a general pattern. The grammar supplies what recipes are made of — carriers, treatments,
condition prefixes, capabilities — and a project recipe class is product identity whose discipline
is socket consumption: it draws every colour from theme sockets and may compose grammar words in
markup, but its bundle, its states, and its context overrides stay project-owned. The seam with
interaction affordance stays open: what makes an element button-*like* is a capability candidate
(GAP-U-interaction-affordance); what makes it *this* project's button is a recipe.

→ rationale: RAT:R-SKIN-10 · history: ADR-0011

## R-SKIN-11 — Line presence

A rule line's presence is a skin word, separate from its colour: `ruled` (all edges) and the
per-side forms (`ruled-top`, `ruled-bottom`, `ruled-left`, `ruled-right`) own
`border-width`/`border-style`, emitting a solid line at the theme's line weight
(`--rule-weight` socket, default `1px`). The `rule` carrier (R-SKIN-03) owns colour:
whole-box words (`rule`, `rule-accent`, etc.) own `border-color`, while physical edge colour
facets (`rule-top`, `rule-right`, `rule-bottom`, `rule-left`, with the same hue suffixes) own
one `border-*-color` longhand. Whole-box presence/colour aliases conflict with their edge
facets; disjoint edge facets compose. The only absence endpoint admitted here is edge-local
`rule-<edge>-transparent`, for reserved-line sentinels whose presence is positive and whose
visible colour is supplied by a state, for example
`ruled-bottom rule-bottom-transparent current:rule-bottom-accent`. No whole-box
`rule-transparent`, no negative presence word, and no pseudo-element line drawing is admitted.

→ rationale: RAT:R-SKIN-11 · history: ADR-0012, ADR-0048, ADR-0050 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-12 — Truncation treatment

Truncation is a treatment: `truncate` marks text that yields to its container on one line,
owning `text-overflow: ellipsis` and `white-space: nowrap`. It does not own overflow — the
treatment takes effect composed with the `hidden` overflow word (`hidden truncate`), the same
explicit-composition seam as `rule ruled`: two words, both facts visible in markup, ownership
disjoint. Releasing truncation under a state uses `text-wrap` for the text-flow half and
`overflow-visible` for the overflow half.
The multi-line clamp is admitted as `clamp-N` (ADR-0023): `clamp-3` limits to three lines,
then ellipsizes. It is named `clamp`, not the reserved `truncate-N`, because the number reads
as the retained-line limit, not an amount removed. Bare white-space treatments are admitted
on the same text-flow axis (ADR-0042): `text-nowrap` prevents soft wrapping without
ellipsis, and `text-pre-wrap` preserves authored line breaks and wrapping behavior. `clamp-N`,
`truncate`, `text-nowrap`, `text-pre-wrap`, and `text-wrap` are one axis (an element clamps,
truncates, prevents wrapping, preserves authored line breaks, or restores ordinary wrapping,
never more than one). The `-webkit-box`
clamp requires `display: -webkit-box`, a whole-display legacy value that overlaps the
structure/m1 display facet twin; the overlap is a sanctioned exclusion, not a composition -
a clamped text block is never a flex/grid container.

→ rationale: RAT:R-SKIN-12 · history: ADR-0013, ADR-0023, ADR-0042, ADR-0049 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-13 — Focus ring treatment

The focus indicator is a skin treatment that restyles the platform's own mechanism rather than
replacing it: `ring`, authored under the focus condition (`focus:ring`, R-STATE-10), owns
`outline` and `outline-offset`, reading the `--ring` socket with an Ermine default
(`2px solid var(--ground-defined)`). Because the treatment styles the outline itself, there is
nothing to suppress — the suppress-and-redraw pair (`outline: none` plus a box-shadow ring) that
RAT:R-STATE-10 names as the anti-pattern becomes inexpressible drift instead of a discipline.
Box-shadow rings are not `ring` (box-shadow belongs to elevation); status-tinted recipe rings
stay recipe identity (R-SKIN-10).

→ rationale: RAT:R-SKIN-13 · history: ADR-0014 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-14 — Text alignment facet

Inline-content alignment is a skin facet: `text-start` and `text-center` own `text-align` in
logical values (`text-end` is the family member reserved pending evidence). `text-start`
exists chiefly to restore natural alignment where the platform centres content (buttons).
Leading is deliberately not a facet: the base line-height belongs to the entry-point substrate
and the theme, and its deviations in the evidence are identity signatures, not scale steps —
so with alignment ruled here, the sampled skin-type gap axis retires and no gap axis remains.

→ rationale: RAT:R-SKIN-14 · history: ADR-0016 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-15 — Scrollbar prominence

A scroll region's scrollbar is a skin treatment on the platform's standard properties:
`scrollbar-subtle` owns `scrollbar-width` and `scrollbar-color`, emitting `thin` coloured by the
`--scrollbar-thumb` / `--scrollbar-track` sockets (defaults compose the `rule` carrier's socket
over a transparent track). `scrollbar-hidden` (width `none`) is the family member reserved
pending evidence. Engine-drawn scrollbars (`::-webkit-scrollbar` pseudo styling) are not the
treatment: they are project identity, and when both are present the platform itself prefers the
standard properties. The treatment names prominence, not geometry — a project wanting a drawn
scrollbar signature keeps it as identity.

→ rationale: RAT:R-SKIN-15 · history: ADR-0017 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-16 — Concealment, reveal, and alpha treatment

Concealment is a skin treatment owning `opacity`. `concealed` (opacity 0 — present for layout and
measurement, invisible) and `revealed` (opacity 1) remain the semantic endpoints used for
conditioned visibility: `concealed parent-hover:revealed parent-selected:revealed` (R-STATE-13).
Mid-scale opacity is expressed as bounded alpha words: `alpha-5` through `alpha-95`, in 5 percent
increments. The endpoints are not duplicated as `alpha-0` or `alpha-100`.

→ rationale: RAT:R-SKIN-16 · history: ADR-0018, ADR-0055 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-17 — Press affordance

The invitation to press is a skin treatment: `pressable` owns `cursor` (pointer). It declares
what the element invites — the read side of interaction — while behaviour (event wiring,
keyboard, focus management) stays JavaScript's: the inversion-of-control boundary. It is
deliberately not a state-plane capability, because capabilities condition and entail but
control nothing (P7-4d), and this affordance's substance is a painted property. A recipe may
still own its cursor inside its bundle (R-SKIN-10). Further affordance words (`draggable`,
`editable`, `expandable`) are the family, reserved pending their own evidence.

→ rationale: RAT:R-SKIN-17 · history: ADR-0019 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-18 — Tabular figures

Numbers may use fixed-width figures so digits align in columns: `tabular` sets
`font-variant-numeric: tabular-nums`. A type facet like size and weight (R-SKIN-07's family),
disjoint from them so it composes.

→ rationale: RAT:R-SKIN-18 · history: ADR-0036 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-19 — Overline label

The small-uppercase eyebrow treatment: `overline` sets `text-transform: uppercase` and tracks the
label via a treatment socket (`letter-spacing: var(--overline-tracking, 0.07em)`). It is the
label/eyebrow type role — a treatment, not a size or weight — and reads its tracking from the theme.

→ rationale: RAT:R-SKIN-19 · history: ADR-0037 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SKIN-20 — Text decoration treatment

Text line decoration is a skin treatment, not a link recipe. `underlined` owns
`text-decoration: underline`, `struck` owns `text-decoration: line-through`, and `undecorated`
owns `text-decoration: none`. The words name the reusable decoration state of text; they do not
decide when a component should look link-like. A link-button recipe can still choose
`undecorated hover:underlined`, while user-content descendants such as `u`, `s`, and `a` stay in
their prose/editor molecule unless the authored element itself can carry words.

→ rationale: RAT:R-SKIN-20 · history: ADR-0056 · code: src/registry.ts#SKIN, src/emit.ts#emit

## R-SCALE-01 — Generator-defined scales

A generative-proportional scale is the output of a declared generator, not a hand-listed value set.
The method governs spacing, radius, type, and motion magnitudes. The generator and its parameters are
late-bound skin. The layout size scale is a named closed token set for exact basis and constraint
steps; current admitted members are `sm`, `md`, `lg`, `xl`, and `2xl`.

→ rationale: RAT:R-SCALE-01 · history: ADR-0002, ADR-0030 · code: src/registry.ts#SCALES

## R-SCALE-02 — Measured generator slot

The specific generator remains open pending empirical measurement. Implementations must not guess
the function, base, or ratio; the slot may admit varying ratios and per-property-family results.

→ rationale: RAT:R-SCALE-02 · history: ADR-0002

## R-SCALE-03 — Scale-bound skin families

Radius, type size, motion duration, and motion stagger are scale-bound alongside spacing
(R-SCALE-01): the grammar owns stable step names, the theme owns the numbers, and the
generator and its parameters remain open (R-SCALE-02).

→ rationale: RAT:R-SCALE-03 · history: ADR-0005

## R-COMPILE-01 — Per-property scale compilation

The compile foundation is one generated class per property and density, each referencing the shared
scale. Full property name plus density word is the naming convention.

→ rationale: RAT:R-COMPILE-01 · history: ADR-0002 · code: src/emit.ts#emit

## R-COMPILE-02 — Runtime value channel retired

The runtime value channel is retired. Shared scale variables provide a single source without forcing
one rhythm value per element.

→ rationale: RAT:R-COMPILE-02 · history: ADR-0002

## R-COMPILE-03 — Flex resolution order

Flex resolution uses raw bases to compute free space, distributes grow or shrink, then repeatedly
clamps and freezes bound-violating items while redistributing. Minimum and maximum bounds do not
pre-clamp the distribution baseline.

→ rationale: RAT:R-COMPILE-03 · history: ADR-0002

## R-IMPL-01 — Deployment membership

The authored vocabulary remains unprefixed, but every deployment establishes membership. Shadow DOM
uses its boundary; light DOM uses an explicit adapter such as a prefix, cascade layer, attribute
scope, or mangling. Unprefixed light DOM without membership is unsupported.

→ rationale: RAT:R-IMPL-01 · history: ADR-0002

## R-IMPL-02 — Paragraph integrity

A class paragraph must be true or silent about every property: a word's declaration may be
overridden by a later cascade layer only as a declared decision. Project layers between
`grammar` and `overrides` must never shadow a property that a word on the same element carries —
an element takes a property from its recipe bundle *or* from a word, never both undeclared. A
sanctioned override lives in the `overrides` layer, where the layer name itself declares the
intent. All project CSS must be layered: the cascade ranks unlayered author styles above every
layer, so an unlayered stylesheet defeats words invisibly and sits outside the contract. The
reconciler verifies the invariant — an undeclared shadowed word is an error, because a defeated
word makes the markup lie, and the paragraph's authority is the system's value.

→ rationale: RAT:R-IMPL-02 · history: ADR-0020

## R-TEST-01 — Outcome testing

Tests cover rules and invariants rather than enumerating the configuration space. Negotiated outcome
tests use numerical results as canonical forms and exercise conservation, proportionality,
ratio-invariance, monotonicity, and order-equivariance in a real layout engine.

→ rationale: RAT:R-TEST-01 · history: unrecorded

## R-TEST-02 — Static dimensional-purity predicate

The static purity predicate checks self-consistency, free-axis disjointness, free-versus-negotiated
disjointness, and that state controls no effect properties. Only documented facet splits may share a
free property.

→ rationale: RAT:R-TEST-02 · history: ADR-0003 · code: src/emit.ts#checkDimensionalPurity
