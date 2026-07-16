// css.test.ts — the serializer, including the display facet-merge finding
// (the first concrete paper-meets-browser consequence: atomic classes cannot
// express the two-value display merge; a compound selector must).

import { test } from "node:test";
import assert from "node:assert/strict";
import { toCss, buildStylesheet } from "../src/css.ts";

test("a plain scale word serializes to an atomic rule reading a theme var", () => {
  const css = toCss("gap-md");
  assert.match(css, /\.gap-md \{/);
  assert.match(css, /gap: var\(--spacing-md\);/);
});

test("the display facet MERGES onto a compound selector (not two atomic rules)", () => {
  const css = toCss("horizontal inline");
  assert.match(css, /\.horizontal\.inline \{[^}]*display: inline flex;/s, "outer+inner merge to `display: inline flex` on the compound selector");
  assert.match(css, /\.horizontal \{[^}]*flex-direction: row;/s, "structure's non-facet declaration stays atomic");
  assert.doesNotMatch(css, /\.horizontal \{[^}]*display:/s, "there must be NO standalone `.horizontal { display: ... }` — that's the collision the merge avoids");
});

test("a single structure word still gets a one-value display", () => {
  const css = toCss("vertical");
  assert.match(css, /\.vertical \{[^}]*display: flex;/s);
});

test("a sink renders on its compound selector, reading contributor vars", () => {
  const css = buildStylesheet(["selectable selected selection-subtle"]);
  assert.match(css, /\.selectable\[aria-selected\]\.selection-subtle \{/, "sink selector built from real entailment ([aria-selected]) + classes");
  assert.match(css, /background: var\(--selection-bg\);/);
  assert.match(css, /--selection-bg: var\(--harmonic-wash\);/, "selection-subtle writes the variable the sink reads");
});

test("atomic rules shared across elements dedup to a single block", () => {
  const css = buildStylesheet(["gap-md padding-lg", "gap-md vertical"]);
  assert.equal(css.match(/\.gap-md \{/g)?.length, 1, "one block for a shared atomic class");
});

test("platform mechanisms are surfaced as notes, never as CSS", () => {
  const css = toCss("modal");
  assert.match(css, /not CSS/);
  assert.match(css, /dialog\.showModal\(\)/);
  assert.doesNotMatch(css, /\.modal \{/, "a mechanism must never emit a rule block");
});

test("a hover: prefix scopes conditioned skin to a :hover pseudo-class, not an at-rule (R-STATE-10)", () => {
  const css = toCss("hover:ground-subtle");
  assert.match(css, /\.hover\\:ground-subtle:hover \{/, "selector carries the escaped class plus :hover suffix");
  assert.match(css, /background: var\(--ground-subtle\);/);
  assert.doesNotMatch(css, /@media/, "an interaction scope must not become an at-rule");
});

test("base skin and its hover: override compose as two rules on the same element", () => {
  const css = toCss("ground hover:ground-subtle");
  assert.match(css, /\.ground \{[^}]*background: var\(--ground\);/s);
  assert.match(css, /\.hover\\:ground-subtle:hover \{[^}]*background: var\(--ground-subtle\);/s);
});

test("a focus: prefix scopes conditioned skin to a :focus pseudo-class, not an at-rule (R-STATE-10)", () => {
  const css = toCss("focus:rule-accent");
  assert.match(css, /\.focus\\:rule-accent:focus \{/, "selector carries the escaped class plus :focus suffix");
  assert.match(css, /border-color: var\(--accent\);/);
  assert.doesNotMatch(css, /@media/, "an interaction scope must not become an at-rule");
});

test("an active: prefix scopes conditioned skin to an :active pseudo-class, not an at-rule (R-STATE-10)", () => {
  const css = toCss("active:ground-accent");
  assert.match(css, /\.active\\:ground-accent:active \{/, "selector carries the escaped class plus :active suffix");
  assert.match(css, /background: var\(--accent\);/);
  assert.doesNotMatch(css, /@media/, "an interaction scope must not become an at-rule");
});

test("a disabled: prefix scopes conditioned skin to a :disabled pseudo-class (R-STATE-10, ADR-0021)", () => {
  const css = toCss("disabled:ground-subtle disabled:ink-soft");
  assert.match(css, /\.disabled\\:ground-subtle:disabled \{[^}]*background: var\(--ground-subtle\);/s);
  assert.match(css, /\.disabled\\:ink-soft:disabled \{[^}]*color: var\(--ink-soft\);/s);
  assert.doesNotMatch(css, /@media/, "an interaction scope must not become an at-rule");
});

test("base rule and its focus: override compose as two rules on the same element", () => {
  const css = toCss("rule focus:rule-accent");
  assert.match(css, /\.rule \{[^}]*border-color: var\(--rule\);/s);
  assert.match(css, /\.focus\\:rule-accent:focus \{[^}]*border-color: var\(--accent\);/s);
});

test("a backed selected: scope serializes to the [aria-selected] attribute selector (R-STATE-11)", () => {
  const css = toCss("selectable selected:ground-defined selected:ink-accent selected:rule-accent");
  assert.match(css, /\.selected\\:ground-defined\[aria-selected="true"\] \{[^}]*background: var\(--ground-defined\);/s);
  assert.match(css, /\.selected\\:ink-accent\[aria-selected="true"\] \{[^}]*color: var\(--accent\);/s);
  assert.match(css, /\.selected\\:rule-accent\[aria-selected="true"\] \{[^}]*border-color: var\(--accent\);/s);
  assert.doesNotMatch(css, /@media/, "a backed state scope must not become an at-rule");
});

test("elevated reads its socket with the default geometry composed on the shadow colour (R-SKIN-09)", () => {
  const css = toCss("elevated");
  assert.match(css, /\.elevated \{[^}]*box-shadow: var\(--shadow-elevated, 0 4px 12px var\(--shadow\)\);/s);
});

test("elevated composes with base skin as independent atomic rules", () => {
  const css = toCss("ground corner-md elevated");
  assert.match(css, /\.ground \{[^}]*background: var\(--ground\);/s);
  assert.match(css, /\.corner-md \{[^}]*border-radius: var\(--radius-md\);/s);
  assert.match(css, /\.elevated \{[^}]*box-shadow:/s);
});

test("pressable declares the press invitation via cursor only (R-SKIN-17)", () => {
  const css = toCss("pressable");
  assert.match(css, /\.pressable \{[^}]*cursor: pointer;/s);
  assert.doesNotMatch(css, /pointer-events|user-select/, "the affordance never touches behaviour-adjacent properties");
});

test("relational prefixes serialize as selectable-anchored ancestor compounds (R-STATE-13)", () => {
  const css = toCss("concealed parent-hover:revealed parent-selected:revealed");
  assert.match(css, /\.concealed \{[^}]*opacity: 0;/s);
  assert.match(css, /\.selectable:hover \.parent-hover\\:revealed \{[^}]*opacity: 1;/s);
  assert.match(css, /\.selectable\[aria-selected="true"\] \.parent-selected\\:revealed \{[^}]*opacity: 1;/s);
  assert.doesNotMatch(css, /@media/, "a relational scope must not become an at-rule");
});

test("relational prefixes scope carriers too, not just concealment", () => {
  const css = toCss("parent-hover:ground-defined");
  assert.match(css, /\.selectable:hover \.parent-hover\\:ground-defined \{[^}]*background: var\(--ground-defined\);/s);
});

test("scrollbar-subtle emits standard properties with socketed colours (R-SKIN-15)", () => {
  const css = toCss("scrollbar-subtle");
  assert.match(css, /\.scrollbar-subtle \{[^}]*scrollbar-width: thin;[^}]*scrollbar-color: var\(--scrollbar-thumb, var\(--rule\)\) var\(--scrollbar-track, transparent\);/s);
  assert.doesNotMatch(css, /-webkit-scrollbar/, "the treatment never emits engine-drawn pseudo styling");
});

test("text alignment facet emits logical values (R-SKIN-14)", () => {
  assert.match(toCss("text-center"), /\.text-center \{[^}]*text-align: center;/s);
  assert.match(toCss("text-start"), /\.text-start \{[^}]*text-align: start;/s);
});

test("focus:ring restyles the platform outline under the focus condition (R-SKIN-13)", () => {
  const css = toCss("focus:ring");
  assert.match(css, /\.focus\\:ring:focus \{[^}]*outline: var\(--ring, 2px solid var\(--ground-defined\)\);[^}]*outline-offset: var\(--ring-offset, 0px\);/s);
  assert.doesNotMatch(css, /box-shadow/, "the ring is the outline, not a shadow redraw");
  assert.doesNotMatch(css, /outline: none/, "there is nothing to suppress");
});

test("the min dials' none endpoint escapes the min-content floor (R-CONSTRAINT-01)", () => {
  const css = toCss("min-height-none min-width-none max-width-none");
  assert.match(css, /\.min-height-none \{[^}]*min-height: 0;/s);
  assert.match(css, /\.min-width-none \{[^}]*min-width: 0;/s);
  assert.match(css, /\.max-width-none \{[^}]*max-width: none;/s);
});

test("hidden emits both overflow axes; clip stays distinct (R-OVERFLOW-01)", () => {
  const css = toCss("hidden");
  assert.match(css, /\.hidden \{[^}]*overflow-x: hidden;[^}]*overflow-y: hidden;/s);
  assert.match(toCss("clip"), /overflow-x: clip/);
});

test("truncate owns only the text properties and composes with hidden (R-SKIN-12)", () => {
  const css = toCss("hidden truncate");
  assert.match(css, /\.truncate \{[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/s);
  assert.match(css, /\.hidden \{[^}]*overflow-x: hidden;/s);
  assert.doesNotMatch(css, /\.truncate \{[^}]*overflow-[xy]/s, "truncate must not touch the overflow axis's properties");
});

test("ruled emits all-side width and style at the line-weight socket; rule keeps colour (R-SKIN-11)", () => {
  const css = toCss("rule ruled");
  assert.match(css, /\.ruled \{[^}]*border-width: var\(--rule-weight, 1px\);[^}]*border-style: solid;/s);
  assert.match(css, /\.rule \{[^}]*border-color: var\(--rule\);/s);
  assert.doesNotMatch(css, /\.ruled \{[^}]*border-color/s, "presence must not touch the carrier's colour");
});

test("a per-side ruled word emits only that side's width and style (R-SKIN-11)", () => {
  const css = toCss("ruled-bottom");
  assert.match(css, /\.ruled-bottom \{[^}]*border-bottom-width: var\(--rule-weight, 1px\);[^}]*border-bottom-style: solid;/s);
  assert.doesNotMatch(css, /border-top|border-left|border-right/, "other sides stay untouched");
});

test("font-mono reads its typeface socket with the platform generic as default (R-SKIN-07)", () => {
  const css = toCss("font-mono");
  assert.match(css, /\.font-mono \{[^}]*font-family: var\(--font-mono, monospace\);/s);
});

test("font facets compose without touching each other's properties", () => {
  const css = toCss("font-mono font-sm font-medium");
  assert.match(css, /\.font-mono \{[^}]*font-family:/s);
  assert.match(css, /\.font-sm \{[^}]*font-size:/s);
  assert.match(css, /\.font-medium \{[^}]*font-weight:/s);
});

test("the z-scale raised stacking tier is untouched by the elevation treatment", () => {
  const css = toCss("raised");
  assert.match(css, /\.raised \{[^}]*z-index: var\(--z-raised\);/s);
  assert.doesNotMatch(css, /box-shadow/);
});

test("an attribute-backed current: scope serializes to [aria-current] with the false guard (R-STATE-12)", () => {
  const css = toCss("current:ink-accent current:ground-subtle");
  assert.match(css, /\.current\\:ink-accent\[aria-current\]:not\(\[aria-current="false"\]\) \{[^}]*color: var\(--accent\);/s);
  assert.match(css, /\.current\\:ground-subtle\[aria-current\]:not\(\[aria-current="false"\]\) \{[^}]*background: var\(--ground-subtle\);/s);
  assert.doesNotMatch(css, /@media/, "an attribute-backed scope must not become an at-rule");
});
