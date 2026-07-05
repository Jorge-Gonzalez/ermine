// surfaces/typed/toClassString.ts — the typed surface's ONLY runtime piece:
// a props object → the canonical class string. Word order is canonical by
// construction (the generated descriptors are in registry order; scopes follow
// base words, in environment order) — D2's byte-equality property depends on
// exactly this.
//
// Dev-mode gate: the result is run through lint() and any STRUCTURAL error
// throws. Two error sources are possible and the message names the right one:
// a structural error from a closed shape means the TYPEGEN is wrong (the types
// admitted what the grammar rejects); one from an open numeric dial means the
// AUTHOR passed a value outside the sanctioned domain (`grow: 1.5` — `number`
// is wider than integer-≥0; see ENFORCEMENT.md, P3). Entailment rules (P8/P8b)
// are deliberately NOT gated here: they assert runtime DOM truths no class
// string can carry — the typed surface documents them as unenforced.

import { lint } from "../../src/lint.ts";
import {
  BASE_DESCRIPTORS, SCOPE_DESCRIPTORS,
  type ErmineBaseProps, type ErmineProps,
} from "./ermine-props.generated.ts";

const RUNTIME_OBLIGATION_RULES = new Set(["state-entailment", "state-entailment-relational"]);

function baseWords(props: ErmineBaseProps): string[] {
  const record = props as Record<string, unknown>;
  const words: string[] = [];
  for (const descriptor of BASE_DESCRIPTORS) {
    const value = record[descriptor.prop];
    if (value === undefined) continue;
    const values: unknown[] = Array.isArray(value) ? value : [value];
    for (const item of values) {
      words.push(descriptor.prefix !== undefined ? `${descriptor.prefix}-${String(item)}` : String(item));
    }
  }
  return words;
}

export function toClassString(props: ErmineProps): string {
  const record = props as Record<string, unknown>;
  const words = baseWords(props as ErmineBaseProps);
  for (const scope of SCOPE_DESCRIPTORS) {
    const scoped = record[scope.prop] as ErmineBaseProps | undefined;
    if (scoped === undefined) continue;
    for (const word of baseWords(scoped)) words.push(`${scope.prefix}:${word}`);
  }
  const result = words.join(" ");

  if (process.env.NODE_ENV !== "production") {
    const issues = lint(result)
      .filter((issue) => issue.level === "error" && !RUNTIME_OBLIGATION_RULES.has(issue.rule));
    if (issues.length) {
      throw new Error(
        `toClassString produced an unlawful class string "${result}" — ` +
        `${issues.map((issue) => `${issue.rule}: ${issue.msg}`).join("; ")} ` +
        `(a closed-shape error here means the typegen is wrong; a bad-parameter on a numeric dial means the value is outside the sanctioned domain)`,
      );
    }
  }
  return result;
}
