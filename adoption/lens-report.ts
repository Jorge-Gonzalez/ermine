// lens-report.ts — adoption-facing index for the Ermine Adoption Lens.
//
// The strict ledgers keep declaration accounting. This report keeps the tooling
// interpretation: which declarations are word pressure, which are semantic
// fragments or boundaries, and which repeated paragraphs look like combine
// evidence.

import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { REASON_CODES, type CurrentRecord, type ReasonCode } from "./current-ledger.ts";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const INFRASTRUCTURE_CODES = new Set<ReasonCode>([
  "ermine-emitted",
  "substrate",
  "theme-metric",
  "config-departure",
]);

const LENS_CATEGORIES = [
  "ermine-infrastructure",
  "existing-ermine-word",
  "ermine-word-pressure",
  "semantic-fragment",
  "authored-content-default",
  "browser-adapter",
  "project-recipe",
  "local-identity",
  "project-owned-residue",
] as const;

type LensCategory = typeof LENS_CATEGORIES[number];

const CATEGORY_DESCRIPTIONS: Record<LensCategory, string> = {
  "ermine-infrastructure": "already adopted or framework infrastructure",
  "existing-ermine-word": "current CSS declaration can already be expressed by Ermine",
  "ermine-word-pressure": "latent word, facet, or scale pressure",
  "semantic-fragment": "CSS-bearing reusable object below component scale",
  "authored-content-default": "content editor/user-authored HTML defaults, outside utility authorship",
  "browser-adapter": "vendor or browser-divergent selector/property boundary",
  "project-recipe": "component or molecule contract, not a flat word",
  "local-identity": "project-local invariant after review",
  "project-owned-residue": "reviewed project CSS with no narrower lens category",
};

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
  shadowedWords?: unknown[];
}

interface ReviewedDeclarationInput {
  id: string;
  latentOutcome: "admitted" | "latent-word" | "latent-facet" | "latent-scale" | "recipe" | "local-identity";
  ruleAction: string;
  erminePressure: string;
  proposedForm?: string;
}

interface RuleActionReviewInput {
  version: 1;
  project: string;
  source: { ermineCommit: string; projectCommit: string };
  inputs: { currentLedger: string };
  summary: {
    reviewedDeclarations: number;
    latentGeneralizable: number;
    likelyRecipe: number;
    likelyLocal: number;
  };
  declarations: ReviewedDeclarationInput[];
}

interface ClasslistCorpusInput {
  schema: "ermine.classlist-corpus.v1";
  project: string;
  source: { ermineCommit: string; projectCommit: string };
  summary: {
    occurrenceCount: number;
    distinctErmineParagraphs: number;
    classlistsWithProjectTokens: number;
  };
  distinctErmineParagraphs: Array<{
    value: string;
    count: number;
    examples: string[];
  }>;
}

interface LensReportInput {
  ledger: CurrentLedgerInput;
  review: RuleActionReviewInput;
  classlistCorpus?: ClasslistCorpusInput;
  inputs: {
    currentLedger: string;
    ruleActionReview: string;
    classlistCorpus?: string;
  };
}

interface LensDeclaration {
  id: string;
  file: string;
  line: number;
  selector: string;
  property: string;
  value: string;
  currentCode: ReasonCode;
  category: LensCategory;
  reason: string;
}

interface RepeatedParagraph {
  value: string;
  count: number;
  examples: string[];
  tokenCount: number;
}

export interface AdoptionLensReport {
  version: 1;
  project: string;
  source: { ermineCommit: string; projectCommit: string };
  inputs: LensReportInput["inputs"];
  summary: {
    declarations: number;
    residueDeclarations: number;
    reviewedDeclarations: number;
    combineCandidateParagraphs: number;
    classlistsWithProjectTokens?: number;
    byCategory: Record<LensCategory, number>;
  };
  declarations: LensDeclaration[];
  repeatedParagraphs: RepeatedParagraph[];
}

