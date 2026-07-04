import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import type { Trace } from "./types.ts";

const TRACE_DIR = new URL("./traces/", import.meta.url);

function slug(intent: string): string {
  return intent.toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "intent";
}

export async function writeTrace(trace: Trace): Promise<string> {
  await mkdir(TRACE_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const destination = new URL(`${timestamp}-${slug(trace.intent)}.json`, TRACE_DIR);
  await writeFile(destination, `${JSON.stringify(trace, null, 2)}\n`, "utf8");
  return fileURLToPath(destination);
}
