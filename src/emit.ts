// emit.ts — the axis-walker: turns real class strings, parsed against
// registry.ts (via lint.ts's own parser — not a second parser), into
// EmittedRule[] (emitter-types.ts).
//
// WHY WALK CLASS STRINGS, NOT ENUMERATE THE REGISTRY: registry.ts's
// valueSpace mixes literal word lists (structure: horizontal/vertical/...)
// with scale references (density: SCALES.density) and open patterns
// (m2: grow-N). Reverse-enumerating "every possible word" from that would
// mean re-deriving a mini token-generation DSL — fragile, and pointless: a
// real emitter's job is to compile the words actually AUTHORED, exactly the
// way lint.ts already parses them (Tailwind's JIT engine works the same way,
// for the same reason). So `emit()` mirrors `lint()`'s shape on purpose:
//   lint(classString, backing, ctx) -> Issue[]
//   emit(classString, ctx)          -> EmittedRule[]
// Same parse, two different downstream consumers of it.
//
// WHAT THIS FILE ADDS THAT registry.ts DOESN'T HAVE: registry.ts encodes the
// LAW (which words exist, which axis, which properties an axis may touch). It
// does NOT encode which literal CSS VALUE a word produces — deliberately, per
// the same reasoning that put `effectKind` in the emitter layer, not the
// registry: value mapping can change (rename a variable, retune a value)
// without touching the law. The EMISSION table below is that missing layer.
//
// SCOPE: this is real, but not exhaustive. It covers one representative axis
// per STRUCTURAL PATTERN in the registry (plain closed, ordered-chain scale,
// open+dial+alias, closed+parametric member, facet-split, state condition,
// platform mechanism, and both sink shapes) — proving the walker handles
// every shape correctly. Filling in the remaining ~20 axes' EMISSION entries
// is mechanical repetition of these patterns, not a design question.

import { REGISTRY, SCALES, type AxisRecord } from "./registry.ts";
import { parseWord, type Parsed, type LintContext } from "./lint.ts";
import type { EmittedRule, DeclareRule, SinkRule, FacetRule, ConditionRule, MechanismRule } from "./emitter-types.ts";
import { deriveControls } from "./emitter-types.ts";

// ============================================================================
// EMISSION — the value-mapping layer. One entry per axis this walker knows
// how to emit. `plain` receives the FULL authored word (matches lint.ts's
// `body`) and returns declarations, or null if this word needs special
// handling (facet/sink) done elsewhere in `emit()`.
// ============================================================================
interface EmitSpec {
  effectKind: Extract<import("./emitter-types.ts").EffectKind, "css" | "custom-property">;
  plain: (word: string) => Record<string, string> | null;
}

// shared helper: density-scale axes read the same var(--spacing-<step>)
// convention. wordPrefix and property are SEPARATE — they coincide for gap
// (word "gap-comfortable" -> property "gap") and padding, but NOT for
// flow-spacing (word "flow-relaxed" -> property "margin-block-start"). Found
// by checking the real token pattern in registry.ts before trusting the
// emission entry — conflating the two would have silently produced nothing
// for every real flow-* word despite the axis resolving correctly.
const densityDial = (wordPrefix: string, property = wordPrefix) => (word: string): Record<string, string> | null => {
  const m = word.match(new RegExp(`^${wordPrefix}-(${SCALES.density.join("|")})$`));
  return m ? { [property]: `var(--spacing-${m[1]})` } : null;
};

