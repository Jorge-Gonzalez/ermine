// rule-action-review.ts — derived review overlay for current adoption ledgers.
//
// The current ledger answers "can Ermine express this declaration today?".
// This overlay answers the next question: "if not today, what kind of
// generalization pressure does the declaration create?" It intentionally keeps
// strict ledger counts intact and writes separate reports beside each
// current-ledger.json.

import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { REASON_CODES, type CurrentRecord, type ReasonCode } from "./current-ledger.ts";
import { PLAYBOOK_RECIPES, matchPlaybookRecipes, playbookRecipeById } from "./playbook.ts";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const INFRASTRUCTURE_CODES = new Set<ReasonCode>([
  "ermine-emitted",
  "substrate",
  "theme-metric",
  "config-departure",
]);

const RULE_ACTIONS = [
  "already-admitted",
  "dimension-constraint",
  "attachment-edge-layer",
  "spacing-rhythm",
  "alignment-layout",
  "surface-line-elevation-cutout",
  "typography-content",
  "interaction-affordance-state",
  "motion-transition",
  "reset-inheritance-neutralization",
  "component-private-drawing",
] as const;

type RuleAction = typeof RULE_ACTIONS[number];

const LATENT_OUTCOMES = [
  "admitted",
  "latent-word",
  "latent-facet",
  "latent-scale",
  "recipe",
  "local-identity",
] as const;

type LatentOutcome = typeof LATENT_OUTCOMES[number];

interface CurrentLedgerInput {
  version: 2;
  project: string;
  source: { ermineCommit: string; projectCommit: string };
  summary: {
    totalDeclarations: number;
    residueDeclarations: number;
    assimilable: number;
    byCode: Record<ReasonCode, number>;
  };
  records: CurrentRecord[];
}

interface ReviewedDeclaration {
  id: string;
  file: string;
  line: number;
  selector: string;
  property: string;
  value: string;
  currentCode: ReasonCode;
  ruleAction: RuleAction;
  latentOutcome: LatentOutcome;
  function: string;
  erminePressure: string;
  scaleMapping?: string;
  proposedForm?: string;
  playbookRecipes?: string[];
}

interface DimensionPilotEntry extends ReviewedDeclaration {
  dimensionIntent: string;
}

interface RuleActionReview {
  version: 1;
  project: string;
  source: { ermineCommit: string; projectCommit: string };
  inputs: { currentLedger: string };
  summary: {
    reviewedDeclarations: number;
    assimilableNow: number;
    latentGeneralizable: number;
    likelyRecipe: number;
    likelyLocal: number;
    byRuleAction: Record<RuleAction, number>;
    byLatentOutcome: Record<LatentOutcome, number>;
    byCurrentCode: Record<ReasonCode, number>;
    byPlaybookRecipe: Record<string, number>;
  };
  declarations: ReviewedDeclaration[];
  dimensionPilot: {
    summary: {
      declarations: number;
      latentScale: number;
      latentWord: number;
      latentFacet: number;
      recipe: number;
      localIdentity: number;
    };
    entries: DimensionPilotEntry[];
  };
}

function countRecord<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

function slash(path: string): string {
  return path.replaceAll("\\", "/");
}

