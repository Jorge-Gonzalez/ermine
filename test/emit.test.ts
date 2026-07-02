// emit.test.ts — the emitter walker + P7 dimensional purity as assertions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { emit, checkDimensionalPurity } from "../src/emit.ts";
import { deriveControls } from "../src/emitter-types.ts";

test("P7: no unsanctioned property collisions across covered axes", () => {
  const violations = checkDimensionalPurity();
  assert.deepEqual(violations, [], violations.map((v) => `${v.property}: ${v.axes.join(" ~ ")}`).join("; "));
});

test("structure no longer paints flex-wrap (rows retired)", () => {
  const { paints } = deriveControls(["horizontal", "vertical", "grid"].flatMap((w) => emit(w)));
  assert.ok(!paints["structure"]?.has("flex-wrap"), "structure must not own flex-wrap after `rows` removal");
});

test("`horizontal wrap-allowed` reproduces what `rows` used to emit", () => {
  const { paints } = deriveControls(emit("horizontal wrap-allowed"));
  assert.ok(paints["structure"]?.has("flex-direction"), "horizontal → flex-direction");
  assert.ok(paints["structure"]?.has("display"), "horizontal → display (facet)");
  assert.ok(paints["wrapping"]?.has("flex-wrap"), "wrap-allowed → flex-wrap, owned by wrapping");
});

test("the selection sink fires only when its three words co-occur", () => {
  const withSink = emit("selectable selected selection-subtle").filter((r) => r.kind === "reads");
  assert.equal(withSink.length, 1, "sink should fire on full co-presence");
  const withoutSink = emit("selectable selection-subtle").filter((r) => r.kind === "reads");
  assert.equal(withoutSink.length, 0, "sink must not fire when `selected` is absent");
});