const EMISSION: Record<string, EmitSpec> = {
  // --- plain closed axis (no dials, no parametrics) ---
  structure: {
    effectKind: "css",
    plain: (word): Record<string, string> | null => {
      // display.inner is handled as a FACET below, NOT here — structure alone
      // can't complete a `display` declaration. This entry covers structure's
      // OTHER controls (flex-direction, grid-template-columns, grid-auto-flow).
      switch (word) {
        case "horizontal": return { "flex-direction": "row" };
        case "vertical": return { "flex-direction": "column" };
        case "grid": return { "grid-auto-flow": "row" };
        default: return null;
      }
    },
  },

  // --- plain closed axis (flex-wrap) — the axis `rows` used to shadow ---
  wrapping: {
    effectKind: "css",
    plain: (word) => {
      switch (word) {
        case "wrap-allowed": return { "flex-wrap": "wrap" };
        case "wrap-prevent": return { "flex-wrap": "nowrap" };
        case "wrap-reverse": return { "flex-wrap": "wrap-reverse" };
        default: return null;
      }
    },
  },

  // --- ordered-chain scale axis ---
  density: { effectKind: "css", plain: densityDial("gap") },
  "flow-spacing": { effectKind: "css", plain: densityDial("flow", "margin-block-start") },

  // --- ordered-chain scale axis WITH sub-dials + aliasMatch (padding shape) ---
  padding: {
    effectKind: "css",
    plain: (word) => {
      if (/^padding-(tight|snug|comfortable|relaxed|loose|separated)$/.test(word))
        return densityDial("padding")(word);
      const inline = densityDial("padding-inline")(word);
      if (inline) return inline;
      return densityDial("padding-block")(word);
    },
  },

  // --- open axis, sub-dials + whole-axis aliases (m2-flex shape) ---
  "m2-flex": {
    effectKind: "css",
    plain: (word) => {
      const alias: Record<string, Record<string, string>> = {
        rigid: { "flex-grow": "0", "flex-shrink": "0" },
        compressible: { "flex-grow": "0", "flex-shrink": "1" },
        expandable: { "flex-grow": "1", "flex-shrink": "0" },
        elastic: { "flex-grow": "1", "flex-shrink": "1" },
      };
      if (word in alias) return alias[word];
      const m = word.match(/^(grow|shrink)-(\d+)$/);
      return m ? { [`flex-${m[1]}`]: m[2] } : null;
    },
  },

  // --- closed axis with a parametric member (m3 shape) ---
  "m3-self-size": {
    effectKind: "css",
    plain: (word) => {
      if (word === "basis-content") return { "flex-basis": "content" };
      if (word === "basis-ratio") return { "flex-basis": "0%" };
      const m = word.match(new RegExp(`^basis-exact-(${SCALES.size.join("|")})$`));
      return m ? { "flex-basis": `var(--size-${m[1]})` } : null;
    },
  },

  // --- open axis, four independent dials, no alias (constraints shape) ---
  constraints: {
    effectKind: "css",
    plain: (word) => {
      const m = word.match(new RegExp(`^(min-width|max-width|min-height|max-height)-(${SCALES.size.join("|")})$`));
      return m ? { [m[1]]: `var(--size-${m[2]})` } : null;
    },
  },

  // --- ordered-chain scale axis, sub-dials + aliasMatch (same shape as padding) ---
  margin: {
    effectKind: "css",
    plain: (word) => {
      if (/^margin-(tight|snug|comfortable|relaxed|loose|separated)$/.test(word))
        return densityDial("margin")(word);
      const inline = densityDial("margin-inline")(word);
      if (inline) return inline;
      return densityDial("margin-block")(word);
    },
  },

  // --- plain closed axis: self alignment ---
  "m4-self-alignment": {
    effectKind: "css",
    plain: (word) => {
      const m = word.match(/^self-(start|center|end|stretch|baseline)$/);
      return m ? { "align-self": m[1] } : null;
    },
  },

  // --- sub-dial axis: container alignment (align dial → align-items, justify dial → justify-content) ---
  "alignment-container": {
    effectKind: "css",
    plain: (word): Record<string, string> | null => {
      const a = word.match(/^align-(start|center|end|stretch|baseline)$/);
      if (a) return { "align-items": a[1] };
      const j = word.match(/^justify-(start|center|end|between|around)$/);
      if (j) return { "justify-content": j[1] === "between" || j[1] === "around" ? `space-${j[1]}` : j[1] };
      return null;
    },
  },

  // --- sub-dials + whole-axis aliases: overflow. Longhands only (never the `overflow`
  //     shorthand), same discipline as m2-flex — so a per-axis dial composes with itself
  //     and the whole-axis words (scroll-auto/clip) write BOTH longhands. ---
  overflow: {
    effectKind: "css",
    plain: (word): Record<string, string> | null => {
      switch (word) {
        case "scroll-x": return { "overflow-x": "scroll" };
        case "scroll-y": return { "overflow-y": "scroll" };
        case "scroll-auto": return { "overflow-x": "auto", "overflow-y": "auto" };
        case "clip": return { "overflow-x": "clip", "overflow-y": "clip" };
        default: return null;
      }
    },
  },

  // --- plain closed axis: position mode (strip the `position-` grammar prefix) ---
  "position-mode": {
    effectKind: "css",
    plain: (word) => {
      const m = word.match(/^position-(static|relative|absolute|fixed|sticky)$/);
      return m ? { position: m[1] } : null;
    },
  },

  // --- single-member axis: stacking context ---
  "stacking-context": {
    effectKind: "css",
    plain: (word) => (word === "isolate" ? { isolation: "isolate" } : null),
  },

  // --- conditioned-skin: writes custom properties, paints nothing itself ---
  "selection-treatment": {
    effectKind: "custom-property",
    plain: (word) => {
      if (word === "selection-subtle")
        return { "--selection-bg": "var(--harmonic-wash)", "--selection-ink": "var(--ink)", "--selection-outline": "none" };
      if (word === "selection-strong")
        return { "--selection-bg": "var(--harmonic)", "--selection-ink": "var(--base-tone)", "--selection-outline": "2px solid var(--harmonic)" };
      return null;
    },
  },

  // --- motion-micro: writes its own custom property (--own-delay), consumed
  // by the stagger sink AND declares its own easing/direction CSS directly ---
  "motion-micro": {
    effectKind: "css",
    plain: (word): Record<string, string> | null => {
      const easing: Record<string, string> = { decelerate: "ease-out", accelerate: "ease-in", standard: "ease", emphasized: "cubic-bezier(.2,0,0,1)" };
      if (word in easing) return { "transition-timing-function": easing[word] };
      if (word === "symmetric" || word === "asymmetric") return { "--motion-direction": word }; // informational var, not a sink input
      return null;
    },
  },
  // motion-macro's `together`/`sequence`/`cascade` don't declare directly —
  // they only parameterize the stagger SINK (below) — so no plain() entries
  // needed; the sink template owns all of motion-macro's emission.
};

