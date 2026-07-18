import { buildStylesheet } from "./css.ts";
import { orderParagraph } from "./format-paragraph.ts";
import { lint, parseWord, type Issue } from "./lint.ts";

export type CombineScope = "project" | "package" | "shared";

export interface RawCombineDefinition {
  name: string;
  intent?: string;
  scope?: CombineScope;
  evidence: string[];
  classes: string[];
}

export interface CombineDefinition {
  name: string;
  intent?: string;
  scope: CombineScope;
  evidence: string[];
  classes: string[];
  classString: string;
  sourceClasses: string[];
  sourceClassString: string;
  lint: Issue[];
}

export interface CombineDocument {
  version: 1;
  combines: CombineDefinition[];
}

export interface VisibleCombineToken {
  token: string;
  kind: "combine" | "class";
}

export interface ExpandedCombineToken {
  token: string;
  origin:
    | { kind: "direct"; sourceToken: string }
    | { kind: "combine"; combine: string; sourceToken: string };
}

export interface CombineParagraphExpansion {
  source: string;
  visibleTokens: VisibleCombineToken[];
  expandedTokens: ExpandedCombineToken[];
  normalizedVisible: string;
  normalizedExpanded: string;
  lint: Issue[];
}

export interface ParseCombineOptions {
  sourceName?: string;
}

export interface FormatCombineOptions extends ParseCombineOptions {}

export interface BuildCombineStylesheetOptions {
  names?: Iterable<string>;
}

type LongField = "intent" | "scope" | "evidence" | "classes";

const NAME = /^[a-z][a-z0-9-]*$/;
const LONG_FIELDS = new Set<LongField>(["intent", "scope", "evidence", "classes"]);
const SCOPES = new Set<CombineScope>(["project", "package", "shared"]);

class Reader {
  index = 0;

  constructor(readonly source: string, readonly sourceName: string) {}

  done(): boolean {
    return this.index >= this.source.length;
  }

  peek(): string {
    return this.source[this.index] ?? "";
  }

  error(message: string): Error {
    const prefix = this.source.slice(0, this.index);
    const line = prefix.split("\n").length;
    const column = prefix.length - prefix.lastIndexOf("\n");
    return new Error(`${this.sourceName}:${line}:${column}: ${message}`);
  }

  skipWhitespace(): void {
    while (!this.done()) {
      if (/\s/.test(this.peek())) {
        this.index += 1;
        continue;
      }
      if (this.source.startsWith("//", this.index)) {
        this.index = this.source.indexOf("\n", this.index);
        if (this.index < 0) this.index = this.source.length;
        continue;
      }
      if (this.peek() === "#") {
        this.index = this.source.indexOf("\n", this.index);
        if (this.index < 0) this.index = this.source.length;
        continue;
      }
      break;
    }
  }

  readIdentifier(label: string): string {
    this.skipWhitespace();
    const match = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(this.source.slice(this.index));
    if (!match) throw this.error(`expected ${label}`);
    this.index += match[0].length;
    return match[0];
  }

  expect(value: string): void {
    this.skipWhitespace();
    if (!this.source.startsWith(value, this.index)) throw this.error(`expected '${value}'`);
    this.index += value.length;
  }

  tryTake(value: string): boolean {
    this.skipWhitespace();
    if (!this.source.startsWith(value, this.index)) return false;
    this.index += value.length;
    return true;
  }

  readUntilLineEndOrBlockEnd(): string {
    this.skipWhitespace();
    const start = this.index;
    while (!this.done() && this.peek() !== "\n" && this.peek() !== "}") this.index += 1;
    return this.source.slice(start, this.index).trim();
  }

  readBracketContent(): string {
    this.expect("[");
    const start = this.index;
    while (!this.done() && this.peek() !== "]") this.index += 1;
    if (this.done()) throw this.error("expected ']'");
    const content = this.source.slice(start, this.index);
    this.index += 1;
    return content;
  }
}

function classTokens(content: string): string[] {
  return content.trim().split(/\s+/).filter(Boolean);
}

