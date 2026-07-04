import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { loadAuthoringContext } from "../loop/context.ts";
import { emit } from "../src/emit.ts";
import { lint } from "../src/lint.ts";

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
