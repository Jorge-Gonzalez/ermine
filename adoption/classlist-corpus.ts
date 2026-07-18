import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { orderParagraph } from "../src/format-paragraph.ts";
import { parseWord } from "../src/lint.ts";
import { loadProjectSources, type ClusterSource } from "./clusters.ts";

const execFileAsync = promisify(execFile);
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLASS_ATTRIBUTE = /(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`$]*)`\s*\})/g;

interface ClasslistOccurrence {
  id: string;
  file: string;
  index: number;
  classString: string;
  orderedClassString: string;
  tokens: string[];
  ermineTokens: string[];
  projectTokens: string[];
  ermineParagraph: string;
  axes: string[];
}

interface CountedParagraph {
  value: string;
  count: number;
  examples: string[];
}

interface ClasslistCorpus {
  schema: "ermine.classlist-corpus.v1";
  project: string;
  source: {
    ermineCommit: string;
    projectCommit: string;
  };
  summary: {
    sourceCount: number;
    occurrenceCount: number;
    distinctClasslists: number;
    distinctErmineParagraphs: number;
    classlistsWithProjectTokens: number;
  };
  occurrences: ClasslistOccurrence[];
  distinctErmineParagraphs: CountedParagraph[];
}

interface CliOptions {
  project: string;
  name: string;
  write: boolean;
  check: boolean;
}

function slash(path: string): string {
  return path.replaceAll("\\", "/");
}

function mdEscape(text: string): string {
  return text.replaceAll("|", "\\|");
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

function classAttributes(content: string): string[] {
  return [...content.matchAll(CLASS_ATTRIBUTE)]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
    .filter((value) => value.trim().length > 0);
}

async function gitCommit(root: string): Promise<string> {
  try {
    const result = await execFileAsync("git", ["-C", root, "rev-parse", "--short", "HEAD"]);
    return result.stdout.trim();
  } catch {
    return "unknown";
  }
}

function collectOccurrences(sources: readonly ClusterSource[]): ClasslistOccurrence[] {
  const occurrences: ClasslistOccurrence[] = [];
  let id = 1;
  for (const source of sources) {
    classAttributes(source.content).forEach((classString, index) => {
      const tokens = tokensOf(classString);
      const ermineTokens = tokens.filter((token) => parseWord(token).axis !== null);
      const projectTokens = tokens.filter((token) => parseWord(token).axis === null);
      const ermineParagraph = ermineTokens.length ? orderParagraph(ermineTokens.join(" ")) : "";
      const axes = uniqueInOrder(tokensOf(ermineParagraph)
        .map((token) => parseWord(token).axis)
        .filter((axis): axis is string => axis !== null));
      occurrences.push({
        id: String(id).padStart(4, "0"),
        file: source.file,
        index: index + 1,
        classString,
        orderedClassString: orderParagraph(classString),
        tokens,
        ermineTokens: tokensOf(ermineParagraph),
        projectTokens,
        ermineParagraph,
        axes,
      });
      id += 1;
    });
  }
  return occurrences;
}

function addParagraphCount(map: Map<string, CountedParagraph>, occurrence: ClasslistOccurrence): void {
  if (!occurrence.ermineParagraph) return;
  const current = map.get(occurrence.ermineParagraph) ?? { value: occurrence.ermineParagraph, count: 0, examples: [] };
  current.count += 1;
  const example = `${occurrence.file}#${occurrence.index}`;
  if (!current.examples.includes(example) && current.examples.length < 5) current.examples.push(example);
  map.set(occurrence.ermineParagraph, current);
}

function countedParagraphs(occurrences: readonly ClasslistOccurrence[]): CountedParagraph[] {
  const counts = new Map<string, CountedParagraph>();
  for (const occurrence of occurrences) addParagraphCount(counts, occurrence);
  return [...counts.values()]
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value));
}

