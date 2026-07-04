# Ermine MCP server

This package exposes Ermine's existing linter, emitter, and A1 authoring context as three read-only MCP tools over stdio. It does not mutate files, authenticate users, or open an HTTP listener.

## Install and register

Install the repository's TypeScript runner and the isolated server package from the repository root:

```sh
npm install
npm --prefix mcp install
```

Register it with an MCP host, replacing `/absolute/path/to/ermine` with this repository's path:

```json
{
  "mcpServers": {
    "ermine": {
      "command": "node",
      "args": [
        "--import",
        "tsx",
        "/absolute/path/to/ermine/mcp/server.ts"
      ],
      "cwd": "/absolute/path/to/ermine"
    }
  }
}
```

The host process needs Node.js 20 or newer. The repository's development install provides `tsx`; the MCP SDK itself is installed only in `mcp/`.

## Tools

`ermine_lint` accepts one `classString` line. For example, calling it with `{ "classString": "stretchy" }` returns:

```json
[
  {
    "level": "error",
    "rule": "unknown-word",
    "msg": "'stretchy' resolves to no axis — not a member of any closed axis and not a sanctioned parameter. Do not coin; report a gap."
  }
]
```

`ermine_emit` accepts the same input. Calling it with `{ "classString": "horizontal" }` returns these two rules:

```json
[
  {
    "kind": "facet",
    "axis": "structure",
    "token": "horizontal",
    "selector": ".horizontal",
    "property": "display",
    "facet": "inner",
    "value": "flex",
    "effectKind": "css"
  },
  {
    "kind": "declares",
    "axis": "structure",
    "token": "horizontal",
    "selector": ".horizontal",
    "declarations": { "flex-direction": "row" },
    "effectKind": "css"
  }
]
```

`ermine_contract` accepts `{}` and returns the A1 context bundle. Its top-level boundaries are:

```text
# AUTHORING CONTRACT
…
# SHARED SPEC §1
…
# SHARED SPEC §2
…
# NEGOTIATED-REGIME INVARIANTS
## 6. Negotiated-regime invariants
…
```

Class strings must be non-empty, one line, and no longer than 2,000 characters. Invalid calls return an MCP tool error while the server remains available.
