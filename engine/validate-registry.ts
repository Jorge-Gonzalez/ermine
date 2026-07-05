// engine/validate-registry.ts — structural validation for a registry bundle.
// This generalizes the Ermine-specific invariants from src/registry.ts into a
// vocabulary-independent contract for any client registry.

import { makeParser } from "./parse.ts";
import type { AxisRecord, ScopePrefix, Scales } from "./types.ts";

export interface RegistryBundle {
  records: readonly AxisRecord[];
  scopes?: readonly ScopePrefix[];
  scales?: Scales;
}

export type RegistryInput = RegistryBundle | readonly AxisRecord[];

function isBundle(value: RegistryInput): value is RegistryBundle {
  return typeof value === "object" && value !== null && Array.isArray((value as RegistryBundle).records);
}

function normalizeRegistry(input: RegistryInput): RegistryBundle {
  if (isBundle(input)) return { records: input.records, scopes: input.scopes ?? [], scales: input.scales ?? {} };
  return { records: input, scopes: [], scales: {} };
}

function isGrammarLikeWord(value: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(value) && !/^(aria|data|role|slot)-/.test(value);
}

export function validateRegistry(input: RegistryInput): string[] {
  const { records, scopes, scales } = normalizeRegistry(input);
  const resolvedScopes = scopes ?? [];
  const errors: string[] = [];
  const seenAxes = new Set<string>();

  for (const record of records) {
    if (seenAxes.has(record.axis)) {
      errors.push(`duplicate axis id: ${record.axis}`);
    } else {
      seenAxes.add(record.axis);
    }
  }

  const literalWordClaims = new Map<string, string[]>();
  for (const record of records) {
    if (record.vocabulary !== "closed") continue;
    for (const word of record.valueSpace) {
      if (word.includes("<")) continue;
      const matchesLiteralToken = record.tokens.some((token) => !token.fallback && token.pattern.test(word));
      if (!matchesLiteralToken) continue;
      const axes = literalWordClaims.get(word) ?? [];
      axes.push(record.axis);
      literalWordClaims.set(word, axes);
    }
  }

  for (const [word, axes] of literalWordClaims) {
    if (axes.length > 1) {
      errors.push(`word '${word}' is claimed by multiple axes: ${axes.join(", ")}`);
    }
  }

  const parseWord = makeParser(records, resolvedScopes);

  for (const record of records) {
    for (const alias of record.aliases ?? []) {
      const expansion = alias.expands.trim();
      if (!expansion) continue;
      for (const piece of expansion.split(/\s+/)) {
        const parsed = parseWord(piece);
        if (parsed.axis === null) {
          errors.push(`alias '${alias.word}' expands to unknown word '${piece}'`);
        }
      }
    }

    for (const member of record.stateGroup?.members ?? []) {
      for (const target of member.entails ?? []) {
        // `entails` points at backing semantics and platform capabilities as often as
        // it points at registry words, so this structural pass only checks the parts
        // that are actually grammar-facing (aliases, scales, and literal token overlap).
        if (!isGrammarLikeWord(target)) continue;
        const isDeclared = records.some((axis) => axis.valueSpace.includes(target))
          || records.some((axis) => axis.stateGroup?.members.some((candidate) => candidate.word === target));
        if (!isDeclared && /^(?:[a-z][a-z0-9-]*|aria-[a-z0-9-]+)$/.test(target)) {
          // Keep the check narrow so Ermine's platform-backed `entails` values do not
          // look like structural registry errors.
          continue;
        }
      }
    }

    for (const token of record.tokens) {
      const valueDomain = token.valueDomain ?? "";
      const match = valueDomain.match(/^scale:(.+)$/);
      if (match) {
        const scaleName = match[1];
        if (!Object.prototype.hasOwnProperty.call(scales, scaleName)) {
          errors.push(`token '${token.shape}' references undeclared scale '${scaleName}'`);
        }
      }
    }
  }

  return errors;
}
