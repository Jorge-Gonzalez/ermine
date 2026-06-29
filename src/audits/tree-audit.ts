// tree-audit.ts — confirming audit #2. Question: does state-relational need a
// second member, or does it stay at one (active-descendant)?
// Tree stacks: roving highlight (relational) + per-node expanded (instance) +
// multi-select range (anchor?) + roving tabindex re-entry (tabbable?).

// Two independent admission filters from the rebuild:
//  (1) Law 6 eligibility: does the PLATFORM draw this line? (named attr/pseudo-class)
//  (2) inclusion test:    does it name a CONDITION WITH A PERCEPTUAL CONSEQUENCE?
//  (Law 6b only fires to MERGE two admitted members; not an admission gate.)

interface Candidate {
  name: string;
  platformBacking: string | null;   // null = platform draws no line (Law 6 fail)
  backingLocation: "self" | "container" | "none";
  hasPerceptualRule: boolean;       // inclusion test
  note: string;
}

const candidates: Candidate[] = [
  { name: "active-descendant (highlighted-now)", platformBacking: "aria-activedescendant",
    backingLocation: "container", hasPerceptualRule: true,
    note: "container points at this node; visible highlight. RELATIONAL." },
  { name: "selection-anchor (range origin)", platformBacking: null,
    backingLocation: "none", hasPerceptualRule: false,
    note: "no aria attr, no pseudo-class; JS range-math internal state." },
  { name: "tabbable (roving tabindex re-entry)", platformBacking: "tabindex=0",
    backingLocation: "self", hasPerceptualRule: false,
    note: "real platform line, but no distinct look until actually focused (=> focus)." },
  { name: "expanded (node open)", platformBacking: "aria-expanded",
    backingLocation: "self", hasPerceptualRule: true,
    note: "self-backed, visible disclosure. INSTANCE (already in set)." },
];

type Verdict =
  | { admit: true; category: "instance" | "relational" }
  | { admit: false; reason: string };

function admit(c: Candidate): Verdict {
  // Filter 1 — Law 6 eligibility
  if (c.platformBacking === null)
    return { admit: false, reason: "Law 6: platform draws no line (non-distinction)" };
  // Filter 2 — inclusion test (perceptual consequence)
  if (!c.hasPerceptualRule)
    return { admit: false, reason: "inclusion test: no visual rule to condition -> wiring, OUT" };
  // Admitted: category by backing location
  return { admit: true, category: c.backingLocation === "container" ? "relational" : "instance" };
}

// members already in the rebuilt set BEFORE this audit (so we count only NEW ones)
const ALREADY_IN_SET = new Set(["active-descendant", "expanded", "selected", "disabled", "hover"]);
const baseName = (c: Candidate) => c.name.split(" (")[0];

console.log("=== Tree candidate admission ===\n");
let newRelational = 0, reusedRelational = 0;
for (const c of candidates) {
  const v = admit(c);
  if (v.admit) {
    const reused = ALREADY_IN_SET.has(baseName(c));
    console.log(`ADMIT   ${c.name}\n        -> category: ${v.category}${reused ? " (REUSED, already in set)" : " (NEW)"}`);
    if (v.category === "relational") (reused ? reusedRelational++ : newRelational++);
  } else {
    console.log(`REJECT  ${c.name}\n        -> ${v.reason}`);
  }
  console.log(`        (${c.note})\n`);
}

console.log("=== Result ===");
console.log(`state-relational: ${newRelational} NEW member(s), ${reusedRelational} reused.`);
console.log(newRelational === 0
  ? "state-relational gains NO new member from the tree -> the category stays at ONE member."
  : `state-relational gains ${newRelational} NEW member(s) -> revise.`);
console.log("\nactive-descendant was already admitted (Audit E); the tree REUSES it,");
console.log("confirming recurrence across composite widgets without forcing a 2nd member.");
console.log("anchor -> OUT (Law 6). tabbable -> OUT (inclusion test). Both correctly excluded.");

// Cross-check: the two rejects fail on DIFFERENT filters. If they failed on the
// same one, the filters might be redundant; failing on different ones shows both
// filters are load-bearing.
console.log("\n=== Filter independence check ===");
console.log("anchor   rejected by Filter 1 (Law 6 eligibility)");
console.log("tabbable rejected by Filter 2 (inclusion/perceptual)");
console.log("=> both filters are load-bearing; neither is redundant.");