function evidenceItems(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseShort(reader: Reader, name: string): RawCombineDefinition {
  reader.expect(":");
  return {
    name,
    evidence: [],
    classes: classTokens(reader.readBracketContent()),
  };
}

function parseLong(reader: Reader, name: string): RawCombineDefinition {
  const fields: Partial<Record<LongField, unknown>> = {};
  reader.expect("{");

  while (true) {
    reader.skipWhitespace();
    if (reader.tryTake("}")) break;
    if (reader.done()) throw reader.error("expected '}'");

    const key = reader.readIdentifier("combine field") as LongField;
    if (!LONG_FIELDS.has(key)) throw reader.error(`unknown combine field '${key}'`);
    if (fields[key] !== undefined) throw reader.error(`duplicate combine field '${key}'`);
    reader.expect(":");

    if (key === "classes") {
      fields.classes = classTokens(reader.readBracketContent());
    } else if (key === "evidence") {
      fields.evidence = evidenceItems(reader.readBracketContent());
    } else {
      fields[key] = reader.readUntilLineEndOrBlockEnd();
    }
  }

  if (!Array.isArray(fields.classes)) throw reader.error(`combine '${name}' is missing required field 'classes'`);
  const scope = fields.scope === undefined || fields.scope === "" ? undefined : String(fields.scope);
  if (scope !== undefined && !SCOPES.has(scope as CombineScope)) {
    throw reader.error(`combine '${name}' has unsupported scope '${scope}'`);
  }

  return {
    name,
    ...(fields.intent ? { intent: String(fields.intent) } : {}),
    ...(scope ? { scope: scope as CombineScope } : {}),
    evidence: Array.isArray(fields.evidence) ? fields.evidence as string[] : [],
    classes: fields.classes as string[],
  };
}

export function parseCombineSource(source: string, options: ParseCombineOptions = {}): RawCombineDefinition[] {
  const reader = new Reader(source, options.sourceName ?? "ermine.combines");
  const combines: RawCombineDefinition[] = [];

  while (true) {
    reader.skipWhitespace();
    if (reader.done()) break;
    const keyword = reader.readIdentifier("'combine'");
    if (keyword !== "combine") throw reader.error(`expected 'combine', got '${keyword}'`);
    const name = reader.readIdentifier("combine name");
    reader.skipWhitespace();
    combines.push(reader.peek() === "{"
      ? parseLong(reader, name)
      : parseShort(reader, name));
  }

  return combines;
}

function validateName(definition: RawCombineDefinition, errors: string[]): void {
  if (!NAME.test(definition.name)) {
    errors.push(`combine '${definition.name}': name must match ${NAME.source}`);
    return;
  }
  if (definition.name.startsWith("sf-")) {
    errors.push(`combine '${definition.name}': names starting with 'sf-' are reserved for semantic fragments`);
  }
  if (parseWord(definition.name).axis !== null) {
    errors.push(`combine '${definition.name}': name collides with an Ermine class`);
  }
}

function validateClasses(definition: RawCombineDefinition, names: Set<string>, errors: string[]): void {
  if (definition.classes.length === 0) {
    errors.push(`combine '${definition.name}': classes must contain at least one Ermine class`);
  }
  for (const token of definition.classes) {
    if (names.has(token)) {
      errors.push(`combine '${definition.name}': classes must not reference combine '${token}'`);
    }
    if (token.startsWith("sf-")) {
      errors.push(`combine '${definition.name}': classes must not contain semantic fragment '${token}'`);
    }
  }

  const classString = definition.classes.join(" ");
  for (const issue of lint(classString)) {
    if (issue.level === "error") {
      errors.push(`combine '${definition.name}': ${issue.rule}: ${issue.msg}`);
    }
  }
}

export function normalizeCombines(definitions: RawCombineDefinition[]): CombineDocument {
  const errors: string[] = [];
  const seen = new Set<string>();
  const names = new Set(definitions.map((definition) => definition.name));

  for (const definition of definitions) {
    validateName(definition, errors);
    if (seen.has(definition.name)) errors.push(`combine '${definition.name}': duplicate combine name`);
    seen.add(definition.name);
    validateClasses(definition, names, errors);
  }
  if (errors.length) throw new Error(errors.join("\n"));

  return {
    version: 1,
    combines: definitions.map((definition) => {
      const sourceClassString = definition.classes.join(" ");
      const classString = orderParagraph(sourceClassString);
      const lintIssues = lint(classString);
      return {
        name: definition.name,
        ...(definition.intent ? { intent: definition.intent } : {}),
        scope: definition.scope ?? "project",
        evidence: [...definition.evidence],
        classes: classString.split(/\s+/).filter(Boolean),
        classString,
        sourceClasses: [...definition.classes],
        sourceClassString,
        lint: lintIssues,
      };
    }),
  };
}

export function parseAndNormalizeCombines(source: string, options: ParseCombineOptions = {}): CombineDocument {
  return normalizeCombines(parseCombineSource(source, options));
}

function combineMap(document: CombineDocument): Map<string, CombineDefinition> {
  return new Map(document.combines.map((combine) => [combine.name, combine]));
}

function tokensOf(classString: string): string[] {
  return classString.trim().split(/\s+/).filter(Boolean);
}

function classSelector(word: string): string {
  return `.${word.replace(/([^a-zA-Z0-9_-])/g, "\\$1")}`;
}

function normalizeVisible(tokens: VisibleCombineToken[]): string {
  const combines = tokens.filter((token) => token.kind === "combine").map((token) => token.token);
  const direct = tokens.filter((token) => token.kind === "class").map((token) => token.token);
  const orderedDirect = tokensOf(orderParagraph(direct.join(" ")));
  return [...combines, ...orderedDirect].join(" ");
}

function originsByToken(expandedTokens: ExpandedCombineToken[]): Map<string, string[]> {
  const origins = new Map<string, string[]>();
  for (const item of expandedTokens) {
    if (item.origin.kind !== "combine") continue;
    const current = origins.get(item.token) ?? [];
    current.push(item.origin.combine);
    origins.set(item.token, current);
  }
  return origins;
}

function annotateHiddenOrigins(issue: Issue, expandedTokens: ExpandedCombineToken[]): Issue {
  const origins = originsByToken(expandedTokens);
  const quoted = [...issue.msg.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  const notes = quoted.flatMap((token) => (origins.get(token) ?? []).map((combine) => `${token} from combine '${combine}'`));
  const unique = [...new Set(notes)];
  if (!unique.length) return issue;
  return { ...issue, msg: `${issue.msg} Hidden combine source: ${unique.join(", ")}.` };
}

export function expandCombineParagraph(classString: string, document: CombineDocument): CombineParagraphExpansion {
  const combines = combineMap(document);
  const sourceTokens = tokensOf(classString);
  const visibleTokens: VisibleCombineToken[] = sourceTokens.map((token) => ({
    token,
    kind: combines.has(token) ? "combine" : "class",
  }));

  const expandedTokens: ExpandedCombineToken[] = [];
  for (const token of sourceTokens) {
    const combine = combines.get(token);
    if (!combine) {
      expandedTokens.push({ token, origin: { kind: "direct", sourceToken: token } });
      continue;
    }
    for (const hidden of combine.classes) {
      expandedTokens.push({ token: hidden, origin: { kind: "combine", combine: token, sourceToken: hidden } });
    }
  }

  const normalizedExpanded = orderParagraph(expandedTokens.map((token) => token.token).join(" "));
  const issues = lint(normalizedExpanded).map((issue) => annotateHiddenOrigins(issue, expandedTokens));
  return {
    source: classString,
    visibleTokens,
    expandedTokens,
    normalizedVisible: normalizeVisible(visibleTokens),
    normalizedExpanded,
    lint: issues,
  };
}

export function orderParagraphWithCombines(classString: string, document: CombineDocument): string {
  return expandCombineParagraph(classString, document).normalizedVisible;
}

function renderClassBlock(classes: string[]): string {
  return `[\n  ${classes.join(" ")}\n]`;
}

function renderLongCombine(combine: CombineDefinition): string {
  const lines = [`combine ${combine.name} {`];
  if (combine.intent) lines.push(`  intent: ${combine.intent}`);
  if (combine.scope !== "project") lines.push(`  scope: ${combine.scope}`);
  if (combine.evidence.length) {
    if (lines.length > 1) lines.push("");
    lines.push("  evidence: [");
    lines.push(...combine.evidence.map((item) => `    ${item}`));
    lines.push("  ]");
  }
  if (lines.length > 1) lines.push("");
  lines.push("  classes: [");
  lines.push(`    ${combine.classString}`);
  lines.push("  ]");
  lines.push("}");
  return lines.join("\n");
}

export function formatCombineDocument(document: CombineDocument): string {
  const rendered = document.combines.map((combine) => {
    const simple = !combine.intent && combine.scope === "project" && combine.evidence.length === 0;
    if (!simple) return renderLongCombine(combine);
    return `combine ${combine.name}: ${renderClassBlock(combine.classes)}`;
  });
  return `${rendered.join("\n\n")}\n`;
}

export function formatCombineSource(source: string, options: FormatCombineOptions = {}): string {
  return formatCombineDocument(parseAndNormalizeCombines(source, options));
}

export function buildCombineStylesheet(document: CombineDocument, options: BuildCombineStylesheetOptions = {}): string {
  const combines = combineMap(document);
  const requested = options.names === undefined ? document.combines.map((combine) => combine.name) : [...options.names];
  const unknown = requested.filter((name) => !combines.has(name));
  if (unknown.length) throw new Error(`unknown combine name${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}`);

  return requested.map((name) => {
    const combine = combines.get(name)!;
    return buildStylesheet([combine.classString], {}, {
      selectorForWord: () => classSelector(combine.name),
    }).trimEnd();
  }).filter(Boolean).join("\n\n") + (requested.length ? "\n" : "");
}
