// css.test.ts — the serializer, including the display facet-merge finding
// (the first concrete paper-meets-browser consequence: atomic classes cannot
// express the two-value display merge; a compound selector must).

import { test } from "node:test";
import assert from "node:assert/strict";
import { toCss, buildStylesheet } from "../src/css.ts";

test("a plain scale word serializes to an atomic rule reading a theme var", () => {
  const css = toCss("gap-comfortable");
  assert.match(css, /\.gap-comfortable \{/);
  assert.match(css, /gap: var\(--spacing-comfortable\);/);
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
  const css = buildStylesheet(["gap-comfortable padding-relaxed", "gap-comfortable vertical"]);
  assert.equal(css.match(/\.gap-comfortable \{/g)?.length, 1, "one block for a shared atomic class");
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
