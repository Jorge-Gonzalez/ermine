import { opendir, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { orderParagraph } from "../src/format-paragraph.ts";
import { parseWord } from "../src/lint.ts";

export interface ClusterSource {
  file: string;
  content: string;
}

export interface ClassOccurrence {
  file: string;
  index: number;
  classString: string;
  ermineClassString: string;
  tokens: string[];
  ermineTokens: string[];
  axes: string[];
}

export interface CountedPattern {
  value: string;
  count: number;
  examples: string[];
}

export interface NearIdenticalParagraph {
  left: string;
  right: string;
  similarity: number;
  shared: string[];
  leftOnly: string[];
  rightOnly: string[];
  examples: string[];
}

export interface ClusterReport {
  sourceCount: number;
  occurrenceCount: number;
  paragraphCount: number;
  repeatedParagraphs: CountedPattern[];
  ngrams: CountedPattern[];
  axisConstellations: CountedPattern[];
  nearIdentical: NearIdenticalParagraph[];
  combineCandidates: CountedPattern[];
}

export interface MineClassClustersOptions {
  minTokens?: number;
  minCount?: number;
  ngramMin?: number;
  ngramMax?: number;
  limit?: number;
  nearThreshold?: number;
}

const DEFAULT_OPTIONS = {
  minTokens: 2,
  minCount: 2,
  ngramMin: 2,
  ngramMax: 6,
  limit: 20,
  nearThreshold: 0.72,
} as const;

const CLASS_ATTRIBUTE = /(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`$]*)`\s*\})/g;
const SOURCE_EXTENSIONS = new Set([
  ".astro",
  ".html",
  ".js",
  ".jsx",
  ".mdx",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
]);
const IGNORED_DIRS = new Set([".git", "__tests__", "coverage", "dist", "build", "node_modules", "test", "tests", ".next", ".vite"]);
const TEST_FILE = /\.(?:spec|test)\.[cm]?[jt]sx?$/;

function slash(path: string): string {
  return path.split(sep).join("/");
}

function extensionOf(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot < 0 ? "" : path.slice(dot);
}

function isSourceCandidate(path: string): boolean {
  return SOURCE_EXTENSIONS.has(extensionOf(path)) && !TEST_FILE.test(path);
}

function tokensOf(classString: string): string[] {
  return classString.trim().split(/\s+/).filter(Boolean);
}

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function addCount(map: Map<string, CountedPattern>, value: string, example: string): void {
  const current = map.get(value) ?? { value, count: 0, examples: [] };
  current.count += 1;
  if (!current.examples.includes(example) && current.examples.length < 5) current.examples.push(example);
  map.set(value, current);
}

function sortCounted(patterns: Iterable<CountedPattern>, limit: number, minCount: number): CountedPattern[] {
  return [...patterns]
    .filter((pattern) => pattern.count >= minCount)
    .sort((left, right) => right.count - left.count || right.value.split(/\s+/).length - left.value.split(/\s+/).length || left.value.localeCompare(right.value))
    .slice(0, limit);
}

function jaccard(left: string[], right: string[]): number {
  const a = new Set(left);
  const b = new Set(right);
  const shared = [...a].filter((value) => b.has(value)).length;
  const total = new Set([...a, ...b]).size;
  return total === 0 ? 1 : shared / total;
}

function classAttributes(content: string): string[] {
  return [...content.matchAll(CLASS_ATTRIBUTE)]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
    .filter((value) => value.trim().length > 0);
}

export function collectClassOccurrences(sources: readonly ClusterSource[]): ClassOccurrence[] {
  const occurrences: ClassOccurrence[] = [];
  for (const source of sources) {
    classAttributes(source.content).forEach((classString, index) => {
      const tokens = tokensOf(classString);
      const ermineTokens = tokens.filter((token) => parseWord(token).axis !== null);
      if (!ermineTokens.length) return;
      const ermineClassString = orderParagraph(ermineTokens.join(" "));
      const axes = uniqueInOrder(tokensOf(ermineClassString)
        .map((token) => parseWord(token).axis)
        .filter((axis): axis is string => axis !== null));
      occurrences.push({ file: source.file, index, classString, ermineClassString, tokens, ermineTokens: tokensOf(ermineClassString), axes });
    });
  }
  return occurrences;
}

