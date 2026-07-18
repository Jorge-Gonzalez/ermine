import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { parseAndNormalizeCombines } from "../src/combines.ts";
import {
  ENVIRONMENT_SCOPES,
  INTERACTION_SCOPES,
  RELATIONAL_SCOPES,
  REGISTRY,
  STATE_SCOPES,
} from "../src/registry.ts";
import {
  formatUsage,
  loadProjectSources,
  mineClassClusters,
  type ClusterReport,
  type ClusterSource,
  type MineClassClustersOptions,
  type PromotionCandidate,
  type PromotionFamily,
} from "./clusters.ts";

export interface ReviewPackOptions extends MineClassClustersOptions {
  budget?: number;
  combinesSource?: string;
}

const DEFAULT_BUDGET = 3;

function protocol(budget: number): string[] {
  return [
    "## Protocol",
    "",
    "You are the admission reviewer for emergent combines. Promotion is vocabulary growth,",
    "not compression: a group earns a name only when the name says more than the words",
    "already say — never merely shorter. The default verdict for every candidate is",
    "**hold-as-stem**: holding costs nothing, a wrong admission costs forever. Admission",
    "must be argued from the evidence below, never from a name merely sounding good.",
    "",
    "Run two passes:",
    "",
    "1. **Proposer** — for each idiom family target, read the core words as intent and read the usage",
    "   contexts, then either propose one or two names or hold. A name is one general role",
    "   noun, optionally preceded by a variant modifier.",
    "2. **Gatekeeper** — attack every proposed name. Reject when the name paraphrases the",
    "   words (no surplus meaning), when an existing word or combine already covers the",
    "   role, when the role noun is domain- or project-bound, or when the evidence is one",
    "   context's markup dressed as generality.",
    "",
    "A surviving name must pass all three admission tests, in order:",
    "",
    "1. **Surplus meaning** — the name states a role the word list does not state.",
    "2. **Role noun** — exactly one general role noun (chip, panel, row, frame, cell,",
    "   keycap, control, …), optional variant modifier, no mechanism words, no domain nouns.",
    "3. **Project-agnostic** — the name would mean the same thing in a different product.",
    "   Back-translation check: ask a model that has NOT seen the definition to expand the",
    "   name into Ermine words; low overlap with the actual paragraph exposes an opaque or",
    "   project-bound name.",
    "",
    `Budget: admit at most ${budget} combine${budget === 1 ? "" : "s"} in this pass. If more survive, rank them and hold`,
    "the rest for the next iteration.",
    "",
    "Verdicts: `admit` (name + one-sentence intent), `hold-as-stem`, `role-bound-hold`",
    "(coherent but bound to a role-bound word's role), `identity` (component-owned).",
    "",
    "## Required Output",
    "",
    "Produce a single fenced JSON document — nothing else — matching:",
    "",
    "```json",
    "{",
    '  "version": 1,',
    '  "verdicts": [',
    '    { "paragraph": "<family core or candidate paragraph, copied verbatim>",',
    '      "verdict": "admit | hold-as-stem | role-bound-hold | identity",',
    '      "name": "<required for admit>",',
    '      "intent": "<one sentence, required for admit>",',
    '      "justification": "<one line citing evidence: spread, cohesion, usage, flags>" }',
    "  ],",
    '  "expansions": [ { "name": "<admitted name>", "words": ["<ermine word>", "..."] } ]',
    "}",
    "```",
    "",
    "One verdict per idiom family target. The `expansions` are the back-translation check: produce",
    "them in a FRESH conversation (or subagent) that has seen only the Existing Vocabulary",
    "section and the admitted names — never the candidate paragraphs — listing the words",
    "each name suggests. Ermine scores the overlap itself.",
    "",
    "Save the JSON as `admission-verdicts.json` and validate it with:",
    "",
    "```sh",
    "npm run adoption:admission -- --project <path> --verdicts admission-verdicts.json",
    "```",
    "",
    "The intake validates paragraphs, budget, and name collisions mechanically, scores the",
    "back-translation, and renders the draft review. Admissions are drafts. A human",
    "ratifies them in commit review; nothing in this pass changes the grammar by itself.",
  ];
}