// facet-writing axes (structure + m1-flow-participation → display) — kept
// separate from EMISSION because a FacetRule isn't a complete declaration.
const FACET_EMISSION: Record<string, (word: string) => { property: string; facet: string; value: string } | null> = {
  structure: (word) => {
    const inner: Record<string, string> = { horizontal: "flex", vertical: "flex", grid: "grid" };
    return word in inner ? { property: "display", facet: "inner", value: inner[word] } : null;
  },
  "m1-flow-participation": (word) => {
    const outer: Record<string, string> = { inline: "inline", boxed: "block", "boxed-inline": "inline-block" };
    return word in outer ? { property: "display", facet: "outer", value: outer[word] } : null;
  },
};

// platform mechanisms — genuinely bespoke DOM/JS APIs, not derivable from
// anything else in the registry.
const MECHANISM: Record<string, string> = {
  modal: "dialog.showModal()",
  popover: "[popover] + .showPopover()",
  overlay: "top-layer promotion (implementation-defined)",
  toast: "top-layer promotion (implementation-defined)",
};

// ============================================================================
// SINKS — relational, cross-axis compositions. Can't live on a single axis's
// EMISSION entry because they only exist when SEVERAL words co-occur.
// ============================================================================
interface SinkTemplate {
  id: string;
  // every requirement must be satisfied by at least one parsed word for the
  // sink to fire. `word` omitted = any word on that axis satisfies it — in
  // which case the selector fragment is derived from WHICHEVER word actually
  // matched at emit time (there's no single static fragment for "any word on
  // motion-micro", so this can't be precomputed on the template).
  requires: { axis: string; word?: string; role: "condition" | "contributor" }[];
  declarations: Record<string, string>;
  reads: string[];
}

const SINKS: SinkTemplate[] = [
  {
    id: "selection-sink",
    requires: [
      { axis: "state.selection", word: "selectable", role: "condition" },
      { axis: "state.selection", word: "selected", role: "condition" },
      { axis: "selection-treatment", role: "contributor" },
    ],
    declarations: { background: "var(--selection-bg)", color: "var(--selection-ink)", outline: "var(--selection-outline)" },
    reads: ["--selection-bg", "--selection-ink", "--selection-outline"],
  },
  {
    id: "stagger-sink",
    requires: [
      { axis: "motion-micro", role: "contributor" },
      { axis: "motion-macro", role: "contributor" },
    ],
    declarations: { "transition-delay": "calc(var(--own-delay,0ms) + var(--stagger,0ms))" },
    reads: ["--own-delay", "--stagger"],
  },
];

