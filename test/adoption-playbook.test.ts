import assert from "node:assert/strict";
import { test } from "node:test";

import { matchPlaybookRecipes } from "../adoption/playbook.ts";
import type { CurrentRecord } from "../adoption/current-ledger.ts";

function record(partial: Partial<CurrentRecord>): CurrentRecord {
  return {
    id: "fixture",
    file: "src/styles.css",
    line: 1,
    selector: ".fixture",
    property: "padding",
    value: "0",
    code: "identity-geometry",
    ...partial,
  };
}

test("playbook recognizes element-owned zero spacing as a mechanical conversion", () => {
  const matches = matchPlaybookRecipes(record({
    selector: ".settings-prefix-btn",
    property: "padding",
    value: "0",
  })).map((recipe) => recipe.id);

  assert.ok(matches.includes("spacing-none-endpoints"));
  assert.equal(matches.includes("root-and-structural-reset-boundary"), false);
});

test("playbook keeps root and structural zero spacing in the boundary memory", () => {
  const rootMatches = matchPlaybookRecipes(record({
    selector: "body",
    property: "margin",
    value: "0",
  })).map((recipe) => recipe.id);
  const structuralMatches = matchPlaybookRecipes(record({
    selector: ".macro-search-kbd:first-child",
    property: "margin-left",
    value: "0",
  })).map((recipe) => recipe.id);

  assert.equal(rootMatches.includes("spacing-none-endpoints"), false);
  assert.ok(rootMatches.includes("root-and-structural-reset-boundary"));
  assert.equal(structuralMatches.includes("spacing-none-endpoints"), false);
  assert.ok(structuralMatches.includes("root-and-structural-reset-boundary"));
});

test("playbook recognizes pseudo drawing and authored-content substrate boundaries", () => {
  assert.ok(matchPlaybookRecipes(record({
    selector: ".macro-search-kbd::after",
    property: "content",
    value: "''",
    code: "pseudo-mechanics",
  })).some((recipe) => recipe.id === "pseudo-drawing-boundary"));

  assert.ok(matchPlaybookRecipes(record({
    selector: ".content-editor-body h1",
    property: "margin",
    value: "0.75em 0 0.4em",
    code: "user-content",
  })).some((recipe) => recipe.id === "authored-content-substrate-boundary"));
});

test("playbook keeps authored-content scale tokens out of flat migration recipes", () => {
  const matches = matchPlaybookRecipes(record({
    selector: ".content-editor-body blockquote",
    property: "padding-left",
    value: "var(--spacing-md)",
    code: "user-content",
  })).map((recipe) => recipe.id);

  assert.equal(matches.includes("existing-scale-word"), false);
  assert.equal(matches.includes("spacing-edge-decomposition"), false);
  assert.ok(matches.includes("authored-content-substrate-boundary"));
});
