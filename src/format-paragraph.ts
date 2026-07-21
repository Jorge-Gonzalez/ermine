import { parseWord, type Parsed } from "./lint.ts";
import { ENVIRONMENT_SCOPES, INTERACTION_SCOPES, REGISTRY, RELATIONAL_SCOPES, STATE_SCOPES } from "./registry.ts";

import type { AxisRecord, ScopePrefix } from "../engine/types.ts";

interface RankedToken {
  token: string;
  parsed: Parsed;
  index: number;
}

const BASE_SCOPE = parseWord("").scope;

const axisRank = new Map(REGISTRY.map((axis, index) => [axis.axis, index]));
const planeRank = new Map<string, number>();
for (const axis of REGISTRY) {
  if (!planeRank.has(axis.sibling)) planeRank.set(axis.sibling, planeRank.size);
}
const axisById = new Map(REGISTRY.map((axis) => [axis.axis, axis]));
const scopeRecords: ScopePrefix[] = [
  ...INTERACTION_SCOPES,
  ...STATE_SCOPES,
  ...RELATIONAL_SCOPES,
  ...ENVIRONMENT_SCOPES,
];

export const formatParagraphDerivation = {
  axisCount: axisRank.size,
  registryCount: REGISTRY.length,
  scopeCount: scopeRecords.length,
} as const;

function axisOf(parsed: Parsed): AxisRecord | undefined {
  return parsed.axis ? axisById.get(parsed.axis) : undefined;
}

function valueRank(axis: AxisRecord, parsed: Parsed): number | undefined {
  const candidates = [parsed.member, parsed.value].filter((value): value is string | number => value !== null && value !== undefined);
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const index = axis.valueSpace.indexOf(candidate);
    if (index >= 0) return index;
  }
  return undefined;
}

function baseRank(token: RankedToken): [number, number, number, string, number] {
  const axis = axisOf(token.parsed);
  if (!axis || !token.parsed.axis) return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, token.token, token.index];
  const value = valueRank(axis, token.parsed);
  return [
    planeRank.get(axis.sibling) ?? Number.MAX_SAFE_INTEGER,
    axisRank.get(token.parsed.axis) ?? Number.MAX_SAFE_INTEGER,
    value ?? Number.MAX_SAFE_INTEGER,
    value === undefined ? token.token : "",
    token.index,
  ];
}

function compareTuple(left: readonly (number | string)[], right: readonly (number | string)[]): number {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index];
    const b = right[index];
    if (a === b) continue;
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    return a < b ? -1 : 1;
  }
  return 0;
}

function scopeRank(scope: string): number {
  const index = scopeRecords.findIndex((record) => record.pattern.test(scope));
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function compareBase(left: RankedToken, right: RankedToken): number {
  return compareTuple(baseRank(left), baseRank(right));
}

function compareScoped(left: RankedToken, right: RankedToken): number {
  const scopeCompare = compareTuple([scopeRank(left.parsed.scope), left.parsed.scope], [scopeRank(right.parsed.scope), right.parsed.scope]);
  return scopeCompare || compareBase(left, right);
}

function isKnownBase(token: RankedToken): boolean {
  return token.parsed.axis !== null && token.parsed.scope === BASE_SCOPE;
}

function isKnownScoped(token: RankedToken): boolean {
  return token.parsed.axis !== null && token.parsed.scope !== BASE_SCOPE;
}

function groupOf(token: RankedToken): string {
  if (isKnownScoped(token)) return `scope:${token.parsed.scope}`;
  if (!isKnownBase(token)) return "identity";
  return `plane:${axisOf(token.parsed)?.sibling ?? ""}`;
}

/**
 * The canonical order, split into the groups a reader scans by: identity hooks,
 * then one group per plane, then one group per scope.
 */
export function orderParagraphGroups(classString: string): string[] {
  const tokens = classString.trim().split(/\s+/).filter(Boolean).map((token, index) => ({
    token,
    parsed: parseWord(token),
    index,
  }));
  const identity = tokens.filter((token) => !isKnownBase(token) && !isKnownScoped(token));
  const base = tokens.filter(isKnownBase).sort(compareBase);
  const scoped = tokens.filter(isKnownScoped).sort(compareScoped);

  const groups: string[] = [];
  let openGroup = "";
  for (const token of [...identity, ...base, ...scoped]) {
    const group = groupOf(token);
    if (group === openGroup) groups[groups.length - 1] += ` ${token.token}`;
    else groups.push(token.token);
    openGroup = group;
  }
  return groups;
}

export interface ParagraphLayout {
  /** Put each plane and each scope on its own line instead of one long line. */
  lines?: boolean;
  /** Prefix for every line after the first, when `lines` is set. */
  indent?: string;
}

export function orderParagraph(classString: string, layout: ParagraphLayout = {}): string {
  const groups = orderParagraphGroups(classString);
  return groups.join(layout.lines ? `\n${layout.indent ?? ""}` : " ");
}

/**
 * A paragraph may only take multiple lines where a raw newline is syntactically
 * safe: the attribute alone among class attributes on its line, and not inside a
 * single-line string (markup embedded in `innerHTML = '…'` and the like).
 * Everything else degrades to the single-line layout.
 */
export function paragraphMaySpanLines(source: string, attributeStart: number): boolean {
  const lineStart = source.lastIndexOf("\n", attributeStart - 1) + 1;
  const prefix = source.slice(lineStart, attributeStart);
  for (const quote of ["'", '"', "`"]) {
    if ((prefix.split(quote).length - 1) % 2 === 1) return false;
  }
  const lineEnd = source.indexOf("\n", attributeStart);
  const line = source.slice(lineStart, lineEnd < 0 ? source.length : lineEnd);
  return (line.match(/\bclass(?:Name)?\s*=/g) ?? []).length < 2;
}
