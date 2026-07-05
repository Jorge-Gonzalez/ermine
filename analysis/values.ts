// values.ts — INGESTOR VIABILITY, LAYER 2: value mapping (the fidelity question).
//
// The measurement implementation lives in lib.ts so audit.ts can reuse it.
// This CLI intentionally preserves the original output and invocation shape.

import { readFileSync } from "node:fs";

import { analyzeValues, formatPercent } from "./lib.ts";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: tsx analysis/values.ts <file.css> [...]");
  process.exit(1);
}

for (const file of files) {
  const reports = analyzeValues(readFileSync(file, "utf8"));
  console.log(`\n════ ${file.split("/").pop()} ════`);
  for (const report of Object.values(reports)) {
    if (!report.totalTokens) continue;
    const by = report.kinds;
    console.log(`\n── ${report.family.toUpperCase()} (${report.totalTokens} value-tokens) ──`);
    console.log(
      `  var(): ${formatPercent(report.totalTokens ? by.var / report.totalTokens : null)}  ` +
      `zero: ${formatPercent(report.zeroShare)}  ` +
      `length: ${formatPercent(report.totalTokens ? by.length / report.totalTokens : null)}  ` +
      `percent: ${formatPercent(report.totalTokens ? by.percent / report.totalTokens : null)}  ` +
      `keyword: ${formatPercent(report.totalTokens ? by.keyword / report.totalTokens : null)}  ` +
      `calc: ${formatPercent(report.totalTokens ? by.calc / report.totalTokens : null)}  ` +
      `other: ${formatPercent(report.totalTokens ? by.other / report.totalTokens : null)}`,
    );
    if (report.rawLengths) {
      console.log(`  raw lengths: ${report.rawLengths} tokens, ${report.distinctLengths} DISTINCT values`);
      console.log(`  multiples of 4px: ${formatPercent(report.gridAlignedShare)} of lengths`);
      console.log(
        "  cumulative coverage by top-N distinct values:  " +
        `top4 ${formatPercent(report.topCoverage(4))}  ` +
        `top6 ${formatPercent(report.topCoverage(6))}  ` +
        `top8 ${formatPercent(report.topCoverage(8))}  ` +
        `top12 ${formatPercent(report.topCoverage(12))}  ` +
        `top16 ${formatPercent(report.topCoverage(16))}`,
      );
      console.log(
        `  top values: ${report.topValues.slice(0, 12).map(([value, count]) => `${value}px(${count})`).join("  ")}`,
      );
    }
  }
}
