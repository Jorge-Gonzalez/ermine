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
  density: ["tight", "snug", "comfortable", "relaxed", "loose", "separated"],
  size: ["sm", "md", "lg", "xl"], // R-SCALE-01 size scale — basis-exact-<step>, constraints
  breakpoint: ["sm", "md", "lg", "xl"], // R-SCALE-01-style named breakpoint scale
  zTier2: ["base", "content", "raised", "dropdown", "sticky", "tooltip"],
} as const;

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

// helper: build a density-token regex for a property prefix
const densityToken = (prefix: string): Token => ({
  pattern: new RegExp(`^${prefix}-(${SCALES.density.join("|")})$`),
  shape: `${prefix}-<density>`,
  valueDomain: "density-step",
});

// ============================================================================
// 4.1 LAYOUT
// ============================================================================

// implements: R-STRUCTURE-01, R-M2-02, R-M2-03, R-M3-01, R-M3-02, R-M4-01, R-M5-01, R-PADDING-01, R-ALIGN-01, R-DIVIDER-01, R-WRAP-01, R-OVERFLOW-01, R-CONSTRAINT-01
export const LAYOUT: AxisRecord[] = [
  {
    axis: "structure",
    sibling: "layout", role: "container", signature: "container-operation",
    vocabulary: "closed", regime: "free",
    // `rows` retired (compose-don't-coin, R-STRUCTURE-01): it was `horizontal` + `wrap-allowed`,
    // and it smuggled flex-wrap — which the `wrapping` axis owns — into an axis whose
    // mandate is inner-display-type (+ direction) only. The collision was latent (P7
    // missed it only because `wrapping` had no emission entry yet).
    valueSpace: ["horizontal", "vertical", "grid"],
    tokens: [{ pattern: /^(horizontal|vertical|grid)$/, shape: "<structure>" }],
    default: "flow", // unmarked inner display; `flow` reserved for default, never a member
    controls: ["display.inner", "flex-direction", "grid-template-columns", "grid-auto-flow"],
    mustNeverTouch: ["gap", "padding", "margin", "align-self", "flex", "flex-wrap", "background", "border", "display.outer"],
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
    valueSpace: ["span-N", "row-span-N", "span-all"],
    tokens: [
      { pattern: /^(span|row-span)-(\d+)$/, shape: "span-N | row-span-N", valueDomain: "integer-≥0" },
      { pattern: /^span-all$/, shape: "span-all (contextual)" },
      { pattern: /^(span|row-span)-.+$/, shape: "span-<bad> | row-span-<bad>", valueDomain: "integer-≥0", fallback: true },
    ],
    parametricMembers: ["span", "row-span"],
    default: "auto-place",
    controls: ["grid-column", "grid-row"],
    mustNeverTouch: ["align-self", "flex", "gap"],
    notes: "closed-with-parametric-member: membership closed {span, row-span, span-all}; span/row-span carry integers, span-all is contextual (spans every column). Same member-level mechanism as m3 / enumerated states — NOT open at axis scope. Only meaningful under a grid parent.",
  },
  {
    axis: "density",
    sibling: "layout", role: "container", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.density,
    tokens: [densityToken("gap")],
    default: "comfortable",
    controls: ["gap"],
    mustNeverTouch: ["padding", "margin", "structure"],
  },
  {
    axis: "flow-spacing",
    sibling: "layout", role: "container", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.density,
    tokens: [densityToken("flow")],
    default: null,
    controls: ["margin-block-start"], // the owl > * + *
    mustNeverTouch: ["gap", "padding", "display"],
    notes: "correct only for single-line, source-ordered block/prose flow",
  },
  {
    axis: "padding",
    sibling: "layout", role: "self", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.density,
    tokens: [densityToken("padding"), densityToken("padding-inline"), densityToken("padding-block")],
    subDials: ["inline", "block"],
    dialOf: (word: string) => word.startsWith("padding-inline-") ? "inline" : word.startsWith("padding-block-") ? "block" : null,
    aliasMatch: (word: string) => /^padding-(tight|snug|comfortable|relaxed|loose|separated)$/.test(word),
    default: null,
    // longhands, not the shorthand: the whole-axis form emits `padding` (all sides), the
    // dials emit `padding-inline` / `padding-block`. Listed so the hand `controls` face
    // matches the emitter's real footprint (controls-fidelity check, emit.ts).
    controls: ["padding", "padding-inline", "padding-block"],
    mustNeverTouch: ["margin", "gap", "display"],
    notes: "two sub-dials: inline (padding-inline-*) and block (padding-block-*). `padding-<density>` is the WHOLE-AXIS form (sets both sides), so it conflicts with a per-side dial; `padding-inline-relaxed padding-block-snug` composes.",
  },
  {
    axis: "margin",
    sibling: "layout", role: "member", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.density,
    tokens: [densityToken("margin"), densityToken("margin-inline"), densityToken("margin-block")],
    subDials: ["inline", "block"],
    dialOf: (word: string) => word.startsWith("margin-inline-") ? "inline" : word.startsWith("margin-block-") ? "block" : null,
    aliasMatch: (word: string) => /^margin-(tight|snug|comfortable|relaxed|loose|separated)$/.test(word),
    default: null,
    controls: ["margin", "margin-inline", "margin-block"], // longhands, per padding (controls-fidelity)
    mustNeverTouch: ["padding", "gap", "display"],
    notes: "two sub-dials inline/block; `margin-<density>` is the whole-axis (both-sides) form. marked-by-preference: reach for it only outside container rhythm.",
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
    valueSpace: ["scroll-y", "scroll-x", "scroll-auto", "clip"],
    tokens: [{ pattern: /^(scroll-y|scroll-x|scroll-auto|clip)$/, shape: "<overflow>" }],
    subDials: ["x", "y"],
    dialOf: (word: string) => word === "scroll-x" ? "x" : word === "scroll-y" ? "y" : null,
    aliasMatch: (word: string) => word === "scroll-auto" || word === "clip",
    default: null,
    controls: ["overflow-x", "overflow-y"],
    mustNeverTouch: ["display", "padding"],
    notes: "two sub-dials: scroll-x (overflow-x) and scroll-y (overflow-y) compose; scroll-auto and clip are whole-axis (both directions), so they conflict with a per-axis dial.",
  },
  {
    axis: "constraints",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "free",
    valueSpace: ["min-width-<size>", "max-width-<size>", "min-height-<size>", "max-height-<size>"],
    tokens: [
      { pattern: new RegExp(`^(min-width|max-width|min-height|max-height)-(${SCALES.size.join("|")})$`), shape: "min/max-width/height-<size>", valueDomain: "size-step" },
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
    notes: "four sub-dials, one per longhand. min-width/max-width compose as a width band; min-height/max-height compose as a height band; all four can co-occur. A future semantic check (not yet implemented) should warn when a band is inverted, e.g. min-width-lg max-width-sm.",
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

// implements: R-MOTION-01, R-MOTION-02, R-MOTION-04
export const MOTION: AxisRecord[] = [
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
    controls: ["transition-duration", "transition-timing-function", "transition-delay"],
    mustNeverTouch: ["animation", "transform", "background"],
    notes: "duration/delay magnitudes are open skin scales (R-MOTION-01), not grammar members.",
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
    // skin-rule: the border carrier (R-SKIN-03). Owns `border-color`; carries the
    // same steps + role hues as the other carriers (`rule-fail` = a fail-coloured edge).
    axis: "skin-rule",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["rule", ...carrierSuffixes("rule").map((s) => `rule-${s}`)],
    tokens: [carrierToken("rule")],
    default: null,
    controls: ["border-color"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "border-radius", "font-size"],
  },
  {
    // corner: border-radius magnitude on an ordered radius scale (R-SKIN-06). Shape
    // (round/bevel/…) is deferred until corner-shape has broad support.
    axis: "corner",
    sibling: "skin", role: "self", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: RADIUS_STEPS.map((s) => `corner-${s}`),
    tokens: [scaleToken("corner", RADIUS_STEPS)],
    default: null,
    controls: ["border-radius"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "border-color", "font-size"],
  },
  {
    axis: "skin-surface",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "free",
    valueSpace: ["<border-width>", "<shadow>"],
    tokens: [], // remaining sampled skin (border width/style + shadow) — not yet split into axes
    default: null,
    controls: ["border-width", "border-style", "box-shadow"],
    mustNeverTouch: ["display", "gap", "flex", "position", "background", "color", "border-color", "border-radius"],
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
    // skin-type: the remaining unruled typography (line-height, typeface stack,
    // text-align) — gap-reported until each facet's word form is ruled.
    axis: "skin-type",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "free",
    valueSpace: ["<type-step>"],
    tokens: [],
    default: null,
    controls: ["line-height", "font-family", "text-align"],
    mustNeverTouch: ["display", "gap", "flex", "margin", "font-size", "font-weight"],
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
// scale-bound (R-SCALE-03) but their step names remain open (R-SCALE-02), so they
// are intentionally absent until ruled.
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
  // R-SCALE-03: scale-bound families — grammar owns step names, theme owns numbers.
  scales: {
    radius: RADIUS_STEPS, // R-SKIN-06 corner magnitude
    type: TYPE_STEPS, // R-SKIN-07 size
    weight: WEIGHT_STEPS, // R-SKIN-07 weight
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
// serializes to a selector suffix (`:hover`), not an at-rule. `hover` is admitted now;
// `active`/`focus` are the family the rule opens, admitted as their own evidence lands.
// implements: R-STATE-10
export const INTERACTION_SCOPES: ScopePrefix[] = [
  { id: "hover", pattern: /^hover$/, shape: "hover:", role: "none", note: "conditioned skin while the pointer is over the element" },
];

// Application-asserted state scopes (R-STATE-11). Like interaction scopes they carry a
// conditioned-skin override, but the condition is backed: the element must declare the
// `selectable` capability and the container asserts the state. They serialize to the
// backing attribute selector (`[aria-selected="true"]`), not a pseudo-class.
// implements: R-STATE-11
export const STATE_SCOPES: ScopePrefix[] = [
  { id: "selected", pattern: /^selected$/, shape: "selected:", role: "none", backedBy: "selectable", note: "backed conditioned skin while the element is asserted selected" },
  { id: "checked", pattern: /^checked$/, shape: "checked:", role: "none", backedBy: "selectable", note: "backed conditioned skin while the element is asserted checked" },
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
