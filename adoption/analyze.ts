import { execFile as execFileCallback } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { measureCss, grammarFamilies, propertyFamily, type CssSource } from "../analysis/lib.ts";
import { lint, parseWord } from "../src/lint.ts";
import { displaySelector, parseCssDeclarations, type ParsedCssDeclaration } from "./css-parser.ts";
import {
  ADOPTION_DISPOSITIONS,
  type AdoptionLedgerV1,
  type AdoptionRecord,
  type AdoptionSummary,
} from "./types.ts";

const execFile = promisify(execFileCallback);
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ANALYZER_INPUTS = [
  "adoption/analyze.ts",
  "adoption/css-parser.ts",
  "adoption/types.ts",
  "analysis/lib.ts",
  "src/lint.ts",
  "src/registry.ts",
];
const SOURCE_EXTENSIONS = new Set([".css", ".html", ".ts", ".tsx", ".js", ".jsx"]);
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist", "coverage", "build"]);

interface Location {
  file: string;
  line: number;
}

interface ImportEdge extends Location {
  specifier: string;
  resolved: string;
}

interface CssFileRecord {
  file: string;
  bytes: number;
  declarationCount: number;
}

interface CssTemplateRecord extends Location {
  name: string;
  virtualFile: string;
  declarationCount: number;
}

interface ClassOccurrence extends Location {
  source: "attribute" | "class-list" | "class-name-assignment";
  classString: string;
  tokens: string[];
  guaranteedTokens: string[];
  dynamic: boolean;
}

interface StyleOccurrence extends Location {
  expression: string;
}

interface InjectionCall extends Location {
  styleId: string;
  styleArgument: string;
  target: "document" | "shadow-root" | "unknown";
}

interface BundleRecord extends Location {
  name: string;
  members: string[];
  delivery: "page" | "document" | "shadow-root" | "unknown";
}

interface DefinitionDetail {
  file: string;
  line: number;
  selector: string;
  context: string[];
  value: string;
}

interface DuplicateDefinition {
  selector: string;
  property: string;
  definitions: DefinitionDetail[];
}

interface ContextDefinition {
  className: string;
  property: string;
  values: string[];
  definitions: DefinitionDetail[];
}

interface CompositionIssue extends Location {
  classString: string;
  issues: Array<{ rule: string; message: string }>;
}

interface SerializedMeasurements {
  scope: {
    total: number;
    custom: number;
    real: number;
    covered: number;
    uncovered: Record<string, number>;
  };
  values: Record<string, {
    totalTokens: number;
    kinds: Record<string, number>;
    rawLengths: number;
    distinctLengths: number;
    lengths: Array<[number, number]>;
    topValues: Array<[number, number]>;
    topCoverage6: number | null;
    topCoverage12: number | null;
    gridAlignedShare: number | null;
    zeroShare: number | null;
  }>;
}

export interface AdoptionInventory {
  version: 1;
  project: string;
  source: { ermineCommit: string; monkyCommit: string };
  scan: { root: string; excluded: string[] };
  counts: {
    cssFiles: number;
    cssTemplates: number;
    declarations: number;
    importEdges: number;
    rawImports: number;
    linkedStylesheets: number;
    styleInjections: number;
    shadowRoots: number;
    bundles: number;
    staticClassTokens: number;
    classOccurrences: number;
    dynamicClassExpressions: number;
    inlineStyleObjects: number;
    directStyleWrites: number;
    duplicateDefinitions: number;
    contextDependentDefinitions: number;
    undefinedStaticTokens: number;
    grammarPropertyCandidates: number;
  };
  cssFiles: CssFileRecord[];
  cssTemplates: CssTemplateRecord[];
  imports: { css: ImportEdge[]; raw: Array<ImportEdge & { binding: string }>; links: ImportEdge[] };
  delivery: {
    injections: InjectionCall[];
    shadowRoots: Location[];
    bundles: BundleRecord[];
  };
  classes: {
    knownLawfulWords: string[];
    knownUnlawfulWords: string[];
    foreignIdentityOrSkinCandidates: string[];
    undefinedStaticTokens: string[];
    unlawfulCompositions: CompositionIssue[];
    dynamicExpressions: StyleOccurrence[];
  };
  definitions: {
    duplicates: DuplicateDefinition[];
    contextDependent: ContextDefinition[];
  };
  nonStylesheetWrites: {
    inlineStyleObjects: StyleOccurrence[];
    directStyleWrites: StyleOccurrence[];
  };
  measurements: SerializedMeasurements;
  limitations: string[];
}

