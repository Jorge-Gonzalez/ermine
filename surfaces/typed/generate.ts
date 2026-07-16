// surfaces/typed/generate.ts — D1 typegen: the registry rendered as a TypeScript
// props API in which one-word-per-axis (P1) is enforced by the type system
// wherever it can be encoded SOUNDLY, and left to the runtime linter where it
// cannot (the per-law honesty table is surfaces/typed/ENFORCEMENT.md).
//
// The generator reads the axis records THROUGH the engine schema: every
// classification below keys on schema fields (stateGroup, subDials, aliases,
// aliasMatch, parametricMembers, token valueDomain / patterns), never on an
// axis id. Naming is mechanical: camelCase of the axis id with the `mN-` /
// `state.` bookkeeping prefixes stripped; dial props use the dial name when
// globally unique, else axisProp+Dial; scale steps come from the `<name>-step`
// valueDomain convention (engine/SCHEMA.md).
//
// Modes: `npm run typed` writes surfaces/typed/ermine-props.generated.ts;
// `npm run typed:check` exits 1 with a first-difference summary on drift.

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { AxisRecord, Scales, ScopePrefix } from "../../engine/types.ts";
import { ENVIRONMENT_SCOPES, REGISTRY, SCALES } from "../../src/registry.ts";

const OUTPUT = new URL("./ermine-props.generated.ts", import.meta.url);

// ---------------------------------------------------------------------------
// mechanical naming
// ---------------------------------------------------------------------------
const camel = (value: string): string =>
  value.replace(/^m\d+-/, "").replace(/^state\./, "").replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const pascal = (value: string): string => {
  const c = camel(value);
  return c[0].toUpperCase() + c.slice(1);
};

const quote = (word: string): string => JSON.stringify(word);

// extract the finite alternation of a simple anchored pattern like
// /^prefers-(reduced-motion|color-scheme-dark)$/ — used for scope instances.
function alternation(pattern: RegExp): string[] | null {
  const m = pattern.source.match(/^\^([a-z-]*)\(([^()]+)\)\$$/);
  if (!m) return null;
  return m[2].split("|").map((alt) => `${m[1]}${alt}`);
}

// ---------------------------------------------------------------------------
// classification — one descriptor per generated prop, in registry order.
// `kind` is what toClassString needs to rebuild the word:
//   word         value IS the full grammar word
//   step-prefix  word = `${prefix}-${value}` (value = scale step)
//   number-prefix word = `${prefix}-${value}` (value = integer dial weight)
//   group        state group; value = word or (exclusivity "many") word array
// ---------------------------------------------------------------------------
interface Descriptor {
  prop: string;
  axis: string;
  kind: "word" | "step-prefix" | "number-prefix" | "group";
  prefix?: string;
  valueType: string;   // the TS type of the prop's value
  exclusiveWith?: string; // XOR family id — props sharing it are alternatives
  many?: boolean;      // group with exclusivity "many" (array allowed)
}

interface XorFamily { id: string; whole: Descriptor[]; dials: Descriptor[] }

const scaleType = new Map<string, string>(); // scale name -> emitted type alias name
function stepType(domain: string, scales: Scales): string {
  const name = domain.replace(/-step$/, "");
  if (!(name in scales)) throw new Error(`token domain '${domain}' references undeclared scale '${name}'`);
  if (!scaleType.has(name)) scaleType.set(name, `${pascal(name)}Step`);
  return scaleType.get(name)!;
}

