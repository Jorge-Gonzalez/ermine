import { readFile, writeFile } from "node:fs/promises";

import { REGISTRY, SCALES, type AxisRecord } from "./registry.ts";

const GUIDE_PATH = new URL("./ERMINE-GUIDE.md", import.meta.url);

interface GuideBlock {
  name: string;
  render: () => string;
}

function begin(name: string): string {
  return `<!-- BEGIN GENERATED: guide-${name} (do not edit between markers) -->`;
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

function renderStructure(): string {
  const descriptions: Record<string, string> = {
    horizontal: "a row",
    vertical: "a column",
    grid: "a grid",
  };
  return axis("structure").valueSpace
    .map((word) => `- ${code(word)}${descriptions[word] ? ` — ${descriptions[word]}` : ""}`)
    .join("\n");
}

function renderDensityScale(): string {
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

function renderSpacingFamilies(): string {
  const families = [
    {
      axis: "density",
      description: "space **between** children (the default for rhythm).",
      example: "gap-comfortable",
    },
    {
      axis: "flow-spacing",
      description: "space between children in **prose/block flow** where `gap` can't reach.",
      example: "flow-relaxed",
    },
    {
      axis: "padding",
      description: "space **inside** an element.",
      example: "padding-snug",
    },
    {
      axis: "margin",
      description: "an element's **own outward** space. Reach for this only when something needs space\n  independent of its container's rhythm.",
      example: "margin-loose",
    },
  ] as const;

  return families
    .map(
      (family) =>
        `- ${code(densityShape(family.axis))} — ${family.description} ${code(family.example)}`,
    )
    .join("\n");
}

function renderAlignment(): string {
  const container = axis("alignment-container").valueSpace;
  const align = container.filter((word) => word.startsWith("align-"));
  const justify = container.filter((word) => word.startsWith("justify-"));
  const member = axis("m4-self-alignment").valueSpace;
  return [
    `- Container aligns its children: ${code(compactPrefixed(align, "align-"))},`,
    `  ${code(compactPrefixed(justify, "justify-"))}.`,
    `- A member overrides its own alignment: ${code(compactPrefixed(member, "self-"))}.`,
  ].join("\n");
}

function renderFlexAliases(): string {
  const descriptions: Record<string, string> = {
    rigid: "never grows, never shrinks",
    compressible: "shrinks if needed (the default)",
    expandable: "grows to fill space",
    elastic: "both grows and shrinks",
  };
  const aliases = axis("m2-flex").aliases;
  if (!aliases?.length) throw new Error("Guide flex listing requires whole-axis aliases");
  return aliases
    .map(({ word }) => `- ${code(word)}${descriptions[word] ? ` — ${descriptions[word]}` : ""}`)
    .join("\n");
}

function renderBasisChoices(): string {
  const descriptions: Record<string, string> = {
    "basis-content": "size to its content (Figma's *Hug*)",
    "basis-ratio": "take a share of the space (like `1fr`)",
    "basis-exact-<size>": "a specific size from the size scale",
  };
  return axis("m3-self-size").valueSpace
    .map((word) => {
      const display = word === "basis-exact-<size>"
        ? compactPrefixed(SCALES.size.map((step) => `basis-exact-${step}`), "basis-exact-")
        : word;
      return `- ${code(display)}${descriptions[word] ? ` — ${descriptions[word]}` : ""}`;
    })
    .join("\n");
}

function renderMoreContainerWords(): string {
  const divider = axis("divider");
  const wrapping = axis("wrapping");
  return [
    `- ${divider.valueSpace.map(code).join(" / ")} — a line drawn *between* children (not on each child). ${code(divider.default ?? "")} is the default.`,
    `- ${wrapping.valueSpace.map(code).join(" / ")} — wrapping behaviour.`,
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
  return `${source.slice(0, start)}${startMarker}\n${block.render()}\n${endMarker}${source.slice(finish + endMarker.length)}`;
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