export interface AnalysisArtifacts {
  inventory: AdoptionInventory;
  ledger: AdoptionLedgerV1;
  baseline: string;
}

export interface AnalyzeProjectOptions {
  projectRoot: string;
  name: string;
  ermineCommit: string;
  projectCommit: string;
}

interface SourceFile {
  absolute: string;
  file: string;
  text: string;
}

function slash(path: string): string {
  return path.split(sep).join("/");
}

function lineAt(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

function normalizeSpace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extension(path: string): string {
  const match = path.toLowerCase().match(/\.[^.]+$/);
  return match?.[0] ?? "";
}

function isTestFile(file: string): boolean {
  return /(^|\/)(__tests__|test|tests)(\/|$)/.test(file) || /\.(test|spec)\.[^.]+$/.test(file);
}

async function walk(root: string): Promise<string[]> {
  const output: string[] = [];
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && SOURCE_EXTENSIONS.has(extension(entry.name))) output.push(path);
    }
  }
  await visit(root);
  return output;
}

async function sourceFiles(projectRoot: string): Promise<{ scanRoot: string; files: SourceFile[] }> {
  const preferred = resolve(projectRoot, "src");
  const scanRoot = existsSync(preferred) ? preferred : projectRoot;
  const paths = await walk(scanRoot);
  const files = await Promise.all(paths.map(async (absolute) => ({
    absolute,
    file: slash(relative(projectRoot, absolute)),
    text: await readFile(absolute, "utf8"),
  })));
  return { scanRoot, files: files.filter((file) => !isTestFile(file.file)) };
}

function resolveImport(file: string, specifier: string, projectRoot: string): string {
  if (!specifier.startsWith(".")) return specifier;
  return slash(relative(projectRoot, resolve(projectRoot, dirname(file), specifier)));
}

function cssImportEdges(file: SourceFile, projectRoot: string): ImportEdge[] {
  const output: ImportEdge[] = [];
  const pattern = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?[^;]*;/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(file.text))) {
    output.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      specifier: match[1],
      resolved: resolveImport(file.file, match[1], projectRoot),
    });
  }
  return output;
}

function rawImportEdges(file: SourceFile, projectRoot: string): Array<ImportEdge & { binding: string }> {
  const output: Array<ImportEdge & { binding: string }> = [];
  const pattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+\.css\?raw)["']/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(file.text))) {
    const specifier = match[2];
    output.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      binding: match[1],
      specifier,
      resolved: resolveImport(file.file, specifier.replace(/\?raw$/, ""), projectRoot),
    });
  }
  return output;
}

function linkEdges(file: SourceFile, projectRoot: string): ImportEdge[] {
  const output: ImportEdge[] = [];
  const pattern = /<link\b[^>]*\brel\s*=\s*["'][^"']*stylesheet[^"']*["'][^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>|<link\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*\brel\s*=\s*["'][^"']*stylesheet[^"']*["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(file.text))) {
    const specifier = match[1] ?? match[2];
    const resolved = specifier.startsWith("/")
      ? specifier.slice(1)
      : resolveImport(file.file, specifier, projectRoot);
    output.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      specifier,
      resolved,
    });
  }
  return output;
}

function cssTemplates(file: SourceFile): Array<{ record: CssTemplateRecord; css: string; declarations: ParsedCssDeclaration[] }> {
  const output: Array<{ record: CssTemplateRecord; css: string; declarations: ParsedCssDeclaration[] }> = [];
  const pattern = /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)[^=;\n]*=\s*`([\s\S]*?)`/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(file.text))) {
    const css = match[2];
    if (!/{[\s\S]*[-a-zA-Z]+\s*:\s*[^;}]+[;}]/.test(css)) continue;
    const name = match[1];
    const line = lineAt(file.text, match.index);
    const virtualFile = `${file.file}#${name}`;
    const declarations = parseCssDeclarations(css, virtualFile).map((declaration) => ({
      ...declaration,
      line: declaration.line + line - 1,
    }));
    output.push({
      css,
      declarations,
      record: { file: file.file, line, name, virtualFile, declarationCount: declarations.length },
    });
  }
  return output;
}

