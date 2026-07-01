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

// shared helper: the four density-scale axes (gap/flow/padding/margin) all
// read the same var(--spacing-<step>) convention — one function, four axes.
const densityDial = (property: string) => (word: string): Record<string, string> | null => {
  const m = word.match(new RegExp(`^${property}-(${SCALES.density.join("|")})$`));
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
        case "rows": return { "flex-direction": "row", "flex-wrap": "wrap" };
        case "grid": return { "grid-auto-flow": "row" };
        default: return null;
      }
    },
  },

  // --- ordered-chain scale axis ---
  density: { effectKind: "css", plain: densityDial("gap") },
  "flow-spacing": { effectKind: "css", plain: densityDial("margin-block-start") },

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
    const inner: Record<string, string> = { horizontal: "flex", vertical: "flex", rows: "flex", grid: "grid" };
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
// PROOF RUN — a real, composed class string exercising every rule kind at
// once: structure+m1 facet merge, an ordinary scale axis, a parametric
// member, a state condition, the selection sink (state + conditioned-skin),
// and a platform mechanism, all walked from REAL registry.ts data via the
// SAME parser lint.ts uses.
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
}
