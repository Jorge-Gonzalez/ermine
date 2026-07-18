import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { parseAndNormalizeCombines } from "../src/combines.ts";
import { parseWord } from "../src/lint.ts";
import {
  formatUsage,
  loadProjectSources,
  mineClassClusters,
  type ClusterSource,
  type MineClassClustersOptions,
  type PromotionCandidate,
  type PromotionFamily,
} from "./clusters.ts";

export type AdmissionVerdictKind = "admit" | "hold-as-stem" | "role-bound-hold" | "identity";

export interface AdmissionVerdict {
  paragraph: string;
  verdict: AdmissionVerdictKind;
  name?: string;
  intent?: string;
  justification: string;
}

export interface AdmissionExpansion {
  name: string;
  words: string[];
}

export interface AdmissionDocument {
  version: 1;
  verdicts: AdmissionVerdict[];
  expansions?: AdmissionExpansion[];
}

export interface BackTranslation {
  name: string;
  recovered: string[];
  missed: string[];
  extra: string[];
  score: number;
}

export interface AdmissionTarget {
  kind: "paragraph" | "family-core";
  value: string;
  count: number;
  fileCount: number;
  directoryCount: number;
  usage: PromotionCandidate["usage"];
  disposition: PromotionCandidate["disposition"] | PromotionFamily["kind"];
  examples: string[];
}

export interface ReviewedVerdict {
  verdict: AdmissionVerdict;
  candidate: PromotionCandidate | null;
  target: AdmissionTarget | null;
  backTranslation: BackTranslation | null;
}

export interface AdmissionReview {
  project: string;
  budget: number;
  errors: string[];
  warnings: string[];
  verdicts: ReviewedVerdict[];
}

export interface AdmissionIntakeOptions extends MineClassClustersOptions {
  budget?: number;
  combinesSource?: string;
}

const DEFAULT_BUDGET = 3;
const VERDICT_KINDS = new Set<string>(["admit", "hold-as-stem", "role-bound-hold", "identity"]);
const NAME_SHAPE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const OPAQUE_THRESHOLD = 0.5;

export function parseAdmissionDocument(source: string): AdmissionDocument {
  const parsed = JSON.parse(source) as AdmissionDocument;
  if (parsed.version !== 1) throw new Error(`verdicts document: expected version 1, got ${String(parsed.version)}`);
  if (!Array.isArray(parsed.verdicts)) throw new Error("verdicts document: `verdicts` must be an array");
  if (parsed.expansions !== undefined && !Array.isArray(parsed.expansions)) {
    throw new Error("verdicts document: `expansions` must be an array when present");
  }
  return parsed;
}

function tokensOf(paragraph: string): string[] {
  return paragraph.trim().split(/\s+/).filter(Boolean);
}

export function scoreBackTranslation(paragraph: string, expansionWords: readonly string[]): Omit<BackTranslation, "name"> {
  const paragraphTokens = tokensOf(paragraph);
  const guessed = new Set(expansionWords);
  const paragraphSet = new Set(paragraphTokens);
  const recovered = paragraphTokens.filter((token) => guessed.has(token));
  return {
    recovered,
    missed: paragraphTokens.filter((token) => !guessed.has(token)),
    extra: [...guessed].filter((word) => !paragraphSet.has(word)),
    score: paragraphTokens.length === 0 ? 0 : Math.round((recovered.length / paragraphTokens.length) * 100) / 100,
  };
}

// The mechanical half of the naming gate: shape, reserved prefix, collision with
// grammar words (anything parseWord recognizes) and with existing combines.
function nameErrors(name: string, existingCombineNames: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  if (!NAME_SHAPE.test(name)) errors.push(`name \`${name}\`: not kebab-case`);
  if (name.startsWith("sf-")) errors.push(`name \`${name}\`: the sf- prefix is reserved for semantic fragments`);
  if (parseWord(name).axis !== null) errors.push(`name \`${name}\`: collides with an existing grammar word`);
  if (existingCombineNames.has(name)) errors.push(`name \`${name}\`: collides with an existing combine`);
  return errors;
}

function targetFromCandidate(candidate: PromotionCandidate): AdmissionTarget {
  return {
    kind: "paragraph",
    value: candidate.value,
    count: candidate.count,
    fileCount: candidate.evidence.fileCount,
    directoryCount: candidate.evidence.directoryCount,
    usage: candidate.usage,
    disposition: candidate.disposition,
    examples: candidate.examples,
  };
}

function targetFromFamily(family: PromotionFamily): AdmissionTarget {
  return {
    kind: "family-core",
    value: family.core,
    count: family.totalCount,
    fileCount: family.fileCount,
    directoryCount: family.directoryCount,
    usage: family.usage,
    disposition: family.kind,
    examples: family.members.flatMap((member) => member.value).slice(0, 5),
  };
}