function callArguments(source: string, name: string): Array<{ index: number; arguments: string[] }> {
  const output: Array<{ index: number; arguments: string[] }> = [];
  let search = 0;
  while (search < source.length) {
    const found = source.indexOf(name, search);
    if (found < 0) break;
    const prefix = source.slice(Math.max(0, found - 20), found);
    let opening = found + name.length;
    while (/\s/.test(source[opening] ?? "")) opening += 1;
    if (source[opening] !== "(" || /function\s+$/.test(prefix)) {
      search = found + name.length;
      continue;
    }
    let quote: string | null = null;
    let escaped = false;
    let depth = 1;
    let closing = -1;
    for (let index = opening + 1; index < source.length; index += 1) {
      const character = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'" || character === "`") quote = character;
      else if (character === "(") depth += 1;
      else if (character === ")") {
        depth -= 1;
        if (depth === 0) { closing = index; break; }
      }
    }
    if (closing < 0) break;
    const body = source.slice(opening + 1, closing);
    const args: string[] = [];
    let start = 0;
    let nested = 0;
    quote = null;
    escaped = false;
    for (let index = 0; index <= body.length; index += 1) {
      const character = body[index] ?? ",";
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = null;
      } else if (character === '"' || character === "'" || character === "`") quote = character;
      else if ("([{<".includes(character)) nested += 1;
      else if (")]}>".includes(character)) nested = Math.max(0, nested - 1);
      else if (character === "," && nested === 0) {
        args.push(normalizeSpace(body.slice(start, index)));
        start = index + 1;
      }
    }
    output.push({ index: found, arguments: args });
    search = closing + 1;
  }
  return output;
}

function injectionCalls(file: SourceFile): InjectionCall[] {
  return callArguments(file.text, "createStyleInjector").map((call) => {
    const targetExpression = call.arguments[2] ?? "";
    return {
      file: file.file,
      line: lineAt(file.text, call.index),
      styleId: call.arguments[0] ?? "<missing>",
      styleArgument: call.arguments[1] ?? "<missing>",
      target: /shadow/i.test(targetExpression) ? "shadow-root" : targetExpression ? "unknown" : "document",
    };
  });
}

function shadowRoots(file: SourceFile): Location[] {
  const output: Location[] = [];
  const pattern = /\.attachShadow\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(file.text))) output.push({ file: file.file, line: lineAt(file.text, match.index) });
  return output;
}

function arrayBundles(file: SourceFile, styleBindings: Set<string>): BundleRecord[] {
  const output: BundleRecord[] = [];
  const pattern = /const\s+([A-Za-z_$][\w$]*)\s*=\s*\[([\s\S]*?)\]\s*\.join\s*\([^)]*\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(file.text))) {
    const members = match[2].split(",").map(normalizeSpace).filter(Boolean);
    if (!members.some((member) => [...styleBindings].some((binding) => member.includes(binding)))) continue;
    output.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      name: match[1],
      members,
      delivery: "unknown",
    });
  }
  return output;
}

function tokens(value: string): string[] {
  return normalizeSpace(value).split(" ").filter((token) => /^[A-Za-z_][A-Za-z0-9_:-]*$/.test(token));
}

function templateClassParts(template: string): { all: string[]; guaranteed: string[]; dynamic: boolean } {
  const expressions: string[] = [];
  const literal = template.replace(/\$\{([\s\S]*?)\}/g, (_whole, expression: string) => {
    expressions.push(expression);
    return " ";
  });
  const guaranteed = tokens(literal);
  const possible = [...guaranteed];
  for (const expression of expressions) {
    const strings = expression.matchAll(/["']([^"']*)["']/g);
    for (const match of strings) possible.push(...tokens(match[1]));
  }
  return { all: [...new Set(possible)], guaranteed, dynamic: expressions.length > 0 };
}

