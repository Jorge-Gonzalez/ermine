// emitter-types.ts — the declaration AST the CSS emitter produces.
//
// DESIGN DOCUMENT, not the emitter itself. This answers one question: what shape
// does ONE EMITTED RULE need to be, so that (a) every axis in the registry can be
// represented honestly, and (b) `deriveControls()` can compute real property
// ownership for P7 — replacing the currently hand-transcribed `controls` lists.
//
// The reason this can't be a single flat shape (token -> selector -> declarations):
// the registry's own `notes` fields already document THREE ways an axis's "effect"
// deviates from that:
//   - state axes: `controls: []` — a condition, no declarations of its own (P7-4d)
//   - top-layer-mechanism: `controls: []` — no CSS at all, a DOM/JS mechanism
//   - selection-treatment / motion-macro: write CUSTOM PROPERTIES that a SEPARATE
//     sink rule, keyed on MULTIPLE co-present words, reads later
// Today all three collapse into the same `controls: []` (or a lone custom-property
// list) at the registry level, which is honest about INPUT but says nothing about
// how emission and ownership actually work. That's what this file adds.
//
// Four rule kinds, one union type. Every parsed word maps to exactly one.

// ============================================================================
// EFFECT KIND — scoped to the EMITTER, not the registry. Doesn't need a
// constitutional ruling to exist; it's the emitter's own bookkeeping for what
// kind of effect a rule represents.
// ============================================================================
export type EffectKind =
  | "css"                // ordinary declarations, own selector
  | "custom-property"    // writes variables for a sink rule to read
  | "condition"          // a selector/attribute fragment, no declarations
  | "platform-mechanism"; // no CSS at all — DOM/JS (showModal(), popover)

// ----------------------------------------------------------------------------
// DECLARES — the shape ~90% of the registry uses. One token, on its own,
// writes CSS declarations (ordinary properties OR custom properties) to a
// selector built from itself plus any active scope prefix.
// ----------------------------------------------------------------------------
export interface DeclareRule {
  kind: "declares";
  axis: string;              // registry axis id, e.g. "gap", "selection-treatment"
  token: string;              // the authored word, e.g. "gap-comfortable"
  selector: string;           // e.g. ".gap-comfortable"
  declarations: Record<string, string>; // property -> value; MAY be custom
                                          // properties (--selection-bg: ...)
  effectKind: Extract<EffectKind, "css" | "custom-property">;
  scope?: string;              // e.g. "viewport-md"; undefined = base
}

// ----------------------------------------------------------------------------
// READS (sink rule) — the mechanism selection-treatment and motion-macro's
// --stagger both depend on. A rule that doesn't exist until SEVERAL co-present
// words are looked at together, not one token in isolation. It reads custom
// properties written by one or more DeclareRules with effectKind
// "custom-property", and its own declarations are ordinary CSS.
//
// `composesFrom` is also the SANCTIONED-SHARE list for P7: every non-condition
// axis named here is a declared, legitimate co-owner of this rule's painted
// properties — the sink rule's existence IS the exception mechanism, the same
// way the structure/m1 `display` twin is a documented exception today. State
// axes may appear in `composesFrom` (they gate WHEN the rule fires) but never
// count as owners — P7-4d (state controls nothing) holds even inside a sink.
// ----------------------------------------------------------------------------
export interface SinkRule {
  kind: "reads";
  composesFrom: { axis: string; token?: string; role: "condition" | "contributor" }[];
  selector: string;           // compound selector, e.g. ".selectable.selected"
  declarations: Record<string, string>; // may reference var(--x) from contributors
  reads: string[];             // specific custom property names consumed
  effectKind: "css";           // a sink rule always ultimately paints real CSS
  scope?: string;
}

