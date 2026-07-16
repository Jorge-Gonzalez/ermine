// registry.ts — the machine-readable axis registry.
//
// SINGLE SOURCE OF TRUTH for the derived artifacts (the spec .md, the CSS, the
// lint tests). Extracted from constitution/ERMINE.md (the constitution); when this and
// the constitution disagree, the constitution wins — fix it there, re-extract here.
//
// This file answers the review's structural findings at the data level:
//  - state GROUPS are first-class axes (id `state.<group>`), so "one word per axis"
//    (P1) is naturally enforceable: conflict within a group, compose across groups.
//  - every axis separates the conceptual `valueSpace` (the scale/word set) from the
//    emitted `tokens` (regexes that match REAL authored class strings).
//  - the z-scale (tier-2) and the top-layer-mechanism set (tier-1) are DIFFERENT
//    axes; `modal` is never a z rung.
//  - `basis-exact-*` is token-indexed over the R-SCALE-01 size scale, not raw px.
//  - environmental state is a SCOPE PREFIX, not a bare member; parsing yields a
//    `scope`, and P1 runs per-scope (Law 2, amended).

// ============================================================================
// SCALES — named value sets referenced by multiple axes (single-sourced).
// Values themselves are R-SCALE-01 generator output (FROZEN as slots); the linter only
// needs the STEP NAMES, which are stable. Swapping the generator does not change
// these names, so the grammar surface is stable even though the numbers are open.
// ============================================================================

// implements: R-SPACE-02, R-DENSITY-01, R-DENSITY-04, R-SCALE-01
export const SCALES = {
  spacing: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"], // R-DENSITY-01 T-shirt spacing scale (density words retired → aliases)
  size: ["sm", "md", "lg", "xl", "2xl"], // R-SCALE-01 size scale — basis-exact-<step>, constraints
  control: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"], // R-SIZE-11 role scale — control/icon boxes, not layout measures
  popover: ["sm", "md", "lg", "xl", "2xl"], // R-SIZE-11 role scale — overlay/popover measures
  resultCap: ["sm", "md"], // R-SIZE-11 role scale — scrollable result block caps
  breakpoint: ["sm", "md", "lg", "xl"], // R-SCALE-01-style named breakpoint scale
  zTier2: ["base", "content", "raised", "dropdown", "sticky", "tooltip"],
  duration: ["quick", "settled"], // R-MOTION-08 named temporal scale — values remain theme-bound
} as const;

const TWEEN_TARGETS = ["ground", "ink", "rule", "ground-ink", "opacity-ground", "opacity-ground-ink", "opacity-transform"] as const;
const TWEEN_WORDS = [
  ...SCALES.duration.map((duration) => `tween-${duration}`),
  ...TWEEN_TARGETS.flatMap((target) => SCALES.duration.map((duration) => `tween-${target}-${duration}`)),
] as const;

// ============================================================================
// TYPES — the schema definitions moved to the vocabulary-independent engine
// (B1, engine/types.ts). The aliases below keep this file the doc system's
// citation surface and every existing consumer's import surface; the axis DATA
// stays here and nowhere near the engine.
// ============================================================================

import type {
  Alias as EngineAlias,
  Arity as EngineArity,
  AxisRecord as EngineAxisRecord,
  Driver as EngineDriver,
  Regime as EngineRegime,
  Role as EngineRole,
  ScopePrefix as EngineScopePrefix,
  Signature as EngineSignature,
  StateCategory as EngineStateCategory,
  StateMember as EngineStateMember,
  Token as EngineToken,
  Vocabulary as EngineVocabulary,
} from "../engine/types.ts";

export type Sibling = "layout" | "state" | "motion" | "layering" | "skin";
// implements: R-ROLE-01
export type Role = EngineRole;
// implements: R-AXIS-01
export type Signature = EngineSignature;
// implements: R-VOCAB-01
export type Vocabulary = EngineVocabulary;
export type Regime = EngineRegime;

// state-only refinements
export type StateCategory = EngineStateCategory;
// implements: R-STATE-02
export type Arity = EngineArity;
// implements: R-STATE-03
export type Driver = EngineDriver;

// A `token` is what the linter actually matches against an authored word.
export type Token = EngineToken;

// A state member inside a state-group axis.
export type StateMember = EngineStateMember;

// A whole-axis alias: a single word that names a COMPLETE value of the axis
// (it fixes every sub-dial at once). Mutually exclusive with every other word on
// the axis — including the parametric forms and other aliases. This is the m2
// "corner" mechanism: `elastic` = grow-1 + shrink-1, a whole-axis value, so it
// cannot combine with `grow-2` or `shrink-0`. (R-M2-01)
// implements: R-M2-01
export type Alias = EngineAlias;

// implements: LAW-1
export type AxisRecord = EngineAxisRecord;

// helper: build a spacing-token regex for a property prefix
const spacingToken = (prefix: string): Token => ({
  pattern: new RegExp(`^${prefix}-(${SCALES.spacing.join("|")})$`),
  shape: `${prefix}-<spacing>`,
  valueDomain: "spacing-step",
});
const spacingEdgeToken = (prefix: string): Token => ({
  pattern: new RegExp(`^${prefix}-(top|right|bottom|left)-(${SCALES.spacing.join("|")})$`),
  shape: `${prefix}-<edge>-<spacing>`,
  valueDomain: "spacing-step",
});
const spacingDialFootprint = (dial: string): readonly string[] => {
  if (dial === "inline") return ["left", "right"];
  if (dial === "block") return ["top", "bottom"];
  return [dial];
};

const GRID_PARENT_WORDS = ["grid", "columns-12", "subgrid", ...SCALES.size.map((size) => `grid-fit-${size}`)] as const;
const INTENT_PROPORTION_WORDS = ["half", "third", "quarter", "two-thirds", "three-quarters", "sixth"] as const;
const GRID_PLACEMENT_WORDS = ["span", "row-span", "span-all", ...INTENT_PROPORTION_WORDS] as const;

// ============================================================================
// 4.1 LAYOUT
// ============================================================================

