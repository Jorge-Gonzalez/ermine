// emit.test.ts — the emitter walker + P7 dimensional purity as assertions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { emit, checkDimensionalPurity } from "../src/emit.ts";
import { buildStylesheet } from "../src/css.ts";
import { deriveControls } from "../src/emitter-types.ts";

test("P7: no unsanctioned property collisions across covered axes", () => {
  const report = checkDimensionalPurity();
  assert.deepEqual(
    report.violations,
    [],
    report.violations.map((violation) => `${violation.property}: ${violation.axes.join(" ~ ")}`).join("; "),
  );
  assert.equal(report.verifiedAxes.length, 56);
  assert.deepEqual(report.unverifiedAxes, []);
  assert.deepEqual(
    report.warnings.filter((warning) => warning.rule === "unverified-ownership").map((warning) => warning.axis),
    [],
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

test("grid-fit: grid with one fit-content track and one fill track (R-STRUCTURE-02)", () => {
  assert.deepEqual(declOf("grid-fit-sm"), [
    ["grid-auto-flow", "row"],
    ["grid-template-columns", "fit-content(var(--size-sm)) 1fr"],
  ]);
  const { paints } = deriveControls(emit("grid-fit-sm"));
  assert.ok(paints["structure"]?.has("display"), "grid-fit-sm → display:grid facet");
});

test("overflow whole-axis word writes BOTH longhands, never the shorthand", () => {
  assert.deepEqual(declOf("scroll-auto"), [["overflow-x", "auto"], ["overflow-y", "auto"]]);
  assert.deepEqual(declOf("scroll-x"), [["overflow-x", "scroll"]]);
});

test("alignment-container maps between/around to space-*", () => {
  assert.deepEqual(declOf("justify-between"), [["justify-content", "space-between"]]);
  assert.deepEqual(declOf("align-center"), [["align-items", "center"]]);
  assert.deepEqual(declOf("justify-end"), [["justify-content", "flex-end"]]);
  assert.deepEqual(declOf("align-start"), [["align-items", "flex-start"]]);
});

test("position-mode strips the grammar prefix", () => {
  assert.deepEqual(declOf("position-sticky"), [["position", "sticky"]]);
});

test("truncation: `truncate` is single-line ellipsis; `clamp-N` is the N-line -webkit-box clamp (R-SKIN-12)", () => {
  assert.deepEqual(declOf("truncate"), [["text-overflow", "ellipsis"], ["white-space", "nowrap"]]);
  assert.deepEqual(declOf("clamp-3"), [["display", "-webkit-box"], ["-webkit-box-orient", "vertical"], ["-webkit-line-clamp", "3"]]);
  assert.deepEqual(declOf("text-nowrap"), [["white-space", "nowrap"]]);
  assert.deepEqual(declOf("text-pre-wrap"), [["white-space", "pre-wrap"]]);
});

test("fill: whole-axis sets both, dials write one logical size each (R-SIZE-01)", () => {
  assert.deepEqual(declOf("fill"), [["inline-size", "100%"], ["block-size", "100%"]]);
  assert.deepEqual(declOf("fill-inline"), [["inline-size", "100%"]]);
  assert.deepEqual(declOf("fill-block"), [["block-size", "100%"]]);
});

test("role-size words emit measured dialog, popover, control, and endpoint dimensions (R-SIZE-11)", () => {
  assert.deepEqual(declOf("dialog-measure"), [
    ["width", "min(var(--measure-dialog-inline), calc(100vw - var(--measure-dialog-gutter)))"],
    ["height", "min(var(--measure-dialog-block), var(--measure-dialog-max-block))"],
  ]);
  assert.deepEqual(declOf("width-popover-lg"), [["width", "var(--measure-popover-lg)"]]);
  assert.deepEqual(declOf("control-box-lg"), [["width", "var(--control-size-lg)"], ["height", "var(--control-size-lg)"]]);
  assert.deepEqual(declOf("control-inline-md"), [["width", "var(--control-size-md)"]]);
  assert.deepEqual(declOf("control-block-sm"), [["height", "var(--control-size-sm)"]]);
  assert.deepEqual(declOf("separator-mark-xs"), [["width", "var(--rule-weight, 1px)"], ["height", "var(--control-size-xs)"]]);
  assert.deepEqual(declOf("width-auto"), [["width", "auto"]]);
  assert.deepEqual(declOf("height-none"), [["height", "0"]]);
});

test("role-bound constraints emit measured min/max sockets (R-SIZE-11)", () => {
  assert.deepEqual(declOf("min-width-popover-sm"), [["min-width", "var(--measure-popover-sm)"]]);
  assert.deepEqual(declOf("max-width-command"), [["max-width", "var(--measure-command-inline)"]]);
  assert.deepEqual(declOf("min-height-control-3xl"), [["min-height", "var(--control-size-3xl)"]]);
  assert.deepEqual(declOf("min-height-editor"), [["min-height", "var(--measure-editor-min-block)"]]);
  assert.deepEqual(declOf("max-height-results-md"), [["max-height", "var(--measure-results-md)"]]);
});

test("hug-inline: inline size follows content without a spacing socket (R-SIZE-05)", () => {
  assert.deepEqual(declOf("hug-inline"), [["inline-size", "fit-content"]]);
});

test("aspect: `square` is a 1:1 ratio (R-SIZE-02)", () => {
  assert.deepEqual(declOf("square"), [["aspect-ratio", "1"]]);
});

test("viewport-fill: `fill-viewport` is a block-axis viewport minimum (R-SIZE-08)", () => {
  assert.deepEqual(declOf("fill-viewport"), [["min-block-size", "100vh"]]);
});

test("type roles: tabular figures and the overline eyebrow (R-SKIN-18/19)", () => {
  assert.deepEqual(declOf("tabular"), [["font-variant-numeric", "tabular-nums"]]);
  assert.deepEqual(declOf("overline"), [["text-transform", "uppercase"], ["letter-spacing", "var(--overline-tracking, 0.07em)"]]);
});

test("tween: open state-change envelope uses duration sockets and composes with easing (R-MOTION-08)", () => {
  assert.deepEqual(declOf("tween-quick"), [
    ["transition-property", "all"],
    ["transition-duration", "var(--duration-quick)"],
  ]);
  assert.deepEqual(declOf("tween-rule-quick"), [
    ["transition-property", "border-color"],
    ["transition-duration", "var(--duration-quick)"],
  ]);
  assert.deepEqual(declOf("tween-opacity-ground-ink-quick"), [
    ["transition-property", "opacity, background-color, color"],
    ["transition-duration", "var(--duration-quick)"],
  ]);
  assert.deepEqual(declOf("tween-settled emphasized"), [
    ["transition-property", "all"],
    ["transition-duration", "var(--duration-settled)"],
    ["transition-timing-function", "cubic-bezier(.2,0,0,1)"],
  ]);
});

test("effect atoms: `shake` is a closed tween — one `animation` referencing substrate keyframes (R-MOTION-07)", () => {
  assert.deepEqual(declOf("shake"), [["animation", "shake 0.4s cubic-bezier(.36,.07,.19,.97) both"]]);
});

test("effect keyframes ship as a prelude only when the atom is used, deduped", () => {
  const withAtom = buildStylesheet(["shake", "shake gap-md"]);
  assert.match(withAtom, /@keyframes shake\s*\{/);
  assert.equal(withAtom.match(/@keyframes shake/g)?.length, 1, "keyframes deduped across elements");
  assert.doesNotMatch(buildStylesheet(["gap-md"]), /@keyframes/);
});

test("subgrid inherits parent tracks (R-STRUCTURE-04)", () => {
  assert.deepEqual(declOf("subgrid"), [["grid-auto-flow", "row"], ["grid-template-columns", "subgrid"]]);
});

test("columns-12 grid + intent-proportions compile to spans over 12 (R-STRUCTURE-03/R-M5-02)", () => {
  assert.deepEqual(declOf("columns-12"), [["grid-auto-flow", "row"], ["grid-template-columns", "repeat(12, 1fr)"]]);
  assert.deepEqual(declOf("quarter"), [["grid-column", "span 3"]]);
  assert.deepEqual(declOf("three-quarters"), [["grid-column", "span 9"]]);
  assert.deepEqual(declOf("third"), [["grid-column", "span 4"]]);
  assert.deepEqual(declOf("two-thirds"), [["grid-column", "span 8"]]);
  assert.deepEqual(declOf("half"), [["grid-column", "span 6"]]);
  assert.deepEqual(declOf("sixth"), [["grid-column", "span 2"]]);
});

test("cover: attaches a positioned element to all containing-block edges (R-SIZE-03)", () => {
  assert.deepEqual(declOf("cover"), [["inset", "0"]]);
});

test("positioned relations: center and edge attachment compile to physical offsets", () => {
  assert.deepEqual(declOf("center-x"), [["left", "50%"], ["transform", "translateX(-50%)"]]);
  assert.deepEqual(declOf("center-y"), [["top", "50%"], ["transform", "translateY(-50%)"]]);
  assert.deepEqual(declOf("attach-below"), [["top", "100%"]]);
  assert.deepEqual(declOf("attach-above"), [["bottom", "100%"]]);
  assert.deepEqual(declOf("stretch-inline"), [["left", "0"], ["right", "0"]]);
  assert.deepEqual(declOf("attach-below stretch-inline"), [["top", "100%"], ["left", "0"], ["right", "0"]]);
});

test("flow centering: decomposes margin:0 auto into centering and block flush (R-SIZE-07)", () => {
  assert.deepEqual(declOf("centered"), [["margin-inline", "auto"]]);
  assert.deepEqual(declOf("flush-block"), [["margin-block", "0"]]);
  assert.deepEqual(declOf("centered flush-block"), [["margin-inline", "auto"], ["margin-block", "0"]]);
});

test("per-edge spacing facets emit physical longhands", () => {
  assert.deepEqual(declOf("padding-left-xs"), [["padding-left", "var(--spacing-xs)"]]);
  assert.deepEqual(declOf("padding-bottom-xl"), [["padding-bottom", "var(--spacing-xl)"]]);
  assert.deepEqual(declOf("margin-left-sm"), [["margin-left", "var(--spacing-sm)"]]);
  assert.deepEqual(declOf("margin-right-xl"), [["margin-right", "var(--spacing-xl)"]]);
});

test("side corner facets emit paired physical corner longhands", () => {
  assert.deepEqual(declOf("corner-bottom-md"), [
    ["border-bottom-right-radius", "var(--radius-md)"],
    ["border-bottom-left-radius", "var(--radius-md)"],
  ]);
  assert.deepEqual(declOf("corner-top-none"), [
    ["border-top-left-radius", "0"],
    ["border-top-right-radius", "0"],
  ]);
});

test("push: consumes inline-start free space with auto margin (R-SIZE-04)", () => {
  assert.deepEqual(declOf("push"), [["margin-inline-start", "auto"]]);
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
