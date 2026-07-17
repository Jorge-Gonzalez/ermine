// playbook.ts — reusable adoption recipes distilled from completed case studies.

import type { CurrentRecord } from "./current-ledger.ts";

export type PlaybookKind = "conversion" | "boundary" | "review";
export type PlaybookConfidence = "mechanical" | "review" | "human";

export interface PlaybookRecipe {
  id: string;
  title: string;
  kind: PlaybookKind;
  confidence: PlaybookConfidence;
  decision: string;
  before: string;
  after: string;
  conversion: string;
  boundary: string;
  evidence: string[];
  match(record: CurrentRecord): boolean;
}

function isRootSelector(selector: string): boolean {
  return /^(html|body|:host)\b/.test(selector);
}

function hasStructuralPseudo(selector: string): boolean {
  return /:(first-child|last-child|first-of-type|last-of-type|nth-child|nth-last-child|nth-of-type|nth-last-of-type|only-child|only-of-type)\b/.test(selector);
}

function hasPseudoDrawing(selector: string): boolean {
  return /::(before|after|placeholder|selection|marker)|::-webkit-/.test(selector);
}

function isElementOwnedSelector(selector: string): boolean {
  return !isRootSelector(selector) && !hasStructuralPseudo(selector) && !hasPseudoDrawing(selector);
}

function isFlatMigrationSurface(record: CurrentRecord): boolean {
  return isElementOwnedSelector(record.selector)
    && record.code !== "user-content"
    && !/content-editor-body/.test(record.selector);
}

function isSpacingProperty(property: string): boolean {
  return /^(padding|padding-inline|padding-block|padding-top|padding-right|padding-bottom|padding-left|margin|margin-inline|margin-block|margin-top|margin-right|margin-bottom|margin-left|gap|row-gap|column-gap)$/.test(property);
}

function isSpacingReset(record: CurrentRecord): boolean {
  return /^(padding|padding-inline|padding-block|padding-top|padding-right|padding-bottom|padding-left|margin|margin-inline|margin-block|margin-top|margin-right|margin-bottom|margin-left)$/.test(record.property)
    && record.value === "0";
}

function isSpacingVar(value: string): boolean {
  return /^var\(--spacing-[^)]+\)$/.test(value);
}

function numericPx(value: string): number | undefined {
  const px = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return Number(px[1]);
  const rem = value.match(/^(-?\d+(?:\.\d+)?)rem$/);
  if (rem) return Number(rem[1]) * 16;
  return undefined;
}

function isNamedSpacingScale(value: string): boolean {
  const px = numericPx(value);
  return px !== undefined && [4, 8, 12, 16, 20, 24, 40].includes(px);
}

function isProjectTypeScaleToken(record: CurrentRecord): boolean {
  return record.property === "font-size" && /^var\(--(?:type|text)-[a-z0-9-]+\)$/.test(record.value);
}

function isSpacingShorthandWithZero(record: CurrentRecord): boolean {
  if (!/^(padding|margin)$/.test(record.property)) return false;
  return /\b0\b/.test(record.value) && /var\(--spacing-/.test(record.value);
}

function isPhysicalSpacingEdge(property: string): boolean {
  return /^(padding|margin)-(top|right|bottom|left)$/.test(property);
}

function isLogicalSpacingAxis(property: string): boolean {
  return /^(padding|margin)-(inline|block)$/.test(property);
}

function isRuleEdgeProperty(property: string): boolean {
  return /^border-(top|right|bottom|left)-/.test(property);
}

function isCornerSideProperty(property: string): boolean {
  return /^border-(top|bottom)-(left|right)-radius$/.test(property);
}

function isTargetedTween(record: CurrentRecord): boolean {
  return record.property === "transition-property"
    && /^(background|background-color|color|border-color|opacity|transform)(,\s*(background|background-color|color|border-color|opacity|transform))*$/.test(record.value);
}

function isAttachmentEdge(record: CurrentRecord): boolean {
  return /^(top|right|bottom|left)$/.test(record.property)
    && /^(0|100%)$/.test(record.value);
}

function isMeasureOrControlSize(record: CurrentRecord): boolean {
  return /^(width|height|min-width|max-width|min-height|max-height)$/.test(record.property)
    && /^(0|none|auto|\d+(?:\.\d+)?px|\d+(?:\.\d+)?rem|8em|100%|100vh|fit-content\([^)]*\)|min\([^)]*\))$/.test(record.value);
}

