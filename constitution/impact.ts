import { readFile, writeFile } from "node:fs/promises";

import { arbitrateNode, unresolvedConflicts, type ArbitrationVerdict } from "./arbitration.ts";
import {
  clearStale,
  markDirectDependents,
  reverseClosure,
  type DocumentGraph,
  type StaleEntry,
} from "./graph-core.ts";

const graphUrl = new URL("./graph.generated.json", import.meta.url);
const staleUrl = new URL("./stale.json", import.meta.url);

async function loadGraph(): Promise<DocumentGraph> {
  return JSON.parse(await readFile(graphUrl, "utf8")) as DocumentGraph;
}

async function loadStale(): Promise<StaleEntry[]> {
  return JSON.parse(await readFile(staleUrl, "utf8")) as StaleEntry[];
}

async function saveStale(entries: StaleEntry[]): Promise<void> {
  await writeFile(staleUrl, `${JSON.stringify(entries, null, 2)}\n`);
}

function verdictText(verdict: ArbitrationVerdict): string {
  if (verdict.kind === "controls") return `controls: ${verdict.id}`;
  if (verdict.kind === "unresolved") {
    return `UNRESOLVED: {${verdict.ids.join(", ")}} incomparable — human ruling required`;
  }
  return "no competing constraining sources";
}

function printImpact(id: string, graph: DocumentGraph): void {
  const closure = reverseClosure(graph, id);
  console.log(`Impact: ${id}`);
  console.log(`Root arbitration: ${verdictText(arbitrateNode(id, graph))}`);
  if (!closure.size) console.log("No reverse dependents.");

  for (const [hop, entries] of closure) {
    console.log(`\nHop ${hop}`);
    let register = "";
    for (const entry of entries) {
      if (entry.node.register !== register) {
        register = entry.node.register;
        console.log(`  ${register}`);
      }
      console.log(`    [${entry.edge.type}] ${entry.node.id} — ${verdictText(arbitrateNode(entry.node.id, graph))}`);
    }
  }

  const unresolved = unresolvedConflicts(graph);
  console.log(`\nUNRESOLVED conflicts in corpus: ${unresolved.length}`);
  for (const conflict of unresolved) console.log(`  ${conflict.node}: {${conflict.ids.join(", ")}}`);
}

async function main(): Promise<void> {
  const graph = await loadGraph();
  const clearIndex = process.argv.indexOf("--clear");
  if (clearIndex >= 0) {
    const id = process.argv[clearIndex + 1];
    if (!id) throw new Error("Usage: tsx constitution/impact.ts --clear <ID>");
    const before = await loadStale();
    const after = clearStale(before, id);
    await saveStale(after);
    console.log(`Cleared ${id}; stale entries ${before.length} -> ${after.length}`);
    return;
  }

  const id = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  if (!id) throw new Error("Usage: tsx constitution/impact.ts <ID> [--mark] | --clear <ID>");
  printImpact(id, graph);

  if (process.argv.includes("--mark")) {
    const before = await loadStale();
    const after = markDirectDependents(before, id, graph);
    await saveStale(after);
    console.log(`Marked ${after.length - before.filter((entry) => after.some((candidate) => candidate.id === entry.id)).length} direct dependent(s) stale`);
  }
}

await main();
