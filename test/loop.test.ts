import assert from "node:assert/strict";
import { test } from "node:test";

import { buildInitialPrompt, runLoop } from "../loop/harness.ts";
import type { Generator } from "../loop/types.ts";

test("authoring prompt assembles the contract, shared §§1–2, and negotiated §6", async () => {
  const prompt = await buildInitialPrompt("a horizontal layout");
  assert.match(prompt, /# AUTHORING CONTRACT[\s\S]+## Output protocol/);
  assert.match(prompt, /# SHARED SPEC §1\n\n## 1\. Registry record schema/);
  assert.match(prompt, /# SHARED SPEC §2\n\n## 2\. The axis registry/);
  assert.match(prompt, /# NEGOTIATED-REGIME INVARIANTS\n\n## 6\. Negotiated regime/);
  assert.doesNotMatch(prompt, /## 7\. Trust boundary/);
});

test("the loop feeds verbatim lint diagnostics back and terminates valid in round 2", async () => {
  const emissions = ["stretchy", "horizontal"];
  const prompts: string[] = [];
  const fake: Generator = async (prompt) => {
    prompts.push(prompt);
    const emission = emissions.shift();
    assert.ok(emission);
    return emission;
  };

  const trace = await runLoop("a horizontal layout", fake, { maxRounds: 4 });
  assert.equal(trace.terminalState, "valid");
  assert.equal(trace.finalString, "horizontal");
  assert.equal(trace.rounds.length, 2);
  assert.equal(trace.rounds[0].emission, "stretchy");
  assert.equal(trace.rounds[0].issues[0].rule, "unknown-word");
  assert.deepEqual(trace.rounds[1].issues, []);
  assert.match(trace.rounds[0].promptHash, /^[a-f0-9]{64}$/);
  assert.ok(trace.rounds.every((round) => round.ms >= 0));

  assert.ok(prompts[1].startsWith(prompts[0]));
  assert.match(prompts[1], /# PREVIOUS EMISSION\n\nstretchy/);
  assert.ok(prompts[1].includes(trace.rounds[0].issues[0].msg));
  assert.match(prompts[1], /"rule": "unknown-word"/);
  assert.ok(prompts[1].endsWith("Correct the string. Emit only the corrected string."));
});

test("a conforming GAP block is a successful terminal state", async () => {
  const gap = "GAP\nintent: a circular avatar\nnearest: basis-exact-md\nmissing: no grammar word owns skin radius";
  const trace = await runLoop("a circular avatar", async () => gap, { maxRounds: 2 });
  assert.equal(trace.terminalState, "gap");
  assert.equal(trace.finalString, gap);
  assert.equal(trace.rounds.length, 1);
  assert.deepEqual(trace.rounds[0].issues, []);
});

test("invalid output exhausts the configured round budget", async () => {
  const trace = await runLoop("a horizontal layout", async () => "```horizontal```", { maxRounds: 1 });
  assert.equal(trace.terminalState, "exhausted");
  assert.equal(trace.rounds.length, 1);
  assert.ok(trace.rounds[0].issues.some((issue) => issue.rule === "unknown-word"));
});

test("the trace preserves raw generator output without normalization", async () => {
  const emission = "horizontal\n";
  const trace = await runLoop("a horizontal layout", async () => emission, { maxRounds: 1 });
  assert.equal(trace.terminalState, "valid");
  assert.equal(trace.finalString, emission);
  assert.equal(trace.rounds[0].emission, emission);
  assert.deepEqual(trace.rounds[0].issues, []);
});