// Selector fragment for one MATCHED parsed word — the same entailment data
// ConditionRules use (real thing over bare class, per the constitution's
// "backed by the real truth" rule), falling back to the word's own class when
// there's no entailment to select on (capability words; plain layout axes).
function fragmentForMatch(p: Parsed): string {
  const fromEntails = p.stateMember ? selectorFragmentFromEntails(p.stateMember.entails) : "";
  return fromEntails || `.${p.raw}`;
}

// ============================================================================
// THE WALKER
// ============================================================================
// implements: R-COMPILE-01
export function emit(classString: string, ctx: LintContext = {}, scope?: string): EmittedRule[] {
  const words = classString.trim().split(/\s+/).filter(Boolean);
  const parsed: Parsed[] = words.map(parseWord);
  const out: EmittedRule[] = [];

  for (const p of parsed) {
    if (!p.axis) continue; // unresolved words are a lint concern (P2), not an emit concern
    const ax = REGISTRY.find((a) => a.axis === p.axis) as AxisRecord | undefined;
    if (!ax) continue;

    // 1. state axis → ConditionRule, selector fragment derived from the
    //    member's own `entails` set (reuses real registry data instead of a
    //    second manual table).
    if (ax.stateGroup && p.stateMember) {
      out.push({
        kind: "condition", axis: ax.axis, token: p.raw,
        selectorFragment: selectorFragmentFromEntails(p.stateMember.entails),
        effectKind: "condition",
      } satisfies ConditionRule);
      continue;
    }

    // 2. platform mechanism
    if (ax.axis === "top-layer-mechanism" && MECHANISM[p.raw]) {
      out.push({ kind: "mechanism", axis: ax.axis, token: p.raw, mechanism: MECHANISM[p.raw], effectKind: "platform-mechanism" } satisfies MechanismRule);
      continue;
    }

    // 3. facet-writing axis (display twin)
    const facet = FACET_EMISSION[ax.axis]?.(p.raw);
    if (facet) {
      out.push({
        kind: "facet", axis: ax.axis, token: p.raw,
        selector: `.${p.raw}`, property: facet.property, facet: facet.facet, value: facet.value,
        effectKind: "css", scope,
      } satisfies FacetRule);
      // structure also has ordinary (non-facet) declarations — fall through
      // rather than `continue`, so both get emitted for the same word.
    }

    // 4. ordinary declares (covers the facet-axis's non-facet properties too)
    const spec = EMISSION[ax.axis];
    const decl = spec?.plain(p.raw);
    if (decl) {
      out.push({
        kind: "declares", axis: ax.axis, token: p.raw,
        selector: `.${p.raw}`, declarations: decl, effectKind: spec.effectKind, scope,
      } satisfies DeclareRule);
    }
  }

  // 5. sinks — check co-presence across ALL parsed words, then emit once,
  //    building the selector from the WORDS THAT ACTUALLY MATCHED, not a
  //    precomputed template string.
  for (const sink of SINKS) {
    const matches = sink.requires.map((req) =>
      parsed.find((p) => p.axis === req.axis && (req.word === undefined || p.raw === req.word)));
    if (matches.some((m) => !m)) continue;
    out.push({
      kind: "reads",
      composesFrom: sink.requires.map((r, i) => ({ axis: r.axis, token: matches[i]!.raw, role: r.role })),
      selector: matches.map((m) => fragmentForMatch(m!)).join(""),
      declarations: sink.declarations, reads: sink.reads,
      effectKind: "css", scope,
    } satisfies SinkRule);
  }

  return out;
}

function selectorFragmentFromEntails(entails: string[] | undefined): string {
  const first = entails?.[0];
  if (!first) return "";
  if (first.startsWith(":") || first.startsWith("[")) return first; // already CSS syntax
  if (first.includes("=")) { const [attr, val] = first.split("="); return `[${attr}="${val}"]`; }
  return `[${first}]`; // bare attribute name — entailment is a disjunctive SET
                        // for linting (any-one satisfies); CSS selection needs
                        // ONE canonical form, so this picks entails[0] as
                        // representative. A real emitter might want this
                        // configurable per-project rather than hardcoded.
}

