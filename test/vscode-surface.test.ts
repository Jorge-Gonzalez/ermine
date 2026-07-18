// D4 acceptance: editor data is assembled from the registry and generated
// guide prose, while attribute detection keeps D3's conservative boundary.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { classAttributeContextAt } from "../surfaces/vscode/attributes.ts";
import type { CompletionData, CompletionEntry, HoverData } from "../surfaces/vscode/data.ts";
import { explainClassParagraphGraphHtml, explainClassParagraphMarkdown } from "../surfaces/vscode/explain.ts";
import { renderData } from "../surfaces/vscode/generate-data.ts";
import { parseAndNormalizeCombines } from "../src/combines.ts";

const guide = await readFile(new URL("../src/ERMINE-GUIDE.md", import.meta.url), "utf8");
const generatedCompletions = JSON.parse(await readFile(
  new URL("../surfaces/vscode/completions.generated.json", import.meta.url),
  "utf8",
)) as CompletionData;
const generatedHovers = JSON.parse(await readFile(
  new URL("../surfaces/vscode/hovers.generated.json", import.meta.url),
  "utf8",
)) as HoverData;

function completion(data: CompletionData, label: string): CompletionEntry | undefined {
  return data.axes.flatMap((axis) => axis.items).find((item) => item.label === label);
}

test("editor JSON reproduces exactly from registry and guide", () => {
  const rendered = renderData(guide);
  assert.deepEqual(rendered.completions, generatedCompletions);
  assert.deepEqual(rendered.hovers, generatedHovers);
});

test("closed words and parametric shapes carry generated meanings and snippets", () => {
  assert.deepEqual(completion(generatedCompletions, "horizontal"), {
    label: "horizontal",
    insertText: "horizontal",
    kind: "word",
    meaning: "a row",
  });
  assert.equal(completion(generatedCompletions, "sorted-ascending")?.kind, "word");
  assert.equal(completion(generatedCompletions, "basis-exact-sm")?.kind, "word");
  assert.equal(completion(generatedCompletions, "grow-N")?.insertText, "grow-${1:1}");
  assert.equal(completion(generatedCompletions, "span-N")?.insertText, "span-${1:1}");
  assert.match(completion(generatedCompletions, "min-width-<size>")?.insertText ?? "", /^min-width-\$\{1\|.*sm.*\|}$/);

  assert.deepEqual(generatedHovers.words.horizontal, {
    axis: "structure",
    meaning: "a row",
    reference: "src/ERMINE-SPEC.md §2.1 — structure",
  });
  assert.ok(generatedHovers.scopes.some((pattern) => new RegExp(pattern).test("hover")));
  assert.equal(generatedHovers.words.elastic.meaning, "both grows and shrinks");
  assert.ok(generatedHovers.patterns.some((entry) => new RegExp(entry.pattern).test("grow-42")));
});

test("paragraph review renders core explanation, emissions, and lint diagnostics", () => {
  const markdown = explainClassParagraphMarkdown("horizontal vertical hover:ground-defined project-token");
  assert.match(markdown, /^# Ermine Class Paragraph/);
  assert.match(markdown, /`project\\-token`/);
  assert.match(markdown, /`structure`/);
  assert.match(markdown, /`skin\\-ground`/);
  assert.match(markdown, /display\.inner: flex/);
  assert.match(markdown, /ERROR unknown-word/);
  assert.match(markdown, /ERROR one-word-per-axis/);
});

test("paragraph review explains combines from the project combine source", () => {
  const combines = parseAndNormalizeCombines(`
    combine option-chip: [
      selectable padding-inline-sm ground-subtle pressable
    ]
  `);
  const markdown = explainClassParagraphMarkdown("option-chip selected:ink-accent", {
    combines,
    combineSource: "ermine.combines",
  });
  assert.match(markdown, /Combine source: `ermine\\.combines`/);
  assert.match(markdown, /Normalized visible: `option\\-chip selected:ink\\-accent`/);
  assert.match(markdown, /Expanded: `padding\\-inline\\-sm selectable ground\\-subtle pressable selected:ink\\-accent`/);
  assert.match(markdown, /\| `option\\-chip` \| combine \| \(combine\) \|/);
  assert.match(markdown, /\| `padding\\-inline\\-sm` \| combine `option\\-chip` \| base \| `padding`/);
  assert.match(markdown, /`option\\-chip` -> `padding-inline:/);
});

test("paragraph graph renders typed nodes and edges without script", () => {
  const combines = parseAndNormalizeCombines(`
    combine option-chip: [
      selectable padding-inline-sm ground-subtle pressable
    ]
  `);
  const html = explainClassParagraphGraphHtml("option-chip selected:ink-accent", {
    combines,
    combineSource: "ermine.combines",
  });
  assert.match(html, /<title>Ermine Class Paragraph Graph<\/title>/);
  assert.match(html, /data-kind="combine"/);
  assert.match(html, />option-chip</);
  assert.match(html, />padding-inline-sm</);
  assert.match(html, />padding-inline</);
  assert.match(html, />expands</);
  assert.doesNotMatch(html, /<script/i);
});

test("attribute context accepts only D3's literal class forms", () => {
  const html = '<main class="horizontal gap-c">';
  const htmlContext = classAttributeContextAt(html, html.indexOf("gap-c") + "gap-c".length);
  assert.equal(htmlContext?.word, "gap-c");

  const jsx = "<main className='vertical'>";
  assert.equal(classAttributeContextAt(jsx, jsx.indexOf("vertical") + 2)?.word, "vertical");

  const template = "<main className={`horizontal`}>";
  assert.equal(classAttributeContextAt(template, template.indexOf("horizontal") + 2)?.word, "horizontal");

  const dynamic = "<main className={`gap-${size}`}>";
  assert.equal(classAttributeContextAt(dynamic, dynamic.indexOf("gap-")), null);
  assert.equal(classAttributeContextAt("const value = 'horizontal'", 17), null);
});