function renderCandidate(candidate: PromotionCandidate): string[] {
  const { evidence } = candidate;
  const lines = [
    `- ${candidate.count}x, ${candidate.tokenCount} words, ${evidence.fileCount} files, ${evidence.directoryCount} directories`,
    `  paragraph: \`${candidate.value}\``,
    `  axes: ${candidate.axes.join(", ")}`,
    evidence.cohesion === null
      ? `  cohesion: below evidence floor (${candidate.count}x)`
      : `  cohesion: ${evidence.cohesion} median closure, ${((evidence.closedPairShare ?? 0) * 100).toFixed(0)}% closed pairs`,
  ];
  if (evidence.scopedWords.length) lines.push(`  scoped: \`${evidence.scopedWords.join(" ")}\``);
  if (evidence.roleBoundWords.length) lines.push(`  role-bound: \`${evidence.roleBoundWords.join(" ")}\``);
  if (evidence.contextResidue.length) {
    lines.push(`  context residue: ${evidence.contextResidue.map((item) => `${item.count}x \`${item.value}\``).join(", ")}`);
  }
  for (const usage of formatUsage(candidate.usage, 5)) lines.push(`  usage: ${usage}`);
  lines.push(`  examples: ${candidate.examples.join(", ")}`);
  return lines;
}

function renderFamilyTarget(family: PromotionFamily): string[] {
  const lines = [
    `- ${family.kind}: ${family.totalCount}x, ${family.fileCount} files, ${family.directoryCount} directories`,
    `  paragraph: \`${family.core}\``,
  ];
  if (family.coreAxes.length) lines.push(`  core axes: ${family.coreAxes.join(", ")}`);
  for (const usage of formatUsage(family.usage, 5)) lines.push(`  usage: ${usage}`);
  lines.push("  members:");
  for (const member of family.members) {
    const variants = member.variantWords.length ? ` + \`${member.variantWords.join(" ")}\`` : "";
    lines.push(`  - ${member.count}x, ${member.fileCount} files, ${member.disposition} \`${member.value}\`${variants}`);
  }
  return lines;
}

function renderFamilyTargets(report: ClusterReport): string[] {
  const targets = report.families.filter((family) => family.kind === "idiom" && family.core.length > 0);
  const lines = [
    "## Family Candidates for Review",
    "",
    "Review idiom family cores. Members are evidence for whether the core has a general",
    "name, and variants should normally remain direct Ermine additions. Fluency families",
    "are shown separately as held structure.",
    "",
  ];
  if (!targets.length) return [...lines, "_No family candidates at the selected threshold._", ""];
  for (const family of targets) lines.push(...renderFamilyTarget(family));
  lines.push("");
  return lines;
}

function renderFluencyFamilies(report: ClusterReport): string[] {
  const families = report.families.filter((family) => family.kind === "fluency");
  const lines = ["## Fluency Families (held structure)", ""];
  if (!families.length) return [...lines, "_No fluency families at the selected threshold._", ""];
  for (const family of families) lines.push(...renderFamilyTarget(family));
  lines.push("");
  return lines;
}

function renderParagraphEvidence(report: ClusterReport): string[] {
  const candidates = report.promotions.filter((candidate) => candidate.disposition === "candidate");
  const lines = ["## Individual Paragraph Evidence", ""];
  if (!candidates.length) return [...lines, "_No standalone candidate paragraphs at the selected threshold._", ""];
  for (const candidate of candidates) lines.push(...renderCandidate(candidate));
  lines.push("");
  return lines;
}

