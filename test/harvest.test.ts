import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import os from "node:os";

import { harvest } from "../loop/harvest.ts";

test("harvest creates idempotent Gap Report from a gap trace", async () => {
  const tmp = await mkdtemp(join(os.tmpdir(), "ermine-harvest-"));
  const traces = join(tmp, "traces");
  const reports = join(tmp, "reports");
  await mkdir(traces, { recursive: true });
  await mkdir(reports, { recursive: true });

  const gap = `GAP\nintent: a circular avatar\nnearest: basis-exact-md\nmissing: no grammar word owns skin radius`;
  const trace = {
    intent: "a circular avatar",
    rounds: [
      { promptHash: "h", emission: gap, issues: [], ms: 1 }
    ],
    terminalState: "gap",
    finalString: gap,
  };

  await writeFile(join(traces, "fixture.json"), JSON.stringify(trace, null, 2), "utf8");

  const created1 = await harvest({ traceDir: traces, benchDir: join(tmp, "bench"), outDir: reports });
  assert.equal(created1.length, 1);
  const content = await readFile(created1[0], "utf8");
  assert.match(content, /## What I was doing/);
  assert.match(content, /## The decision that is missing/);
  assert.match(content, /no grammar word owns skin radius/);

  const created2 = await harvest({ traceDir: traces, benchDir: join(tmp, "bench"), outDir: reports });
  assert.deepEqual(created1, created2);
});
