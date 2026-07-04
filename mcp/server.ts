import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { fileURLToPath } from "node:url";

import { loadAuthoringContext } from "../loop/context.ts";
import { emit } from "../src/emit.ts";
import { lint } from "../src/lint.ts";
import { assembleContext, loadContextSource } from "./context-tool.ts";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));

const CLASS_STRING_SCHEMA = {
  type: "object",
  properties: {
    classString: {
      type: "string",
      minLength: 1,
      maxLength: 2_000,
      pattern: "^[^\\r\\n]+$",
      description: "One line of space-separated Ermine classes.",
    },
  },
  required: ["classString"],
  additionalProperties: false,
} as const;

const EMPTY_SCHEMA = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

const CONTEXT_SCHEMA = {
  type: "object",
  properties: {
    id: {
      type: "string",
      minLength: 1,
      maxLength: 200,
      description: "A stable corpus ID (LAW-n, R-AREA-nn, RAT:<id>, ADR-nnnn, CODE:<symbol>).",
    },
    hops: {
      type: "integer",
      minimum: 1,
      maximum: 2,
      description: "Neighborhood radius, both edge directions. Default 1; maximum 2.",
    },
  },
  required: ["id"],
  additionalProperties: false,
} as const;

const server = new Server(
  { name: "ermine", version: "0.1.0" },
  {
    capabilities: { tools: {} },
    instructions: "Read-only access to Ermine linting, emission, and the authoring contract.",
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ermine_lint",
      description: "Lint one line of Ermine classes and return its issues.",
      inputSchema: CLASS_STRING_SCHEMA,
    },
    {
      name: "ermine_emit",
      description: "Compile one line of Ermine classes into emitted rules.",
      inputSchema: CLASS_STRING_SCHEMA,
    },
    {
      name: "ermine_contract",
      description: "Return the A1 authoring context bundle used to guide an authoring model.",
      inputSchema: EMPTY_SCHEMA,
    },
    {
      name: "ermine_context",
      description:
        "Assemble precedence-ordered context for one corpus ID by graph traversal: the node plus its neighborhood (both edge directions, 1-2 hops), controlling sources first, stale and deferral annotations, hard 6k-token budget.",
      inputSchema: CONTEXT_SCHEMA,
    },
  ],
}));

function errorResult(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

function classStringFrom(args: unknown): string | { error: string } {
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return { error: "Expected arguments to be an object containing classString." };
  }
  const record = args as Record<string, unknown>;
  if (Object.keys(record).some((key) => key !== "classString")) {
    return { error: "Only the classString argument is accepted." };
  }
  if (typeof record.classString !== "string") {
    return { error: "classString must be a string." };
  }
  if (record.classString.length === 0) {
    return { error: "classString must not be empty." };
  }
  if (record.classString.length > 2_000) {
    return { error: "classString must be at most 2000 characters." };
  }
  if (/\r|\n/.test(record.classString)) {
    return { error: "classString must contain exactly one line." };
  }
  return record.classString;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  const args = request.params.arguments;

  if (name === "ermine_contract") {
    if (args && Object.keys(args).length > 0) {
      return errorResult("ermine_contract accepts no arguments.");
    }
    return { content: [{ type: "text", text: await loadAuthoringContext() }] };
  }

  if (name === "ermine_context") {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      return errorResult("Expected arguments to be an object containing id (and optionally hops).");
    }
    const record = args as Record<string, unknown>;
    if (Object.keys(record).some((key) => key !== "id" && key !== "hops")) {
      return errorResult("Only the id and hops arguments are accepted.");
    }
    if (typeof record.id !== "string" || record.id.length === 0 || record.id.length > 200 || /\r|\n/.test(record.id)) {
      return errorResult("id must be a non-empty single-line string of at most 200 characters.");
    }
    if (record.hops !== undefined && (!Number.isInteger(record.hops) || (record.hops as number) < 1 || (record.hops as number) > 2)) {
      return errorResult(`hops must be 1 or 2 (got ${JSON.stringify(record.hops)}) — deeper traversal is out of scope; request a specific ID for detail instead.`);
    }
    try {
      const source = loadContextSource(REPO_ROOT);
      const context = assembleContext(record.id, source, { hops: record.hops as number | undefined });
      return { content: [{ type: "text", text: context }] };
    } catch (error) {
      return errorResult(error instanceof Error ? error.message : String(error));
    }
  }

  if (name === "ermine_lint" || name === "ermine_emit") {
    const classString = classStringFrom(args);
    if (typeof classString !== "string") return errorResult(classString.error);
    const result = name === "ermine_lint" ? lint(classString) : emit(classString);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});

await server.connect(new StdioServerTransport());
