// mcp/context-tool.ts — A6 `ermine_context`: precise, precedence-ordered context
// assembly by graph traversal. An agent reasoning about one ruling loads a few
// hundred relevant lines instead of the whole corpus; the graph's edges ARE the
// relevance model (no semantic retrieval by design).
//
// Pure module — no MCP SDK import — so fixture corpora can drive it in tests;
// mcp/server.ts wires the real corpus. Arbitration is IMPORTED from
// constitution/arbitration.ts (precedes/arbitrateNode), never reimplemented.

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { arbitrateNode, precedes } from "../constitution/arbitration.ts";
import type { DocumentGraph, GraphNode } from "../constitution/graph-core.ts";

export interface StaleEntry { id: string; staleSince: string; cause: string }

export interface ContextSource {
  graph: DocumentGraph;
  stale: StaleEntry[];
  root: string; // directory that node.file paths resolve against
}

export function loadContextSource(root: string): ContextSource {
  const graph = JSON.parse(readFileSync(join(root, "constitution/graph.generated.json"), "utf8")) as DocumentGraph;
  const stale = JSON.parse(readFileSync(join(root, "constitution/stale.json"), "utf8")) as StaleEntry[];
  return { graph, stale, root };
}

// --- unknown-ID suggestions: plain DP Levenshtein, no dependency (per order) ---
export function levenshtein(a: string, b: string): number {
  const previous = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) previous[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const insertOrDelete = Math.min(previous[j], previous[j - 1]) + 1;
      const substitute = diagonal + (a[i - 1] === b[j - 1] ? 0 : 1);
      diagonal = previous[j];
      previous[j] = Math.min(insertOrDelete, substitute);
    }
  }
  return previous[b.length];
}

function closestIds(id: string, nodes: GraphNode[]): string[] {
  return nodes
    .map((node) => ({ id: node.id, d: levenshtein(id.toUpperCase(), node.id.toUpperCase()) }))
    .sort((x, y) => x.d - y.d || x.id.localeCompare(y.id))
    .slice(0, 5)
    .map((entry) => entry.id);
}

// --- node text loading ---
// constitution/rationale → the heading-anchored block; history (ADRs, small) →
// the whole file; code → a one-line pointer (loading a whole src file would
// spend the budget on implementation detail the doc nodes already cite).
function headingBlock(source: string, anchor: string): string | null {
  const lines = source.split("\n");
  const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^(#{2,3}) ${escaped}(\\s|$)`);
  for (let index = 0; index < lines.length; index += 1) {
    const match = heading.exec(lines[index]);
    if (!match) continue;
    const level = match[1].length;
    const closer = new RegExp(`^#{2,${level}} `);
    let end = index + 1;
    while (end < lines.length && !closer.test(lines[end])) end += 1;
    return lines.slice(index, end).join("\n").trim();
  }
  return null;
}

function nodeText(node: GraphNode, root: string): string {
  if (node.register === "code") return `(code) exported symbol \`${node.anchor}\` — ${node.file}`;
  let source: string;
  try {
    source = readFileSync(join(root, node.file), "utf8");
  } catch {
    return `(text unavailable: ${node.file} not readable)`;
  }
  if (node.register === "history") return source.trim();
  return headingBlock(source, node.anchor) ?? `(no heading block found for ${node.anchor} in ${node.file})`;
}

const DEFAULT_BUDGET_TOKENS = 6_000;
const approxTokens = (text: string): number => Math.ceil(text.length / 4);

export function assembleContext(
  id: string,
  source: ContextSource,
  opts: { hops?: number; budgetTokens?: number } = {},
): string {
  const hops = opts.hops ?? 1;
  if (!Number.isInteger(hops) || hops < 1 || hops > 2) {
    throw new Error(`hops must be 1 or 2 (got ${String(opts.hops)}) — deeper traversal is out of scope; request a specific ID for detail instead`);
  }
  const byId = new Map(source.graph.nodes.map((node) => [node.id, node]));
  if (!byId.has(id)) {
    throw new Error(`Unknown ID '${id}'. Closest known IDs: ${closestIds(id, source.graph.nodes).join(", ")}`);
  }

  // 1. neighborhood, BOTH edge directions (inbound = "what depends on this",
  // the half that matters most), breadth-first to `hops`.
  const distance = new Map<string, number>([[id, 0]]);
  let frontier = [id];
  for (let hop = 1; hop <= hops; hop += 1) {
    const next: string[] = [];
    for (const current of frontier) {
      for (const edge of source.graph.edges) {
        const neighbor = edge.from === current ? edge.to : edge.to === current ? edge.from : null;
        if (neighbor !== null && byId.has(neighbor) && !distance.has(neighbor)) {
          distance.set(neighbor, hop);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }
  const collected = [...distance.keys()].map((nodeId) => byId.get(nodeId)!);

  // 2. precedence order: peel maximal elements under precedes() layer by layer
  // (a linear extension of the strict partial order — controlling sources first).
  const layers: GraphNode[][] = [];
  let remaining = [...collected];
  while (remaining.length) {
    const maximal = remaining.filter((candidate) =>
      !remaining.some((other) => other.id !== candidate.id && precedes(other, candidate, source.graph) === "a"));
    const layer = (maximal.length ? maximal : remaining).sort((x, y) => x.id.localeCompare(y.id));
    layers.push(layer);
    const taken = new Set(layer.map((node) => node.id));
    remaining = remaining.filter((node) => !taken.has(node.id));
  }
  const ordered = layers.flat();

  // 3. labels: stale ledger, deferral (emitted after its controller by the
  // layering above), and the root's arbitration verdict for UNRESOLVED pairs.
  const staleById = new Map(source.stale.map((entry) => [entry.id, entry]));
  const verdict = arbitrateNode(id, source.graph);
  const unresolvedIds = new Set(verdict.kind === "unresolved" ? verdict.ids : []);
  const defersBySource = new Map<string, { to: string; scope?: string }[]>();
  for (const edge of source.graph.edges) {
    if (edge.type !== "defers-to") continue;
    const list = defersBySource.get(edge.from) ?? [];
    list.push({ to: edge.to, scope: edge.scope });
    defersBySource.set(edge.from, list);
  }

  const blocks = ordered.map((node) => {
    const lines = [`## ${node.id} · ${node.register} · hop ${distance.get(node.id)}`];
    const stale = staleById.get(node.id);
    if (stale) lines.push(`⚠ stale since ${stale.staleSince} (cause: ${stale.cause})`);
    for (const deferral of defersBySource.get(node.id) ?? []) {
      lines.push(`deferred to ${deferral.to} (scope: ${deferral.scope ?? "unspecified"})`);
    }
    if (unresolvedIds.has(node.id)) lines.push("UNRESOLVED conflict — treat neither as controlling");
    if (verdict.kind === "controls" && verdict.id === node.id) lines.push(`controls: this source wins arbitration over ${id}`);
    lines.push("", nodeText(node, source.root));
    return lines.join("\n");
  });

  // 4. hard budget: whole nodes only, truncated from the far end of the
  // precedence order; the leading block is always emitted.
  const budget = opts.budgetTokens ?? DEFAULT_BUDGET_TOKENS;
  const kept: string[] = [];
  let spent = 0;
  for (const block of blocks) {
    const cost = approxTokens(block);
    if (kept.length > 0 && spent + cost > budget) break;
    kept.push(block);
    spent += cost;
  }
  const omitted = blocks.length - kept.length;
  if (omitted > 0) kept.push(`[truncated: ${omitted} nodes omitted — request a specific ID for detail]`);
  return kept.join("\n\n");
}
