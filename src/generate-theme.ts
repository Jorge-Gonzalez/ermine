// Generates src/theme/sockets.generated.ts from the registry's SKIN_PLANE data.
// The socket list is the identity of the theme plane (R-SKIN-08); deriving it from
// registry-owned data keeps the type contract single-sourced. `--check` fails if the
// generated file is stale.

import { readFile, writeFile } from "node:fs/promises";

import { SKIN_PLANE } from "./registry.ts";

const OUT_PATH = new URL("./theme/sockets.generated.ts", import.meta.url);

interface Derived {
  color: string[];
  radius: string[];
  type: string[];
  weight: string[];
  required: string[];
}

function socketsFor(anchor: string, steps: readonly string[]): string[] {
  return [anchor, ...steps.map((step) => `${anchor}-${step}`)];
}

function derive(): Derived {
  const carriers = Object.entries(SKIN_PLANE.colors.carriers);
  const roles = Object.entries(SKIN_PLANE.colors.roles);
  const color = [
    ...carriers.flatMap(([anchor, steps]) => socketsFor(anchor, steps)),
    ...roles.flatMap(([anchor, steps]) => socketsFor(anchor, steps)),
  ];
  const scale = (family: keyof typeof SKIN_PLANE.scales) =>
    SKIN_PLANE.scales[family].map((step) => `${family}-${step}`);
  const radius = scale("radius");
  const type = scale("type");
  const weight = scale("weight");
  // Required floor (R-SKIN-08): the carrier anchors — a themed surface minimally needs a
  // background, text, and border color. Role anchors, all color steps, and scales are
  // optional: mode-invariant scales may come through the plane or a project metric layer.
  const required = carriers.map(([anchor]) => anchor);
  return { color, radius, type, weight, required };
}

function list(name: string, values: string[]): string[] {
  return [`export const ${name} = [`, ...values.map((v) => `  "${v}",`), "] as const;"];
}

function render(): string {
  const { color, radius, type, weight, required } = derive();
  const all = [...color, ...radius, ...type, ...weight];
  return [
    "// GENERATED from src/registry.ts SKIN_PLANE by src/generate-theme.ts — do not edit.",
    "// The socket list is the theme plane's identity (R-SKIN-08).",
    "",
    ...list("SKIN_SOCKETS", all),
    "",
    "export type SkinSocket = (typeof SKIN_SOCKETS)[number];",
    "",
    "// Carrier anchors + scale steps: every theme must bind these (R-SKIN-08 floor).",
    ...list("REQUIRED_SOCKETS", required),
    "",
    "export const SOCKET_FAMILIES = {",
    `  color: [${color.map((s) => `"${s}"`).join(", ")}],`,
    `  radius: [${radius.map((s) => `"${s}"`).join(", ")}],`,
    `  type: [${type.map((s) => `"${s}"`).join(", ")}],`,
    `  weight: [${weight.map((s) => `"${s}"`).join(", ")}],`,
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
