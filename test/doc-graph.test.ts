import assert from "node:assert/strict";
import test from "node:test";

import { arbitrate, arbitrateNode, precedes } from "../constitution/arbitration.ts";
import {
  clearStale,
  dependsOnClusters,
  markDirectDependents,
  validateGraph,
  type DocumentGraph,
  type GraphEdge,
  type GraphNode,
} from "../constitution/graph-core.ts";

const node = (id: string, register: GraphNode["register"] = "constitution"): GraphNode => ({
  id,
  register,
  file: `fixture/${id}.md`,
  anchor: id,
});

const graph = (nodes: GraphNode[], edges: GraphEdge[] = []): DocumentGraph => ({ nodes, edges, clusters: [] });

test("DOC-E02: a dangling graph edge fails integrity", () => {
  const fixture = graph([node("A")], [{ from: "A", to: "MISSING", type: "depends-on" }]);
  assert.ok(validateGraph(fixture).some(({ code }) => code === "DOC-E02"));
});

test("DOC-E06: a supersedes cycle fails integrity", () => {
  const fixture = graph(
    [node("ADR-0001", "history"), node("ADR-0002", "history")],
    [
      { from: "ADR-0001", to: "ADR-0002", type: "supersedes" },
      { from: "ADR-0002", to: "ADR-0001", type: "supersedes" },
    ],
  );
  assert.ok(validateGraph(fixture).some(({ code }) => code === "DOC-E06"));
});

test("DOC-E08: a defers-to cycle fails integrity", () => {
  const fixture = graph(
    [node("A"), node("B")],
    [
      { from: "A", to: "B", type: "defers-to", scope: "fixture" },
      { from: "B", to: "A", type: "defers-to", scope: "fixture" },
    ],
  );
  assert.ok(validateGraph(fixture).some(({ code }) => code === "DOC-E08"));
});

test("depends-on SCC is reported as a cluster, never an error", () => {
  const fixture = graph(
    [node("A"), node("B"), node("C")],
    [
      { from: "A", to: "B", type: "depends-on" },
      { from: "B", to: "A", type: "depends-on" },
      { from: "C", to: "A", type: "depends-on" },
    ],
  );
  assert.deepEqual(validateGraph(fixture), []);
  assert.deepEqual(dependsOnClusters(fixture), [{ name: "CLUSTER-A", members: ["A", "B"] }]);
});

test("Tier 1: constitution controls rationale", () => {
  const fixture = graph([node("A", "constitution"), node("B", "rationale")]);
  assert.equal(precedes(fixture.nodes[0], fixture.nodes[1], fixture), "a");
  assert.deepEqual(arbitrate(["A", "B"], fixture), { kind: "controls", id: "A", sources: ["A", "B"] });
});

test("Tier 2: the live end of a supersedes chain controls", () => {
  const fixture = graph(
    [node("ADR-0001", "history"), node("ADR-0002", "history")],
    [{ from: "ADR-0002", to: "ADR-0001", type: "supersedes" }],
  );
  assert.equal(precedes(fixture.nodes[1], fixture.nodes[0], fixture), "a");
  assert.deepEqual(arbitrate(["ADR-0001", "ADR-0002"], fixture), {
    kind: "controls",
    id: "ADR-0002",
    sources: ["ADR-0001", "ADR-0002"],
  });
});

test("Tier 3: an explicit scoped deferral selects its target", () => {
  const fixture = graph(
    [node("A"), node("B")],
    [{ from: "A", to: "B", type: "defers-to", scope: "fixture conflict" }],
  );
  assert.equal(precedes(fixture.nodes[0], fixture.nodes[1], fixture), "b");
  assert.deepEqual(arbitrate(["A", "B"], fixture), { kind: "controls", id: "B", sources: ["A", "B"] });
});

test("mutually incomparable maxima remain UNRESOLVED", () => {
  const fixture = graph([node("A"), node("B")]);
  assert.equal(precedes(fixture.nodes[0], fixture.nodes[1], fixture), "incomparable");
  assert.deepEqual(arbitrate(["A", "B"], fixture), {
    kind: "unresolved",
    ids: ["A", "B"],
    sources: ["A", "B"],
  });
});

test("arbitration annotates a node with multiple constraining sources", () => {
  const fixture = graph(
    [node("TARGET"), node("A"), node("B")],
    [
      { from: "A", to: "TARGET", type: "constrains" },
      { from: "B", to: "TARGET", type: "constrains" },
      { from: "A", to: "B", type: "defers-to", scope: "target constraint" },
    ],
  );
  assert.deepEqual(arbitrateNode("TARGET", fixture), { kind: "controls", id: "B", sources: ["A", "B"] });
});

test("the fixture preference relation is irreflexive and transitive", () => {
  const fixture = graph(
    [node("N", "constitution"), node("R", "rationale"), node("H1", "history"), node("H0", "history")],
    [{ from: "H1", to: "H0", type: "supersedes" }],
  );
  const controls = (left: GraphNode, right: GraphNode): boolean => precedes(left, right, fixture) === "a";
  for (const candidate of fixture.nodes) assert.equal(controls(candidate, candidate), false);
  for (const a of fixture.nodes) for (const b of fixture.nodes) for (const c of fixture.nodes) {
    if (controls(a, b) && controls(b, c)) assert.equal(controls(a, c), true, `${a.id} > ${b.id} > ${c.id}`);
  }
});

test("mark -> stale -> clear round-trip", () => {
  const fixture = graph(
    [node("CAUSE"), node("DIRECT"), node("TRANSITIVE")],
    [
      { from: "DIRECT", to: "CAUSE", type: "depends-on" },
      { from: "TRANSITIVE", to: "DIRECT", type: "depends-on" },
    ],
  );
  const marked = markDirectDependents([], "CAUSE", fixture, "2026-07-03T00:00:00.000Z");
  assert.deepEqual(marked, [{ id: "DIRECT", staleSince: "2026-07-03T00:00:00.000Z", cause: "CAUSE" }]);
  assert.deepEqual(clearStale(marked, "DIRECT"), []);
});
