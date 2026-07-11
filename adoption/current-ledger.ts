// current-ledger.ts — selector-aware reconciliation of a project's LIVE CSS
// against emitted Ermine CSS.
//
// The frozen baseline ledger (analyze.ts) conserves history; this tool answers
// the other question: what does the project's CSS residue look like TODAY, and
// why does each declaration still exist? Every current declaration gets one
// reason code. Declarations Ermine could express right now are reported as
// `assimilable` with the matching word(s) named — the generated work list for
// the next assimilation pass. Re-run after each pass; the counts are the
// migration status, replacing per-pilot hand counting.
//
// Matching is done through the real compilation path: every vocabulary word
// (plus hover:/selected:/checked: carrier forms) is serialized with toCss()
// and parsed back, then both sides' values are resolved through the project's
// own custom-property bindings and the socketPalette BRIDGE aliases. A match
// is (condition, property, resolved value) equality — selector-aware, not a
// literal text comparison.

import { execFile as execFileCallback } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { grammarFamilies, propertyFamily } from "../analysis/lib.ts";
import { toCss } from "../src/css.ts";
import { VOCABULARY } from "../src/emit.ts";
import { displaySelector, parseCssDeclarations, type ParsedCssDeclaration } from "./css-parser.ts";

const execFile = promisify(execFileCallback);
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOOL_INPUTS = [
  "adoption/current-ledger.ts",
  "adoption/css-parser.ts",
  "analysis/lib.ts",
  "src/css.ts",
  "src/emit.ts",
  "src/lint.ts",
  "src/registry.ts",
  "engine",
];
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist", "coverage", "build"]);

export const REASON_CODES = [
  // adopted / infrastructure planes — present by design, not residue
  "ermine-emitted",    // the generated Ermine grammar surface itself
  "substrate",         // reset, base typography, font delivery
  "theme-metric",      // project scale values and Ermine scale bindings
  "config-departure",  // explicit project departure in ermine.config.css
  // residue — each code names why the declaration is still project CSS
  "assimilable",       // an existing Ermine word expresses this now (work list)
  "recipe-identity",   // a project recipe class bundle (R-SKIN-10) — socket-consuming identity
  "rule-mechanics",    // rule/border mechanics held for GAP-K6-skin-surface
  "brand-identity",    // project brand typography / type treatment
  "affordance-mechanics", // interaction affordance mechanics held for GAP-U-interaction-affordance
  "component-contract",// component-owned mechanics and exact product contract
  "state-mechanics",   // JS/native state mechanics that are not backed Ermine conditions
  "state-review",      // same-element state condition without a matching backed prefix
  "focus-state",       // :focus-conditioned remainder (focus: is ruled; rings/mechanics stay)
  "aria-current",      // [aria-current]-conditioned remainder (current: is ruled)
  "parent-relational", // ancestor state drives a descendant; conditions are same-element
  "pseudo-mechanics",  // ::before/::after geometry, fills, and content
  "scrollbar-followup",// scrollbar prominence — named follow-up question
  "motion-followup",   // transition/animation timing — named follow-up question
  "opacity-followup",  // opacity state treatment — named follow-up question
  "elevation-followup",// shadow geometry — named follow-up (raised/sunken)
  "reset-absence",     // none/transparent/0 absence mechanics, not a positive carrier
  "user-content",      // rich-text defaults inside user-authored content
  "identity-geometry", // grammar-family property carrying project-exact geometry
  "skin-review",       // paint awaiting a carrier or recipe judgment
  "identity-review",   // remaining declarations awaiting project judgment
] as const;

export type ReasonCode = typeof REASON_CODES[number];

const RESIDUE_EXEMPT = new Set<ReasonCode>([
  "ermine-emitted", "substrate", "theme-metric", "config-departure",
]);

export interface CurrentRecord {
  id: string;
  file: string;
  line: number;
  selector: string;
  property: string;
  value: string;
  code: ReasonCode;
  words?: string[];
  note?: string;
}