async function buildCorpus(project: string, name: string): Promise<ClasslistCorpus> {
  const projectRoot = resolve(project);
  const sources = await loadProjectSources(projectRoot);
  const occurrences = collectOccurrences(sources);
  const distinctErmineParagraphs = countedParagraphs(occurrences);
  return {
    schema: "ermine.classlist-corpus.v1",
    project: name,
    source: {
      ermineCommit: await gitCommit(REPOSITORY_ROOT),
      projectCommit: await gitCommit(projectRoot),
    },
    summary: {
      sourceCount: sources.length,
      occurrenceCount: occurrences.length,
      distinctClasslists: new Set(occurrences.map((occurrence) => occurrence.classString)).size,
      distinctErmineParagraphs: distinctErmineParagraphs.length,
      classlistsWithProjectTokens: occurrences.filter((occurrence) => occurrence.projectTokens.length > 0).length,
    },
    occurrences,
    distinctErmineParagraphs,
  };
}

function renderMarkdown(corpus: ClasslistCorpus): string {
  const rows = corpus.occurrences.map((occurrence) =>
    `| ${occurrence.id} | ${occurrence.file}#${occurrence.index} | \`${mdEscape(occurrence.classString)}\` | \`${mdEscape(occurrence.ermineParagraph || "(none)")}\` | \`${mdEscape(occurrence.projectTokens.join(" ") || "(none)")}\` |`);
  const paragraphRows = corpus.distinctErmineParagraphs.map((paragraph) =>
    `| ${paragraph.count} | \`${mdEscape(paragraph.value)}\` | ${paragraph.examples.join(", ")} |`);
  return `# ${corpus.project} Classlist Corpus

Generated from the current ${corpus.project} source tree. This file is intentionally a corpus,
not an adoption judgment: it preserves literal authored classlists and their normalized Ermine
paragraphs so tests and adoption-lens experiments can share the same bench.

Regenerate with:

\`\`\`sh
node --import tsx adoption/classlist-corpus.ts --project ../${corpus.project} --name ${corpus.project} --write
\`\`\`

## Provenance

| source | commit |
|---|---|
| Ermine | \`${corpus.source.ermineCommit}\` |
| ${corpus.project} | \`${corpus.source.projectCommit}\` |

## Summary

- Source files scanned: ${corpus.summary.sourceCount}
- Literal classlists: ${corpus.summary.occurrenceCount}
- Distinct literal classlists: ${corpus.summary.distinctClasslists}
- Distinct Ermine paragraphs: ${corpus.summary.distinctErmineParagraphs}
- Classlists with project tokens: ${corpus.summary.classlistsWithProjectTokens}

## Literal Classlists

| id | source | literal classlist | normalized Ermine paragraph | project tokens |
|---:|---|---|---|---|
${rows.join("\n")}

## Distinct Ermine Paragraphs

| count | normalized Ermine paragraph | examples |
|---:|---|---|
${paragraphRows.join("\n")}
`;
}

async function writeOrCheck(path: string, content: string, check: boolean): Promise<void> {
  if (check) {
    const current = await readFile(path, "utf8").catch(() => "");
    if (current !== content) throw new Error(`${slash(relative(REPOSITORY_ROOT, path))} is stale; run with --write`);
    console.log(`current ${slash(relative(REPOSITORY_ROOT, path))}`);
    return;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
  console.log(`wrote ${slash(relative(REPOSITORY_ROOT, path))}`);
}

function parseCli(args: string[]): CliOptions {
  const projectIndex = args.indexOf("--project");
  const nameIndex = args.indexOf("--name");
  const project = projectIndex >= 0 ? args[projectIndex + 1] : undefined;
  const name = nameIndex >= 0 ? args[nameIndex + 1] : undefined;
  const write = args.includes("--write");
  const check = args.includes("--check");
  if (!project || !name || write === check || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error("usage: classlist-corpus.ts --project <path> --name <slug> (--write|--check)");
  }
  return { project, name, write, check };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const corpus = await buildCorpus(options.project, options.name);
  const reportRoot = resolve(REPOSITORY_ROOT, "reports/adoption", options.name);
  const fixtureRoot = resolve(REPOSITORY_ROOT, "test/fixtures");
  const json = `${JSON.stringify(corpus, null, 2)}\n`;
  await writeOrCheck(resolve(reportRoot, "CLASSLIST-CORPUS.md"), renderMarkdown(corpus), options.check);
  await writeOrCheck(resolve(fixtureRoot, `${options.name}-classlist-corpus.json`), json, options.check);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
