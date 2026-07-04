// bench/report.ts — renders a bench/results/*.json file to the markdown table
// in bench/RESULTS.md. Rendering is pure (renderReport); the CLI picks the
// newest results file unless one is named.

import { readdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { ArmMetrics, BenchResult } from "./run.ts";

const RESULTS_DIR = new URL("./results/", import.meta.url);
const REPORT_PATH = new URL("./RESULTS.md", import.meta.url);

const pct = (value: number): string => `${(value * 100).toFixed(0)}%`;
const cell = (value: number | null): string => (value === null ? "n/a" : pct(value));

function roundsLine(metrics: ArmMetrics): string {
  const dist = metrics.roundsToValid ?? {};
  const keys = Object.keys(dist).sort((a, b) => Number(a) - Number(b));
  if (!keys.length) return "—";
  return keys.map((k) => `${k} round${k === "1" ? "" : "s"}: ${dist[k]}`).join(" · ");
}

export function renderReport(result: BenchResult): string {
  const loop = result.arms["ermine-loop"].metrics;
  const oneshot = result.arms["ermine-oneshot"].metrics;
  const tailwind = result.arms["tailwind-oneshot"].metrics;

  return `# Ermine benchmark — results

- date: ${result.date}
- generator: \`${result.generator}\`
- intent set: \`bench/intents.json\` (frozen; ${loop.n} intents)

| metric | ermine-loop | ermine-oneshot | tailwind-oneshot |
|---|---|---|---|
| first-emission validity | ${pct(loop.firstEmissionValidity)} | ${pct(oneshot.firstEmissionValidity)} | ${pct(tailwind.firstEmissionValidity)} |
| gap rate | ${cell(loop.gapRate)} | ${cell(oneshot.gapRate)} | ${cell(tailwind.gapRate)} |
| semantic-check pass rate | ${cell(loop.semanticPassRate)} | ${cell(oneshot.semanticPassRate)} | ${cell(tailwind.semanticPassRate)} |

Rounds-to-valid (loop arm): ${roundsLine(loop)}

## How to read these numbers

- **Validity is not comparable across the last column.** The ermine arms are judged by the
  reason-bearing linter (\`lint()\`, with each intent's declared backing). The tailwind arm is judged
  by a permissive shape check only, because Tailwind has no reason-bearing validator — that absence
  is the point of the comparison, not an oversight.
- **Semantic checks** (axis ids / scope shapes a correct answer must touch) are defined in Ermine's
  vocabulary and are therefore not applicable to the tailwind arm. Semantic pass requires a \`valid\`
  terminal AND all checks satisfied.
- **Gap rate** counts emissions of the structured GAP block — a lawful terminal, not a failure.
  The tailwind arm has no gap protocol.

## Limitations

- Visual/rendered fidelity is NOT judged — that requires the browser rig and is a later extension.
- When \`generator: fake\`, the numbers exercise the pipeline deterministically and say nothing
  about any model.
`;
}

async function main(): Promise<void> {
  const named = process.argv[2];
  let source: URL;
  if (named) {
    source = pathToFileURL(named);
  } else {
    const files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json")).sort();
    if (!files.length) throw new Error("no results files — run tsx bench/run.ts first");
    source = new URL(files.at(-1)!, RESULTS_DIR);
  }
  const result = JSON.parse(readFileSync(source, "utf8")) as BenchResult;
  await writeFile(REPORT_PATH, renderReport(result), "utf8");
  console.log(fileURLToPath(REPORT_PATH));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