// implements: R-STRUCTURE-01, R-M2-02, R-M2-03, R-M3-01, R-M3-02, R-M4-01, R-M5-01, R-PADDING-01, R-ALIGN-01, R-DIVIDER-01, R-WRAP-01, R-OVERFLOW-01, R-CONSTRAINT-01, R-SIZE-01, R-SIZE-02, R-SIZE-03
export const LAYOUT: AxisRecord[] = [
  {
    axis: "structure",
    sibling: "layout", role: "container", signature: "container-operation",
    vocabulary: "closed", regime: "free",
    // `rows` retired (compose-don't-coin, R-STRUCTURE-01): it was `horizontal` + `wrap-allowed`,
    // and it smuggled flex-wrap — which the `wrapping` axis owns — into an axis whose
    // mandate is inner-display-type (+ direction) only. The collision was latent (P7
    // missed it only because `wrapping` had no emission entry yet).
    valueSpace: ["horizontal", "vertical", "grid", "grid-fit-<size>", "columns-12", "subgrid"],
    tokens: [
      { pattern: /^(horizontal|vertical|grid|subgrid)$/, shape: "<structure>" },
      { pattern: /^columns-12$/, shape: "columns-12" },
      { pattern: new RegExp(`^grid-fit-(${SCALES.size.join("|")})$`), shape: "grid-fit-<size>", valueDomain: "size-step" },
      { pattern: /^grid-fit-.+$/, shape: "grid-fit-<bad>", valueDomain: "size-step", fallback: true },
    ],
    parametricMembers: ["grid-fit"],
    default: "flow", // unmarked inner display; `flow` reserved for default, never a member
    controls: ["display.inner", "flex-direction", "grid-template-columns", "grid-auto-flow"],
    mustNeverTouch: ["gap", "padding", "margin", "align-self", "flex", "flex-wrap", "background", "border", "display.outer"],
    parentRequirements: [{
      parentAxis: "structure",
      parentWords: GRID_PARENT_WORDS,
      words: ["subgrid"],
      level: "error",
      rule: "parent-grid-context",
      msg: (word, parents) => `'${word}' requires a grid parent carrying one of {${parents.join(", ")}}.`,
    }],
    notes: "`grid-fit-<size>` is a grid structure variant: first track fit-content(var(--size-<size>)), second track 1fr. It replaces, not composes with, plain `grid` because both choose the inner display/grid-template shape.",
  },
  {
    axis: "m1-flow-participation",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["inline", "boxed", "boxed-inline"],
    tokens: [{ pattern: /^(inline|boxed|boxed-inline)$/, shape: "<flow-participation>" }],
    default: "natural",
    controls: ["display.outer"],
    mustNeverTouch: ["gap", "padding", "background"],
    notes: "surface names provisional (alias-law, guide-level). OUTCOME CONSTRAINT (browser-verified, demo/test): the outer display is INERT on a flex/grid ITEM — CSS blockifies a flex/grid item's outer display, so `inline`/`boxed-inline` are no-ops on a child of a flex/grid container. Enforced by lint WARNING P11 (`flow-participation-inert`, lint.ts), which reads the parent's classes from LintContext. Not a property collision, so P7 can't see it — it needs parent context.",
    // P11 as declared data (B1, R-M1-01): the outcome constraint above, in the form the
    // engine consumes. The parent is a flex/grid container iff it carries any `structure`
    // word (all of horizontal/vertical/grid produce flex/grid inner display); `boxed`
    // (block outer) is unaffected.
    parentInertness: {
      parentAxis: "structure",
      inertWords: ["inline", "boxed-inline"],
      level: "warn",
      rule: "flow-participation-inert",
      msg: (word: string) =>
        `'${word}' sets an inline outer display, but this element is a flex/grid item — CSS blockifies the outer display, so '${word}' is a no-op here. Drop it, or make the parent a flow container.`,
    },
  },
  {
    axis: "m2-flex",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "negotiated",
    // two independent open dials (grow, shrink) + whole-axis alias corners.
    valueSpace: ["grow-N", "shrink-N", "rigid", "compressible", "expandable", "elastic"],
    tokens: [
      { pattern: /^(grow|shrink)-(\d+)$/, shape: "grow-N | shrink-N", valueDomain: "integer-≥0" },
      { pattern: /^(rigid|compressible|expandable|elastic)$/, shape: "<flex-corner alias>" },
      { pattern: /^(grow|shrink)-.+$/, shape: "grow-<bad> | shrink-<bad>", valueDomain: "integer-≥0", fallback: true },
    ],
    subDials: ["grow", "shrink"],
    dialOf: (word: string) => word.startsWith("grow-") ? "grow" : word.startsWith("shrink-") ? "shrink" : null,
    aliases: [
      { word: "rigid", expands: "grow-0 shrink-0" },
      { word: "compressible", expands: "grow-0 shrink-1" },
      { word: "expandable", expands: "grow-1 shrink-0" },
      { word: "elastic", expands: "grow-1 shrink-1" },
    ],
    default: "compressible",
    // EMISSION: longhands only. `grow-N` -> flex-grow:N (only); `shrink-N` -> flex-shrink:N (only);
    // an alias writes BOTH longhands. NEVER emit the `flex` shorthand (it resets all three
    // sub-properties incl. flex-basis — a manufactured cross-property collision). The single
    // invariant (no property written by two co-present classes, at longhand granularity) is what
    // makes dials compose and aliases mutually-exclusive-with-dials.
    controls: ["flex-grow", "flex-shrink"],
    mustNeverTouch: ["flex-basis", "min-width", "max-width", "gap", "align-self", "flex"],
    notes: "open axis, two independent longhand dials grow-N (flex-grow) / shrink-N (flex-shrink) — compose one-per-dial (`grow-2 shrink-1`). The 4 corners are WHOLE-AXIS aliases writing BOTH longhands, so an alias conflicts with any other m2 word (`expandable shrink-2`, `rigid grow-2`). Per-dial default = CSS initial: an unspecified dial keeps flex-grow:0 / flex-shrink:1, so `grow-2` is NOT grow-only (it grows AND shrinks); grow-only at weight 2 is `grow-2 shrink-0`.",
  },
  {
    axis: "m3-self-size",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "negotiated",
    // closed membership {content, ratio, exact}; `exact` is a PARAMETRIC member
    // carrying a size value — `open` at member scope, same as enumerated states.
    valueSpace: ["basis-content", "basis-ratio", "basis-exact-<size>"],
    tokens: [
      { pattern: /^(basis-content|basis-ratio)$/, shape: "basis-content | basis-ratio" },
      { pattern: new RegExp(`^basis-exact-(${SCALES.size.join("|")})$`), shape: "basis-exact-<size>", valueDomain: "size-step" },
      { pattern: /^basis-exact-.+$/, shape: "basis-exact-<bad>", valueDomain: "size-step", fallback: true },
    ],
    parametricMembers: ["basis-exact"],
    default: "basis-content",
    controls: ["flex-basis"], // NOT align-self (collision-2 correction)
    mustNeverTouch: ["flex-grow", "flex-shrink", "min-width", "max-width", "align-self"],
    notes: "closed-with-parametric-member: membership is closed {content, ratio, exact}; `exact` carries a token-indexed size value (arbitrary lengths OUT in v0). Same member-level mechanism as the enumerated states — NOT open at axis scope.",
  },
  {
    axis: "m4-self-alignment",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["self-start", "self-center", "self-end", "self-stretch", "self-baseline"],
    tokens: [{ pattern: /^self-(start|center|end|stretch|baseline)$/, shape: "self-<align>" }],
    default: "inherit-group",
    controls: ["align-self"],
    mustNeverTouch: ["align-items", "justify-content", "gap"],
  },
  {
    axis: "m5-grid-placement",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    // closed membership {span, row-span, span-all}; span/row-span are PARAMETRIC
    // members (carry an integer); span-all is a CONTEXTUAL member (resolves to the
    // grid's column count, like grid-column: 1 / -1) — not a value of span-N.
    valueSpace: ["span-N", "row-span-N", "span-all", "half", "third", "quarter", "two-thirds", "three-quarters", "sixth"],
    tokens: [
      { pattern: /^(span|row-span)-(\d+)$/, shape: "span-N | row-span-N", valueDomain: "integer-≥0" },
      { pattern: /^span-all$/, shape: "span-all (contextual)" },
      { pattern: /^(half|third|quarter|two-thirds|three-quarters|sixth)$/, shape: "<intent-proportion>" },
      { pattern: /^(span|row-span)-.+$/, shape: "span-<bad> | row-span-<bad>", valueDomain: "integer-≥0", fallback: true },
    ],
    parametricMembers: ["span", "row-span"],
    default: "auto-place",
    controls: ["grid-column", "grid-row"],
    mustNeverTouch: ["align-self", "flex", "gap"],
    parentRequirements: [
      {
        parentAxis: "structure",
        parentWords: GRID_PARENT_WORDS,
        words: GRID_PLACEMENT_WORDS,
        level: "error",
        rule: "parent-grid-context",
        msg: (word, parents) => `'${word}' requires a grid parent carrying one of {${parents.join(", ")}}.`,
      },
      {
        parentAxis: "structure",
        parentWords: ["columns-12"],
        words: INTENT_PROPORTION_WORDS,
        level: "error",
        rule: "parent-columns-12-context",
        msg: (word) => `'${word}' is an intent proportion over the ruled columns-12 grid; the parent must carry 'columns-12'.`,
      },
    ],
    notes: "closed-with-parametric-member: membership {span, row-span, span-all} plus the intent-proportions (half/third/quarter/two-thirds/three-quarters/sixth). span/row-span carry integers; span-all is contextual. The intent-proportions are the readable form of a column span over the ruled `columns-12` grid (R-M5-02): `third` = span 4, `quarter` = span 3, etc. — the number lands on an integer track only because 12 is the chosen grain. They emit `grid-column: span N` and are meaningful only under `columns-12`.",
  },
  {
    axis: "density",
    sibling: "layout", role: "container", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.spacing,
    tokens: [spacingToken("gap")],
    default: "md",
    controls: ["gap"],
    mustNeverTouch: ["padding", "margin", "structure"],
  },
  {
    axis: "flow-spacing",
    sibling: "layout", role: "container", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.spacing,
    tokens: [spacingToken("flow")],
    default: null,
    controls: ["margin-block-start"], // the owl > * + *
    mustNeverTouch: ["gap", "padding", "display"],
    notes: "correct only for single-line, source-ordered block/prose flow",
  },
  {
    axis: "padding",
    sibling: "layout", role: "self", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.spacing,
    tokens: [spacingToken("padding"), spacingToken("padding-inline"), spacingToken("padding-block"), spacingEdgeToken("padding")],
    subDials: ["inline", "block", "top", "right", "bottom", "left"],
    dialOf: (word: string) => {
      const edge = word.match(/^padding-(top|right|bottom|left)-/);
      if (edge) return edge[1];
      return word.startsWith("padding-inline-") ? "inline" : word.startsWith("padding-block-") ? "block" : null;
    },
    dialFootprint: spacingDialFootprint,
    aliasMatch: (word: string) => new RegExp(`^padding-(${SCALES.spacing.join("|")})$`).test(word),
    default: null,
    // longhands, not the shorthand: the whole-axis form emits `padding` (all sides), the
    // dials emit `padding-inline` / `padding-block` / physical edge longhands. Listed
    // so the hand `controls` face matches the emitter's real footprint.
    controls: ["padding", "padding-inline", "padding-block", "padding-top", "padding-right", "padding-bottom", "padding-left"],
    mustNeverTouch: ["margin", "gap", "display"],
    notes: "spacing sub-dials: inline (left+right), block (top+bottom), plus physical edges. Overlapping footprints conflict (`padding-inline-sm padding-left-xs`); disjoint edges compose (`padding-left-xs padding-right-sm`). `padding-<spacing>` is the WHOLE-AXIS form.",
  },
  {
    axis: "margin",
    sibling: "layout", role: "member", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: [...SCALES.spacing, "centered", "flush-block"],
    tokens: [
      spacingToken("margin"),
      spacingToken("margin-inline"),
      spacingToken("margin-block"),
      spacingEdgeToken("margin"),
      { pattern: /^(centered|flush-block)$/, shape: "centered | flush-block" },
    ],
    subDials: ["inline", "block", "top", "right", "bottom", "left"],
    dialOf: (word: string) => {
      const edge = word.match(/^margin-(top|right|bottom|left)-/);
      if (edge) return edge[1];
      return word.startsWith("margin-inline-") || word === "centered" ? "inline" : word.startsWith("margin-block-") || word === "flush-block" ? "block" : null;
    },
    dialFootprint: spacingDialFootprint,
    aliasMatch: (word: string) => new RegExp(`^margin-(${SCALES.spacing.join("|")})$`).test(word),
    default: null,
    controls: ["margin", "margin-inline", "margin-block", "margin-top", "margin-right", "margin-bottom", "margin-left"],
    mustNeverTouch: ["margin-inline-start", "margin-inline-end", "padding", "gap", "display"],
    notes: "spacing sub-dials: inline (left+right), block (top+bottom), plus physical edges. Overlapping footprints conflict; disjoint edges compose. `centered` owns the inline footprint and `flush-block` owns the block footprint. `push` owns auto inline-start margin separately because auto is relational to one side, not both inline margins.",
  },
  {
    // push: an element consumes available inline-start margin and moves toward inline end
    // (R-SIZE-04). It composes with flow/flex/grid contexts that have free inline space;
    // it does not imply flex, justify-content, or a spacing socket.
    axis: "push",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["push"],
    tokens: [{ pattern: /^push$/, shape: "<push>" }],
    default: null,
    controls: ["margin-inline-start"],
    mustNeverTouch: ["margin", "margin-inline", "margin-block", "margin-inline-end", "padding", "gap", "display"],
    notes: "auto inline-start margin; consumes available inline-start free space to push the member toward inline end. Relational and socket-free, distinct from scale-backed margin.",
  },
  {
    axis: "alignment-container",
    sibling: "layout", role: "container", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: [
      "align-start", "align-center", "align-end", "align-stretch", "align-baseline",
      "justify-start", "justify-center", "justify-end", "justify-between", "justify-around",
    ],
    tokens: [
      { pattern: /^align-(start|center|end|stretch|baseline)$/, shape: "align-<x>" },
      { pattern: /^justify-(start|center|end|between|around)$/, shape: "justify-<x>" },
    ],
    subDials: ["align", "justify"],
    dialOf: (word: string) => word.startsWith("align-") ? "align" : word.startsWith("justify-") ? "justify" : null,
    default: null,
    controls: ["align-items", "justify-content"],
    mustNeverTouch: ["align-self", "gap", "padding"],
    notes: "two sub-dials: align (align-items) and justify (justify-content). They write different properties, so `align-center justify-between` composes; two align-* or two justify-* conflict.",
  },
  {
    axis: "divider",
    sibling: "layout", role: "container", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["divided", "undivided"],
    tokens: [{ pattern: /^(divided|undivided)$/, shape: "divided | undivided" }],
    default: "undivided",
    controls: ["row-rule", "column-rule"],
    mustNeverTouch: ["border", "gap", "padding", "background"],
    notes: "divided + wrap/order/reversed REQUIRES native gap-decoration; else degrade (P10 warn)",
    // P10 as declared data (B1, R-DIVIDER-02): `divided` draws a line BETWEEN children
    // using native gap-decoration, which assumes children stay in authored order.
    // Composing it with wrapping risks the line landing wrong once children reflow
    // or visually reorder.
    compositionHazards: [{
      ownWords: ["divided"],
      otherAxis: "wrapping",
      otherWords: ["wrap-allowed", "wrap-reverse"],
      level: "warn",
      rule: "divider-wrap",
      msg: (own: string, other: string) =>
        `'${own}' with '${other}' — the between-children line assumes authored order; verify it degrades to no divider rather than mis-rendering once children wrap or reorder.`,
    }],
  },
  {
    axis: "wrapping",
    sibling: "layout", role: "container", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["wrap-allowed", "wrap-prevent", "wrap-reverse"],
    tokens: [{ pattern: /^wrap-(allowed|prevent|reverse)$/, shape: "wrap-<x>" }],
    default: null,
    controls: ["flex-wrap"],
    mustNeverTouch: ["gap", "display", "flex"],
  },
  {
    axis: "overflow",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["scroll-y", "scroll-x", "scroll-auto", "clip", "hidden", "overflow-visible"],
    tokens: [{ pattern: /^(scroll-y|scroll-x|scroll-auto|clip|hidden|overflow-visible)$/, shape: "<overflow>" }],
    subDials: ["x", "y"],
    dialOf: (word: string) => word === "scroll-x" ? "x" : word === "scroll-y" ? "y" : null,
    aliasMatch: (word: string) => word === "scroll-auto" || word === "clip" || word === "hidden" || word === "overflow-visible",
    default: null,
    controls: ["overflow-x", "overflow-y"],
    mustNeverTouch: ["display", "padding"],
    notes: "two sub-dials: scroll-x (overflow-x) and scroll-y (overflow-y) compose; scroll-auto, clip, hidden, and overflow-visible are whole-axis (both directions), so they conflict with a per-axis dial. hidden establishes a clipping scroll container; clip forbids scrolling (R-OVERFLOW-01). `overflow-visible` is a release endpoint for scoped overrides that need to undo an authored clipping word.",
  },
  {
    axis: "constraints",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "free",
    valueSpace: [
      "min-width-<size>", "max-width-<size>", "min-height-<size>", "max-height-<size>",
      "min-width-popover-<step>", "max-width-popover-<step>", "max-width-command",
      "min-width-control-<step>", "min-height-control-<step>", "min-height-editor",
      "max-height-results-<step>", "max-width-none",
    ],
    tokens: [
      { pattern: new RegExp(`^(min-width|max-width|min-height|max-height)-(${SCALES.size.join("|")})$`), shape: "min/max-width/height-<size>", valueDomain: "size-step" },
      { pattern: new RegExp(`^(min-width|max-width)-popover-(${SCALES.popover.join("|")})$`), shape: "min/max-width-popover-<step>" },
      { pattern: /^(max-width-command)$/, shape: "max-width-command" },
      { pattern: new RegExp(`^(min-width|min-height)-control-(${SCALES.control.join("|")})$`), shape: "min-width/height-control-<step>" },
      { pattern: /^(min-height-editor)$/, shape: "min-height-editor" },
      { pattern: new RegExp(`^max-height-results-(${SCALES.resultCap.join("|")})$`), shape: "max-height-results-<step>" },
      // R-CONSTRAINT-01 endpoints: no minimum at all (flex min-content escape);
      // no max-width cap at all (inherited measure escape, ADR-0040).
      { pattern: /^(min-width|min-height|max-width)-(none)$/, shape: "min-width/height-none | max-width-none" },
      { pattern: /^(min-width|max-width|min-height|max-height)-.+$/, shape: "min/max-width/height-<bad>", valueDomain: "size-step", fallback: true },
    ],
    // four independent dials — min/max-width form a band, min/max-height form a separate band.
    // A min and a max on the SAME dimension compose (`min-width-sm max-width-lg`); two values on
    // the SAME dial still conflict (`min-width-sm min-width-lg`). No whole-axis alias: there's no
    // natural "set all four at once" word, so plain dial composition (no `aliasMatch`) is correct.
    subDials: ["min-width", "max-width", "min-height", "max-height"],
    dialOf: (word: string) => {
      const m = word.match(/^(min-width|max-width|min-height|max-height)-/);
      return m ? m[1] : null;
    },
    default: null,
    controls: ["min-width", "max-width", "min-height", "max-height"],
    mustNeverTouch: ["flex-grow", "flex-shrink", "flex-basis", "width"],
    notes: "four sub-dials, one per longhand. min-width/max-width compose as a width band; min-height/max-height compose as a height band; all four can co-occur. Interior generic bounds stay on the layout size scale; role-bound bounds (`popover`, `control`, `results`, `editor`, `command`) read their own project-measured sockets so control chrome and overlay measures do not distort the layout size scale. A future semantic check (not yet implemented) should warn when a band is inverted, e.g. min-width-lg max-width-sm.",
  },
  {
    // fill/hug/control-size: explicit self extent along logical axes. `fill` spans the
    // container (R-SIZE-01); `hug-inline` sizes the inline axis from content (R-SIZE-05);
    // `control-size-*` sets both axes from the spacing scale for interactive/icon boxes
    // (R-SIZE-09). Role-sized words cover measured overlay and control affordance boxes
    // without forcing those numbers into the generic layout size scale (R-SIZE-11).
    // Both are socket-free relational sizes and share the same inline-size dial, so
    // `fill-inline hug-inline` conflicts while `hug-inline fill-block` composes.
    // Distinct from flex growth (`grow-1`/`expandable`, m2) and flex-basis source
    // (`basis-content`, m3), which only operate inside flex layout negotiation.
    axis: "fill",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: [
      "fill", "fill-inline", "fill-block", "hug-inline", "width-auto", "height-none",
      "dialog-measure", "width-popover-<step>",
      "control-box-<step>", "control-inline-<step>", "control-block-<step>",
      "separator-mark-<step>", "control-size-<spacing>",
    ],
    tokens: [
      { pattern: /^(?:fill(?:-(inline|block))?|hug-inline|width-auto|height-none|dialog-measure)$/, shape: "fill[-<axis>] | hug-inline | width-auto | height-none | dialog-measure" },
      { pattern: new RegExp(`^width-popover-(${SCALES.popover.join("|")})$`), shape: "width-popover-<step>" },
      { pattern: new RegExp(`^control-(?:box|inline|block)-(${SCALES.control.join("|")})$`), shape: "control-box/inline/block-<step>" },
      { pattern: new RegExp(`^separator-mark-(${SCALES.control.join("|")})$`), shape: "separator-mark-<step>" },
      { pattern: new RegExp(`^control-size-(${SCALES.spacing.join("|")})$`), shape: "control-size-<spacing>", valueDomain: "spacing-step" },
      { pattern: /^control-size-.+$/, shape: "control-size-<bad>", valueDomain: "spacing-step", fallback: true },
    ],
    subDials: ["inline", "block"],
    dialOf: (word: string) => (
      word === "fill-inline" || word === "hug-inline" || word === "width-auto" || word.startsWith("width-popover-") || word.startsWith("control-inline-")
        ? "inline"
        : word === "fill-block" || word === "height-none" || word.startsWith("control-block-")
          ? "block"
          : null
    ),
    aliasMatch: (word: string) => word === "fill" || word === "dialog-measure" || word.startsWith("control-size-") || word.startsWith("control-box-") || word.startsWith("separator-mark-"),
    default: null,
    controls: ["inline-size", "block-size", "width", "height"],
    mustNeverTouch: ["display", "gap", "flex", "flex-grow", "flex-basis", "position", "margin", "padding", "border-radius", "font-size", "aspect-ratio"],
    notes: "explicit self-size dials. Whole-axis `fill`, `dialog-measure`, `control-size-<spacing>`, `control-box-<step>`, and `separator-mark-<step>` set both inline and block footprints, so each conflicts with per-axis dials; `fill-inline fill-block`, `hug-inline fill-block`, and one inline role plus one block role compose. `hug-inline` sets inline-size from content (`fit-content`). `width-auto` and `height-none` are reset endpoints on their respective footprints. `control-size-<spacing>` remains the spacing-scale physical control box; `control-box/inline/block-<step>`, `width-popover-<step>`, `dialog-measure`, and `separator-mark-<step>` use role sockets for project-measured chrome and overlay measures.",
  },
  {
    // aspect: an element's own two dimensions related by a fixed ratio (R-SIZE-02). Self
    // relatum — a proportion between the element's own width and height — so, like `fill`, a
    // relational metric with no socket. `square` = 1:1; other ratios (`wide` 16:9, arbitrary)
    // are reserved pending evidence.
    axis: "aspect",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["square"],
    tokens: [{ pattern: /^(square)$/, shape: "<aspect>" }],
    default: null,
    controls: ["aspect-ratio"],
    mustNeverTouch: ["display", "gap", "flex", "position", "inline-size", "block-size", "width", "height"],
  },
  {
    // cover: an element's positioned box attaches to all four edges of its containing block
    // (R-SIZE-03). Container-relatum edge coverage, not a position mode: it composes with
    // `position-absolute` / `position-fixed` and writes only `inset: 0`.
    axis: "cover",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["cover"],
    tokens: [{ pattern: /^cover$/, shape: "<cover>" }],
    default: null,
    controls: ["inset"],
    mustNeverTouch: ["position", "display", "gap", "flex", "inline-size", "block-size", "width", "height", "margin", "padding"],
  },
  {
    // positioned-relation: a positioned element relates one or more physical edges/centers to
    // its containing block or anchor (R-SIZE-06/R-SIZE-10). Footprints keep centered transforms
    // exclusive while allowing disjoint edge attachments such as `attach-below stretch-inline`.
    axis: "positioned-relation",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["center-x", "center-y", "attach-below", "attach-above", "stretch-inline"],
    tokens: [{ pattern: /^(center-(x|y)|attach-(below|above)|stretch-inline)$/, shape: "<positioned-relation>" }],
    subDials: ["inline-center", "block-center", "block-after-edge", "block-before-edge", "inline-edges"],
    dialOf: (word: string) => {
      if (word === "center-x") return "inline-center";
      if (word === "center-y") return "block-center";
      if (word === "attach-below") return "block-after-edge";
      if (word === "attach-above") return "block-before-edge";
      if (word === "stretch-inline") return "inline-edges";
      return null;
    },
    dialFootprint: (dial: string) => {
      if (dial === "inline-center") return ["left", "transform"];
      if (dial === "block-center") return ["top", "transform"];
      if (dial === "block-after-edge") return ["top"];
      if (dial === "block-before-edge") return ["bottom"];
      if (dial === "inline-edges") return ["left", "right"];
      return [dial];
    },
    default: null,
    controls: ["left", "right", "top", "bottom", "transform"],
    mustNeverTouch: ["position", "inset", "margin", "inline-size", "block-size", "width", "height"],
    notes: "positioned relations require a positioned element from `position-mode` but do not imply it. `center-x` = `left: 50%` plus `translateX(-50%)`; `center-y` = `top: 50%` plus `translateY(-50%)`; they remain exclusive because both own the transform slot. `attach-below` sets `top: 100%`, `attach-above` sets `bottom: 100%`, and `stretch-inline` sets `left: 0; right: 0`; disjoint edge footprints compose for anchored dropdowns.",
  },
  {
    // viewport-fill: the full-height page shell — at least a viewport tall, growing with content
    // (R-SIZE-08). Viewport relatum (vs container `fill`, self `hug`); a relational metric, no
    // socket. Emits a block-axis MINIMUM so content taller than the viewport still scrolls — this
    // is why it is not a `fill` dial (`fill-block` caps at 100%). A `dvh` dynamic variant is
    // reserved pending evidence.
    axis: "viewport-fill",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["fill-viewport"],
    tokens: [{ pattern: /^(fill-viewport)$/, shape: "<viewport-fill>" }],
    default: null,
    controls: ["min-block-size"],
    mustNeverTouch: ["display", "gap", "flex", "position", "inline-size", "block-size", "height", "min-height"],
  },
];

