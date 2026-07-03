// scope.ts — INGESTOR VIABILITY SPIKE (exploratory, not a shipped ingestor).
//
// The ingestor is the inverse of emit(): real CSS → grammar words. Its ceiling is
// PROPERTY COVERAGE — the grammar can only ever express a declaration whose property
// it has a concept for. So before building an ingestor, measure that ceiling against
// REAL, non-Ermine CSS. This is the "does the grammar span real design space" fit
// statistic the analysis kept asking for.
//
// Method: build the grammar's declared property universe from registry `controls`
// (all 33 axes — declared scope, not just what emits yet), extract every declaration
// from a corpus, and report what fraction touches a property-FAMILY the grammar owns.
// Custom properties (--x) are bucketed separately: they are theme tokens (Ermine's
// var() seam), not grammar-axis properties — counting them as "uncovered" would
// mislead. Run: `pnpm tsx analysis/scope.ts <file.css> [more.css ...]`.

import { readFileSync } from "node:fs";
import { REGISTRY } from "../src/registry.ts";

// --- normalize a property to its FAMILY (the "does the grammar have a concept" unit).
// strips logical/physical side+axis suffixes, then collapses known shorthands. ---
const SHORTHAND_ROOTS = [
  "margin", "padding", "border-radius", "border", "background", "font", "transition",
  "animation", "overflow", "inset", "place", "flex", "grid", "outline", "box-shadow", "gap",
];
function family(prop: string): string {
  if (prop.startsWith("--")) return prop; // custom property — handled separately
  let p = prop.replace(/-(top|right|bottom|left|block|inline|start|end|x|y)(-(start|end))?$/i, "");
  for (const r of SHORTHAND_ROOTS) if (p === r || p.startsWith(r + "-")) return r;
  return p;
}

// --- the grammar's declared property universe (families it owns), from `controls`.
// display.inner/.outer → display; custom-property controls (--stagger, --selection-*)
// are grammar-internal plumbing, excluded from the real-CSS-facing universe. ---
const grammarFamilies = new Set<string>();
for (const ax of REGISTRY)
  for (const raw of ax.controls) {
    const p = raw.replace(/^display\..*/, "display");
    if (!p.startsWith("--")) grammarFamilies.add(family(p));
  }

// --- extract declaration property names from a CSS string. Regex-level (this is a
// coverage histogram, not an AST): a property sits at a declaration boundary ({ or ;)
// and is followed by ':'. This skips pseudo-selectors (`:hover` — preceded by a name,
// not a boundary) and @media conditions (`(min-width:` — preceded by '('). ---
function extractProps(css: string): string[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const props: string[] = [];
  const re = /[;{]\s*(--[a-zA-Z0-9-]+|-?[a-zA-Z][a-zA-Z-]+)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noComments))) props.push(m[1].toLowerCase());
  return props;
}

interface Report { file: string; total: number; custom: number; real: number; covered: number; uncovered: Map<string, number>; }

function analyze(file: string): Report {
  const props = extractProps(readFileSync(file, "utf8"));
  const uncovered = new Map<string, number>();
  let custom = 0, real = 0, covered = 0;
  for (const p of props) {
    if (p.startsWith("--")) { custom++; continue; } // theme token (var seam), not a grammar axis
    real++;
    const fam = family(p);
    if (grammarFamilies.has(fam)) covered++;
    else uncovered.set(fam, (uncovered.get(fam) ?? 0) + 1);
  }
  return { file, total: props.length, custom, real, covered, uncovered };
}

function pct(n: number, d: number): string { return d ? `${((100 * n) / d).toFixed(1)}%` : "—"; }

const files = process.argv.slice(2);
if (!files.length) { console.error("usage: tsx analysis/scope.ts <file.css> [...]"); process.exit(1); }

console.log(`grammar declared property-family universe (${grammarFamilies.size}): ${[...grammarFamilies].sort().join(", ")}\n`);

const merged = new Map<string, number>();
for (const file of files) {
  const r = analyze(file);
  console.log(`── ${r.file.split("/").pop()} ──`);
  console.log(`  declarations: ${r.total}  (real properties: ${r.real}, theme custom-props: ${r.custom} = ${pct(r.custom, r.total)})`);
  console.log(`  REAL-PROPERTY FAMILY COVERAGE: ${r.covered}/${r.real} = ${pct(r.covered, r.real)}  (ceiling on what an ingestor could express)`);
  const top = [...r.uncovered.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log(`  top uncovered families: ${top.map(([f, n]) => `${f}(${n})`).join(", ")}\n`);
  for (const [f, n] of r.uncovered) merged.set(f, (merged.get(f) ?? 0) + n);
}

if (files.length > 1) {
  const topAll = [...merged.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  console.log(`── uncovered families across all corpora (the scope gaps, by frequency) ──`);
  for (const [f, n] of topAll) console.log(`  ${String(n).padStart(5)}  ${f}`);
}
