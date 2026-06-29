// registry.ts — the machine-readable axis registry.
//
// SINGLE SOURCE OF TRUTH for the derived artifacts (the spec .md, the CSS, the
// lint tests). Extracted from STYLE-GRAMMAR.md (the constitution); when this and
// the constitution disagree, the constitution wins — fix it there, re-extract here.
//
// This file answers the review's structural findings at the data level:
//  - state GROUPS are first-class axes (id `state.<group>`), so "one word per axis"
//    (P1) is naturally enforceable: conflict within a group, compose across groups.
//  - every axis separates the conceptual `valueSpace` (the scale/word set) from the
//    emitted `tokens` (regexes that match REAL authored class strings).
//  - the z-scale (tier-2) and the top-layer-mechanism set (tier-1) are DIFFERENT
//    axes; `modal` is never a z rung.
//  - `basis-exact-*` is token-indexed over the §5.1 size scale, not raw px.
//  - environmental state is a SCOPE PREFIX, not a bare member; parsing yields a
//    `scope`, and P1 runs per-scope (Law 2, amended).

// ============================================================================
// SCALES — named value sets referenced by multiple axes (single-sourced).
// Values themselves are §5.1 generator output (FROZEN as slots); the linter only
// needs the STEP NAMES, which are stable. Swapping the generator does not change
// these names, so the grammar surface is stable even though the numbers are open.
// ============================================================================

