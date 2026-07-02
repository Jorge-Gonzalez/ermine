// lint.ts — parser + core predicates over registry.ts. Proves the registry shape
// supports validation, including the cases the constitution's "next action" names:
//   horizontal vertical            -> P1 one-word-per-axis
//   rigid grow-2                   -> P5 weight-implies-direction
//   selected (no backing)          -> P8 state-entailment
//   stretchy                       -> P2 no-coining / unknown-word
// Plus the amended Law 2: horizontal viewport-md:vertical is WELL-FORMED.

import { REGISTRY, ENVIRONMENT_SCOPES, type StateMember } from "./registry.ts";

export interface Parsed {
  raw: string;
  scope: string;            // "base" or an environment prefix id like "viewport-md"
  axis: string | null;      // resolved axis id, or null if unknown
  member: string | null;    // resolved member/word
  value?: string | number;  // open-axis parameter value
  isAlias?: boolean;        // m2: a whole-axis alias (complete value, mutually exclusive)
  dial?: string | null;     // m2: which sub-dial a parametric token sets (grow/shrink)
  stateMember?: StateMember;
  openFallback?: boolean;   // P3: matched a fallback token — shape recognized, value not sanctioned
}

export interface Issue { level: "error" | "warn"; rule: string; msg: string; target?: string }

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
        return { raw, scope, axis: ax.axis, member, value, isAlias, dial, stateMember, openFallback: tok.fallback === true };
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
    // predicates, with optional pairwise conflicts and optional implies/refinement pairs).
    if (ax?.stateGroup) {
      const sg = ax.stateGroup;
      const present = words.map((w) => w.stateMember?.word ?? w.member).filter(Boolean) as string[];
      if (sg.exclusivity === "one" && words.length > 1) {
        out.push({ level: "error", rule: "one-word-per-axis",
          msg: `'${words.map((w) => w.raw).join("', '")}' — only one '${words[0].axis}' state at a time (mutually exclusive group).` });
      } else {
        if (sg.conflicts?.length)
          for (const [a, b] of sg.conflicts)
            if (present.includes(a) && present.includes(b))
              out.push({ level: "error", rule: "state-conflict",
                msg: `'${a}' and '${b}' cannot both apply on '${words[0].axis}'.` });
        // implies (refinement, not conflict): writing both the narrower and the wider
        // word is never an error — the narrower is a platform subset of the wider — but
        // it's redundant, so surface it as a warning rather than staying silent.
        if (sg.implies?.length)
          for (const [narrower, wider] of sg.implies)
            if (present.includes(narrower) && present.includes(wider))
              out.push({ level: "warn", rule: "state-redundant",
                msg: `'${narrower}' already implies '${wider}' on '${words[0].axis}' — writing both is redundant, not conflicting.` });
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
// skipTargets = raw words another predicate (P6) already gave a more specific diagnosis for —
// suppresses the redundant "none present" complaint so authors get one clear fix, not two.
export function p8_stateEntailment(parsed: Parsed[], backing: Set<string>, skipTargets: Set<string> = new Set()): Issue[] {
  const out: Issue[] = [];
  for (const p of parsed) {
    const sm = p.stateMember;
    if (!sm) continue;
    // skip a malformed enumerated word (no valid value) — P4 owns that diagnosis;
    // complaining about backing for a not-well-formed word is noise.
    if (sm.arity === "enumerated" && p.value === undefined) continue;
    // skip a word P6 already flagged more specifically (arity-misuse) — same noise principle.
    if (skipTargets.has(p.raw)) continue;
    if (sm.stateCategory === "instance") {
      const set = sm.entails ?? [];
      if (!set.length) continue;
      if (sm.arity === "enumerated" && p.value !== undefined) {
        // Value-aware entailment: a valid enum value was captured (P4 already confirmed the
        // word is well-formed), so backing must carry the SPECIFIC attr=value pair, not just
        // attribute presence. `aria-sort` existing is not enough for `sorted-ascending`; it
        // must be `aria-sort=ascending`. Same convention checked-mixed already uses for its
        // fixed value (`aria-checked=mixed`) — this generalizes it to variable enum values.
        const wanted = set.map((attr) => `${attr}=${p.value}`);
        if (!wanted.some((w) => backing.has(w)))
          out.push({ level: "error", rule: "state-entailment",
            msg: `'${p.raw}' requires one of {${wanted.join(", ")}} on this element — attribute present without the matching value, or absent entirely (visually-true-but-semantically-false).` });
      } else if (!set.some((b) => backing.has(b))) {
        out.push({ level: "error", rule: "state-entailment",
          msg: `'${sm.word}' requires one of {${set.join(", ")}} on this element — none present (visually-true-but-semantically-false).` });
      }
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

// --- P10: divider/wrap interaction (warn) ---
// `divided` draws a line BETWEEN children using native gap-decoration, which assumes children
// stay in authored order. Composing it with wrapping (`wrap-allowed`/`wrap-reverse`) risks the
// line landing in the wrong place, or not rendering, once children can reflow or visually
// reorder. Not an error — a legitimate combination — but the author should verify the degrade
// path (must fall back to no divider, never mis-render). Global check, not scope-bucketed: the
// hazard exists whenever both are true for an element regardless of which scope authored them.
const WRAP_RISK_WORDS = new Set(["wrap-allowed", "wrap-reverse"]);
export function p10_dividerWrap(parsed: Parsed[]): Issue[] {
  const hasDivided = parsed.some((p) => p.axis === "divider" && p.raw === "divided");
  if (!hasDivided) return [];
  const risky = parsed.find((p) => p.axis === "wrapping" && WRAP_RISK_WORDS.has(p.raw));
  if (!risky) return [];
  return [{ level: "warn", rule: "divider-wrap",
    msg: `'divided' with '${risky.raw}' — the between-children line assumes authored order; verify it degrades to no divider rather than mis-rendering once children wrap or reorder.` }];
}

// --- P3: open vocabulary admits only its stated parameter (bad-parameter) ---
// A word can recognize an open/parametric axis's SHAPE (its prefix) without its VALUE being
// sanctioned — `grow-abc` looks like m2's grow-N dial but "abc" isn't a non-negative integer;
// `basis-exact-240` looks like m3's parametric member but "240" isn't a §5.1 size step (raw
// px is OUT in v0). These match a dedicated `fallback` token (registry.ts), giving them a more
// specific diagnosis than falling through to P2 `unknown-word` — the shape was right, the
// parameter wasn't.
export function p3_badParameter(parsed: Parsed[]): Issue[] {
  return parsed.filter((p) => p.openFallback).map((p) => ({
    level: "error" as const, rule: "bad-parameter",
    msg: `'${p.raw}' has a recognized shape on axis '${p.axis}' but its value isn't a sanctioned parameter — no new words, only new sanctioned values (P3).`,
  }));
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
      out.push({ level: "error", rule: "arity-misuse", target: p.raw,
        msg: `'selected' with a mixed/indeterminate backing — use the dedicated word 'checked-mixed'.` });
  }
  return out;
}

export function lint(classString: string, backing = new Set<string>(), ctx: LintContext = {}): Issue[] {
  const parsed = classString.trim().split(/\s+/).filter(Boolean).map(parseWord);
  const p6Issues = p6_arityMisuse(parsed, backing);
  const p6Targets = new Set(p6Issues.map((i) => i.target).filter((t): t is string => !!t));
  return [
    ...p2_unknownWord(parsed),
    ...p1_oneWordPerAxisPerScope(parsed),  // m2 alias/dial rules folded in (was P5)
    ...p3_badParameter(parsed),
    ...p4_enumArity(parsed),
    ...p6Issues,
    ...p8_stateEntailment(parsed, backing, p6Targets),
    ...p8b_relationalEntailment(parsed, ctx),
    ...p10_dividerWrap(parsed),
  ];
}