function classOccurrences(file: SourceFile): { occurrences: ClassOccurrence[]; dynamic: StyleOccurrence[] } {
  const occurrences: ClassOccurrence[] = [];
  const dynamic: StyleOccurrence[] = [];
  const attribute = /\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*`([\s\S]*?)`\s*\})/g;
  let match: RegExpExecArray | null;
  while ((match = attribute.exec(file.text))) {
    const template = match[5];
    const value = match[1] ?? match[2] ?? match[3] ?? match[4] ?? template ?? "";
    const parts = template === undefined
      ? { all: tokens(value), guaranteed: tokens(value), dynamic: false }
      : templateClassParts(value);
    if (parts.all.length) {
      occurrences.push({
        file: file.file,
        line: lineAt(file.text, match.index),
        source: "attribute",
        classString: normalizeSpace(value),
        tokens: parts.all,
        guaranteedTokens: parts.guaranteed,
        dynamic: parts.dynamic,
      });
    }
    if (parts.dynamic) dynamic.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      expression: normalizeSpace(value),
    });
  }

  const nonLiteral = /\bclassName\s*=\s*\{(?!\s*["'`])([^}\n]+)\}/g;
  while ((match = nonLiteral.exec(file.text))) {
    const expression = normalizeSpace(match[1]);
    const possible = [...match[1].matchAll(/["']([^"']*)["']/g)].flatMap((item) => tokens(item[1]));
    if (possible.length) occurrences.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      source: "attribute",
      classString: expression,
      tokens: [...new Set(possible)],
      guaranteedTokens: [],
      dynamic: true,
    });
    dynamic.push({ file: file.file, line: lineAt(file.text, match.index), expression });
  }

  const classList = /\.classList\.(?:add|remove|toggle)\s*\(([^)]*)\)/g;
  while ((match = classList.exec(file.text))) {
    const values = [...match[1].matchAll(/["']([^"']+)["']/g)].flatMap((item) => tokens(item[1]));
    if (values.length) occurrences.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      source: "class-list",
      classString: values.join(" "),
      tokens: values,
      guaranteedTokens: values,
      dynamic: false,
    });
  }

  const assignment = /\.className\s*=\s*["']([^"']*)["']/g;
  while ((match = assignment.exec(file.text))) {
    const values = tokens(match[1]);
    if (values.length) occurrences.push({
      file: file.file,
      line: lineAt(file.text, match.index),
      source: "class-name-assignment",
      classString: match[1],
      tokens: values,
      guaranteedTokens: values,
      dynamic: false,
    });
  }
  return { occurrences, dynamic };
}

function nonStylesheetWrites(file: SourceFile): { inline: StyleOccurrence[]; direct: StyleOccurrence[] } {
  const inline: StyleOccurrence[] = [];
  const direct: StyleOccurrence[] = [];
  let match: RegExpExecArray | null;
  const object = /\bstyle\s*=\s*\{\{([\s\S]*?)\}\}/g;
  while ((match = object.exec(file.text))) inline.push({
    file: file.file,
    line: lineAt(file.text, match.index),
    expression: normalizeSpace(match[1]),
  });
  const write = /\.[sS]tyle(?:\.[A-Za-z_$][\w$]*\s*=|\.setProperty\s*\([^)]*\))/g;
  while ((match = write.exec(file.text))) direct.push({
    file: file.file,
    line: lineAt(file.text, match.index),
    expression: normalizeSpace(match[0]),
  });
  return { inline, direct };
}

function definedClasses(declarations: readonly ParsedCssDeclaration[]): Set<string> {
  const output = new Set<string>();
  for (const declaration of declarations) {
    for (const match of declaration.selector.matchAll(/\.([_a-zA-Z][-_a-zA-Z0-9]*)/g)) output.add(match[1]);
  }
  return output;
}

function definitionDetail(declaration: ParsedCssDeclaration): DefinitionDetail {
  return {
    file: declaration.file,
    line: declaration.line,
    selector: declaration.selector,
    context: declaration.context,
    value: declaration.value,
  };
}