export interface CurrentLedgerV2 {
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

export interface CurrentOverride {
  id: string;
  code: ReasonCode;
  note: string;
}

export interface ProjectProfile {
  recipes: string[];
  userContent: string[];
  bridge: string[];
  scanRoot?: string;
  generatedGrammar: string[];
  configFiles: string[];
  substrate: string[];
  theme: string[];
}

export const DEFAULT_PROJECT_PROFILE: ProjectProfile = {
  recipes: [],
  userContent: [],
  bridge: ["src/theme/socketPalette.ts"],
  generatedGrammar: ["src/styles/grammar/"],
  configFiles: ["ermine.config.css"],
  substrate: ["src/styles/substrate/", "font.css", "font-face.css"],
  theme: ["src/styles/theme/"],
};

// ---------------------------------------------------------------------------
// project CSS scan
// ---------------------------------------------------------------------------

function slash(path: string): string {
  return path.split(sep).join("/");
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

async function loadProjectProfile(path: string): Promise<ProjectProfile> {
  const source = await readFile(path, "utf8").catch(() => "");
  if (!source) return { ...DEFAULT_PROJECT_PROFILE };
  const value = JSON.parse(source) as Partial<ProjectProfile> & {
    bridge?: string | string[];
  };
  const stringArray = (field: keyof ProjectProfile, fallback: string[]): string[] => {
    const candidate = value[field];
    if (candidate === undefined) return fallback;
    if (!Array.isArray(candidate) || candidate.some((item) => typeof item !== "string")) {
      throw new Error(`${slash(path)}.${String(field)}: expected an array of strings`);
    }
    return uniqueStrings(candidate);
  };
  const bridgeValue = value.bridge;
  const bridge = bridgeValue === undefined
    ? DEFAULT_PROJECT_PROFILE.bridge
    : typeof bridgeValue === "string"
      ? uniqueStrings([bridgeValue])
      : Array.isArray(bridgeValue) && bridgeValue.every((item) => typeof item === "string")
        ? uniqueStrings(bridgeValue)
        : undefined;
  if (!bridge) throw new Error(`${slash(path)}.bridge: expected a string or array of strings`);
  if (value.scanRoot !== undefined && typeof value.scanRoot !== "string") {
    throw new Error(`${slash(path)}.scanRoot: expected a string`);
  }
  return {
    recipes: stringArray("recipes", DEFAULT_PROJECT_PROFILE.recipes),
    userContent: stringArray("userContent", DEFAULT_PROJECT_PROFILE.userContent),
    bridge,
    ...(value.scanRoot ? { scanRoot: value.scanRoot } : {}),
    generatedGrammar: stringArray("generatedGrammar", DEFAULT_PROJECT_PROFILE.generatedGrammar),
    configFiles: stringArray("configFiles", DEFAULT_PROJECT_PROFILE.configFiles),
    substrate: stringArray("substrate", DEFAULT_PROJECT_PROFILE.substrate),
    theme: stringArray("theme", DEFAULT_PROJECT_PROFILE.theme),
  };
}

function isTestFile(file: string): boolean {
  return /(^|\/)(__tests__|test|tests)(\/|$)/.test(file) || /\.(test|spec)\.[^.]+$/.test(file);
}

async function walkCss(root: string): Promise<string[]> {
  const output: string[] = [];
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".css")) output.push(path);
    }
  }
  await visit(root);
  return output;
}

async function projectDeclarations(projectRoot: string, profile: ProjectProfile): Promise<ParsedCssDeclaration[]> {
  const scanRoot = profile.scanRoot
    ? resolve(projectRoot, profile.scanRoot)
    : existsSync(resolve(projectRoot, "src")) ? resolve(projectRoot, "src") : projectRoot;
  const paths = await walkCss(scanRoot);
  const declarations: ParsedCssDeclaration[] = [];
  for (const absolute of paths) {
    const file = slash(relative(projectRoot, absolute));
    if (isTestFile(file)) continue;
    declarations.push(...parseCssDeclarations(await readFile(absolute, "utf8"), file));
  }
  return declarations.sort((left, right) =>
    left.file.localeCompare(right.file) || left.line - right.line ||
    left.selector.localeCompare(right.selector) || left.property.localeCompare(right.property));
}

// ---------------------------------------------------------------------------
// value resolution — project bindings plus the theme bridge
// ---------------------------------------------------------------------------

