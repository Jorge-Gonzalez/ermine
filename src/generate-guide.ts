import { readFile, writeFile } from "node:fs/promises";

import { REGISTRY, SCALES, type AxisRecord } from "./registry.ts";

const GUIDE_PATH = new URL("./ERMINE-GUIDE.md", import.meta.url);

interface GuideBlock {
  name: string;
  render: (current: string) => string;
}

function begin(name: string): string {
  return `<!-- BEGIN GENERATED: guide-${name} (registry words generated; teaching prose editable) -->`;
}

function end(name: string): string {
  return `<!-- END GENERATED: guide-${name} -->`;
}

function code(value: string): string {
  return `\`${value.replace(/`/g, "\\`")}\``;
}

function axis(id: string): AxisRecord {
  const record = REGISTRY.find((candidate) => candidate.axis === id);
  if (!record) throw new Error(`Guide generator references missing registry axis ${id}`);
  return record;
}

function compactPrefixed(values: readonly string[], prefix: string): string {
  const suffixes = values.map((value) => {
    if (!value.startsWith(prefix)) {
      throw new Error(`Expected guide value ${value} to start with ${prefix}`);
    }
    return value.slice(prefix.length);
  });
  return `${prefix}${suffixes.join("|")}`;
}

interface GlossEntry {
  key: string;
  display: string;
}

interface ParsedGloss {
  key: string;
  suffix: string;
}

function logicalBullets(current: string, label: string): string[] {
  const bullets: string[] = [];
  for (const line of current.split("\n")) {
    if (line.startsWith("- ")) bullets.push(line);
    else if (bullets.length && /^\s+\S/.test(line)) bullets[bullets.length - 1] += `\n${line}`;
    else throw new Error(`Guide ${label} contains a line that is not part of a teaching-gloss bullet`);
  }
  return bullets;
}

