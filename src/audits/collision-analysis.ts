// collision-analysis.ts — classify the two predicate-4 collisions and test fixes.

// ---------------------------------------------------------------------------
// COLLISION 1: transition-delay shared by motion-micro (member) & motion-macro (container)
// Question: is it a clean twin (like display) or a real overwrite hazard?
//
// display twin:  container sets INNER facet, member sets OUTER facet — different
//                facets of one property name; CSS resolves them independently
//                (they are literally different longhands conceptually). NO overwrite.
//
// transition-delay: macro-stagger and micro-delay are the SAME facet (the delay
//                   value). If both present on the parent->child chain, the child's
//                   own value WINS and stagger is lost. REAL overwrite hazard.
// ---------------------------------------------------------------------------
function isCleanTwin(prop: string): boolean {
  // a clean twin requires the property to have role-split FACETS (outer/inner).
  // CSS only does this for `display` (outer/inner display) and arguably writing-mode
  // adjacent props. transition-delay has no facet split.
  const facetSplitProps = new Set(["display"]);
  return facetSplitProps.has(prop);
}

console.log("=== Collision 1: transition-delay ===");
console.log(`display is clean twin?         ${isCleanTwin("display")}`);
console.log(`transition-delay clean twin?   ${isCleanTwin("transition-delay")}`);
console.log("=> transition-delay is NOT a clean twin: macro stagger and micro delay are");
console.log("   the same facet, so they OVERWRITE. This is a genuine composition hazard.");
console.log("   FIX: stagger must not be raw transition-delay on the child. Options:");
console.log("   (a) macro stagger emits a SEPARATE custom prop (--stagger-index * --stagger-step)");
console.log("       COMPOSED INTO the child's delay via calc, so micro delay and stagger ADD");
console.log("       instead of overwrite:  transition-delay: calc(var(--own-delay,0ms) + var(--stagger,0ms));");
console.log("   (b) declare macro-stagger NEGOTIATED-like: it's a container distributing a");
console.log("       per-member offset — same shape as gap. Then micro owns the base delay,");
console.log("       macro owns the offset, and they compose by addition, not replacement.\n");

// Verify fix (a): additive composition removes the collision at the VALUE level.
function delayWithFix(ownDelay: number, staggerIndex: number, staggerStep: number): number {
  return ownDelay + staggerIndex * staggerStep; // additive — both survive
}
console.log("   verify (a): child own-delay=200ms, stagger idx=3 step=60ms =>",
  delayWithFix(200, 3, 60), "ms (both preserved; no overwrite)\n");

// ---------------------------------------------------------------------------
// COLLISION 2: align-self shared by m3-self-size (negotiated) & m4-self-alignment (free)
// Root cause: `stretch` is listed in BOTH m3 (fill/stretch the cross axis) and m4
//             (the align-self keyword set includes self-stretch). The document's
//             prose puts fill/stretch under m3 while giving m4 the full align-self set.
// ---------------------------------------------------------------------------
console.log("=== Collision 2: align-self / stretch ===");
console.log("Root cause: `stretch` lives in two axes:");
console.log("  m3 lists 'fill/stretch (fill the parent)' as a SIZE source");
console.log("  m4 owns the align-self keyword set, which INCLUDES self-stretch");
console.log("=> align-self:stretch is claimed by both. Latent plane-mix in §4.1 prose.\n");

console.log("Resolution options:");
console.log("  (A) `stretch` belongs to m4 ONLY (it IS align-self). m3 keeps flex-basis as its");
console.log("      size source and DROPS fill/stretch — 'fill the cross axis' is just");
console.log("      `self-stretch` (m4 alignment), not a size axis. This matches CSS: cross-axis");
console.log("      stretch is align-self, NOT flex-basis. m3 = flex-basis only.");
console.log("  (B) keep both but split the property: m3 owns MAIN-axis fill (flex-basis/flex-grow");
console.log("      already covers it), m4 owns CROSS-axis align-self. Then m3 should NOT list");
console.log("      align-self at all — its 'fill' is main-axis grow, already in m2.");
console.log("");
console.log("=> Both options converge: m3 must NOT control align-self. Cross-axis stretch is m4.");
console.log("   m3's 'fill/stretch' wording conflated main-axis fill (m2 grow) with cross-axis");
console.log("   stretch (m4 align-self). Neither is a NEW m3 responsibility. m3 = flex-basis (+source).");

// Apply fix: remove align-self from m3, re-run disjointness on the pair.
const m3_controls_fixed = ["flex-basis"];           // align-self removed
const m4_controls       = ["align-self"];
const stillClash = m3_controls_fixed.filter(p => m4_controls.includes(p));
console.log("\n   verify: m3∩m4 after fix =", stillClash.length ? stillClash : "∅ (disjoint) ✓");