// ============================================================================
// P7 — DIMENSIONAL PURITY FROM GENERATED CSS. The registry-build invariant
// this whole emitter exists to make authoritative: no two FREE-regime axes
// paint the same property, EXCEPT where a FacetRule or SinkRule explicitly
// sanctions the overlap. Same standing-check shape as P0 in registry.ts —
// this is a property of the REGISTRY, not of any one class string.
// ============================================================================

// A representative vocabulary per axis with EMISSION coverage — enough words
// to exercise every declaration each axis can produce, not just one sample.
// Deliberately axis-specific (not derived generically from valueSpace) for
// the same reason EMISSION itself is axis-specific: word shape isn't uniform
// across the registry (see the flow-spacing bug above).
export const VOCABULARY: Record<string, string[]> = {
  structure: ["horizontal", "vertical", "grid"],
  wrapping: ["wrap-allowed", "wrap-prevent", "wrap-reverse"],
  "m1-flow-participation": ["inline", "boxed", "boxed-inline"],
  density: SCALES.density.map((s) => `gap-${s}`),
  "flow-spacing": SCALES.density.map((s) => `flow-${s}`),
  padding: [
    ...SCALES.density.map((s) => `padding-${s}`),
    ...SCALES.density.map((s) => `padding-inline-${s}`),
    ...SCALES.density.map((s) => `padding-block-${s}`),
  ],
  "m2-flex": ["rigid", "compressible", "expandable", "elastic", "grow-1", "grow-2", "shrink-1"],
  "m3-self-size": ["basis-content", "basis-ratio", ...SCALES.size.map((s) => `basis-exact-${s}`)],
  constraints: ["min-width", "max-width", "min-height", "max-height"].flatMap((d) => SCALES.size.map((s) => `${d}-${s}`)),
  margin: [
    ...SCALES.density.map((s) => `margin-${s}`),
    ...SCALES.density.map((s) => `margin-inline-${s}`),
    ...SCALES.density.map((s) => `margin-block-${s}`),
  ],
  "m4-self-alignment": ["self-start", "self-center", "self-end", "self-stretch", "self-baseline"],
  "alignment-container": ["align-start", "align-center", "align-end", "align-stretch", "align-baseline", "justify-start", "justify-center", "justify-end", "justify-between", "justify-around"],
  overflow: ["scroll-x", "scroll-y", "scroll-auto", "clip"],
  "position-mode": ["position-static", "position-relative", "position-absolute", "position-fixed", "position-sticky"],
  "stacking-context": ["isolate"],
  "selection-treatment": ["selection-subtle", "selection-strong"],
  "motion-micro": ["decelerate", "accelerate", "standard", "emphasized", "symmetric", "asymmetric"],
  "motion-macro": ["together", "sequence", "cascade"],
  "top-layer-mechanism": ["overlay", "modal", "popover", "toast"],
};

// Composed strings needed ON TOP of single-word enumeration, because sinks
// and facets only exist when several words co-occur — no amount of
// one-word-at-a-time walking will ever produce them.
const COMPOSED_PROOFS: string[] = [
  "horizontal inline",                                             // display facet twin
  "selectable selected selection-subtle",                          // selection sink
  "selectable selected selection-strong",
  "decelerate cascade", "accelerate sequence", "standard together", // stagger sink, each choreography
];

export interface PurityViolation { property: string; axes: [string, string] }