export const SCALES = {
  density: ["tight", "snug", "comfortable", "relaxed", "loose", "separated"],
  size: ["sm", "md", "lg", "xl"], // §5.1 size scale — basis-exact-<step>, constraints
  breakpoint: ["sm", "md", "lg", "xl"], // §5.1-style named breakpoint scale
  zTier2: ["base", "content", "raised", "dropdown", "sticky", "tooltip"],
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type Sibling = "layout" | "state" | "motion" | "layering" | "skin";
export type Role = "container" | "member" | "self" | "none";
export type Signature =
  | "set-with-exclusivity"
  | "ordered-chain"
  | "container-operation"
  | "negotiated-field";
export type Vocabulary = "closed" | "open";
export type Regime = "free" | "negotiated";

// state-only refinements
export type StateCategory =
  | "capability"
  | "instance"
  | "conditioned-skin"
  | "relational";
export type Arity = "binary" | "enumerated" | "continuous";
export type Driver = "interaction" | "input" | "environmental";

// A `token` is what the linter actually matches against an authored word.
// `pattern` matches the real emitted class; `captures` documents what the
// capture groups mean (for parse output + error messages).
export interface Token {
  pattern: RegExp;
  // human label for the matched thing, e.g. "gap-<density>" or "grow-N"
  shape: string;
  // for open/parametric tokens: the value's domain, for messages + validation
  valueDomain?: "density-step" | "size-step" | "breakpoint-step" | "integer-≥0" | "enum";
}

// A state member inside a state-group axis.
export interface StateMember {
  word: string;
  arity: Arity;
  driver: Driver;
  stateCategory: StateCategory;
  // backing SET — any-one satisfies entailment (Law 6b). instance/relational only.
  entails?: string[];
  // for relational: the container attribute that must point at this member's id
  relationalBacking?: { containerAttr: string };
  // for enumerated arity: the closed value set
  enumValues?: string[];
  note?: string;
}

export interface AxisRecord {
  axis: string; // unique id; state groups use `state.<group>`
  sibling: Sibling;
  role: Role;
  signature: Signature;
  vocabulary: Vocabulary;
  regime: Regime;

  // CONCEPTUAL member/value space (the scale or word set the grammar reasons in).
  valueSpace: readonly string[];
  // EMITTED tokens — what the linter matches against real authored class strings.
  tokens: Token[];

  default: string | null;
  controls: string[]; // concrete CSS properties (transcribed; see trust boundary)
  mustNeverTouch: string[];

  // state-group axes only:
  stateGroup?: {
    // exclusivity WITHIN the group: "one" = one word per scope (set-with-exclusivity),
    // members from DIFFERENT groups always compose.
    exclusivity: "one" | "many";
    members: StateMember[];
  };

  // environmental scope-prefix axis only (see ENVIRONMENT below):
  scopePrefix?: boolean;

  notes?: string;
}

// helper: build a density-token regex for a property prefix
const densityToken = (prefix: string): Token => ({
  pattern: new RegExp(`^${prefix}-(${SCALES.density.join("|")})$`),
  shape: `${prefix}-<density>`,
  valueDomain: "density-step",
});

// ============================================================================
// 4.1 LAYOUT
// ============================================================================

export const LAYOUT: AxisRecord[] = [
  {
    axis: "structure",
    sibling: "layout", role: "container", signature: "container-operation",
    vocabulary: "closed", regime: "free",
    valueSpace: ["horizontal", "vertical", "rows", "grid"],
    tokens: [{ pattern: /^(horizontal|vertical|rows|grid)$/, shape: "<structure>" }],
    default: "flow", // unmarked inner display; `flow` reserved for default, never a member
    controls: ["display.inner", "flex-direction", "grid-template-columns", "grid-auto-flow"],
    mustNeverTouch: ["gap", "padding", "margin", "align-self", "flex", "background", "border", "display.outer"],
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
    notes: "surface names provisional (alias-law, guide-level)",
  },
  {
    axis: "m2-flex-corner",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "negotiated",
    valueSpace: ["rigid", "compressible", "expandable", "elastic"],
    tokens: [{ pattern: /^(rigid|compressible|expandable|elastic)$/, shape: "<flex-corner>" }],
    default: "compressible",
    controls: ["flex-grow", "flex-shrink"],
    mustNeverTouch: ["flex-basis", "min-width", "max-width", "gap", "align-self"],
    notes: "qualitative corner: rigid=0,0 compressible=0,1 expandable=1,0 elastic=1,1. Composes with the m2-flex-weight axis (constitution §4.1: corner + optional weight).",
  },
  {
    axis: "m2-flex-weight",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "negotiated",
    valueSpace: ["grow-N", "shrink-N"],
    tokens: [{ pattern: /^(grow|shrink)-(\d+)$/, shape: "grow-N | shrink-N", valueDomain: "integer-≥0" }],
    default: null,
    controls: ["flex-grow", "flex-shrink"],
    mustNeverTouch: ["flex-basis", "min-width", "max-width", "gap", "align-self"],
    notes: "the parametric weight (two independent scales). P5 cross-checks against m2-flex-corner: `rigid` + a positive weight is a contradiction.",
  },
  {
    axis: "m3-self-size",
    sibling: "layout", role: "member", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "negotiated",
    valueSpace: ["basis-content", "basis-ratio", "basis-exact-<size>"],
    tokens: [
      { pattern: /^(basis-content|basis-ratio)$/, shape: "basis-content | basis-ratio" },
      { pattern: new RegExp(`^basis-exact-(${SCALES.size.join("|")})$`), shape: "basis-exact-<size>", valueDomain: "size-step" },
    ],
    default: "basis-content",
    controls: ["flex-basis"], // NOT align-self (collision-2 correction)
    mustNeverTouch: ["flex-grow", "flex-shrink", "min-width", "max-width", "align-self"],
    notes: "basis-exact is token-indexed over the §5.1 size scale; arbitrary lengths are OUT in v0.",
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
    vocabulary: "open", regime: "free",
    valueSpace: ["span-all", "span-N", "row-span-N"],
    tokens: [
      { pattern: /^span-all$/, shape: "span-all" },
      { pattern: /^(span|row-span)-(\d+)$/, shape: "span-N | row-span-N", valueDomain: "integer-≥0" },
    ],
    default: "auto-place",
    controls: ["grid-column", "grid-row"],
    mustNeverTouch: ["align-self", "flex", "gap"],
    notes: "only meaningful under a grid parent",
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
    default: null,
    controls: ["padding"],
    mustNeverTouch: ["margin", "gap", "display"],
  },
  {
    axis: "margin",
    sibling: "layout", role: "member", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: SCALES.density,
    tokens: [densityToken("margin"), densityToken("margin-inline"), densityToken("margin-block")],
    default: null,
    controls: ["margin"],
    mustNeverTouch: ["padding", "gap", "display"],
    notes: "marked-by-preference: reach for it only outside container rhythm",
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
    default: null,
    controls: ["align-items", "justify-content"],
    mustNeverTouch: ["align-self", "gap", "padding"],
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
    default: null,
    controls: ["overflow-x", "overflow-y"],
    mustNeverTouch: ["display", "padding"],
  },
  {
    axis: "constraints",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "free",
    valueSpace: ["min-width-<size>", "max-width-<size>"],
    tokens: [
      { pattern: new RegExp(`^(min|max)-width-(${SCALES.size.join("|")})$`), shape: "min/max-width-<size>", valueDomain: "size-step" },
    ],
    default: null,
    controls: ["min-width", "max-width", "min-height", "max-height"],
    mustNeverTouch: ["flex-grow", "flex-shrink", "flex-basis", "width"],
  },
];

// ============================================================================
// 4.4 LAYERING — tier-2 z-scale and tier-1 top-layer are DIFFERENT axes.
// ============================================================================

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
    valueSpace: ["static", "relative", "absolute", "fixed", "sticky"],
    tokens: [{ pattern: /^(static|relative|absolute|fixed|sticky)$/, shape: "<position>" }],
    default: "static",
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
    notes: "duration/delay magnitudes are open skin scales (§5.1), not grammar members.",
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

export const SKIN: AxisRecord[] = [
  {
    axis: "skin-surface",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "free",
    valueSpace: ["<tone>", "<ink>", "<radius>"],
    tokens: [], // skin tokens are theme-bound; sampled here only for disjointness tests
    default: null,
    controls: ["background", "color", "border", "border-radius", "box-shadow"],
    mustNeverTouch: ["display", "gap", "flex", "position"],
  },
  {
    axis: "skin-type",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "open", regime: "free",
    valueSpace: ["<type-step>"],
    tokens: [],
    default: null,
    controls: ["font-size", "line-height", "font-family", "font-weight", "text-align"],
    mustNeverTouch: ["display", "gap", "flex", "margin"],
  },
  {
    // conditioned-skin: the look a state drives. Makes `selectable + selection-subtle` operational.
    axis: "selection-treatment",
    sibling: "skin", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["selection-subtle", "selection-strong"],
    tokens: [{ pattern: /^selection-(subtle|strong)$/, shape: "selection-<x>" }],
    default: null,
    controls: ["background", "color", "outline"],
    mustNeverTouch: ["display", "gap", "flex", "position"],
    notes: "conditioned-skin: entails nothing itself; conditioned by `selected`/`hover`/`active`; pairs with capability `selectable`.",
  },
];

// ============================================================================
// 4.2 STATE — each GROUP is a first-class axis (id `state.<group>`).
// Within a group: set-with-exclusivity (one word per scope). Across groups: compose.
// State controls NOTHING (condition only); composes via state × plane → rule.
// ============================================================================

// helper to build a state-group axis from its members
const stateAxis = (
  group: string,
  members: StateMember[],
  exclusivity: "one" | "many" = "one",
): AxisRecord => ({
  axis: `state.${group}`,
  sibling: "state", role: "none", signature: "set-with-exclusivity",
  vocabulary: "closed", regime: "free",
  valueSpace: members.map((m) => m.word),
  tokens: [{ pattern: new RegExp(`^(${members.flatMap((m) => m.enumValues ? m.enumValues.map(v => `${m.word}-${v}`) : [m.word]).join("|")})$`), shape: `<${group}-state>` }],
  default: null,
  controls: [], // P7-4d: state controls nothing
  mustNeverTouch: ["*"],
  stateGroup: { exclusivity, members },
});

export const STATE: AxisRecord[] = [
  stateAxis("focus", [
    { word: "hover", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":hover"] },
    { word: "focus", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":focus"] },
    { word: "focus-visible", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":focus-visible"] },
    { word: "active", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":active"], note: "the transient press; toggle `pressed` was folded into `selected` (Law 6b)" },
  ]),
  stateAxis("selection", [
    { word: "selectable", arity: "binary", driver: "interaction", stateCategory: "capability", note: "entails nothing; distributes capability down" },
    { word: "selected", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["aria-selected", "aria-pressed", ":checked"], note: "Law 6b merge" },
    { word: "checked-mixed", arity: "enumerated", driver: "interaction", stateCategory: "instance", entails: ["aria-checked=mixed", ":indeterminate"], enumValues: ["mixed"] },
    { word: "current", arity: "enumerated", driver: "interaction", stateCategory: "instance", entails: ["aria-current"], enumValues: ["page", "step", "location", "date", "time", "true"] },
  ]),
  stateAxis("availability", [
    { word: "disabled", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":disabled", "aria-disabled"] },
    { word: "read-only", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":read-only", "aria-readonly"] },
    { word: "busy", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["aria-busy"], note: "visual updating sense only" },
  ]),
  stateAxis("disclosure", [
    { word: "expanded", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["aria-expanded"], note: "in-place disclosure" },
    { word: "open", arity: "binary", driver: "interaction", stateCategory: "instance", entails: ["[open]", ":open", ":popover-open"], note: "top-layer/details presentation" },
  ]),
  stateAxis("validity", [
    { word: "invalid", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":invalid", "aria-invalid"] },
    { word: "user-invalid", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":user-invalid"] },
    { word: "required", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":required", "aria-required"] },
    { word: "out-of-range", arity: "binary", driver: "interaction", stateCategory: "instance", entails: [":out-of-range"] },
  ]),
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

