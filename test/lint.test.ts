// lint.test.ts — the linter's behavioral spec, as asserting tests.
// Ported verbatim from lint.ts's former smoke block (now the authoritative gate),
// plus the cases documenting the `rows` removal (see controls-fidelity.test.ts / emit.test.ts).

import { test } from "node:test";
import assert from "node:assert/strict";
import { lint, type LintContext } from "../src/lint.ts";

type Case = { s: string; backing?: string[]; ctx?: LintContext; expect: "ok" | "warn" | "fail"; why?: string };

const cases: Case[] = [
  { s: "horizontal gap-md padding-lg", expect: "ok" },
  { s: "horizontal vertical", expect: "fail", why: "P1 same axis/scope" },
  { s: "horizontal viewport-md:vertical", expect: "ok", why: "Law 2: different scopes" },
  { s: "viewport-md:horizontal viewport-md:vertical", expect: "fail", why: "same scope, same axis" },
  // m2 — whole-axis aliases vs numbered dials
  { s: "rigid grow-2", expect: "fail", why: "alias is whole-axis; can't combine with a dial" },
  { s: "elastic grow-2", expect: "fail", why: "alias is whole-axis; can't combine with a dial" },
  { s: "expandable shrink-2", expect: "fail", why: "alias fixes both dials; shrink-2 conflicts" },
  { s: "elastic", expect: "ok", why: "alias alone" },
  { s: "grow-2 shrink-1", expect: "ok", why: "numbered dials, one per dial" },
  { s: "grow-2 grow-3", expect: "fail", why: "two values on the same dial" },
  { s: "grow-1", expect: "ok", why: "single dial" },
  // m3 / m5 — closed-with-parametric-member
  { s: "basis-exact-md", expect: "ok", why: "parametric member, valid token" },
  { s: "basis-exact-240", expect: "fail", why: "raw px OUT in v0 — P3 bad-parameter" },
  // P3 — bad-parameter across the other open/parametric axes
  { s: "grow-3", expect: "ok", why: "valid parameter" },
  { s: "grow-abc", expect: "fail", why: "P3: shape recognized (grow-), value not a sanctioned integer" },
  { s: "span-3", expect: "ok", why: "valid parameter, under grid" },
  { s: "span-abc", expect: "fail", why: "P3: shape recognized (span-), value not a sanctioned integer" },
  { s: "min-width-sm", expect: "ok", why: "valid parameter" },
  { s: "min-width-huge", expect: "fail", why: "P3: shape recognized (min-width-), value not a sanctioned size step" },
  { s: "basis-content", expect: "ok", why: "closed member" },
  { s: "basis-content basis-exact-md", expect: "fail", why: "two members of one closed axis" },
  { s: "grid span-all", expect: "ok", why: "contextual member under grid" },
  { s: "grid span-2 span-all", expect: "fail", why: "two members of one closed axis" },
  { s: "grid span-2", expect: "ok", why: "parametric member" },
  // state
  { s: "selected", expect: "fail", why: "P8 no backing" },
  { s: "selected", backing: ["aria-pressed"], expect: "ok", why: "P8 Law-6b disjunction" },
  { s: "selectable", expect: "ok", why: "capability entails nothing" },
  { s: "stretchy", expect: "fail", why: "P2 coined" },
  { s: "modal", expect: "ok", why: "top-layer mechanism" },
  // sticky collision fixed: position-mode prefixed, no longer shadowed by z-scale's 'sticky'
  { s: "position-sticky", expect: "ok", why: "position-mode, unambiguous after prefixing" },
  { s: "sticky", expect: "ok", why: "resolves to z-scale only now" },
  { s: "position-sticky sticky", expect: "ok", why: "different axes (position-mode vs z-scale), compose freely" },
  { s: "grid padding-md selectable selection-subtle", backing: [], expect: "ok" },
  // P10 — divider/wrap interaction
  { s: "divided wrap-allowed", expect: "warn", why: "P10: between-children line + wrapping is a real hazard, not an error" },
  { s: "divided wrap-reverse", expect: "warn", why: "P10: reversed order is the same hazard as wrapping" },
  { s: "divided wrap-prevent", expect: "ok", why: "no wrapping risk — order can't change" },
  { s: "divided", expect: "ok", why: "divided alone, no wrap word present" },
  { s: "wrap-allowed", expect: "ok", why: "wrapping alone, no divider to misplace" },
  // sub-dial axes compose
  { s: "align-center justify-between", expect: "ok", why: "different sub-dials (align-items vs justify-content)" },
  { s: "align-center align-start", expect: "fail", why: "two values on the align sub-dial" },
  { s: "padding-inline-lg padding-block-sm", expect: "ok", why: "different padding sub-dials" },
  { s: "padding-md padding-inline-lg", expect: "fail", why: "whole-axis padding + a per-side dial" },
  { s: "scroll-x scroll-y", expect: "ok", why: "different overflow sub-dials" },
  { s: "scroll-x scroll-auto", expect: "fail", why: "per-axis dial + whole-axis clip/auto" },
  // constraints — min/max compose as a band
  { s: "min-width-sm max-width-lg", expect: "ok", why: "width band: min + max compose" },
  { s: "min-width-sm min-width-lg", expect: "fail", why: "two values on the same min-width dial" },
  { s: "min-width-sm max-width-lg min-height-sm max-height-lg", expect: "ok", why: "all four constraint dials co-occur" },
  // checked-mixed token
  { s: "checked-mixed", backing: ["aria-checked=mixed"], expect: "ok", why: "the word is complete, not checked-mixed-mixed" },
  // enum value parses as a real value
  { s: "sorted-ascending", backing: ["aria-sort=ascending"], expect: "ok", why: "enum value captured and checked against backing value" },
  { s: "current-page", backing: ["aria-current=page"], expect: "ok", why: "enum value captured and checked against backing value" },
  // state co-presence
  { s: "hover focus", backing: [":hover", ":focus"], expect: "ok", why: "focus group now many — co-present states" },
  { s: "focus focus-visible", backing: [":focus", ":focus-visible"], expect: "warn", why: "implies, not conflicts — redundant but not an error" },
  { s: "focus-visible", backing: [":focus-visible"], expect: "ok", why: "narrower alone, no redundancy to flag" },
  { s: "required invalid", backing: [":required", ":invalid"], expect: "ok", why: "validity many: required + invalid co-present" },
  { s: "user-invalid invalid", backing: [":user-invalid", ":invalid"], expect: "warn", why: "user-invalid implies invalid — redundant" },
  { s: "out-of-range invalid", backing: [":out-of-range", ":invalid"], expect: "warn", why: "out-of-range implies invalid — redundant" },
  // P4 — enumerated arity
  { s: "sorted-ascending", backing: ["aria-sort=ascending"], expect: "ok", why: "valid enum value, value-aware backing" },
  { s: "sorted", expect: "fail", why: "P4: enumerated needs a value" },
  { s: "sorted-sideways", expect: "fail", why: "P4: value not in set" },
  { s: "current-page", backing: ["aria-current=page"], expect: "ok", why: "valid enum value, value-aware backing" },
  { s: "current", expect: "fail", why: "P4: enumerated needs a value" },
  // P8 — value-aware enum entailment
  { s: "sorted-ascending", backing: ["aria-sort"], expect: "fail", why: "attribute present but value-unqualified — no longer satisfies" },
  { s: "sorted-ascending", backing: ["aria-sort=descending"], expect: "fail", why: "attribute present with the WRONG value" },
  { s: "current-page", backing: ["aria-current=step"], expect: "fail", why: "attribute present with a different valid-but-wrong enum value" },
  // P6 — arity misuse
  { s: "selected", backing: ["aria-checked=mixed"], expect: "fail", why: "P6: mixed backing → use checked-mixed" },
  { s: "checked-mixed", backing: ["aria-checked=mixed"], expect: "ok", why: "the dedicated tri-state word" },
  // P8-relational — inverted entailment
  { s: "active-descendant", ctx: { elementId: "opt-3", containerAttrs: { "aria-activedescendant": "opt-3" } }, expect: "ok", why: "container points at this element" },
  { s: "active-descendant", ctx: { elementId: "opt-3", containerAttrs: { "aria-activedescendant": "opt-1" } }, expect: "fail", why: "container points elsewhere" },
  { s: "active-descendant", ctx: { elementId: "opt-3", containerAttrs: {} }, expect: "fail", why: "container attr absent" },
  { s: "active-descendant", expect: "ok", why: "no context supplied → relational check skipped, not failed" },
  // `rows` removed (compose-don't-coin): it was `horizontal` + `wrap-allowed`, and smuggled
  // flex-wrap into the structure axis, colliding with the wrapping axis.
  { s: "rows", expect: "fail", why: "P2: `rows` retired — it decomposes to `horizontal wrap-allowed`" },
  { s: "horizontal wrap-allowed", expect: "ok", why: "the composition `rows` used to coin" },
  // P11 — m1 flow-participation inert on a flex/grid item (needs parent context)
  { s: "inline", ctx: { parentClasses: "horizontal gap-sm" }, expect: "warn", why: "P11: inline outer blockified on a flex item" },
  { s: "boxed-inline", ctx: { parentClasses: "grid" }, expect: "warn", why: "P11: grid items blockify too" },
  { s: "inline", ctx: { parentClasses: "padding-lg" }, expect: "ok", why: "parent is flow (no structure word) → inline is meaningful" },
  { s: "boxed", ctx: { parentClasses: "horizontal" }, expect: "ok", why: "boxed is block outer — blockification is a no-op change, not inert-inline" },
  { s: "inline", expect: "ok", why: "no parent context → P11 skipped, not failed" },
  // R-STATE-11 — a backed condition prefix requires its capability word present
  { s: "selected:ground-defined", expect: "fail", why: "R-STATE-11: selected: without selectable" },
  { s: "selectable selected:ground-defined selected:ink-accent", expect: "ok", why: "backed by selectable" },
  { s: "checked:ground-accent", expect: "fail", why: "R-STATE-11: checked: without selectable" },
  { s: "hover:ground-subtle", expect: "ok", why: "hover: is unbacked — no capability required" },
  // R-STATE-12 — attribute-backed: the aria-current selector is the backing, no capability word
  { s: "current:ink-accent current:ground-subtle", expect: "ok", why: "R-STATE-12: attribute-backed, no capability required" },
  // R-STATE-13 — relational: the ancestor must carry selectable when parent context is given
  { s: "concealed parent-hover:revealed", ctx: { parentClasses: "horizontal gap-sm" }, expect: "fail", why: "R-STATE-13: relational scope without selectable ancestor" },
  { s: "concealed parent-hover:revealed parent-selected:revealed", ctx: { parentClasses: "selectable grid" }, expect: "ok", why: "ancestor carries selectable" },
  { s: "concealed parent-hover:revealed", expect: "ok", why: "no parent context → check skipped (serialization stays safe)" },
];

for (const c of cases) {
  const label = `${c.s}${c.backing ? ` (backing: ${c.backing.join(",") || "∅"})` : ""} → ${c.expect}${c.why ? ` — ${c.why}` : ""}`;
  test(label, () => {
    const issues = lint(c.s, new Set(c.backing ?? []), c.ctx ?? {});
    const hasError = issues.some((i) => i.level === "error");
    const hasWarn = issues.some((i) => i.level === "warn");
    const got = hasError ? "fail" : hasWarn ? "warn" : "ok";
    assert.equal(got, c.expect, `${c.s}: expected ${c.expect}, got ${got} — ${issues.map((i) => `${i.rule}:${i.msg}`).join(" | ")}`);
  });
}
