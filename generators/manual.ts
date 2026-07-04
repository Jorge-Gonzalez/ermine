import { stdin, stderr } from "node:process";
import { createInterface } from "node:readline";

import type { Generator } from "../loop/types.ts";

export interface ManualGenerator {
  generate: Generator;
  close: () => void;
}

export function createManualGenerator(): ManualGenerator {
  const readline = createInterface({ input: stdin, crlfDelay: Infinity });
  const lines = readline[Symbol.asyncIterator]();

  async function nextLine(): Promise<string> {
    const next = await lines.next();
    if (next.done) throw new Error("Manual generator reached end of stdin before receiving an emission");
    return next.value;
  }

  const generate: Generator = async (prompt) => {
    stderr.write(`\n--- ERMINE PROMPT ---\n${prompt}\n--- EMISSION (one line, or four-line GAP block) ---\n`);
    const first = await nextLine();
    if (first.trim() !== "GAP") return first;
    return [first, await nextLine(), await nextLine(), await nextLine()].join("\n");
  };

  return { generate, close: () => readline.close() };
}