function renderHeld(report: ClusterReport): string[] {
  const held = report.promotions.filter((candidate) => candidate.disposition !== "candidate");
  const reasonOf = {
    "stem": "compositional core; stays spelled out",
    "loose-bundle": "words travel apart more than together",
    "local-evidence": "one file; corpus cannot show generality",
    "identity-shaped": "component identity plane",
  } as const;
  const lines = ["## Held by the Mechanics (context, not review targets)", ""];
  if (!held.length) return [...lines, "_Nothing held._", ""];
  for (const candidate of held) {
    lines.push(`- ${candidate.disposition} (${reasonOf[candidate.disposition as keyof typeof reasonOf]}): ${candidate.count}x \`${candidate.value}\``);
  }
  lines.push("");
  return lines;
}

function renderVocabulary(): string[] {
  const lines = [
    "## Existing Vocabulary",
    "",
    "A new name must not collide with any word below and should follow the same",
    "morphology. `<…>` marks parametric steps.",
    "",
  ];
  for (const record of REGISTRY) {
    lines.push(`- ${record.axis} (${record.sibling}): ${record.valueSpace.join(", ")}`);
  }
  const scopes = [...ENVIRONMENT_SCOPES, ...INTERACTION_SCOPES, ...STATE_SCOPES, ...RELATIONAL_SCOPES];
  lines.push("", `Scope prefixes: ${scopes.map((scope) => `\`${scope.shape}\``).join(", ")}`, "");
  return lines;
}

function renderExistingCombines(combinesSource: string | undefined): string[] {
  const lines = ["## Existing Combines", ""];
  if (!combinesSource) return [...lines, "_None defined yet — this is the first admission pass._", ""];
  const document = parseAndNormalizeCombines(combinesSource);
  if (!document.combines.length) return [...lines, "_None defined yet — this is the first admission pass._", ""];
  for (const combine of document.combines) {
    lines.push(`- \`${combine.name}\`${combine.intent ? ` — ${combine.intent}` : ""}: \`${combine.classString}\``);
  }
  lines.push("");
  return lines;
}

export function buildReviewPack(
  sources: readonly ClusterSource[],
  project = "project",
  options: ReviewPackOptions = {},
): string {
  const { budget = DEFAULT_BUDGET, combinesSource, ...mineOptions } = options;
  const report = mineClassClusters(sources, mineOptions);
  return [
    `# Ermine Admission Review Pack: ${project}`,
    "",
    "Input for one admission pass: the mechanical candidates with their evidence, the",
    "structures around them, and the vocabulary they must fit. The mechanics never promote;",
    "this review decides, and a human ratifies.",
    "",
    ...protocol(budget),
    "",
    ...renderFamilyTargets(report),
    ...renderFluencyFamilies(report),
    ...renderParagraphEvidence(report),
    ...renderHeld(report),
    ...renderVocabulary(),
    ...renderExistingCombines(combinesSource),
  ].join("\n");
}

function slash(path: string): string {
  return path.split(sep).join("/");
}

function basenameOf(path: string): string {
  const parts = slash(resolve(path)).split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "project";
}

function numberArg(args: string[], name: string): number | undefined {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = Number(args[index + 1]);
  if (!Number.isFinite(value)) throw new Error(`${name}: expected a number`);
  return value;
}

function stringArg(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const project = stringArg(args, "--project");
  if (!project) {
    throw new Error("usage: review-pack.ts --project <path> [--budget N] [--limit N] [--min-count N] [--combines <file>] [--out <file>]");
  }
  const sources = await loadProjectSources(project);
  const combinesPath = stringArg(args, "--combines");
  const pack = buildReviewPack(sources, basenameOf(project), {
    budget: numberArg(args, "--budget"),
    limit: numberArg(args, "--limit"),
    minCount: numberArg(args, "--min-count"),
    combinesSource: combinesPath ? await readFile(resolve(combinesPath), "utf8") : undefined,
  });
  const outPath = stringArg(args, "--out");
  if (outPath) {
    await mkdir(dirname(resolve(outPath)), { recursive: true });
    await writeFile(resolve(outPath), pack, "utf8");
    console.log(`review pack written to ${slash(outPath)}`);
  } else {
    console.log(pack);
  }
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? "")).href) {
  main().catch((cause) => {
    console.error((cause as Error).message);
    process.exitCode = 1;
  });
}
