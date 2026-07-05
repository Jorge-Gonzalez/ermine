// engine/index.ts — createLinter: the vocabulary-independent core. Give it any
// axis records conforming to the schema (engine/types.ts) plus scope prefixes,
// and it returns a parser and a linter. This package never imports any client's
// axis data — Ermine is its first client, with zero special-casing (B1).

import { makeParser } from "./parse.ts";
import { makePredicates, type Predicates } from "./predicates.ts";
import type { AxisRecord, Issue, LintContext, Parsed, ScopePrefix } from "./types.ts";

export interface Linter extends Predicates {
  parseWord: (raw: string) => Parsed;
  lint: (classString: string, backing?: Set<string>, ctx?: LintContext) => Issue[];
}

export function createLinter(
  records: readonly AxisRecord[],
  scopes: readonly ScopePrefix[],
): Linter {
  const parseWord = makeParser(records, scopes);
  const predicates = makePredicates(records, parseWord);

  const lint = (classString: string, backing = new Set<string>(), ctx: LintContext = {}): Issue[] => {
    const parsed = classString.trim().split(/\s+/).filter(Boolean).map(parseWord);
    const p6Issues = predicates.p6(parsed, backing);
    const p6Targets = new Set(p6Issues.map((i) => i.target).filter((t): t is string => !!t));
    return [
      ...predicates.p2(parsed),
      ...predicates.p1(parsed),  // alias/dial rules folded in (was P5)
      ...predicates.p3(parsed),
      ...predicates.p4(parsed),
      ...p6Issues,
      ...predicates.p8(parsed, backing, p6Targets),
      ...predicates.p8b(parsed, ctx),
      ...predicates.p10(parsed),
      ...predicates.p11(parsed, ctx),
    ];
  };

  return { parseWord, lint, ...predicates };
}
