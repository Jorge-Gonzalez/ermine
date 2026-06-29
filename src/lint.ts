// lint.ts — parser + core predicates over registry.ts. Proves the registry shape
// supports validation, including the cases the constitution's "next action" names:
//   horizontal vertical            -> P1 one-word-per-axis
//   rigid grow-2                   -> P5 weight-implies-direction
//   selected (no backing)          -> P8 state-entailment
//   stretchy                       -> P2 no-coining / unknown-word
// Plus the amended Law 2: horizontal viewport-md:vertical is WELL-FORMED.

import { REGISTRY, STATE, ENVIRONMENT_SCOPES, type AxisRecord, type StateMember } from "./registry.ts";

export interface Parsed {
  raw: string;
  scope: string;            // "base" or an environment prefix id like "viewport-md"
  axis: string | null;      // resolved axis id, or null if unknown
  member: string | null;    // resolved member/word
  value?: string | number;  // open-axis parameter value
  stateMember?: StateMember;
}

export interface Issue { level: "error" | "warn"; rule: string; msg: string }

// --- parse one authored word into (scope, axis, member, value?) ---
export function parseWord(raw: string): Parsed {
  let scope = "base";
  let body = raw;

  // environment scope prefix? split on the first colon
  const colon = raw.indexOf(":");
  if (colon !== -1) {
    const prefix = raw.slice(0, colon);
    const sp = ENVIRONMENT_SCOPES.find((s) => s.pattern.test(prefix));
    if (sp) { scope = prefix; body = raw.slice(colon + 1); }
  }

  // try every axis's tokens
  for (const ax of REGISTRY) {
    for (const tok of ax.tokens) {
      const m = body.match(tok.pattern);
      if (m) {
        // state member resolution
        let stateMember: StateMember | undefined;
        if (ax.stateGroup) {
          const word = m[1]?.split("-").slice(0, -1).join("-") || body;
          stateMember = ax.stateGroup.members.find((sm) => body === sm.word || body.startsWith(sm.word + "-"));
        }
        const value = m[2] !== undefined ? (/^\d+$/.test(m[2]) ? Number(m[2]) : m[2]) : undefined;
        return { raw, scope, axis: ax.axis, member: m[1] ?? body, value, stateMember };
      }
    }
  }
  return { raw, scope, axis: null, member: null };
}

// --- P1: one word per axis PER SCOPE (Law 2, amended) ---
export function p1_oneWordPerAxisPerScope(parsed: Parsed[]): Issue[] {
  const seen = new Map<string, string>(); // key = scope|axis -> first raw word
  const out: Issue[] = [];
  for (const p of parsed) {
    if (!p.axis) continue;
    const key = `${p.scope}|${p.axis}`;
    if (seen.has(key)) {
      out.push({ level: "error", rule: "one-word-per-axis",
        msg: `'${p.raw}' conflicts with '${seen.get(key)}' — both are axis '${p.axis}' in scope '${p.scope}'` });
    } else seen.set(key, p.raw);
  }
  return out;
}

// --- P2: unknown word / no-coining ---
export function p2_unknownWord(parsed: Parsed[]): Issue[] {
  return parsed.filter((p) => p.axis === null).map((p) => ({
    level: "error" as const, rule: "unknown-word",
    msg: `'${p.raw}' resolves to no axis — not a member of any closed axis and not a sanctioned parameter. Do not coin; report a gap.`,
  }));
}

// --- P5: weight implies direction on (rigid grow-2 is a contradiction) ---
export function p5_weightImpliesDirection(parsed: Parsed[]): Issue[] {
  const out: Issue[] = [];
  const words = new Set(parsed.map((p) => p.member));
  const hasGrowWeight = parsed.some((p) => p.member === "grow" && typeof p.value === "number" && p.value > 0);
  const hasShrinkWeight = parsed.some((p) => p.member === "shrink" && typeof p.value === "number" && p.value > 0);
  if (words.has("rigid") && (hasGrowWeight || hasShrinkWeight))
    out.push({ level: "error", rule: "weight-implies-direction",
      msg: "`rigid` (grow-0 shrink-0) contradicts a positive grow/shrink weight — the weight turns the direction on." });
  return out;
}

// --- P8: state entailment (category-dispatched), instance form ---
// backing = the set of platform truths present on the element (caller supplies)
export function p8_stateEntailment(parsed: Parsed[], backing: Set<string>): Issue[] {
  const out: Issue[] = [];
  for (const p of parsed) {
    const sm = p.stateMember;
    if (!sm) continue;
    if (sm.stateCategory === "instance") {
      const set = sm.entails ?? [];
      if (set.length && !set.some((b) => backing.has(b)))
        out.push({ level: "error", rule: "state-entailment",
          msg: `'${sm.word}' requires one of {${set.join(", ")}} on this element — none present (visually-true-but-semantically-false).` });
    }
    // capability / conditioned-skin entail nothing; relational checked against container (omitted in this smoke test)
  }
  return out;
}

export function lint(classString: string, backing = new Set<string>()): Issue[] {
  const parsed = classString.trim().split(/\s+/).filter(Boolean).map(parseWord);
  return [
    ...p2_unknownWord(parsed),
    ...p1_oneWordPerAxisPerScope(parsed),
    ...p5_weightImpliesDirection(parsed),
    ...p8_stateEntailment(parsed, backing),
  ];
}

// ============================================================================
// SMOKE TEST
// ============================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  const cases: { s: string; backing?: string[]; expect: "ok" | "fail" }[] = [
    { s: "horizontal gap-comfortable padding-relaxed", expect: "ok" },
    { s: "horizontal vertical", expect: "fail" },                       // P1
    { s: "horizontal viewport-md:vertical", expect: "ok" },             // Law 2 amended: different scopes
    { s: "viewport-md:horizontal viewport-md:vertical", expect: "fail" }, // same scope, same axis
    { s: "rigid grow-2", expect: "fail" },                              // P5
    { s: "elastic grow-2", expect: "ok" },
    { s: "selected", expect: "fail" },                                  // P8 no backing
    { s: "selected", backing: ["aria-pressed"], expect: "ok" },         // P8 Law-6b disjunction
    { s: "selectable", expect: "ok" },                                  // capability entails nothing
    { s: "stretchy", expect: "fail" },                                  // P2 coined
    { s: "modal", expect: "ok" },                                       // top-layer mechanism, not a z rung
    { s: "basis-exact-md", expect: "ok" },                              // token-indexed
    { s: "basis-exact-240", expect: "fail" },                           // raw px is OUT in v0
    { s: "grid padding-comfortable selectable selection-subtle", backing: [], expect: "ok" },
  ];

  let pass = 0;
  for (const c of cases) {
    const issues = lint(c.s, new Set(c.backing ?? []));
    const got: "ok" | "fail" = issues.length ? "fail" : "ok";
    const ok = got === c.expect;
    pass += ok ? 1 : 0;
    console.log(`${ok ? "PASS" : "XXXX"}  [${got}] ${c.s}${c.backing ? ` (backing: ${c.backing.join(",")||"∅"})` : ""}`);
    for (const i of issues) console.log(`         ${i.level}: ${i.rule} — ${i.msg}`);
  }
  console.log(`\n${pass}/${cases.length} cases behaved as expected.`);
}
