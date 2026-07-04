// authoring-patterns.test.ts — A1 acceptance: the intent patterns in
// src/LLM-AUTHORING.md are parsed by their stable delimiter (fenced blocks tagged
// `ermine`) and every class string lints with zero errors under exactly the backing
// its fence declares (the P8 obligation the pattern documents).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lint } from "../src/lint.ts";

const doc = readFileSync(new URL("../src/LLM-AUTHORING.md", import.meta.url), "utf8");

const blocks = [...doc.matchAll(/^```ermine([^\n]*)\n([\s\S]*?)^```/gm)].map((m) => {
  const backing = /backing=(\S+)/.exec(m[1]);
  return { body: m[2].trimEnd(), backing: backing ? backing[1].split(",") : [] };
});

test("the contract carries exactly 20 intent patterns", () => {
  assert.equal(blocks.length, 20);
});

test("every pattern has the output protocol's shape: one line of space-separated words", () => {
  for (const b of blocks) {
    assert.ok(b.body.length > 0 && !b.body.includes("\n"), `not a single line: ${JSON.stringify(b.body)}`);
    assert.match(b.body, /^[a-z0-9-]+(?::[a-z0-9-]+)?( [a-z0-9-]+(?::[a-z0-9-]+)?)*$/, b.body);
  }
});

test("every pattern lints with zero errors under its declared backing", () => {
  for (const b of blocks) {
    const errors = lint(b.body, new Set(b.backing), {}).filter((i) => i.level === "error");
    assert.deepEqual(errors, [], `${b.body} → ${errors.map((e) => `${e.rule}: ${e.msg}`).join("; ")}`);
  }
});