// ============================================================================
// 4.4 LAYERING — tier-2 z-scale and tier-1 top-layer are DIFFERENT axes.
// ============================================================================

// implements: R-LAYER-01, R-LAYER-02, R-LAYER-03
export const LAYERING: AxisRecord[] = [
  {
    axis: "z-scale", // TIER 2 ONLY
    sibling: "layering", role: "member", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.zTier2,
    tokens: [{ pattern: new RegExp(`^(${SCALES.zTier2.join("|")})$`), shape: "<z-step>" }],
    default: "base",
    controls: ["z-index"],
    mustNeverTouch: ["position", "isolation", "display"],
    notes: "tier-2 only; only meaningful within an isolation:isolate context. tier-2 member list is a [RULING] (values), structure frozen.",
  },
  {
    axis: "top-layer-mechanism", // TIER 1 — NOT a z-scale; emits no z-index
    sibling: "layering", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["overlay", "modal", "popover", "toast"],
    tokens: [{ pattern: /^(overlay|modal|popover|toast)$/, shape: "<top-layer>" }],
    default: null,
    controls: [], // mechanism is showModal()/popover/top-layer promotion, no z-index
    mustNeverTouch: ["z-index", "position"],
    notes: "joined by OPENING; ordered at runtime by last-opened-is-topmost. choosing `modal` = promotion, not a number.",
  },
  {
    axis: "position-mode",
    sibling: "layering", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    // PREFIXED this revision (was bare static/relative/absolute/fixed/sticky): bare `sticky`
    // collided with the z-scale's tier-2 rung of the same name (both matched the same bare
    // token; REGISTRY order silently resolved it to z-scale, making `position: sticky`
    // inexpressible). Prefixing the whole axis — not just the colliding word — keeps the
    // vocabulary shape uniform, and matches how other bare-CSS-value axes were already
    // grammar-renamed (overflow's `scroll-auto`, not raw `auto`). Caught by the P0
    // token-uniqueness check in registry.ts (`checkTokenUniqueness`), added this revision.
    valueSpace: ["position-static", "position-relative", "position-absolute", "position-fixed", "position-sticky"],
    tokens: [{ pattern: /^position-(?:static|relative|absolute|fixed|sticky)$/, shape: "position-<mode>" }],
    default: "position-static",
    controls: ["position"],
    mustNeverTouch: ["z-index", "display", "inset"],
  },
  {
    axis: "stacking-context",
    sibling: "layering", role: "container", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["isolate"],
    tokens: [{ pattern: /^isolate$/, shape: "isolate" }],
    default: null,
    controls: ["isolation"],
    mustNeverTouch: ["z-index", "position"],
  },
];

