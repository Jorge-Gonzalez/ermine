// GENERATED from src/registry.ts SKIN_PLANE by src/generate-theme.ts — do not edit.
// The socket list is the theme plane's identity (R-SKIN-08).

export const SKIN_SOCKETS = [
  "ground",
  "ink",
  "rule",
  "accent",
  "pass",
  "warn",
  "fail",
  "note",
  "radius-sm",
  "radius-md",
  "radius-lg",
  "type-sm",
  "type-md",
  "type-lg",
  "type-xl",
  "weight-medium",
  "weight-semibold",
  "weight-bold",
] as const;

export type SkinSocket = (typeof SKIN_SOCKETS)[number];

export const SOCKET_FAMILIES = {
  color: ["ground", "ink", "rule", "accent", "pass", "warn", "fail", "note"],
  radius: ["radius-sm", "radius-md", "radius-lg"],
  type: ["type-sm", "type-md", "type-lg", "type-xl"],
  weight: ["weight-medium", "weight-semibold", "weight-bold"],
} as const satisfies Record<string, readonly SkinSocket[]>;
