// emit.test.ts — the emitter walker + P7 dimensional purity as assertions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { emit, checkDimensionalPurity } from "../src/emit.ts";
import { deriveControls } from "../src/emitter-types.ts";

test("P7: no unsanctioned property collisions across covered axes", () => {
  const report = checkDimensionalPurity();
  assert.deepEqual(
    report.violations,
    [],
    report.violations.map((violation) => `${violation.property}: ${violation.axes.join(" ~ ")}`).join("; "),
  );
  assert.equal(report.verifiedAxes.length, 42);
  assert.deepEqual(report.unverifiedAxes, ["skin-type"]);
  assert.deepEqual(
    report.warnings.filter((warning) => warning.rule === "unverified-ownership").map((warning) => warning.axis),
    ["skin-type"],
  );
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

// value correctness for the mechanical axes (controls-fidelity checks property keys, not values).
const declOf = (cls: string) =>
  emit(cls).filter((r) => r.kind === "declares").flatMap((r) => Object.entries((r as { declarations: Record<string, string> }).declarations));

test("overflow whole-axis word writes BOTH longhands, never the shorthand", () => {
  assert.deepEqual(declOf("scroll-auto"), [["overflow-x", "auto"], ["overflow-y", "auto"]]);
  assert.deepEqual(declOf("scroll-x"), [["overflow-x", "scroll"]]);
});

test("alignment-container maps between/around to space-*", () => {
  assert.deepEqual(declOf("justify-between"), [["justify-content", "space-between"]]);
  assert.deepEqual(declOf("align-center"), [["align-items", "center"]]);
});

test("position-mode strips the grammar prefix", () => {
  assert.deepEqual(declOf("position-sticky"), [["position", "sticky"]]);
});

// K6 additions — the three axes completed from ruled mappings.

test("m5: span carries columns, row-span carries rows, span-all is contextual (R-M5-01)", () => {
  assert.deepEqual(declOf("span-3"), [["grid-column", "span 3"]]);
  assert.deepEqual(declOf("row-span-2"), [["grid-row", "span 2"]]);
  assert.deepEqual(declOf("span-all"), [["grid-column", "1 / -1"]]);
});

test("divider declares the native gap-decoration pair; the stroke is one theme socket (R-DIVIDER-01)", () => {
  assert.deepEqual(declOf("divided"), [["row-rule", "var(--divider-rule)"], ["column-rule", "var(--divider-rule)"]]);
  assert.deepEqual(declOf("undivided"), [["row-rule", "none"], ["column-rule", "none"]]);
});

test("z-scale steps read theme-owned numbers, never literal integers (R-LAYER-01/05)", () => {
  assert.deepEqual(declOf("raised"), [["z-index", "var(--z-raised)"]]);
  assert.deepEqual(declOf("tooltip"), [["z-index", "var(--z-tooltip)"]]);
});
