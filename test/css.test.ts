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

test("a backed selected: scope serializes to the [aria-selected] attribute selector (R-STATE-11)", () => {
  const css = toCss("selectable selected:ground-defined selected:ink-accent selected:rule-accent");
  assert.match(css, /\.selected\\:ground-defined\[aria-selected="true"\] \{[^}]*background: var\(--ground-defined\);/s);
  assert.match(css, /\.selected\\:ink-accent\[aria-selected="true"\] \{[^}]*color: var\(--accent\);/s);
  assert.match(css, /\.selected\\:rule-accent\[aria-selected="true"\] \{[^}]*border-color: var\(--accent\);/s);
  assert.doesNotMatch(css, /@media/, "a backed state scope must not become an at-rule");
});
