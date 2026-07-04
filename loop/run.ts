import { pathToFileURL } from "node:url";

import { anthropicGenerator } from "../generators/anthropic.ts";
import { createManualGenerator } from "../generators/manual.ts";
import { runLoop } from "./harness.ts";
import { writeTrace } from "./trace-store.ts";
import type { Generator } from "./types.ts";

interface CliOptions {
  intent: string;
  generator: "manual" | "anthropic";
  maxRounds: number;
}

function parseArgs(args: string[]): CliOptions {
  let intent = "";
  let generator: CliOptions["generator"] = "manual";
  let maxRounds = 4;

  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const value = args[index + 1];
    if (flag === "--intent" && value !== undefined) {
      intent = value;
      index += 1;
    } else if (flag === "--generator" && (value === "manual" || value === "anthropic")) {
      generator = value;
      index += 1;
    } else if (flag === "--max-rounds" && value !== undefined) {
      maxRounds = Number(value);
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${flag}`);
    }
  }

  if (!intent.trim()) throw new Error("Usage: tsx loop/run.ts --intent \"…\" [--generator manual|anthropic] [--max-rounds 4]");
  if (!Number.isInteger(maxRounds) || maxRounds < 1) throw new Error("--max-rounds must be a positive integer");
  return { intent, generator, maxRounds };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  let generator: Generator;
  let close = () => {};
  if (options.generator === "manual") {
    const manual = createManualGenerator();
    generator = manual.generate;
    close = manual.close;
  } else {
    generator = anthropicGenerator;
  }

  try {
    const trace = await runLoop(options.intent, generator, { maxRounds: options.maxRounds });
    const tracePath = await writeTrace(trace);
    console.log(JSON.stringify({
      terminalState: trace.terminalState,
      finalString: trace.finalString,
      rounds: trace.rounds.length,
      trace: tracePath,
    }, null, 2));
    if (trace.terminalState === "exhausted") process.exitCode = 1;
  } finally {
    close();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
