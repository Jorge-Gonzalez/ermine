// tailwind-client.test.ts — B3 acceptance: the engine judges a Tailwind-subset
// vocabulary with zero special-casing. The three worked examples below are the
// ones clients/tailwind-subset/README.md documents verbatim — strings that
// tailwind-merge must resolve heuristically (source order) and the engine
// rejects with a reason instead.

import { test } from "node:test";
import assert from "node:assert/strict";

import { createLinter, validateRegistry } from "../engine/index.ts";
import { TAILWIND_SUBSET, TW_RECORDS, TW_SCOPES } from "../clients/tailwind-subset/registry.ts";

const tw = createLinter(TW_RECORDS, TW_SCOPES);
const rulesOf = (s: string) => tw.lint(s).map((i) => i.rule);

test("the subset registry is structurally well-formed", () => {
  assert.deepEqual(validateRegistry(TAILWIND_SUBSET), []);
});

test("worked example 1: `flex-row flex-col` — one axis, two words", () => {
  const issues = tw.lint("flex-row flex-col");
  assert.deepEqual(issues.map((i) => i.rule), ["one-word-per-axis"]);
  assert.match(issues[0].msg, /'flex-row', 'flex-col' conflict — all axis 'flex-direction' in scope 'base'/);
});

test("worked example 2: `sm:gap-2 sm:gap-4` — same axis, same scope", () => {
  const issues = tw.lint("sm:gap-2 sm:gap-4");
  assert.deepEqual(issues.map((i) => i.rule), ["one-word-per-axis"]);
  assert.match(issues[0].msg, /in scope 'sm'/);
  // the scoped contrast: different scopes compose lawfully — in BOTH vocabularies.
  assert.deepEqual(tw.lint("gap-2 sm:gap-4"), []);
});

test("worked example 3: `p-4 p-2` — two whole-axis padding values", () => {
  const issues = tw.lint("p-4 p-2");
  assert.deepEqual(issues.map((i) => i.rule), ["one-word-per-axis"]);
  assert.match(issues[0].msg, /'p-4' is a whole-axis value \(it fixes every dial of 'padding'\)/);
});

test("the thesis divergence: `p-4 px-2` is legal Tailwind, reasoned rejection here", () => {
  const issues = tw.lint("p-4 px-2");
  assert.deepEqual(issues.map((i) => i.rule), ["one-word-per-axis"]);
  assert.match(issues[0].msg, /whole-axis value .* cannot combine with 'px-2'/);
  // and the dial algebra it protects: two different dials compose, one dial twice conflicts.
  assert.deepEqual(tw.lint("px-2 py-6"), []);
  assert.deepEqual(rulesOf("px-2 px-4"), ["one-word-per-axis"]);
});

test("off-scale values get the more specific P3 diagnosis, not unknown-word", () => {
  assert.deepEqual(rulesOf("gap-13"), ["bad-parameter"]);
  assert.deepEqual(rulesOf("w-huge"), ["bad-parameter"]);
});

test("a well-formed utility string lints clean", () => {
  assert.deepEqual(tw.lint("flex flex-col gap-4 px-2 py-6 w-full md:gap-6"), []);
});
