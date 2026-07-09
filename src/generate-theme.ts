// Generates src/theme/sockets.generated.ts from the registry's SKIN_PLANE data.
// The socket list is the identity of the theme plane (R-SKIN-08); deriving it from
// registry-owned data keeps the type contract single-sourced. `--check` fails if the
// generated file is stale.

import { readFile, writeFile } from "node:fs/promises";

import { SKIN_PLANE } from "./registry.ts";

const OUT_PATH = new URL("./theme/sockets.generated.ts", import.meta.url);

function deriveSockets(): { colors: string[]; scales: Record<string, string[]> } {
  const colors = [...SKIN_PLANE.colors.carriers, ...SKIN_PLANE.colors.roles];
  const scales: Record<string, string[]> = {};
  for (const [family, steps] of Object.entries(SKIN_PLANE.scales)) {
    scales[family] = steps.map((step) => `${family}-${step}`);
  }
  return { colors, scales };
}

function render(): string {
  const { colors, scales } = deriveSockets();
  const all = [...colors, ...Object.values(scales).flat()];
  const familyEntries = [
    `  color: [${colors.map((s) => `"${s}"`).join(", ")}],`,
    ...Object.entries(scales).map(([family, sockets]) => `  ${family}: [${sockets.map((s) => `"${s}"`).join(", ")}],`),
  ];
  return [
    "// GENERATED from src/registry.ts SKIN_PLANE by src/generate-theme.ts — do not edit.",
    "// The socket list is the theme plane's identity (R-SKIN-08).",
    "",
    "export const SKIN_SOCKETS = [",
    ...all.map((s) => `  "${s}",`),
    "] as const;",
    "",
    "export type SkinSocket = (typeof SKIN_SOCKETS)[number];",
    "",
    "export const SOCKET_FAMILIES = {",
    ...familyEntries,
    "} as const satisfies Record<string, readonly SkinSocket[]>;",
    "",
  ].join("\n");
}

const expected = render();
const current = await readFile(OUT_PATH, "utf8").catch(() => "");
const check = process.argv.includes("--check");

if (check) {
  if (current !== expected) {
    console.error("src/theme/sockets.generated.ts is stale; run npm run theme");
    process.exitCode = 1;
  } else {
    console.log("theme sockets are current");
  }
} else if (current !== expected) {
  await writeFile(OUT_PATH, expected);
  console.log(`updated ${OUT_PATH.pathname}`);
} else {
  console.log("theme sockets already current");
}