function definitionDiagnostics(declarations: readonly ParsedCssDeclaration[]): {
  duplicates: DuplicateDefinition[];
  contextDependent: ContextDefinition[];
} {
  const exact = new Map<string, ParsedCssDeclaration[]>();
  const byClass = new Map<string, ParsedCssDeclaration[]>();
  for (const declaration of declarations) {
    const exactKey = `${declaration.selector}\u0000${declaration.property}`;
    (exact.get(exactKey) ?? exact.set(exactKey, []).get(exactKey)!).push(declaration);
    for (const className of declaration.selector.matchAll(/\.([_a-zA-Z][-_a-zA-Z0-9]*)/g)) {
      const key = `${className[1]}\u0000${declaration.property}`;
      (byClass.get(key) ?? byClass.set(key, []).get(key)!).push(declaration);
    }
  }
  const duplicates = [...exact.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key, values]) => {
      const [selector, property] = key.split("\u0000");
      return { selector, property, definitions: values.map(definitionDetail) };
    })
    .sort((left, right) => `${left.selector}:${left.property}`.localeCompare(`${right.selector}:${right.property}`));
  const contextDependent = [...byClass.entries()]
    .filter(([, values]) => new Set(values.map((value) => value.value)).size > 1)
    .map(([key, values]) => {
      const [className, property] = key.split("\u0000");
      return {
        className,
        property,
        values: [...new Set(values.map((value) => value.value))].sort(),
        definitions: values.map(definitionDetail),
      };
    })
    .sort((left, right) => `${left.className}:${left.property}`.localeCompare(`${right.className}:${right.property}`));
  return { duplicates, contextDependent };
}

function serializeMeasurements(sources: CssSource[]): SerializedMeasurements {
  const measurements = measureCss(sources, "adoption");
  return {
    scope: {
      total: measurements.scope.total,
      custom: measurements.scope.custom,
      real: measurements.scope.real,
      covered: measurements.scope.covered,
      uncovered: Object.fromEntries([...measurements.scope.uncovered].sort(([left], [right]) => left.localeCompare(right))),
    },
    values: Object.fromEntries(Object.entries(measurements.values).map(([name, report]) => [name, {
      totalTokens: report.totalTokens,
      kinds: report.kinds,
      rawLengths: report.rawLengths,
      distinctLengths: report.distinctLengths,
      lengths: [...report.lengths].sort(([left], [right]) => left - right),
      topValues: report.topValues,
      topCoverage6: report.topCoverage(6),
      topCoverage12: report.topCoverage(12),
      gridAlignedShare: report.gridAlignedShare,
      zeroShare: report.zeroShare,
    }])),
  };
}

