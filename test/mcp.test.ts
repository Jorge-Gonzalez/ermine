import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

interface RpcResponse {
  id?: number;
  result?: unknown;
  error?: { code: number; message: string };
}

interface ToolResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

function request(id: number, method: string, params?: unknown): object {
  return { jsonrpc: "2.0", id, method, params };
}

async function runSession(messages: object[]): Promise<Map<number, RpcResponse>> {
  const directory = await mkdtemp(join(tmpdir(), "ermine-mcp-"));
  const inputPath = join(directory, "input.jsonl");
  const outputPath = join(directory, "output.jsonl");
  const errorPath = join(directory, "stderr.txt");
  await writeFile(inputPath, `${messages.map((message) => JSON.stringify(message)).join("\n")}\n`);

  const input = openSync(inputPath, "r");
  const output = openSync(outputPath, "w");
  const error = openSync(errorPath, "w");
  const root = fileURLToPath(new URL("..", import.meta.url));
  const server = fileURLToPath(new URL("../mcp/server.ts", import.meta.url));
  const child = spawn(process.execPath, ["--import", "tsx", server], {
    cwd: root,
    stdio: [input, output, error],
  });

  try {
    const exit = await new Promise<number | null>((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error("MCP server subprocess did not finish"));
      }, 5_000);
      child.once("error", (cause) => {
        clearTimeout(timer);
        reject(cause);
      });
      child.once("exit", (code) => {
        clearTimeout(timer);
        resolve(code);
      });
    });
    closeSync(input);
    closeSync(output);
    closeSync(error);

    const stderr = await readFile(errorPath, "utf8");
    assert.equal(exit, 0, stderr);
    assert.equal(stderr, "");
    const responses = (await readFile(outputPath, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RpcResponse);
    return new Map(responses.flatMap((response) => response.id === undefined ? [] : [[response.id, response]]));
  } finally {
    if (child.exitCode === null) child.kill();
    try { closeSync(input); } catch {}
    try { closeSync(output); } catch {}
    try { closeSync(error); } catch {}
    await rm(directory, { recursive: true, force: true });
  }
}

function resultFor(responses: Map<number, RpcResponse>, id: number): unknown {
  const response = responses.get(id);
  assert.ok(response, `Missing JSON-RPC response ${id}`);
  assert.equal(response.error, undefined);
  return response.result;
}

function toolResult(responses: Map<number, RpcResponse>, id: number): ToolResult {
  return resultFor(responses, id) as ToolResult;
}

function text(result: ToolResult): string {
  const block = result.content.find((item) => item.type === "text");
  assert.ok(block && typeof block.text === "string");
  return block.text;
}

test("A4 MCP server exposes the read-only Ermine tools", async (t) => {
  const responses = await runSession([
    request(1, "initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "ermine-test", version: "0.1.0" },
    }),
    { jsonrpc: "2.0", method: "notifications/initialized" },
    request(2, "tools/list", {}),
    request(3, "tools/call", { name: "ermine_lint", arguments: { classString: "horizontal" } }),
    request(4, "tools/call", { name: "ermine_lint", arguments: { classString: "stretchy" } }),
    request(5, "tools/call", { name: "ermine_lint", arguments: { classString: "horizontal\nvertical" } }),
    request(6, "tools/call", { name: "ermine_emit", arguments: { classString: "horizontal" } }),
    request(7, "tools/call", { name: "ermine_emit", arguments: { classString: "stretchy" } }),
    request(8, "tools/call", { name: "ermine_emit", arguments: { classString: "x".repeat(2_001) } }),
    request(9, "tools/call", { name: "ermine_contract", arguments: {} }),
    request(10, "tools/call", { name: "ermine_contract", arguments: { extra: true } }),
    request(11, "tools/call", { name: "ermine_lint", arguments: { classString: "horizontal" } }),
  ]);

  await t.test("lists exactly the three A4 tools", () => {
    const listed = resultFor(responses, 2) as { tools: Array<{ name: string }> };
    assert.deepEqual(listed.tools.map((tool) => tool.name), [
      "ermine_lint",
      "ermine_emit",
      "ermine_contract",
    ]);
  });

  await t.test("ermine_lint returns issues and refuses malformed input", () => {
    const good = toolResult(responses, 3);
    assert.equal(good.isError, undefined);
    assert.deepEqual(JSON.parse(text(good)), []);

    const bad = toolResult(responses, 4);
    assert.equal((JSON.parse(text(bad)) as Array<{ rule: string }>)[0]?.rule, "unknown-word");

    const malformed = toolResult(responses, 5);
    assert.equal(malformed.isError, true);
    assert.match(text(malformed), /exactly one line/);
  });

  await t.test("ermine_emit returns rules and refuses oversized input", () => {
    const good = toolResult(responses, 6);
    const rules = JSON.parse(text(good)) as Array<{ axis: string }>;
    assert.ok(rules.length > 0);
    assert.ok(rules.every((rule) => rule.axis === "structure"));

    const bad = toolResult(responses, 7);
    assert.deepEqual(JSON.parse(text(bad)), []);

    const malformed = toolResult(responses, 8);
    assert.equal(malformed.isError, true);
    assert.match(text(malformed), /at most 2000 characters/);
  });

  await t.test("ermine_contract returns the A1 bundle and accepts no arguments", () => {
    const good = toolResult(responses, 9);
    const contract = text(good);
    assert.match(contract, /# AUTHORING CONTRACT/);
    assert.match(contract, /# SHARED SPEC §1\n\n## 1\./);
    assert.match(contract, /# SHARED SPEC §2\n\n## 2\./);
    assert.match(contract, /# NEGOTIATED-REGIME INVARIANTS\n\n## 6\./);

    const bad = toolResult(responses, 10);
    assert.equal(bad.isError, true);
    assert.match(text(bad), /accepts no arguments/);
  });

  await t.test("continues serving after rejected input", () => {
    assert.deepEqual(JSON.parse(text(toolResult(responses, 11))), []);
  });
});
