// mcp-context.test.ts — A6 acceptance: the six fixture assertions for
// ermine_context's assembly (neighborhood, arbitration ordering, labels, stale,
// truncation, suggestions) against a FIXTURE corpus — no dependence on the real
// one — plus a subprocess pass re-verifying the A4 criterion (the server refuses
// malformed input without crashing).

import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { assembleContext, levenshtein, type ContextSource } from "../mcp/context-tool.ts";
import type { DocumentGraph } from "../constitution/graph-core.ts";

// --- fixture corpus -----------------------------------------------------------
// LAW-X is the subject. R-A and R-B both constrain it (incomparable maxima →
// UNRESOLVED). R-C defers to R-A (Tier 3; two hops from LAW-X). RAT:LAW-X is
// its rationale (Tier 1: constitution outranks it) and is marked stale.
// ADR-9001 hangs off the rationale (two hops). CODE:fixtureSymbol implements it.
const graph: DocumentGraph = {
  nodes: [
    { id: "LAW-X", register: "constitution", file: "law.md", anchor: "LAW-X" },
    { id: "R-A", register: "constitution", file: "law.md", anchor: "R-A" },
    { id: "R-B", register: "constitution", file: "law.md", anchor: "R-B" },
    { id: "R-C", register: "constitution", file: "law.md", anchor: "R-C" },
    { id: "RAT:LAW-X", register: "rationale", file: "rat.md", anchor: "RAT:LAW-X" },
    { id: "ADR-9001", register: "history", file: "decisions/ADR-9001.md", anchor: "ADR-9001" },
    { id: "CODE:fixtureSymbol", register: "code", file: "src/fixture.ts", anchor: "fixtureSymbol" },
  ],
  edges: [
    { from: "RAT:LAW-X", to: "LAW-X", type: "rationale-of" },
    { from: "CODE:fixtureSymbol", to: "LAW-X", type: "implements" },
    { from: "R-A", to: "LAW-X", type: "constrains" },
    { from: "R-B", to: "LAW-X", type: "constrains" },
    { from: "R-C", to: "R-A", type: "defers-to", scope: "spacing only" },
    { from: "ADR-9001", to: "RAT:LAW-X", type: "depends-on" },
  ],
  clusters: [],
};

let root: string;
let source: ContextSource;

test.before(async () => {
  root = await mkdtemp(join(tmpdir(), "ermine-context-fixture-"));
  await mkdir(join(root, "decisions"), { recursive: true });
  await writeFile(join(root, "law.md"), [
    "## LAW-X — the fixture law", "Text of law X.", "",
    "## R-A — ruling A", "Text of ruling A.", "",
    "## R-B — ruling B", "Text of ruling B.", "",
    "## R-C — ruling C", "Text of ruling C.", "",
  ].join("\n"));
  await writeFile(join(root, "rat.md"), "## RAT:LAW-X\nWhy law X holds.\n");
  await writeFile(join(root, "decisions/ADR-9001.md"), "# ADR-9001 — fixture decision\nHow it happened.\n");
  source = {
    graph,
    stale: [{ id: "RAT:LAW-X", staleSince: "2026-07-01", cause: "R-A" }],
    root,
  };
});

test.after(async () => {
  await rm(root, { recursive: true, force: true });
});