// ============================================================================
// 4.3 MOTION
// ============================================================================

// implements: R-MOTION-01, R-MOTION-02, R-MOTION-04, R-MOTION-08, R-MOTION-09
export const MOTION: AxisRecord[] = [
  {
    // The open tween: state supplies the "to" value; this word supplies the
    // temporal envelope. It emits longhands so easing words can compose without
    // the `transition` shorthand resetting them by source order.
    axis: "tween",
    sibling: "motion", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: TWEEN_WORDS,
    tokens: [
      { pattern: new RegExp(`^tween-(${SCALES.duration.join("|")})$`), shape: "tween-<duration>" },
      { pattern: new RegExp(`^tween-(${TWEEN_TARGETS.join("|")})-(${SCALES.duration.join("|")})$`), shape: "tween-<target>-<duration>" },
      { pattern: /^tween-.+$/, shape: "tween-<bad>", valueDomain: "duration-step", fallback: true },
    ],
    default: null,
    controls: ["transition-property", "transition-duration"],
    mustNeverTouch: ["animation", "transform", "background", "color", "opacity", "transition-timing-function", "transition-delay", "transition"],
    notes: "open transition envelope: state supplies the target value; duration reads --duration-<step>. Bare `tween-<duration>` targets all changed properties; targeted forms narrow transition-property to repeated UI paint/presence sets.",
  },
  {
    axis: "motion-micro",
    sibling: "motion", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free", // easing closed; magnitudes are skin scales
    valueSpace: ["decelerate", "accelerate", "standard", "emphasized", "symmetric", "asymmetric"],
    tokens: [
      { pattern: /^(decelerate|accelerate|standard|emphasized)$/, shape: "<easing>" },
      { pattern: /^(symmetric|asymmetric)$/, shape: "<direction>" },
    ],
    default: null,
    controls: ["transition-timing-function", "--motion-direction"],
    mustNeverTouch: ["animation", "transform", "background"],
    notes: "easing/direction only; duration is consumed by the open `tween-<duration>` envelope (R-MOTION-08).",
  },
  {
    axis: "motion-macro",
    sibling: "motion", role: "container", signature: "container-operation",
    vocabulary: "closed", regime: "free",
    valueSpace: ["together", "sequence", "cascade"],
    tokens: [{ pattern: /^(together|sequence|cascade)$/, shape: "<choreography>" }],
    default: null,
    controls: ["--stagger"], // NOT raw transition-delay (collision-1 fix); composed additively
    mustNeverTouch: ["transition-duration", "transition-delay", "transform"],
    notes: "stagger magnitude is an open skin scale; composes via calc(own-delay + --stagger).",
  },
  {
    // A named effect is a CLOSED tween — the interpolated property and its
    // target ("place") are baked into a substrate @keyframes block, so the word
    // carries no socket. The library layer above `tween`; `shake`/`pulse` are
    // the same universal idioms Animate.css standardised. The element receives
    // only `animation`; the keyframes' transform/opacity live inside the block,
    // never on the element, so this axis touches no other axis's properties.
    axis: "effect",
    sibling: "motion", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free", // closed library; new atoms enter only on an application
    valueSpace: ["shake"], // reserved, unadmitted until applied: flash, pulse, bounce, spin
    tokens: [{ pattern: /^(shake)$/, shape: "<effect>" }],
    default: null,
    controls: ["animation"],
    mustNeverTouch: ["transition-duration", "transition-timing-function", "transition-delay", "transition", "transform", "opacity"],
    notes: "each member references a motion-substrate @keyframes block (EFFECT_KEYFRAMES); reserve flash/pulse/bounce/spin (R-MOTION-07).",
  },
];

