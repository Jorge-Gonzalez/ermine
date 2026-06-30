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
  isAlias?: boolean;        // m2: a whole-axis alias (complete value, mutually exclusive)
  dial?: string | null;     // m2: which sub-dial a parametric token sets (grow/shrink)
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
          // exact-word match first (so `focus-visible` doesn't resolve to `focus`),
          // then prefix match for enum members (`current-page` → `current`).
          stateMember = ax.stateGroup.members.find((sm) => body === sm.word)
            ?? ax.stateGroup.members.find((sm) => body.startsWith(sm.word + "-"));
        }
        const value = m[2] !== undefined ? (/^\d+$/.test(m[2]) ? Number(m[2]) : m[2]) : undefined;
        const member = m[1] ?? body;
        // is this a whole-axis alias, or which sub-dial does this token set?
        // dialOf receives the full authored word (body), so dials keyed by prefix
        // (align-/justify-, padding-inline-/-block-) resolve correctly.
        const isAlias = ax.aliases?.some((a) => a.word === body) || ax.aliasMatch?.(body) || false;
        const dial = ax.dialOf ? ax.dialOf(body) : undefined;
        return { raw, scope, axis: ax.axis, member, value, isAlias, dial, stateMember };
      }
    }
  }
  return { raw, scope, axis: null, member: null };
}