// ----------------------------------------------------------------------------
// FACET — two DIFFERENT axes writing different FACETS of the same CSS
// property, merged into one final declaration. This is not a sink (no custom
// properties, no gating condition) and not ordinary declares (neither axis's
// value is complete on its own). It's the constitution's ONE documented
// free-regime exception: `structure` writes display's INNER facet
// (flex/grid), `m1-flow-participation` writes the OUTER facet
// (inline/block) — CSS's own two-value `display: <outer> <inner>` syntax IS
// this mechanism, natively. Discovered walking real axes, not anticipated in
// the first design pass — `controls: ["display.inner"]` /
// `["display.outer"]` in registry.ts was already the tell.
// ----------------------------------------------------------------------------
export interface FacetRule {
  kind: "facet";
  axis: string;
  token: string;
  selector: string;
  property: string;    // the shared CSS property, e.g. "display"
  facet: string;         // e.g. "inner" | "outer" — matches registry.ts's
                          // "property.facet" controls-list convention
  value: string;          // this axis's contribution to that facet
  effectKind: "css";
  scope?: string;
}

// ----------------------------------------------------------------------------
// CONDITION — a state word with no declarations of its own (P7-4d, `controls:
// []`). Emitted so the AST is complete — every parsed word maps to SOMETHING —
// but contributes nothing to derivedControls under any circumstance.
// ----------------------------------------------------------------------------
export interface ConditionRule {
  kind: "condition";
  axis: string;
  token: string;
  selectorFragment: string;   // e.g. ":hover", "[aria-selected]", ".selected"
  effectKind: "condition";
}

// ----------------------------------------------------------------------------
// MECHANISM — a platform-mechanism word (modal, popover, overlay, toast). No
// CSS at all, ever. Emitted as metadata/integration hints, never a
// selector+declarations pair — structurally incapable of leaking into
// derivedControls or colliding with a real property.
// ----------------------------------------------------------------------------
export interface MechanismRule {
  kind: "mechanism";
  axis: string;
  token: string;
  mechanism: string;          // e.g. "dialog.showModal()", "popover attribute"
  effectKind: "platform-mechanism";
}

export type EmittedRule = DeclareRule | SinkRule | FacetRule | ConditionRule | MechanismRule;

// ============================================================================
// WORKED EXAMPLES — one per rule kind, built from real registry axes, so the
// shape is proven rather than asserted. `satisfies` catches drift from the
// type at compile time.
// ============================================================================

// 1. DECLARES — the ordinary case (layout, sizing, alignment, ~90% of the registry)
const example_gap: DeclareRule = {
  kind: "declares",
  axis: "density", token: "gap-comfortable",
  selector: ".gap-comfortable",
  declarations: { gap: "var(--spacing-comfortable)" },
  effectKind: "css",
};

// 2. DECLARES, custom-property flavor — writes variables, paints nothing itself
const example_selectionSubtle: DeclareRule = {
  kind: "declares",
  axis: "selection-treatment", token: "selection-subtle",
  selector: ".selection-subtle",
  declarations: {
    "--selection-bg": "var(--harmonic-wash)",
    "--selection-ink": "var(--ink)",
    "--selection-outline": "none",
  },
  effectKind: "custom-property",
};

// 3. READS — the sink that makes (2) visible. Fires on a COMPOUND selector;
// `selectable`/`selected` gate the condition (role: "condition", never an
// owner); `selection-treatment` is the sanctioned contributor.
const example_selectionSink: SinkRule = {
  kind: "reads",
  composesFrom: [
    { axis: "state.selection", token: "selectable", role: "condition" },
    { axis: "state.selection", token: "selected", role: "condition" },
    { axis: "selection-treatment", token: "selection-subtle", role: "contributor" },
  ],
  selector: ".selectable.selected",
  declarations: {
    background: "var(--selection-bg)",
    color: "var(--selection-ink)",
    outline: "var(--selection-outline)",
  },
  reads: ["--selection-bg", "--selection-ink", "--selection-outline"],
  effectKind: "css",
};

// 4. READS, multi-contributor — motion-macro's --stagger, composed with
// motion-micro's own delay. TWO axes legitimately co-own one declaration,
// exactly analogous to the structure/m1 `display` twin exception — the sink
// rule's existence IS the sanction, not an accident P7 should catch.
const example_staggerSink: SinkRule = {
  kind: "reads",
  composesFrom: [
    { axis: "motion-micro", role: "contributor" },   // supplies --own-delay
    { axis: "motion-macro", token: "cascade", role: "contributor" }, // supplies --stagger
  ],
  selector: ".motion-micro",
  declarations: { "transition-delay": "calc(var(--own-delay,0ms) + var(--stagger,0ms))" },
  reads: ["--own-delay", "--stagger"],
  effectKind: "css",
};