function slash(path: string): string {
  return path.replaceAll("\\", "/");
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

function countCategories(): Record<LensCategory, number> {
  return Object.fromEntries(LENS_CATEGORIES.map((category) => [category, 0])) as Record<LensCategory, number>;
}

function isSemanticFragment(record: CurrentRecord): boolean {
  return /\.sf-[a-z0-9-]+\b/.test(record.selector);
}

function isBrowserAdapter(record: CurrentRecord): boolean {
  return record.code === "scrollbar-followup" || /::-webkit-/.test(record.selector);
}

function isAuthoredContentDefault(record: CurrentRecord): boolean {
  return record.code === "user-content" || /\.sf-authored-content\b|\.content-editor-body\b/.test(record.selector);
}

function reviewReason(review: ReviewedDeclarationInput | undefined): string {
  if (!review) return "no rule-action review row";
  return review.proposedForm ?? review.erminePressure;
}

function categoryFor(record: CurrentRecord, review: ReviewedDeclarationInput | undefined): LensCategory {
  if (INFRASTRUCTURE_CODES.has(record.code)) return "ermine-infrastructure";
  if (record.code === "assimilable") return "existing-ermine-word";
  if (isAuthoredContentDefault(record)) return "authored-content-default";
  if (isSemanticFragment(record)) return "semantic-fragment";
  if (isBrowserAdapter(record)) return "browser-adapter";
  if (review?.latentOutcome === "recipe" || record.code === "recipe-identity" || record.code === "component-contract") {
    return "project-recipe";
  }
  if (review?.latentOutcome === "local-identity") return "local-identity";
  if (review?.latentOutcome?.startsWith("latent-")) return "ermine-word-pressure";
  return "project-owned-residue";
}

function categoryReason(category: LensCategory, record: CurrentRecord, review: ReviewedDeclarationInput | undefined): string {
  if (category === "ermine-infrastructure") return record.code;
  if (category === "existing-ermine-word") return record.words?.join(" ") || "assimilable";
  if (category === "semantic-fragment") return "selector is owned by an sf-* semantic fragment";
  if (category === "authored-content-default") return "content editor defaults are inverse to utility styling";
  if (category === "browser-adapter") return "browser-specific selector or scrollbar adapter";
  return reviewReason(review);
}

function repeatedParagraphs(corpus: ClasslistCorpusInput | undefined): RepeatedParagraph[] {
  return (corpus?.distinctErmineParagraphs ?? [])
    .filter((paragraph) => paragraph.count > 1)
    .map((paragraph) => ({
      value: paragraph.value,
      count: paragraph.count,
      examples: paragraph.examples,
      tokenCount: paragraph.value.trim().split(/\s+/).filter(Boolean).length,
    }))
    .sort((left, right) =>
      right.count - left.count || right.tokenCount - left.tokenCount || left.value.localeCompare(right.value));
}

export function buildAdoptionLensReport(input: LensReportInput): AdoptionLensReport {
  const reviews = new Map(input.review.declarations.map((declaration) => [declaration.id, declaration]));
  const byCategory = countCategories();
  const declarations = input.ledger.records.map((record): LensDeclaration => {
    const review = reviews.get(record.id);
    const category = categoryFor(record, review);
    byCategory[category] += 1;
    return {
      id: record.id,
      file: record.file,
      line: record.line,
      selector: record.selector,
      property: record.property,
      value: record.value,
      currentCode: record.code,
      category,
      reason: categoryReason(category, record, review),
    };
  });
  const repeated = repeatedParagraphs(input.classlistCorpus);
  return {
    version: 1,
    project: input.ledger.project,
    source: input.ledger.source,
    inputs: input.inputs,
    summary: {
      declarations: input.ledger.summary.totalDeclarations,
      residueDeclarations: input.ledger.summary.residueDeclarations,
      reviewedDeclarations: input.review.summary.reviewedDeclarations,
      combineCandidateParagraphs: repeated.length,
      ...(input.classlistCorpus ? { classlistsWithProjectTokens: input.classlistCorpus.summary.classlistsWithProjectTokens } : {}),
      byCategory,
    },
    declarations,
    repeatedParagraphs: repeated,
  };
}

export function renderAdoptionLensMarkdown(report: AdoptionLensReport): string {
  const categoryRows = LENS_CATEGORIES
    .filter((category) => report.summary.byCategory[category] > 0)
    .map((category) => [
      category,
      String(report.summary.byCategory[category]),
      CATEGORY_DESCRIPTIONS[category],
    ]);
  const repeatedRows = report.repeatedParagraphs.slice(0, 12).map((paragraph) => [
    String(paragraph.count),
    String(paragraph.tokenCount),
    `\`${mdEscape(paragraph.value)}\``,
    paragraph.examples.join(", "),
  ]);
  const pressureRows = report.declarations
    .filter((declaration) =>
      declaration.category === "ermine-word-pressure"
      || declaration.category === "semantic-fragment"
      || declaration.category === "authored-content-default"
      || declaration.category === "browser-adapter")
    .slice(0, 30)
    .map((declaration) => [
      declaration.category,
      `${declaration.file}:${declaration.line}`,
      `\`${mdEscape(declaration.selector)}\``,
      declaration.property,
      `\`${mdEscape(declaration.value)}\``,
      mdEscape(declaration.reason),
    ]);

  return `# ${report.project} Adoption Lens

Generated from \`${report.inputs.currentLedger}\` and \`${report.inputs.ruleActionReview}\`${report.inputs.classlistCorpus ? ` with \`${report.inputs.classlistCorpus}\`` : ""}.

This report is an index for editor and adoption tooling. It does not change the strict
ledger counts. Semantic fragments, authored-content defaults, and browser adapters are
listed here as named non-residual categories: they are outside the flat Ermine word target
unless a later design explicitly promotes a new layer.

## Provenance

| source | commit |
|---|---|
| Ermine | \`${report.source.ermineCommit}\` |
| ${report.project} | \`${report.source.projectCommit}\` |

## Summary

${table(["metric", "count"], [
    ["declarations", String(report.summary.declarations)],
    ["residue declarations", String(report.summary.residueDeclarations)],
    ["reviewed declarations", String(report.summary.reviewedDeclarations)],
    ["combine candidate paragraphs", String(report.summary.combineCandidateParagraphs)],
    ["classlists with project tokens", String(report.summary.classlistsWithProjectTokens ?? 0)],
  ])}

## Lens Categories

${table(["category", "declarations", "meaning"], categoryRows)}

## Repeated Paragraph Evidence

These are not automatic combines. They are the repeated Ermine-only paragraph shapes the
Adoption Lens can show as combine evidence during review.

${repeatedRows.length
    ? table(["count", "words", "paragraph", "examples"], repeatedRows)
    : "_No repeated Ermine paragraphs available._"}

## Boundary And Word-Pressure Examples

${pressureRows.length
    ? table(["lens category", "source", "selector", "property", "value", "reason"], pressureRows)
    : "_No boundary or word-pressure examples._"}
`;
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

async function writeIfChanged(path: string, source: string, check: boolean): Promise<boolean> {
  const current = await readOptional(path);
  if (current === source) return true;
  if (check) return false;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, source);
  return true;
}

