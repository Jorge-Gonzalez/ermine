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

test("validateRegistry reports structural registry problems", () => {
  const badRecords = [
    { axis: "dup", sibling: "layout", role: "container", signature: "set-with-exclusivity", vocabulary: "closed", regime: "free", valueSpace: ["alpha"], tokens: [{ pattern: /^alpha$/, shape: "alpha" }], default: null, controls: [], mustNeverTouch: [] },
    { axis: "dup", sibling: "layout", role: "container", signature: "set-with-exclusivity", vocabulary: "closed", regime: "free", valueSpace: ["beta"], tokens: [{ pattern: /^beta$/, shape: "beta" }], default: null, controls: [], mustNeverTouch: [] },
  ] as any;

  const errors = validateRegistry({ records: badRecords });
  assert.ok(errors.some((message) => message.includes("duplicate axis id: dup")));
});
