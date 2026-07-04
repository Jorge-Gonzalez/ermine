export const EDGE_TYPES = [
  "depends-on",
  "constrains",
  "supersedes",
  "rationale-of",
  "implements",
  "defers-to",
] as const;

export type EdgeType = (typeof EDGE_TYPES)[number];
export type GraphRegister = "constitution" | "rationale" | "history" | "code";

export interface GraphNode {
  id: string;
  register: GraphRegister;
  file: string;
  anchor: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: EdgeType;
  scope?: string;
}

export interface GraphCluster {
  name: string;
  members: string[];
}

export interface DocumentGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}

export interface GraphIssue {
  code: "DOC-E02" | "DOC-E06" | "DOC-E08";
  message: string;
}

export interface StaleEntry {
  id: string;
  staleSince: string;
  cause: string;
}

function adjacency(graph: DocumentGraph, type: EdgeType): Map<string, string[]> {
  const result = new Map<string, string[]>();
  for (const edge of graph.edges.filter((candidate) => candidate.type === type)) {
    const targets = result.get(edge.from) ?? [];
    targets.push(edge.to);
    result.set(edge.from, targets);
  }
  return result;
}

export function findCycle(graph: DocumentGraph, type: EdgeType): string[] | undefined {
  const next = adjacency(graph, type);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  const visit = (id: string): string[] | undefined => {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      return [...stack.slice(start), id];
    }
    if (visited.has(id)) return undefined;
    visiting.add(id);
    stack.push(id);
    for (const target of next.get(id) ?? []) {
      const cycle = visit(target);
      if (cycle) return cycle;
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    return undefined;
  };

  for (const node of graph.nodes) {
    const cycle = visit(node.id);
    if (cycle) return cycle;
  }
  return undefined;
}

export function validateGraph(graph: DocumentGraph): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const ids = new Set(graph.nodes.map(({ id }) => id));
  for (const edge of graph.edges) {
    if (!ids.has(edge.from)) issues.push({ code: "DOC-E02", message: `${edge.type} source ${edge.from} does not resolve` });
    if (!ids.has(edge.to)) issues.push({ code: "DOC-E02", message: `${edge.type} target ${edge.to} does not resolve` });
    if (edge.type === "defers-to" && !edge.scope) {
      issues.push({ code: "DOC-E02", message: `defers-to ${edge.from} -> ${edge.to} has no scope` });
    }
  }

  const supersedes = findCycle(graph, "supersedes");
  if (supersedes) issues.push({ code: "DOC-E06", message: `supersedes cycle: ${supersedes.join(" -> ")}` });
  const defers = findCycle(graph, "defers-to");
  if (defers) issues.push({ code: "DOC-E08", message: `defers-to cycle: ${defers.join(" -> ")}` });
  return issues;
}

// Tarjan's strongly-connected-components algorithm. depends-on cycles are
// information, not errors: each cyclic SCC is emitted as a review cluster.
export function dependsOnClusters(graph: DocumentGraph): GraphCluster[] {
  const next = adjacency(graph, "depends-on");
  let index = 0;
  const indices = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const components: string[][] = [];

  const connect = (id: string): void => {
    indices.set(id, index);
    low.set(id, index);
    index += 1;
    stack.push(id);
    onStack.add(id);

    for (const target of next.get(id) ?? []) {
      if (!indices.has(target)) {
        connect(target);
        low.set(id, Math.min(low.get(id)!, low.get(target)!));
      } else if (onStack.has(target)) {
        low.set(id, Math.min(low.get(id)!, indices.get(target)!));
      }
    }

    if (low.get(id) === indices.get(id)) {
      const component: string[] = [];
      while (stack.length) {
        const member = stack.pop()!;
        onStack.delete(member);
        component.push(member);
        if (member === id) break;
      }
      components.push(component);
    }
  };

  for (const node of graph.nodes) if (!indices.has(node.id)) connect(node.id);
  return components
    .filter((members) => members.length > 1 || graph.edges.some((edge) => edge.type === "depends-on" && edge.from === members[0] && edge.to === members[0]))
    .map((members) => members.sort())
    .sort(([left], [right]) => left.localeCompare(right))
    .map((members) => ({ name: `CLUSTER-${members[0]}`, members }));
}

export function normalizeGraph(graph: DocumentGraph): DocumentGraph {
  const nodes = [...graph.nodes].sort((left, right) => left.id.localeCompare(right.id));
  const edges = [...graph.edges].sort((left, right) =>
    left.type.localeCompare(right.type) || left.from.localeCompare(right.from) || left.to.localeCompare(right.to) ||
    (left.scope ?? "").localeCompare(right.scope ?? ""),
  );
  return { nodes, edges, clusters: dependsOnClusters({ nodes, edges, clusters: [] }) };
}

export function reverseClosure(graph: DocumentGraph, rootId: string): Map<number, { node: GraphNode; edge: GraphEdge }[]> {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  if (!nodes.has(rootId)) throw new Error(`Unknown graph ID: ${rootId}`);
  const seen = new Set([rootId]);
  const queue: { id: string; hop: number }[] = [{ id: rootId, hop: 0 }];
  const result = new Map<number, { node: GraphNode; edge: GraphEdge }[]>();

  while (queue.length) {
    const current = queue.shift()!;
    for (const edge of graph.edges.filter((candidate) => candidate.to === current.id)) {
      if (seen.has(edge.from)) continue;
      const node = nodes.get(edge.from);
      if (!node) continue;
      seen.add(edge.from);
      const hop = current.hop + 1;
      const entries = result.get(hop) ?? [];
      entries.push({ node, edge });
      result.set(hop, entries);
      queue.push({ id: edge.from, hop });
    }
  }
  for (const entries of result.values()) entries.sort((left, right) => left.node.register.localeCompare(right.node.register) || left.node.id.localeCompare(right.node.id));
  return result;
}

export function markDirectDependents(
  entries: StaleEntry[],
  cause: string,
  graph: DocumentGraph,
  staleSince = new Date().toISOString(),
): StaleEntry[] {
  const ids = new Set(graph.nodes.map(({ id }) => id));
  if (!ids.has(cause)) throw new Error(`Unknown graph ID: ${cause}`);
  const direct = new Set(graph.edges.filter(({ to }) => to === cause).map(({ from }) => from));
  const retained = entries.filter(({ id }) => !direct.has(id));
  return [...retained, ...[...direct].map((id) => ({ id, staleSince, cause }))]
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function clearStale(entries: StaleEntry[], id: string): StaleEntry[] {
  return entries.filter((entry) => entry.id !== id);
}
