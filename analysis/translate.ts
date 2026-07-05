// analysis/translate.ts — C4 translator spike: ONE real page's CSS → Ermine
// words + explicit residuals → both versions rendered side by side.
//
// Page: the Playwright HTML Report snapshot (analysis/translation/original.html,
// provenance in make-original.ts) — the C2 corpus target with the highest
// layer-1 coverage (82.4%).
//
// Discipline (R2): a declaration is translated ONLY where an EMISSION entry
// provides the inverse mapping (property+value → word), directly or through
// the snap-to-scale path; everything else passes through VERBATIM into
// residual.css. The translator never drops a declaration and never coins a
// word. Conservation is asserted: original === translated + residual.
//
// Run: npm run translate   (writes translated.html, ermine.generated.css,
// residual.css, screenshots, and TRANSLATION-REPORT.md)

import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

import { emittableWords } from "../src/derive-ownership.ts";
import { emit } from "../src/emit.ts";
import { buildStylesheet } from "../src/css.ts";
import { lint } from "../src/lint.ts";

const HERE = new URL("./translation/", import.meta.url);
const CORPUS_CSS = new URL("./corpus/playwright-html-report/report.css", import.meta.url);
const THEME = new URL("../demo/theme.css", import.meta.url);
const PAGE_COVERAGE = "82.4%"; // layer-1 coverage of the chosen page (FINDINGS-APPS)

// ---------------------------------------------------------------------------
// CSS parsing — rule-level (selector + declarations). At-rules pass through
// whole; their inner declarations are counted so conservation holds page-wide.
// ---------------------------------------------------------------------------
export interface Declaration { property: string; value: string; raw: string }
export type CssEntry =
  | { kind: "rule"; selector: string; declarations: Declaration[] }
  | { kind: "at"; raw: string; declarationCount: number };

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, "");

function splitDeclarations(block: string): Declaration[] {
  const out: Declaration[] = [];
  let depth = 0;
  let current = "";
  for (const ch of block) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === ";" && depth === 0) {
      if (current.trim()) out.push(toDeclaration(current));
      current = "";
    } else current += ch;
  }
  if (current.trim()) out.push(toDeclaration(current));
  return out;
}

function toDeclaration(raw: string): Declaration {
  const colon = raw.indexOf(":");
  return {
    property: raw.slice(0, colon).trim().toLowerCase(),
    value: raw.slice(colon + 1).trim(),
    raw: raw.trim(),
  };
}