export function buildAdmissionReview(
  document: AdmissionDocument,
  candidates: readonly PromotionCandidate[],
  project: string,
  options: AdmissionIntakeOptions = {},
  families: readonly PromotionFamily[] = [],
): AdmissionReview {
  const budget = options.budget ?? DEFAULT_BUDGET;
  const errors: string[] = [];
  const warnings: string[] = [];
  const byValue = new Map(candidates.map((candidate) => [candidate.value, candidate]));
  const targets = [
    ...candidates.map(targetFromCandidate),
    ...families.filter((family) => family.core.length > 0).map(targetFromFamily),
  ];
  const targetByValue = new Map(targets.map((target) => [target.value, target]));
  const existingCombineNames = new Set(
    options.combinesSource ? parseAndNormalizeCombines(options.combinesSource).combines.map((combine) => combine.name) : [],
  );
  const expansions = new Map((document.expansions ?? []).map((expansion) => [expansion.name, expansion.words]));
  const admittedNames = new Set<string>();

  const verdicts = document.verdicts.map((verdict): ReviewedVerdict => {
    const candidate = byValue.get(verdict.paragraph) ?? null;
    const target = targetByValue.get(verdict.paragraph) ?? null;
    if (!VERDICT_KINDS.has(verdict.verdict)) {
      errors.push(`\`${verdict.paragraph}\`: unknown verdict \`${verdict.verdict}\``);
    }
    if (!target) {
      errors.push(`\`${verdict.paragraph}\`: not among the mined paragraphs or family cores for this project`);
    } else if (target.kind === "paragraph" && candidate?.disposition !== "candidate") {
      warnings.push(`\`${verdict.paragraph}\`: mechanics hold this as ${candidate?.disposition}, not a review candidate`);
    } else if (target.kind === "family-core" && target.disposition === "fluency") {
      warnings.push(`\`${verdict.paragraph}\`: family is fluency evidence; admit only with unusually strong surplus meaning`);
    }
    if (!verdict.justification?.trim()) {
      errors.push(`\`${verdict.paragraph}\`: missing justification`);
    }

    let backTranslation: BackTranslation | null = null;
    if (verdict.verdict === "admit") {
      if (!verdict.name?.trim()) {
        errors.push(`\`${verdict.paragraph}\`: admit verdict without a name`);
      } else {
        const name = verdict.name.trim();
        if (admittedNames.has(name)) errors.push(`name \`${name}\`: admitted twice`);
        admittedNames.add(name);
        errors.push(...nameErrors(name, existingCombineNames));
        if (!verdict.intent?.trim()) errors.push(`\`${name}\`: admit verdict without an intent sentence`);
        const words = expansions.get(name);
        if (words) backTranslation = { name, ...scoreBackTranslation(verdict.paragraph, words) };
        else warnings.push(`\`${name}\`: no back-translation expansion provided`);
        if (backTranslation && backTranslation.score < OPAQUE_THRESHOLD) {
          warnings.push(`\`${name}\`: back-translation recovered only ${(backTranslation.score * 100).toFixed(0)}% of the paragraph — opaque or project-bound name`);
        }
      }
    }
    return { verdict, candidate, target, backTranslation };
  });

  if (admittedNames.size > budget) {
    errors.push(`${admittedNames.size} admissions exceed the budget of ${budget}`);
  }
  for (const name of expansions.keys()) {
    if (!admittedNames.has(name)) warnings.push(`expansion for \`${name}\` matches no admitted name`);
  }

  const reviewed = new Set(document.verdicts.map((verdict) => verdict.paragraph));
  for (const target of targets) {
    if (
      ((target.kind === "family-core" && target.disposition === "idiom") || target.disposition === "candidate") &&
      !reviewed.has(target.value)
    ) {
      warnings.push(`${target.kind} \`${target.value}\` received no verdict`);
    }
  }

  return { project, budget, errors, warnings, verdicts };
}

const VERDICT_ORDER: Record<AdmissionVerdictKind, number> = {
  "admit": 0,
  "role-bound-hold": 1,
  "hold-as-stem": 2,
  "identity": 3,
};

function renderVerdict({ verdict, target, backTranslation }: ReviewedVerdict): string[] {
  const title = verdict.verdict === "admit" && verdict.name
    ? `- **admit \`${verdict.name}\`** — ${target ? `${target.kind}, ${target.count}x, ${target.fileCount} files, ${target.directoryCount} directories` : "unmatched paragraph"}`
    : `- ${verdict.verdict}${target ? ` — ${target.kind}, ${target.count}x` : ""}`;
  const lines = [title, `  paragraph: \`${verdict.paragraph}\``];
  if (verdict.intent) lines.push(`  intent: ${verdict.intent}`);
  lines.push(`  justification: ${verdict.justification}`);
  if (target) for (const usage of formatUsage(target.usage)) lines.push(`  usage: ${usage}`);
  if (backTranslation) {
    const total = backTranslation.recovered.length + backTranslation.missed.length;
    lines.push(`  back-translation: ${backTranslation.recovered.length}/${total} words recovered (${backTranslation.score})`);
    if (backTranslation.missed.length) lines.push(`    missed: \`${backTranslation.missed.join(" ")}\``);
    if (backTranslation.extra.length) lines.push(`    extra: \`${backTranslation.extra.join(" ")}\``);
  }
  return lines;
}