// ============================================================================
// 5. SKIN — sampled (surface + type + one conditioned-skin record).
// ============================================================================

// The carrier/role/intensity vocabulary (R-SKIN-03/04/05), single-sourced so a
// carrier axis's tokens and the SKIN_PLANE socket contract below cannot drift.
// Carriers own a property + steps; roles are shared hues that ride any carrier;
// role intensities recede the hue. A carrier word is `<carrier>`, `<carrier>-<step>`,
// `<carrier>-<role>`, or `<carrier>-<role>-<intensity>`.
const CARRIER_STEPS = {
  ground: ["subtle", "defined", "hover", "active", "selected"],
  ink: ["soft", "muted", "faint", "inverse", "selected"],
  rule: ["soft"],
} as const;
const ROLE_STEPS = {
  accent: ["soft", "faint"],
  pass: ["faint"],
  warn: ["faint"],
  fail: ["faint"],
  note: ["faint"],
} as const;
type Carrier = keyof typeof CARRIER_STEPS;

// The closed suffix alternation a carrier accepts: its own steps, plus every role
// and role-intensity. Fed to the token regex and (as words) to the emitter.
const carrierSuffixes = (carrier: Carrier): string[] => [
  ...CARRIER_STEPS[carrier],
  ...Object.entries(ROLE_STEPS).flatMap(([role, steps]) => [role, ...steps.map((s) => `${role}-${s}`)]),
];
const carrierToken = (carrier: Carrier): Token => ({
  pattern: new RegExp(`^${carrier}(-(${carrierSuffixes(carrier).join("|")}))?$`),
  shape: `${carrier}[-<role|step>[-<intensity>]]`,
});
const carrierWordPattern = (carrier: Carrier): RegExp =>
  new RegExp(`^${carrier}(-(${carrierSuffixes(carrier).join("|")}))?$`);
const ruleEdgeToken = (): Token => ({
  pattern: new RegExp(`^rule-(top|right|bottom|left)(-(${[...carrierSuffixes("rule"), "transparent"].join("|")}))?$`),
  shape: "rule-<edge>[-<role|step|transparent>]",
});

