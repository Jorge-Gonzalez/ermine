import { opendir, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { orderParagraph } from "../src/format-paragraph.ts";
import { parseWord } from "../src/lint.ts";

export interface ClusterSource {
  file: string;
  content: string;
}

// Where a paragraph is spoken: the element, a sample of what it says, and the
// nearest classed ancestor. The naming review needs this to judge role, not
// just recipe.
export interface UsageContext {
  tag: string | null;
  content: string;
  parentClasses: string | null;
}

export interface ClassOccurrence {
  file: string;
  index: number;
  classString: string;
  ermineClassString: string;
  tokens: string[];
  ermineTokens: string[];
  axes: string[];
  context: UsageContext;
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

// The mechanics never promote. They gather evidence and counter-evidence; the
// naming review (the grammar admission test, one level up) decides. Dispositions
// therefore name what the corpus can actually know about a repeated paragraph.
export type PromotionDisposition =
  | "candidate"        // repeats across contexts; ready for the naming review
  | "stem"             // compositional core; stays spelled out, organizes families
  | "loose-bundle"     // internal pairs travel apart more than together; likely coincidence
  | "local-evidence"   // repeats in one file only; this corpus cannot show generality
  | "identity-shaped"; // too large or stateful; belongs to the component identity plane

export interface PromotionEvidence {
  fileCount: number;
  directoryCount: number;
  files: string[];
  directories: string[];
  // Median internal pair closure and share of near-closed pairs. Null below the
  // evidence floor: with very few occurrences rare pairs are trivially closed,
  // so closure would reward exactly the thinnest evidence.
  cohesion: number | null;
  closedPairShare: number | null;
  scopedWords: string[];
  roleBoundWords: string[];
  contextResidue: CountedPattern[];
}

export interface PromotionCandidate extends CountedPattern {
  tokenCount: number;
  axes: string[];
  disposition: PromotionDisposition;
  evidence: PromotionEvidence;
  usage: UsageContext[];
}

export interface FamilyMember {
  value: string;
  count: number;
  fileCount: number;
  disposition: PromotionDisposition;
  variantWords: string[];
}

// Families see through component boundaries: a paragraph written once inside a
// component is not a non-pattern — the component absorbed it. Idiom families
// (multi-word core recurring across files) are the primary promotion evidence;
// fluency families (one-word core, divergent members) are the grammar composing
// well and stay spelled out.
export interface PromotionFamily {
  core: string;
  coreAxes: string[];
  kind: "idiom" | "fluency";
  totalCount: number;
  fileCount: number;
  directoryCount: number;
  members: FamilyMember[];
  usage: UsageContext[];
}

export interface ClusterReport {
  sourceCount: number;
  occurrenceCount: number;
  paragraphCount: number;
  repeatedParagraphs: CountedPattern[];
  ngrams: CountedPattern[];
  axisConstellations: CountedPattern[];
  nearIdentical: NearIdenticalParagraph[];
  promotions: PromotionCandidate[];
  families: PromotionFamily[];
}

export interface MineClassClustersOptions {
  minTokens?: number;
  minCount?: number;
  ngramMin?: number;
  ngramMax?: number;
  limit?: number;
  nearThreshold?: number;
  familyThreshold?: number;
  cohesionMinCount?: number;
}

const DEFAULT_OPTIONS = {
  minTokens: 2,
  minCount: 2,
  ngramMin: 2,
  ngramMax: 6,
  limit: 20,
  nearThreshold: 0.72,
  familyThreshold: 0.5,
  cohesionMinCount: 4,
} as const;

const STEM_MAX_TOKENS = 3;
const STEM_MAX_AXES = 2;
const FLUENCY_MIN_CORE_WORDS = 2;
const IDIOM_MIN_CORE_WORDS = 3;
const IDENTITY_MIN_TOKENS = 12;
const IDENTITY_MIN_AXES = 10;
const IDENTITY_MIN_SCOPED = 4;
const LOOSE_COHESION = 0.35;

// Role-bound grammar words (popover/results/command/editor measures) are general
// within their UI role but bind any paragraph containing them to that role.
const ROLE_SEGMENT = /(^|-)(popover|results|command|editor)(-|$)/;

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

function keyOf(tokens: readonly string[]): string {
  return tokens.join("\u001f");
}

function patternValue(tokens: readonly string[]): string {
  return orderParagraph(tokens.join(" "));
}

function candidateAxes(tokens: readonly string[]): string[] {
  return uniqueInOrder(tokens
    .map((token) => parseWord(token).axis)
    .filter((axis): axis is string => axis !== null));
}

function jaccard(left: readonly string[], right: readonly string[]): number {
  const a = new Set(left);
  const b = new Set(right);
  const shared = [...a].filter((value) => b.has(value)).length;
  const total = new Set([...a, ...b]).size;
  return total === 0 ? 1 : shared / total;
}

function classAttributes(content: string): { value: string; index: number }[] {
  return [...content.matchAll(CLASS_ATTRIBUTE)]
    .map((match) => ({ value: match[1] ?? match[2] ?? match[3] ?? "", index: match.index ?? 0 }))
    .filter((attribute) => attribute.value.trim().length > 0);
}

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TAG_START = /<(\/?)([A-Za-z][A-Za-z0-9.-]*)/g;
const CONTENT_SAMPLE_MAX = 60;

interface ScannedElement {
  attrStart: number;
  attrEnd: number;
  tag: string;
  contentSample: string;
  parentClasses: string | null;
}

// Find the '>' that ends a tag, tolerating JSX expression attributes
// (onClick={() => …}) by tracking brace depth and quotes.
function tagEnd(content: string, from: number): { end: number; selfClosing: boolean } | null {
  let braces = 0;
  let quote: string | null = null;
  for (let index = from; index < content.length; index += 1) {
    const char = content[index];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") braces += 1;
    else if (char === "}") braces -= 1;
    else if (char === ">" && braces <= 0) return { end: index, selfClosing: content[index - 1] === "/" };
  }
  return null;
}

function contentSampleAfter(content: string, from: number): string {
  const stop = content.indexOf("<", from);
  return content
    .slice(from, stop < 0 ? content.length : stop)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CONTENT_SAMPLE_MAX);
}

// One tolerant pass over a source file: element tags, their class attribute,
// and the nearest classed ancestor via a tag stack. Non-markup angle brackets
// degrade to unclassed stack entries; the regular JSX/HTML case reads cleanly.
function scanElements(content: string): ScannedElement[] {
  const elements: ScannedElement[] = [];
  const stack: { tag: string; classes: string | null }[] = [];
  TAG_START.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TAG_START.exec(content))) {
    const scan = tagEnd(content, match.index + match[0].length);
    if (!scan) break;
    const tag = match[2];
    if (match[1] === "/") {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].tag === tag) {
          stack.length = index;
          break;
        }
      }
    } else {
      const attrs = content.slice(match.index, scan.end);
      const classes = classAttributes(attrs)[0]?.value ?? null;
      let parentClasses: string | null = null;
      for (let index = stack.length - 1; index >= 0 && !parentClasses; index -= 1) {
        parentClasses = stack[index].classes;
      }
      elements.push({
        attrStart: match.index,
        attrEnd: scan.end,
        tag,
        contentSample: scan.selfClosing ? "" : contentSampleAfter(content, scan.end + 1),
        parentClasses,
      });
      if (!scan.selfClosing && !VOID_TAGS.has(tag.toLowerCase())) stack.push({ tag, classes });
    }
    TAG_START.lastIndex = scan.end + 1;
  }
  return elements;
}