// The project's runtime socket aliases (e.g. --tone-dim → var(--ground-subtle))
// live in its palette module, not in CSS. Extract the literal alias pairs so
// value comparison happens in socket terms on both sides.
async function bridgeAliases(projectRoot: string, profile: ProjectProfile): Promise<Record<string, string>> {
  const aliases: Record<string, string> = {};
  for (const candidate of profile.bridge) {
    const source = await readFile(resolve(projectRoot, candidate), "utf8").catch(() => "");
    for (const match of source.matchAll(/'(--[\w-]+)':\s*'(var\(--[\w-]+\))'/g)) {
      aliases[match[1]] = match[2];
    }
  }
  return aliases;
}

export type VarEnvironment = Map<string, string>;

export function buildEnvironment(
  declarations: readonly ParsedCssDeclaration[],
  aliases: Record<string, string>,
): VarEnvironment {
  const environment: VarEnvironment = new Map(Object.entries(aliases));
  for (const declaration of declarations) {
    if (!declaration.property.startsWith("--")) continue;
    if (!environment.has(declaration.property)) environment.set(declaration.property, declaration.value);
  }
  return environment;
}

export function resolveValue(value: string, environment: VarEnvironment): string {
  let current = value.replace(/\s+/g, " ").trim().toLowerCase();
  for (let depth = 0; depth < 8; depth += 1) {
    const next = current.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g, (whole, name: string, fallback?: string) =>
      environment.get(name) ?? (fallback !== undefined ? fallback.trim() : whole));
    if (next === current) break;
    current = next;
  }
  return current.replace(/\b0px\b/g, "0");
}

// ---------------------------------------------------------------------------
// inverse Ermine map — compile every word, index its declarations
// ---------------------------------------------------------------------------

interface WordMatch {
  word: string;
  partial: boolean; // the word emits more declarations than this one
}

export type InverseErmineMap = Map<string, WordMatch[]>;

const PREFIXABLE_AXES = new Set(["skin-ground", "skin-ink", "skin-rule"]);
const CONDITION_PREFIXES = ["hover", "focus", "selected", "checked", "current"];

function candidateWords(): string[] {
  const plain = Object.values(VOCABULARY).flat();
  const prefixed = Object.entries(VOCABULARY)
    .filter(([axis]) => PREFIXABLE_AXES.has(axis))
    .flatMap(([, words]) => words)
    .flatMap((word) => CONDITION_PREFIXES.map((prefix) => `${prefix}:${word}`));
  return [...plain, ...prefixed];
}

// `background-color: <color>` and `background: <color>` paint the same thing;
// carriers emit the shorthand, applications often write the longhand.
function canonicalProperty(property: string): string {
  return property === "background-color" ? "background" : property;
}

// The condition under which a declaration applies: '' for plain, ':hover' for
// platform interaction, or the backing attribute for backed states.
function selectorCondition(compound: string): string {
  if (/:hover\b/.test(compound)) return ":hover";
  if (/:focus\b(?!-)/.test(compound)) return ":focus";
  if (/\[aria-selected="true"\]/.test(compound)) return '[aria-selected="true"]';
  if (/\[aria-checked="true"\]/.test(compound)) return '[aria-checked="true"]';
  if (/\[aria-current\b/.test(compound)) return "[aria-current]";
  return "";
}

export function matchKey(condition: string, property: string, resolvedValue: string): string {
  return `${condition}\u0000${canonicalProperty(property)}\u0000${resolvedValue}`;
}

export function buildInverseErmineMap(environment: VarEnvironment): InverseErmineMap {
  const map: InverseErmineMap = new Map();
  for (const word of candidateWords()) {
    let css: string;
    try { css = toCss(word); } catch { continue; }
    const parsed = parseCssDeclarations(css, word).filter((declaration) => !declaration.file.includes("not CSS"));
    if (!parsed.length) continue;
    const partial = parsed.length > 1;
    for (const declaration of parsed) {
      const condition = selectorCondition(declaration.selector);
      const key = matchKey(condition, declaration.property, resolveValue(declaration.value, environment));
      (map.get(key) ?? map.set(key, []).get(key)!).push({ word, partial });
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// classification
// ---------------------------------------------------------------------------

const STATE_MARK = /:(hover|active|focus-within|focus-visible|focus|checked|disabled)\b|\[aria-(selected|checked|current|disabled)[^\]]*\]|\[data-state[^\]]*\]|\.is-(active|selected|sliding)\b/;
const ABSENCE_VALUES = new Set(["none", "transparent", "inherit", "normal", "unset", "initial"]);
const PAINT_PROPERTY = /^(color|background|border|outline|box-shadow|fill|stroke|caret-color|accent-color|text-decoration)/;
const SKIN_PROPERTY = /^(color|background|border|outline|fill|stroke|caret-color|accent-color|text-decoration|font|line-height|letter-spacing|text-transform|text-align|font-variant)/;
const RULE_MECHANICS_PROPERTY = /^border(?:-(?:top|right|bottom|left))?-(?:width|style)$/;
const BRAND_TYPE_PROPERTY = /^(font|line-height|letter-spacing|text-transform|font-variant|text-decoration|text-align)/;

function compounds(fullSelector: string): string[] {
  return fullSelector.split(/\s*[\s>+~]\s*/).filter(Boolean);
}

function fileMatches(file: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => file === pattern || file.endsWith(pattern) || file.includes(pattern));
}

function selectorContainsUserContentDescendant(selector: string, profile: ProjectProfile): boolean {
  return profile.userContent.some((root) => {
    const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`${escaped}[^,{]*\\s`).test(selector);
  });
}

