// scope.ts — INGESTOR VIABILITY SPIKE (exploratory, not a shipped ingestor).
//
// The measurement implementation lives in lib.ts so audit.ts can reuse it.
// This CLI intentionally preserves the original output and invocation shape.

import { readFileSync } from "node:fs";

import {
  analyzeScope,
  formatPercent,
  grammarFamilies,
  ratioPercent,
} from "./lib.ts";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: tsx analysis/scope.ts <file.css> [...]");
  process.exit(1);
}

console.log(`grammar declared property-family universe (${grammarFamilies.size}): ${[...grammarFamilies].sort().join(", ")}\n`);

const merged = new Map<string, number>();
for (const file of files) {
  const report = analyzeScope(readFileSync(file, "utf8"), file);
  console.log(`── ${report.file.split("/").pop()} ──`);
  console.log(
    `  declarations: ${report.total}  (real properties: ${report.real}, theme custom-props: ${report.custom} = ` +
      `${formatPercent(ratioPercent(report.custom, report.total))})`,
  );
  console.log(
    `  REAL-PROPERTY FAMILY COVERAGE: ${report.covered}/${report.real} = ` +
      `${formatPercent(ratioPercent(report.covered, report.real))}  (ceiling on what an ingestor could express)`,
  );
  const top = [...report.uncovered.entries()].sort((left, right) => right[1] - left[1]).slice(0, 12);
  console.log(`  top uncovered families: ${top.map(([family, count]) => `${family}(${count})`).join(", ")}\n`);
  for (const [family, count] of report.uncovered) merged.set(family, (merged.get(family) ?? 0) + count);
}

if (files.length > 1) {
  const topAll = [...merged.entries()].sort((left, right) => right[1] - left[1]).slice(0, 20);
  console.log("── uncovered families across all corpora (the scope gaps, by frequency) ──");
  for (const [family, count] of topAll) console.log(`  ${String(count).padStart(5)}  ${family}`);
}
