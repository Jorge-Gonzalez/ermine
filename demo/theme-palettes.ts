// Sample palettes after Monky's humo / acera / mar themes, bound to the skin socket
// contract. Demonstration data only — real palettes live in the consuming project
// (R-SKIN-08); these exist to drive the theme-plane demo.

import type { Palette, SocketBindings } from "../src/theme/theme-plane.ts";

interface Tones {
  base: string; toneDim: string; tone: string;
  ink: string; inkSoft: string; inkAlt: string;
  harmonic: string; harmonicMinor: string;
  accent: string; accentDim: string;
  calm: string; active: string; charged: string; still: string;
}

// A role's wash references the resolved role and ground sockets, so it re-mixes per theme.
const wash = (role: string) => `color-mix(in oklch, var(--${role}) 15%, var(--ground))`;
// Interaction tones, computed toward ink (mode-robust differentiation) or accent (selection).
// A real theme may hand-tune these for extra margin; the demo derives them so they stay
// related to the palette and re-mix per theme.
const towardInk = (pct: number) => `color-mix(in oklch, var(--ground) ${100 - pct}%, var(--ink))`;
const towardAccent = (pct: number) => `color-mix(in oklch, var(--ground) ${100 - pct}%, var(--accent))`;

const toSockets = (t: Tones): SocketBindings => ({
  ground: t.base, "ground-subtle": t.toneDim, "ground-defined": t.tone,
  "ground-hover": towardInk(8), "ground-active": towardInk(16), "ground-selected": towardAccent(20),
  ink: t.ink, "ink-soft": t.inkSoft, "ink-inverse": t.inkAlt, "ink-selected": t.accent,
  rule: t.harmonic, "rule-soft": t.harmonicMinor,
  accent: t.accent, "accent-soft": t.accentDim,
  pass: t.calm, "pass-faint": wash("pass"),
  warn: t.active, "warn-faint": wash("warn"),
  fail: t.charged, "fail-faint": wash("fail"),
  note: t.still, "note-faint": wash("note"),
});

export const palettes: Palette = {
  humo: {
    light: toSockets({
      base: "#ededed", toneDim: "#e8e9e9", tone: "#dee5ed",
      ink: "#101624", inkSoft: "#636a76", inkAlt: "#ffffff",
      harmonic: "#d6d8dc", harmonicMinor: "#e1e2e4",
      accent: "#3679e4", accentDim: "#c3c7cb",
      calm: "#00ad54", active: "#df8e01", charged: "#d1431f", still: "#2d5ae1",
    }),
    dark: toSockets({
      base: "#1f2937", toneDim: "#242c3c", tone: "#3b4a61",
      ink: "#f3f4f6", inkSoft: "#9ca3af", inkAlt: "#ffffff",
      harmonic: "#374151", harmonicMinor: "#28303b",
      accent: "#60a5fa", accentDim: "#4b5563",
      calm: "#9ed999", active: "#f4c762", charged: "#f9699a", still: "#9c81ec",
    }),
  },
  acera: {
    light: toSockets({
      base: "#e0e0e0", toneDim: "#e8e6e6", tone: "#eac8bd",
      ink: "#25120d", inkSoft: "#5d4f4b", inkAlt: "#ffffff",
      harmonic: "#e2aea2", harmonicMinor: "#eed1ca",
      accent: "#c2492a", accentDim: "#e46845",
      calm: "#00ad54", active: "#df8e01", charged: "#d1431f", still: "#2d5ae1",
    }),
    dark: toSockets({
      base: "#62666a", toneDim: "#6a6e6e", tone: "#565b5f",
      ink: "#ffffff", inkSoft: "#e4e3cf", inkAlt: "#ffffff",
      harmonic: "#545b5b", harmonicMinor: "#6c7f81",
      accent: "#ffb700", accentDim: "#b19e44",
      calm: "#7ecdab", active: "#e2b37e", charged: "#d36464", still: "#8198df",
    }),
  },
  mar: {
    light: toSockets({
      base: "#c9c4bf", toneDim: "#d4d0cc", tone: "#bbbfd4",
      ink: "#212935", inkSoft: "#657184", inkAlt: "#ffffff",
      harmonic: "#8f98a6", harmonicMinor: "#b5bac1",
      accent: "#1c59bd", accentDim: "#4874be",
      calm: "#05bd5e", active: "#d58b0b", charged: "#d1431f", still: "#2d5ae1",
    }),
    dark: toSockets({
      base: "#0f131b", toneDim: "#121720", tone: "#162e48",
      ink: "#d3eaf8", inkSoft: "#6f8fa4", inkAlt: "#ffffff",
      harmonic: "#203d5d", harmonicMinor: "#162738",
      accent: "#4cbef2", accentDim: "#3d6178",
      calm: "#9ed999", active: "#f4c762", charged: "#f9699a", still: "#9489e1",
    }),
  },
};