function classNames(compound: string): string[] {
  return [...compound.matchAll(/\.([_a-zA-Z][\w-]*)/g)].map((match) => match[1]);
}

function recipeTokenMatches(className: string, token: string): boolean {
  const normalized = token.startsWith(".") ? token.slice(1) : token;
  if (!normalized) return false;
  if (normalized.endsWith("-")) return className.startsWith(normalized);
  return className === normalized || className.startsWith(`${normalized}-`);
}

function selectorMatchesRecipe(parts: readonly string[], profile: ProjectProfile): boolean {
  if (!profile.recipes.length) return false;
  return parts.some((part) =>
    classNames(part).some((className) =>
      profile.recipes.some((recipe) => recipeTokenMatches(className, recipe))));
}

interface Classified {
  code: ReasonCode;
  words?: string[];
}

function classify(
  declaration: ParsedCssDeclaration,
  inverse: InverseErmineMap,
  environment: VarEnvironment,
  profile: ProjectProfile,
): Classified {
  const { file, property } = declaration;
  const selector = displaySelector(declaration);
  const value = resolveValue(declaration.value, environment);

  if (fileMatches(file, profile.generatedGrammar)) return { code: "ermine-emitted" };
  if (fileMatches(file, profile.configFiles)) return { code: "config-departure" };
  if (declaration.context.some((context) => context.startsWith("@keyframes"))) return { code: "motion-followup" };
  if (/-webkit-scrollbar|^scrollbar-/.test(selector) || /^scrollbar-/.test(property)) return { code: "scrollbar-followup" };
  if (fileMatches(file, profile.substrate)) return { code: "substrate" };
  if (fileMatches(file, profile.theme)) return { code: "theme-metric" };

  if (/::(before|after|placeholder|selection|marker)/.test(selector) || property === "content") {
    return { code: "pseudo-mechanics" };
  }
  if (selectorContainsUserContentDescendant(selector, profile)) return { code: "user-content" };

  const parts = compounds(selector);
  const ancestors = parts.slice(0, -1);
  const subject = parts[parts.length - 1] ?? "";
  if (ancestors.some((part) => STATE_MARK.test(part))) return { code: "parent-relational" };
  if (selectorMatchesRecipe(parts, profile)) return { code: "recipe-identity" };

  // Ruled conditions (hover:/focus:/selected:/checked:/current:) attempt a
  // condition-aware inverse match before falling to their remainder codes.
  const condition = selectorCondition(subject);
  if (condition) {
    const matches = inverse.get(matchKey(condition, property, value));
    if (matches?.length) {
      return { code: "assimilable", words: [...new Set(matches.map((match) => match.word))].sort() };
    }
  }
  if (/\[aria-current/.test(subject)) return { code: "aria-current" };
  if (/:focus(-within|-visible)?\b/.test(subject)) return { code: "focus-state" };

  if (/^(transition|animation)/.test(property)) return { code: "motion-followup" };
  if (property === "opacity") return { code: "opacity-followup" };
  if (property === "box-shadow") return { code: "elevation-followup" };
  if (ABSENCE_VALUES.has(value)) return { code: "reset-absence" };
  if (PAINT_PROPERTY.test(property) && /(^|\s)(none|transparent)(\s|$)/.test(value)) {
    return { code: "reset-absence" };
  }

  // A state the grammar cannot condition on yet (.is-active, :active, :checked…)
  // must not receive a plain-word suggestion; the declaration is state-driven.
  if (!condition && STATE_MARK.test(subject)) return { code: "state-mechanics" };
  if (!condition) {
    const matches = inverse.get(matchKey("", property, value));
    if (matches?.length) {
      return { code: "assimilable", words: [...new Set(matches.map((match) => match.word))].sort() };
    }
  }
  if (condition) return { code: "state-mechanics" };
  if (property === "cursor" || property === "user-select") return { code: "affordance-mechanics" };
  if (RULE_MECHANICS_PROPERTY.test(property)) return { code: "rule-mechanics" };
  if (BRAND_TYPE_PROPERTY.test(property)) return { code: "brand-identity" };
  if (SKIN_PROPERTY.test(property)) return { code: "component-contract" };
  if (!property.startsWith("--") && grammarFamilies.has(propertyFamily(property))) {
    return { code: "identity-geometry" };
  }
  return { code: "component-contract" };
}

// ---------------------------------------------------------------------------
// overrides — recorded human judgments, validated against the scan
// ---------------------------------------------------------------------------

async function loadOverrides(path: string): Promise<CurrentOverride[]> {
  const source = await readFile(path, "utf8").catch(() => "");
  if (!source) return [];
  const value = JSON.parse(source) as unknown;
  if (!Array.isArray(value)) throw new Error(`${slash(path)}: expected an array of overrides`);
  return value.map((item, index) => {
    const override = item as Partial<CurrentOverride>;
    if (typeof override.id !== "string" || typeof override.note !== "string" ||
        !REASON_CODES.includes(override.code as ReasonCode)) {
      throw new Error(`${slash(path)}[${index}]: expected { id, code, note } with a known reason code`);
    }
    return override as CurrentOverride;
  });
}

// ---------------------------------------------------------------------------
// assembly
// ---------------------------------------------------------------------------

export interface GenerateOptions {
  projectRoot: string;
  name: string;
  ermineCommit: string;
  projectCommit: string;
  overrides: CurrentOverride[];
  profile: ProjectProfile;
}

export async function generateCurrentLedger(options: GenerateOptions): Promise<CurrentLedgerV2> {
  const declarations = await projectDeclarations(options.projectRoot, options.profile);
  const environment = buildEnvironment(declarations, await bridgeAliases(options.projectRoot, options.profile));
  const inverse = buildInverseErmineMap(environment);

  const occurrences = new Map<string, number>();
  const overrideById = new Map(options.overrides.map((override) => [override.id, override]));
  const applied = new Set<string>();

  const records: CurrentRecord[] = declarations.map((declaration) => {
    const selector = displaySelector(declaration);
    const key = `${declaration.file}::${selector}::${declaration.property}`;
    const occurrence = (occurrences.get(key) ?? 0) + 1;
    occurrences.set(key, occurrence);
    const id = `${key}::${occurrence}`;
    const { code, words } = classify(declaration, inverse, environment, options.profile);
    const override = overrideById.get(id);
    if (override) applied.add(id);
    return {
      id,
      file: declaration.file,
      line: declaration.line,
      selector,
      property: declaration.property,
      value: declaration.value,
      code: override?.code ?? code,
      ...(words && !override ? { words } : {}),
      ...(override ? { note: override.note } : {}),
    };
  });

  const stale = options.overrides.filter((override) => !applied.has(override.id));
  if (stale.length) {
    throw new Error(`stale overrides — ids no longer in the scan:\n${stale.map((override) => `  ${override.id}`).join("\n")}`);
  }

  const byCode = Object.fromEntries(REASON_CODES.map((code) => [
    code,
    records.filter((record) => record.code === code).length,
  ])) as Record<ReasonCode, number>;
  return {
    version: 2,
    project: options.name,
    source: { ermineCommit: options.ermineCommit, projectCommit: options.projectCommit },
    summary: {
      totalDeclarations: records.length,
      residueDeclarations: records.filter((record) => !RESIDUE_EXEMPT.has(record.code)).length,
      assimilable: byCode.assimilable,
      byCode,
    },
    records,
  };
}

// ---------------------------------------------------------------------------
// report rendering
// ---------------------------------------------------------------------------

const CODE_MEANING: Record<ReasonCode, string> = {
  "ermine-emitted": "the generated Ermine grammar surface (adopted, not residue)",
  "substrate": "reset, base typography, and font delivery below grammar authoring",
  "theme-metric": "project scale values and Ermine scale bindings (deliberate non-coverage)",
  "config-departure": "explicit project departure recorded in ermine.config.css",
  "assimilable": "an existing Ermine word expresses this now — next assimilation pass",
  "recipe-identity": "a project recipe class bundle (R-SKIN-10) — socket-consuming product identity",
  "rule-mechanics": "border/rule mechanics held for GAP-K6-skin-surface",
  "brand-identity": "project brand typography and type treatment",
  "affordance-mechanics": "cursor/user-select affordance mechanics (GAP-U-interaction-affordance)",
  "component-contract": "component-owned mechanics, exact geometry, or product contract",
  "state-mechanics": "JS/native state mechanics outside backed Ermine conditions",
  "state-review": "same-element state condition with no matching backed prefix yet",
  "focus-state": "focus-conditioned remainder — rings and mechanics (focus: itself is ruled, R-STATE-10)",
  "aria-current": "aria-current-conditioned remainder (current: itself is ruled, R-STATE-12)",
  "parent-relational": "ancestor state drives a descendant (GAP-U-parent-relational-state)",
  "pseudo-mechanics": "pseudo-element geometry, fills, and content",
  "scrollbar-followup": "scrollbar prominence (GAP-U-scrollbar-prominence)",
  "motion-followup": "transition/animation timing (deferred to GAP-U-animation-plane)",
  "opacity-followup": "opacity state treatment (named follow-up question)",
  "elevation-followup": "box-shadow outside the elevated treatment — rings and identity signatures (R-SKIN-09)",
  "reset-absence": "absence/reset mechanics, not a positive carrier",
  "user-content": "rich-text defaults inside user-authored content",
  "identity-geometry": "project-exact geometry on a grammar-family property",
  "skin-review": "paint awaiting a carrier or recipe judgment",
  "identity-review": "awaiting project judgment",
};

export function renderCurrentLedger(ledger: CurrentLedgerV2): string {
  const rows = REASON_CODES
    .filter((code) => ledger.summary.byCode[code] > 0)
    .map((code) => `| \`${code}\` | ${ledger.summary.byCode[code]} | ${CODE_MEANING[code]} |`)
    .join("\n");
  const residue = ledger.records.filter((record) => !RESIDUE_EXEMPT.has(record.code));
  const byFile = new Map<string, number>();
  for (const record of residue) byFile.set(record.file, (byFile.get(record.file) ?? 0) + 1);
  const fileRows = [...byFile.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([file, count]) => `| \`${file}\` | ${count} |`)
    .join("\n");
  const assimilable = residue.filter((record) => record.code === "assimilable");
  const workList = assimilable.length
    ? assimilable.map((record) =>
        `| \`${record.file}\` | \`${record.selector}\` | \`${record.property}\` | ${record.words?.map((word) => `\`${word}\``).join(", ") ?? ""} |`,
      ).join("\n")
    : "";
  return `# Ermine current ledger — ${ledger.project}

Generated artifact. Do not hand-edit; regenerate with:

\`\`\`sh
node --import tsx adoption/current-ledger.ts --project ../${ledger.project} --name ${ledger.project} --write --gate
\`\`\`

## Provenance

| source | commit |
|---|---|
| Ermine | \`${ledger.source.ermineCommit}\` |
| ${ledger.project} | \`${ledger.source.projectCommit}\` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Project-wide judgments are recorded in
\`project.json\`; any one-off overrides live in \`current-overrides.json\` and are
re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | ${ledger.summary.totalDeclarations} |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | ${ledger.summary.totalDeclarations - ledger.summary.residueDeclarations} |
| **residue — project-owned declarations** | **${ledger.summary.residueDeclarations}** |
| assimilable now (work list below) | ${ledger.summary.assimilable} |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
${rows}

## Residue by file

| file | declarations |
|---|---:|
${fileRows}

${assimilable.length ? `## Assimilable work list

Declarations an existing Ermine word can express today.

| file | selector | property | word(s) |
|---|---|---|---|
${workList}
` : "No assimilable declarations remain — the residue is declared boundary and follow-up questions.\n"}
Every record with its code is in \`current-ledger.json\`.
`;
}

