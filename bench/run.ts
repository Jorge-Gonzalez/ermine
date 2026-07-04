// bench/run.ts — A3 benchmark runner. Three arms over the frozen intent set
// (bench/intents.json): ermine-loop (A2 harness, maxRounds 4), ermine-oneshot
// (same prompt, maxRounds 1 — no feedback), tailwind-oneshot (same intents, a
// permissive shape check only — Tailwind has no reason-bearing validator, which
// is the point of the comparison; RESULTS.md states this).
//
// Validity for the ermine arms is judged with the intent's DECLARED backing
// (the P8 obligation — the same convention as the authoring contract's
// `backing=` fences); the harness feeds that backing to the linter.

import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import { runLoop } from "../loop/harness.ts";
import type { Generator, Trace } from "../loop/types.ts";
import { parseWord } from "../src/lint.ts";

export interface BenchIntent {
  id: string;
  intent: string;
  mustInclude?: string[];
  mustNotInclude?: string[];
  backing?: string[];
}

const INTENTS_PATH = new URL("./intents.json", import.meta.url);
const RESULTS_DIR = new URL("./results/", import.meta.url);

export function loadIntents(): BenchIntent[] {
  const parsed = JSON.parse(readFileSync(INTENTS_PATH, "utf8")) as { intents: BenchIntent[] };
  const intents = parsed.intents;
  if (intents.length !== 30) throw new Error(`intents.json must hold exactly 30 intents, found ${intents.length}`);
  if (new Set(intents.map((i) => i.id)).size !== intents.length) throw new Error("intents.json ids must be unique");
  return intents;
}

// --- semantic checks: an axis id the final string must touch, or a scope
// shape like "viewport-*:" it must carry (the order's own example).
export function touchesToken(classString: string, token: string): boolean {
  const parsed = classString.trim().split(/\s+/).filter(Boolean).map(parseWord);
  if (token.endsWith("*:")) {
    const prefix = token.slice(0, -2);
    return parsed.some((p) => p.scope !== "base" && p.scope.startsWith(prefix));
  }
  return parsed.some((p) => p.axis === token);
}

export function semanticPass(intent: BenchIntent, finalString: string): boolean {
  const include = intent.mustInclude ?? [];
  const exclude = intent.mustNotInclude ?? [];
  return include.every((t) => touchesToken(finalString, t)) &&
    exclude.every((t) => !touchesToken(finalString, t));
}

// --- arms ---
export type ArmName = "ermine-loop" | "ermine-oneshot" | "tailwind-oneshot";

export interface ErmineRun { id: string; trace: Trace }
export interface TailwindRun { id: string; emission: string; shapeValid: boolean }

// permissive on purpose: any line of plausible utility tokens counts. This is
// NOT equivalence with lint() and is documented as such in the report.
export const TAILWIND_SHAPE = /^[a-z0-9][a-z0-9:/[\]\-.%]*( [a-z0-9][a-z0-9:/[\]\-.%]*)*$/i;

const TAILWIND_PREAMBLE = `You are a Tailwind CSS class generator. Emit exactly one line of
space-separated Tailwind utility classes that realizes the intent. No markdown, no commentary.`;

export function tailwindPrompt(intent: string): string {
  return `${TAILWIND_PREAMBLE}\n\n# INTENT\n${intent}`;
}

export interface ArmMetrics {
  arm: ArmName;
  n: number;
  firstEmissionValidity: number;
  gapRate: number | null;
  semanticPassRate: number | null;
  roundsToValid?: Record<string, number>;
}

const rate = (hits: number, n: number): number => (n === 0 ? 0 : hits / n);

export function computeErmineMetrics(arm: ArmName, runs: ErmineRun[], intents: BenchIntent[]): ArmMetrics {
  const byId = new Map(intents.map((i) => [i.id, i]));
  let firstValid = 0;
  let gaps = 0;
  let semantic = 0;
  const roundsToValid: Record<string, number> = {};
  for (const run of runs) {
    const first = run.trace.rounds[0];
    if (first && !first.issues.some((i) => i.level === "error") && run.trace.terminalState !== "gap") firstValid += 1;
    if (run.trace.terminalState === "gap") gaps += 1;
    if (run.trace.terminalState === "valid") {
      const key = String(run.trace.rounds.length);
      roundsToValid[key] = (roundsToValid[key] ?? 0) + 1;
      if (semanticPass(byId.get(run.id)!, run.trace.finalString)) semantic += 1;
    }
  }
  const metrics: ArmMetrics = {
    arm, n: runs.length,
    firstEmissionValidity: rate(firstValid, runs.length),
    gapRate: rate(gaps, runs.length),
    semanticPassRate: rate(semantic, runs.length),
  };
  if (arm === "ermine-loop") metrics.roundsToValid = roundsToValid;
  return metrics;
}

export function computeTailwindMetrics(runs: TailwindRun[]): ArmMetrics {
  return {
    arm: "tailwind-oneshot", n: runs.length,
    firstEmissionValidity: rate(runs.filter((r) => r.shapeValid).length, runs.length),
    gapRate: null,        // the arm has no gap protocol
    semanticPassRate: null, // semantic checks are Ermine axis ids — not applicable
  };
}

export interface BenchResult {
  date: string;
  generator: string;
  arms: {
    "ermine-loop": { metrics: ArmMetrics; runs: ErmineRun[] };
    "ermine-oneshot": { metrics: ArmMetrics; runs: ErmineRun[] };
    "tailwind-oneshot": { metrics: ArmMetrics; runs: TailwindRun[] };
  };
}

export async function runBench(gen: Generator, generatorName: string, intents = loadIntents()): Promise<BenchResult> {
  const loopRuns: ErmineRun[] = [];
  const oneshotRuns: ErmineRun[] = [];
  const tailwindRuns: TailwindRun[] = [];

  for (const intent of intents) {
    loopRuns.push({ id: intent.id, trace: await runLoop(intent.intent, gen, { maxRounds: 4, backing: intent.backing }) });
    oneshotRuns.push({ id: intent.id, trace: await runLoop(intent.intent, gen, { maxRounds: 1, backing: intent.backing }) });
    const emission = await gen(tailwindPrompt(intent.intent));
    tailwindRuns.push({ id: intent.id, emission, shapeValid: TAILWIND_SHAPE.test(emission.trim()) });
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    generator: generatorName,
    arms: {
      "ermine-loop": { metrics: computeErmineMetrics("ermine-loop", loopRuns, intents), runs: loopRuns },
      "ermine-oneshot": { metrics: computeErmineMetrics("ermine-oneshot", oneshotRuns, intents), runs: oneshotRuns },
      "tailwind-oneshot": { metrics: computeTailwindMetrics(tailwindRuns), runs: tailwindRuns },
    },
  };
}

async function main(): Promise<void> {
  const flagIndex = process.argv.indexOf("--generator");
  const name = flagIndex >= 0 ? process.argv[flagIndex + 1] : "fake";
  let gen: Generator;
  if (name === "fake") {
    gen = (await import("./fake-generator.ts")).fakeGenerator;
  } else if (name === "anthropic") {
    gen = (await import("../generators/anthropic.ts")).anthropicGenerator;
  } else {
    throw new Error(`Unknown generator '${name}' — use fake or anthropic`);
  }

  const result = await runBench(gen, name);
  await mkdir(RESULTS_DIR, { recursive: true });
  const destination = new URL(`${result.date}-${name}.json`, RESULTS_DIR);
  await writeFile(destination, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(fileURLToPath(destination));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
