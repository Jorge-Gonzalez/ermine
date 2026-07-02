// controls-fidelity.test.ts — check (A) from the readiness probe, committed.
//
// The registry's hand-written `controls` list is the ownership face for ALL 33 axes;
// the emitter proves out real CSS for the covered subset. This gate asserts the two
// don't contradict where they overlap: every real property an axis EMITS must appear
// in that axis's declared `controls`. That's the drift the CSS-generation phase must
// not carry — a `controls` list that under-claims what the code actually paints.
//
// It also reports coverage (how many axes have an executable emission path) so the
// "checked vs asserted" ratio is visible, not buried.

import { test } from "node:test";
import assert from "node:assert/strict";
import { REGISTRY } from "../src/registry.ts";
import { emit, VOCABULARY } from "../src/emit.ts";
import { deriveControls } from "../src/emitter-types.ts";

// registry uses "display.inner"/"display.outer" facets for the `display` property.
const norm = (p: string) => p.replace(/^display\..*/, "display");

test("coverage report (informational): emission path per axis", () => {
  const total = REGISTRY.length;
  const covered = REGISTRY.filter((a) => a.axis in VOCABULARY).length;
  const stateAxes = REGISTRY.filter((a) => a.sibling === "state").length; // handled generically
  console.log(`   coverage: ${covered}/${total} axes have an executable emission path ` +
    `(+${stateAxes} state axes handled as conditions); ${total - covered - stateAxes} non-state axes remain controls-list-only.`);
  assert.ok(covered > 0);
});

test("every VOCABULARY axis exists in the registry", () => {
  for (const axis of Object.keys(VOCABULARY))
    assert.ok(REGISTRY.some((a) => a.axis === axis), `emission vocabulary references unknown axis '${axis}'`);
});

test("controls fidelity: no axis emits a real property its own `controls` omits", () => {
  const disagreements: string[] = [];
  for (const [axis, words] of Object.entries(VOCABULARY)) {
    const rec = REGISTRY.find((a) => a.axis === axis)!;
    const declared = new Set(rec.controls.map(norm));
    const painted = new Set<string>();
    for (const w of words)
      for (const r of emit(w)) {
        if (r.kind === "declares" && r.effectKind === "css") Object.keys(r.declarations).forEach((p) => painted.add(p));
        if (r.kind === "facet") painted.add(r.property);
      }
    for (const p of painted)
      if (!p.startsWith("--") && !declared.has(norm(p)))
        disagreements.push(`${axis} emits '${p}' — not in controls [${rec.controls.join(", ")}]`);
  }
  assert.deepEqual(disagreements, [], disagreements.join("; "));
});
