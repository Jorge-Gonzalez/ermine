import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";

import { lint, type Issue } from "../src/lint.ts";
import { loadAuthoringContext } from "./context.ts";
import type { Generator, Trace } from "./types.ts";

const PREAMBLE = `You are an Ermine class-string generator. Follow the supplied authoring contract and
shared registry exactly. Return only the class string or GAP block allowed by the output protocol.`;

const CORRECTION = "Correct the string. Emit only the corrected string.";

function promptHash(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}

function isGapBlock(emission: string): boolean {
  const lines = emission.split("\n");
  return lines.length === 4 &&
    lines[0] === "GAP" &&
    /^intent:\s+\S/.test(lines[1]) &&
    /^nearest:(?:\s.*)?$/.test(lines[2]) &&
    /^missing:\s+\S/.test(lines[3]);
}

function serializeIssues(issues: Issue[]): string {
  return JSON.stringify(issues.map(({ rule, msg }) => ({ rule, msg })), null, 2);
}

export async function buildInitialPrompt(intent: string): Promise<string> {
  const context = await loadAuthoringContext();
  return `${PREAMBLE}\n\n${context}\n\n# INTENT\n${intent}`;
}

export async function runLoop(
  intent: string,
  gen: Generator,
  opts: { maxRounds: number },
): Promise<Trace> {
  if (!intent.trim()) throw new Error("runLoop requires a non-empty intent");
  if (!Number.isInteger(opts.maxRounds) || opts.maxRounds < 1) {
    throw new Error("runLoop maxRounds must be a positive integer");
  }

  const rounds: Trace["rounds"] = [];
  let prompt = await buildInitialPrompt(intent.trim());

  for (let round = 0; round < opts.maxRounds; round += 1) {
    const started = performance.now();
    const emission = await gen(prompt);
    const gap = isGapBlock(emission);
    const issues = gap ? [] : lint(emission);
    const elapsed = performance.now() - started;
    rounds.push({
      promptHash: promptHash(prompt),
      emission,
      issues,
      ms: Math.max(0, Math.round(elapsed)),
    });

    if (gap) return { intent: intent.trim(), rounds, terminalState: "gap", finalString: emission };
    if (!issues.some((issue) => issue.level === "error")) {
      return { intent: intent.trim(), rounds, terminalState: "valid", finalString: emission };
    }
    if (round + 1 === opts.maxRounds) break;

    prompt = [
      prompt,
      "# PREVIOUS EMISSION",
      emission,
      "# LINTER ISSUES",
      serializeIssues(issues),
      CORRECTION,
    ].join("\n\n");
  }

  return {
    intent: intent.trim(),
    rounds,
    terminalState: "exhausted",
    finalString: rounds.at(-1)?.emission ?? "",
  };
}
