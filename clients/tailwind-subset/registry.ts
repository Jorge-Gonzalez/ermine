// clients/tailwind-subset/registry.ts — B3: a registry encoding a SUBSET of
// Tailwind's vocabulary, proving the engine is vocabulary-independent. The
// engine judges these words with the same predicates that judge Ermine's —
// zero special-casing on either side.
//
// Deliberately encoded the NATURAL way, not the Tailwind-compatible way:
// where Tailwind resolves conflicts by cascade/source order (`p-4 px-2`,
// `p-4 p-2`, `flex-row flex-col`), the engine rejects them with a reason.
// That divergence is the demonstration's thesis, documented in README.md —
// do not "fix" it by bending the encoding.
//
// Judge-only client: no emission, no purity rulings (controls are transcribed
// for honesty; mustNeverTouch is empty everywhere because no constitution
// governs this vocabulary).

import type { AxisRecord, Scales, ScopePrefix } from "../../engine/types.ts";

// Tailwind's numeric spacing scale, integer steps only (halves and arbitrary
// values are deliberately absent — subset).
export const TW_SCALES: Scales = {
  "tw-spacing": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
};

const steps = TW_SCALES["tw-spacing"].join("|");

export const TW_RECORDS: AxisRecord[] = [
  {
    axis: "display",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["flex", "grid", "block", "inline-flex", "hidden"],
    tokens: [{ pattern: /^(flex|grid|block|inline-flex|hidden)$/, shape: "<display>" }],
    default: null,
    controls: ["display"],
    mustNeverTouch: [],
  },
  {
    axis: "flex-direction",
    sibling: "layout", role: "container", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["flex-row", "flex-col"],
    tokens: [{ pattern: /^flex-(row|col)$/, shape: "flex-<direction>" }],
    default: null,
    controls: ["flex-direction"],
    mustNeverTouch: [],
  },
  {
    axis: "gap",
    sibling: "layout", role: "container", signature: "ordered-chain",
    vocabulary: "closed", regime: "free",
    valueSpace: ["gap-<n>"],
    tokens: [
      { pattern: new RegExp(`^(gap)-(${steps})$`), shape: "gap-N", valueDomain: "tw-spacing-step" },
      { pattern: /^gap-.+$/, shape: "gap-<bad>", valueDomain: "tw-spacing-step", fallback: true },
    ],
    parametricMembers: ["gap"],
    default: null,
    controls: ["gap"],
    mustNeverTouch: [],
  },
  {
    // px/py are SUB-DIALS of one padding axis and p-N is its whole-axis form —
    // the same mechanism as Ermine's m2 dials/aliases. This is the natural
    // encoding, and it is exactly where the engine's algebra and Tailwind's
    // cascade semantics part ways: Tailwind accepts `p-4 px-2` (source order
    // resolves the x sides), the engine rejects it (a whole-axis value fixes
    // every dial, so a dial cannot also apply).
    axis: "padding",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["p-<n>", "px-<n>", "py-<n>"],
    tokens: [
      { pattern: new RegExp(`^(p)-(${steps})$`), shape: "p-N", valueDomain: "tw-spacing-step" },
      { pattern: new RegExp(`^(px|py)-(${steps})$`), shape: "px-N | py-N", valueDomain: "tw-spacing-step" },
      { pattern: /^(p|px|py)-.+$/, shape: "p-<bad> | px-<bad> | py-<bad>", valueDomain: "tw-spacing-step", fallback: true },
    ],
    subDials: ["px", "py"],
    dialOf: (word: string) => word.startsWith("px-") ? "px" : word.startsWith("py-") ? "py" : null,
    aliasMatch: (word: string) => /^p-/.test(word),
    parametricMembers: ["p", "px", "py"],
    default: null,
    controls: ["padding"],
    mustNeverTouch: [],
  },
  {
    axis: "width",
    sibling: "layout", role: "self", signature: "set-with-exclusivity",
    vocabulary: "closed", regime: "free",
    valueSpace: ["w-<n>", "w-full", "w-auto"],
    tokens: [
      { pattern: /^(w-full|w-auto)$/, shape: "w-full | w-auto" },
      { pattern: new RegExp(`^(w)-(${steps})$`), shape: "w-N", valueDomain: "tw-spacing-step" },
      { pattern: /^w-.+$/, shape: "w-<bad>", valueDomain: "tw-spacing-step", fallback: true },
    ],
    parametricMembers: ["w"],
    default: null,
    controls: ["width"],
    mustNeverTouch: [],
  },
];

// Responsive prefixes: sm:/md:/lg: are condition scopes, exactly the shape of
// Ermine's viewport-<bp>: — the one place the two vocabularies agree by
// construction (`gap-2 md:gap-4` is lawful in both, because the words live in
// different scopes).
export const TW_SCOPES: ScopePrefix[] = [
  { id: "sm", pattern: /^sm$/, shape: "sm:", role: "none" },
  { id: "md", pattern: /^md$/, shape: "md:", role: "none" },
  { id: "lg", pattern: /^lg$/, shape: "lg:", role: "none" },
];

// The bundle validateRegistry consumes (records + scopes + declared scales).
export const TAILWIND_SUBSET = { records: TW_RECORDS, scopes: TW_SCOPES, scales: TW_SCALES };