function stepPrefixOf(record: AxisRecord): string | null {
  // the authored word prefix of the axis's step token, e.g. gap-<density> → "gap";
  // null when the token alternates several prefixes (constraints shape).
  const token = record.tokens.find((t) => t.valueDomain?.endsWith("-step") && !t.fallback);
  const m = token?.pattern.source.match(/^\^([a-z-]+)-\(/);
  return m ? m[1] : null;
}

// mechanical dial-prefix resolution: the authored prefix of a dial's words is
// whichever candidate the axis's own dialOf maps back to that dial.
function dialPrefix(record: AxisRecord, dial: string, sampleStep: string): string {
  const base = stepPrefixOf(record);
  const candidates = base ? [`${base}-${dial}`, dial] : [dial];
  for (const candidate of candidates) {
    if (record.dialOf?.(`${candidate}-${sampleStep}`) === dial) return candidate;
  }
  throw new Error(`axis '${record.axis}': cannot resolve authored prefix for dial '${dial}'`);
}

function literalWords(record: AxisRecord): string[] {
  return record.valueSpace.filter((word) => !word.includes("<") && !/-N$/.test(word));
}

function parametricValueType(record: AxisRecord): string {
  // closed axis whose members include parametric words: full-word union with
  // template-literal parts for the parametric members.
  const parts: string[] = [];
  for (const word of record.valueSpace) {
    if (/-N$/.test(word)) parts.push(`\`${word.replace(/-N$/, "")}-\${number}\``);
    else if (word.includes("<")) {
      const token = record.tokens.find((t) => t.valueDomain?.endsWith("-step") && !t.fallback);
      if (!token) throw new Error(`axis '${record.axis}': placeholder member without a step token`);
      parts.push(`\`${word.replace(/<.+>/, "")}\${${stepType(token.valueDomain!, SCALES)}}\``);
    } else parts.push(quote(word));
  }
  return parts.join(" | ");
}

function groupValueType(record: AxisRecord): string {
  const words: string[] = [];
  for (const member of record.stateGroup!.members) {
    if (member.enumValues?.length) for (const value of member.enumValues) words.push(`${member.word}-${value}`);
    else words.push(member.word);
  }
  return words.map(quote).join(" | ");
}

function classify(records: readonly AxisRecord[]): { descriptors: Descriptor[]; xors: XorFamily[]; skipped: string[] } {
  const descriptors: Descriptor[] = [];
  const xors: XorFamily[] = [];
  const skipped: string[] = [];
  const dialNameCounts = new Map<string, number>();
  for (const record of records)
    for (const dial of record.subDials ?? [])
      dialNameCounts.set(dial, (dialNameCounts.get(dial) ?? 0) + 1);

  for (const record of records) {
    const axisProp = camel(record.axis);

    if (record.stateGroup) {
      descriptors.push({
        prop: axisProp, axis: record.axis, kind: "group",
        valueType: groupValueType(record),
        many: record.stateGroup.exclusivity === "many",
      });
      continue;
    }

    if (!record.tokens.length) {
      skipped.push(record.axis); // no sanctioned vocabulary (gap-reported skin sockets)
      continue;
    }

    if (record.subDials?.length) {
      const family: XorFamily = { id: axisProp, whole: [], dials: [] };
      const stepToken = record.tokens.find((t) => t.valueDomain?.endsWith("-step") && !t.fallback);
      const integerDials = record.tokens.some((t) => t.valueDomain?.startsWith("integer") && !t.fallback);

      for (const dial of record.subDials) {
        const prop = dialNameCounts.get(dial)! > 1 || dial.length <= 2
          ? camel(`${axisProp}-${dial}`)
          : camel(dial);
        if (integerDials) {
          family.dials.push({ prop, axis: record.axis, kind: "number-prefix", prefix: dial, valueType: "number" });
        } else if (stepToken) {
          const scaleName = stepToken.valueDomain!.replace(/-step$/, "");
          family.dials.push({
            prop, axis: record.axis, kind: "step-prefix",
            prefix: dialPrefix(record, dial, (SCALES as Scales)[scaleName][0]),
            valueType: stepType(stepToken.valueDomain!, SCALES),
          });
        } else {
          // closed word-valued dial: the union of this dial's own words
          const words = literalWords(record).filter((word) => record.dialOf?.(word) === dial);
          family.dials.push({ prop, axis: record.axis, kind: "word", valueType: words.map(quote).join(" | ") });
        }
      }

      if (record.aliases?.length) {
        family.whole.push({
          prop: axisProp, axis: record.axis, kind: "word",
          valueType: record.aliases.map((a) => quote(a.word)).join(" | "),
        });
      } else if (record.aliasMatch) {
        const wholeWords = literalWords(record).filter((word) => record.aliasMatch!(word) && !record.dialOf?.(word));
        const wholePrefix = stepPrefixOf(record);
        if (stepToken && !wholeWords.length && wholePrefix) {
          family.whole.push({
            prop: axisProp, axis: record.axis, kind: "step-prefix",
            prefix: wholePrefix,
            valueType: stepType(stepToken.valueDomain!, SCALES),
          });
        } else if (wholeWords.length) {
          family.whole.push({ prop: axisProp, axis: record.axis, kind: "word", valueType: wholeWords.map(quote).join(" | ") });
        }
      }

      if (family.whole.length) {
        for (const d of [...family.whole, ...family.dials]) d.exclusiveWith = family.id;
        xors.push(family);
      }
      descriptors.push(...family.whole, ...family.dials);
      continue;
    }

    const stepToken = record.tokens.find((t) => t.valueDomain?.endsWith("-step") && !t.fallback);
    const plainPrefix = stepPrefixOf(record);
    const singleStepPlaceholder = !!plainPrefix &&
      record.valueSpace.length === 1 &&
      record.valueSpace[0].startsWith(`${plainPrefix}-<`);
    if (stepToken && plainPrefix && (record.valueSpace.every((w) => !w.includes("<")) || singleStepPlaceholder)) {
      // ordered-chain scale axis authored as prefix-step words (gap-<density>)
      descriptors.push({
        prop: camel(plainPrefix), axis: record.axis, kind: "step-prefix",
        prefix: plainPrefix, valueType: stepType(stepToken.valueDomain!, SCALES),
      });
      continue;
    }

    if (record.parametricMembers?.length) {
      descriptors.push({ prop: axisProp, axis: record.axis, kind: "word", valueType: parametricValueType(record) });
      continue;
    }

    descriptors.push({
      prop: axisProp, axis: record.axis, kind: "word",
      valueType: literalWords(record).map(quote).join(" | "),
    });
  }
  return { descriptors, xors, skipped };
}

// ---------------------------------------------------------------------------
// scope props from the environment prefixes
// ---------------------------------------------------------------------------
interface ScopeProp { prop: string; prefix: string }

function scopeProps(scopes: readonly ScopePrefix[]): ScopeProp[] {
  const out: ScopeProp[] = [];
  for (const scope of scopes) {
    const instances = alternation(scope.pattern);
    if (!instances) throw new Error(`scope '${scope.id}' pattern is not a finite alternation`);
    for (const instance of instances) out.push({ prop: camel(instance), prefix: instance });
  }
  return out;
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------
export function renderModule(): string {
  scaleType.clear();
  const { descriptors, xors, skipped } = classify(REGISTRY);
  const scopes = scopeProps(ENVIRONMENT_SCOPES);
  const xorProps = new Set(descriptors.filter((d) => d.exclusiveWith).map((d) => d.prop));
  const plain = descriptors.filter((d) => !d.exclusiveWith);

  const lines: string[] = [];
  lines.push("// ermine-props.generated.ts — generated by surfaces/typed/generate.ts — do not edit.");
  lines.push("// One-word-per-axis is TYPE-enforced for single props and for the whole-vs-dial");
  lines.push("// exclusions below; everything else is the runtime linter's job (see ENFORCEMENT.md).");
  if (skipped.length) lines.push(`// Axes with no sanctioned vocabulary (gap-reported): ${skipped.join(", ")} — no props generated.`);
  lines.push("");

  for (const [scale, typeName] of scaleType) {
    lines.push(`export type ${typeName} = ${(SCALES as Scales)[scale].map(quote).join(" | ")};`);
  }
  lines.push("");
  lines.push("type None<K extends PropertyKey> = { [P in K]?: never };");
  lines.push("");

  lines.push("// props with no cross-prop exclusion (single prop = single word: P1 by construction)");
  lines.push("export interface ErminePlainProps {");
  for (const d of plain) {
    const value = d.many ? `${d.valueType} | readonly (${d.valueType})[]` : d.valueType;
    lines.push(`  /** axis \`${d.axis}\` */`);
    lines.push(`  ${d.prop}?: ${value};`);
  }
  lines.push("}");
  lines.push("");

  for (const family of xors) {
    const name = `${pascal(family.id)}Exclusive`;
    const wholeProps = family.whole.map((d) => d.prop);
    const dialProps = family.dials.map((d) => d.prop);
    lines.push(`// axis \`${family.whole[0].axis}\`: a whole-axis value fixes every dial — combining is a COMPILE error (P1/P5)`);
    lines.push(`export type ${name} =`);
    lines.push(`  | ({ ${family.whole.map((d) => `${d.prop}?: ${d.valueType};`).join(" ")} } & None<${dialProps.map(quote).join(" | ")}>)`);
    lines.push(`  | ({ ${family.dials.map((d) => `${d.prop}?: ${d.valueType};`).join(" ")} } & None<${wholeProps.map(quote).join(" | ")}>);`);
    lines.push("");
  }

  const xorNames = xors.map((f) => `${pascal(f.id)}Exclusive`);
  lines.push("// base surface: everything except environment scopes");
  lines.push(`export type ErmineBaseProps = ErminePlainProps${xorNames.map((n) => ` & ${n}`).join("")};`);
  lines.push("");
  lines.push("// environment scopes hold BASE props only — a scoped word cannot itself be scoped");
  lines.push("export interface ErmineScopeProps {");
  for (const s of scopes) {
    lines.push(`  /** scope prefix \`${s.prefix}:\` */`);
    lines.push(`  ${s.prop}?: ErmineBaseProps;`);
  }
  lines.push("}");
  lines.push("");
  lines.push("export type ErmineProps = ErmineBaseProps & ErmineScopeProps;");
  lines.push("");

  lines.push("// runtime descriptors, in canonical (registry) order — toClassString walks these");
  lines.push("export interface PropDescriptor { prop: string; axis: string; kind: \"word\" | \"step-prefix\" | \"number-prefix\" | \"group\"; prefix?: string; many?: boolean }");
  lines.push("export const BASE_DESCRIPTORS: readonly PropDescriptor[] = [");
  for (const d of descriptors) {
    const fields = [
      `prop: ${quote(d.prop)}`, `axis: ${quote(d.axis)}`, `kind: ${quote(d.kind)}`,
      d.prefix !== undefined ? `prefix: ${quote(d.prefix)}` : "",
      d.many ? "many: true" : "",
    ].filter(Boolean).join(", ");
    lines.push(`  { ${fields} },`);
  }
  lines.push("];");
  lines.push("");
  lines.push("export const SCOPE_DESCRIPTORS: readonly { prop: string; prefix: string }[] = [");
  for (const s of scopes) lines.push(`  { prop: ${quote(s.prop)}, prefix: ${quote(s.prefix)} },`);
  lines.push("];");
  lines.push("");
  lines.push(`export const XOR_PROPS: ReadonlySet<string> = new Set(${JSON.stringify([...xorProps])});`);
  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// write / --check (K2 pattern)
// ---------------------------------------------------------------------------
function firstDifference(current: string, expected: string): string {
  const a = current.split("\n");
  const b = expected.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) return `first difference at line ${i + 1}\n  current:  ${a[i] ?? "<EOF>"}\n  expected: ${b[i] ?? "<EOF>"}`;
  }
  return "content differs";
}

async function main(): Promise<void> {
  const expected = renderModule();
  let current = "";
  try { current = await readFile(OUTPUT, "utf8"); } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code !== "ENOENT") throw cause;
  }
  if (process.argv.includes("--check")) {
    if (current !== expected) {
      console.error(`ermine-props.generated.ts is stale; run npm run typed\n${firstDifference(current, expected)}`);
      process.exitCode = 1;
    } else console.log("ermine-props.generated.ts is current");
  } else if (current !== expected) {
    await writeFile(OUTPUT, expected);
    console.log("updated surfaces/typed/ermine-props.generated.ts");
  } else console.log("ermine-props.generated.ts already current");
}

const invoked = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invoked) await main();
