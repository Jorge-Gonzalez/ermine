// rule-residue-analysis.ts — rule-level residue report derived from rule-action review.

import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface CurrentLedgerSummary {
  totalDeclarations: number;
  residueDeclarations: number;
  assimilable: number;
}

interface CurrentLedgerInput {
  project: string;
  summary: CurrentLedgerSummary;
  shadowedWords?: string[];
}

interface ReviewedDeclaration {
  id: string;
  file: string;
  line: number;
  selector: string;
  property: string;
  value: string;
  currentCode: string;
  ruleAction: string;
  latentOutcome: string;
  playbookRecipes?: string[];
}

interface RuleActionReviewInput {
  project: string;
  inputs: { currentLedger: string };
  summary: {
    reviewedDeclarations: number;
    assimilableNow: number;
    latentGeneralizable: number;
  };
  declarations: ReviewedDeclaration[];
}

interface RuleGroup {
  file: string;
  selector: string;
  declarations: ReviewedDeclaration[];
  actions: Set<string>;
  outcomes: Set<string>;
  codes: Set<string>;
}

interface RuleFamily {
  id: string;
  label: string;
  reading: string;
  rules: RuleGroup[];
}

const SEMANTIC_FRAGMENT_RECIPE_IDS = new Set([
  "keycap-drawing-boundary",
  "callout-arrow-boundary",
  "segmented-pill-boundary",
  "engine-scrollbar-boundary",
  "generated-placeholder-boundary",
  "foreign-overlay-host-boundary",
]);

function slash(path: string): string {
  return path.replaceAll("\\", "/");
}

