// registry.test.ts — registry-build invariants as assertions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { REGISTRY, checkTokenUniqueness } from "../src/registry.ts";

test("P0: every closed/finite word resolves to exactly one axis", () => {
  const collisions = checkTokenUniqueness();
  assert.deepEqual(collisions, [], collisions.map((c) => `'${c.word}' → ${c.axes.join(", ")}`).join("; "));
});

test("axis ids are unique", () => {
  const ids = REGISTRY.map((a) => a.axis);
  assert.equal(new Set(ids).size, ids.length, "duplicate axis id");
});
