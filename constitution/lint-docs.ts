import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  ID_PATTERNS,
  NORMATIVE_ID_PATTERN,
  NORMATIVE_ID_SOURCE,
  RATIONALE_ID_PATTERN,
  type CodeReference,
  type Footer,
  type RegisterClass,
  parseFooter,
} from "./binding-ermine.ts";

interface RegisterFile {
  path: string;
  displayPath: string;
  register: RegisterClass;
  text: string;
}

interface NormativeNode {
  id: string;
  file: RegisterFile;
  line: number;
  footer?: Footer;
}

interface HistoryNode {
  id: string;
  file: RegisterFile;
  line: number;
  supersedes: string[];
}

const root = resolve(process.cwd());
const ignoredDirectories = new Set([".git", "node_modules", "dist", "coverage"]);
const errors: string[] = [];
const warnings: string[] = [];
const infos: string[] = [];

function report(code: string, message: string): void {
  errors.push(`${code} ${message}`);
}

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !ignoredDirectories.has(entry.name))
      .map(async (entry) => {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) return markdownFiles(path);
        return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
      }),
  );
  return nested.flat();
}

function declaredRegister(text: string): RegisterClass | undefined {
  const frontMatter = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(text)?.[1];
  const value = frontMatter && /^register:\s*(normative|rationale|history)\s*$/m.exec(frontMatter)?.[1];
  return value as RegisterClass | undefined;
}

async function discoverRegisters(): Promise<RegisterFile[]> {
  const discovered: RegisterFile[] = [];
  for (const path of await markdownFiles(root)) {
    const text = await readFile(path, "utf8");
    const register = declaredRegister(text);
    if (register) discovered.push({ path, displayPath: relative(root, path), register, text });
  }
  return discovered;
}

function headingLine(text: string, offset: number): number {
  return text.slice(0, offset).split("\n").length;
}

function parseNormative(files: RegisterFile[]): NormativeNode[] {
  const nodes: NormativeNode[] = [];
  for (const file of files.filter(({ register }) => register === "normative")) {
    const headings = [...file.text.matchAll(new RegExp(`^## (${NORMATIVE_ID_SOURCE})(?:\\s|$).*`, "gm"))];
    for (let index = 0; index < headings.length; index += 1) {
      const heading = headings[index];
      const start = heading.index ?? 0;
      const end = headings[index + 1]?.index ?? file.text.length;
      const body = file.text.slice(start, end);
      const footerLines = body.split("\n").filter((line) => line.startsWith("→"));
      let footer: Footer | undefined;
      if (footerLines.length !== 1) {
        report("DOC-E04", `${file.displayPath}:${headingLine(file.text, start)} ${heading[1]} has ${footerLines.length} footer lines`);
      } else {
        footer = parseFooter(footerLines[0]);
        if (!footer) report("DOC-E10", `${file.displayPath}:${headingLine(file.text, start)} ${heading[1]} has a malformed footer`);
      }
      nodes.push({ id: heading[1], file, line: headingLine(file.text, start), footer });
    }
  }
  return nodes;
}