async function readOptional(path: string): Promise<string | undefined> {
  try {
    await access(path, constants.R_OK);
    return readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function findCurrentLedgerPaths(repositoryRoot: string): Promise<string[]> {
  const adoptionRoot = resolve(repositoryRoot, "reports/adoption");
  const entries = await readdir(adoptionRoot, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const paths: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = resolve(adoptionRoot, entry.name, "current-ledger.json");
    try {
      await access(candidate, constants.R_OK);
      paths.push(candidate);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return paths.sort();
}

function hasStateSelector(record: CurrentRecord): boolean {
  return /:(hover|active|focus|focus-within|focus-visible|disabled)\b|\[aria-(selected|checked|current|disabled)[^\]]*\]|\[data-state[^\]]*\]|\.is-(active|selected|sliding)\b|:only-of-type\b/.test(record.selector);
}

function isRootSelector(selector: string): boolean {
  return /^(html|body|:host)\b/.test(selector);
}

function hasStructuralPseudo(selector: string): boolean {
  return /:(first-child|last-child|first-of-type|last-of-type|nth-child|nth-last-child|nth-of-type|nth-last-of-type|only-child|only-of-type)\b/.test(selector);
}

function isPseudoDrawing(record: CurrentRecord): boolean {
  return /::(before|after|placeholder|marker)|::-webkit-/.test(record.selector) || record.property === "content";
}

function isComponentDrawing(record: CurrentRecord): boolean {
  return isPseudoDrawing(record)
    || /\.sf-(?:callout-arrow|segmented-pill|keycap|generated-placeholder)\b/.test(record.selector)
    || /\.macro-suggestions-arrow\b/.test(record.selector)
    || /\.seg-control\b/.test(record.selector)
    || /\.macro-search-kbd\b/.test(record.selector)
    || /\.macro-suggestions-kbd\b/.test(record.selector);
}

function isTopLayerOrExtensionPolicy(record: CurrentRecord): boolean {
  return (record.property === "z-index" && /^(10000|2147483646\b)/.test(record.value))
    || (record.property === "position" && record.value === "fixed !important" && /:host|#macro-suggestions/.test(record.selector));
}

function isSubstrateLeading(record: CurrentRecord): boolean {
  return record.property === "line-height" && /:host|body/.test(record.selector);
}

function isMicroDensityRecipe(record: CurrentRecord): boolean {
  if (/macro-suggestions-command-item/.test(record.selector) && record.property === "padding" && record.value === "3px 6px") return true;
  return /ce-style-(trigger|dropdown)/.test(record.selector) && record.property === "gap" && record.value === "2px";
}

function isLocalAttachmentOffset(record: CurrentRecord): boolean {
  if (/editor-toast/.test(record.selector) && record.property === "bottom" && record.value === "52px") return true;
  if (/macro-search-item-edit/.test(record.selector) && record.property === "right") return true;
  if (/ce-style-dropdown/.test(record.selector) && /^(top|left)$/.test(record.property)) return true;
  return false;
}

function isLocalChromeTreatment(record: CurrentRecord): boolean {
  return (/modal-backdrop/.test(record.selector) && record.property === "background-color" && record.value === "var(--shadow-color)")
    || (/ce-toolbar-sep/.test(record.selector) && record.property === "background-color");
}

function isDimensionProperty(property: string): boolean {
  return /^(width|height|min-width|max-width|min-height|max-height|inline-size|block-size|min-inline-size|max-inline-size|min-block-size|max-block-size|flex|flex-basis|flex-grow|flex-shrink)$/.test(property);
}

function isAttachmentProperty(property: string): boolean {
  return /^(position|inset|top|right|bottom|left|z-index|pointer-events)$/.test(property);
}

function isSpacingProperty(property: string): boolean {
  return /^(padding|padding-inline|padding-block|padding-top|padding-right|padding-bottom|padding-left|margin|margin-inline|margin-block|margin-top|margin-right|margin-bottom|margin-left|gap|row-gap|column-gap)$/.test(property);
}

function isAlignmentProperty(property: string): boolean {
  return /^(align-content|justify-content|place-content)$/.test(property);
}

function isSurfaceProperty(property: string): boolean {
  return /^(background|background-color|color|border|border-color|border-top|border-right|border-bottom|border-left|border-top-color|border-right-color|border-bottom-color|border-left-color|border-width|border-style|border-top-width|border-right-width|border-bottom-width|border-left-width|border-top-style|border-right-style|border-bottom-style|border-left-style|border-radius|border-top-left-radius|border-top-right-radius|border-bottom-left-radius|border-bottom-right-radius|box-shadow|outline|outline-offset|mix-blend-mode)$/.test(property);
}

function isTypographyProperty(property: string): boolean {
  return /^(font|font-family|font-size|font-weight|font-style|font-variant|font-variant-numeric|line-height|letter-spacing|text-transform|text-align|text-decoration|white-space|overflow|overflow-x|overflow-y|text-overflow|list-style|list-style-type|display)$/.test(property);
}

function isInteractionProperty(property: string): boolean {
  return /^(cursor|user-select|opacity|transform|vertical-align)$/.test(property);
}

function isMotionProperty(property: string): boolean {
  return /^(transition|transition-property|transition-duration|transition-timing-function|animation|animation-name|animation-duration|animation-timing-function)$/.test(property);
}

function isResetValue(record: CurrentRecord): boolean {
  const value = record.value.toLowerCase();
  return record.code === "reset-absence"
    || value === "none"
    || value === "transparent"
    || value === "inherit"
    || value === "normal"
    || value === "0"
    || value === "auto";
}

function classifyRuleAction(record: CurrentRecord): RuleAction {
  if (record.code === "assimilable") return "already-admitted";
  if (isMotionProperty(record.property)) return "motion-transition";
  if (isComponentDrawing(record)) return "component-private-drawing";
  if (isResetValue(record) && !isDimensionProperty(record.property) && !isSpacingProperty(record.property)) {
    return "reset-inheritance-neutralization";
  }
  if (isDimensionProperty(record.property)) return "dimension-constraint";
  if (isAttachmentProperty(record.property)) return "attachment-edge-layer";
  if (isSpacingProperty(record.property)) return "spacing-rhythm";
  if (isAlignmentProperty(record.property)) return "alignment-layout";
  if (isSurfaceProperty(record.property)) return "surface-line-elevation-cutout";
  if (isTypographyProperty(record.property) || record.code === "user-content" || record.code === "brand-identity") {
    return "typography-content";
  }
  if (isInteractionProperty(record.property) || hasStateSelector(record)) return "interaction-affordance-state";
  return record.code === "recipe-identity" ? "component-private-drawing" : "surface-line-elevation-cutout";
}

function classifyLatentOutcome(record: CurrentRecord, action: RuleAction): LatentOutcome {
  if (record.code === "assimilable") return "admitted";
  if (record.code === "recipe-identity") return "recipe";
  if (record.code === "user-content") return "recipe";
  if (action === "component-private-drawing") return "recipe";
  if (isTopLayerOrExtensionPolicy(record)) return "local-identity";
  if (isSubstrateLeading(record)) return "local-identity";
  if (isMicroDensityRecipe(record)) return "recipe";
  if (isLocalAttachmentOffset(record)) return "recipe";
  if (isLocalChromeTreatment(record)) return "recipe";
  if (isSpacingResetBoundary(record)) return "local-identity";
  if (isSearchHighlightReset(record)) return "recipe";
  if (isShakeTransitionSuppression(record)) return "local-identity";
  if (/content-editor-body|sf-authored-content/.test(record.selector)) return "recipe";
  if (record.code === "brand-identity") {
    return record.property === "font-family" ? "local-identity" : "latent-word";
  }
  if (action === "motion-transition") {
    return /\.seg-control\b|\.sf-segmented-pill\b/.test(record.selector) ? "recipe" : "latent-word";
  }
  if (action === "dimension-constraint") {
    if (/^flex/.test(record.property)) return "latent-facet";
    if (record.value === "none" || record.value === "0" || record.value === "auto") return "latent-facet";
    if (/^(min|max)\(|%|vh|vw|em|fr|fit-content|calc\(/.test(record.value)) return "latent-word";
    return "latent-scale";
  }
  if (action === "spacing-rhythm") return /var\(--spacing-/.test(record.value) ? "latent-facet" : "latent-scale";
  if (action === "alignment-layout") return "latent-facet";
  if (action === "attachment-edge-layer") return /^(z-index|position)$/.test(record.property) ? "latent-word" : "latent-facet";
  if (action === "surface-line-elevation-cutout") {
    if (record.property === "box-shadow" || record.property === "mix-blend-mode") return "recipe";
    return "latent-facet";
  }
  if (action === "typography-content") {
    return /content-editor-body|sf-authored-content| mark\b|::/.test(record.selector) ? "recipe" : "latent-word";
  }
  if (action === "interaction-affordance-state") {
    return /:only-of-type|\.min-selected-1\b/.test(record.selector) ? "recipe" : "latent-facet";
  }
  if (action === "reset-inheritance-neutralization") return "latent-facet";
  return record.code === "component-contract" ? "recipe" : "local-identity";
}

function isSpacingResetBoundary(record: CurrentRecord): boolean {
  return isSpacingProperty(record.property)
    && record.value === "0"
    && (isRootSelector(record.selector) || hasStructuralPseudo(record.selector));
}

function isSearchHighlightReset(record: CurrentRecord): boolean {
  return record.code === "reset-absence" && / mark\b/.test(record.selector);
}

function isShakeTransitionSuppression(record: CurrentRecord): boolean {
  return record.code === "motion-followup"
    && /\.shake\b/.test(record.selector)
    && record.property === "transition"
    && /^none\b/.test(record.value);
}

function functionSummary(action: RuleAction): string {
  switch (action) {
    case "already-admitted": return "matches an existing Ermine word";
    case "dimension-constraint": return "sets physical envelope, measure, control size, or constraint";
    case "attachment-edge-layer": return "attaches to an edge, offsets a local affordance, or asserts stack order";
    case "spacing-rhythm": return "distributes padding, margin, or cluster rhythm";
    case "alignment-layout": return "aligns content or children inside a layout container";
    case "surface-line-elevation-cutout": return "paints/removes surface, line, radius, shadow, or cutout state";
    case "typography-content": return "sets typeface, emphasis, wrapping, rich content, or text semantics";
    case "interaction-affordance-state": return "expresses hover, active, selected, disabled, focus, or affordance state";
    case "motion-transition": return "defines animated properties, timing, or tween suppression";
    case "reset-inheritance-neutralization": return "removes defaults or forces inheritance so authored words can take over";
    case "component-private-drawing": return "draws a specific object from CSS primitives";
  }
}

function pressureSummary(outcome: LatentOutcome, action: RuleAction): string {
  if (outcome === "admitted") return "migrate to existing words";
  if (outcome === "local-identity") return "keep local after invariance/scale tests";
  if (outcome === "recipe") return "promote as molecule/recipe only if reused";
  if (outcome === "latent-scale") return "map to an existing/proportional scale or admit a named scale role";
  if (outcome === "latent-facet") return "add a missing facet on an existing Ermine concept";
  if (action === "attachment-edge-layer") return "admit relational attachment/layer word";
  if (action === "motion-transition") return "admit property-targeted tween word";
  return "admit a new Ermine word only if it survives the invariance test";
}

const PX_TO_SPACING: Record<number, string> = {
  4: "spacing-xs",
  8: "spacing-sm",
  12: "spacing-md",
  16: "spacing-lg",
  20: "spacing-xl",
  24: "spacing-2xl",
  40: "spacing-3xl",
};

function numericPx(value: string): number | undefined {
  const px = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (px) return Number(px[1]);
  const rem = value.match(/^(-?\d+(?:\.\d+)?)rem$/);
  if (rem) return Number(rem[1]) * 16;
  return undefined;
}

function scaleMapping(record: CurrentRecord, action: RuleAction): string | undefined {
  if (action === "spacing-rhythm" && /var\(--spacing-/.test(record.value)) {
    return record.value.replace(/^var\(--/, "").replace(/\)$/, "");
  }
  if (action !== "dimension-constraint" && action !== "spacing-rhythm" && action !== "surface-line-elevation-cutout") {
    return undefined;
  }
  const px = numericPx(record.value);
  if (px === undefined) {
    if (/^min\(|^calc\(|vw|vh|%/.test(record.value)) return "proportional/viewport relation";
    if (/em$/.test(record.value)) return "content-relative measure";
    if (/var\(--size-/.test(record.value)) return record.value.replace(/^var\(--/, "").replace(/\)$/, "");
    return undefined;
  }
  if (PX_TO_SPACING[px]) return PX_TO_SPACING[px];
  if (px % 40 === 0) return `${px / 40} * spacing-3xl`;
  if (px % 24 === 0) return `${px / 24} * spacing-2xl`;
  if (px % 16 === 0) return `${px / 16} * spacing-lg`;
  if (px % 8 === 0) return `${px / 8} * spacing-sm`;
  return "off current named scale";
}

function proposedForm(record: CurrentRecord, action: RuleAction, outcome: LatentOutcome): string | undefined {
  if (outcome === "local-identity") return "keep local";
  if (outcome === "recipe") {
    if (/kbd|sf-keycap/.test(record.selector)) return "keycap/kbd recipe";
    if (/seg-control|sf-segmented-pill/.test(record.selector)) return "segmented-control recipe";
    if (/arrow|sf-callout-arrow/.test(record.selector)) return "callout-arrow recipe";
    if (/\.editor-content\s+\.content-editor-body\b/.test(record.selector)) return "editor layout bridge";
    if (/content-editor-body|sf-authored-content/.test(record.selector)) return "authored-content substrate";
    return "recipe/molecule socket";
  }
  if (action === "dimension-constraint") return dimensionProposal(record);
  if (action === "spacing-rhythm") return "per-edge spacing facet or smaller density step";
  if (action === "attachment-edge-layer") {
    if (record.property === "z-index") return "layer tier";
    if (record.property === "position") return "position/layer mechanism";
    return "edge attachment facet";
  }
  if (action === "alignment-layout") return "content-alignment facet";
  if (action === "surface-line-elevation-cutout") return "side-specific rule/radius/state-skin facet";
  if (action === "motion-transition") return "property-targeted tween or tween suppression word";
  if (action === "reset-inheritance-neutralization") return "negative/escape facet";
  if (action === "typography-content") return "wrap/list/code word, authored-content substrate, or molecule";
  if (action === "interaction-affordance-state") return "condition-backed state skin/affordance facet";
  return undefined;
}

function dimensionIntent(record: Pick<CurrentRecord, "property" | "selector" | "value">): string {
  const { property, selector, value } = record;
  if (/^(flex|flex-basis|flex-grow|flex-shrink)$/.test(property)) return "flex negotiation";
  if (/^min\(/.test(value)) return "bounded dialog/container measure";
  if (/^(width|height)$/.test(property) && /^(16px|18px|24px|28px|2rem|3rem)$/.test(value)) return "icon/control square";
  if (/^(min-width|max-width|width)$/.test(property) && /^(8em|200px|240px|280px|320px|360px)$/.test(value)) return "inline measure/popover width";
  if (/^max-height$/.test(property)) return /result/.test(selector) ? "scrollable result cap" : "block-size cap";
  if (/^min-height$/.test(property) && value === "0") return "min-content escape";
  if (/^min-height$/.test(property)) return "interaction/content floor";
  if (/^height$/.test(property)) return "block-size measure";
  return "dimension constraint";
}

function dimensionProposal(record: CurrentRecord): string {
  const intent = dimensionIntent(record);
  const value = record.value;
  if (intent === "flex negotiation") return "flex-negotiation facet or shorthand decomposition";
  if (intent === "icon/control square") return "square/icon/control-size scale member";
  if (intent === "inline measure/popover width") return "measure/popover size role";
  if (intent === "bounded dialog/container measure") return "dialog-measure recipe with viewport bound";
  if (intent === "scrollable result cap") return "max-block/scroll-cap scale";
  if (intent === "interaction/content floor") return "control-min-block or editor-min-block";
  if (intent === "min-content escape") return "min-height-none escape, possibly layer/specificity fix";
  if (value === "none" || value === "0" || value === "auto") return "constraint reset/escape facet";
  return "size/measure scale role";
}

function reviewRecord(record: CurrentRecord): ReviewedDeclaration {
  const ruleAction = classifyRuleAction(record);
  const latentOutcome = classifyLatentOutcome(record, ruleAction);
  const playbookRecipes = matchPlaybookRecipes(record).map((recipe) => recipe.id);
  return {
    id: record.id,
    file: record.file,
    line: record.line,
    selector: record.selector,
    property: record.property,
    value: record.value,
    currentCode: record.code,
    ruleAction,
    latentOutcome,
    function: functionSummary(ruleAction),
    erminePressure: pressureSummary(latentOutcome, ruleAction),
    ...(scaleMapping(record, ruleAction) ? { scaleMapping: scaleMapping(record, ruleAction) } : {}),
    ...(proposedForm(record, ruleAction, latentOutcome) ? { proposedForm: proposedForm(record, ruleAction, latentOutcome) } : {}),
    ...(playbookRecipes.length ? { playbookRecipes } : {}),
  };
}

function buildReview(ledger: CurrentLedgerInput, inputPath: string, repositoryRoot: string): RuleActionReview {
  const declarations = ledger.records
    .filter((record) => !INFRASTRUCTURE_CODES.has(record.code))
    .map(reviewRecord);
  const byRuleAction = countRecord(RULE_ACTIONS);
  const byLatentOutcome = countRecord(LATENT_OUTCOMES);
  const byCurrentCode = countRecord(REASON_CODES);
  const byPlaybookRecipe = countRecord(PLAYBOOK_RECIPES.map((recipe) => recipe.id));
  for (const declaration of declarations) {
    byRuleAction[declaration.ruleAction] += 1;
    byLatentOutcome[declaration.latentOutcome] += 1;
    byCurrentCode[declaration.currentCode] += 1;
    for (const recipe of declaration.playbookRecipes ?? []) byPlaybookRecipe[recipe] += 1;
  }
  const dimensionEntries = declarations
    .filter((declaration) => declaration.ruleAction === "dimension-constraint")
    .map((declaration): DimensionPilotEntry => ({
      ...declaration,
      dimensionIntent: dimensionIntent(declaration),
    }));
  return {
    version: 1,
    project: ledger.project,
    source: ledger.source,
    inputs: { currentLedger: slash(relative(repositoryRoot, inputPath)) },
    summary: {
      reviewedDeclarations: declarations.length,
      assimilableNow: byLatentOutcome.admitted,
      latentGeneralizable: byLatentOutcome["latent-word"] + byLatentOutcome["latent-facet"] + byLatentOutcome["latent-scale"],
      likelyRecipe: byLatentOutcome.recipe,
      likelyLocal: byLatentOutcome["local-identity"],
      byRuleAction,
      byLatentOutcome,
      byCurrentCode,
      byPlaybookRecipe,
    },
    declarations,
    dimensionPilot: {
      summary: {
        declarations: dimensionEntries.length,
        latentScale: dimensionEntries.filter((entry) => entry.latentOutcome === "latent-scale").length,
        latentWord: dimensionEntries.filter((entry) => entry.latentOutcome === "latent-word").length,
        latentFacet: dimensionEntries.filter((entry) => entry.latentOutcome === "latent-facet").length,
        recipe: dimensionEntries.filter((entry) => entry.latentOutcome === "recipe").length,
        localIdentity: dimensionEntries.filter((entry) => entry.latentOutcome === "local-identity").length,
      },
      entries: dimensionEntries,
    },
  };
}

function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function mdEscape(value: string | number | undefined): string {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function renderReviewMarkdown(review: RuleActionReview): string {
  const summary = review.summary;
  const actionRows = RULE_ACTIONS
    .filter((action) => summary.byRuleAction[action] > 0)
    .map((action) => [action, String(summary.byRuleAction[action])]);
  const outcomeRows = LATENT_OUTCOMES
    .filter((outcome) => summary.byLatentOutcome[outcome] > 0)
    .map((outcome) => [outcome, String(summary.byLatentOutcome[outcome])]);
  const codeRows = REASON_CODES
    .filter((code) => summary.byCurrentCode[code] > 0)
    .map((code) => [code, String(summary.byCurrentCode[code])]);
  const playbookRows = Object.entries(summary.byPlaybookRecipe)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const recipe = playbookRecipeById(id);
      return [
        id,
        recipe?.kind ?? "",
        recipe?.confidence ?? "",
        String(count),
        mdEscape(recipe?.conversion),
      ];
    })
    .sort((left, right) => Number(right[3]) - Number(left[3]) || left[0].localeCompare(right[0]));
  const pressureRows = declarationsByPressure(review);
  return `# Monky Rule-Action Review

Generated from \`${review.inputs.currentLedger}\`.

This report is a review overlay on top of the strict current ledger. It does not change
\`assimilable-now\`; it separates declarations that are not admitted yet into latent
generalization, recipe, and local-identity pressure.

${table(["metric", "count"], [
  ["reviewed residue declarations", String(summary.reviewedDeclarations)],
  ["assimilable now", String(summary.assimilableNow)],
  ["latent generalizable", String(summary.latentGeneralizable)],
  ["likely recipe/molecule", String(summary.likelyRecipe)],
  ["likely local identity", String(summary.likelyLocal)],
])}

## By Rule Action

${table(["rule action", "declarations"], actionRows)}

## By Latent Outcome

${table(["latent outcome", "declarations"], outcomeRows)}

## By Current Ledger Code

${table(["current code", "declarations"], codeRows)}

## Matched Playbook Recipes

Playbook matches are advisory and may overlap; they are adoption memory, not a partition
of residue declarations.

${playbookRows.length
    ? table(["recipe", "kind", "confidence", "matches", "conversion memory"], playbookRows)
    : "No playbook recipe matched this residue.\n"}

## Highest-Pressure Families

${table(["family", "latent outcome", "declarations", "primary pressure"], pressureRows)}

## Reading

- \`latent-scale\` means the declaration has a scale/proportion path to test before it can
  honestly be called local identity.
- \`latent-facet\` means Ermine already owns the concept, but not the needed side, edge,
  property, or state facet.
- \`latent-word\` means the behavior is broad enough to consider as a word, but the plane
  still needs a ruling.
- \`recipe\` means the pattern may be reusable, but should enter as a molecule/recipe with
  sockets rather than as flat utilities.
- \`local-identity\` is the post-test floor.
`;
}

function declarationsByPressure(review: RuleActionReview): string[][] {
  const groups = new Map<string, ReviewedDeclaration[]>();
  for (const declaration of review.declarations) {
    const key = `${declaration.ruleAction}\u0000${declaration.latentOutcome}\u0000${declaration.erminePressure}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(declaration);
  }
  return [...groups.entries()]
    .map(([key, declarations]) => {
      const [action, outcome, pressure] = key.split("\u0000");
      return [action, outcome, String(declarations.length), pressure];
    })
    .sort((left, right) => Number(right[2]) - Number(left[2]) || left[0].localeCompare(right[0]));
}

function renderDimensionMarkdown(review: RuleActionReview): string {
  const pilot = review.dimensionPilot;
  const rows = pilot.entries.map((entry) => [
    `${entry.file}:${entry.line}`,
    entry.property,
    mdEscape(entry.value),
    entry.dimensionIntent,
    entry.latentOutcome,
    mdEscape(entry.scaleMapping),
    mdEscape(entry.proposedForm),
  ]);
  const byIntent = new Map<string, number>();
  for (const entry of pilot.entries) byIntent.set(entry.dimensionIntent, (byIntent.get(entry.dimensionIntent) ?? 0) + 1);
  return `# Dimension and Constraint Pilot

Generated from \`${review.inputs.currentLedger}\`.

This pilot implements the first assimilation queue item from \`docs/non-ermine.txt\`: do
not reject raw sizes as local identity until they have been tested against existing
scales, proportional relationships, or measure/control-size roles.

${table(["metric", "count"], [
  ["dimension/constraint declarations", String(pilot.summary.declarations)],
  ["latent scale", String(pilot.summary.latentScale)],
  ["latent word", String(pilot.summary.latentWord)],
  ["latent facet", String(pilot.summary.latentFacet)],
  ["recipe", String(pilot.summary.recipe)],
  ["local identity", String(pilot.summary.localIdentity)],
])}

## By Dimension Intent

${table(["intent", "declarations"], [...byIntent.entries()].sort((a, b) => b[1] - a[1]).map(([intent, count]) => [intent, String(count)]))}

## Candidate Vocabulary Pressure

- role-measured dimensions are now admitted for dialog, popover, command, result caps,
  controls, separators, and editor floors; the raw Monky rows for those roles migrated.
- zero-height endpoints are admitted as \`height-none\`; the remaining zero-width triangle
  geometry stays local because no zero-width endpoint has been ruled.
- the remaining dimension/constraint declaration is flex negotiation inside the editor
  body. It should become part of a prose/editor-content recipe only if that molecule is
  promoted.

## Declarations

${table(["source", "property", "value", "intent", "latent outcome", "scale/proportion mapping", "proposed form"], rows)}
`;
}

async function writeIfChanged(path: string, source: string, check: boolean): Promise<boolean> {
  const current = await readOptional(path);
  if (current === source) return true;
  if (check) return false;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, source);
  return true;
}

async function processLedger(path: string, repositoryRoot: string, check: boolean): Promise<boolean> {
  const ledger = JSON.parse(await readFile(path, "utf8")) as CurrentLedgerInput;
  const review = buildReview(ledger, path, repositoryRoot);
  const reportRoot = dirname(path);
  const jsonPath = resolve(reportRoot, "rule-action-review.json");
  const reviewMdPath = resolve(reportRoot, "RULE-ACTION-REVIEW.md");
  const dimensionMdPath = resolve(reportRoot, "DIMENSION-CONSTRAINT-PILOT.md");
  const json = `${JSON.stringify(review, null, 2)}\n`;
  const reviewMd = renderReviewMarkdown(review);
  const dimensionMd = renderDimensionMarkdown(review);
  const results = await Promise.all([
    writeIfChanged(jsonPath, json, check),
    writeIfChanged(reviewMdPath, reviewMd, check),
    writeIfChanged(dimensionMdPath, dimensionMd, check),
  ]);
  if (results.every(Boolean)) {
    console.log(`${check ? "current" : "wrote"} ${slash(relative(repositoryRoot, jsonPath))} (${review.summary.reviewedDeclarations} reviewed, ${review.summary.latentGeneralizable} latent-generalizable)`);
    return true;
  }
  console.log(`ERROR ${slash(relative(repositoryRoot, path))}: rule-action review reports are stale; run npm run adoption:review`);
  return false;
}

export async function runRuleActionReview(repositoryRoot = REPOSITORY_ROOT, check = false): Promise<boolean> {
  const paths = await findCurrentLedgerPaths(repositoryRoot);
  let valid = true;
  for (const path of paths) valid = await processLedger(path, repositoryRoot, check) && valid;
  return valid;
}

async function main(): Promise<void> {
  const check = process.argv.includes("--check");
  if (!await runRuleActionReview(REPOSITORY_ROOT, check)) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