// 5. CONDITION — a state word, no declarations of its own
const example_hoverCondition: ConditionRule = {
  kind: "condition",
  axis: "state.focus", token: "hover",
  selectorFragment: ":hover",
  effectKind: "condition",
};

// 6. MECHANISM — no CSS at all
const example_modalMechanism: MechanismRule = {
  kind: "mechanism",
  axis: "top-layer-mechanism", token: "modal",
  mechanism: "dialog.showModal()",
  effectKind: "platform-mechanism",
};

const EXAMPLE_RULES: EmittedRule[] = [
  example_gap, example_selectionSubtle, example_selectionSink,
  example_staggerSink, example_hoverCondition, example_modalMechanism,
];

// ============================================================================
// deriveControls — what turns this AST into P7's input, replacing the
// hand-transcribed `controls` lists. Two ownership questions, kept SEPARATE:
//
//   writes — which axis's DeclareRule put a property/variable on the wire.
//            Includes custom-property writes (--selection-bg belongs to
//            selection-treatment here).
//   paints — which axis(es) a REAL CSS property ultimately traces to, once
//            sink rules are resolved. A custom property alone is never a
//            paint — only a "css"-effectKind rule's declarations count, and a
//            SinkRule's paints are jointly owned by every non-condition axis
//            in `composesFrom` (the sanctioned-share list).
//
// P7 (dimensional purity) then runs over `paints`, not `writes`: two FREE
// axes sharing a `writes` entry (e.g. two different custom properties named
// similarly) isn't a violation — CSS variables are namespaced by construction
// — but two free axes sharing a `paints` entry outside a declared sink IS
// exactly the collision predicate 4 exists to catch (the §10.1 stagger and
// selection-skin collisions were both this shape, found by inspection before
// there was a checker; this is what makes the check run itself).
// ============================================================================
export function deriveControls(rules: EmittedRule[]): {
  writes: Record<string, Set<string>>;
  paints: Record<string, Set<string>>;
} {
  const writes: Record<string, Set<string>> = {};
  const paints: Record<string, Set<string>> = {};
  const add = (bucket: Record<string, Set<string>>, axis: string, prop: string) => {
    (bucket[axis] ??= new Set()).add(prop);
  };

  for (const r of rules) {
    if (r.kind === "declares") {
      for (const prop of Object.keys(r.declarations)) {
        add(writes, r.axis, prop);
        if (r.effectKind === "css") add(paints, r.axis, prop);
        // effectKind "custom-property": writes only, never paints — the whole
        // point of the sink-rule mechanism is that writing a variable isn't
        // painting anything until something reads it.
      }
    } else if (r.kind === "reads") {
      const contributors = r.composesFrom.filter((c) => c.role === "contributor");
      for (const prop of Object.keys(r.declarations))
        for (const c of contributors) {
          add(writes, c.axis, prop);
          add(paints, c.axis, prop); // sanctioned joint ownership
        }
    } else if (r.kind === "facet") {
      // every axis contributing a facet to the SAME (selector, property) is a
      // sanctioned joint owner of the merged property — the twin exception,
      // generalized from "structure + m1" specifically to any facet group.
      add(writes, r.axis, r.property);
      add(paints, r.axis, r.property);
    }
    // "condition" and "mechanism": never contribute to writes or paints —
    // P7-4d and the top-layer no-z-index invariant hold by construction, not
    // by a check that could someday be skipped.
  }
  return { writes, paints };
}

// Sanity check against the worked examples above (would be a real assertion
// in the test suite, not console output, once this graduates from design doc).
if (import.meta.url === `file://${process.argv[1]}`) {
  const { writes, paints } = deriveControls(EXAMPLE_RULES);
  console.log("writes:", Object.fromEntries(Object.entries(writes).map(([k, v]) => [k, [...v]])));
  console.log("paints:", Object.fromEntries(Object.entries(paints).map(([k, v]) => [k, [...v]])));
  // Expect: selection-treatment WRITES the three --selection-* variables but
  // PAINTS background/color/outline (via the sink) — never background/color
  // directly on its own selector. motion-micro and motion-macro jointly PAINT
  // transition-delay — sanctioned, not a collision. state.focus and
  // top-layer-mechanism appear in neither bucket at all.
}