function mineRepeatedParagraphs(occurrences: readonly ClassOccurrence[], options: Required<MineClassClustersOptions>): CountedPattern[] {
  const counts = new Map<string, CountedPattern>();
  for (const occurrence of occurrences) {
    if (occurrence.ermineTokens.length < options.minTokens) continue;
    addCount(counts, occurrence.ermineClassString, `${occurrence.file}#${occurrence.index + 1}`);
  }
  return sortCounted(counts.values(), options.limit, options.minCount);
}

function mineNgrams(occurrences: readonly ClassOccurrence[], options: Required<MineClassClustersOptions>): CountedPattern[] {
  const counts = new Map<string, CountedPattern>();
  for (const occurrence of occurrences) {
    const tokens = occurrence.ermineTokens;
    for (let size = options.ngramMin; size <= Math.min(options.ngramMax, tokens.length); size += 1) {
      for (let index = 0; index + size <= tokens.length; index += 1) {
        addCount(counts, tokens.slice(index, index + size).join(" "), `${occurrence.file}#${occurrence.index + 1}`);
      }
    }
  }
  return sortCounted(counts.values(), options.limit, options.minCount);
}

function mineAxisConstellations(occurrences: readonly ClassOccurrence[], options: Required<MineClassClustersOptions>): CountedPattern[] {
  const counts = new Map<string, CountedPattern>();
  for (const occurrence of occurrences) {
    if (occurrence.axes.length < options.minTokens) continue;
    addCount(counts, occurrence.axes.join(" > "), `${occurrence.file}#${occurrence.index + 1}`);
  }
  return sortCounted(counts.values(), options.limit, options.minCount);
}

function mineNearIdentical(occurrences: readonly ClassOccurrence[], options: Required<MineClassClustersOptions>): NearIdenticalParagraph[] {
  const byParagraph = new Map<string, ClassOccurrence>();
  for (const occurrence of occurrences) {
    if (occurrence.ermineTokens.length >= options.minTokens && !byParagraph.has(occurrence.ermineClassString)) {
      byParagraph.set(occurrence.ermineClassString, occurrence);
    }
  }
  const unique = [...byParagraph.values()];
  const near: NearIdenticalParagraph[] = [];
  for (let leftIndex = 0; leftIndex < unique.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < unique.length; rightIndex += 1) {
      const left = unique[leftIndex];
      const right = unique[rightIndex];
      const similarity = jaccard(left.ermineTokens, right.ermineTokens);
      if (similarity < options.nearThreshold || similarity === 1) continue;
      const rightSet = new Set(right.ermineTokens);
      const leftSet = new Set(left.ermineTokens);
      near.push({
        left: left.ermineClassString,
        right: right.ermineClassString,
        similarity,
        shared: left.ermineTokens.filter((token) => rightSet.has(token)),
        leftOnly: left.ermineTokens.filter((token) => !rightSet.has(token)),
        rightOnly: right.ermineTokens.filter((token) => !leftSet.has(token)),
        examples: [`${left.file}#${left.index + 1}`, `${right.file}#${right.index + 1}`],
      });
    }
  }
  return near
    .sort((left, right) => right.similarity - left.similarity || left.left.localeCompare(right.left))
    .slice(0, options.limit);
}

export function mineClassClusters(
  sources: readonly ClusterSource[],
  inputOptions: MineClassClustersOptions = {},
): ClusterReport {
  const options: Required<MineClassClustersOptions> = { ...DEFAULT_OPTIONS, ...inputOptions };
  const occurrences = collectClassOccurrences(sources);
  const repeatedParagraphs = mineRepeatedParagraphs(occurrences, options);
  const ngrams = mineNgrams(occurrences, options);
  return {
    sourceCount: sources.length,
    occurrenceCount: occurrences.length,
    paragraphCount: new Set(occurrences.map((occurrence) => occurrence.ermineClassString)).size,
    repeatedParagraphs,
    ngrams,
    axisConstellations: mineAxisConstellations(occurrences, options),
    nearIdentical: mineNearIdentical(occurrences, options),
    combineCandidates: repeatedParagraphs.length ? repeatedParagraphs : ngrams.filter((pattern) => pattern.value.split(/\s+/).length >= 3),
  };
}

