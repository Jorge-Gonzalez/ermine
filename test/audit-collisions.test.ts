// audit-collisions.test.ts — src/audits/collision-analysis.ts promoted to assertions.
// The audit classified the two predicate-4 collisions and proposed the fixes that were
// ratified as R-MOTION-03 (additive stagger) and R-M3-01 (basis-only self size). The
// script printed its verdicts for human eyeballs; these tests pin the same properties
// to the live registry and emitter so a regression re-opens loudly, not silently.
// (The audit script exports nothing and runs on import, so the assertions target the
// ratified system state rather than importing the exploration.)

import { test } from "node:test";
import assert from "node:assert/strict";
import { REGISTRY } from "../src/registry.ts";
import { emit, checkDimensionalPurity } from "../src/emit.ts";

const axis = (id: string) => {
  const rec = REGISTRY.find((a) => a.axis === id);
  assert.ok(rec, `axis ${id} must exist`);
  return rec!;
};

// --- Collision 1: transition-delay (motion-micro member vs motion-macro container) ---

test("collision 1: motion-macro owns --stagger, never raw transition-delay (R-MOTION-03)", () => {
  const macro = axis("motion-macro");
  assert.ok(!macro.controls.includes("transition-delay"), "macro must not raw-own transition-delay");
  assert.ok(macro.controls.includes("--stagger"), "macro's channel is the --stagger custom prop");
  assert.ok(macro.mustNeverTouch?.includes("transition-delay"), "the old overwrite channel is forbidden, not just unused");
});

test("collision 1: micro and macro control disjoint properties — the overwrite hazard is closed", () => {
  const micro = axis("motion-micro").controls;
  const macro = axis("motion-macro").controls;
  assert.deepEqual(micro.filter((p) => macro.includes(p)), []);
});

test("collision 1: the emitter composes stagger ADDITIVELY with the member's own delay", () => {
  // fix (a) from the audit: both values survive via calc, neither overwrites the other.
  const sink = emit("standard together").find((r) => r.kind === "reads");
  assert.ok(sink, "micro + macro co-occurrence must produce the stagger sink");
  assert.equal(
    (sink as { declarations: Record<string, string> }).declarations["transition-delay"],
    "calc(var(--own-delay,0ms) + var(--stagger,0ms))",
  );
});

test("collision 1 contrast: display IS a clean twin — same property, role-split facets", () => {
  // the audit's isCleanTwin: display resolves per-facet (inner/outer), so structure and
  // m1 sharing the name is sanctioned; transition-delay had no facet split, hence the fix above.
  const facets = emit("horizontal boxed").filter((r) => r.kind === "facet") as
    { axis: string; property: string; facet: string }[];
  assert.deepEqual(
    facets.map((f) => [f.axis, f.property, f.facet]),
    [["structure", "display", "inner"], ["m1-flow-participation", "display", "outer"]],
  );
});

// --- Collision 2: align-self (m3-self-size vs m4-self-alignment) ---

test("collision 2: m3 = flex-basis only; cross-axis stretch belongs to m4 (R-M3-01)", () => {
  const m3 = axis("m3-self-size");
  assert.deepEqual(m3.controls, ["flex-basis"], "m3's only size channel is flex-basis");
  assert.ok(m3.mustNeverTouch?.includes("align-self"), "align-self is forbidden to m3, not just absent");
  assert.ok(axis("m4-self-alignment").controls.includes("align-self"), "m4 owns align-self (R-M4-01)");
});

test("collision 2: m3 and m4 are property-disjoint after the fix", () => {
  const m3 = axis("m3-self-size").controls;
  const m4 = axis("m4-self-alignment").controls;
  assert.deepEqual(m3.filter((p) => m4.includes(p)), []);
});

test("neither collision survives in P7's global purity sweep", () => {
  const violations = checkDimensionalPurity();
  const touched = violations.filter((v) =>
    v.property === "transition-delay" || v.property === "align-self");
  assert.deepEqual(touched, []);
});