const REVIEW_CODES: ReasonCode[] = ["skin-review", "identity-review", "state-review"];

const GAP_CODES: Partial<Record<ReasonCode, string>> = {
  "rule-mechanics": "reports/GAP-K6-skin-surface.md",
  "affordance-mechanics": "reports/GAP-U-interaction-affordance.md",
  "parent-relational": "reports/GAP-U-parent-relational-state.md",
  "scrollbar-followup": "reports/GAP-U-scrollbar-prominence.md",
  "motion-followup": "reports/GAP-U-animation-plane.md",
  "opacity-followup": "reports/GAP-U-interaction-affordance.md",
  "focus-state": "R-STATE-10 follow-up: focus ring/mechanics boundary",
  "aria-current": "R-STATE-12 follow-up: current-layer mechanics",
  "elevation-followup": "R-SKIN-09 boundary clause",
};

function countCodes(ledger: CurrentLedgerV2, codes: readonly ReasonCode[]): number {
  return codes.reduce((total, code) => total + ledger.summary.byCode[code], 0);
}

function boundaryRow(ledger: CurrentLedgerV2, codes: readonly ReasonCode[]): string {
  return codes
    .filter((code) => ledger.summary.byCode[code] > 0)
    .map((code) => `| \`${code}\` | ${ledger.summary.byCode[code]} | ${CODE_MEANING[code]} |`)
    .join("\n");
}