function parseRationales(files: RegisterFile[]): Map<string, { file: RegisterFile; line: number }> {
  const rationales = new Map<string, { file: RegisterFile; line: number }>();
  for (const file of files.filter(({ register }) => register === "rationale")) {
    for (const match of file.text.matchAll(/^## (RAT:[A-Z0-9-]+)(?:\s|$).*/gm)) {
      const id = match[1];
      const line = headingLine(file.text, match.index ?? 0);
      if (!RATIONALE_ID_PATTERN.test(id)) report("DOC-E02", `${file.displayPath}:${line} invalid rationale ID ${id}`);
      if (rationales.has(id)) report("DOC-E01", `${id} is defined more than once`);
      rationales.set(id, { file, line });
    }
  }
  return rationales;
}

function parseHistory(files: RegisterFile[]): Map<string, HistoryNode> {
  const history = new Map<string, HistoryNode>();
  for (const file of files.filter(({ register }) => register === "history")) {
    const match = /^# (ADR-\d{4})(?:\s|$).*/m.exec(file.text);
    if (!match) {
      report("DOC-E02", `${file.displayPath} has no ADR heading`);
      continue;
    }
    const id = match[1];
    if (!ID_PATTERNS.history.test(id)) report("DOC-E02", `${file.displayPath} has invalid history ID ${id}`);
    if (history.has(id)) report("DOC-E01", `${id} is defined more than once`);
    const supersedes = /^supersedes:\s*(.+)$/m.exec(file.text)?.[1].split(/,\s*/) ?? [];
    history.set(id, { id, file, line: headingLine(file.text, match.index ?? 0), supersedes });
  }
  return history;
}

function checkDuplicateNormative(nodes: NormativeNode[]): void {
  const seen = new Map<string, NormativeNode>();
  for (const node of nodes) {
    const prior = seen.get(node.id);
    if (prior) report("DOC-E01", `${node.id} at ${prior.file.displayPath}:${prior.line} and ${node.file.displayPath}:${node.line}`);
    seen.set(node.id, node);
  }
}

function checkFooterReferences(
  nodes: NormativeNode[],
  rationales: Map<string, unknown>,
  history: Map<string, HistoryNode>,
): CodeReference[] {
  const codeReferences: CodeReference[] = [];
  const normativeIds = new Set(nodes.map(({ id }) => id));
  let unrecorded = 0;
  for (const node of nodes) {
    if (!node.footer) continue;
    if (!rationales.has(node.footer.rationale)) {
      report("DOC-E02", `${node.file.displayPath}:${node.line} ${node.id} references missing ${node.footer.rationale}`);
      report("DOC-E03", `${node.file.displayPath}:${node.line} ${node.id} has no rationale entry`);
    }
    if (node.footer.history === "unrecorded") {
      unrecorded += 1;
    } else {
      for (const id of node.footer.history) {
        if (!history.has(id)) report("DOC-E02", `${node.file.displayPath}:${node.line} ${node.id} references missing ${id}`);
      }
    }
    if (node.footer.defersTo && !normativeIds.has(node.footer.defersTo.id)) {
      report("DOC-E02", `${node.file.displayPath}:${node.line} ${node.id} defers to missing ${node.footer.defersTo.id}`);
    }
    codeReferences.push(...node.footer.code);
  }
  infos.push(`INFO unrecorded histories: ${unrecorded}`);
  return codeReferences;
}

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.isFile() && entry.name.endsWith(".ts") ? [path] : [];
  }));
  return nested.flat();
}

function exportedSymbol(text: string, symbol: string): boolean {
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bexport\\s+(?:(?:declare|default|async)\\s+)*(?:type|interface|const|let|var|function|class|enum)\\s+${escaped}\\b`).test(text) ||
    new RegExp(`\\bexport\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`).test(text);
}

async function checkCodeReferences(references: CodeReference[]): Promise<Map<string, string>> {
  const files = await sourceFiles(resolve(root, "src"));
  const contents = new Map<string, string>();
  for (const file of files) contents.set(relative(root, file), await readFile(file, "utf8"));
  const resolved = new Map<string, string>();
  for (const reference of references) {
    const actual = [...contents].find(([, text]) => exportedSymbol(text, reference.symbol))?.[0];
    if (!actual) {
      report("DOC-E05", `${reference.advisoryFile}#${reference.symbol} resolves to no exported symbol under src/`);
      continue;
    }
    resolved.set(reference.symbol, actual);
    if (actual !== reference.advisoryFile) {
      warnings.push(`WARN stale advisory path ${reference.advisoryFile}#${reference.symbol}; symbol is in ${actual}`);
    }
  }
  return resolved;
}

async function checkCodeCommentIds(normativeIds: Set<string>): Promise<void> {
  const tokenPattern = new RegExp(`\\b${NORMATIVE_ID_SOURCE}\\b`, "g");
  for (const file of await sourceFiles(resolve(root, "src"))) {
    const text = await readFile(file, "utf8");
    for (const [index, line] of text.split("\n").entries()) {
      const comment = line.indexOf("//");
      if (comment < 0) continue;
      for (const id of line.slice(comment).match(tokenPattern) ?? []) {
        if (!normativeIds.has(id)) report("DOC-E02", `${relative(root, file)}:${index + 1} code comment references missing ${id}`);
      }
    }
  }
}

