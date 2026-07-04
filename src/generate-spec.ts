import { readFile, writeFile } from "node:fs/promises";

import {
  ENVIRONMENT_SCOPES,
  REGISTRY,
  SCALES,
  type AxisRecord,
  type Sibling,
  type StateMember,
} from "./registry.ts";

const SPEC_PATH = new URL("./ERMINE-SPEC.md", import.meta.url);
const BEGIN = "<!-- BEGIN GENERATED: registry (do not edit between markers) -->";
const END = "<!-- END GENERATED: registry -->";
const GENERATED_NOTE = "> Generated from src/registry.ts by src/generate-spec.ts — do not edit.";

const siblingOrder: Sibling[] = ["layout", "layering", "motion", "state", "skin"];
const sectionNumber: Record<Sibling, string> = {
  layout: "2.1",
  layering: "2.2",
  motion: "2.3",
  state: "2.4",
  skin: "2.5",
};

function code(value: string): string {
  return `\`${value.replace(/`/g, "\\`")}\``;
}

function codes(values: readonly string[]): string {
  return values.length ? values.map(code).join(" ") : "—";
}

function tableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function tuplePairs(pairs: [string, string][] | undefined): string {
  return pairs?.length ? pairs.map(([left, right]) => `${code(left)} → ${code(right)}`).join("; ") : "—";
}

function renderTokenTable(axis: AxisRecord): string[] {
  const lines = [
    "| Shape | Pattern | Value domain | Fallback |",
    "|---|---|---|---|",
  ];
  if (!axis.tokens.length) {
    lines.push("| — | — | — | — |");
    return lines;
  }
  for (const token of axis.tokens) {
    lines.push(
      `| ${tableCell(code(token.shape))} | ${tableCell(code(token.pattern.toString()))} | ` +
        `${token.valueDomain ? tableCell(code(token.valueDomain)) : "—"} | ${token.fallback ? "yes" : "no"} |`,
    );
  }
  return lines;
}

function renderStateMembers(members: StateMember[]): string[] {
  const lines = [
    "| Word | Arity | Driver | Category | Entails (any one) | Enum values | Relational backing | Notes |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const member of members) {
    lines.push(
      `| ${tableCell(code(member.word))} | ${code(member.arity)} | ${code(member.driver)} | ` +
        `${code(member.stateCategory)} | ${tableCell(codes(member.entails ?? []))} | ` +
        `${tableCell(codes(member.enumValues ?? []))} | ` +
        `${member.relationalBacking ? tableCell(code(member.relationalBacking.containerAttr)) : "—"} | ` +
        `${member.note ? tableCell(member.note) : "—"} |`,
    );
  }
  return lines;
}

function renderAxis(axis: AxisRecord): string {
  const lines = [
    `#### ${axis.axis}`,
    "",
    `- role: ${code(axis.role)} · signature: ${code(axis.signature)} · vocabulary: ${code(axis.vocabulary)} · regime: ${code(axis.regime)}`,
    `- value space: ${codes(axis.valueSpace)}`,
    `- default: ${axis.default === null ? "none" : code(axis.default)}`,
    `- controls: ${codes(axis.controls)}`,
    `- must never touch: ${codes(axis.mustNeverTouch)}`,
  ];

  if (axis.subDials?.length) lines.push(`- sub-dials: ${codes(axis.subDials)}`);
  if (axis.dialOf) lines.push("- dial resolver: declared in `registry.ts`");
  if (axis.aliasMatch) lines.push("- whole-axis pattern matcher: declared in `registry.ts`");
  if (axis.parametricMembers?.length) lines.push(`- parametric members: ${codes(axis.parametricMembers)}`);
  if (axis.aliases?.length) {
    lines.push("- whole-axis aliases:", "", "  | Alias | Expansion |", "  |---|---|");
    for (const alias of axis.aliases) lines.push(`  | ${code(alias.word)} | ${code(alias.expands)} |`);
  }
  if (axis.stateGroup) {
    lines.push(
      `- group exclusivity: ${code(axis.stateGroup.exclusivity)}`,
      `- conflicts: ${tuplePairs(axis.stateGroup.conflicts)}`,
      `- implications: ${tuplePairs(axis.stateGroup.implies)}`,
      "- state members:",
      "",
      ...renderStateMembers(axis.stateGroup.members),
    );
  }
  if (axis.notes) lines.push(`- notes: ${axis.notes}`);
  lines.push("", "Tokens:", "", ...renderTokenTable(axis));
  return lines.join("\n");
}