// implements: LAW-3, R-MOTION-03, R-TEST-02
export function checkDimensionalPurity(): PurityViolation[] {
  // process each emit() call as its own BATCH — facet sanctioning needs to
  // know which facet rules fired TOGETHER in the same composed string, not
  // which ones happen to share a selector string (they don't: `structure`'s
  // facet rule sits on `.horizontal`, `m1-flow-participation`'s sits on
  // `.inline` — different selectors, same property, sanctioned only because
  // they were emitted from the SAME class string).
  const batches: EmittedRule[][] = [
    ...Object.values(VOCABULARY).flat().map((w) => emit(w)),
    ...COMPOSED_PROOFS.map((c) => emit(c)),
  ];
  const rules = batches.flat();
  const { paints } = deriveControls(rules);

  // sanctioned pairs: axes explicitly allowed to co-paint a property, because
  // a FacetRule or SinkRule fired together in some real emitted batch — the
  // sink/facet's co-occurrence IS the sanction, computed from the rules, not
  // asserted.
  const pairKey = (a: string, b: string, prop: string) => [a, b].sort().join("~") + "::" + prop;
  const sanctioned = new Set<string>();

  for (const batch of batches) {
    // facets: any two facet rules in the SAME batch sharing a property are a
    // sanctioned pair for that property (they're the twin, by construction —
    // a batch only ever contains one composed string's worth of rules).
    const facetsByProperty = new Map<string, string[]>();
    for (const r of batch) if (r.kind === "facet")
      (facetsByProperty.get(r.property) ?? facetsByProperty.set(r.property, []).get(r.property)!).push(r.axis);
    for (const [prop, axes] of facetsByProperty)
      for (let i = 0; i < axes.length; i++)
        for (let j = i + 1; j < axes.length; j++)
          sanctioned.add(pairKey(axes[i], axes[j], prop));

    // sinks: every pair of contributor axes is sanctioned for every property
    // that sink's declarations paint.
    for (const r of batch) if (r.kind === "reads") {
      const contributors = [...new Set(r.composesFrom.filter((c) => c.role === "contributor").map((c) => c.axis))];
      for (const prop of Object.keys(r.declarations))
        for (let i = 0; i < contributors.length; i++)
          for (let j = i + 1; j < contributors.length; j++)
            sanctioned.add(pairKey(contributors[i], contributors[j], prop));
    }
  }

  // now the actual check: for each property, do two DIFFERENT free axes both
  // paint it, outside a sanctioned pair?
  const byProperty = new Map<string, Set<string>>();
  for (const [axis, props] of Object.entries(paints))
    for (const prop of props)
      (byProperty.get(prop) ?? byProperty.set(prop, new Set()).get(prop)!).add(axis);

  const violations: PurityViolation[] = [];
  for (const [prop, axesSet] of byProperty) {
    const freeAxes = [...axesSet].filter((a) => REGISTRY.find((ax) => ax.axis === a)?.regime === "free");
    for (let i = 0; i < freeAxes.length; i++)
      for (let j = i + 1; j < freeAxes.length; j++) {
        const [a, b] = [freeAxes[i], freeAxes[j]];
        if (!sanctioned.has(pairKey(a, b, prop))) violations.push({ property: prop, axes: [a, b] });
      }
  }
  return violations;
}


// ============================================================================
// PROOF RUN — a real, composed class string exercising every rule kind at
// once: structure+m1 facet merge, an ordinary scale axis, a parametric
// member, a state condition, the selection sink (state + conditioned-skin),
// and a platform mechanism, all walked from REAL registry.ts data via the
// SAME parser lint.ts uses. Then P7 over the full vocabulary this walker
// covers — the actual build gate, run via `npx tsx emit.ts`.
// ============================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  const cls = "horizontal inline gap-comfortable basis-content selectable selected selection-subtle modal decelerate cascade";
  console.log(`emit("${cls}")\n`);
  const rules = emit(cls);
  for (const r of rules) console.log(JSON.stringify(r, null, 0));

  const { writes, paints } = deriveControls(rules);
  console.log("\nwrites:", Object.fromEntries(Object.entries(writes).map(([k, v]) => [k, [...v]])));
  console.log("paints:", Object.fromEntries(Object.entries(paints).map(([k, v]) => [k, [...v]])));
  console.log(`\n${rules.length} rules from ${cls.split(" ").length} words: ` +
    `${rules.filter(r => r.kind === "declares").length} declares, ` +
    `${rules.filter(r => r.kind === "facet").length} facet, ` +
    `${rules.filter(r => r.kind === "reads").length} sink, ` +
    `${rules.filter(r => r.kind === "condition").length} condition, ` +
    `${rules.filter(r => r.kind === "mechanism").length} mechanism.`);

  console.log(`\n--- P7: dimensional purity (${Object.keys(VOCABULARY).length} axes with emission coverage) ---`);
  const violations = checkDimensionalPurity();
  if (violations.length) {
    console.log(`P7: FAILED — ${violations.length} unsanctioned collision(s):`);
    for (const v of violations)
      console.log(`  '${v.property}' painted by both '${v.axes[0]}' and '${v.axes[1]}' — not a declared facet or sink pair.`);
    process.exitCode = 1;
  } else {
    console.log(`P7: ok — no unsanctioned property collisions across ${Object.keys(VOCABULARY).length} axes, ` +
      `derived from ${Object.values(VOCABULARY).flat().length + COMPOSED_PROOFS.length} emitted class strings ` +
      `(not transcribed).`);
  }
}
