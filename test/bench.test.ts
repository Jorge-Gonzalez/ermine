// bench.test.ts — A3 acceptance: the frozen intent set's integrity, the semantic
// checker, metric computation over fake traces, and report rendering. No network:
// the only generator exercised is the deterministic fake.

import { test } from "node:test";
import assert from "node:assert/strict";
import type { Trace } from "../loop/types.ts";
import {
  loadIntents, touchesToken, semanticPass,
  computeErmineMetrics, computeTailwindMetrics, runBench,
  TAILWIND_SHAPE, type BenchIntent, type ErmineRun,
} from "../bench/run.ts";
import { renderReport } from "../bench/report.ts";
import { fakeGenerator } from "../bench/fake-generator.ts";

test("intents.json is frozen at exactly 30 entries with unique ids", () => {
  const intents = loadIntents();
  assert.equal(intents.length, 30);
  assert.equal(new Set(intents.map((i) => i.id)).size, 30);
});

test("semantic checker: axis ids and scope shapes, include and exclude", () => {
  assert.ok(touchesToken("vertical gap-md", "structure"));
  assert.ok(!touchesToken("vertical gap-md", "padding"));
  assert.ok(touchesToken("vertical viewport-md:horizontal", "viewport-*:"));
  assert.ok(!touchesToken("vertical", "viewport-*:"));
  const responsive: BenchIntent = { id: "X", intent: "x", mustInclude: ["structure", "viewport-*:"], mustNotInclude: ["z-scale"] };
  assert.ok(semanticPass(responsive, "vertical viewport-md:horizontal"));
  assert.ok(!semanticPass(responsive, "vertical"));
  assert.ok(!semanticPass(responsive, "vertical viewport-md:horizontal raised"));
});

// handcrafted fake traces: one first-round valid, one corrected in round 2, one gap.
const fakeTraces = (): ErmineRun[] => {
  const valid: Trace = {
    intent: "a", rounds: [{ promptHash: "h", emission: "vertical", issues: [], ms: 1 }],
    terminalState: "valid", finalString: "vertical",
  };
  const corrected: Trace = {
    intent: "b",
    rounds: [
      { promptHash: "h", emission: "horizontal vertical", issues: [{ level: "error", rule: "one-word-per-axis", msg: "x" }], ms: 1 },
      { promptHash: "h", emission: "horizontal", issues: [], ms: 1 },
    ],
    terminalState: "valid", finalString: "horizontal",
  };
  const gap: Trace = {
    intent: "c", rounds: [{ promptHash: "h", emission: "GAP\nintent: c\nnearest: \nmissing: m", issues: [], ms: 1 }],
    terminalState: "gap", finalString: "GAP\nintent: c\nnearest: \nmissing: m",
  };
  return [{ id: "A", trace: valid }, { id: "B", trace: corrected }, { id: "C", trace: gap }];
};

const fakeIntents: BenchIntent[] = [
  { id: "A", intent: "a", mustInclude: ["structure"] },
  { id: "B", intent: "b", mustInclude: ["structure"] },
  { id: "C", intent: "c" },
];

test("ermine metrics: validity, gap rate, rounds distribution, semantic pass", () => {
  const m = computeErmineMetrics("ermine-loop", fakeTraces(), fakeIntents);
  assert.equal(m.n, 3);
  assert.equal(m.firstEmissionValidity, 1 / 3);
  assert.equal(m.gapRate, 1 / 3);
  assert.deepEqual(m.roundsToValid, { "1": 1, "2": 1 });
  assert.equal(m.semanticPassRate, 2 / 3);
});

test("tailwind metrics: permissive shape check, no gap protocol, no semantic checks", () => {
  const m = computeTailwindMetrics([
    { id: "A", emission: "flex items-center gap-4", shapeValid: TAILWIND_SHAPE.test("flex items-center gap-4") },
    { id: "B", emission: "Sure! Here are some classes:", shapeValid: TAILWIND_SHAPE.test("Sure! Here are some classes:") },
  ]);
  assert.equal(m.firstEmissionValidity, 0.5);
  assert.equal(m.gapRate, null);
  assert.equal(m.semanticPassRate, null);
});

test("dry run with the fake generator: all arms, well-formed report", async () => {
  const result = await runBench(fakeGenerator, "fake");
  const loop = result.arms["ermine-loop"].metrics;
  assert.equal(loop.n, 30);
  // scripted deviations: H04 always gaps; P10 corrects in round 2.
  assert.equal(loop.gapRate, 1 / 30);
  assert.equal(loop.roundsToValid?.["2"], 1);
  // every non-scripted canonical answer is first-emission valid.
  assert.equal(loop.firstEmissionValidity, 28 / 30);
  // oneshot cannot use the correction round: P10's bad first emission exhausts it.
  assert.equal(result.arms["ermine-oneshot"].metrics.firstEmissionValidity, 28 / 30);

  const report = renderReport(result);
  assert.match(report, /\| first-emission validity \|/);
  assert.match(report, /ermine-loop/);
  assert.match(report, /tailwind-oneshot/);
  assert.match(report, /n\/a/);
  assert.match(report, /Visual\/rendered fidelity is NOT judged/);
});