function resetSubstrate(declaration: ParsedCssDeclaration): boolean {
  const physicalFile = declaration.file.split("#")[0];
  return basename(physicalFile).toLowerCase() === "reset.css" && !/[.#\[]/.test(declaration.selector);
}

function ledgerFrom(
  name: string,
  source: { ermineCommit: string; monkyCommit: string },
  declarations: readonly ParsedCssDeclaration[],
): AdoptionLedgerV1 {
  const occurrences = new Map<string, number>();
  const records: AdoptionRecord[] = declarations.map((declaration) => {
    const selector = displaySelector(declaration);
    const key = `${declaration.file}::${selector}::${declaration.property}`;
    const occurrence = (occurrences.get(key) ?? 0) + 1;
    occurrences.set(key, occurrence);
    const substrate = resetSubstrate(declaration);
    const family = propertyFamily(declaration.property);
    const candidate = !declaration.property.startsWith("--") && grammarFamilies.has(family);
    const base = {
      id: `${key}::${occurrence}`,
      file: declaration.file,
      selector,
      property: declaration.property,
      value: declaration.value,
      evidence: substrate
        ? "Mechanical substrate test: reset.css source with no class, ID, or attribute selector"
        : candidate
          ? `Mechanical baseline only: Ermine owns the ${family} property family; semantic equivalence is unreviewed`
          : `Mechanical baseline only: Ermine does not own the ${family} property family; application ownership is unreviewed`,
    };
    if (substrate) return { ...base, disposition: "substrate" };
    return {
      ...base,
      disposition: "uncertain",
      pending: candidate
        ? `Human must decide whether the ${family} property preserves intent through an existing Ermine mapping`
        : "Human must classify this declaration as skin, identity, substrate, gap, or dead",
    };
  });
  const byDisposition = Object.fromEntries(ADOPTION_DISPOSITIONS.map((disposition) => [
    disposition,
    records.filter((record) => record.disposition === disposition).length,
  ])) as AdoptionSummary["byDisposition"];
  return {
    version: 1,
    project: name,
    source,
    records,
    summary: { totalRecords: records.length, byDisposition },
  };
}

function percent(value: number, total: number): string {
  return total ? `${(value / total * 100).toFixed(1)}%` : "—";
}

function renderBaseline(inventory: AdoptionInventory, ledger: AdoptionLedgerV1): string {
  const counts = inventory.counts;
  const scope = inventory.measurements.scope;
  const dispositions = ADOPTION_DISPOSITIONS.map((disposition) =>
    `| ${disposition} | ${ledger.summary.byDisposition[disposition]} |`).join("\n");
  return `# Ermine adoption baseline — ${inventory.project}

Generated artifact. Do not hand-edit; run the commands below.

## Provenance

| source | commit |
|---|---|
| Ermine analyzer | \`${inventory.source.ermineCommit}\` |
| ${inventory.project} | \`${inventory.source.monkyCommit}\` |

Reproduce from the Ermine repository root:

\`\`\`sh
node --import tsx adoption/analyze.ts --project ../${inventory.project} --name ${inventory.project} --write
node --import tsx adoption/analyze.ts --project ../${inventory.project} --name ${inventory.project} --check
\`\`\`

## Source and delivery inventory

| measure | count |
|---|---:|
| CSS files | ${counts.cssFiles} |
| CSS template literals | ${counts.cssTemplates} |
| parsed declarations | ${counts.declarations} |
| CSS \`@import\` edges | ${counts.importEdges} |
| raw CSS imports | ${counts.rawImports} |
| linked page stylesheets | ${counts.linkedStylesheets} |
| style injection calls | ${counts.styleInjections} |
| Shadow Root creation sites | ${counts.shadowRoots} |
| recorded bundles | ${counts.bundles} |
| inline style objects (limitation) | ${counts.inlineStyleObjects} |
| direct \`.style\` writes (limitation) | ${counts.directStyleWrites} |

The declaration ledger counts each physical CSS file and detected TypeScript CSS template once.
Imports and bundle assembly are delivery edges, not duplicate declarations.

## Ermine compatibility ceiling

The existing measurement library reports ${scope.covered}/${scope.real} real-property declarations
(${percent(scope.covered, scope.real)}) in property families Ermine can represent. This is a property
scope ceiling, not a semantic mapping rate.

| static-class diagnostic | count |
|---|---:|
| distinct static tokens | ${counts.staticClassTokens} |
| lawful Ermine words | ${inventory.classes.knownLawfulWords.length} |
| recognized but unlawful words | ${inventory.classes.knownUnlawfulWords.length} |
| foreign identity/skin candidates | ${inventory.classes.foreignIdentityOrSkinCandidates.length} |
| unlawful known-word compositions | ${counts.classOccurrences ? inventory.classes.unlawfulCompositions.length : 0} |
| undefined static tokens | ${counts.undefinedStaticTokens} |
| duplicate selector/property definitions | ${counts.duplicateDefinitions} |
| context-dependent class/property definitions | ${counts.contextDependentDefinitions} |

Foreign tokens are candidates only. This baseline does not decide whether they are identity, skin,
dead code, or missing grammar.

## Initial declaration dispositions

| disposition | declarations |
|---|---:|
${dispositions}

All non-reset declarations begin \`uncertain\`. Grammar-owned properties are only candidates until a
human confirms intent and a complete class string passes Ermine linting. The mechanically recognized
reset subset begins \`substrate\` under the protocol's reset test.

## Limitations

${inventory.limitations.map((limitation) => `- ${limitation}`).join("\n")}

Detailed paths, class diagnostics, duplicate definitions, measurements, and non-stylesheet writes are
in \`inventory.json\`; every parsed declaration is in \`ledger.json\` exactly once.

No grammar or skin ruling is made here.
`;
}

export async function analyzeProject(options: AnalyzeProjectOptions): Promise<AnalysisArtifacts> {
  const projectRoot = resolve(options.projectRoot);
  const { scanRoot, files } = await sourceFiles(projectRoot);
  const cssFiles = files.filter((file) => extension(file.file) === ".css");
  const parsedCss = cssFiles.flatMap((file) => parseCssDeclarations(file.text, file.file));
  const templates = files.flatMap(cssTemplates);
  const declarations = [...parsedCss, ...templates.flatMap((template) => template.declarations)]
    .sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line ||
      left.selector.localeCompare(right.selector) || left.property.localeCompare(right.property));

  const cssImports = cssFiles.flatMap((file) => cssImportEdges(file, projectRoot));
  const rawImports = files.flatMap((file) => rawImportEdges(file, projectRoot));
  const links = files.filter((file) => extension(file.file) === ".html").flatMap((file) => linkEdges(file, projectRoot));
  const injections = files.flatMap(injectionCalls);
  const roots = files.flatMap(shadowRoots);
  const styleBindings = new Set([
    ...rawImports.map((edge) => edge.binding),
    ...templates.map((template) => template.record.name),
  ]);
  const namedBundles = files.flatMap((file) => arrayBundles(file, styleBindings));
  const bundleByName = new Map(namedBundles.map((bundle) => [bundle.name, bundle]));
  for (const injection of injections) {
    const named = bundleByName.get(injection.styleArgument);
    if (named) named.delivery = injection.target;
  }
  const deliveredBundles: BundleRecord[] = [
    ...namedBundles,
    ...injections.filter((injection) => !bundleByName.has(injection.styleArgument)).map((injection) => ({
      file: injection.file,
      line: injection.line,
      name: injection.styleArgument,
      members: injection.styleArgument.split("+").map(normalizeSpace).filter(Boolean),
      delivery: injection.target,
    })),
    ...links.map((link) => ({
      file: link.file,
      line: link.line,
      name: link.specifier,
      members: [link.resolved],
      delivery: "page" as const,
    })),
  ].sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line);

  const classScan = files.map(classOccurrences);
  const occurrences = classScan.flatMap((scan) => scan.occurrences);
  const dynamicExpressions = classScan.flatMap((scan) => scan.dynamic);
  const staticTokens = [...new Set(occurrences.flatMap((occurrence) => occurrence.tokens))].sort();
  const lawful: string[] = [];
  const unlawful: string[] = [];
  const foreign: string[] = [];
  for (const token of staticTokens) {
    const parsed = parseWord(token);
    if (!parsed.axis) foreign.push(token);
    else {
      const errors = lint(token, new Set(), {}).filter((issue) =>
        issue.level === "error" && issue.rule !== "state-entailment" && issue.rule !== "relational-entailment");
      (errors.length ? unlawful : lawful).push(token);
    }
  }
  const unlawfulCompositions: CompositionIssue[] = [];
  for (const occurrence of occurrences) {
    const recognized = occurrence.guaranteedTokens.filter((token) => parseWord(token).axis);
    if (!recognized.length) continue;
    const issues = lint(recognized.join(" "), new Set(), {}).filter((issue) =>
      issue.level === "error" && issue.rule !== "state-entailment" && issue.rule !== "relational-entailment");
    if (issues.length) unlawfulCompositions.push({
      file: occurrence.file,
      line: occurrence.line,
      classString: recognized.join(" "),
      issues: issues.map((issue) => ({ rule: issue.rule, message: issue.msg })),
    });
  }
  const definitions = definedClasses(declarations);
  const undefinedTokens = staticTokens.filter((token) => !definitions.has(token));
  const definitionReports = definitionDiagnostics(declarations);
  const writes = files.map(nonStylesheetWrites);
  const inlineStyleObjects = writes.flatMap((write) => write.inline);
  const directStyleWrites = writes.flatMap((write) => write.direct);
  const measurementSources: CssSource[] = [
    ...cssFiles.map((file) => ({ label: file.file, location: file.file, css: file.text })),
    ...templates.map((template) => ({
      label: template.record.virtualFile,
      location: template.record.virtualFile,
      css: template.css,
    })),
  ];
  const source = { ermineCommit: options.ermineCommit, monkyCommit: options.projectCommit };
  const ledger = ledgerFrom(options.name, source, declarations);
  const grammarPropertyCandidates = declarations.filter((declaration) =>
    !declaration.property.startsWith("--") && grammarFamilies.has(propertyFamily(declaration.property))).length;
  const limitations = [
    `Only ${slash(relative(projectRoot, scanRoot)) || "."}/ is scanned; ignored docs, fixtures, public test pages, build output, dependencies, and test files are excluded.`,
    "Static syntax only: runtime-computed imports, class names, selectors, and CSSOM mutations are not interpreted.",
    "Template CSS detection is limited to const-assigned template literals containing declaration-shaped text.",
    "Dynamic class expressions contribute discoverable literal branches, but possible co-occurrence is not inferred.",
    "State and relational entailment are not judged from string extraction; application markup requires later review.",
    "Inline style objects and direct .style writes are counted as limitations and are not converted into declaration ledger records.",
    "The CSS parser handles ordinary nested at-rules but does not execute preprocessors, resolve the cascade, or observe computed styles.",
    "Property-family coverage comes from analysis/lib.ts and is a compatibility ceiling, not proof of semantic equivalence.",
  ];
  const inventory: AdoptionInventory = {
    version: 1,
    project: options.name,
    source,
    scan: {
      root: slash(relative(projectRoot, scanRoot)) || ".",
      excluded: ["dependencies", "build output", "test files", "ignored files", "paths outside scan root"],
    },
    counts: {
      cssFiles: cssFiles.length,
      cssTemplates: templates.length,
      declarations: declarations.length,
      importEdges: cssImports.length,
      rawImports: rawImports.length,
      linkedStylesheets: links.length,
      styleInjections: injections.length,
      shadowRoots: roots.length,
      bundles: deliveredBundles.length,
      staticClassTokens: staticTokens.length,
      classOccurrences: occurrences.length,
      dynamicClassExpressions: dynamicExpressions.length,
      inlineStyleObjects: inlineStyleObjects.length,
      directStyleWrites: directStyleWrites.length,
      duplicateDefinitions: definitionReports.duplicates.length,
      contextDependentDefinitions: definitionReports.contextDependent.length,
      undefinedStaticTokens: undefinedTokens.length,
      grammarPropertyCandidates,
    },
    cssFiles: cssFiles.map((file) => ({
      file: file.file,
      bytes: Buffer.byteLength(file.text),
      declarationCount: parsedCss.filter((declaration) => declaration.file === file.file).length,
    })),
    cssTemplates: templates.map((template) => template.record),
    imports: { css: cssImports, raw: rawImports, links },
    delivery: { injections, shadowRoots: roots, bundles: deliveredBundles },
    classes: {
      knownLawfulWords: lawful,
      knownUnlawfulWords: unlawful,
      foreignIdentityOrSkinCandidates: foreign,
      undefinedStaticTokens: undefinedTokens,
      unlawfulCompositions,
      dynamicExpressions,
    },
    definitions: definitionReports,
    nonStylesheetWrites: { inlineStyleObjects, directStyleWrites },
    measurements: serializeMeasurements(measurementSources),
    limitations,
  };
  return { inventory, ledger, baseline: renderBaseline(inventory, ledger) };
}