const idsInOrder = (output: string): string[] =>
  [...output.matchAll(/^## (\S+) · /gm)].map((match) => match[1]);

test("(a) neighborhood collection at hops 1 and 2, both edge directions", () => {
  const oneHop = idsInOrder(assembleContext("LAW-X", source));
  assert.deepEqual(new Set(oneHop), new Set(["LAW-X", "R-A", "R-B", "RAT:LAW-X", "CODE:fixtureSymbol"]));

  const twoHops = idsInOrder(assembleContext("LAW-X", source, { hops: 2 }));
  assert.deepEqual(new Set(twoHops), new Set([
    "LAW-X", "R-A", "R-B", "R-C", "RAT:LAW-X", "ADR-9001", "CODE:fixtureSymbol",
  ]));
});

test("(b) controlling-first ordering: Tier 1 (register rank) and Tier 3 (deferral)", () => {
  const order = idsInOrder(assembleContext("LAW-X", source, { hops: 2 }));
  // Tier 1: every constitution node precedes the rationale, which precedes history.
  for (const constitutional of ["LAW-X", "R-A", "R-B", "R-C"]) {
    assert.ok(order.indexOf(constitutional) < order.indexOf("RAT:LAW-X"), `${constitutional} before rationale`);
  }
  assert.ok(order.indexOf("RAT:LAW-X") < order.indexOf("ADR-9001"), "rationale before history");
  // Tier 3: R-C explicitly defers to R-A, so R-A must come first.
  assert.ok(order.indexOf("R-A") < order.indexOf("R-C"), "deferral target before the deferring source");
});

test("(c) deferred and UNRESOLVED labels", () => {
  const output = assembleContext("LAW-X", source, { hops: 2 });
  assert.match(output, /## R-C · constitution · hop 2\ndeferred to R-A \(scope: spacing only\)/);
  assert.match(output, /## R-A · constitution · hop 1\nUNRESOLVED conflict — treat neither as controlling/);
  assert.match(output, /## R-B · constitution · hop 1\nUNRESOLVED conflict — treat neither as controlling/);
});

test("(d) stale annotation from the ledger", () => {
  const output = assembleContext("LAW-X", source);
  assert.match(output, /## RAT:LAW-X · rationale · hop 1\n⚠ stale since 2026-07-01 \(cause: R-A\)/);
});

test("(e) whole-node truncation under a tiny budget", () => {
  const output = assembleContext("LAW-X", source, { hops: 2, budgetTokens: 30 });
  assert.match(output, /\[truncated: \d+ nodes omitted — request a specific ID for detail\]$/);
  const kept = idsInOrder(output);
  assert.ok(kept.length >= 1 && kept.length < 7, "some but not all nodes kept");
  // no partial node: every kept id renders its full text block.
  for (const id of kept) {
    if (id === "LAW-X") assert.match(output, /Text of law X\./);
  }
  // the omitted count is exact.
  const omitted = Number(/\[truncated: (\d+) nodes/.exec(output)![1]);
  assert.equal(kept.length + omitted, 7);
});

test("(f) unknown ID errors with the five closest suggestions", () => {
  assert.throws(
    () => assembleContext("LAW-Z", source),
    (error: Error) => {
      assert.match(error.message, /Unknown ID 'LAW-Z'/);
      const listed = error.message.split("Closest known IDs: ")[1].split(", ");
      assert.equal(listed.length, 5);
      assert.equal(listed[0], "LAW-X"); // distance 1 beats everything else
      return true;
    },
  );
});

test("hops outside 1..2 are rejected with a clear error", () => {
  assert.throws(() => assembleContext("LAW-X", source, { hops: 3 }), /hops must be 1 or 2/);
  assert.throws(() => assembleContext("LAW-X", source, { hops: 0 }), /hops must be 1 or 2/);
});

test("levenshtein is the classic metric", () => {
  assert.equal(levenshtein("kitten", "sitting"), 3);
  assert.equal(levenshtein("", "abc"), 3);
  assert.equal(levenshtein("same", "same"), 0);
});

// --- A4 criterion re-verified over the real server: refuses malformed input
// without crashing, and answers a real-corpus ermine_context call. -------------
import { spawn } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

interface RpcResponse { id?: number; result?: unknown; error?: { code: number; message: string } }
interface ToolResult { content: Array<{ type: string; text?: string }>; isError?: boolean }

async function runSession(messages: object[]): Promise<Map<number, RpcResponse>> {
  const directory = await mkdtemp(join(tmpdir(), "ermine-mcp-context-"));
  const inputPath = join(directory, "input.jsonl");
  await writeFile(inputPath, `${messages.map((message) => JSON.stringify(message)).join("\n")}\n`);
  const input = openSync(inputPath, "r");
  const output = openSync(join(directory, "output.jsonl"), "w");
  const error = openSync(join(directory, "stderr.txt"), "w");
  const repo = fileURLToPath(new URL("..", import.meta.url));
  const child = spawn(process.execPath, ["--import", "tsx", join(repo, "mcp/server.ts")], {
    cwd: repo, stdio: [input, output, error],
  });
  try {
    const exit = await new Promise<number | null>((resolve, reject) => {
      const timer = setTimeout(() => { child.kill(); reject(new Error("server did not finish")); }, 10_000);
      child.once("error", (cause) => { clearTimeout(timer); reject(cause); });
      child.once("exit", (code) => { clearTimeout(timer); resolve(code); });
    });
    const stderr = await readFile(join(directory, "stderr.txt"), "utf8");
    assert.equal(exit, 0, stderr);
    const responses = (await readFile(join(directory, "output.jsonl"), "utf8"))
      .trim().split("\n").filter(Boolean).map((line) => JSON.parse(line) as RpcResponse);
    return new Map(responses.flatMap((r) => (r.id === undefined ? [] : [[r.id, r]])));
  } finally {
    try { closeSync(input); } catch {}
    try { closeSync(output); } catch {}
    try { closeSync(error); } catch {}
    if (child.exitCode === null) child.kill();
    await rm(directory, { recursive: true, force: true });
  }
}

const rpc = (id: number, method: string, params?: unknown): object => ({ jsonrpc: "2.0", id, method, params });

test("server: ermine_context answers on the real corpus and refuses malformed input without crashing", async () => {
  const responses = await runSession([
    rpc(1, "initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "t", version: "0" } }),
    { jsonrpc: "2.0", method: "notifications/initialized" },
    rpc(2, "tools/call", { name: "ermine_context", arguments: { id: "R-DENSITY-01" } }),
    rpc(3, "tools/call", { name: "ermine_context", arguments: { id: "R-DENSITY-01", hops: 3 } }),
    rpc(4, "tools/call", { name: "ermine_context", arguments: { id: "R-DENSITY-99" } }),
    rpc(5, "tools/call", { name: "ermine_context", arguments: { id: "R-DENSITY-01", extra: true } }),
    rpc(6, "tools/call", { name: "ermine_lint", arguments: { classString: "horizontal" } }),
  ]);

  const good = responses.get(2)!.result as ToolResult;
  assert.notEqual(good.isError, true);
  assert.match(good.content[0].text!, /## R-DENSITY-01 · constitution/);

  const badHops = responses.get(3)!.result as ToolResult;
  assert.equal(badHops.isError, true);
  assert.match(badHops.content[0].text!, /hops must be 1 or 2/);

  const unknown = responses.get(4)!.result as ToolResult;
  assert.equal(unknown.isError, true);
  assert.match(unknown.content[0].text!, /Closest known IDs: .*R-DENSITY-01/);

  const extra = responses.get(5)!.result as ToolResult;
  assert.equal(extra.isError, true);

  // the A4 tools still answer after refusals — the process never crashed.
  const lintResult = responses.get(6)!.result as ToolResult;
  assert.deepEqual(JSON.parse(lintResult.content[0].text!), []);
});
