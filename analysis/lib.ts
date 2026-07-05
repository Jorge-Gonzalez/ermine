import { REGISTRY } from "../src/registry.ts";

const SHORTHAND_ROOTS = [
  "margin",
  "padding",
  "border-radius",
  "border",
  "background",
  "font",
  "transition",
  "animation",
  "overflow",
  "inset",
  "place",
  "flex",
  "grid",
  "outline",
  "box-shadow",
  "gap",
];

export const VALUE_FAMILIES: Record<"spacing" | "size", RegExp> = {
  spacing: /^(gap|row-gap|column-gap|margin|padding)(-(top|right|bottom|left|block|inline|start|end))*$/,
  size: /^(width|height|min-width|max-width|min-height|max-height|flex-basis)$/,
};

export type ValueFamily = keyof typeof VALUE_FAMILIES;
export type ValueKind = "zero" | "length" | "percent" | "keyword" | "var" | "calc" | "other";

export interface CssSource {
  label: string;
  css: string;
  location: string;
}

export interface ScopeReport {
  file: string;
  total: number;
  custom: number;
  real: number;
  covered: number;
  uncovered: Map<string, number>;
}

export interface DeclarationToken {
  prop: string;
  token: string;
}

export interface ClassifiedValue {
  kind: ValueKind;
  px?: number;
}

export interface ValueReport {
  family: ValueFamily;
  totalTokens: number;
  kinds: Record<ValueKind, number>;
  rawLengths: number;
  distinctLengths: number;
  lengths: Map<number, number>;
  topValues: Array<[number, number]>;
  topCoverage: (count: number) => number | null;
  gridAlignedShare: number | null;
  zeroShare: number | null;
}

export interface AuditMeasurements {
  scope: ScopeReport;
  values: Record<ValueFamily, ValueReport>;
}

export function propertyFamily(property: string): string {
  if (property.startsWith("--")) return property;
  let normalized = property.replace(/-(top|right|bottom|left|block|inline|start|end|x|y)(-(start|end))?$/i, "");
  for (const root of SHORTHAND_ROOTS) {
    if (normalized === root || normalized.startsWith(`${root}-`)) return root;
  }
  return normalized;
}

export const grammarFamilies = new Set<string>();
for (const axis of REGISTRY) {
  for (const raw of axis.controls) {
    const property = raw.replace(/^display\..*/, "display");
    if (!property.startsWith("--")) grammarFamilies.add(propertyFamily(property));
  }
}

export function extractProperties(css: string): string[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const properties: string[] = [];
  const pattern = /[;{]\s*(--[a-zA-Z0-9-]+|-?[a-zA-Z][a-zA-Z-]+)\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(noComments))) properties.push(match[1].toLowerCase());
  return properties;
}

export function analyzeScope(css: string, file = "combined"): ScopeReport {
  const properties = extractProperties(css);
  const uncovered = new Map<string, number>();
  let custom = 0;
  let real = 0;
  let covered = 0;

  for (const property of properties) {
    if (property.startsWith("--")) {
      custom += 1;
      continue;
    }
    real += 1;
    const family = propertyFamily(property);
    if (grammarFamilies.has(family)) covered += 1;
    else uncovered.set(family, (uncovered.get(family) ?? 0) + 1);
  }
  return { file, total: properties.length, custom, real, covered, uncovered };
}

export function declarationTokens(css: string): DeclarationToken[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const pattern = /[;{]\s*(-?[a-z][a-z-]+)\s*:\s*([^;{}]+?)(?=\s*[;}])/g;
  const tokens: DeclarationToken[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(noComments))) {
    const prop = match[1].toLowerCase();
    const value = match[2].replace(/\s*!important\s*/gi, "").trim();
    const components = /^(var|calc|clamp|min|max)\(/i.test(value) ? [value] : value.split(/\s+/);
    for (const token of components) tokens.push({ prop, token: token.toLowerCase() });
  }
  return tokens;
}

export function classifyValue(token: string): ClassifiedValue {
  if (/^0(px|rem|em|%)?$/.test(token)) return { kind: "zero", px: 0 };
  let match = token.match(/^(-?\d*\.?\d+)px$/);
  if (match) return { kind: "length", px: Number(match[1]) };
  match = token.match(/^(-?\d*\.?\d+)(rem|em)$/);
  if (match) return { kind: "length", px: Number(match[1]) * 16 };
  if (/^-?\d*\.?\d+%$/.test(token)) return { kind: "percent" };
  if (/^var\(/.test(token)) return { kind: "var" };
  if (/^(calc|clamp|min|max)\(/.test(token)) return { kind: "calc" };
  if (/^(auto|inherit|initial|unset|none|fit-content|min-content|max-content|revert)$/.test(token)) {
    return { kind: "keyword" };
  }
  return { kind: "other" };
}

export function analyzeValues(css: string): Record<ValueFamily, ValueReport> {
  const tokens = declarationTokens(css);
  return Object.fromEntries(Object.entries(VALUE_FAMILIES).map(([name, pattern]) => {
    const family = name as ValueFamily;
    const classified = tokens.filter((token) => pattern.test(token.prop)).map((token) => classifyValue(token.token));
    const kinds: Record<ValueKind, number> = {
      zero: 0,
      length: 0,
      percent: 0,
      keyword: 0,
      var: 0,
      calc: 0,
      other: 0,
    };
    const lengths = new Map<number, number>();
    for (const value of classified) {
      kinds[value.kind] += 1;
      if (value.kind === "length" && value.px !== undefined) {
        lengths.set(value.px, (lengths.get(value.px) ?? 0) + 1);
      }
    }
    const rawLengths = kinds.length;
    const topValues = [...lengths.entries()].sort((left, right) => right[1] - left[1]);
    const topCoverage = (count: number): number | null => rawLengths
      ? topValues.slice(0, count).reduce((sum, [, frequency]) => sum + frequency, 0) / rawLengths
      : null;
    const gridAligned = [...lengths]
      .filter(([value]) => value % 4 === 0)
      .reduce((sum, [, frequency]) => sum + frequency, 0);
    const totalTokens = classified.length;
    return [family, {
      family,
      totalTokens,
      kinds,
      rawLengths,
      distinctLengths: lengths.size,
      lengths,
      topValues,
      topCoverage,
      gridAlignedShare: rawLengths ? gridAligned / rawLengths : null,
      zeroShare: totalTokens ? kinds.zero / totalTokens : null,
    } satisfies ValueReport];
  })) as Record<ValueFamily, ValueReport>;
}

export function measureCss(sources: readonly CssSource[], label = "combined"): AuditMeasurements {
  const css = sources.map((source) => source.css).join("\n");
  return { scope: analyzeScope(css, label), values: analyzeValues(css) };
}

export function ratioPercent(numerator: number, denominator: number): number | null {
  return denominator ? numerator / denominator : null;
}

export function formatPercent(ratio: number | null, digits = 1): string {
  return ratio === null ? "—" : `${(ratio * 100).toFixed(digits)}%`;
}
