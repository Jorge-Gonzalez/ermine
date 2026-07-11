// GENERATED from src/registry.ts SKIN_PLANE by src/generate-theme.ts — do not edit.
// The socket list is the theme plane's identity (R-SKIN-08).

export const SKIN_SOCKETS = [
  "ground",
  "ground-subtle",
  "ground-defined",
  "ground-hover",
  "ground-active",
  "ground-selected",
  "ink",
  "ink-soft",
  "ink-muted",
  "ink-faint",
  "ink-inverse",
  "ink-selected",
  "rule",
  "rule-soft",
  "accent",
  "accent-soft",
  "accent-faint",
  "pass",
  "pass-faint",
  "warn",
  "warn-faint",
  "fail",
  "fail-faint",
  "note",
  "note-faint",
  "shadow",
  "radius-sm",
  "radius-md",
  "radius-lg",
  "radius-xl",
  "radius-2xl",
  "radius-3xl",
  "type-xs",
  "type-sm",
  "type-md",
  "type-lg",
  "type-xl",
  "type-2xl",
  "type-3xl",
  "weight-medium",
  "weight-semibold",
  "weight-bold",
  "shadow-elevated",
] as const;

export type SkinSocket = (typeof SKIN_SOCKETS)[number];

// Carrier anchors + scale steps: every theme must bind these (R-SKIN-08 floor).
export const REQUIRED_SOCKETS = [
  "ground",
  "ink",
  "rule",
] as const;

export const SOCKET_FAMILIES = {
  color: ["ground", "ground-subtle", "ground-defined", "ground-hover", "ground-active", "ground-selected", "ink", "ink-soft", "ink-muted", "ink-faint", "ink-inverse", "ink-selected", "rule", "rule-soft", "accent", "accent-soft", "accent-faint", "pass", "pass-faint", "warn", "warn-faint", "fail", "fail-faint", "note", "note-faint", "shadow"],
  radius: ["radius-sm", "radius-md", "radius-lg", "radius-xl", "radius-2xl", "radius-3xl"],
  type: ["type-xs", "type-sm", "type-md", "type-lg", "type-xl", "type-2xl", "type-3xl"],
  weight: ["weight-medium", "weight-semibold", "weight-bold"],
  elevation: ["shadow-elevated"],
} as const satisfies Record<string, readonly SkinSocket[]>;