export function renderBoundary(ledger: CurrentLedgerV2): string | undefined {
  if (countCodes(ledger, REVIEW_CODES) !== 0) return undefined;
  const identityCodes: ReasonCode[] = [
    "recipe-identity", "identity-geometry", "brand-identity", "elevation-followup",
  ];
  const mechanicsCodes: ReasonCode[] = [
    "component-contract", "state-mechanics", "rule-mechanics", "pseudo-mechanics", "reset-absence",
  ];
  const followupRows = Object.entries(GAP_CODES)
    .map(([code, reference]) => [code as ReasonCode, reference] as const)
    .filter(([code]) => ledger.summary.byCode[code] > 0)
    .map(([code, reference]) => `| \`${code}\` | ${ledger.summary.byCode[code]} | ${reference} |`)
    .join("\n");
  return `# Monky / Ermine boundary manifest

Generated artifact. Do not hand-edit; regenerate with:

\`\`\`sh
node --import tsx adoption/current-ledger.ts --project ../${ledger.project} --name ${ledger.project} --write --gate
\`\`\`

This is the declared boundary for Monky's closed adoption. It supersedes the scattered
per-pilot "Left local" tables: those reports remain history, while this document is the
machine-checked current contract.

## Provenance

| source | commit |
|---|---|
| Ermine | \`${ledger.source.ermineCommit}\` |
| ${ledger.project} | \`${ledger.source.projectCommit}\` |

## Closure Gate

| measure | count |
|---|---:|
| assimilable declarations | ${ledger.summary.assimilable} |
| review-coded declarations | ${countCodes(ledger, REVIEW_CODES)} |
| project-owned residue | ${ledger.summary.residueDeclarations} |

## Product Identity

Monky keeps recipe bundles, exact product geometry, brand type, and identity shadows. The
licensing rules are R-SKIN-10 for recipes, U-R2 for project intent and exact geometry, and
R-SKIN-09's boundary clause for shadows that are signatures rather than the shared
\`elevated\` treatment.

| code | count | boundary |
|---|---:|---|
${boundaryRow(ledger, identityCodes) || "| _(none)_ | 0 | |"}

## Mechanics

Monky keeps mechanics that are selector or component contracts rather than reusable grammar:
pseudo-element geometry, absence sentinels, border/rule mechanics, native or JS-toggled state
mechanics, overlap/layer tricks, and exact component behavior. Phase C's cascade-layer finding
remains a standing caveat: a local rule in Monky's component layer can outrank generated grammar
even when both carry the same socket.

| code | count | boundary |
|---|---:|---|
${boundaryRow(ledger, mechanicsCodes) || "| _(none)_ | 0 | |"}

## User Content

The editor body's authored rich-text defaults remain a user-content contract. Ermine words style
Monky's UI chrome around that content; the content surface itself keeps its own HTML defaults.

| code | count | boundary |
|---|---:|---|
${boundaryRow(ledger, ["user-content"]) || "| _(none)_ | 0 | |"}

## Filed Questions

These rows are not adoption work. They are pre-counted evidence for future Ermine ruling cycles.

| code | rows | evidence |
|---|---:|---|
${followupRows || "| _(none)_ | 0 | |"}
`;
}