function title(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function mdEscape(value: string | number | undefined): string {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
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

async function findReviewPaths(repositoryRoot: string): Promise<string[]> {
  const adoptionRoot = resolve(repositoryRoot, "reports/adoption");
  const entries = await readdir(adoptionRoot, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const paths: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = resolve(adoptionRoot, entry.name, "rule-action-review.json");
    try {
      await access(candidate, constants.R_OK);
      paths.push(candidate);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return paths.sort();
}

function groupRules(declarations: ReviewedDeclaration[]): RuleGroup[] {
  const groups = new Map<string, RuleGroup>();
  for (const declaration of declarations) {
    const key = `${declaration.file}\u0000${declaration.selector}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        file: declaration.file,
        selector: declaration.selector,
        declarations: [],
        actions: new Set(),
        outcomes: new Set(),
        codes: new Set(),
      };
      groups.set(key, group);
    }
    group.declarations.push(declaration);
    group.actions.add(declaration.ruleAction);
    group.outcomes.add(declaration.latentOutcome);
    group.codes.add(declaration.currentCode);
  }
  return [...groups.values()].sort((left, right) =>
    left.file.localeCompare(right.file) || left.selector.localeCompare(right.selector)
  );
}

function isSemanticFragmentDeclaration(declaration: ReviewedDeclaration): boolean {
  return declaration.playbookRecipes?.some((recipe) => SEMANTIC_FRAGMENT_RECIPE_IDS.has(recipe)) ?? false;
}

function isSemanticFragmentRule(group: RuleGroup): boolean {
  return group.declarations.some(isSemanticFragmentDeclaration);
}

function isAuthoredContentSubstrateDeclaration(declaration: ReviewedDeclaration): boolean {
  return (declaration.file.endsWith("content-editor.css") || declaration.file.endsWith("semantic-fragments.css"))
    && /\b(?:content-editor-body|sf-authored-content)\b/.test(declaration.selector)
    && !declaration.selector.includes("::");
}

function isAuthoredContentSubstrateRule(group: RuleGroup): boolean {
  return (group.file.endsWith("content-editor.css") || group.file.endsWith("semantic-fragments.css"))
    && /\b(?:content-editor-body|sf-authored-content)\b/.test(group.selector)
    && !group.selector.includes("::");
}

function isEditorChromeRule(group: RuleGroup): boolean {
  return group.file.endsWith("content-editor.css")
    && /^\.ce-/.test(group.selector);
}

function isEditorLayoutBridge(group: RuleGroup): boolean {
  return /\.editor-content\s+\.content-editor-body\b/.test(group.selector);
}

function isPrivateDrawingRule(group: RuleGroup): boolean {
  if (/\.seg-control\.is-sliding \.seg-option/.test(group.selector)) {
    return false;
  }
  return group.selector.includes("::")
    || group.selector.startsWith("::-webkit-scrollbar")
    || /\.macro-suggestions-arrow\b/.test(group.selector)
    || /\.macro-search-kbd\b/.test(group.selector)
    || /\.sf-(?:callout-arrow|keycap|segmented-pill|generated-placeholder|foreign-overlay-host)\b/.test(group.selector);
}

function smallNumberWord(value: number): string {
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  return words[value] ?? String(value);
}

function isControlRecipe(group: RuleGroup): boolean {
  return group.file.endsWith("controls.css");
}

function isRootIdentity(group: RuleGroup): boolean {
  return group.selector.includes(":host") || group.file.endsWith("pages.css");
}

function isExactGeometry(group: RuleGroup): boolean {
  return group.actions.has("attachment-edge-layer")
    || group.codes.has("identity-geometry")
    || group.actions.has("dimension-constraint");
}

function familyId(group: RuleGroup): string {
  if (isPrivateDrawingRule(group)) return "private drawing / engine pseudo";
  if (isAuthoredContentSubstrateRule(group)) return "authored-content substrate";
  if (isEditorChromeRule(group)) return "editor chrome recipes";
  if (isEditorLayoutBridge(group)) return "editor layout bridge";
  if (isControlRecipe(group)) return "control-state recipes";
  if (isRootIdentity(group)) return "root/page/host identity";
  if (isExactGeometry(group)) return "exact attachment / geometry";
  return "component-local surface/type fragments";
}

function familyReading(id: string): string {
  switch (id) {
    case "authored-content substrate":
      return "A reset/prose substrate for user-authored HTML; the point is to preserve native content semantics outside flat utility grammar.";
    case "editor chrome recipes":
      return "Controls around the authored content surface: dropdowns, toolbar separators, and small editor UI signatures.";
    case "editor layout bridge":
      return "Layout handoff between the editor shell and the authored-content island.";
    case "private drawing / engine pseudo":
      return "Pseudo-elements, triangle arrows, keyboard-cap drawing, segmented-control slider, placeholder drawing, and WebKit scrollbar adapter parts.";
    case "control-state recipes":
      return "Local control recipes such as disabled buttons, selectable groups, and minimum-selection guards.";
    case "exact attachment / geometry":
      return "Exact offsets, overlay layer numbers, dropdown placement, and component geometry values.";
    case "component-local surface/type fragments":
      return "Small socket-consuming component signatures that do not yet justify a molecule admission.";
    case "root/page/host identity":
      return "Host/page reset and brand type identity.";
    default:
      return "";
  }
}

const FAMILY_ORDER = [
  "authored-content substrate",
  "editor chrome recipes",
  "editor layout bridge",
  "private drawing / engine pseudo",
  "control-state recipes",
  "exact attachment / geometry",
  "component-local surface/type fragments",
  "root/page/host identity",
];

function families(groups: RuleGroup[]): RuleFamily[] {
  const map = new Map<string, RuleGroup[]>();
  for (const group of groups) {
    const id = familyId(group);
    (map.get(id) ?? map.set(id, []).get(id)!).push(group);
  }
  return FAMILY_ORDER
    .filter((id) => map.has(id))
    .map((id) => ({
      id,
      label: id,
      reading: familyReading(id),
      rules: map.get(id)!,
    }));
}

function countBy<T extends string>(items: RuleGroup[], keys: readonly T[], keyFor: (item: RuleGroup) => T): Record<T, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
  for (const item of items) counts[keyFor(item)] += 1;
  return counts;
}

function firstAction(group: RuleGroup): string {
  return group.declarations[0]?.ruleAction ?? "";
}

function countRows(groups: RuleGroup[], keyFor: (group: RuleGroup) => string): string[][] {
  const counts = new Map<string, number>();
  for (const group of groups) counts.set(keyFor(group), (counts.get(keyFor(group)) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([key, count]) => [mdEscape(key), String(count)]);
}

function declarationText(declaration: ReviewedDeclaration): string {
  return `${declaration.property}: ${declaration.value}`;
}

function inventoryRows(groups: RuleGroup[]): string[][] {
  return groups.map((group) => [
    `\`${mdEscape(group.file)}\``,
    `\`${mdEscape(group.selector)}\``,
    String(group.declarations.length),
    mdEscape([...group.actions].join(", ")),
    mdEscape([...group.outcomes].join(", ")),
    group.declarations.map((declaration) => mdEscape(declarationText(declaration))).join("<br>"),
  ]);
}

function ruleShapeRows(ruleFamilies: RuleFamily[]): string[][] {
  return ruleFamilies.map((family) => [
    family.label,
    String(family.rules.length),
    String(family.rules.reduce((sum, rule) => sum + rule.declarations.length, 0)),
    mdEscape(family.reading),
  ]);
}

interface AssimilationTargetSummary {
  semanticFragmentDeclarations: number;
  authoredContentDeclarations: number;
  excludedDeclarations: number;
  remainingDeclarations: number;
  semanticFragmentRules: number;
  authoredContentRules: number;
  excludedRules: number;
  remainingRules: RuleGroup[];
}

function assimilationTargetSummary(review: RuleActionReviewInput, groups: RuleGroup[]): AssimilationTargetSummary {
  const excludedDeclarations = new Set<string>();
  let semanticFragmentDeclarations = 0;
  let authoredContentDeclarations = 0;

  for (const declaration of review.declarations) {
    if (isSemanticFragmentDeclaration(declaration)) {
      semanticFragmentDeclarations += 1;
      excludedDeclarations.add(declaration.id);
    }
    if (isAuthoredContentSubstrateDeclaration(declaration)) {
      authoredContentDeclarations += 1;
      excludedDeclarations.add(declaration.id);
    }
  }

  const semanticFragmentRules = groups.filter(isSemanticFragmentRule).length;
  const authoredContentRules = groups.filter(isAuthoredContentSubstrateRule).length;
  const remainingRules = groups.filter((group) =>
    !isSemanticFragmentRule(group) && !isAuthoredContentSubstrateRule(group)
  );

  return {
    semanticFragmentDeclarations,
    authoredContentDeclarations,
    excludedDeclarations: excludedDeclarations.size,
    remainingDeclarations: review.declarations.length - excludedDeclarations.size,
    semanticFragmentRules,
    authoredContentRules,
    excludedRules: groups.length - remainingRules.length,
    remainingRules,
  };
}

function renderAssimilationTargetSection(review: RuleActionReviewInput, groups: RuleGroup[]): string {
  const target = assimilationTargetSummary(review, groups);
  const remainingFamilies = families(target.remainingRules);

  return `## Word-Assimilation Target

The conserved ledger still counts all project-owned residue. For word-assimilation planning,
semantic fragments and content-editor default substrate rules are excluded because they are
not missing flat words. Semantic fragments are adoption sub-products: named middle-layer
objects discovered by subtraction, not Ermine targets and not unassimilated Ermine work.
The authored-content substrate is likewise a deliberate authored-HTML island.

${table(["bucket", "declarations", "rules", "reading"], [
    [
      "conserved project-owned residue",
      String(review.declarations.length),
      String(groups.length),
      "All remaining project-owned declarations in the current ledger.",
    ],
    [
      "semantic fragments excluded",
      String(target.semanticFragmentDeclarations),
      String(target.semanticFragmentRules),
      "Discovered semantic-fragment sub-products and browser-adapter hooks, not unassimilated Ermine work.",
    ],
    [
      "content-editor defaults excluded",
      String(target.authoredContentDeclarations),
      String(target.authoredContentRules),
      "Authored-content substrate defaults under \`.sf-authored-content\`, excluding pseudo drawing.",
    ],
    [
      "adjusted word-assimilation target",
      String(target.remainingDeclarations),
      String(target.remainingRules.length),
      "Residue still worth reading for future words, recipes, or project identity after those exclusions.",
    ],
  ])}

The exclusion is union-aware: ${target.excludedDeclarations} declarations across
${target.excludedRules} rules are outside the word-assimilation target. They remain visible
in the conserved ledger and boundary reports for full CSS accounting, not because they are
missed Ermine assimilation.

### Remaining Target Shape

${table(["rule shape", "rules", "declarations", "reading"], ruleShapeRows(remainingFamilies))}`;
}

function densityKey(group: RuleGroup): "1 declaration" | "2 declarations" | "3 declarations" | "4+ declarations" {
  if (group.declarations.length === 1) return "1 declaration";
  if (group.declarations.length === 2) return "2 declarations";
  if (group.declarations.length === 3) return "3 declarations";
  return "4+ declarations";
}

function renderAuthoredContentSection(groups: RuleGroup[]): string {
  if (!groups.some(isAuthoredContentSubstrateRule)) return "";
  return `### Authored Content Substrate

These rules intentionally point the other way from a utility framework. \`.sf-authored-content\`
is an authored HTML island: a neutral/prose substrate where user content can render ordinary
\`p\`, \`h1\`, \`ul\`, \`em\`, \`u\`, \`s\`, \`a\`, \`code\`, and \`blockquote\` semantics without
requiring class words on descendants.

${table(["selector family", "rules", "role"], [
    ["headings", "4", "`h1`, `h2`, `h3`, and first-child rhythm reset"],
    ["paragraphs and lists", "6", "`p`, `p:last-child`, `ul`, `ol`, shared list rhythm, `li`"],
    ["inline semantics", "6", "`a`, `a:hover`, `strong/b`, `em/i`, `u`, `s`"],
    ["code blocks", "2", "inline `code` and block `pre` treatment"],
    ["quoted content", "1", "`blockquote` treatment"],
    ["editor body root", "1", "content font family and line-height normalization"],
  ])}

Reading: this is not a failed absorption frontier. It is a deliberate boundary where the project
restores useful native HTML defaults so users can bring their own styling and semantics. Ermine
should remember it as authored-content substrate evidence, not as scattered missing words.`;
}

function renderEditorChromeSection(groups: RuleGroup[]): string {
  if (!groups.some((group) => isEditorChromeRule(group) || isEditorLayoutBridge(group))) return "";
  return `### Editor Chrome And Bridges

The \`ce-*\` selectors are editor controls around the authored-content island. They are different
from \`.sf-authored-content\`: dropdown placement, toolbar separators, and tiny trigger gaps are
component chrome recipes. The \`.editor-content .content-editor-body\` row is different again: it
is a layout bridge that lets the editor shell hand remaining block space to the authored content.

${table(["selector group", "reading"], [
    ["`ce-*`", "editor toolbar/menu chrome; recipe-local unless repeated elsewhere"],
    ["`.sf-generated-placeholder:empty::before`", "placeholder pseudo drawing, classified with private drawing"],
    ["`.editor-content .content-editor-body`", "layout bridge between shell and authored-content substrate"],
  ])}`;
}

function renderPrivateDrawingSection(groups: RuleGroup[]): string {
  if (!groups.some(isPrivateDrawingRule)) return "";
  const examples = [
    [".sf-segmented-pill::before", "Segmented-control active pill driven by CSS variables and state."],
    [".sf-keycap-raised::after", "Keyboard cap underside/shadow drawing."],
    ["::-webkit-scrollbar*", "Browser-specific scrollbar adapter parts after standard socket integration."],
    [".sf-callout-arrow*", "CSS triangle arrow drawing and orientation."],
    [".sf-generated-placeholder:empty::before", "Placeholder drawing tied to generated content."],
    [".sf-keycap and variants", "Exact keyboard cap geometry."],
  ].map(([pattern, reading]) => {
    const count = groups
      .filter((group) => {
        if (pattern === "::-webkit-scrollbar*") return group.selector.startsWith("::-webkit-scrollbar");
        if (pattern === ".sf-callout-arrow*") return group.selector.includes(".sf-callout-arrow");
        if (pattern === ".sf-keycap and variants") return group.selector.includes(".sf-keycap") && !group.selector.includes("::after");
        return group.selector === pattern;
      })
      .reduce((sum, group) => sum + group.declarations.length, 0);
    return count > 0 ? [`\`${pattern}\``, String(count), reading] : undefined;
  }).filter((row): row is string[] => row !== undefined);
  return `### Private Drawing / Engine Pseudo

${table(["rule", "residue declarations", "reading"], examples)}

Reading: these are named recipe boundaries, not missing flat words. The keyboard cap is a
beveled object, the callout arrow is a CSS triangle, the segmented pill is a pseudo-element
driven by component coordinate variables, the empty placeholder is generated content, and the
remaining scrollbar rules are engine pseudo-elements after Ermine's standard socket handoff.
They should be delegated to a browser-adapter/post-processing layer before Ermine considers
any new atomic words.`;
}

function renderControlStateSection(groups: RuleGroup[]): string {
  if (!groups.some(isControlRecipe)) return "";
  return `### Control-State Recipes

These are not plain state variants. They encode project decisions about what controls are
allowed to do under disabled, selected, active, or constrained states.

${table(["rule cluster", "examples", "reading"], [
    ["disabled buttons", "`.btn:disabled`, `.btn:disabled:hover`", "Local disabled recipe: cursor, opacity, and hover neutralization."],
    ["selectable groups", "`.selectable-group > *`, `.selectable-group > .is-selected:hover`, `.selectable-group > *:active`", "Parent/child interaction recipe."],
    ["minimum-selection guard", "`.min-selected-1 > .is-selected:only-of-type*`", "JS/state invariant expressed through selectors."],
    ["radio labels", "`.radio-label`", "Local clickable label recipe."],
    ["state icons", "`.seg-option svg`", "Local icon alignment inside a control option."],
  ])}

Reading: Ermine already owns the reusable visual side when a backed state can carry skin
(\`selected:\`, \`checked:\`, \`pressed:\`, \`expanded:\`, \`current:\`, and ordinary hover/focus
skin). What remains here is different: behavior and invariants. Disabled hover neutralization,
minimum-selection lockout, parent/child selectable-group mechanics, clickable-label affordance,
and local control icon alignment are project control contracts. They are good recipe boundary
evidence and poor flat-word candidates.`;
}

function renderRuleResidueMarkdown(review: RuleActionReviewInput, ledger: CurrentLedgerInput): string {
  const project = title(review.project);
  const groups = groupRules(review.declarations);
  const ruleFamilies = families(groups);
  const adopted = ledger.summary.totalDeclarations - ledger.summary.residueDeclarations;
  const actionRows = countRows(groups, firstAction);
  const sourceRows = countRows(groups, (group) => group.file);
  const densityCounts = countBy(groups, ["1 declaration", "2 declarations", "3 declarations", "4+ declarations"], densityKey);
  const denseRules = groups.filter((group) => group.declarations.length >= 4).length;
  const localRules = groups.filter((group) => group.outcomes.has("local-identity")).length;
  const mixedLocalRules = groups.filter((group) => group.outcomes.has("local-identity") && group.outcomes.size > 1).length;

  return `# ${project} Rule Residue Analysis

Generated from \`reports/adoption/${review.project}/rule-action-review.json\` and
\`${review.inputs.currentLedger}\`.

Regenerate with:

\`\`\`sh
npm run adoption:rules -- --write
\`\`\`

This report changes the unit of analysis from classes/declarations to authored CSS rules.
A rule here is \`file + selector\`, with only project-owned residue declarations counted.
Adopted Ermine declarations, substrate, theme metrics, and emitted infrastructure are not
included.

## Snapshot

${table(["metric", "count"], [
    ["current declarations", String(ledger.summary.totalDeclarations)],
    ["adopted/infrastructure declarations", String(adopted)],
    ["project-owned residue declarations", String(ledger.summary.residueDeclarations)],
    ["project-owned residue rules", String(groups.length)],
    ["assimilable declarations", String(review.summary.assimilableNow)],
    ["shadowed words", String(ledger.shadowedWords?.length ?? 0)],
    ["latent-generalizable declarations", String(review.summary.latentGeneralizable)],
  ])}

## Rule Shape

${table(["rule shape", "rules", "declarations", "reading"], ruleShapeRows(ruleFamilies))}

${renderAssimilationTargetSection(review, groups)}

## By Source File

${table(["file", "residue rules"], sourceRows.map(([file, count]) => [`\`${file}\``, count]))}

