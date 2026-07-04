// audit-tree.test.ts — src/audits/tree-audit.ts promoted to assertions.
// The audit ran the tree widget's candidate states through the two admission filters
// (Law 6 platform eligibility; R-STATE-04 perceptual-consequence inclusion) and
// concluded: the tree adds NO new relational member — active-descendant is reused,
// `expanded` was already instance, and anchor/tabbable stay out. These tests pin the
// registry consequences of those verdicts so a silently added member re-opens the audit.
// (The audit script exports nothing and runs on import; the assertions target the
// ratified registry instead.)

import { test } from "node:test";
import assert from "node:assert/strict";
import { REGISTRY } from "../src/registry.ts";
import { lint } from "../src/lint.ts";

const stateAxis = (group: string) => {
  const rec = REGISTRY.find((a) => a.axis === `state.${group}`);
  assert.ok(rec?.stateGroup, `state.${group} must exist`);
  return rec!;
};

test("state.relational stays at exactly ONE member — the audit's headline result", () => {
  const members = stateAxis("relational").stateGroup!.members;
  assert.deepEqual(members.map((m) => m.word), ["active-descendant"]);
});

test("`expanded` was admitted as instance in disclosure (reused, not a tree addition)", () => {
  const expanded = stateAxis("disclosure").stateGroup!.members.find((m) => m.word === "expanded");
  assert.ok(expanded, "expanded must exist in state.disclosure");
  assert.equal(expanded!.stateCategory, "instance");
  assert.ok(expanded!.entails?.includes("aria-expanded"), "self-backed by aria-expanded");
});

test("rejected candidates were never coined: selection-anchor (Law 6) and tabbable (inclusion test)", () => {
  // the two rejects failed on DIFFERENT filters — both load-bearing — and the shared
  // consequence the registry can witness is non-existence: neither resolves to any axis.
  for (const word of ["selection-anchor", "tabbable"]) {
    const issues = lint(word, new Set(), {});
    assert.ok(
      issues.some((i) => i.rule === "unknown-word" && i.level === "error"),
      `'${word}' must not resolve to any axis`,
    );
  }
});

test("no state member anywhere lacks either platform backing or perceptual admission", () => {
  // the audit's filters, restated as a standing registry invariant: every admitted
  // member carries the platform line that made it eligible — instance members entail
  // platform truths; the relational member names its container attribute; capability
  // and conditioned-skin are the sanctioned entail-nothing categories (R-STATE-05).
  for (const rec of REGISTRY.filter((a) => a.axis.startsWith("state."))) {
    for (const m of rec.stateGroup!.members) {
      if (m.stateCategory === "instance") {
        assert.ok(m.entails?.length, `${rec.axis}/${m.word}: instance member must entail platform backing`);
      } else if (m.stateCategory === "relational") {
        assert.ok(m.relationalBacking?.containerAttr, `${rec.axis}/${m.word}: relational member must name its container attr`);
      } else {
        assert.ok(["capability", "conditioned-skin"].includes(m.stateCategory), `${rec.axis}/${m.word}: unknown category`);
      }
    }
  }
});
