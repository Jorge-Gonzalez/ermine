// engine/validate-registry.ts — structural validation for a registry bundle.
// Generalizes the invariants test/registry.test.ts asserts for the first
// client's data (unique axis ids, P0 token uniqueness, alias expansions that
// parse, scale-bound token domains that resolve) into a contract any client
// registry can be held to. Documented field-by-field in engine/SCHEMA.md.
//
// Deliberately absent: an `entails` check. Entailment targets are PLATFORM
// truths (aria attributes, pseudo-classes, attribute=value pairs), not
// registry words — there is no structural fact about them a registry can be
// checked against. (The B2 order's "every entails target a real word"
// misdescribes the field; recorded in the follow-up commit.)

import { makeParser } from "./parse.ts";
import type { AxisRecord, Scales, ScopePrefix } from "./types.ts";

export interface RegistryBundle {
  records: readonly AxisRecord[];
  scopes?: readonly ScopePrefix[];
  // named scales for `<name>-step` token domains. Omit entirely to skip the
  // scale checks (a bare-array input can't be checked for scales it never
  // declared); pass `{}` to assert "no scales exist" and have every scale
  // reference flagged.
  scales?: Scales;
}

export type RegistryInput = RegistryBundle | readonly AxisRecord[];

function normalizeRegistry(input: RegistryInput): RegistryBundle {
  if (Array.isArray(input)) return { records: input as readonly AxisRecord[], scopes: [] };
  const bundle = input as RegistryBundle;
  return { records: bundle.records, scopes: bundle.scopes ?? [], scales: bundle.scales };
}

// A token domain of the form `<name>-step` references the named scale — the
// convention the first client's registry established (density-step, size-step).
const SCALE_DOMAIN = /^(.+)-step$/;

export function validateRegistry(input: RegistryInput): string[] {
  const { records, scopes, scales } = normalizeRegistry(input);
  const errors: string[] = [];

  // --- unique axis ids ---
  const seenAxes = new Set<string>();
  for (const record of records) {
    if (seenAxes.has(record.axis)) errors.push(`duplicate axis id: ${record.axis}`);
    else seenAxes.add(record.axis);
  }

  // --- P0 token uniqueness, generalized: every literal (non-parametric)
  // valueSpace word must match at most one axis's tokens. The parser returns
  // the first match in record order, so an overlap doesn't error at parse
  // time — it silently shadows the later axis's meaning of that word. ---
  const literalWords = new Set<string>();
  for (const record of records)
    for (const word of record.valueSpace)
      if (!word.includes("<")) literalWords.add(word);

  for (const word of literalWords) {
    const claimants = records.filter((record) => record.tokens.some((token) => token.pattern.test(word)));
    if (claimants.length > 1)
      errors.push(`word '${word}' matches tokens of multiple axes: ${claimants.map((record) => record.axis).join(", ")} — the parser will silently resolve it to the first`);
  }

  // --- alias expansions must parse against the registry's own tokens ---
  const parseWord = makeParser(records, scopes ?? []);
  for (const record of records) {
    for (const alias of record.aliases ?? []) {
      for (const piece of alias.expands.trim().split(/\s+/).filter(Boolean)) {
        if (parseWord(piece).axis === null)
          errors.push(`alias '${alias.word}' expands to unknown word '${piece}'`);
      }
    }
  }

  // --- scale-bound token domains must reference a declared scale ---
  if (scales !== undefined) {
    for (const record of records) {
      for (const token of record.tokens) {
        const scaleName = token.valueDomain?.match(SCALE_DOMAIN)?.[1];
        if (scaleName !== undefined && !Object.prototype.hasOwnProperty.call(scales, scaleName))
          errors.push(`token '${token.shape}' on axis '${record.axis}' references undeclared scale '${scaleName}'`);
      }
    }
  }

  return errors;
}
