// audit-combobox.test.ts — src/audits/combobox-audit.ts promoted to assertions.
// The audit tested the rebuilt state model against an editable combobox's arrow-key
// highlight and confirmed the gap: `instance` entailment (backing ON the element) can
// never express a state whose backing lives on the CONTAINER (aria-activedescendant).
// The ruling that resolved it is the relational category with inverted entailment
// (R-STATE-08, enforced by P8b — R-STATE-05). These tests pin that resolution.
// (The audit script exports nothing and runs on import; the assertions target the
// ratified registry + linter instead.)

import { test } from "node:test";
import assert from "node:assert/strict";
import { REGISTRY } from "../src/registry.ts";
import { lint } from "../src/lint.ts";

const relational = REGISTRY.find((a) => a.axis === "state.relational");

test("the gap's resolution is in the registry: active-descendant is relational, container-backed", () => {
  assert.ok(relational, "state.relational axis must exist");
  const member = relational!.stateGroup?.members.find((m) => m.word === "active-descendant");
  assert.ok(member, "active-descendant must be a state.relational member");
  assert.equal(member!.stateCategory, "relational");
  assert.equal(member!.relationalBacking?.containerAttr, "aria-activedescendant");
});

test("self-backing can NEVER satisfy a relational member — the audit's confirmed gap", () => {
  // filing it as `instance` failed because the attr is never on the option itself;
  // supplying it as element backing must therefore not appease the linter.
  const issues = lint("active-descendant", new Set(["aria-activedescendant"]), {
    elementId: "opt-3",
    containerAttrs: {},
  });
  assert.ok(
    issues.some((i) => i.rule === "state-entailment-relational" && i.level === "error"),
    "backing on the element must not substitute for the container pointing here",
  );
});

test("inverted entailment: the container pointing at THIS element satisfies; elsewhere fails", () => {
  const here = lint("active-descendant", new Set(), {
    elementId: "opt-3",
    containerAttrs: { "aria-activedescendant": "opt-3" },
  });
  assert.deepEqual(here.filter((i) => i.level === "error"), []);

  const elsewhere = lint("active-descendant", new Set(), {
    elementId: "opt-3",
    containerAttrs: { "aria-activedescendant": "opt-1" },
  });
  assert.ok(elsewhere.some((i) => i.rule === "state-entailment-relational"));
});

test("twin check: capability distributes potential (entails nothing); relational asserts an instance", () => {
  // `selectable` with zero backing is lawful — capability words entail nothing.
  const capability = lint("selectable", new Set(), {});
  assert.deepEqual(capability.filter((i) => i.level === "error"), []);

  const selectable = REGISTRY.find((a) => a.axis === "state.selection")
    ?.stateGroup?.members.find((m) => m.word === "selectable");
  assert.equal(selectable?.stateCategory, "capability");
  assert.ok(!selectable?.entails?.length, "capability must not carry entailment");
});
