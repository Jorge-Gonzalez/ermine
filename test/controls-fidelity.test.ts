// controls-fidelity.test.ts — check (A) from the readiness probe, committed.
//
// B4 makes ownership.generated.json authoritative for emitted axes. The registry's
// hand-written `controls` remain a declared safety envelope (and the fallback for the
// two gap-reported axes), so this older one-way gate still checks that a direct,
// non-custom declaration does not escape that envelope. Declared-only and sink-level
// differences are findings reported by the ownership derivation, not failures here.
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

test("declared controls bound every direct non-custom declaration", () => {
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