function renderDraftAdr(review: AdmissionReview): string[] {
  const admissions = review.verdicts.filter((item) => item.verdict.verdict === "admit" && item.verdict.name);
  if (!admissions.length) return ["## Draft ADR", "", "_No admissions this pass — nothing to ratify._", ""];
  const names = admissions.map((item) => item.verdict.name!).join(", ");
  const lines = [
    "## Draft ADR",
    "",
    `Ratify by committing as \`constitution/decisions/ADR-00NN-admit-combines.md\`:`,
    "",
    "```markdown",
    "---",
    "register: history",
    "---",
    "",
    `# ADR-00NN — Admit combines: ${names}`,
    "",
    `source: adoption review pack for ${review.project}; verdicts validated by`,
    "`adoption/admission-intake.ts` (see the admission review alongside this ADR).",
    "",
  ];
  for (const { verdict, target } of admissions) {
    lines.push(`## \`${verdict.name}\``, "");
    if (verdict.intent) lines.push(`intent: ${verdict.intent}`, "");
    lines.push(`paragraph: \`${verdict.paragraph}\``, "");
    if (target) lines.push(`evidence: ${target.kind}, ${target.count}x across ${target.fileCount} files, ${target.directoryCount} directories; examples ${target.examples.slice(0, 3).join(", ")}`, "");
    lines.push(`${verdict.justification}`, "");
  }
  lines.push("## Combine definitions", "");
  for (const { verdict } of admissions) {
    lines.push(`combine ${verdict.name}: [`, `  ${verdict.paragraph}`, "]", "");
  }
  lines.push("```", "");
  return lines;
}

export function renderAdmissionReview(review: AdmissionReview): string {
  const sorted = [...review.verdicts].sort((left, right) =>
    VERDICT_ORDER[left.verdict.verdict] - VERDICT_ORDER[right.verdict.verdict] ||
    left.verdict.paragraph.localeCompare(right.verdict.paragraph));
  const admitted = review.verdicts.filter((item) => item.verdict.verdict === "admit").length;
  const lines = [
    `# Ermine Admission Review: ${review.project}`,
    "",
    "> DRAFT — machine-validated, awaiting human ratification. Nothing below changes the",
    "> grammar until the ADR and combine definitions are committed.",
    "",
    "## Validation",
    "",
    `- admissions: ${admitted} of budget ${review.budget}`,
  ];
  if (review.errors.length) {
    lines.push(`- **errors (${review.errors.length}) — this review is not ratifiable as-is:**`);
    for (const error of review.errors) lines.push(`  - ${error}`);
  } else {
    lines.push("- errors: none");
  }
  if (review.warnings.length) {
    lines.push(`- warnings (${review.warnings.length}):`);
    for (const warning of review.warnings) lines.push(`  - ${warning}`);
  } else {
    lines.push("- warnings: none");
  }
  lines.push("", "## Verdicts", "");
  for (const item of sorted) lines.push(...renderVerdict(item));
  lines.push("", ...renderDraftAdr(review));
  lines.push(
    "## How to ratify",
    "",
    "1. Review the verdicts and warnings above; edit names or demote admissions freely.",
    "2. Add the combine definitions to the project's combines source.",
    "3. Commit the ADR under `constitution/decisions/` with the next number.",
    "4. Record `grammar` / `identity-local` dispositions in the adoption ledger.",
    "",
  );
  return lines.join("\n");
}

function slash(path: string): string {
  return path.split(sep).join("/");
}

function basenameOf(path: string): string {
  const parts = slash(resolve(path)).split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "project";
}

function stringArg(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

function numberArg(args: string[], name: string): number | undefined {
  const value = stringArg(args, name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name}: expected a number`);
  return parsed;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const project = stringArg(args, "--project");
  const verdictsPath = stringArg(args, "--verdicts");
  if (!project || !verdictsPath) {
    throw new Error("usage: admission-intake.ts --project <path> --verdicts <file> [--budget N] [--combines <file>] [--out <file>]");
  }
  const combinesPath = stringArg(args, "--combines");
  const options: AdmissionIntakeOptions = {
    budget: numberArg(args, "--budget"),
    minCount: numberArg(args, "--min-count"),
    combinesSource: combinesPath ? await readFile(resolve(combinesPath), "utf8") : undefined,
  };
  const document = parseAdmissionDocument(await readFile(resolve(verdictsPath), "utf8"));
  const sources: ClusterSource[] = await loadProjectSources(project);
  const { promotions, families } = mineClassClusters(sources, options);
  const review = buildAdmissionReview(document, promotions, basenameOf(project), options, families);
  const outPath = resolve(stringArg(args, "--out") ?? `reports/adoption/${basenameOf(project)}/ADMISSION-REVIEW.md`);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, renderAdmissionReview(review), "utf8");
  console.log(`admission review written to ${slash(outPath)}`);
  if (review.warnings.length) console.log(`${review.warnings.length} warning(s) — see the review.`);
  if (review.errors.length) {
    console.error(`${review.errors.length} validation error(s):`);
    for (const error of review.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? "")).href) {
  main().catch((cause) => {
    console.error((cause as Error).message);
    process.exitCode = 1;
  });
}