function contextAt(elements: readonly ScannedElement[], index: number): UsageContext {
  const element = elements.find((entry) => entry.attrStart <= index && index <= entry.attrEnd);
  return {
    tag: element?.tag ?? null,
    content: element?.contentSample ?? "",
    parentClasses: element?.parentClasses ?? null,
  };
}

export function collectClassOccurrences(sources: readonly ClusterSource[]): ClassOccurrence[] {
  const occurrences: ClassOccurrence[] = [];
  for (const source of sources) {
    const elements = scanElements(source.content);
    classAttributes(source.content).forEach((attribute, index) => {
      const tokens = tokensOf(attribute.value);
      const ermineTokens = tokens.filter((token) => parseWord(token).axis !== null);
      if (!ermineTokens.length) return;
      const ermineClassString = orderParagraph(ermineTokens.join(" "));
      const axes = uniqueInOrder(tokensOf(ermineClassString)
        .map((token) => parseWord(token).axis)
        .filter((axis): axis is string => axis !== null));
      occurrences.push({
        file: source.file,
        index,
        classString: attribute.value,
        ermineClassString,
        tokens,
        ermineTokens: tokensOf(ermineClassString),
        axes,
        context: contextAt(elements, attribute.index),
      });
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

// A scale-backed margin word places the element in its parent's layout — context,
// not identity. Relational auto-margin words (centered, flush-block, push) describe
// self-placement behavior and stay intrinsic.
function isContextWord(token: string): boolean {
  const parsed = parseWord(token);
  return parsed.axis === "margin" && parsed.value !== undefined;
}

interface ParagraphRecord {
  value: string;
  tokens: string[];
  count: number;
  examples: string[];
  usage: UsageContext[];
  files: Set<string>;
  directories: Set<string>;
  residue: Map<string, number>;
}

interface PairCount {
  count: number;
}

function directoryOf(file: string): string {
  const slashIndex = file.lastIndexOf("/");
  return slashIndex < 0 ? "." : file.slice(0, slashIndex);
}

function intrinsicSplit(tokens: readonly string[]): { intrinsic: string[]; residue: string[] } {
  const intrinsic: string[] = [];
  const residue: string[] = [];
  for (const token of tokens) (isContextWord(token) ? residue : intrinsic).push(token);
  return { intrinsic, residue };
}

function paragraphRecords(
  occurrences: readonly ClassOccurrence[],
  options: Required<MineClassClustersOptions>,
): ParagraphRecord[] {
  const records = new Map<string, ParagraphRecord>();
  for (const occurrence of occurrences) {
    const { intrinsic, residue } = intrinsicSplit(uniqueInOrder(occurrence.ermineTokens));
    if (intrinsic.length < options.minTokens) continue;
    const value = patternValue(intrinsic);
    const current = records.get(value) ?? {
      value,
      tokens: tokensOf(value),
      count: 0,
      examples: [],
      usage: [],
      files: new Set<string>(),
      directories: new Set<string>(),
      residue: new Map<string, number>(),
    };
    current.count += 1;
    current.files.add(occurrence.file);
    current.directories.add(directoryOf(occurrence.file));
    for (const token of residue) current.residue.set(token, (current.residue.get(token) ?? 0) + 1);
    if (current.examples.length < 5) {
      current.examples.push(`${occurrence.file}#${occurrence.index + 1}`);
      current.usage.push(occurrence.context);
    }
    records.set(value, current);
  }
  return [...records.values()];
}

function pairSupports(occurrences: readonly ClassOccurrence[], options: Required<MineClassClustersOptions>): Map<string, PairCount> {
  const supports = new Map<string, PairCount>();
  for (const occurrence of occurrences) {
    const { intrinsic } = intrinsicSplit(uniqueInOrder(occurrence.ermineTokens));
    if (intrinsic.length < options.minTokens) continue;
    for (let left = 0; left < intrinsic.length; left += 1) {
      for (let right = left + 1; right < intrinsic.length; right += 1) {
        const key = keyOf([intrinsic[left], intrinsic[right]].sort());
        const current = supports.get(key) ?? { count: 0 };
        current.count += 1;
        supports.set(key, current);
      }
    }
  }
  return supports;
}

function median(values: readonly number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

interface Cohesion {
  cohesion: number | null;
  closedPairShare: number | null;
}

function cohesionOf(
  record: ParagraphRecord,
  pairs: Map<string, PairCount>,
  options: Required<MineClassClustersOptions>,
): Cohesion {
  if (record.count < options.cohesionMinCount) return { cohesion: null, closedPairShare: null };
  const ratios: number[] = [];
  let closed = 0;
  let total = 0;
  for (let left = 0; left < record.tokens.length; left += 1) {
    for (let right = left + 1; right < record.tokens.length; right += 1) {
      const support = pairs.get(keyOf([record.tokens[left], record.tokens[right]].sort()))?.count ?? record.count;
      ratios.push(record.count / support);
      if (support <= record.count + 1) closed += 1;
      total += 1;
    }
  }
  return {
    cohesion: roundMetric(median(ratios)),
    closedPairShare: total === 0 ? null : roundMetric(closed / total),
  };
}

function dispositionOf(
  record: ParagraphRecord,
  axes: readonly string[],
  scopedWords: readonly string[],
  cohesion: Cohesion,
): PromotionDisposition {
  if (record.tokens.length <= STEM_MAX_TOKENS || axes.length <= STEM_MAX_AXES) return "stem";
  if (
    record.tokens.length >= IDENTITY_MIN_TOKENS ||
    axes.length >= IDENTITY_MIN_AXES ||
    scopedWords.length >= IDENTITY_MIN_SCOPED
  ) return "identity-shaped";
  if (record.files.size === 1) return "local-evidence";
  if (
    cohesion.cohesion !== null && cohesion.cohesion < LOOSE_COHESION &&
    cohesion.closedPairShare !== null && cohesion.closedPairShare < LOOSE_COHESION
  ) return "loose-bundle";
  return "candidate";
}

function dispositionRank(disposition: PromotionDisposition): number {
  switch (disposition) {
    case "candidate": return 0;
    case "stem": return 1;
    case "loose-bundle": return 2;
    case "local-evidence": return 3;
    case "identity-shaped": return 4;
  }
}

function residuePatterns(record: ParagraphRecord): CountedPattern[] {
  return [...record.residue.entries()]
    .map(([value, count]) => ({ value, count, examples: [] }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));
}

function minePromotions(
  occurrences: readonly ClassOccurrence[],
  options: Required<MineClassClustersOptions>,
): PromotionCandidate[] {
  const pairs = pairSupports(occurrences, options);
  return paragraphRecords(occurrences, options)
    .map((record): PromotionCandidate => {
      const axes = candidateAxes(record.tokens);
      const scopedWords = record.tokens.filter((token) => parseWord(token).scope !== "base");
      const roleBoundWords = record.tokens.filter((token) => ROLE_SEGMENT.test(token));
      const cohesion = cohesionOf(record, pairs, options);
      return {
        value: record.value,
        count: record.count,
        examples: record.examples,
        usage: record.usage,
        tokenCount: record.tokens.length,
        axes,
        disposition: dispositionOf(record, axes, scopedWords, cohesion),
        evidence: {
          fileCount: record.files.size,
          directoryCount: record.directories.size,
          files: [...record.files].sort(),
          directories: [...record.directories].sort(),
          cohesion: cohesion.cohesion,
          closedPairShare: cohesion.closedPairShare,
          scopedWords,
          roleBoundWords,
          contextResidue: residuePatterns(record),
        },
      };
    })
    // Generality first: spread across distinct contexts outranks raw repetition.
    .sort((left, right) =>
      dispositionRank(left.disposition) - dispositionRank(right.disposition) ||
      right.evidence.fileCount - left.evidence.fileCount ||
      right.evidence.directoryCount - left.evidence.directoryCount ||
      right.count - left.count ||
      right.tokenCount - left.tokenCount ||
      left.value.localeCompare(right.value));
}

function isSubsetOf(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  if (left.size > right.size) return false;
  return [...left].every((token) => right.has(token));
}

type FamilyNode = PromotionCandidate & { tokens: string[] };

// A family relation needs at least a two-word shared core; one-word edges chain
// unrelated paragraphs, while two-word edges can expose fluency families and
// three-word-plus cores become the stronger idiom evidence.
const FAMILY_MIN_SHARED = FLUENCY_MIN_CORE_WORDS;

function familyEdge(left: FamilyNode, right: FamilyNode, threshold: number): boolean {
  const leftSet = new Set(left.tokens);
  const rightSet = new Set(right.tokens);
  const shared = left.tokens.filter((token) => rightSet.has(token)).length;
  if (shared < FAMILY_MIN_SHARED) return false;
  return isSubsetOf(leftSet, rightSet) || isSubsetOf(rightSet, leftSet) || jaccard(left.tokens, right.tokens) >= threshold;
}

function uniqueUsage(usage: readonly UsageContext[], limit = 8): UsageContext[] {
  const seen = new Set<string>();
  const unique: UsageContext[] = [];
  for (const context of usage) {
    const key = JSON.stringify(context);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(context);
    if (unique.length >= limit) break;
  }
  return unique;
}

function mineFamilies(
  promotions: readonly PromotionCandidate[],
  options: Required<MineClassClustersOptions>,
): PromotionFamily[] {
  // Identity-shaped paragraphs are components; a variant relation to a component
  // is not vocabulary structure.
  const nodes: FamilyNode[] = promotions
    .filter((candidate) => candidate.disposition !== "identity-shaped")
    .map((candidate) => ({ ...candidate, tokens: tokensOf(candidate.value) }));
  const componentOf = new Map<FamilyNode, number>();
  let componentCount = 0;
  for (const node of nodes) {
    if (componentOf.has(node)) continue;
    const component = componentCount++;
    const queue = [node];
    componentOf.set(node, component);
    while (queue.length) {
      const current = queue.pop()!;
      for (const other of nodes) {
        if (componentOf.has(other)) continue;
        if (familyEdge(current, other, options.familyThreshold)) {
          componentOf.set(other, component);
          queue.push(other);
        }
      }
    }
  }
  const grouped = new Map<number, FamilyNode[]>();
  for (const [node, component] of componentOf) {
    grouped.set(component, [...grouped.get(component) ?? [], node]);
  }
  return [...grouped.values()]
    .filter((members) => members.length >= 2)
    .map((members): PromotionFamily => {
      const core = members
        .map((member) => new Set(member.tokens))
        .reduce((shared, set) => shared.filter((token) => set.has(token)), [...members[0].tokens]);
      const coreValue = core.length ? patternValue(core) : "";
      const files = new Set(members.flatMap((member) => member.evidence.files));
      const directories = new Set(members.flatMap((member) => member.evidence.directories));
      const usage = uniqueUsage(members.flatMap((member) => member.usage));
      const kind: PromotionFamily["kind"] =
        core.length >= IDIOM_MIN_CORE_WORDS && files.size >= 2 ? "idiom" : "fluency";
      return {
        core: coreValue,
        coreAxes: candidateAxes(core),
        kind,
        totalCount: members.reduce((total, member) => total + member.count, 0),
        fileCount: files.size,
        directoryCount: directories.size,
        usage,
        members: members
          .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
          .map((member) => ({
            value: member.value,
            count: member.count,
            fileCount: member.evidence.fileCount,
            disposition: member.disposition,
            variantWords: member.tokens.filter((token) => !core.includes(token)),
          })),
      };
    })
    .sort((left, right) =>
      right.totalCount - left.totalCount ||
      right.fileCount - left.fileCount ||
      right.core.split(/\s+/).length - left.core.split(/\s+/).length ||
      left.core.localeCompare(right.core))
    .slice(0, options.limit);
}

// A plain spread would let explicitly-undefined keys clobber the defaults.
function withDefaults(input: MineClassClustersOptions): Required<MineClassClustersOptions> {
  const options: Required<MineClassClustersOptions> = { ...DEFAULT_OPTIONS };
  for (const key of Object.keys(input) as (keyof MineClassClustersOptions)[]) {
    const value = input[key];
    if (value !== undefined) options[key] = value;
  }
  return options;
}

export function mineClassClusters(
  sources: readonly ClusterSource[],
  inputOptions: MineClassClustersOptions = {},
): ClusterReport {
  const options = withDefaults(inputOptions);
  const occurrences = collectClassOccurrences(sources);
  const promotions = minePromotions(occurrences, options);
  return {
    sourceCount: sources.length,
    occurrenceCount: occurrences.length,
    paragraphCount: new Set(occurrences.map((occurrence) => occurrence.ermineClassString)).size,
    repeatedParagraphs: mineRepeatedParagraphs(occurrences, options),
    ngrams: mineNgrams(occurrences, options),
    axisConstellations: mineAxisConstellations(occurrences, options),
    nearIdentical: mineNearIdentical(occurrences, options),
    promotions: promotions.slice(0, options.limit),
    families: mineFamilies(promotions, options),
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

export function formatUsage(usage: readonly UsageContext[], limit = 3): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const context of usage) {
    if (!context.tag) continue;
    const parent = context.parentClasses ? ` in \`${context.parentClasses.slice(0, 60)}\`` : "";
    const content = context.content ? ` "${context.content}"` : "";
    const line = `<${context.tag}>${content}${parent}`;
    if (seen.has(line)) continue;
    seen.add(line);
    lines.push(line);
    if (lines.length >= limit) break;
  }
  return lines;
}

const NAMING_REVIEW_CONTRACT = [
  "A candidate earns a name only through the naming review — the admission test, one level up:",
  "",
  "1. **Surplus meaning** — the name must say more than the words already say; never merely shorter.",
  "2. **Role noun** — nameable as one general role noun, optionally with a variant modifier.",
  "3. **Project-agnostic** — the name would mean the same thing in a different product.",
];

function renderPromotions(candidates: readonly PromotionCandidate[]): string[] {
  const lines = ["## Promotion Review", "", ...NAMING_REVIEW_CONTRACT, ""];
  if (!candidates.length) return [...lines, "_No repeated paragraphs available for promotion review._", ""];
  for (const candidate of candidates) {
    const { evidence } = candidate;
    lines.push(`- ${candidate.disposition}: ${candidate.count}x, ${candidate.tokenCount} words, ${evidence.fileCount} files, ${evidence.directoryCount} directories`);
    lines.push(`  candidate: \`${candidate.value}\``);
    lines.push(`  axes: ${candidate.axes.join(", ")}`);
    lines.push(evidence.cohesion === null
      ? `  cohesion: below evidence floor (${candidate.count}x)`
      : `  cohesion: ${evidence.cohesion} median closure, ${((evidence.closedPairShare ?? 0) * 100).toFixed(0)}% closed pairs`);
    if (evidence.scopedWords.length) lines.push(`  scoped: \`${evidence.scopedWords.join(" ")}\``);
    if (evidence.roleBoundWords.length) lines.push(`  role-bound: \`${evidence.roleBoundWords.join(" ")}\``);
    if (evidence.contextResidue.length) {
      lines.push(`  context residue: ${evidence.contextResidue.map((item) => `${item.count}x \`${item.value}\``).join(", ")}`);
    }
    for (const usage of formatUsage(candidate.usage)) lines.push(`  usage: ${usage}`);
    lines.push(`  examples: ${candidate.examples.join(", ")}`);
  }
  lines.push("");
  return lines;
}

function renderFamilies(families: readonly PromotionFamily[]): string[] {
  const lines = ["## Combine Families", ""];
  if (!families.length) return [...lines, "_No overlapping candidates at the selected threshold._", ""];
  for (const family of families) {
    lines.push(`- ${family.kind} family: ${family.totalCount}x, ${family.fileCount} files, ${family.directoryCount} directories`);
    lines.push(`  core: \`${family.core || "(none)"}\``);
    if (family.coreAxes.length) lines.push(`  core axes: ${family.coreAxes.join(", ")}`);
    for (const usage of formatUsage(family.usage)) lines.push(`  usage: ${usage}`);
    for (const member of family.members) {
      const variants = member.variantWords.length ? ` + \`${member.variantWords.join(" ")}\`` : "";
      lines.push(`  - ${member.count}x, ${member.fileCount} files, ${member.disposition} \`${member.value}\`${variants}`);
    }
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
    ...renderPromotions(report.promotions),
    ...renderFamilies(report.families),
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
    throw new Error("usage: clusters.ts --project <path> [--limit N] [--min-count N] [--family-threshold N] [--json]");
  }
  const project = args[projectIndex + 1];
  const sources = await loadProjectSources(project);
  const report = mineClassClusters(sources, {
    limit: numberArg(args, "--limit") ?? DEFAULT_OPTIONS.limit,
    minCount: numberArg(args, "--min-count") ?? DEFAULT_OPTIONS.minCount,
    familyThreshold: numberArg(args, "--family-threshold") ?? DEFAULT_OPTIONS.familyThreshold,
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
