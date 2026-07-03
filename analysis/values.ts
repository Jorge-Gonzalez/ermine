// values.ts — INGESTOR VIABILITY, LAYER 2: value mapping (the fidelity question).
//
// Layer 1 (scope.ts) measured whether the grammar has a CONCEPT for a property.
// This measures whether real VALUES for the scale families (spacing, size) actually
// concentrate onto a small set of steps — i.e. can `var(--scale-step)` snap real
// spacing, or is it continuous noise? That is (a) the ingestor's real value-mapping
// fidelity and (b) the first empirical test of the §5.1 "a scale fits real designs"
// premise. Run: `pnpm tsx analysis/values.ts <file.css> [...]`.

import { readFileSync } from "node:fs";

const FAMILIES: Record<string, RegExp> = {
  spacing: /^(gap|row-gap|column-gap|margin|padding)(-(top|right|bottom|left|block|inline|start|end))*$/,
  size: /^(width|height|min-width|max-width|min-height|max-height|flex-basis)$/,
};

// pull (property, value) declarations; split each value into whitespace tokens so
// shorthand components (`padding: 8px 16px`, `margin: 0 auto`) are each classified.
function declTokens(css: string): { prop: string; token: string }[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const re = /[;{]\s*(-?[a-z][a-z-]+)\s*:\s*([^;{}]+?)\s*[;}]/g;
  const out: { prop: string; token: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(noComments))) {
    const prop = m[1].toLowerCase();
    // keep var()/calc() whole (they contain spaces); otherwise split on whitespace
    const value = m[2].replace(/\s*!important\s*/gi, "").trim();
    const tokens = /^(var|calc|clamp|min|max)\(/i.test(value) ? [value] : value.split(/\s+/);
    for (const t of tokens) out.push({ prop, token: t.toLowerCase() });
  }
  return out;
}

// classify one value token; lengths normalized to px (rem/em × 16, a stated assumption)
type Kind = "zero" | "length" | "percent" | "keyword" | "var" | "calc" | "other";
function classify(tok: string): { kind: Kind; px?: number } {
  if (/^0(px|rem|em|%)?$/.test(tok)) return { kind: "zero", px: 0 };
  let m = tok.match(/^(-?\d*\.?\d+)px$/); if (m) return { kind: "length", px: +m[1] };
  m = tok.match(/^(-?\d*\.?\d+)(rem|em)$/); if (m) return { kind: "length", px: +m[1] * 16 };
  if (/^-?\d*\.?\d+%$/.test(tok)) return { kind: "percent" };
  if (/^var\(/.test(tok)) return { kind: "var" };
  if (/^(calc|clamp|min|max)\(/.test(tok)) return { kind: "calc" };
  if (/^(auto|inherit|initial|unset|none|fit-content|min-content|max-content|revert)$/.test(tok)) return { kind: "keyword" };
  return { kind: "other" };
}

const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : "—");

const files = process.argv.slice(2);
if (!files.length) { console.error("usage: tsx analysis/values.ts <file.css> [...]"); process.exit(1); }

for (const file of files) {
  const toks = declTokens(readFileSync(file, "utf8"));
  console.log(`\n════ ${file.split("/").pop()} ════`);
  for (const [fam, re] of Object.entries(FAMILIES)) {
    const famToks = toks.filter((t) => re.test(t.prop)).map((t) => classify(t.token));
    const n = famToks.length;
    if (!n) continue;
    const by: Record<Kind, number> = { zero: 0, length: 0, percent: 0, keyword: 0, var: 0, calc: 0, other: 0 };
    const lengths = new Map<number, number>();
    for (const c of famToks) {
      by[c.kind]++;
      if (c.kind === "length" && c.px !== undefined) lengths.set(c.px, (lengths.get(c.px) ?? 0) + 1);
    }
    const lenTotal = by.length;
    const sorted = [...lengths.entries()].sort((a, b) => b[1] - a[1]);
    const cum = (k: number) => pct(sorted.slice(0, k).reduce((s, [, c]) => s + c, 0), lenTotal);
    const gridAligned = [...lengths].filter(([v]) => v % 4 === 0).reduce((s, [, c]) => s + c, 0);

    console.log(`\n── ${fam.toUpperCase()} (${Object.entries(FAMILIES).length ? "" : ""}${n} value-tokens) ──`);
    console.log(`  var(): ${pct(by.var, n)}  zero: ${pct(by.zero, n)}  length: ${pct(by.length, n)}  percent: ${pct(by.percent, n)}  keyword: ${pct(by.keyword, n)}  calc: ${pct(by.calc, n)}  other: ${pct(by.other, n)}`);
    if (lenTotal) {
      console.log(`  raw lengths: ${lenTotal} tokens, ${lengths.size} DISTINCT values`);
      console.log(`  multiples of 4px: ${pct(gridAligned, lenTotal)} of lengths`);
      console.log(`  cumulative coverage by top-N distinct values:  top4 ${cum(4)}  top6 ${cum(6)}  top8 ${cum(8)}  top12 ${cum(12)}  top16 ${cum(16)}`);
      console.log(`  top values: ${sorted.slice(0, 12).map(([v, c]) => `${v}px(${c})`).join("  ")}`);
    }
  }
}