async function collectSourceFiles(root: string, directory = root): Promise<string[]> {
  const entries = await opendir(directory);
  const files: string[] = [];
  for await (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) files.push(...await collectSourceFiles(root, resolve(directory, entry.name)));
    } else if (entry.isFile() && isSourceCandidate(entry.name)) {
      files.push(resolve(directory, entry.name));
    }
  }
  return files;
}

export async function loadProjectSources(project: string): Promise<ClusterSource[]> {
  const root = resolve(project);
  const files = await collectSourceFiles(root);
  return Promise.all(files.sort().map(async (file) => ({
    file: slash(relative(root, file)),
    content: await readFile(file, "utf8"),
  })));
}

function renderCounted(title: string, patterns: readonly CountedPattern[]): string[] {
  const lines = [`## ${title}`, ""];
  if (!patterns.length) return [...lines, "_No repeated patterns at the selected threshold._", ""];
  for (const pattern of patterns) {
    lines.push(`- ${pattern.count}x \`${pattern.value}\``);
    lines.push(`  examples: ${pattern.examples.join(", ")}`);
  }
  lines.push("");
  return lines;
}

function renderNear(near: readonly NearIdenticalParagraph[]): string[] {
  const lines = ["## Near-Identical Paragraphs", ""];
  if (!near.length) return [...lines, "_No near-identical paragraphs at the selected threshold._", ""];
  for (const item of near) {
    lines.push(`- ${(item.similarity * 100).toFixed(0)}% shared`);
    lines.push(`  left: \`${item.left}\``);
    lines.push(`  right: \`${item.right}\``);
    if (item.leftOnly.length) lines.push(`  left-only: \`${item.leftOnly.join(" ")}\``);
    if (item.rightOnly.length) lines.push(`  right-only: \`${item.rightOnly.join(" ")}\``);
    lines.push(`  examples: ${item.examples.join(", ")}`);
  }
  lines.push("");
  return lines;
}

export function renderClusterReport(report: ClusterReport, project = "project"): string {
  return [
    `# Ermine Class Cluster Report: ${project}`,
    "",
    `- sources scanned: ${report.sourceCount}`,
    `- class attributes with Ermine words: ${report.occurrenceCount}`,
    `- distinct Ermine paragraphs: ${report.paragraphCount}`,
    "",
    ...renderCounted("Combine Candidates", report.combineCandidates),
    ...renderCounted("Repeated Paragraphs", report.repeatedParagraphs),
    ...renderCounted("Common N-Grams", report.ngrams),
    ...renderCounted("Axis Constellations", report.axisConstellations),
    ...renderNear(report.nearIdentical),
  ].join("\n");
}

function numberArg(args: string[], name: string): number | undefined {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = Number(args[index + 1]);
  if (!Number.isFinite(value)) throw new Error(`${name}: expected a number`);
  return value;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const projectIndex = args.indexOf("--project");
  if (projectIndex < 0 || !args[projectIndex + 1]) {
    throw new Error("usage: clusters.ts --project <path> [--limit N] [--min-count N] [--json]");
  }
  const project = args[projectIndex + 1];
  const sources = await loadProjectSources(project);
  const report = mineClassClusters(sources, {
    limit: numberArg(args, "--limit") ?? DEFAULT_OPTIONS.limit,
    minCount: numberArg(args, "--min-count") ?? DEFAULT_OPTIONS.minCount,
  });
  if (args.includes("--json")) console.log(JSON.stringify(report, null, 2));
  else console.log(renderClusterReport(report, slash(project)));
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? "")).href) {
  main().catch((cause) => {
    console.error((cause as Error).message);
    process.exitCode = 1;
  });
}
