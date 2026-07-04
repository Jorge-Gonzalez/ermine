import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname } from "node:path";

import type { Trace } from "./types.ts";

const DEFAULT_TRACE_DIR = new URL("./traces/", import.meta.url);
const DEFAULT_BENCH_DIR = new URL("../bench/results/", import.meta.url);
const DEFAULT_OUT_DIR = new URL("../reports/", import.meta.url);

function slugify(input: string): string {
  return input.toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "gap";
}

function parseGap(text: string): { intent: string; nearest: string; missing: string } | null {
  if (!text || !text.startsWith("GAP")) return null;
  const lines = text.split(/\r?\n/);
  const intentLine = lines.find((l) => l.startsWith("intent:")) || "intent: ";
  const nearestLine = lines.find((l) => l.startsWith("nearest:")) || "nearest: ";
  const missingLine = lines.find((l) => l.startsWith("missing:")) || "missing: ";
  const missing = missingLine.replace(/^missing:\s*/, "");
  return { intent: intentLine.replace(/^intent:\s*/, ""), nearest: nearestLine.replace(/^nearest:\s*/, ""), missing };
}

async function collectTracesFromDir(dirUrl: URL): Promise<Array<{ source: string; trace: Trace; id?: string }>> {
  const out: Array<{ source: string; trace: Trace; id?: string }> = [];
  let entries: string[] = [];
  try {
    entries = await readdir(fileURLToPath(dirUrl));
  } catch (e) {
    return out;
  }
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    const path = join(fileURLToPath(dirUrl), name);
    try {
      const raw = await readFile(path, "utf8");
      const trace = JSON.parse(raw) as Trace;
      out.push({ source: path, trace });
    } catch (e) {
      // ignore invalid files
    }
  }
  return out;
}

async function collectBenchRuns(dirUrl: URL): Promise<Array<{ source: string; trace: Trace; id?: string }>> {
  const out: Array<{ source: string; trace: Trace; id?: string }> = [];
  let entries: string[] = [];
  try {
    entries = await readdir(fileURLToPath(dirUrl));
  } catch (e) {
    return out;
  }
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    const path = join(fileURLToPath(dirUrl), name);
    try {
      const raw = await readFile(path, "utf8");
      const obj = JSON.parse(raw) as any;
      const arms = obj?.arms || {};
      for (const armName of Object.keys(arms)) {
        const runs = arms[armName]?.runs || [];
        for (const run of runs) {
          if (run?.trace) out.push({ source: path, trace: run.trace, id: run.id });
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return out;
}

export async function harvest(opts?: { traceDir?: string | URL; benchDir?: string | URL; outDir?: string | URL }): Promise<string[]> {
  const traceDir = opts?.traceDir ? (typeof opts.traceDir === "string" ? new URL(pathToFileURL(opts.traceDir).href) : opts.traceDir) : DEFAULT_TRACE_DIR;
  const benchDir = opts?.benchDir ? (typeof opts.benchDir === "string" ? new URL(pathToFileURL(opts.benchDir).href) : opts.benchDir) : DEFAULT_BENCH_DIR;
  const outDir = opts?.outDir ? (typeof opts.outDir === "string" ? new URL(pathToFileURL(opts.outDir).href) : opts.outDir) : DEFAULT_OUT_DIR;

  const traces = await collectTracesFromDir(traceDir);
  const benchRuns = await collectBenchRuns(benchDir);
  const all = [...traces, ...benchRuns];

  const byMissing = new Map<string, Array<{ source: string; intent: string; nearest: string; examples: { source: string; id?: string }[] }>>();

  for (const item of all) {
    const t = item.trace;
    // prefer finalString when terminalState is gap
    if (t.terminalState === "gap") {
      const parsed = parseGap(t.finalString);
      if (parsed && parsed.missing.trim()) {
        const key = parsed.missing;
        const entry = byMissing.get(key) || [];
        entry.push({ source: item.source, intent: parsed.intent, nearest: parsed.nearest, examples: [{ source: item.source, id: (item as any).id }] });
        byMissing.set(key, entry);
      }
    } else {
      // scan rounds for emissions that are GAP blocks
      for (const r of t.rounds || []) {
        if (typeof r.emission === "string" && r.emission.startsWith("GAP")) {
          const parsed = parseGap(r.emission);
          if (parsed && parsed.missing.trim()) {
            const key = parsed.missing;
            const entry = byMissing.get(key) || [];
            entry.push({ source: item.source, intent: parsed.intent, nearest: parsed.nearest, examples: [{ source: item.source, id: (item as any).id }] });
            byMissing.set(key, entry);
          }
        }
      }
    }
  }

  await mkdir(fileURLToPath(outDir), { recursive: true });
  const created: string[] = [];
  for (const [missing, entries] of byMissing.entries()) {
    const slug = slugify(missing);
    const filename = `GAP-A5-${slug}.md`;
    const destination = join(fileURLToFilePath(outDir), filename);
    // Idempotent: re-running creates no duplicates (skip rewrite when identical)
    try {
      // build content
      const whatIWasDoing = entries.map((e) => `Run intent: ${e.intent || "(unknown)"} (from ${entries[0].examples[0].source})`).join("\n\n");
      const whereILooked = entries.map((e) => `- ${e.examples.map((ex) => ex.source).join(", ")}`).join("\n");
      const options = [
        `Add a grammar word that covers: ${missing}`,
        `Decide this intent is out-of-scope for the grammar and document the ruling`,
      ];
      const blocked = "Automated authoring/benchmark acceptance for the affected intent(s) is blocked until this decision is ruled.";
      const content = [
        `# Gap Report — A5`,
        "## What I was doing",
        whatIWasDoing,
        "## The decision that is missing",
        missing,
        "## Where I looked",
        whereILooked || "- loop traces",
        "## Options I can see (NOT a recommendation)",
        options.map((o) => `- ${o}`).join("\n"),
        "## What is blocked",
        blocked,
        "",
      ].join("\n\n");

      // write only if not existing or different
      let shouldWrite = true;
      try {
        const old = await readFile(destination, "utf8");
        if (old === content) shouldWrite = false;
      } catch (e) {
        // file does not exist
      }
      if (shouldWrite) {
        await writeFile(destination, content, "utf8");
      }
      created.push(destination);
    } catch (e) {
      // ignore single-entry failures
    }
  }

  return created.map((p) => p);
}

function fileURLToFilePath(u: URL): string {
  return fileURLToPath(u);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  harvest().then((created) => {
    console.log(JSON.stringify({ created }, null, 2));
  }).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