function parsedGlosses(current: string, label: string): ParsedGloss[] {
  return logicalBullets(current, label).map((bullet) => {
    const match = bullet.match(/^- `([^`]+)`(\s+—[\s\S]+)$/);
    if (!match || !/^\s+—\s+\S/.test(match[2])) {
      throw new Error(`Guide ${label} requires a non-empty teaching gloss after every listed word`);
    }
    return { key: match[1], suffix: match[2] };
  });
}

function preserveKeyedGlosses(
  current: string,
  entries: GlossEntry[],
  label: string,
  normalizeKey: (display: string) => string = (display) => display,
): string {
  const glosses = new Map<string, string>();
  for (const gloss of parsedGlosses(current, label)) {
    const key = normalizeKey(gloss.key);
    if (glosses.has(key)) throw new Error(`Guide ${label} has a duplicate teaching gloss for ${key}`);
    glosses.set(key, gloss.suffix);
  }

  const expected = new Set(entries.map((entry) => entry.key));
  for (const key of glosses.keys()) {
    if (!expected.has(key)) throw new Error(`Guide ${label} has a stale teaching gloss for ${key}`);
  }
  return entries.map((entry) => {
    const suffix = glosses.get(entry.key);
    if (!suffix) throw new Error(`Guide ${label} is missing a teaching gloss for ${entry.key}`);
    return `- ${code(entry.display)}${suffix}`;
  }).join("\n");
}

function preservePositionalGlosses(current: string, displays: string[], label: string): string {
  const glosses = parsedGlosses(current, label);
  if (glosses.length !== displays.length) {
    throw new Error(
      `Guide ${label} has ${glosses.length} teaching glosses for ${displays.length} registry entries`,
    );
  }
  return displays.map((display, index) => `- ${code(display)}${glosses[index].suffix}`).join("\n");
}

function replaceCodeSpans(current: string, displays: string[], label: string): string {
  let index = 0;
  const rendered = current.replace(/`[^`\n]+`/g, () => {
    if (index >= displays.length) throw new Error(`Guide ${label} contains too many generated word spans`);
    return code(displays[index++]);
  });
  if (index !== displays.length) {
    throw new Error(`Guide ${label} contains ${index} word spans for ${displays.length} registry listings`);
  }
  return rendered;
}

function renderStructure(current: string): string {
  const entries = axis("structure").valueSpace.map((word) => ({ key: word, display: word }));
  return preserveKeyedGlosses(current, entries, "structure listing");
}

function renderDensityScale(_current: string): string {
  return `${code(SCALES.density.join(" · "))}.`;
}

function densityShape(axisId: string): string {
  const record = axis(axisId);
  const token = record.tokens.find(
    (candidate) => candidate.valueDomain === "density-step" && !candidate.fallback,
  );
  if (!token) throw new Error(`Guide spacing axis ${axisId} has no density token`);
  return token.shape.replace("<density>", "*");
}

function renderSpacingFamilies(current: string): string {
  const displays = ["density", "flow-spacing", "padding", "margin"].map(densityShape);
  return preservePositionalGlosses(current, displays, "spacing-family listing");
}

function renderAlignment(current: string): string {
  const container = axis("alignment-container").valueSpace;
  const align = container.filter((word) => word.startsWith("align-"));
  const justify = container.filter((word) => word.startsWith("justify-"));
  const member = axis("m4-self-alignment").valueSpace;
  return replaceCodeSpans(current, [
    compactPrefixed(align, "align-"),
    compactPrefixed(justify, "justify-"),
    compactPrefixed(member, "self-"),
  ], "alignment listing");
}

function renderFlexAliases(current: string): string {
  const aliases = axis("m2-flex").aliases;
  if (!aliases?.length) throw new Error("Guide flex listing requires whole-axis aliases");
  return preserveKeyedGlosses(
    current,
    aliases.map(({ word }) => ({ key: word, display: word })),
    "flex-alias listing",
  );
}

function renderBasisChoices(current: string): string {
  const entries = axis("m3-self-size").valueSpace.map((word) => {
    const display = word === "basis-exact-<size>"
      ? compactPrefixed(SCALES.size.map((step) => `basis-exact-${step}`), "basis-exact-")
      : word;
    return { key: word, display };
  });
  return preserveKeyedGlosses(
    current,
    entries,
    "basis-choice listing",
    (display) => display.startsWith("basis-exact-") ? "basis-exact-<size>" : display,
  );
}

function renderMoreContainerWords(current: string): string {
  const divider = axis("divider");
  const wrapping = axis("wrapping");
  const bullets = logicalBullets(current, "additional-container listing");
  if (bullets.length !== 2) throw new Error("Guide additional-container listing requires two axis glosses");
  const suffixes = bullets.map((bullet) => {
    const match = bullet.match(/^- [\s\S]+?(\s+—\s+\S[\s\S]*)$/);
    if (!match) throw new Error("Guide additional-container listing requires a non-empty axis gloss");
    return match[1];
  });
  if (divider.default === null) throw new Error("Guide divider gloss names a default but the registry has none");
  const dividerSuffix = replaceCodeSpans(suffixes[0], [divider.default], "divider-default gloss");
  return [
    `- ${divider.valueSpace.map(code).join(" / ")}${dividerSuffix}`,
    `- ${wrapping.valueSpace.map(code).join(" / ")}${suffixes[1]}`,
  ].join("\n");
}

const BLOCKS: GuideBlock[] = [
  { name: "structure", render: renderStructure },
  { name: "density-scale", render: renderDensityScale },
  { name: "spacing-families", render: renderSpacingFamilies },
  { name: "alignment", render: renderAlignment },
  { name: "flex-aliases", render: renderFlexAliases },
  { name: "basis-choices", render: renderBasisChoices },
  { name: "more-container-words", render: renderMoreContainerWords },
];

function replaceBlock(source: string, block: GuideBlock): string {
  const startMarker = begin(block.name);
  const endMarker = end(block.name);
  const start = source.indexOf(startMarker);
  const finish = source.indexOf(endMarker);
  if (start < 0 || finish < start) {
    throw new Error(`Malformed or missing ${block.name} guide markers`);
  }
  if (source.indexOf(startMarker, start + startMarker.length) >= 0 ||
      source.indexOf(endMarker, finish + endMarker.length) >= 0) {
    throw new Error(`Duplicate ${block.name} guide markers`);
  }
  const current = source.slice(start + startMarker.length, finish).replace(/^\n|\n$/g, "");
  return `${source.slice(0, start)}${startMarker}\n${block.render(current)}\n${endMarker}${source.slice(finish + endMarker.length)}`;
}

function generate(source: string): string {
  return BLOCKS.reduce(replaceBlock, source);
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

const current = await readFile(GUIDE_PATH, "utf8");
const expected = generate(current);
const check = process.argv.includes("--check");

if (check) {
  if (current !== expected) {
    console.error(`ERMINE-GUIDE.md is stale; run npm run guide\n${firstDifference(current, expected)}`);
    process.exitCode = 1;
  } else {
    console.log("ERMINE-GUIDE.md generated word lists are current");
  }
} else if (current !== expected) {
  await writeFile(GUIDE_PATH, expected);
  console.log(`updated ${GUIDE_PATH.pathname}`);
} else {
  console.log("ERMINE-GUIDE.md already current");
}