function checkAdrReferences(history: Map<string, HistoryNode>, normativeIds: Set<string>): void {
  const idPattern = new RegExp(`\\b(?:${NORMATIVE_ID_SOURCE}|ADR-\\d{4})\\b`, "g");
  for (const node of history.values()) {
    for (const id of node.file.text.match(idPattern) ?? []) {
      if (NORMATIVE_ID_PATTERN.test(id) && !normativeIds.has(id)) {
        report("DOC-E02", `${node.file.displayPath} references missing ${id}`);
      } else if (ID_PATTERNS.history.test(id) && !history.has(id)) {
        report("DOC-E02", `${node.file.displayPath} references missing ${id}`);
      }
    }
    for (const id of node.supersedes) {
      if (!history.has(id)) report("DOC-E02", `${node.file.displayPath} supersedes missing ${id}`);
    }
  }
}

function checkSupersedesCycles(history: Map<string, HistoryNode>): void {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, path: string[]): void => {
    if (visiting.has(id)) {
      report("DOC-E06", `supersedes cycle: ${[...path, id].join(" -> ")}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of history.get(id)?.supersedes ?? []) visit(target, [...path, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of history.keys()) visit(id, []);
}

function gitTimestamp(args: string[]): number | undefined {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) return undefined;
  const value = Number(result.stdout.trim().split("\n")[0]);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function checkHistoryImmutability(history: Map<string, HistoryNode>): void {
  const gitAvailable = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root, encoding: "utf8" }).status === 0;
  if (!gitAvailable) {
    infos.push("INFO E07 skipped: git history unavailable");
    return;
  }
  let skipped = 0;
  for (const newer of history.values()) {
    for (const olderId of newer.supersedes) {
      const older = history.get(olderId);
      if (!older) continue;
      const newerCreated = gitTimestamp(["log", "--diff-filter=A", "--format=%ct", "--", newer.file.displayPath]);
      const olderLatest = gitTimestamp(["log", "-1", "--format=%ct", "--follow", "--", older.file.displayPath]);
      if (!newerCreated || !olderLatest) {
        skipped += 1;
      } else if (olderLatest > newerCreated) {
        report("DOC-E07", `${older.file.displayPath} changed after ${newer.id} superseded it`);
      }
    }
  }
  if (skipped) infos.push(`INFO E07 skipped for ${skipped} uncommitted or historyless edge(s)`);
}

async function main(): Promise<void> {
  const registers = await discoverRegisters();
  if (!registers.some(({ register }) => register === "normative")) report("DOC-E02", "no normative register discovered");
  if (!registers.some(({ register }) => register === "rationale")) report("DOC-E02", "no rationale register discovered");
  if (!registers.some(({ register }) => register === "history")) report("DOC-E02", "no history register discovered");

  const normative = parseNormative(registers);
  const rationales = parseRationales(registers);
  const history = parseHistory(registers);
  checkDuplicateNormative(normative);
  const codeReferences = checkFooterReferences(normative, rationales, history);
  await checkCodeReferences(codeReferences);
  const normativeIds = new Set(normative.map(({ id }) => id));
  await checkCodeCommentIds(normativeIds);
  checkAdrReferences(history, normativeIds);
  checkSupersedesCycles(history);
  checkHistoryImmutability(history);

  infos.unshift(`INFO discovered ${registers.length} register files: ${registers.map(({ displayPath }) => displayPath).sort().join(", ")}`);
  for (const line of infos) console.log(line);
  for (const line of warnings) console.warn(line);
  for (const line of errors) console.error(line);
  if (errors.length) process.exitCode = 1;
  else console.log(`docs:check passed (${normative.length} normative, ${rationales.size} rationale, ${history.size} history nodes)`);
}

await main();