// R-SKIN-06/07 scale-bound families, single-sourced into the SKIN_PLANE scale
// contract below and the axis tokens. R-SKIN-07: all typography lives under `font-*`,
// so size and weight are disjoint-property facets sharing that word namespace.
const RADIUS_STEPS = ["sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const TYPE_STEPS = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const WEIGHT_STEPS = ["medium", "semibold", "bold"] as const;
const scaleToken = (prefix: string, steps: readonly string[]): Token => ({
  pattern: new RegExp(`^${prefix}-(${steps.join("|")})$`),
  shape: `${prefix}-<step>`,
});
const radiusSideToken = (side: "top" | "bottom"): Token => ({
  pattern: new RegExp(`^corner-${side}-(none|${RADIUS_STEPS.join("|")})$`),
  shape: `corner-${side}-<none|step>`,
});

// implements: R-TYPE-01, R-SKIN-01
export const SKIN: AxisRecord[] = [
  {
    // skin-ground: the interior carrier (R-SKIN-03). Owns `background`; each word reads
    // its like-named socket — carrier steps (hierarchy + interaction tones) plus role
    // hues that ride the carrier (`ground-fail` = a fail-tinted surface).
    axis: "skin-ground",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["ground", ...carrierSuffixes("ground").map((s) => `ground-${s}`)],
    tokens: [carrierToken("ground")],
    default: null,
    controls: ["background"],
    mustNeverTouch: ["display", "gap", "flex", "position", "color", "border-color", "border-radius", "font-size"],
  },
  {
    // skin-ink: the foreground carrier (R-SKIN-03). Owns `color`; carrier steps
    // (soft/muted/faint/inverse) plus role hues (`ink-accent`, `ink-fail`).
    axis: "skin-ink",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["ink", ...carrierSuffixes("ink").map((s) => `ink-${s}`)],
    tokens: [carrierToken("ink")],
    default: null,
    controls: ["color"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "border-color", "border-radius", "font-size"],
  },
  {
    // skin-rule: the border carrier (R-SKIN-03). Whole-box words own `border-color`;
    // edge facets own one physical `border-*-color` longhand.
    axis: "skin-rule",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: [
      "rule",
      ...carrierSuffixes("rule").map((s) => `rule-${s}`),
      ...["top", "right", "bottom", "left"].flatMap((edge) => [
        `rule-${edge}`,
        ...carrierSuffixes("rule").map((s) => `rule-${edge}-${s}`),
        `rule-${edge}-transparent`,
      ]),
    ],
    tokens: [carrierToken("rule"), ruleEdgeToken()],
    subDials: ["top", "right", "bottom", "left"],
    dialOf: (word: string) => {
      const side = word.match(/^rule-(top|right|bottom|left)(?:-|$)/);
      return side ? side[1] : null;
    },
    aliasMatch: (word: string) => carrierWordPattern("rule").test(word),
    default: null,
    controls: ["border-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "border-radius", "font-size"],
    notes: "`rule` and `rule-<hue>` are whole-box colour aliases and conflict with edge colour facets. `rule-top/right/bottom/left[-<hue>]` colour only one physical edge; `rule-<edge>-transparent` is the reserved-line endpoint for invisible sentinels such as current-tab underlines.",
  },
  {
    // corner: border-radius magnitude on an ordered radius scale (R-SKIN-06). Side facets
    // let joined surfaces flatten or round only their shared top/bottom seam.
    axis: "corner",
    sibling: "skin", role: "self", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: [
      ...RADIUS_STEPS.map((s) => `corner-${s}`),
      ...RADIUS_STEPS.flatMap((s) => [`corner-top-${s}`, `corner-bottom-${s}`]),
      "corner-top-none",
      "corner-bottom-none",
    ],
    tokens: [scaleToken("corner", RADIUS_STEPS), radiusSideToken("top"), radiusSideToken("bottom")],
    subDials: ["top", "bottom"],
    dialOf: (word: string) => {
      const side = word.match(/^corner-(top|bottom)-/);
      return side ? side[1] : null;
    },
    dialFootprint: (dial: string) => {
      if (dial === "top") return ["top-left", "top-right"];
      if (dial === "bottom") return ["bottom-left", "bottom-right"];
      return [dial];
    },
    aliasMatch: (word: string) => new RegExp(`^corner-(${RADIUS_STEPS.join("|")})$`).test(word),
    default: null,
    controls: ["border-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "border-color", "font-size"],
    notes: "`corner-<step>` is the whole-box radius and conflicts with side facets. `corner-top-<step>` and `corner-bottom-<step>` set paired physical corner longhands. The side-only `none` endpoint is for joined seams; no broad `corner-none` or individual physical-corner vocabulary is admitted.",
  },
  {
    // rule-presence: a line's existence, separate from its colour (R-SKIN-11).
    // `ruled` / `ruled-<side>` own border width+style at the theme's line weight
    // (`--rule-weight`, default 1px); the `rule` carrier owns the colour. This axis
    // replaces the retired skin-surface gap axis: its shadow half fell to R-SKIN-09,
    // its border half is ruled here.
    axis: "rule-presence",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["ruled", "ruled-top", "ruled-bottom", "ruled-left", "ruled-right"],
    tokens: [{ pattern: /^ruled(?:-(top|bottom|left|right))?$/, shape: "ruled[-<side>]" }],
    subDials: ["top", "right", "bottom", "left"],
    dialOf: (word: string) => {
      const side = word.match(/^ruled-(top|right|bottom|left)$/);
      return side ? side[1] : null;
    },
    aliasMatch: (word: string) => word === "ruled",
    default: null,
    controls: [
      "border-width", "border-style",
      "border-top-width", "border-top-style", "border-bottom-width", "border-bottom-style",
      "border-left-width", "border-left-style", "border-right-width", "border-right-style",
    ],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "border-color", "border-radius", "box-shadow"],
    notes: "`ruled` is the whole-box line presence alias and conflicts with side facets. `ruled-top`, `ruled-right`, `ruled-bottom`, and `ruled-left` are edge dials that compose when disjoint, letting an element truthfully draw any subset of physical rule edges without local suppression.",
  },
  {
    // font-size: typographic scale (R-SKIN-07 size facet), a disjoint-property facet
    // of the `font-*` namespace. Reads the type-scale socket (`font-md` → --type-md).
    axis: "font-size",
    sibling: "skin", role: "self", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: TYPE_STEPS.map((s) => `font-${s}`),
    tokens: [scaleToken("font", TYPE_STEPS)],
    default: null,
    controls: ["font-size"],
    mustNeverTouch: ["display", "gap", "flex", "margin", "font-weight", "font-family"],
  },
  {
    // font-weight: the weight facet (R-SKIN-07), disjoint from size so they compose
    // (`font-md font-bold`). Reads the weight-scale socket (`font-bold` → --weight-bold).
    axis: "font-weight",
    sibling: "skin", role: "self", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: WEIGHT_STEPS.map((s) => `font-${s}`),
    tokens: [scaleToken("font", WEIGHT_STEPS)],
    default: null,
    controls: ["font-weight"],
    mustNeverTouch: ["display", "gap", "flex", "margin", "font-size", "font-family"],
  },
  {
    // font-family: the typeface-variant facet (R-SKIN-07: "size, weight, and typeface
    // variant (mono)"). `font-mono` marks code/key marks; it reads its like-named socket
    // with the platform's own generic as the default, so a theme owns the stack.
    axis: "font-family",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["font-mono"],
    tokens: [{ pattern: /^font-(mono)$/, shape: "font-<typeface>" }],
    default: null,
    controls: ["font-family"],
    mustNeverTouch: ["display", "gap", "flex", "margin", "font-size", "font-weight", "line-height"],
  },
  {
    // text-align: inline-content alignment facet (R-SKIN-14). Logical values;
    // text-start chiefly restores natural alignment where the platform centres
    // (buttons). text-end reserved pending evidence. Leading (line-height) is
    // deliberately not a facet — substrate/theme-owned, deviations are identity —
    // so this axis's ruling retired the old skin-type gap axis.
    axis: "text-align",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["text-start", "text-center"],
    tokens: [{ pattern: /^text-(start|center)$/, shape: "text-<alignment>" }],
    default: null,
    controls: ["text-align"],
    mustNeverTouch: ["display", "gap", "flex", "margin", "font-size", "font-weight", "font-family", "line-height"],
  },
  {
    // elevation: the cast-shadow treatment (R-SKIN-09). Owns box-shadow; the word reads
    // its like-named socket with an Ermine default geometry composed on the standalone
    // `shadow` colour socket, so a theme owns the numbers. `elevated` admitted;
    // `recessed` (inset) is the family member reserved pending evidence. Distinct from
    // the z-scale's `raised` stacking tier — order, not look. Identity shadows stay
    // project-owned.
    axis: "elevation",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["elevated"],
    tokens: [{ pattern: /^(elevated)$/, shape: "<elevation>" }],
    default: null,
    controls: ["box-shadow"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "border-color", "border-radius", "font-size"],
  },
  {
    // affordance: the invitation to press (R-SKIN-17). `pressable` owns cursor — the
    // read side of interaction; behaviour stays JavaScript (IoC boundary). Family
    // members draggable/editable/expandable reserved pending evidence.
    axis: "affordance",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["pressable"],
    tokens: [{ pattern: /^(pressable)$/, shape: "<affordance>" }],
    default: null,
    controls: ["cursor"],
    mustNeverTouch: ["display", "gap", "flex", "background", "color", "pointer-events", "user-select"],
  },
  {
    // concealment: presence at the opacity endpoints (R-SKIN-16). `concealed` keeps
    // layout and measurement while invisible; `revealed` restores. Meant for the
    // reveal-on-parent-state affordance (`concealed parent-hover:revealed`).
    // Mid-scale opacity (emphasis dimming) is deliberately not this axis.
    axis: "concealment",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["concealed", "revealed"],
    tokens: [{ pattern: /^(concealed|revealed)$/, shape: "<concealment>" }],
    default: null,
    controls: ["opacity"],
    mustNeverTouch: ["display", "visibility", "pointer-events", "background", "color"],
  },
  {
    // numeric: tabular figures — fixed-width digits so numbers align in columns (R-SKIN-18).
    // font-variant-numeric only; a type facet like font-size/weight.
    axis: "numeric",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["tabular"],
    tokens: [{ pattern: /^(tabular)$/, shape: "<numeric>" }],
    default: null,
    controls: ["font-variant-numeric"],
    mustNeverTouch: ["display", "gap", "flex", "font-size", "font-weight", "font-family"],
  },
  {
    // type-label: the small-uppercase eyebrow/overline treatment (R-SKIN-19). Uppercases and
    // tracks the label; the tracking reads a treatment socket (default 0.07em).
    axis: "type-label",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["overline"],
    tokens: [{ pattern: /^(overline)$/, shape: "<type-label>" }],
    default: null,
    controls: ["text-transform", "letter-spacing"],
    mustNeverTouch: ["display", "gap", "flex", "font-size", "font-family"],
  },
  {
    // scrollbar: prominence on the platform's standard properties (R-SKIN-15).
    // `scrollbar-subtle` = thin, thumb/track from like-named sockets (default: the
    // rule carrier over a transparent track). `scrollbar-hidden` reserved.
    // Engine-drawn ::-webkit-scrollbar styling is project identity, not this axis.
    axis: "scrollbar",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["scrollbar-subtle"],
    tokens: [{ pattern: /^scrollbar-(subtle)$/, shape: "scrollbar-<prominence>" }],
    default: null,
    controls: ["scrollbar-width", "scrollbar-color"],
    mustNeverTouch: ["display", "gap", "flex", "overflow-x", "overflow-y", "background", "color"],
  },
  {
    // focus-ring: the focus indicator as a treatment (R-SKIN-13). `ring` restyles the
    // platform's own outline — authored under the focus condition (`focus:ring`) — so
    // there is never an outline suppression to drift from its indicator. Reads the
    // `--ring` socket; box-shadow rings are elevation's property and not this axis.
    axis: "focus-ring",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["ring"],
    tokens: [{ pattern: /^(ring)$/, shape: "<focus-ring>" }],
    default: null,
    controls: ["outline", "outline-offset"],
    mustNeverTouch: ["display", "gap", "flex", "box-shadow", "border-width", "border-color", "background", "color"],
  },
  {
    // truncation/text wrapping: text that yields to or preserves line breaks inside
    // its container (R-SKIN-12). `truncate` is the single-line ellipsis
    // (text-overflow + white-space); `clamp-<n>` limits to N lines via the
    // `-webkit-box` clamp idiom (admitted from Monky evidence, ADR-0023 — the
    // reserved multi-line member, named `clamp` so the number reads as the retained
    // line limit, not an amount removed). `text-nowrap` and `text-pre-wrap` are
    // bare white-space treatments for non-ellipsis text (ADR-0042). `text-wrap` is
    // the release endpoint for scoped overrides that undo `truncate`. One axis: an
    // element truncates, clamps, prevents wrapping, preserves author line breaks, or
    // restores ordinary wrapping.
    // `clamp-<n>` writes `display: -webkit-box`, so it is exclusive with a structure
    // word by property collision — a clamped text block is not also a flex/grid box.
    axis: "truncation",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["truncate", "clamp-N", "text-nowrap", "text-pre-wrap", "text-wrap"],
    tokens: [
      { pattern: /^(truncate|text-nowrap|text-pre-wrap|text-wrap)$/, shape: "<text-flow-treatment>" },
      { pattern: /^clamp-(\d+)$/, shape: "clamp-N", valueDomain: "integer-≥1" },
      { pattern: /^clamp-.+$/, shape: "clamp-<bad>", valueDomain: "integer-≥1", fallback: true },
    ],
    parametricMembers: ["clamp"],
    default: null,
    controls: ["text-overflow", "white-space", "display", "-webkit-box-orient", "-webkit-line-clamp"],
    mustNeverTouch: ["gap", "flex", "overflow-x", "overflow-y", "background", "color", "font-size"],
  },
  {
    // conditioned-skin: the look a state drives. Makes `selectable + selection-subtle` operational.
    axis: "selection-treatment",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    eventTriggered: true, // R-STATE-09: conditioned by `selected`; sanctioned-overrides base skin
    valueSpace: ["selection-subtle", "selection-strong"],
    tokens: [{ pattern: /^selection-(subtle|strong)$/, shape: "selection-<x>" }],
    default: null,
    controls: ["--selection-bg", "--selection-ink", "--selection-outline"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "outline"],
    notes: "conditioned-skin: a CONDITIONAL VARIANT LAYER, not a base skin axis. It writes custom properties (--selection-bg/--selection-ink), NOT background/color directly — a sink rule reads them under the `selected` condition. This is why it does NOT collide with skin-surface's background/color (same discipline as m2 longhands / motion --stagger): conditioned layers compose with base skin by writing different variables. Entails nothing itself; conditioned by `selected`/`hover`/`active`; pairs with capability `selectable`.",
  },
];

// ============================================================================
// 5.1 SKIN PLANE — the registry-owned socket contract (R-SKIN-08).
// The theme-plane skeleton derives its SkinSocket list from this data alone; it
// is the identity of the plane, so a project may not invent unregistered sockets.
// Intensity (soft/muted/faint, R-SKIN-04) is realized by the theme/emitter from the
// base carrier/role colors, not enumerated here. Motion duration/stagger are named
// scale-bound (R-SCALE-03); duration step names are now ruled by R-MOTION-08.
// ============================================================================

// Each carrier/role names its anchor (the bare socket) plus the steps it varies through
// (R-SKIN-04: the theme realizes a step by binding its value — hand-tuned or computed).
// Carrier anchors (ground/ink/rule) are the required floor; role anchors, all color steps,
// and scales are optional (bound when a design uses them, or supplied by a metric layer).
// The socket set is provisional and adjusts against real theme data.
// implements: R-SKIN-03, R-SKIN-04, R-SKIN-05, R-SKIN-06, R-SKIN-07, R-SKIN-08, R-SCALE-03
export const SKIN_PLANE = {
  colors: {
    // R-SKIN-03: carriers own a default color. Steps: R-SKIN-04 ramp, ink's inverse, and
    // the conditioned-skin interaction tones (hover/active/selected) — the tones a skin
    // recipe shows under `:hover` / `:active` / `[aria-selected]`, keyed by element kind
    // and the `selectable` capability, not by any grammar word (platform-first, U-R10).
    carriers: CARRIER_STEPS,
    // R-SKIN-05: shared role hues; anchor = full, `-faint` = the wash.
    roles: ROLE_STEPS,
    // Standalone theme colours that are neither carrier nor role — read by a treatment,
    // not typed by an author. `shadow` is the cast-shadow colour (its geometry belongs to
    // the elevation treatment, not here).
    standalone: ["shadow"],
  },
  // R-SKIN-09: elevation treatment sockets — full box-shadow values (geometry + colour).
  // Optional: the emitter composes a default geometry on `var(--shadow)` when unbound.
  // R-SKIN-07: the typeface-variant facet reads its socket the same way (default:
  // the platform's generic).
  treatments: {
    elevation: ["shadow-elevated"],
    typeface: ["font-mono"],
    // R-SKIN-11: the line weight the presence words emit; themes rebind for heavier rules.
    line: ["rule-weight"],
    // R-SKIN-13: the focus indicator (full outline value) and its offset.
    ring: ["ring", "ring-offset"],
    // R-SKIN-15: scrollbar thumb/track colours for the subtle treatment.
    scrollbar: ["scrollbar-thumb", "scrollbar-track"],
  },
  // R-SCALE-03: scale-bound families — grammar owns step names, theme owns numbers.
  scales: {
    radius: RADIUS_STEPS, // R-SKIN-06 corner magnitude
    type: TYPE_STEPS, // R-SKIN-07 size
    weight: WEIGHT_STEPS, // R-SKIN-07 weight
    duration: SCALES.duration, // R-MOTION-08 temporal magnitude
  },
} as const;

// ============================================================================
// 4.2 STATE — each GROUP is a first-class axis (id `state.<group>`).
// Within a group: set-with-exclusivity (one word per scope). Across groups: compose.
// State controls NOTHING (condition only); composes via state × plane → rule.
// ============================================================================

// helper to build a state-group axis from its members
const stateAxis = (
  group: string,
  members: StateMember[],
  exclusivity: "one" | "many" = "many",
  conflicts: [string, string][] = [],
  implies: [string, string][] = [],
): AxisRecord => {
  // Build token forms so the parser can separate base word from enum value, AND
  // still recognize a bare or wrong-valued enum word (so P4 can flag it rather than
  // P2 mislabeling it as a coined word):
  //  - enumerated members, valid value → `(word)-(v1|v2|…)`  (value in group 2)
  //  - enumerated members, fallback    → `(word)(?:-.*)?`     (base word, any/no tail)
  //  - plain members                   → `(word)`            (no value)
  const enumMembers = members.filter((m) => m.enumValues?.length);
  const plainMembers = members.filter((m) => !m.enumValues?.length);
  const tokens: Token[] = [];
  // valid-value tokens FIRST (so a good value is captured before the fallback matches)
  for (const m of enumMembers)
    tokens.push({ pattern: new RegExp(`^(${m.word})-(${m.enumValues!.join("|")})$`), shape: `${m.word}-<value>`, valueDomain: "enum" });
  if (plainMembers.length)
    tokens.push({ pattern: new RegExp(`^(${plainMembers.map((m) => m.word).join("|")})$`), shape: `<${group}-state>` });
  // fallback tokens LAST: base word bare or with a non-sanctioned tail → recognized,
  // but no value captured, so P4 sees an enumerated member missing a valid value.
  for (const m of enumMembers)
    tokens.push({ pattern: new RegExp(`^(${m.word})(?:-.*)?$`), shape: `${m.word}-<value?>`, valueDomain: "enum" });
  return {
    axis: `state.${group}`,
    sibling: "state", role: "none", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: members.map((m) => m.word),
    tokens,
    default: null,
    controls: [], // P7-4d: state controls nothing
    mustNeverTouch: ["*"],
    stateGroup: { exclusivity, conflicts, implies, members },
  };
};

// implements: R-STATE-01, R-STATE-06
export const STATE: AxisRecord[] = [
  stateAxis("focus", [
    { word: "hover", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":hover"] },
    { word: "focus", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":focus"] },
    { word: "focus-visible", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":focus-visible"] },
    { word: "active", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":active"], note: "the transient press; toggle `pressed` was folded into `selected` (Law 6b)" },
  ], "many", [], [["focus-visible", "focus"]]),
  stateAxis("selection", [
    { word: "selectable", arity: "binary", driver: "interaction", stateCategory: "capability", note: "entails nothing; distributes capability down" },
    { word: "selected", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["aria-selected", "aria-pressed", ":checked"], note: "Law 6b merge",
      // P6 form (b) as declared data (B1): a binary `selected` standing in for the
      // tri-state truth that `checked-mixed` owns.
      misuse: { whenBacking: ["aria-checked=mixed", ":indeterminate"], msg: "'selected' with a mixed/indeterminate backing — use the dedicated word 'checked-mixed'." } },
    { word: "checked-mixed", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["aria-checked=mixed", ":indeterminate"], note: "the tri-state 'mixed/indeterminate' value as a complete word (binary arity: the word IS the value, no enum suffix)." },
    { word: "current", arity: "enumerated", driver: "interaction", stateCategory: "instance", entails: ["aria-current"], enumValues: ["page", "step", "location", "date", "time", "true"] },
  ], "many", [["selected", "checked-mixed"]]),
  stateAxis("availability", [
    { word: "disabled", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":disabled", "aria-disabled"] },
    { word: "read-only", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":read-only", "aria-readonly"] },
    { word: "busy", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["aria-busy"], note: "visual updating sense only" },
  ], "many"),
  stateAxis("disclosure", [
    { word: "expanded", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["aria-expanded"], note: "in-place disclosure" },
    { word: "open", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["[open]", ":open", ":popover-open"], note: "top-layer/details presentation" },
  ], "one"),
  stateAxis("validity", [
    { word: "invalid", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":invalid", "aria-invalid"] },
    { word: "user-invalid", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":user-invalid"], note: "platform-typical subset of invalid — :user-invalid only matches after user interaction, so it fires only where :invalid already does" },
    { word: "required", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":required", "aria-required"] },
    { word: "out-of-range", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":out-of-range"], note: "platform-typical subset of invalid (browsers generally flag out-of-range values as :invalid too, absent novalidate)" },
  ], "many", [], [["user-invalid", "invalid"], ["out-of-range", "invalid"]]),
  stateAxis("sort", [
    { word: "sorted", arity: "enumerated", driver: "interaction", stateCategory: "instance", entails: ["aria-sort"], enumValues: ["none", "ascending", "descending"] },
  ]),
  stateAxis("drag", [
    { word: "dragging", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["@drag"], note: "ARIA aria-grabbed/dropeffect deprecated; backing is the live DnD event" },
  ]),
  stateAxis("continuous-input", [
    { word: "scroll-progress", arity: "continuous", driver: "input", stateCategory: "instance", entails: ["scroll()", "animation-timeline"] },
    { word: "drag-progress", arity: "continuous", driver: "input", stateCategory: "instance", entails: ["pointer"] },
  ]),
  stateAxis("relational", [
    { word: "active-descendant", arity: "binary", driver: "interaction", stateCategory: "relational", relationalBacking: { containerAttr: "aria-activedescendant" }, note: "inverted entailment: backing on the container" },
  ]),
];

