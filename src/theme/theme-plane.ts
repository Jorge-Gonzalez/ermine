// The value-free theme plane (R-SKIN-08): validate a project palette against the
// registry-derived socket contract, resolve theme × mode to a socket binding, and
// apply a binding to a DOM target as CSS custom properties. No palette values, no
// storage, no framework: a project owns those; Ermine owns the contract and mechanism.

import { REQUIRED_SOCKETS, SKIN_SOCKETS, type SkinSocket } from "./sockets.generated.ts";

export type Mode = "light" | "dark";

/**
 * A theme's socket binding. Required sockets (carrier anchors + scales) must be present;
 * optional sockets (role anchors, all color steps) are bound only when the design uses
 * them — so the binding is a partial map over the socket space.
 */
export type SocketBindings = Partial<Record<SkinSocket, string>>;

/** A project palette: each named theme binds sockets for both resolved modes. */
export type Palette = Record<string, Record<Mode, SocketBindings>>;

const SOCKET_SET: ReadonlySet<string> = new Set(SKIN_SOCKETS);

/**
 * Validate a binding against the contract: every required socket present, every bound
 * value non-empty, no unregistered socket. Optional sockets may be absent. Returns
 * human-readable errors (empty array = valid) rather than throwing, so a caller can
 * report all at once.
 */
export function validateBindings(bindings: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const socket of REQUIRED_SOCKETS) {
    if (!(socket in bindings)) errors.push(`missing required socket: ${socket}`);
  }
  for (const [key, value] of Object.entries(bindings)) {
    if (!SOCKET_SET.has(key)) {
      errors.push(`unregistered socket: ${key}`);
    } else if (typeof value !== "string" || value.trim() === "") {
      errors.push(`empty socket value: ${key}`);
    }
  }
  return errors;
}

/**
 * Resolve a palette to one socket binding. `mode` "system" resolves through the
 * caller-supplied `prefersDark` (the project owns how it learns that — e.g.
 * `prefers-color-scheme`); it is not a third palette.
 */
export function resolveTheme(
  palette: Palette,
  theme: string,
  mode: Mode | "system",
  prefersDark = false,
): SocketBindings {
  const themePalette = palette[theme];
  if (!themePalette) throw new Error(`unknown theme: ${theme}`);
  const resolved: Mode = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  const bindings = themePalette[resolved];
  if (!bindings) throw new Error(`theme ${theme} has no ${resolved} mode`);
  return bindings;
}

/** Minimal DOM surface the applicator needs — satisfied by any HTMLElement. */
export interface StyleTarget {
  style: { setProperty(property: string, value: string): void };
}

/** Write a resolved binding onto a target as `--<socket>` custom properties. */
export function applyTheme(bindings: SocketBindings, target: StyleTarget): void {
  for (const socket of SKIN_SOCKETS) {
    const value = bindings[socket];
    if (value !== undefined) target.style.setProperty(`--${socket}`, value);
  }
}
