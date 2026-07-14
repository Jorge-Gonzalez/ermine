// bench/fake-generator.ts — deterministic scripted generator for dry runs and
// tests. NOT a model: its answers exercise the pipeline (every terminal state,
// the loop's correction round, the tailwind arm's shape check), so dry-run
// numbers describe the machinery, never a grammar verdict. Every canned Ermine
// string below was verified through lint() with its intent's declared backing.

import type { Generator } from "../loop/types.ts";

// canonical answers per intent id (P01-P20 are A1's published patterns).
const CANONICAL: Record<string, string> = {
  P01: "vertical gap-md padding-lg",
  P02: "horizontal gap-sm align-center justify-between",
  P03: "vertical gap-sm padding-md max-width-lg",
  P04: "horizontal inline gap-xs padding-sm",
  P05: "selectable selection-subtle padding-sm",
  P06: "selectable selected selection-subtle",
  P07: "vertical gap-xs expandable",
  P08: "elastic basis-ratio",
  P09: "rigid basis-exact-md",
  P10: "grow-2 shrink-0",
  P11: "expandable self-stretch",
  P12: "vertical viewport-md:horizontal",
  P13: "prefers-color-scheme-dark:selection-strong",
  P14: "vertical gap-md divided",
  P15: "modal",
  P16: "position-absolute isolate dropdown scroll-y max-height-md",
  P17: "active-descendant selection-subtle",
  P18: "expanded",
  P19: "sorted-ascending",
  P20: "required invalid",
  H01: "padding-sm container-md:padding-lg",
  H02: "selection-subtle prefers-contrast-more:selection-strong",
  H03: "active-descendant selected selection-subtle",
  H04: "user-invalid",
  H05: "checked-mixed",
  H06: "compressible basis-exact-lg",
  H07: "grow-2 shrink-0",
  H08: "expandable min-width-sm",
  H09: "sorted-descending",
  H10: "rigid viewport-lg:elastic",
};

// scripted deviations, to exercise the machinery:
//  P10 — round 1 emits an alias+dial conflict, round 2 corrects (loop dynamics);
//  H04 — always emits a GAP block (gap terminal + A5 harvest input).
const BAD_FIRST: Record<string, string> = { P10: "expandable grow-2" };
const SCRIPTED_GAP = new Set(["H04"]);

// intent text → id, derived from the frozen set so the fake stays in sync.
import { loadIntents } from "./run.ts";
const idByIntent = new Map(loadIntents().map((i) => [i.intent, i.id]));

export const fakeGenerator: Generator = async (prompt) => {
  if (prompt.startsWith("You are a Tailwind")) return "flex items-center gap-4 p-6";

  const intentText = /# INTENT\n([^\n]+)/.exec(prompt)?.[1];
  const id = intentText ? idByIntent.get(intentText) : undefined;
  if (!id) throw new Error(`fake generator: prompt carries no known intent (${intentText ?? "none"})`);

  if (SCRIPTED_GAP.has(id)) {
    return ["GAP", `intent: ${intentText}`, "nearest: ", "missing: scripted fake gap — pipeline exercise, not a grammar verdict"].join("\n");
  }
  const round = (prompt.match(/# PREVIOUS EMISSION/g) ?? []).length + 1;
  if (round === 1 && BAD_FIRST[id]) return BAD_FIRST[id];
  return CANONICAL[id];
};
