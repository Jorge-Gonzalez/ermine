// engine/predicates.ts — P1…P11 closed over a client's axis records (B1
// extraction; bodies moved from the Ermine-bound linter, behavior identical).
// The three places the old predicates hardcoded one vocabulary's words are now
// declared data the records carry: composition hazards (P10), parent inertness
// (P11), and per-member backing misuse (P6b). Predicates keep their P1…P11
// identifiers as code-side IDs (the doc system's ruling).

import type { AxisRecord, Issue, LintContext, Parsed, ScopePrefix } from "./types.ts";

export interface Predicates {
  p1: (parsed: Parsed[]) => Issue[];
  p2: (parsed: Parsed[]) => Issue[];
  p3: (parsed: Parsed[]) => Issue[];
  p4: (parsed: Parsed[]) => Issue[];
  p6: (parsed: Parsed[], backing: Set<string>) => Issue[];
  p8: (parsed: Parsed[], backing: Set<string>, skipTargets?: Set<string>) => Issue[];
  p8b: (parsed: Parsed[], ctx: LintContext) => Issue[];
  p10: (parsed: Parsed[]) => Issue[];
  p11: (parsed: Parsed[], ctx: LintContext) => Issue[];
  pBacked: (parsed: Parsed[]) => Issue[];
}

