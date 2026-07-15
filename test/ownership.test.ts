import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { deriveOwnership, emittableWords, renderOwnership } from "../src/derive-ownership.ts";
import { checkDimensionalPurity } from "../src/emit.ts";
import { parseWord } from "../src/lint.ts";

test("ownership generation enumerates valid words for every emitted axis", () => {
  const words = emittableWords();
  assert.equal(Object.keys(words).length, 50);
  for (const [axis, samples] of Object.entries(words)) {
    assert.ok(samples.length > 0, `${axis} has no emission samples`);
    for (const word of samples) assert.equal(parseWord(word).axis, axis, `${word} must resolve to ${axis}`);
  }
});

test("the committed ownership artifact exactly matches emission", async () => {
  const current = await readFile(new URL("../src/ownership.generated.json", import.meta.url), "utf8");
  assert.equal(current, renderOwnership());
  const ownership = deriveOwnership();
  assert.deepEqual(ownership.structure, ["display", "flex-direction", "grid-auto-flow"]);
  assert.deepEqual(ownership.constraints, ["max-height", "max-width", "min-height", "min-width"]);
  assert.deepEqual(ownership["state.focus"], []);
  assert.equal(Object.hasOwn(ownership, "skin-surface"), false);
  assert.equal(Object.hasOwn(ownership, "skin-type"), false);
});

test("P7 separates verified ownership from warned gap-axis fallbacks", () => {
  const report = checkDimensionalPurity();
  assert.deepEqual(report.violations, []);
  assert.deepEqual(report.unverifiedAxes, []);
  assert.deepEqual(report.ownership["rule-presence"], [
    "border-bottom-style", "border-bottom-width",
    "border-left-style", "border-left-width",
    "border-right-style", "border-right-width",
    "border-style",
    "border-top-style", "border-top-width",
    "border-width",
  ]);
  // selection-treatment is eventTriggered (R-STATE-09): its shared-property overlaps
  // with base skin are sanctioned overrides, not warned collisions.
  assert.deepEqual(
    report.warnings
      .filter((warning) => warning.rule === "unverified-overlap")
      .map((warning) => [warning.axis, warning.otherAxis, warning.property]),
    [],
  );
});
