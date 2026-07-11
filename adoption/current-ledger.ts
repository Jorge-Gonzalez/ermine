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

export interface CurrentLedgerV1 {
  version: 1;
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

// ---------------------------------------------------------------------------
// project CSS scan
// ---------------------------------------------------------------------------

function slash(path: string): string {
  return path.split(sep).join("/");
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

async function projectDeclarations(projectRoot: string): Promise<ParsedCssDeclaration[]> {
  const scanRoot = existsSync(resolve(projectRoot, "src")) ? resolve(projectRoot, "src") : projectRoot;
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
async function bridgeAliases(projectRoot: string): Promise<Record<string, string>> {
  const candidates = ["src/theme/socketPalette.ts"];
  const aliases: Record<string, string> = {};
  for (const candidate of candidates) {
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

function compounds(fullSelector: string): string[] {
  return fullSelector.split(/\s*[\s>+~]\s*/).filter(Boolean);
}

interface Classified {
  code: ReasonCode;
  words?: string[];
}

function classify(
  declaration: ParsedCssDeclaration,
  inverse: InverseErmineMap,
  environment: VarEnvironment,
): Classified {
  const { file, property } = declaration;
  const selector = displaySelector(declaration);
  const value = resolveValue(declaration.value, environment);

  if (file.includes("/grammar/")) return { code: "ermine-emitted" };
  if (file.endsWith("ermine.config.css")) return { code: "config-departure" };
  if (declaration.context.some((context) => context.startsWith("@keyframes"))) return { code: "motion-followup" };
  if (/-webkit-scrollbar|^scrollbar-/.test(selector) || /^scrollbar-/.test(property)) return { code: "scrollbar-followup" };
  if (file.includes("/substrate/") || /font(-face)?\.css$/.test(file)) return { code: "substrate" };
  if (file.includes("/theme/")) return { code: "theme-metric" };

  if (/::(before|after|placeholder|selection|marker)/.test(selector) || property === "content") {
    return { code: "pseudo-mechanics" };
  }
  if (/\.content-editor-body[^,{]*\s/.test(selector)) return { code: "user-content" };

  const parts = compounds(selector);
  const ancestors = parts.slice(0, -1);
  const subject = parts[parts.length - 1] ?? "";
  if (ancestors.some((part) => STATE_MARK.test(part))) return { code: "parent-relational" };

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
  if (!condition && STATE_MARK.test(subject)) return { code: "state-review" };
  if (!condition) {
    const matches = inverse.get(matchKey("", property, value));
    if (matches?.length) {
      return { code: "assimilable", words: [...new Set(matches.map((match) => match.word))].sort() };
    }
  }
  if (condition) return { code: "state-review" };
  if (SKIN_PROPERTY.test(property)) return { code: "skin-review" };
  if (!property.startsWith("--") && grammarFamilies.has(propertyFamily(property))) {
    return { code: "identity-geometry" };
  }
  return { code: "identity-review" };
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
}

export async function generateCurrentLedger(options: GenerateOptions): Promise<CurrentLedgerV1> {
  const declarations = await projectDeclarations(options.projectRoot);
  const environment = buildEnvironment(declarations, await bridgeAliases(options.projectRoot));
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
    const { code, words } = classify(declaration, inverse, environment);
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
    version: 1,
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

export function renderCurrentLedger(ledger: CurrentLedgerV1): string {
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
node --import tsx adoption/current-ledger.ts --project ../${ledger.project} --name ${ledger.project} --write
\`\`\`

## Provenance

| source | commit |
|---|---|
| Ermine | \`${ledger.source.ermineCommit}\` |
| ${ledger.project} | \`${ledger.source.projectCommit}\` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Human judgments are recorded in
\`current-overrides.json\` and re-validated on every run.

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
` : "No assimilable declarations remain — the residue is boundary, follow-up questions, and open judgments.\n"}
Every record with its code is in \`current-ledger.json\`.
`;
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

interface CliOptions { project: string; name: string; check: boolean }

function parseCli(args: string[]): CliOptions {
  const value = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const project = value("--project");
  const name = value("--name");
  const write = args.includes("--write");
  const check = args.includes("--check");
  if (!project || !name || write === check || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error("usage: current-ledger.ts --project <path> --name <slug> (--write|--check)");
  }
  return { project: resolve(project), name, check };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const reportRoot = resolve(REPOSITORY_ROOT, "reports/adoption", options.name);
  const overrides = await loadOverrides(resolve(reportRoot, "current-overrides.json"));
  const ledger = await generateCurrentLedger({
    projectRoot: options.project,
    name: options.name,
    ermineCommit: await toolCommit(),
    projectCommit: await projectCommit(options.project),
    overrides,
  });
  if (!options.check) await mkdir(reportRoot, { recursive: true });
  await writeOrCheck(resolve(reportRoot, "current-ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`, options.check);
  await writeOrCheck(resolve(reportRoot, "CURRENT-LEDGER.md"), renderCurrentLedger(ledger), options.check);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