export function makePredicates(
  records: readonly AxisRecord[],
  parseWord: (raw: string) => Parsed,
  scopes: readonly ScopePrefix[] = [],
): Predicates {
  const backedScopes = new Map(scopes.filter((s) => s.backedBy).map((s) => [s.id, s.backedBy!]));
  // --- P1: one word per axis PER SCOPE (one-word law, scope-amended) ---
  // Refinements for the two member-role sizing shapes:
  //   • whole-axis ALIASES: an alias is a COMPLETE value, so it conflicts with ANY
  //     other word on the same axis/scope (another alias OR a dial).
  //   • SUB-DIALS: parametric tokens on DIFFERENT dials compose; same dial conflicts.
  //   • plain axes: at most one word per axis/scope (unchanged).
  const p1 = (parsed: Parsed[]): Issue[] => {
    const out: Issue[] = [];
    const byKey = new Map<string, Parsed[]>(); // scope|axis -> words
    for (const p of parsed) {
      if (!p.axis) continue;
      const key = `${p.scope}|${p.axis}`;
      byKey.set(key, [...(byKey.get(key) ?? []), p]);
    }

    for (const [, words] of byKey) {
      const ax = records.find((a) => a.axis === words[0].axis);
      const hasDials = !!ax?.subDials;
      const aliases = words.filter((w) => w.isAlias);
      const nonAliases = words.filter((w) => !w.isAlias);

      if (hasDials || (ax?.aliases?.length ?? 0) > 0) {
        // alias-bearing axes: aliases are whole-axis (complete) values.
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
      // predicates, with optional pairwise conflicts and optional implies pairs).
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
          // implies (refinement, not conflict): writing both the narrower and the
          // wider word is never an error — redundant, so warn rather than stay silent.
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
  };

  // --- P2: unknown word / no-coining ---
  const p2 = (parsed: Parsed[]): Issue[] =>
    parsed.filter((p) => p.axis === null).map((p) => ({
      level: "error" as const, rule: "unknown-word",
      msg: `'${p.raw}' resolves to no axis — not a member of any closed axis and not a sanctioned parameter. Do not coin; report a gap.`,
    }));

  // --- P3: open vocabulary admits only its stated parameter (bad-parameter) ---
  // A fallback token recognizes an open/parametric axis's SHAPE without its VALUE
  // being sanctioned — a more specific diagnosis than P2 `unknown-word`.
  const p3 = (parsed: Parsed[]): Issue[] =>
    parsed.filter((p) => p.openFallback).map((p) => ({
      level: "error" as const, rule: "bad-parameter",
      msg: `'${p.raw}' has a recognized shape on axis '${p.axis}' but its value isn't a sanctioned parameter — no new words, only new sanctioned values (P3).`,
    }));

  // --- P4: enumerated arity must carry a value from its closed set ---
  // The parser captures a valid value via the valid-value token; a bare or
  // wrong-valued word matches the fallback token (value undefined), which P4
  // flags — distinguishing "missing value" from "value not in set" by whether a
  // `-tail` was supplied.
  const p4 = (parsed: Parsed[]): Issue[] => {
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
  };

  // --- P6: arity misuse (a binary member can't carry an enumerated/tri-state value) ---
  // The high-value form is (b): a BINARY word whose element BACKING is a truth a
  // dedicated sibling word owns — declared per member as `misuse`. Form (a), a
  // binary word written with a value suffix, is left to P2 `unknown-word`
  // (accurate; fallback tokens for it would over-match typos).
  const p6 = (parsed: Parsed[], backing: Set<string>): Issue[] => {
    const out: Issue[] = [];
    for (const p of parsed) {
      const sm = p.stateMember;
      if (!sm || sm.arity !== "binary" || !sm.misuse) continue;
      if (sm.misuse.whenBacking.some((truth) => backing.has(truth)))
        out.push({ level: "error", rule: "arity-misuse", target: p.raw, msg: sm.misuse.msg });
    }
    return out;
  };

  // --- P8: state entailment (category-dispatched), instance form ---
  // backing = the set of platform truths present on the element (caller supplies)
  // skipTargets = raw words another predicate (P6) already diagnosed more specifically.
  const p8 = (parsed: Parsed[], backing: Set<string>, skipTargets: Set<string> = new Set()): Issue[] => {
    const out: Issue[] = [];
    for (const p of parsed) {
      const sm = p.stateMember;
      if (!sm) continue;
      // a malformed enumerated word (no valid value) is P4's diagnosis, not P8's.
      if (sm.arity === "enumerated" && p.value === undefined) continue;
      if (skipTargets.has(p.raw)) continue;
      if (sm.stateCategory === "instance") {
        const set = sm.entails ?? [];
        if (!set.length) continue;
        if (sm.arity === "enumerated" && p.value !== undefined) {
          // Value-aware entailment: backing must carry the SPECIFIC attr=value pair,
          // not just attribute presence.
          const wanted = set.map((attr) => `${attr}=${p.value}`);
          if (!wanted.some((w) => backing.has(w)))
            out.push({ level: "error", rule: "state-entailment",
              msg: `'${p.raw}' requires one of {${wanted.join(", ")}} on this element — attribute present without the matching value, or absent entirely (visually-true-but-semantically-false).` });
        } else if (!set.some((b) => backing.has(b))) {
          out.push({ level: "error", rule: "state-entailment",
            msg: `'${sm.word}' requires one of {${set.join(", ")}} on this element — none present (visually-true-but-semantically-false).` });
        }
      }
      // capability / conditioned-skin entail nothing; relational handled by p8b.
    }
    return out;
  };

  // --- P8b: RELATIONAL state entailment (inverted — backing on the CONTAINER) ---
  // A relational member is NOT backed by an attribute on the element itself, but
  // by the CONTAINER pointing at this element's id.
  const p8b = (parsed: Parsed[], ctx: LintContext): Issue[] => {
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
  };

  // --- P10: declared cross-axis composition hazards ---
  // Global check, not scope-bucketed: the hazard exists whenever both words are
  // present for an element regardless of which scope authored them.
  const hazardBearers = records.filter((ax) => ax.compositionHazards?.length);
  const p10 = (parsed: Parsed[]): Issue[] => {
    const out: Issue[] = [];
    for (const ax of hazardBearers) {
      for (const hazard of ax.compositionHazards!) {
        const own = parsed.find((p) => p.axis === ax.axis && hazard.ownWords.includes(p.raw));
        if (!own) continue;
        const other = parsed.find((p) => p.axis === hazard.otherAxis && hazard.otherWords.includes(p.raw));
        if (!other) continue;
        out.push({ level: hazard.level, rule: hazard.rule, msg: hazard.msg(own.raw, other.raw) });
      }
    }
    return out;
  };

  // --- P11: declared parent-context inertness (outcome-level rule) ---
  // Words the client declared inert under a parent that carries any word of the
  // declared parent axis. Skipped when the parent is unknown, like P8b.
  const inertnessBearers = records.filter((ax) => ax.parentInertness);
  const p11 = (parsed: Parsed[], ctx: LintContext): Issue[] => {
    if (ctx.parentClasses === undefined || inertnessBearers.length === 0) return [];
    const parentAxes = new Set(
      ctx.parentClasses.trim().split(/\s+/).filter(Boolean).map(parseWord).map((p) => p.axis),
    );
    const out: Issue[] = [];
    for (const ax of inertnessBearers) {
      const inertness = ax.parentInertness!;
      if (!parentAxes.has(inertness.parentAxis)) continue;
      out.push(...parsed
        .filter((p) => p.axis === ax.axis && inertness.inertWords.includes(p.raw))
        .map((p) => ({ level: inertness.level, rule: inertness.rule, msg: inertness.msg(p.raw) })));
    }
    return out;
  };

  // --- R-STATE-11: a word under a BACKED scope requires its capability word present ---
  const pBacked = (parsed: Parsed[]): Issue[] => {
    if (backedScopes.size === 0) return [];
    const present = new Set(parsed.flatMap((p) => [p.member, p.raw].filter((w): w is string => !!w)));
    const out: Issue[] = [];
    const flagged = new Set<string>();
    for (const p of parsed) {
      const capability = backedScopes.get(p.scope);
      if (!capability || flagged.has(p.scope) || present.has(capability)) continue;
      out.push({
        level: "error",
        rule: "R-STATE-11",
        msg: `'${p.scope}:' is a backed state scope — the element must also carry '${capability}'.`,
        target: p.raw,
      });
      flagged.add(p.scope);
    }
    return out;
  };

  return { p1, p2, p3, p4, p6, p8, p8b, p10, p11, pBacked };
}