function isControlStateRecipe(record: CurrentRecord): boolean {
  return (record.file.endsWith("controls.css")
    && (/\.btn:disabled\b/.test(record.selector)
      || /\.selectable-group\b/.test(record.selector)
      || /\.min-selected-1\b/.test(record.selector)
      || /\.radio-label\b/.test(record.selector)))
    || /\.(seg-option)\s+svg\b/.test(record.selector);
}

export const PLAYBOOK_RECIPES: PlaybookRecipe[] = [
  {
    id: "existing-scale-word",
    title: "Existing scale word",
    kind: "conversion",
    confidence: "review",
    decision: "When a residue declaration already maps to an admitted spacing or type scale, migrate the class paragraph before considering new grammar.",
    before: "margin-right: 1rem; font-size: var(--text-base);",
    after: "margin-right-lg font-md",
    conversion: "Confirm the project token or numeric value is bound to the Ermine scale, then replace the local declaration with the matching existing word.",
    boundary: "Do not use this for off-scale micro-values, project-specific departures, or token aliases that are not intentionally bridged to Ermine.",
    evidence: ["Monky modal nav scale-token migration", "docs/ADOPTION-PLAYBOOK.md"],
    match: (record) => isFlatMigrationSurface(record)
      && ((isSpacingProperty(record.property) && (isSpacingVar(record.value) || isNamedSpacingScale(record.value)))
        || isProjectTypeScaleToken(record)),
  },
  {
    id: "spacing-none-endpoints",
    title: "Spacing zero endpoints",
    kind: "conversion",
    confidence: "mechanical",
    decision: "A zero padding or margin on an element-owned footprint is positive grammar: use the `none` endpoint on that same footprint.",
    before: "padding: 0; margin-left: 0;",
    after: "padding-none margin-left-none",
    conversion: "Use whole, logical, or physical padding/margin `none` words. For asymmetric shorthands, decompose to physical edges rather than composing a shorthand plus override.",
    boundary: "Do not apply this to document roots, substrate resets, or structural selectors such as `:first-child`; those are selector/root mechanics.",
    evidence: ["ADR-0053-spacing-none-endpoints", "Monky ab1864e", "Ermine e22bcf3"],
    match: (record) => isSpacingReset(record) && isFlatMigrationSurface(record),
  },
  {
    id: "spacing-edge-decomposition",
    title: "Asymmetric spacing edge decomposition",
    kind: "conversion",
    confidence: "mechanical",
    decision: "Asymmetric spacing belongs to non-overlapping physical edge dials.",
    before: "padding: var(--spacing-md) var(--spacing-sm) 0 0;",
    after: "padding-top-md padding-right-sm padding-bottom-none padding-left-none",
    conversion: "Expand two-, three-, and four-value padding/margin shorthands into the exact top/right/bottom/left words when any edge differs.",
    boundary: "Keep raw micro-padding and user-content rhythm local until the density or prose molecule has a ruling.",
    evidence: ["ADR-0043-per-edge-spacing-facets", "ADR-0053-spacing-none-endpoints", "Monky per-edge and spacing-none migrations"],
    match: (record) => isFlatMigrationSurface(record)
      && (isSpacingShorthandWithZero(record) || (isPhysicalSpacingEdge(record.property) && (isSpacingVar(record.value) || record.value === "0"))),
  },
  {
    id: "spacing-logical-axis",
    title: "Homogeneous logical spacing axis",
    kind: "conversion",
    confidence: "mechanical",
    decision: "Homogeneous inline/block spacing uses the logical axis word rather than physical edge duplication.",
    before: "padding: var(--spacing-sm) 0; margin: 0 var(--spacing-xs);",
    after: "padding-block-sm padding-inline-none; margin-block-none margin-inline-xs",
    conversion: "Use `padding-block-*`, `padding-inline-*`, `margin-block-*`, or `margin-inline-*` when both edges on the axis share a value.",
    boundary: "If the two edges on an axis differ, decompose to physical edges.",
    evidence: ["ADR-0022-spacing-tshirt", "ADR-0043-per-edge-spacing-facets", "ADR-0053-spacing-none-endpoints"],
    match: (record) => isFlatMigrationSurface(record) && isLogicalSpacingAxis(record.property) && (isSpacingVar(record.value) || record.value === "0"),
  },
  {
    id: "dimension-role-measure",
    title: "Role-measured dimensions",
    kind: "conversion",
    confidence: "review",
    decision: "Repeated dimensions should map to semantic measure/control/result/dialog roles, not anonymous one-off numbers.",
    before: "max-width: 360px; width: 32px; height: 32px;",
    after: "max-width-popover-2xl control-box-xl",
    conversion: "Cluster repeated values by role, bind the project metric, admit or use a role word, then migrate the element class string.",
    boundary: "One-off component geometry stays local unless it recurs or clearly expresses a general role.",
    evidence: ["ADR-0047-role-measured-dimensions", "Monky role-measured dimension pass"],
    match: (record) => isMeasureOrControlSize(record),
  },
  {
    id: "edge-attachment",
    title: "Positioned edge attachment",
    kind: "conversion",
    confidence: "review",
    decision: "Relational edge attachment is grammar when it describes where an overlay or arrow attaches.",
    before: "top: 100%; bottom: 100%; left: 0; right: 0;",
    after: "attach-below attach-above stretch-inline",
    conversion: "Map `top: 100%` to `attach-below`, `bottom: 100%` to `attach-above`, and paired `left/right: 0` to `stretch-inline`.",
    boundary: "One-sided pixel offsets and pseudo-element drawing geometry remain component-owned.",
    evidence: ["ADR-0045-positioned-edge-attachment", "Monky positioned edge-attachment pass"],
    match: (record) => isAttachmentEdge(record),
  },
  {
    id: "targeted-tween",
    title: "Property-targeted tweens",
    kind: "conversion",
    confidence: "review",
    decision: "Repeated transition-property sets deserve targeted tween envelopes rather than `transition: all` or local repeats.",
    before: "transition-property: background, color;",
    after: "tween-ground-ink-quick",
    conversion: "Normalize the property set, bind the duration socket, and use the matching targeted tween word.",
    boundary: "Suppression such as `transition: none !important` and bespoke recipe timing stay local until separately ruled.",
    evidence: ["ADR-0044-targeted-tween-envelopes", "Monky targeted tween pass"],
    match: (record) => isTargetedTween(record),
  },
  {
    id: "rule-edge-facets",
    title: "Side rule presence and colour facets",
    kind: "conversion",
    confidence: "review",
    decision: "Line presence and edge colour should use footprint-aware rule facets when the edge is meaningful.",
    before: "border-left-width: 1px; border-bottom-color: transparent;",
    after: "ruled-left rule-bottom-transparent",
    conversion: "Replace side-specific border presence/colour declarations with the matching rule edge word.",
    boundary: "Hairline metrics in substrate or pseudo drawing remain local.",
    evidence: ["ADR-0048-rule-presence-edge-dials", "ADR-0050-rule-edge-colour-facets"],
    match: (record) => isRuleEdgeProperty(record.property),
  },
  {
    id: "side-corner-facets",
    title: "Side corner facets",
    kind: "conversion",
    confidence: "review",
    decision: "Joined or open sides use side corner facets instead of ad hoc individual corner resets.",
    before: "border-top-left-radius: 0; border-top-right-radius: 0;",
    after: "corner-top-none",
    conversion: "Use top/bottom side corner words, including `none` endpoints, when a side opens or joins.",
    boundary: "Object-specific drawing radii on pseudo-elements remain local unless a recipe promotes them.",
    evidence: ["ADR-0046-side-corner-facets", "Monky side-corner pass"],
    match: (record) => isCornerSideProperty(record.property),
  },
  {
    id: "state-backed-prefix",
    title: "Backed state prefixes",
    kind: "conversion",
    confidence: "mechanical",
    decision: "ARIA/platform-backed states can carry scoped skin words when the element has the required capability/backing.",
    before: "[aria-pressed=\"true\"] { color: var(--accent); }",
    after: "pressable pressed:ink-accent",
    conversion: "Use `checked:`, `selected:`, `pressed:`, `expanded:`, or `current:` only with their required backing/capability.",
    boundary: "JS-only classes, structural pseudo-classes, and unbacked parent state remain local or recipe unless a condition is admitted.",
    evidence: ["ADR-0051-pressed-condition-prefix", "ADR-0052-expanded-condition-prefix", "R-STATE-11", "R-STATE-12"],
    match: (record) => /\[aria-(pressed|expanded|selected|checked|current)[^\]]*\]/.test(record.selector),
  },
  {
    id: "control-state-recipe-boundary",
    title: "Control-state recipe boundary",
    kind: "boundary",
    confidence: "review",
    decision: "Component state contracts such as disabled neutralization, selectable-group mechanics, minimum-selection guards, and clickable labels are recipes, not flat state words.",
    before: ".btn:disabled:hover { opacity: 0.6; } .min-selected-1 > .is-selected:only-of-type { cursor: not-allowed; }",
    after: "keep local as control-state recipe unless a reused component molecule is admitted",
    conversion: "Separate Ermine-owned perceptual state skin from project-owned behavior and invariant selectors.",
    boundary: "Do not coin words for JS invariants, structural guards, hover neutralization policies, or parent/child control contracts.",
    evidence: ["Monky control-state residue", "R-SKIN-10 recipe boundary", "reports/adoption/monky/RULE-RESIDUE-ANALYSIS.md"],
    match: isControlStateRecipe,
  },
  {
    id: "root-and-structural-reset-boundary",
    title: "Root and structural zero-reset boundary",
    kind: "boundary",
    confidence: "mechanical",
    decision: "Root resets and structural selector offsets are not element-owned Ermine class paragraphs.",
    before: "body { margin: 0; padding: 0; } .item:first-child { margin-left: 0; }",
    after: "keep local as substrate/page or selector mechanics",
    conversion: "Classify as boundary even when an admitted `none` word can emit the same declaration.",
    boundary: "Only migrate zero spacing when it belongs to an authored element class string.",
    evidence: ["Ermine e22bcf3", "test: current ledger keeps structural and document-root zero spacing out of the work list"],
    match: (record) => isSpacingReset(record) && (isRootSelector(record.selector) || hasStructuralPseudo(record.selector)),
  },
  {
    id: "pseudo-drawing-boundary",
    title: "Pseudo-element drawing boundary",
    kind: "boundary",
    confidence: "mechanical",
    decision: "Generated content and pseudo-element geometry are component drawing unless a recipe or word explicitly owns the pseudo-element.",
    before: "::before { content: ''; inset: 0; }",
    after: "keep local or promote as a recipe/molecule",
    conversion: "Do not flatten pseudo drawing into ordinary element words.",
    boundary: "A future recipe may own the pseudo-element as part of a named molecule.",
    evidence: ["Monky kbd, arrow, and segmented-control residue", "R-SKIN-10 recipe boundary"],
    match: (record) => hasPseudoDrawing(record.selector) || record.property === "content",
  },
  {
    id: "authored-content-substrate-boundary",
    title: "Authored-content substrate boundary",
    kind: "boundary",
    confidence: "human",
    decision: "Rich-text defaults inside user-authored content are a neutral authored-HTML substrate, not scattered flat utility gaps.",
    before: ".content-editor-body h1 { margin: 0.75em 0 0.4em; }",
    after: "keep local as authored-content substrate unless a project explicitly adopts a prose recipe",
    conversion: "Group descendant typography and rhythm as authored-content substrate evidence.",
    boundary: "Do not migrate descendant user-content rows into ordinary element class strings.",
    evidence: ["Monky user-content residue", "reports/adoption/monky/BOUNDARY.md"],
    match: (record) => /content-editor-body/.test(record.selector) || record.code === "user-content",
  },
];

export function matchPlaybookRecipes(record: CurrentRecord): PlaybookRecipe[] {
  return PLAYBOOK_RECIPES.filter((recipe) => recipe.match(record));
}

export function playbookRecipeById(id: string): PlaybookRecipe | undefined {
  return PLAYBOOK_RECIPES.find((recipe) => recipe.id === id);
}
