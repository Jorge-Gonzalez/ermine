// registry.test.ts — registry-build invariants as assertions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRegistry } from "../engine/validate-registry.ts";
import { REGISTRY, checkTokenUniqueness, ENVIRONMENT_SCOPES, SCALES } from "../src/registry.ts";

test("P0: every closed/finite word resolves to exactly one axis", () => {
  const collisions = checkTokenUniqueness();
  assert.deepEqual(collisions, [], collisions.map((c) => `'${c.word}' → ${c.axes.join(", ")}`).join("; "));
});

test("axis ids are unique", () => {
  const ids = REGISTRY.map((a) => a.axis);
  assert.equal(new Set(ids).size, ids.length, "duplicate axis id");
});

test("validateRegistry accepts the Ermine registry", () => {
  const errors = validateRegistry({ records: REGISTRY, scopes: ENVIRONMENT_SCOPES, scales: SCALES });
  assert.deepEqual(errors, []);
});

// minimal well-formed record for corruption fixtures
const record = (axis: string, over: object = {}) => ({
  axis, sibling: "layout", role: "container", signature: "set-with-exclusivity",
  vocabulary: "closed", regime: "free", valueSpace: [axis + "-word"],
  tokens: [{ pattern: new RegExp(`^${axis}-word$`), shape: axis }],
  default: null, controls: [], mustNeverTouch: [], ...over,
});

test("validateRegistry reports structural registry problems", () => {
  const errors = validateRegistry({ records: [record("dup"), record("dup")] as never });
  assert.ok(errors.some((message) => message.includes("duplicate axis id: dup")));
});

test("validateRegistry catches P0-style cross-axis token shadowing", () => {
  // axis-b's broad token also matches axis-a's word — the parser would silently
  // resolve `sticky` to whichever axis is listed first (the historical bug class).
  const shadow = [
    record("a", { valueSpace: ["sticky"], tokens: [{ pattern: /^sticky$/, shape: "s" }] }),
    record("b", { valueSpace: ["stick-N"], tokens: [{ pattern: /^stick/, shape: "broad" }] }),
  ];
  const errors = validateRegistry({ records: shadow as never });
  assert.ok(errors.some((message) => message.includes("'sticky' matches tokens of multiple axes: a, b")));
});

test("validateRegistry checks alias expansions against the registry's own tokens", () => {
  const badAlias = [record("c", {
    vocabulary: "open",
    aliases: [{ word: "wide", expands: "nonexistent-word" }],
  })];
  const errors = validateRegistry({ records: badAlias as never });
  assert.ok(errors.some((message) => message.includes("alias 'wide' expands to unknown word 'nonexistent-word'")));
});

test("validateRegistry resolves <name>-step token domains against declared scales", () => {
  const scaleBound = [record("d", {
    tokens: [{ pattern: /^d-(tight|snug)$/, shape: "d-<density>", valueDomain: "density-step" }],
  })];
  // scales provided but missing the referenced one → error
  const missing = validateRegistry({ records: scaleBound as never, scales: {} });
  assert.ok(missing.some((message) => message.includes("references undeclared scale 'density'")));
  // scale declared → clean
  assert.deepEqual(validateRegistry({ records: scaleBound as never, scales: { density: ["tight", "snug"] } }), []);
  // bare-array input declares no scales at all → scale checks are skipped, not failed
  assert.deepEqual(validateRegistry(scaleBound as never), []);
});