// --- P1: one word per axis PER SCOPE (Law 2, amended) ---
// Refinements for the two member-role sizing shapes:
//   • whole-axis ALIASES (m2 corners): an alias is a COMPLETE value, so it
//     conflicts with ANY other word on the same axis/scope (another alias OR a dial).
//   • SUB-DIALS (m2 grow/shrink): parametric tokens on DIFFERENT dials compose;
//     two on the SAME dial conflict.
//   • plain axes: at most one word per axis/scope (unchanged).
export function p1_oneWordPerAxisPerScope(parsed: Parsed[]): Issue[] {
  const out: Issue[] = [];
  const byKey = new Map<string, Parsed[]>(); // scope|axis -> words
  for (const p of parsed) {
    if (!p.axis) continue;
    const key = `${p.scope}|${p.axis}`;
    byKey.set(key, [...(byKey.get(key) ?? []), p]);
  }

  for (const [, words] of byKey) {
    const ax = REGISTRY.find((a) => a.axis === words[0].axis);
    const hasDials = !!ax?.subDials;
    const aliases = words.filter((w) => w.isAlias);
    const nonAliases = words.filter((w) => !w.isAlias);

    if (hasDials || (ax?.aliases?.length ?? 0) > 0) {
      // m2-style: aliases are whole-axis (complete) values.
      if (aliases.length >= 1 && words.length > 1) {
        const others = words.filter((w) => w.raw !== aliases[0].raw).map((w) => w.raw);
        out.push({ level: "error", rule: "one-word-per-axis",
          msg: `'${aliases[0].raw}' is a whole-axis value (it fixes every dial of '${words[0].axis}') — it cannot combine with '${others.join("', '")}'. Use either the alias OR the numbered dials.` });
        continue;
      }
      // no alias: numbered dials — one value per dial.
      const seenDial = new Map<string, string>();
      for (const p of nonAliases) {
        const d = p.dial ?? "(value)";
        if (seenDial.has(d))
          out.push({ level: "error", rule: "one-word-per-axis",
            msg: `'${p.raw}' and '${seenDial.get(d)}' both set the '${d}' dial of '${p.axis}'.` });
        else seenDial.set(d, p.raw);
      }
      continue;
    }

    // state-group axis: exclusivity is "one" (alternatives) or "many" (co-present
    // predicates, with optional pairwise conflicts).
    if (ax?.stateGroup) {
      const sg = ax.stateGroup;
      const present = words.map((w) => w.stateMember?.word ?? w.member).filter(Boolean) as string[];
      if (sg.exclusivity === "one" && words.length > 1) {
        out.push({ level: "error", rule: "one-word-per-axis",
          msg: `'${words.map((w) => w.raw).join("', '")}' — only one '${words[0].axis}' state at a time (mutually exclusive group).` });
      } else if (sg.conflicts?.length) {
        for (const [a, b] of sg.conflicts)
          if (present.includes(a) && present.includes(b))
            out.push({ level: "error", rule: "state-conflict",
              msg: `'${a}' and '${b}' cannot both apply on '${words[0].axis}'.` });
      }
      continue;
    }

    // plain axis: more than one word is a conflict
    if (words.length > 1)
      out.push({ level: "error", rule: "one-word-per-axis",
        msg: `'${words.map((w) => w.raw).join("', '")}' conflict — all axis '${words[0].axis}' in scope '${words[0].scope}'` });
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

// --- P8: state entailment (category-dispatched), instance form ---
// backing = the set of platform truths present on the element (caller supplies)
export function p8_stateEntailment(parsed: Parsed[], backing: Set<string>): Issue[] {
  const out: Issue[] = [];
  for (const p of parsed) {
    const sm = p.stateMember;
    if (!sm) continue;
    // skip a malformed enumerated word (no valid value) — P4 owns that diagnosis;
    // complaining about backing for a not-well-formed word is noise.
    if (sm.arity === "enumerated" && p.value === undefined) continue;
    if (sm.stateCategory === "instance") {
      const set = sm.entails ?? [];
      if (set.length && !set.some((b) => backing.has(b)))
        out.push({ level: "error", rule: "state-entailment",
          msg: `'${sm.word}' requires one of {${set.join(", ")}} on this element — none present (visually-true-but-semantically-false).` });
    }
    // capability / conditioned-skin entail nothing; relational handled by p8b below.
  }
  return out;
}

// Context for relational checks: the element's own id, and the container's attributes.
// Both optional — when absent, relational checks are skipped (not failed), since the
// linter then has no way to see the inverted backing.
export interface LintContext {
  elementId?: string;
  containerAttrs?: Record<string, string>;
}

// --- P8b: RELATIONAL state entailment (inverted — backing on the CONTAINER) ---
// A relational member (e.g. `active-descendant`) is NOT backed by an attribute on the
// element itself, but by the CONTAINER pointing at this element's id (e.g. the listbox's
// `aria-activedescendant` === this option's id). Ported from combobox-audit.ts.
export function p8b_relationalEntailment(parsed: Parsed[], ctx: LintContext): Issue[] {
  const out: Issue[] = [];
  for (const p of parsed) {
    const sm = p.stateMember;
    if (!sm || sm.stateCategory !== "relational") continue;
    const rb = sm.relationalBacking;
    if (!rb) continue;
    // No context to check against → skip (can't verify, don't false-positive).
    if (ctx.containerAttrs === undefined || ctx.elementId === undefined) continue;
    if (ctx.containerAttrs[rb.containerAttr] !== ctx.elementId)
      out.push({ level: "error", rule: "state-entailment-relational",
        msg: `'${sm.word}' requires the container's ${rb.containerAttr} to point at this element's id ('${ctx.elementId}') — it points elsewhere or is absent.` });
  }
  return out;
}

// --- P4: enumerated arity must carry a value from its closed set ---
// An enumerated state member must be written WITH a value drawn from enumValues.
// The parser captures a valid value (Parsed.value set) via the valid-value token;
// a bare or wrong-valued word matches the fallback token (value undefined), which
// P4 flags — distinguishing "missing value" from "value not in set" by whether a
// `-tail` was supplied.
export function p4_enumArity(parsed: Parsed[]): Issue[] {
  const out: Issue[] = [];
  for (const p of parsed) {
    const sm = p.stateMember;
    if (!sm || sm.arity !== "enumerated") continue;
    if (p.value !== undefined) continue; // valid value captured — ok
    const set = sm.enumValues ?? [];
    const triedTail = p.raw.startsWith(sm.word + "-"); // wrote `word-something`
    if (triedTail)
      out.push({ level: "error", rule: "enum-arity",
        msg: `'${p.raw}' — value not in {${set.join(", ")}} for enumerated state '${sm.word}'.` });
    else
      out.push({ level: "error", rule: "enum-arity",
        msg: `'${sm.word}' is enumerated — it needs a value: one of {${set.join(", ")}} (e.g. '${sm.word}-${set[0] ?? "value"}').` });
  }
  return out;
}

// --- P6: arity misuse (a binary member can't carry an enumerated/tri-state value) ---
// The high-value form is (b): a BINARY state whose BACKING is a tri-state truth that
// has its own dedicated word (`selected` backed by `aria-checked=mixed` → `checked-mixed`).
// Form (a) — a binary word written with a value suffix like `selected-mixed` — is left to
// P2 `unknown-word` (there is no such token), which is an accurate diagnosis; adding binary
// "base + illegal tail" fallback tokens would over-match typos, so it's deliberately not done.
export function p6_arityMisuse(parsed: Parsed[], backing: Set<string>): Issue[] {
  const out: Issue[] = [];
  for (const p of parsed) {
    const sm = p.stateMember;
    if (!sm || sm.arity !== "binary") continue;
    // (b) binary word standing in for a tri-state truth that has its own word
    if (sm.word === "selected" && (backing.has("aria-checked=mixed") || backing.has(":indeterminate")))
      out.push({ level: "error", rule: "arity-misuse",
        msg: `'selected' with a mixed/indeterminate backing — use the dedicated word 'checked-mixed'.` });
  }
  return out;
}

export function lint(classString: string, backing = new Set<string>(), ctx: LintContext = {}): Issue[] {
  const parsed = classString.trim().split(/\s+/).filter(Boolean).map(parseWord);
  return [
    ...p2_unknownWord(parsed),
    ...p1_oneWordPerAxisPerScope(parsed),  // m2 alias/dial rules folded in (was P5)
    ...p4_enumArity(parsed),
    ...p6_arityMisuse(parsed, backing),
    ...p8_stateEntailment(parsed, backing),
    ...p8b_relationalEntailment(parsed, ctx),
  ];
}

// ============================================================================
// SMOKE TEST
// ============================================================================
if (import.meta.url === `file://${process.argv[1]}`) {
  const cases: { s: string; backing?: string[]; ctx?: LintContext; expect: "ok" | "fail"; why?: string }[] = [
    { s: "horizontal gap-comfortable padding-relaxed", expect: "ok" },
    { s: "horizontal vertical", expect: "fail", why: "P1 same axis/scope" },
    { s: "horizontal viewport-md:vertical", expect: "ok", why: "Law 2: different scopes" },
    { s: "viewport-md:horizontal viewport-md:vertical", expect: "fail", why: "same scope, same axis" },
    // m2 — whole-axis aliases vs numbered dials
    { s: "rigid grow-2", expect: "fail", why: "alias is whole-axis; can't combine with a dial" },
    { s: "elastic grow-2", expect: "fail", why: "alias is whole-axis; can't combine with a dial" },
    { s: "expandable shrink-2", expect: "fail", why: "alias fixes both dials; shrink-2 conflicts" },
    { s: "elastic", expect: "ok", why: "alias alone" },
    { s: "grow-2 shrink-1", expect: "ok", why: "numbered dials, one per dial" },
    { s: "grow-2 grow-3", expect: "fail", why: "two values on the same dial" },
    { s: "grow-1", expect: "ok", why: "single dial" },
    // m3 / m5 — closed-with-parametric-member
    { s: "basis-exact-md", expect: "ok", why: "parametric member, valid token" },
    { s: "basis-exact-240", expect: "fail", why: "raw px OUT in v0" },
    { s: "basis-content", expect: "ok", why: "closed member" },
    { s: "basis-content basis-exact-md", expect: "fail", why: "two members of one closed axis" },
    { s: "grid span-all", expect: "ok", why: "contextual member under grid" },
    { s: "grid span-2 span-all", expect: "fail", why: "two members of one closed axis" },
    { s: "grid span-2", expect: "ok", why: "parametric member" },
    // state
    { s: "selected", expect: "fail", why: "P8 no backing" },
    { s: "selected", backing: ["aria-pressed"], expect: "ok", why: "P8 Law-6b disjunction" },
    { s: "selectable", expect: "ok", why: "capability entails nothing" },
    { s: "stretchy", expect: "fail", why: "P2 coined" },
    { s: "modal", expect: "ok", why: "top-layer mechanism" },
    { s: "grid padding-comfortable selectable selection-subtle", backing: [], expect: "ok" },
    // sub-dial axes now compose (review priority 1)
    { s: "align-center justify-between", expect: "ok", why: "different sub-dials (align-items vs justify-content)" },
    { s: "align-center align-start", expect: "fail", why: "two values on the align sub-dial" },
    { s: "padding-inline-relaxed padding-block-snug", expect: "ok", why: "different padding sub-dials" },
    { s: "padding-comfortable padding-inline-relaxed", expect: "fail", why: "whole-axis padding + a per-side dial" },
    { s: "scroll-x scroll-y", expect: "ok", why: "different overflow sub-dials" },
    { s: "scroll-x scroll-auto", expect: "fail", why: "per-axis dial + whole-axis clip/auto" },
    // checked-mixed token bug fixed (review priority 3)
    { s: "checked-mixed", backing: ["aria-checked=mixed"], expect: "ok", why: "the word is complete, not checked-mixed-mixed" },
    // enum value parses as a real value (groundwork for P4)
    { s: "sorted-ascending", backing: ["aria-sort"], expect: "ok", why: "enum value captured separately" },
    { s: "current-page", backing: ["aria-current"], expect: "ok", why: "enum value captured separately" },
    // state co-presence (review priority 2)
    { s: "hover focus", backing: [":hover", ":focus"], expect: "ok", why: "focus group now many — co-present states" },
    { s: "focus focus-visible", backing: [":focus", ":focus-visible"], expect: "fail", why: "pairwise conflict within a many-group" },
    { s: "required invalid", backing: [":required", ":invalid"], expect: "ok", why: "validity many: required + invalid co-present" },
    // P4 — enumerated arity
    { s: "sorted-ascending", backing: ["aria-sort"], expect: "ok", why: "valid enum value" },
    { s: "sorted", expect: "fail", why: "P4: enumerated needs a value" },
    { s: "sorted-sideways", expect: "fail", why: "P4: value not in set" },
    { s: "current-page", backing: ["aria-current"], expect: "ok", why: "valid enum value" },
    { s: "current", expect: "fail", why: "P4: enumerated needs a value" },
    // P6 — arity misuse
    { s: "selected", backing: ["aria-checked=mixed"], expect: "fail", why: "P6: mixed backing → use checked-mixed" },
    { s: "checked-mixed", backing: ["aria-checked=mixed"], expect: "ok", why: "the dedicated tri-state word" },
    // P8-relational — inverted entailment (backing on the container)
    { s: "active-descendant", ctx: { elementId: "opt-3", containerAttrs: { "aria-activedescendant": "opt-3" } }, expect: "ok", why: "container points at this element" },
    { s: "active-descendant", ctx: { elementId: "opt-3", containerAttrs: { "aria-activedescendant": "opt-1" } }, expect: "fail", why: "container points elsewhere" },
    { s: "active-descendant", ctx: { elementId: "opt-3", containerAttrs: {} }, expect: "fail", why: "container attr absent" },
    { s: "active-descendant", expect: "ok", why: "no context supplied → relational check skipped, not failed" },
  ];

  let pass = 0;
  for (const c of cases) {
    const issues = lint(c.s, new Set(c.backing ?? []), c.ctx ?? {});
    const got: "ok" | "fail" = issues.length ? "fail" : "ok";
    const ok = got === c.expect;
    pass += ok ? 1 : 0;
    console.log(`${ok ? "PASS" : "XXXX"}  [${got}] ${c.s}${c.backing ? ` (backing: ${c.backing.join(",")||"∅"})` : ""}`);
    for (const i of issues) console.log(`         ${i.level}: ${i.rule} — ${i.msg}`);
  }
  console.log(`\n${pass}/${cases.length} cases behaved as expected.`);
}
