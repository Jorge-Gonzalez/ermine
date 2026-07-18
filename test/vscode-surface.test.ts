// D4 acceptance: editor data is assembled from the registry and generated
// guide prose, while attribute detection keeps D3's conservative boundary.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { classAttributeContextAt } from "../surfaces/vscode/attributes.ts";
import type { CompletionData, CompletionEntry, HoverData } from "../surfaces/vscode/data.ts";
import { explainClassParagraphMarkdown } from "../surfaces/vscode/explain.ts";
import { renderData } from "../surfaces/vscode/generate-data.ts";

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