async function processProject(path: string, repositoryRoot: string, check: boolean): Promise<boolean> {
  const reportRoot = dirname(path);
  const project = reportRoot.split(/[\\/]/).at(-1) ?? "project";
  const reviewPath = resolve(reportRoot, "rule-action-review.json");
  const corpusPath = resolve(repositoryRoot, "test/fixtures", `${project}-classlist-corpus.json`);
  const outputPath = resolve(reportRoot, "ADOPTION-LENS.md");
  const ledger = JSON.parse(await readFile(path, "utf8")) as CurrentLedgerInput;
  const review = JSON.parse(await readFile(reviewPath, "utf8")) as RuleActionReviewInput;
  const corpusSource = await readOptional(corpusPath);
  const corpus = corpusSource ? JSON.parse(corpusSource) as ClasslistCorpusInput : undefined;
  const report = buildAdoptionLensReport({
    ledger,
    review,
    ...(corpus ? { classlistCorpus: corpus } : {}),
    inputs: {
      currentLedger: slash(relative(repositoryRoot, path)),
      ruleActionReview: slash(relative(repositoryRoot, reviewPath)),
      ...(corpus ? { classlistCorpus: slash(relative(repositoryRoot, corpusPath)) } : {}),
    },
  });
  const markdown = renderAdoptionLensMarkdown(report);
  const valid = await writeIfChanged(outputPath, markdown, check);
  if (valid) {
    console.log(`${check ? "current" : "wrote"} ${slash(relative(repositoryRoot, outputPath))} (${report.summary.combineCandidateParagraphs} combine candidates, ${report.summary.byCategory["ermine-word-pressure"]} word-pressure declarations)`);
  } else {
    console.log(`ERROR ${slash(relative(repositoryRoot, outputPath))}: adoption lens report is stale; run npm run adoption:lens`);
  }
  return valid;
}

export async function runAdoptionLensReports(repositoryRoot = REPOSITORY_ROOT, check = false): Promise<boolean> {
  const paths = await findCurrentLedgerPaths(repositoryRoot);
  let valid = true;
  for (const path of paths) valid = await processProject(path, repositoryRoot, check) && valid;
  return valid;
}

async function main(): Promise<void> {
  const check = process.argv.includes("--check");
  if (!await runAdoptionLensReports(REPOSITORY_ROOT, check)) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