async function git(root: string, args: string[]): Promise<string> {
  const result = await execFile("git", args, { cwd: root });
  return result.stdout.trim();
}

async function analyzerCommit(): Promise<string> {
  const dirty = await git(REPOSITORY_ROOT, ["status", "--porcelain", "--", ...ANALYZER_INPUTS]);
  if (dirty) throw new Error("Adoption analyzer sources are uncommitted; commit the analyzer before recording provenance");
  return git(REPOSITORY_ROOT, ["log", "-1", "--format=%H", "--", ...ANALYZER_INPUTS]);
}

async function projectCommit(projectRoot: string): Promise<string> {
  const dirty = await git(projectRoot, ["status", "--porcelain", "--untracked-files=all"]);
  if (dirty) throw new Error(`Project worktree must be clean before baseline analysis:\n${dirty}`);
  return git(projectRoot, ["rev-parse", "HEAD"]);
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function writeOrCheck(
  output: string,
  expected: string,
  check: boolean,
): Promise<void> {
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
    throw new Error("usage: analyze.ts --project <path> --name <slug> (--write|--check)");
  }
  return { project: resolve(project), name, check };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const artifacts = await analyzeProject({
    projectRoot: options.project,
    name: options.name,
    ermineCommit: await analyzerCommit(),
    projectCommit: await projectCommit(options.project),
  });
  const output = resolve(REPOSITORY_ROOT, "reports/adoption", options.name);
  if (!options.check) await mkdir(output, { recursive: true });
  await writeOrCheck(resolve(output, "inventory.json"), json(artifacts.inventory), options.check);
  await writeOrCheck(resolve(output, "ledger.json"), json(artifacts.ledger), options.check);
  await writeOrCheck(resolve(output, "BASELINE.md"), artifacts.baseline, options.check);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