export function gateFailures(ledger: CurrentLedgerV2): string[] {
  const failures: string[] = [];
  if (ledger.summary.assimilable > 0) failures.push(`assimilable=${ledger.summary.assimilable}`);
  for (const code of REVIEW_CODES) {
    const count = ledger.summary.byCode[code];
    if (count > 0) failures.push(`${code}=${count}`);
  }
  return failures;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function git(root: string, args: string[]): Promise<string> {
  const result = await execFile("git", args, { cwd: root });
  return result.stdout.trim();
}

async function toolCommit(): Promise<string> {
  const dirty = await git(REPOSITORY_ROOT, ["status", "--porcelain", "--", ...TOOL_INPUTS]);
  if (dirty) throw new Error("Current-ledger tool sources are uncommitted; commit the tool before recording provenance");
  return git(REPOSITORY_ROOT, ["log", "-1", "--format=%H", "--", ...TOOL_INPUTS]);
}

async function projectCommit(projectRoot: string): Promise<string> {
  const dirty = await git(projectRoot, ["status", "--porcelain", "--untracked-files=all"]);
  if (dirty) throw new Error(`Project worktree must be clean before reconciliation:\n${dirty}`);
  return git(projectRoot, ["rev-parse", "HEAD"]);
}

async function writeOrCheck(output: string, expected: string, check: boolean): Promise<void> {
  if (check) {
    const current = await readFile(output, "utf8").catch(() => "");
    if (current !== expected) throw new Error(`${slash(relative(REPOSITORY_ROOT, output))} is stale; run with --write`);
    console.log(`current ${slash(relative(REPOSITORY_ROOT, output))}`);
  } else {
    await writeFile(output, expected);
    console.log(`wrote ${slash(relative(REPOSITORY_ROOT, output))}`);
  }
}

interface CliOptions { project: string; name: string; check: boolean; gate: boolean }

function parseCli(args: string[]): CliOptions {
  const value = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const project = value("--project");
  const name = value("--name");
  const write = args.includes("--write");
  const check = args.includes("--check");
  const gate = args.includes("--gate");
  if (!project || !name || write === check || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error("usage: current-ledger.ts --project <path> --name <slug> (--write|--check) [--gate]");
  }
  return { project: resolve(project), name, check, gate };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const reportRoot = resolve(REPOSITORY_ROOT, "reports/adoption", options.name);
  const profile = await loadProjectProfile(resolve(reportRoot, "project.json"));
  const overrides = await loadOverrides(resolve(reportRoot, "current-overrides.json"));
  const ledger = await generateCurrentLedger({
    projectRoot: options.project,
    name: options.name,
    ermineCommit: await toolCommit(),
    projectCommit: await projectCommit(options.project),
    overrides,
    profile,
  });
  if (options.gate) {
    const failures = gateFailures(ledger);
    if (failures.length) throw new Error(`current-ledger gate failed: ${failures.join(", ")}`);
  }
  if (!options.check) await mkdir(reportRoot, { recursive: true });
  await writeOrCheck(resolve(reportRoot, "current-ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`, options.check);
  await writeOrCheck(resolve(reportRoot, "CURRENT-LEDGER.md"), renderCurrentLedger(ledger), options.check);
  const boundary = renderBoundary(ledger);
  if (boundary) await writeOrCheck(resolve(reportRoot, "BOUNDARY.md"), boundary, options.check);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