function renderScales(): string {
  const lines = [
    "### Registry scales",
    "",
    "| Scale | Ordered values |",
    "|---|---|",
  ];
  for (const [name, values] of Object.entries(SCALES)) {
    lines.push(`| ${code(name)} | ${tableCell(codes(values))} |`);
  }
  return lines.join("\n");
}

function renderEnvironmentScopes(): string {
  const lines = [
    "### Environmental condition scopes",
    "",
    "These prefixes are closed condition scopes, not registry-axis members. The guarded suffix is an ordinary registry word.",
    "",
    "| ID | Shape | Pattern | Role | Notes |",
    "|---|---|---|---|---|",
  ];
  for (const scope of ENVIRONMENT_SCOPES) {
    lines.push(
      `| ${code(scope.id)} | ${tableCell(code(scope.shape))} | ${tableCell(code(scope.pattern.toString()))} | ` +
        `${code(scope.role)} | ${scope.note ? tableCell(scope.note) : "—"} |`,
    );
  }
  return lines.join("\n");
}

function renderRegistry(): string {
  const counts = Object.fromEntries(
    siblingOrder.map((sibling) => [sibling, REGISTRY.filter((axis) => axis.sibling === sibling).length]),
  ) as Record<Sibling, number>;
  const summary = siblingOrder.map((sibling) => `${sibling}=${counts[sibling]}`).join(" · ");
  const lines = [
    GENERATED_NOTE,
    "",
    `## 2. The axis registry (${REGISTRY.length} axes)  ‹SHARED›`,
    "",
    `${summary}. Every fact below is rendered directly from \`REGISTRY\`, \`SCALES\`, or \`ENVIRONMENT_SCOPES\`.`,
    "",
    renderScales(),
  ];

  for (const sibling of siblingOrder) {
    lines.push(
      "",
      `### ${sectionNumber[sibling]} ${sibling.toUpperCase()} (${counts[sibling]} axes)`,
      "",
      ...REGISTRY.filter((axis) => axis.sibling === sibling).map(renderAxis).join("\n\n").split("\n"),
    );
  }
  lines.push("", renderEnvironmentScopes());
  return lines.join("\n");
}

function generatedBlock(): string {
  return `${BEGIN}\n${renderRegistry()}\n${END}`;
}

function replaceGeneratedSection(source: string): string {
  const begin = source.indexOf(BEGIN);
  const end = source.indexOf(END);
  if (begin >= 0 || end >= 0) {
    if (begin < 0 || end < begin) throw new Error("Malformed generated registry markers in ERMINE-SPEC.md");
    return `${source.slice(0, begin)}${generatedBlock()}${source.slice(end + END.length)}`;
  }

  const sectionStart = source.search(/^## 2\. The axis registry/m);
  const nextSection = source.search(/^## 3\. Generation contract/m);
  if (sectionStart < 0 || nextSection <= sectionStart) {
    throw new Error("Could not locate the hand-written registry section in ERMINE-SPEC.md");
  }
  const before = source.slice(0, sectionStart).trimEnd();
  const after = source.slice(nextSection).trimStart();
  return `${before}\n\n${generatedBlock()}\n\n---\n\n${after}`;
}

function firstDifference(current: string, expected: string): string {
  const currentLines = current.split("\n");
  const expectedLines = expected.split("\n");
  const length = Math.max(currentLines.length, expectedLines.length);
  for (let index = 0; index < length; index += 1) {
    if (currentLines[index] !== expectedLines[index]) {
      return [
        `first difference at line ${index + 1}`,
        `  current:  ${currentLines[index] ?? "<EOF>"}`,
        `  expected: ${expectedLines[index] ?? "<EOF>"}`,
      ].join("\n");
    }
  }
  return "content differs";
}

const current = await readFile(SPEC_PATH, "utf8");
const expected = replaceGeneratedSection(current);
const check = process.argv.includes("--check");

if (check) {
  if (current !== expected) {
    console.error(`ERMINE-SPEC.md is stale; run npm run spec\n${firstDifference(current, expected)}`);
    process.exitCode = 1;
  } else {
    console.log("ERMINE-SPEC.md generated registry block is current");
  }
} else if (current !== expected) {
  await writeFile(SPEC_PATH, expected);
  console.log(`updated ${SPEC_PATH.pathname}`);
} else {
  console.log("ERMINE-SPEC.md already current");
}