export interface ScopePrefix {
  id: string;
  pattern: RegExp; // matches the PREFIX part (before the colon)
  shape: string;
  role: Role; // container-<bp> is container-role; rest are self/none
  note?: string;
}

export const ENVIRONMENT_SCOPES: ScopePrefix[] = [
  { id: "viewport-bp", pattern: new RegExp(`^viewport-(${SCALES.breakpoint.join("|")})$`), shape: "viewport-<bp>:", role: "none" },
  { id: "viewport-orientation", pattern: /^viewport-(portrait|landscape)$/, shape: "viewport-<orientation>:", role: "none" },
  { id: "container-bp", pattern: new RegExp(`^container-(${SCALES.breakpoint.join("|")})$`), shape: "container-<bp>:", role: "container", note: "conditions on container size; distributes to children" },
  { id: "prefers", pattern: /^prefers-(reduced-motion|color-scheme-dark|contrast-more|reduced-transparency)$/, shape: "prefers-<x>:", role: "none" },
];

// ============================================================================
// THE REGISTRY
// ============================================================================

export const REGISTRY: AxisRecord[] = [
  ...LAYOUT, ...LAYERING, ...MOTION, ...STATE, ...SKIN,
];

// quick self-report when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bySibling = (s: Sibling) => REGISTRY.filter((a) => a.sibling === s).length;
  console.log(`REGISTRY: ${REGISTRY.length} axes`);
  console.log(`  layout=${bySibling("layout")} layering=${bySibling("layering")} motion=${bySibling("motion")} state=${bySibling("state")} skin=${bySibling("skin")}`);
  console.log(`  free=${REGISTRY.filter(a => a.regime === "free").length} negotiated=${REGISTRY.filter(a => a.regime === "negotiated").length}`);
  console.log(`  environment scope-prefixes: ${ENVIRONMENT_SCOPES.length}`);
  console.log(`  state groups: ${STATE.map(s => s.axis.replace("state.", "")).join(", ")}`);
}
