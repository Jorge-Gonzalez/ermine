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
  { s: "control-size-lg", expect: "ok", why: "valid spacing-scale control size" },
  { s: "control-size-huge", expect: "fail", why: "P3: shape recognized (control-size-), value not a sanctioned spacing step" },
  { s: "basis-content", expect: "ok", why: "closed member" },
  { s: "basis-content basis-exact-md", expect: "fail", why: "two members of one closed axis" },
  { s: "grid span-all", expect: "ok", why: "contextual member under grid" },
  { s: "grid span-2 span-all", expect: "fail", why: "two members of one closed axis" },
  { s: "grid span-2", expect: "ok", why: "parametric member" },
  { s: "grid-fit-sm span-2", expect: "ok", why: "grid-fit is a grid structure variant over a size token" },
  { s: "grid grid-fit-sm", expect: "fail", why: "two structure members" },
  { s: "grid-fit-huge", expect: "fail", why: "P3: shape recognized (grid-fit-), value not a sanctioned size step" },
  // parent-context requirements — skipped when parent is unknown, enforced when supplied
  { s: "span-3", ctx: { parentClasses: "vertical" }, expect: "fail", why: "grid placement needs a grid parent when parent context is known" },
  { s: "span-3", ctx: { parentClasses: "grid-fit-sm" }, expect: "ok", why: "grid-fit is a grid parent" },
  { s: "subgrid", ctx: { parentClasses: "vertical" }, expect: "fail", why: "subgrid needs a grid parent when parent context is known" },
  { s: "subgrid", ctx: { parentClasses: "grid-fit-sm" }, expect: "ok", why: "subgrid under grid-fit parent" },
  { s: "quarter", expect: "ok", why: "no parent context supplied → requirement skipped" },
  { s: "quarter", ctx: { parentClasses: "grid-fit-sm" }, expect: "fail", why: "intent proportions require columns-12 specifically" },
  { s: "quarter", ctx: { parentClasses: "columns-12" }, expect: "ok", why: "intent proportion under columns-12" },
  // state
  { s: "selected", expect: "fail", why: "P8 no backing" },
  { s: "selected", backing: ["aria-pressed"], expect: "fail", why: "pressed toggle truth is not selected item truth" },
  { s: "pressed", backing: ["aria-pressed"], expect: "ok", why: "toggle-button pressed truth" },
  { s: "selectable", expect: "ok", why: "capability entails nothing" },
  { s: "stretchy", expect: "fail", why: "P2 coined" },
  { s: "modal", expect: "ok", why: "top-layer mechanism" },
  // sticky collision fixed: position-mode prefixed, no longer shadowed by z-scale's 'sticky'
  { s: "position-sticky", expect: "ok", why: "position-mode, unambiguous after prefixing" },
  { s: "sticky", expect: "ok", why: "resolves to z-scale only now" },
  { s: "position-sticky sticky", expect: "ok", why: "different axes (position-mode vs z-scale), compose freely" },
  { s: "attach-below stretch-inline", expect: "ok", why: "disjoint positioned edge-relation footprints compose" },
  { s: "center-x stretch-inline", expect: "fail", why: "both own the left positioned-relation slot" },
  { s: "center-y attach-below", expect: "fail", why: "both own the top positioned-relation slot" },
  { s: "center-x center-y", expect: "fail", why: "both own the transform positioned-relation slot" },
  { s: "grid padding-md selectable selection-subtle", backing: [], expect: "ok" },
  // P10 — divider/wrap interaction
  { s: "divided wrap-allowed", expect: "warn", why: "P10: between-children line + wrapping is a real hazard, not an error" },
  { s: "divided wrap-reverse", expect: "warn", why: "P10: reversed order is the same hazard as wrapping" },
  { s: "divided wrap-prevent", expect: "ok", why: "no wrapping risk — order can't change" },
  { s: "divided", expect: "ok", why: "divided alone, no wrap word present" },
  { s: "wrap-allowed", expect: "ok", why: "wrapping alone, no divider to misplace" },
  // text-flow treatments — one white-space/truncation treatment per element
  { s: "text-nowrap", expect: "ok", why: "bare non-ellipsis nowrap treatment" },
  { s: "text-pre-wrap", expect: "ok", why: "preserves authored line breaks" },
  { s: "text-wrap", expect: "ok", why: "scoped release endpoint for truncation" },
  { s: "text-nowrap text-pre-wrap", expect: "fail", why: "two text-flow treatments on one axis" },
  { s: "truncate text-nowrap", expect: "fail", why: "truncate already owns nowrap as a text-flow treatment" },
  { s: "undecorated hover:underlined", expect: "ok", why: "base and hover text decoration scopes are independent" },
  { s: "elevated-soft", expect: "ok", why: "soft elevation strength" },
  { s: "elevated-soft elevated", expect: "fail", why: "one elevation strength per scope" },
  { s: "undecorated underlined", expect: "fail", why: "two text-decoration treatments in one scope" },
  // sub-dial axes compose
  { s: "align-center justify-between content-align-start", expect: "ok", why: "different sub-dials (align-items vs justify-content vs align-content)" },
  { s: "align-center align-start", expect: "fail", why: "two values on the align sub-dial" },
  { s: "content-align-start content-align-center", expect: "fail", why: "two values on the content-align sub-dial" },
  { s: "padding-inline-lg padding-block-sm", expect: "ok", why: "different padding sub-dials" },
  { s: "padding-md padding-inline-lg", expect: "fail", why: "whole-axis padding + a per-side dial" },
  { s: "padding-left-xs padding-right-sm", expect: "ok", why: "disjoint padding edge dials compose" },
  { s: "padding-inline-xs padding-left-sm", expect: "fail", why: "inline padding overlaps left edge" },
  { s: "padding-block-md padding-top-sm", expect: "fail", why: "block padding overlaps top edge" },
  { s: "padding-md padding-top-sm", expect: "fail", why: "whole-axis padding owns every edge" },
  { s: "padding-top-sm padding-bottom-xl", expect: "ok", why: "disjoint block edges compose" },
  { s: "padding-none padding-left-xs", expect: "fail", why: "whole-axis padding none owns every edge" },
  { s: "padding-left-none padding-right-sm", expect: "ok", why: "spacing none endpoint composes across disjoint edges" },
  { s: "scroll-x scroll-y", expect: "ok", why: "different overflow sub-dials" },
  { s: "scroll-x scroll-auto", expect: "fail", why: "per-axis dial + whole-axis clip/auto" },
  { s: "hidden overflow-visible", expect: "fail", why: "two whole-axis overflow treatments" },
  { s: "centered flush-block", expect: "ok", why: "flow centering and block flush are different logical margin dials" },
  { s: "centered centered", expect: "fail", why: "two values on the same flow-centering dial" },
  { s: "margin-left-sm margin-right-xl", expect: "ok", why: "disjoint margin edge dials compose" },
  { s: "margin-inline-sm margin-left-md", expect: "fail", why: "inline margin overlaps left edge" },
  { s: "centered margin-left-sm", expect: "fail", why: "centered owns the inline margin footprint" },
  { s: "flush-block margin-top-sm", expect: "fail", why: "flush-block owns the block margin footprint" },
  { s: "margin-none centered", expect: "fail", why: "whole-axis margin none conflicts with centering" },
  { s: "margin-top-none margin-bottom-xl", expect: "ok", why: "spacing none endpoint composes across disjoint margin edges" },
  { s: "corner-top-sm corner-bottom-md", expect: "ok", why: "disjoint corner side dials compose" },
  { s: "corner-md corner-bottom-none", expect: "fail", why: "whole-box corner owns every corner slot" },
  { s: "corner-bottom-sm corner-bottom-none", expect: "fail", why: "two values on the bottom corner dial" },
  { s: "rule-left-accent rule-right-soft", expect: "ok", why: "disjoint rule colour edge dials compose" },
  { s: "rule rule-bottom-accent", expect: "fail", why: "whole-box rule colour owns every edge" },
  { s: "rule-bottom-accent rule-bottom-transparent", expect: "fail", why: "two rule colours on the same edge" },
  { s: "ruled-left ruled-right ruled-bottom", expect: "ok", why: "disjoint rule-presence edge dials compose" },
  { s: "ruled ruled-bottom", expect: "fail", why: "whole-box ruled owns every rule edge" },
  // animation plane — open tween envelope over named duration scale
  { s: "tween-quick", expect: "ok", why: "quick duration step" },
  { s: "tween-rule-quick", expect: "ok", why: "quick transition narrowed to border-color" },
  { s: "tween-opacity-ground-ink-quick", expect: "ok", why: "compound target set over the quick duration" },
  { s: "tween-rule-quick tween-ground-quick", expect: "fail", why: "one tween target/duration envelope per element/scope" },
  { s: "tween-settled emphasized", expect: "ok", why: "duration envelope composes with easing" },
  { s: "tween-quick tween-settled", expect: "fail", why: "one duration envelope per element/scope" },
  { s: "tween-fast", expect: "fail", why: "duration step names are ruled, not inherited from Monky tokens" },
  // opacity treatment — parametric but bounded to 5% increments; endpoints stay semantic
  { s: "alpha-35", expect: "ok", why: "bounded mid-opacity treatment" },
  { s: "hover:alpha-90", expect: "ok", why: "scoped alpha treatment" },
  { s: "alpha-37", expect: "fail", why: "alpha is restricted to 5% increments" },
  { s: "alpha-0", expect: "fail", why: "use concealed for the semantic endpoint" },
  { s: "alpha-100", expect: "fail", why: "use revealed for the semantic endpoint" },
  { s: "alpha-35 alpha-60", expect: "fail", why: "one opacity treatment per scope" },
  { s: "concealed alpha-35", expect: "fail", why: "alpha and concealment share opacity axis" },
  // constraints — min/max compose as a band
  { s: "min-width-sm max-width-lg", expect: "ok", why: "width band: min + max compose" },
  { s: "min-width-sm min-width-lg", expect: "fail", why: "two values on the same min-width dial" },
  { s: "min-width-sm max-width-lg min-height-sm max-height-lg", expect: "ok", why: "all four constraint dials co-occur" },
  { s: "width-popover-lg control-block-md", expect: "ok", why: "role inline size composes with role block size" },
  { s: "dialog-measure width-popover-lg", expect: "fail", why: "dialog measure owns both size footprints" },
  { s: "control-box-lg control-inline-md", expect: "fail", why: "control box owns the inline footprint" },
  { s: "width-auto height-none", expect: "ok", why: "reset endpoints are separate self-size dials" },
  { s: "min-width-popover-sm max-width-popover-2xl max-height-results-md", expect: "ok", why: "role-bound constraints are independent dials" },
  { s: "min-width-popover-sm min-width-control-2xl", expect: "fail", why: "only one value may own the min-width dial" },
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
  { s: "pressed:ground-defined", expect: "fail", why: "R-STATE-11: pressed: without pressable" },
  { s: "pressable pressed:ground-defined pressed:ink-accent", expect: "ok", why: "backed by pressable" },
  { s: "hover:ground-subtle", expect: "ok", why: "hover: is unbacked — no capability required" },
  // R-STATE-12 — attribute-backed: the aria-current selector is the backing, no capability word
  { s: "current:ink-accent current:ground-subtle", expect: "ok", why: "R-STATE-12: attribute-backed, no capability required" },
  { s: "expanded:ground-defined expanded:ink-accent", expect: "ok", why: "R-STATE-12: attribute-backed, no capability required" },
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
