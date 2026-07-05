// engine/parse.ts — makeParser: the word parser closed over a client's axis
// records and scope prefixes (B1 extraction; behavior identical to the previous
// Ermine-bound parseWord).

import type { AxisRecord, Parsed, ScopePrefix, StateMember } from "./types.ts";

export function makeParser(
  records: readonly AxisRecord[],
  scopes: readonly ScopePrefix[],
): (raw: string) => Parsed {
  return function parseWord(raw: string): Parsed {
    let scope = "base";
    let body = raw;

    // environment scope prefix? split on the first colon
    const colon = raw.indexOf(":");
    if (colon !== -1) {
      const prefix = raw.slice(0, colon);
      const sp = scopes.find((s) => s.pattern.test(prefix));
      if (sp) { scope = prefix; body = raw.slice(colon + 1); }
    }

    // try every axis's tokens
    for (const ax of records) {
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
  };
}
