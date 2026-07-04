import type { DocumentGraph, GraphNode } from "./graph-core.ts";

export type NodeRef = GraphNode;
export type PrecedenceResult = "a" | "b" | "incomparable";

export type ArbitrationVerdict =
  | { kind: "none"; sources: string[] }
  | { kind: "controls"; id: string; sources: string[] }
  | { kind: "unresolved"; ids: string[]; sources: string[] };

const registerRank: Record<GraphNode["register"], number> = {
  constitution: 3,
  rationale: 2,
  history: 1,
  code: 0,
};

function reachable(from: string, to: string, next: Map<string, string[]>): boolean {
  const seen = new Set<string>();
  const stack = [from];
  while (stack.length) {
    const current = stack.pop()!;
    if (current === to) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push(...(next.get(current) ?? []));
  }
  return false;
}

function preferenceAdjacency(graph: DocumentGraph, type: "supersedes" | "defers-to"): Map<string, string[]> {
  const next = new Map<string, string[]>();
  for (const edge of graph.edges.filter((candidate) => candidate.type === type)) {
    // A superseding node controls the superseded node. A defers-to target
    // controls the source that explicitly deferred.
    const winner = type === "supersedes" ? edge.from : edge.to;
    const loser = type === "supersedes" ? edge.to : edge.from;
    const targets = next.get(winner) ?? [];
    targets.push(loser);
    next.set(winner, targets);
  }
  return next;
}

// Pure three-tier comparator. "a" means a controls b; "b" means b controls a.
// Tier 1: register rank. Tier 2: supersession recency within a register.
// Tier 3: explicit deferral within the still-unordered pair.
export function precedes(a: NodeRef, b: NodeRef, graph: DocumentGraph): PrecedenceResult {
  if (a.id === b.id) return "incomparable";

  const rankA = registerRank[a.register];
  const rankB = registerRank[b.register];
  if (rankA !== rankB) return rankA > rankB ? "a" : "b";

  const supersedes = preferenceAdjacency(graph, "supersedes");
  const aSupersedesB = reachable(a.id, b.id, supersedes);
  const bSupersedesA = reachable(b.id, a.id, supersedes);
  if (aSupersedesB !== bSupersedesA) return aSupersedesB ? "a" : "b";

  const defers = preferenceAdjacency(graph, "defers-to");
  const aControlsB = reachable(a.id, b.id, defers);
  const bControlsA = reachable(b.id, a.id, defers);
  if (aControlsB !== bControlsA) return aControlsB ? "a" : "b";
  return "incomparable";
}

export function arbitrate(sourceIds: string[], graph: DocumentGraph): ArbitrationVerdict {
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const sources = [...new Set(sourceIds)].filter((id) => byId.has(id));
  if (sources.length < 2) return { kind: "none", sources };

  const maximal = sources.filter((candidateId) => {
    const candidate = byId.get(candidateId)!;
    return !sources.some((otherId) => {
      if (otherId === candidateId) return false;
      const other = byId.get(otherId)!;
      return precedes(other, candidate, graph) === "a";
    });
  }).sort();

  return maximal.length === 1
    ? { kind: "controls", id: maximal[0], sources: sources.sort() }
    : { kind: "unresolved", ids: maximal, sources: sources.sort() };
}

export function arbitrateNode(nodeId: string, graph: DocumentGraph): ArbitrationVerdict {
  const sources = graph.edges
    .filter((edge) => edge.to === nodeId && edge.type === "constrains")
    .map(({ from }) => from)
    .filter((id) => !graph.edges.some((edge) => edge.type === "supersedes" && edge.to === id));
  return arbitrate(sources, graph);
}

export function unresolvedConflicts(graph: DocumentGraph): { node: string; ids: string[] }[] {
  const conflicts: { node: string; ids: string[] }[] = [];
  for (const node of graph.nodes) {
    const verdict = arbitrateNode(node.id, graph);
    if (verdict.kind === "unresolved") conflicts.push({ node: node.id, ids: verdict.ids });
  }
  return conflicts;
}