## By Primary Rule Action

Primary action is the first action attached to the rule's remaining declarations. Mixed
rules are listed later because a single selector can combine several kinds of residue.

${table(["primary rule action", "rules"], actionRows)}

## Rule Density

${table(["declarations per residue rule", "rules"], [
    ["1 declaration", String(densityCounts["1 declaration"])],
    ["2 declarations", String(densityCounts["2 declarations"])],
    ["3 declarations", String(densityCounts["3 declarations"])],
    ["4+ declarations", String(densityCounts["4+ declarations"])],
  ])}

This matters because most remaining rules are narrow and intentional. The ${smallNumberWord(denseRules)}
dense rules are recognizable authored shapes: segmented slider drawing, keyboard cap
drawing, code/pre blocks, blockquotes, and host identity.

## Main Findings

1. The residue is now rule-shaped, not utility-shaped.

   At declaration level the largest buckets can look like scattered pressure. At rule
   level they collapse into authored systems: editor content, private pseudo drawing,
   control recipes, exact geometry, and local identity. That is healthier than a tail of
   missing utilities.

2. Authored-content residue is a molecule boundary.

   \`src/styles/fragments/semantic-fragments.css\` carries the authored-content substrate under
   \`.sf-authored-content\`: headings, paragraphs, lists, inline code, pre blocks, blockquotes,
   links, emphasis, and decorations. The old \`ce-*\` editor chrome rows have dissolved into
   Ermine class strings; what remains is the authored HTML island plus adjacent private drawing
   such as generated placeholders. Treating that as one vague "content editor" bucket hides the
   important distinction: the body points away from utility grammar, while the surrounding chrome
   can keep being absorbed when it is ordinary component structure.

3. Pseudo and engine drawing remains correctly project-owned.

   Keyboard caps, suggestion arrows, segmented-control sliders, empty-content placeholders,
   and WebKit scrollbar adapter parts are boundary recipes. Some declarations use values Ermine
   can name in isolation, but the authored rule is either a miniature drawing program or an engine
   adapter. The useful future extraction is a recipe/molecule with sockets for drawings, and a
   browser-adapter/post-process layer for scrollbar pseudo-elements, not more flat class words.

4. Local identity is small and explicit.

   ${localRules} residue rules contain \`local-identity\` outcomes. They are host/page
   typography, overlay layer identity, root spacing resets, or local transition
   suppression. ${mixedLocalRules} of those rules are mixed with recipe declarations,
   which is expected for real CSS selectors.

5. There is no immediate grammar pressure.

   The rule-action review reports \`${review.summary.assimilableNow}\` assimilable
   declarations and \`${review.summary.latentGeneralizable}\` latent-generalizable
   declarations. The next useful work is not to admit another isolated word from this
   residue. It is to decide whether one of the remaining authored systems deserves a named
   recipe surface.

## High-Signal Rule Families

${[
    renderAuthoredContentSection(groups),
    renderEditorChromeSection(groups),
    renderPrivateDrawingSection(groups),
    renderControlStateSection(groups),
  ].filter(Boolean).join("\n\n")}

## Complete Rule Inventory

${table(["file", "selector", "declarations", "rule actions", "outcome", "residue declarations"], inventoryRows(groups))}

## Reading

- Rule analysis is stricter than class analysis for the remaining residue. It shows where
  authored CSS still has meaning after Ermine removes the general structural pressure.
- A declaration may look admissible in isolation, but if it participates in a pseudo
  drawing, browser engine selector, content molecule, or state contract, the rule remains
  project-owned.
- Future adoptions should run this report shape once \`assimilable = 0\`. It is the handoff
  point from "which words are missing?" to "which authored systems remain outside flat
  grammar?"
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

async function processReview(path: string, repositoryRoot: string, check: boolean): Promise<boolean> {
  const review = JSON.parse(await readFile(path, "utf8")) as RuleActionReviewInput;
  const currentLedgerPath = resolve(repositoryRoot, review.inputs.currentLedger);
  const ledger = JSON.parse(await readFile(currentLedgerPath, "utf8")) as CurrentLedgerInput;
  const reportRoot = dirname(path);
  const outputPath = resolve(reportRoot, "RULE-RESIDUE-ANALYSIS.md");
  const groups = groupRules(review.declarations);
  const markdown = renderRuleResidueMarkdown(review, ledger);
  if (await writeIfChanged(outputPath, markdown, check)) {
    console.log(`${check ? "current" : "wrote"} ${slash(relative(repositoryRoot, outputPath))} (${groups.length} rules, ${review.declarations.length} declarations)`);
    return true;
  }
  console.log(`ERROR ${slash(relative(repositoryRoot, outputPath))}: rule residue analysis is stale; run npm run adoption:rules`);
  return false;
}

export async function runRuleResidueAnalysis(repositoryRoot = REPOSITORY_ROOT, check = false): Promise<boolean> {
  const paths = await findReviewPaths(repositoryRoot);
  let valid = true;
  for (const path of paths) valid = await processReview(path, repositoryRoot, check) && valid;
  return valid;
}

async function main(): Promise<void> {
  const check = process.argv.includes("--check");
  const write = process.argv.includes("--write");
  if (check === write) throw new Error("usage: rule-residue-analysis.ts (--write|--check)");
  if (!await runRuleResidueAnalysis(REPOSITORY_ROOT, check)) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
