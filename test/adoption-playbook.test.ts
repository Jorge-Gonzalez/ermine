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

test("playbook recognizes control-state recipes without swallowing ordinary button skin", () => {
  const disabledMatches = matchPlaybookRecipes(record({
    file: "src/styles/skin/controls.css",
    selector: ".btn:disabled:hover",
    property: "opacity",
    value: "0.6",
    code: "recipe-identity",
  })).map((recipe) => recipe.id);
  const guardMatches = matchPlaybookRecipes(record({
    file: "src/styles/skin/controls.css",
    selector: ".min-selected-1 > .is-selected:only-of-type",
    property: "cursor",
    value: "not-allowed",
    code: "opacity-followup",
  })).map((recipe) => recipe.id);
  const surfaceMatches = matchPlaybookRecipes(record({
    file: "src/styles/skin/controls.css",
    selector: ".btn-success:hover",
    property: "background-color",
    value: "color-mix(in oklch, var(--status-success) 82%, var(--shadow-color))",
    code: "recipe-identity",
  })).map((recipe) => recipe.id);

  assert.ok(disabledMatches.includes("control-state-recipe-boundary"));
  assert.ok(guardMatches.includes("control-state-recipe-boundary"));
  assert.equal(surfaceMatches.includes("control-state-recipe-boundary"), false);
});

test("playbook names private drawing sub-boundaries", () => {
  const keycapMatches = matchPlaybookRecipes(record({
    selector: ".macro-search-kbd::after",
    property: "inset",
    value: "0 2px 4px",
    code: "pseudo-mechanics",
  })).map((recipe) => recipe.id);
  const arrowMatches = matchPlaybookRecipes(record({
    selector: ".macro-suggestions-arrow.bottom",
    property: "border-bottom-color",
    value: "var(--base-tone)",
    code: "pseudo-mechanics",
  })).map((recipe) => recipe.id);
  const pillMatches = matchPlaybookRecipes(record({
    selector: ".seg-control::before",
    property: "left",
    value: "var(--pill-left, 0)",
    code: "pseudo-mechanics",
  })).map((recipe) => recipe.id);
  const scrollbarMatches = matchPlaybookRecipes(record({
    selector: "::-webkit-scrollbar-thumb",
    property: "background",
    value: "var(--tone) !important",
    code: "scrollbar-followup",
  })).map((recipe) => recipe.id);
  const placeholderMatches = matchPlaybookRecipes(record({
    selector: ".content-editor-body:empty::before",
    property: "content",
    value: "attr(data-placeholder)",
    code: "pseudo-mechanics",
  })).map((recipe) => recipe.id);

  assert.ok(keycapMatches.includes("keycap-drawing-boundary"));
  assert.ok(keycapMatches.includes("pseudo-drawing-boundary"));
  assert.ok(arrowMatches.includes("callout-arrow-boundary"));
  assert.ok(pillMatches.includes("segmented-pill-boundary"));
  assert.ok(scrollbarMatches.includes("engine-scrollbar-boundary"));
  assert.ok(placeholderMatches.includes("generated-placeholder-boundary"));
});