// ----------------------------------------------------------------------------
// ENVIRONMENT — NOT axis members. A closed set of SCOPE PREFIXES (Law 2 amended:
// one word per axis PER CONDITION SCOPE). A prefix opens a new scope; the word
// after the colon is an ordinary grammar word from some axis above.
// Parsing a prefixed word yields { scope, axis, member }, and P1 runs per-scope.
// ----------------------------------------------------------------------------

export type ScopePrefix = EngineScopePrefix;

// implements: R-STATE-07
export const ENVIRONMENT_SCOPES: ScopePrefix[] = [
  { id: "viewport-bp", pattern: new RegExp(`^viewport-(${SCALES.breakpoint.join("|")})$`), shape: "viewport-<bp>:", role: "none" },
  { id: "viewport-orientation", pattern: /^viewport-(portrait|landscape)$/, shape: "viewport-<orientation>:", role: "none" },
  { id: "container-bp", pattern: new RegExp(`^container-(${SCALES.breakpoint.join("|")})$`), shape: "container-<bp>:", role: "container", note: "conditions on container size; distributes to children" },
  { id: "prefers", pattern: /^prefers-(reduced-motion|color-scheme-dark|contrast-more|reduced-transparency)$/, shape: "prefers-<x>:", role: "none" },
];

// Platform interaction conditions the browser supplies for free (R-STATE-10). A prefix
// scopes a conditioned-skin override to the pseudo-class; unlike environmental scopes it
// serializes to a selector suffix (`:hover`), not an at-rule. `hover` and `focus` are
// admitted on evidence; `active` is the family member still reserved, admitted as its
// own evidence lands. `focus:` recolors carriers while focused — it does not redraw the
// UA focus ring, which stays platform-supplied (RAT:R-STATE-10).
// implements: R-STATE-10
export const INTERACTION_SCOPES: ScopePrefix[] = [
  { id: "hover", pattern: /^hover$/, shape: "hover:", role: "none", note: "conditioned skin while the pointer is over the element" },
  { id: "focus", pattern: /^focus$/, shape: "focus:", role: "none", note: "conditioned skin while the element holds focus" },
  { id: "active", pattern: /^active$/, shape: "active:", role: "none", note: "conditioned skin during the press" },
  { id: "disabled", pattern: /^disabled$/, shape: "disabled:", role: "none", note: "conditioned skin while the form control is disabled" },
];

