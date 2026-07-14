import { test } from "node:test";
import assert from "node:assert/strict";

import { orderParagraph, formatParagraphDerivation } from "../src/format-paragraph.ts";
import { REGISTRY } from "../src/registry.ts";

const corpus = [
  "settings-view vertical scroll-auto",
  "btn pressable padding-block-sm padding-inline-lg corner-md font-md font-medium focus:ring active:ground-accent active:ink-inverse disabled:ground-subtle disabled:ink-soft ground ink ruled rule hover:ground-defined",
  "macro-suggestions-command-item pressable compressible min-width-none text-center ground-subtle ink rule-soft ruled corner-md hidden truncate font-sm selectable hover:ground-defined hover:rule selected:ground-defined selected:ink-accent selected:rule-accent",
  "seg-option pressable text-center elastic basis-ratio padding-block-xs padding-inline-md position-relative font-sm ink-soft rule ruled-right selectable hover:ground-defined hover:ink checked:ground-accent checked:ink-inverse",
  "editor-form position-relative elastic basis-ratio vertical gap-md min-height-none",
  "content-editor-body padding-md ink font-md corner-lg rule ruled scroll-auto focus:rule-accent focus:ring",
  "modal-nav-tab panel-button pressable font-md font-medium horizontal align-center justify-center gap-sm ink-soft hover:ground-subtle hover:ink current:ink-accent current:ground-subtle",
  "search-item-edit pressable position-absolute horizontal align-center justify-center padding-xs ink-soft corner-sm hover:ground-defined hover:ink-accent concealed parent-hover:revealed parent-selected:revealed",
  "popup-section horizontal align-center justify-between padding-sm ground-subtle rule corner-md ruled",
  "selectable grid parent-hover:ground-defined hover:ground-subtle selected:ink-accent",
];

function sortedTokens(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean).sort();
}

test("orderParagraph is idempotent over real paragraphs", () => {
  for (const paragraph of corpus) {
    const ordered = orderParagraph(paragraph);
    assert.equal(orderParagraph(ordered), ordered, paragraph);
  }
});

test("orderParagraph preserves the token multiset", () => {
  for (const paragraph of corpus) {
    assert.deepEqual(sortedTokens(orderParagraph(paragraph)), sortedTokens(paragraph), paragraph);
  }
});

test("identity tokens stay first in their original relative order", () => {
  assert.equal(orderParagraph("ink foo-hook horizontal bar-hook"), "foo-hook bar-hook horizontal ink");
});

test("scoped words group after base words by derived scope order", () => {
  assert.equal(
    orderParagraph("parent-hover:ground-defined selected:ink-accent hover:ground-subtle ink horizontal"),
    "horizontal ink hover:ground-subtle selected:ink-accent parent-hover:ground-defined",
  );
});

test("rank derivation covers the registry structurally", () => {
  assert.equal(formatParagraphDerivation.axisCount, REGISTRY.length);
  assert.equal(formatParagraphDerivation.registryCount, REGISTRY.length);
});
