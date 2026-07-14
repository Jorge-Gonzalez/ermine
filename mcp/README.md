# Ermine MCP server

This package exposes Ermine's existing linter, emitter, A1 authoring context, and governed-graph context assembly as four read-only MCP tools over stdio. It does not mutate files, authenticate users, or open an HTTP listener.

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

`ermine_context` assembles precedence-ordered context for one corpus ID by traversing
`constitution/graph.generated.json` (both edge directions, `hops` 1 by default, 2 at most). Calling it
with `{ "id": "R-DENSITY-01" }` returns:

```text
## R-DENSITY-01 · constitution · hop 0

## R-DENSITY-01 — Density scale

Spacing magnitude is a closed ordered T-shirt scale `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`,
with unmarked default `md`.

→ rationale: RAT:R-DENSITY-01 · history: ADR-0001 · code: src/registry.ts#SCALES

## RAT:R-DENSITY-01 · rationale · hop 1

## RAT:R-DENSITY-01
Source: pre-split `constitution/ERMINE.md` lines 991–998.

## CODE:SCALES · code · hop 1

(code) exported symbol `SCALES` — src/registry.ts
```

Controlling sources come first (the arbitration canon: register rank, then supersession recency, then
explicit deferral — imported from `constitution/arbitration.ts`). A node in the staleness ledger is
annotated under its heading:

```text
## RAT:R-DENSITY-01 · rationale · hop 1
⚠ stale since 2026-07-01 (cause: R-SPACE-02)
```

A source that defers is emitted after its controller with `deferred to <ID> (scope: …)`; a genuinely
incomparable pair carries `UNRESOLVED conflict — treat neither as controlling`. Output is capped at
~6,000 tokens; whole nodes are dropped from the far end of the precedence order, never mid-node:

```text
[truncated: 3 nodes omitted — request a specific ID for detail]
```

An unknown `id` returns an error listing the five closest known IDs; `hops` above 2 is rejected.