// Application-asserted state scopes (R-STATE-11). Like interaction scopes they carry a
// conditioned-skin override, but the condition is backed: the element must declare the
// `selectable` capability and the container asserts the state. They serialize to the
// backing attribute selector (`[aria-selected="true"]`), not a pseudo-class.
// `current` (R-STATE-12) is attribute-backed instead: the element carries `aria-current`
// itself, so no capability word exists — the attribute selector is the backing.
// implements: R-STATE-11, R-STATE-12
export const STATE_SCOPES: ScopePrefix[] = [
  { id: "selected", pattern: /^selected$/, shape: "selected:", role: "none", backedBy: "selectable", note: "backed conditioned skin while the element is asserted selected" },
  { id: "checked", pattern: /^checked$/, shape: "checked:", role: "none", backedBy: "selectable", note: "backed conditioned skin while the element is asserted checked" },
  { id: "current", pattern: /^current$/, shape: "current:", role: "none", note: "attribute-backed conditioned skin while the element is asserted current (aria-current)" },
];

// Relational condition scopes (R-STATE-13): the condition lives on an ancestor that
// carries the `selectable` capability — the R-STATE-08 contract read from below.
// Serialization anchors on the capability class, so an unmarked ancestor never fires
// the override; the linter verifies the pair through parent context when available.
// implements: R-STATE-13
export const RELATIONAL_SCOPES: ScopePrefix[] = [
  { id: "parent-hover", pattern: /^parent-hover$/, shape: "parent-hover:", role: "none", parentBackedBy: "selectable", note: "conditioned skin while the selectable ancestor is hovered" },
  { id: "parent-selected", pattern: /^parent-selected$/, shape: "parent-selected:", role: "none", parentBackedBy: "selectable", note: "conditioned skin while the selectable ancestor is asserted selected" },
];

// ============================================================================
// THE REGISTRY
// ============================================================================

export const REGISTRY: AxisRecord[] = [
  ...LAYOUT, ...LAYERING, ...MOTION, ...STATE, ...SKIN,
];

// ============================================================================
// P0 — TOKEN UNIQUENESS (registry-build invariant, not a per-string lint rule).
// Every authored word must resolve to EXACTLY ONE axis. The parser (lint.ts) tries
// axes in REGISTRY order and returns the first match, so an ambiguous word doesn't
// error — it silently resolves to whichever axis happens to be listed first, and the
// other axis's word becomes permanently inaccessible. This is a registry-authoring
// bug class (caught the `sticky` collision between z-scale and position-mode this
// revision), so it's checked once over the whole finite vocabulary, not per lint call.
// Only tests CONCRETE (non-parametric) valueSpace entries — open/parametric member
// shapes (`grow-<N>`, `basis-exact-<size>`) aren't enumerable finite words and are
// exercised instead by ordinary well-formedness testing (they're already namespaced
// by construction: a parametric prefix is chosen specifically to avoid collision).
// ============================================================================
export function checkTokenUniqueness(): { word: string; axes: string[] }[] {
  const candidateWords = new Set<string>();
  for (const ax of REGISTRY)
    for (const w of ax.valueSpace)
      if (!w.includes("<")) candidateWords.add(w);

  const collisions: { word: string; axes: string[] }[] = [];
  for (const word of candidateWords) {
    const matches = REGISTRY.filter((ax) => ax.tokens.some((t) => t.pattern.test(word)));
    if (matches.length > 1) collisions.push({ word, axes: matches.map((a) => a.axis) });
  }
  return collisions;
}

// quick self-report when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bySibling = (s: Sibling) => REGISTRY.filter((a) => a.sibling === s).length;
  console.log(`REGISTRY: ${REGISTRY.length} axes`);
  console.log(`  layout=${bySibling("layout")} layering=${bySibling("layering")} motion=${bySibling("motion")} state=${bySibling("state")} skin=${bySibling("skin")}`);
  console.log(`  free=${REGISTRY.filter(a => a.regime === "free").length} negotiated=${REGISTRY.filter(a => a.regime === "negotiated").length}`);
  console.log(`  environment scope-prefixes: ${ENVIRONMENT_SCOPES.length}`);
  console.log(`  state groups: ${STATE.map(s => s.axis.replace("state.", "")).join(", ")}`);

  const collisions = checkTokenUniqueness();
  if (collisions.length) {
    console.log(`\nP0 TOKEN UNIQUENESS: FAILED — ${collisions.length} ambiguous word(s):`);
    for (const c of collisions)
      console.log(`  '${c.word}' matches ${c.axes.length} axes: ${c.axes.join(", ")} — the parser will silently resolve to the first, making the others' meaning of this word inaccessible.`);
    process.exitCode = 1;
  } else {
    console.log(`P0 TOKEN UNIQUENESS: ok — every closed/finite word resolves to exactly one axis.`);
  }
}
