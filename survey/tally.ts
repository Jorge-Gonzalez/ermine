import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stdin } from "node:process";
import { pathToFileURL } from "node:url";

export const CANONICAL_ORDER = [
  "tight",
  "snug",
  "comfortable",
  "relaxed",
  "loose",
  "separated",
] as const;

export type DensityWord = typeof CANONICAL_ORDER[number];

export const RESPONSE_PREFIX = "ORDER-v1:";
export const DECISION_THRESHOLD = 0.90;
export const MINIMUM_SAMPLE = 30;

export interface PairResult {
  first: DensityWord;
  second: DensityWord;
  agreements: number;
  total: number;
  share: number;
}

export interface ExcludedResponse {
  line: number;
  response: string;
  reason: string;
}

export interface TallyResult {
  completeResponses: number;
  excludedResponses: ExcludedResponse[];
  minimumSampleMet: boolean;
  pairs: PairResult[];
  totalAgreements: number;
  totalPairObservations: number;
  meanPairwiseAgreement: number;
  branch: "insufficient-sample" | "names-remain-canonical" | "numeric-steps-become-canonical";
}

export type ParsedResponse =
  | { ok: true; order: DensityWord[] }
  | { ok: false; reason: string };

const CANONICAL_SET = new Set<string>(CANONICAL_ORDER);

export function parseResponse(response: string): ParsedResponse {
  const trimmed = response.trim();
  if (!trimmed.startsWith(RESPONSE_PREFIX)) {
    return { ok: false, reason: `missing ${RESPONSE_PREFIX} prefix` };
  }
  const order = trimmed.slice(RESPONSE_PREFIX.length).split(">");
  if (order.length !== CANONICAL_ORDER.length) {
    return { ok: false, reason: `expected ${CANONICAL_ORDER.length} words, received ${order.length}` };
  }
  const unknown = order.filter((word) => !CANONICAL_SET.has(word));
  if (unknown.length) return { ok: false, reason: `unknown word(s): ${[...new Set(unknown)].join(", ")}` };
  if (new Set(order).size !== CANONICAL_ORDER.length) {
    return { ok: false, reason: "each word must appear exactly once" };
  }
  return { ok: true, order: order as DensityWord[] };
}

function canonicalPairs(): Array<[DensityWord, DensityWord]> {
  const pairs: Array<[DensityWord, DensityWord]> = [];
  for (let first = 0; first < CANONICAL_ORDER.length; first += 1) {
    for (let second = first + 1; second < CANONICAL_ORDER.length; second += 1) {
      pairs.push([CANONICAL_ORDER[first], CANONICAL_ORDER[second]]);
    }
  }
  return pairs;
}

export function tallyResponses(responses: readonly string[]): TallyResult {
  const valid: DensityWord[][] = [];
  const excludedResponses: ExcludedResponse[] = [];

  responses.forEach((response, index) => {
    const parsed = parseResponse(response);
    if (parsed.ok) valid.push(parsed.order);
    else excludedResponses.push({ line: index + 1, response, reason: parsed.reason });
  });

  if (valid.length === 0) throw new Error("No complete survey responses to tally");

  let totalAgreements = 0;
  const pairs = canonicalPairs().map(([first, second]): PairResult => {
    let agreements = 0;
    for (const order of valid) {
      if (order.indexOf(first) < order.indexOf(second)) agreements += 1;
    }
    totalAgreements += agreements;
    return { first, second, agreements, total: valid.length, share: agreements / valid.length };
  });
  const totalPairObservations = valid.length * pairs.length;
  const meanPairwiseAgreement = totalAgreements / totalPairObservations;

  return {
    completeResponses: valid.length,
    excludedResponses,
    minimumSampleMet: valid.length >= MINIMUM_SAMPLE,
    pairs,
    totalAgreements,
    totalPairObservations,
    meanPairwiseAgreement,
    branch: valid.length < MINIMUM_SAMPLE
      ? "insufficient-sample"
      : meanPairwiseAgreement > DECISION_THRESHOLD
        ? "names-remain-canonical"
        : "numeric-steps-become-canonical",
  };
}

function decimal(value: number): string {
  return value.toFixed(4);
}

export function renderTally(result: TallyResult): string {
  const decision = result.branch === "insufficient-sample"
    ? `No decision branch is triggered before ${MINIMUM_SAMPLE} complete responses.`
    : result.branch === "names-remain-canonical"
      ? "Names remain canonical; attach the evidence to the constitution's density section."
      : "Numeric steps become canonical; draft the six names as whole-axis-style aliases for human sign-off. Do not apply the ruling automatically.";
  const lines = [
    "# Density-ordering tally",
    "",
    `Complete responses: ${result.completeResponses}`,
    `Excluded responses: ${result.excludedResponses.length}`,
    `Minimum sample (${MINIMUM_SAMPLE}) met: ${result.minimumSampleMet ? "yes" : "no"}`,
    "",
    "| Canonical pair | Agreeing | Complete | Share |",
    "|---|---:|---:|---:|",
    ...result.pairs.map((pair) =>
      `| ${pair.first} < ${pair.second} | ${pair.agreements} | ${pair.total} | ${decimal(pair.share)} |`),
    "",
    `Mean pairwise agreement: ${result.totalAgreements}/${result.totalPairObservations} = ${decimal(result.meanPairwiseAgreement)}`,
    `Decision threshold: > ${DECISION_THRESHOLD.toFixed(2)}`,
    `Triggered branch: ${result.branch}`,
    "",
    decision,
  ];

  if (result.excludedResponses.length) {
    lines.push(
      "",
      "## Excluded responses",
      "",
      ...result.excludedResponses.map((excluded) =>
        `- line ${excluded.line}: ${excluded.reason} — ${JSON.stringify(excluded.response)}`),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function responseLines(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

async function readStdin(): Promise<string> {
  stdin.setEncoding("utf8");
  let source = "";
  for await (const chunk of stdin) source += chunk;
  return source;
}

async function main(): Promise<void> {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: npm run survey:tally -- <responses.txt|->");
    process.exitCode = 1;
    return;
  }
  const source = path === "-" ? await readStdin() : await readFile(path, "utf8");
  console.log(renderTally(tallyResponses(responseLines(source))).trimEnd());
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