export function parseCss(css: string): CssEntry[] {
  const source = stripComments(css);
  const entries: CssEntry[] = [];
  let index = 0;
  while (index < source.length) {
    const brace = source.indexOf("{", index);
    if (brace === -1) break;
    const selector = source.slice(index, brace).trim();
    if (selector.startsWith("@")) {
      // capture the whole at-rule block, brace-balanced
      let depth = 0;
      let end = brace;
      for (; end < source.length; end += 1) {
        if (source[end] === "{") depth += 1;
        if (source[end] === "}") { depth -= 1; if (depth === 0) break; }
      }
      const raw = source.slice(index, end + 1).trim();
      const declarationCount = [...raw.matchAll(/[{;]\s*[a-zA-Z-][\w-]*\s*:/g)].length;
      entries.push({ kind: "at", raw, declarationCount });
      index = end + 1;
    } else {
      const end = source.indexOf("}", brace);
      entries.push({ kind: "rule", selector, declarations: splitDeclarations(source.slice(brace + 1, end)) });
      index = end + 1;
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Inverse mapping, built mechanically from the emitter (property+value → word).
// ---------------------------------------------------------------------------
const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, " ");

interface Signature { word: string; declarations: Map<string, string> }

export function buildExactSignatures(): Signature[] {
  const signatures: Signature[] = [];
  for (const words of Object.values(emittableWords())) {
    for (const word of words) {
      const declarations = new Map<string, string>();
      for (const rule of emit(word)) {
        if (rule.kind === "declares")
          for (const [property, value] of Object.entries(rule.declarations)) declarations.set(property, normalize(value));
        else if (rule.kind === "facet") declarations.set(rule.property, normalize(rule.value));
      }
      // theme-socket words (values behind var(--…)) are handled by the snap
      // path; a real page never contains those exact var() strings.
      if (!declarations.size || [...declarations.values()].some((value) => value.includes("var("))) continue;
      signatures.push({ word, declarations });
    }
  }
  // larger signatures first, so `horizontal` (display+flex-direction) is tried
  // before any single-declaration word could partially consume its pair.
  return signatures.sort((a, b) => b.declarations.size - a.declarations.size);
}

function parametricWord(declaration: Declaration): string | null {
  const value = normalize(declaration.value);
  if (declaration.property === "flex-grow" && /^\d+$/.test(value)) return `grow-${value}`;
  if (declaration.property === "flex-shrink" && /^\d+$/.test(value)) return `shrink-${value}`;
  if (declaration.property === "grid-column" && value === "1 / -1") return "span-all";
  const column = value.match(/^span (\d+)$/);
  if (declaration.property === "grid-column" && column) return `span-${column[1]}`;
  if (declaration.property === "grid-row" && column) return `row-span-${column[1]}`;
  return null;
}

// snap families: property → word prefix + scale. Whole-axis padding/margin
// shorthands split 1-value (uniform) and 2-value (block/inline) forms.
interface SnapScale { steps: { name: string; px: number }[] }
interface SnapRecord { selector: string; property: string; requested: string; requestedPx: number; word: string; snappedPx: number; residual: number }

async function loadScales(): Promise<{ spacing: SnapScale; size: SnapScale }> {
  const theme = await readFile(THEME, "utf8");
  const steps = (prefix: string, toPx: (n: number, unit: string) => number): { name: string; px: number }[] =>
    [...theme.matchAll(new RegExp(`--${prefix}-([a-z]+):\\s*([\\d.]+)(px|rem)`, "g"))]
      .map((m) => ({ name: m[1], px: toPx(Number(m[2]), m[3]) }));
  const toPx = (n: number, unit: string) => (unit === "rem" ? n * 16 : n); // rem→16px (standing assumption)
  return { spacing: { steps: steps("spacing", toPx) }, size: { steps: steps("size", toPx) } };
}

const lengthToPx = (value: string): number | null => {
  const m = normalize(value).match(/^(-?[\d.]+)(px|rem|em)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === "px" ? n : n * 16;
};

function snap(px: number, scale: SnapScale): { name: string; px: number } {
  return scale.steps.reduce((best, step) =>
    Math.abs(step.px - px) < Math.abs(best.px - px) ? step : best);
}

// ---------------------------------------------------------------------------
// Translation
// ---------------------------------------------------------------------------
interface Residual { selector: string; declaration: Declaration; category: string }

async function main(): Promise<void> {
  const css = await readFile(CORPUS_CSS, "utf8");
  const entries = parseCss(css);
  const scales = await loadScales();
  const signatures = buildExactSignatures();

  const spacingFamily: Record<string, string> = {
    gap: "gap", padding: "padding", margin: "margin",
    "padding-inline": "padding-inline", "padding-block": "padding-block",
    "margin-inline": "margin-inline", "margin-block": "margin-block",
    "margin-block-start": "flow",
  };
  const sizeFamily: Record<string, string> = {
    "flex-basis": "basis-exact",
    "min-width": "min-width", "max-width": "max-width",
    "min-height": "min-height", "max-height": "max-height",
  };

  const wordsBySelector = new Map<string, Set<string>>();
  const residuals: Residual[] = [];
  const snapRecords: SnapRecord[] = [];
  const categories = new Map<string, number>();
  let originalCount = 0;
  let translatedCount = 0;

  const residual = (selector: string, declaration: Declaration, category: string) => {
    residuals.push({ selector, declaration, category });
    categories.set(category, (categories.get(category) ?? 0) + 1);
  };
  const attach = (selector: string, word: string) =>
    (wordsBySelector.get(selector) ?? wordsBySelector.set(selector, new Set()).get(selector)!).add(word);

  const atBlocks: string[] = [];
  for (const entry of entries) {
    if (entry.kind === "at") {
      originalCount += entry.declarationCount;
      atBlocks.push(entry.raw);
      categories.set("at-rule block", (categories.get("at-rule block") ?? 0) + entry.declarationCount);
      continue;
    }

    originalCount += entry.declarations.length;

    // rules conditioned on pseudo-classes/elements would need state-scoped
    // emission; their declarations pass through untouched. Custom-property
    // declarations are categorized as such even there (`:root` theme blocks
    // dominate this page and are not a pseudo-state finding).
    if (entry.selector.includes(":")) {
      for (const declaration of entry.declarations) {
        residual(entry.selector, declaration,
          declaration.property.startsWith("--") ? "custom property" : "pseudo selector");
      }
      continue;
    }

    let remaining = [...entry.declarations];

    // 1. exact multi/single-declaration signatures (subset-consume, larger first)
    for (const signature of signatures) {
      const matched = [...signature.declarations].every(([property, value]) =>
        remaining.some((d) => d.property === property && normalize(d.value) === value));
      if (!matched) continue;
      attach(entry.selector, signature.word);
      translatedCount += signature.declarations.size;
      // consume exactly ONE declaration per signature pair (duplicates stay).
      for (const [property, value] of signature.declarations) {
        const at = remaining.findIndex((d) => d.property === property && normalize(d.value) === value);
        if (at !== -1) remaining.splice(at, 1);
      }
    }

    // 2. parametric + snap paths, per declaration
    const untranslated: Declaration[] = [];
    for (const declaration of remaining) {
      const parametric = parametricWord(declaration);
      if (parametric) {
        attach(entry.selector, parametric);
        translatedCount += 1;
        continue;
      }

      const spacingPrefix = spacingFamily[declaration.property];
      const sizePrefix = sizeFamily[declaration.property];
      if (spacingPrefix || sizePrefix) {
        const scale = spacingPrefix ? scales.spacing : scales.size;
        const prefix = spacingPrefix ?? sizePrefix!;
        const parts = normalize(declaration.value).split(" ");

        const snapOne = (part: string, wordPrefix: string): boolean => {
          const px = lengthToPx(part);
          if (px === null || px <= 0) return false;
          const step = snap(px, scale);
          attach(entry.selector, `${wordPrefix}-${step.name}`);
          snapRecords.push({
            selector: entry.selector, property: declaration.property, requested: part,
            requestedPx: px, word: `${wordPrefix}-${step.name}`, snappedPx: step.px, residual: px - step.px,
          });
          return true;
        };

        if (parts.length === 1) {
          const px = lengthToPx(parts[0]);
          if (px !== null && px === 0) { residual(entry.selector, declaration, "zero value (scale has no zero step)"); continue; }
          if (snapOne(parts[0], prefix)) { translatedCount += 1; continue; }
          residual(entry.selector, declaration, "non-length or negative value");
          continue;
        }
        if (parts.length === 2 && (declaration.property === "padding" || declaration.property === "margin")) {
          const blockOk = lengthToPx(parts[0]) !== null && lengthToPx(parts[0])! > 0;
          const inlineOk = lengthToPx(parts[1]) !== null && lengthToPx(parts[1])! > 0;
          if (blockOk && inlineOk) {
            snapOne(parts[0], `${declaration.property}-block`);
            snapOne(parts[1], `${declaration.property}-inline`);
            translatedCount += 1; // one declaration, two words
            continue;
          }
        }
        residual(entry.selector, declaration, "shorthand shape without inverse");
        continue;
      }

      untranslated.push(declaration);
    }

    for (const declaration of untranslated) {
      const category = declaration.property.startsWith("--") ? "custom property"
        : normalize(declaration.value).includes("var(") ? "value behind var()"
          : declaration.property === "display" ? "display without single-word inverse"
            : "property without emission inverse";
      residual(entry.selector, declaration, category);
    }
  }

  const atDeclarations = entries
    .filter((entry): entry is Extract<CssEntry, { kind: "at" }> => entry.kind === "at")
    .reduce((sum, entry) => sum + entry.declarationCount, 0);
  const residualCount = residuals.length + atDeclarations;

  // THE CONSERVATION GUARANTEE (C4 acceptance): nothing dropped, nothing coined.
  assert.equal(originalCount, translatedCount + residualCount,
    `conservation violated: ${originalCount} original !== ${translatedCount} translated + ${residualCount} residual`);

  // -------------------------------------------------------------------------
  // Attach words to the page, per matching element, in real Chromium.
  // -------------------------------------------------------------------------
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(new URL("original.html", HERE).href);

  let deadRules = 0;
  const attachments: { selector: string; words: string[]; matched: number }[] = [];
  for (const [selector, words] of wordsBySelector) {
    const matched = await page.evaluate(([sel, list]) => {
      let nodes: Element[] = [];
      try { nodes = [...document.querySelectorAll(sel as string)]; } catch { return -1; }
      for (const node of nodes) node.classList.add(...(list as string[]));
      return nodes.length;
    }, [selector, [...words]] as const);
    if (matched === 0) deadRules += 1;
    attachments.push({ selector, words: [...words], matched });
  }

  // per-element word strings: what buildStylesheet compiles (facet compounds
  // only exist per element), and what the linter judges.
  const elementWordStrings: string[] = await page.evaluate((allWords: string[]) => {
    const vocabulary = new Set(allWords);
    const strings = new Set<string>();
    for (const node of document.querySelectorAll("*")) {
      const words = [...node.classList].filter((cls) => vocabulary.has(cls));
      if (words.length) strings.add(words.sort().join(" "));
    }
    return [...strings];
  }, [...new Set([...wordsBySelector.values()].flatMap((set) => [...set]))]);

  const lintFindings = elementWordStrings
    .map((words) => ({ words, issues: lint(words).filter((issue) => issue.level === "error") }))
    .filter((entry) => entry.issues.length);

  const translatedBody = await page.evaluate(() => document.body.outerHTML);
  await browser.close();

  // -------------------------------------------------------------------------
  // Artifacts
  // -------------------------------------------------------------------------
  const ermineCss = buildStylesheet(elementWordStrings);
  await writeFile(new URL("ermine.generated.css", HERE), `/* Generated by analysis/translate.ts via src/css.ts — do not edit. */\n${ermineCss}`);

  const residualCss = [
    "/* residual.css — every declaration the translator could NOT map to a word,",
    "   passed through VERBATIM (C4: never drop, never coin). Loaded after the",
    "   grammar stylesheet so pass-throughs keep their original effect. */",
    "",
    ...[...groupBy(residuals, (r) => r.selector)].map(([selector, group]) =>
      `${selector} {\n${group.map((r) => `  ${r.declaration.raw};`).join("\n")}\n}`),
    "",
    "/* at-rule blocks, passed through whole: */",
    ...atBlocks,
  ].join("\n");
  await writeFile(new URL("residual.css", HERE), `${residualCss}\n`);

  const translatedHtml = `<!DOCTYPE html>
<!-- C4 translated page: original markup + grammar classes. Styling: the
     generated grammar CSS + the demo theme (scale values) + residual.css
     (verbatim pass-throughs). Generated by analysis/translate.ts. -->
<html>
<head>
<meta charset="utf-8">
<title>C4 translated — Playwright HTML report in Ermine words</title>
<link rel="stylesheet" href="ermine.generated.css">
<link rel="stylesheet" href="../../demo/theme.css">
<link rel="stylesheet" href="residual.css">
</head>
${translatedBody}
</html>
`;
  await writeFile(new URL("translated.html", HERE), translatedHtml);

  // side-by-side screenshots
  const shot = await chromium.launch({ args: ["--no-sandbox"] });
  const shotPage = await shot.newPage({ viewport: { width: 1200, height: 900 } });
  for (const name of ["original", "translated"]) {
    await shotPage.goto(new URL(`${name}.html`, HERE).href);
    await shotPage.screenshot({ path: fileURLToPath(new URL(`${name}.png`, HERE)), fullPage: true });
  }
  await shot.close();

  await writeFile(new URL("TRANSLATION-REPORT.md", HERE), renderReport());

  console.log(`original ${originalCount} = translated ${translatedCount} + residual ${residualCount}`);
  console.log(`translation rate: ${(100 * translatedCount / originalCount).toFixed(1)}%`);

  function topResidualProperties(): string {
    const counts = new Map<string, number>();
    for (const r of residuals.filter((r) => r.category === "property without emission inverse"))
      counts.set(r.declaration.property, (counts.get(r.declaration.property) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([property, count]) => `\`${property}\` (${count})`).join(" · ") || "—";
  }

  function renderReport(): string {
    const buckets: [string, (r: number) => boolean][] = [
      ["0px (exact)", (r) => r === 0],
      ["±1–2px", (r) => Math.abs(r) >= 1 && Math.abs(r) <= 2],
      ["±3–4px", (r) => Math.abs(r) >= 3 && Math.abs(r) <= 4],
      ["±5–8px", (r) => Math.abs(r) >= 5 && Math.abs(r) <= 8],
      ["±9–16px", (r) => Math.abs(r) >= 9 && Math.abs(r) <= 16],
      [">16px", (r) => Math.abs(r) > 16],
    ];
    const rate = (n: number) => `${(100 * n / originalCount).toFixed(1)}%`;
    return `# C4 translation report — one real page

**Page**: the Playwright HTML Report (rendered-DOM snapshot, provenance in
\`make-original.ts\`) — chosen as the C2 corpus target with the **highest layer-1
coverage: ${PAGE_COVERAGE}** (see \`analysis/FINDINGS-APPS.md\`).
Stylesheet: \`analysis/corpus/playwright-html-report/report.css\`.
Reproduce: \`npm run translate:original\` then \`npm run translate\`.

## 1. Translation rate

| | declarations | share |
|---|---:|---:|
| original (parsed) | ${originalCount} | 100% |
| translated to grammar words | ${translatedCount} | ${rate(translatedCount)} |
| passed through to residual.css | ${residualCount} | ${rate(residualCount)} |

Conservation is asserted in \`translate.ts\` (\`assert.equal(originalCount,
translatedCount + residualCount)\`): the translator never drops a declaration and
never coins a word (R2).

Words attached to the page: ${[...new Set([...wordsBySelector.values()].flatMap((s) => [...s]))].length} distinct across ${attachments.length} selectors
(${deadRules} selectors matched no element in this snapshot — their rules were
translated but style nothing on this page, on either side).

## 2. Residual histogram (snapped spacing/size values)

${snapRecords.length} declarations were snapped to the nearest scale step:

| residual | count |
|---|---:|
${buckets.map(([label, test]) => `| ${label} | ${snapRecords.filter((r) => test(r.residual)).length} |`).join("\n")}

Largest snaps: ${snapRecords.slice().sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual)).slice(0, 5)
  .map((r) => `\`${r.property}: ${r.requested}\` → \`${r.word}\` (${r.residual > 0 ? "+" : ""}${r.residual}px)`).join("; ") || "—"}.

## 3. Pass-through category breakdown

| category | declarations |
|---|---:|
${[...categories].sort((a, b) => b[1] - a[1]).map(([category, count]) => `| ${category} | ${count} |`).join("\n")}

Top properties inside "property without emission inverse" (the skin-shaped tail):
${topResidualProperties()}

## Findings

- **Lint check of the attached words**: ${lintFindings.length === 0
    ? "every element's attached word string lints clean — no P1 conflicts were produced by translation."
    : `${lintFindings.length} element word string(s) lint with errors — overlapping original rules mapped conflicting words onto one element:\n${lintFindings.map((f) => `  - \`${f.words}\`: ${f.issues.map((i) => i.rule).join(", ")}`).join("\n")}`}
- **Cascade fidelity is not reproduced, by design**: original specificity ordering
  collapses onto single-class word selectors plus residual.css loaded last. Visual
  differences from that collapse are data, not bugs (see the visual note).
- Screenshots: \`original.png\` / \`translated.png\` (1200px viewport, full page),
  regenerated on every run of \`npm run translate\`.
`;
  }
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) (map.get(key(item)) ?? map.set(key(item), []).get(key(item))!).push(item);
  return map;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
