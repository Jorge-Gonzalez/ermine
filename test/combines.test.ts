import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildCombineStylesheet,
  expandCombineParagraph,
  formatCombineSource,
  normalizeCombines,
  orderParagraphWithCombines,
  parseAndNormalizeCombines,
  parseCombineSource,
} from "../src/combines.ts";

test("combine parser accepts short form and formatter owns class ordering", () => {
  const doc = parseAndNormalizeCombines(`
    combine option-chip: [
      pressable selectable padding-inline-sm ground-subtle
    ]
  `);

  assert.equal(doc.version, 1);
  assert.deepEqual(doc.combines, [{
    name: "option-chip",
    scope: "project",
    evidence: [],
    sourceClasses: ["pressable", "selectable", "padding-inline-sm", "ground-subtle"],
    sourceClassString: "pressable selectable padding-inline-sm ground-subtle",
    classes: ["padding-inline-sm", "selectable", "ground-subtle", "pressable"],
    classString: "padding-inline-sm selectable ground-subtle pressable",
    lint: [],
  }]);
});

test("combine parser accepts long form metadata", () => {
  const doc = parseAndNormalizeCombines(`
    combine icon-action {
      intent: compact icon action
      scope: shared
      evidence: [
        monky search edit
        monky command action
      ]

      classes: [
        horizontal align-center justify-center padding-xs ink-soft corner-sm pressable
      ]
    }
  `);

  assert.equal(doc.combines[0].name, "icon-action");
  assert.equal(doc.combines[0].intent, "compact icon action");
  assert.equal(doc.combines[0].scope, "shared");
  assert.deepEqual(doc.combines[0].evidence, ["monky search edit", "monky command action"]);
  assert.equal(doc.combines[0].classString, "horizontal padding-xs align-center justify-center ink-soft corner-sm pressable");
});

test("combine validation rejects duplicate names", () => {
  assert.throws(
    () => parseAndNormalizeCombines(`
      combine option-chip: [ selectable ]
      combine option-chip: [ pressable ]
    `),
    /duplicate combine name/,
  );
});

test("combine validation rejects unknown Ermine classes", () => {
  assert.throws(
    () => parseAndNormalizeCombines("combine option-chip: [ selectable not-ermine ]"),
    /unknown-word.*not-ermine/s,
  );
});

test("combine validation rejects semantic fragments inside classes", () => {
  assert.throws(
    () => parseAndNormalizeCombines("combine keycapish: [ sf-keycap selectable ]"),
    /semantic fragment 'sf-keycap'/,
  );
});

test("combine validation rejects combine references inside classes", () => {
  assert.throws(
    () => parseAndNormalizeCombines(`
      combine base-chip: [ selectable ]
      combine option-chip: [ base-chip pressable ]
    `),
    /classes must not reference combine 'base-chip'/,
  );
});

test("combine validation rejects lint collisions inside a body", () => {
  assert.throws(
    () => parseAndNormalizeCombines("combine confused: [ padding-inline-sm padding-left-xs ]"),
    /one-word-per-axis.*overlaps/s,
  );
});

test("combine validation rejects names that collide with Ermine classes", () => {
  assert.throws(
    () => parseAndNormalizeCombines("combine horizontal: [ selectable ]"),
    /name collides with an Ermine class/,
  );
});

test("syntax parser reports unknown long-form fields", () => {
  assert.throws(
    () => parseCombineSource("combine option-chip { note: no classes: [ selectable ] }"),
    /unknown combine field 'note'/,
  );
});

test("normalizeCombines can consume pre-parsed definitions", () => {
  const doc = normalizeCombines([{
    name: "status-pill",
    intent: "compact status marker",
    scope: "package",
    evidence: ["fixture"],
    classes: ["font-sm", "corner-md", "ink"],
  }]);

  assert.equal(doc.combines[0].classString, "ink corner-md font-sm");
  assert.deepEqual(doc.combines[0].sourceClasses, ["font-sm", "corner-md", "ink"]);
});

test("expandCombineParagraph keeps visible combines collapsed and canonicalizes expanded classes", () => {
  const doc = parseAndNormalizeCombines(`
    combine option-chip: [
      pressable selectable padding-inline-sm ground-subtle
    ]
  `);
  const expansion = expandCombineParagraph("selected:ink-accent option-chip width-popover-md", doc);

  assert.equal(expansion.normalizedVisible, "option-chip width-popover-md selected:ink-accent");
  assert.equal(
    expansion.normalizedExpanded,
    "padding-inline-sm width-popover-md selectable ground-subtle pressable selected:ink-accent",
  );
  assert.deepEqual(expansion.lint, []);
  assert.deepEqual(expansion.visibleTokens.map((token) => token.kind), ["class", "combine", "class"]);
});

test("orderParagraphWithCombines formats visible markup without expanding combines", () => {
  const doc = parseAndNormalizeCombines(`
    combine option-chip: [
      selectable padding-inline-sm ground-subtle pressable
    ]
  `);

  assert.equal(
    orderParagraphWithCombines("selected:ink-accent foo-local option-chip width-popover-md", doc),
    "option-chip foo-local width-popover-md selected:ink-accent",
  );
});

test("expandCombineParagraph reports collisions against hidden combine classes", () => {
  const doc = parseAndNormalizeCombines(`
    combine option-chip: [
      selectable padding-inline-sm
    ]
  `);
  const expansion = expandCombineParagraph("option-chip padding-left-xs", doc);

  assert.equal(expansion.lint.length, 1);
  assert.equal(expansion.lint[0].rule, "one-word-per-axis");
  assert.match(expansion.lint[0].msg, /padding-inline-sm from combine 'option-chip'/);
});

test("expandCombineParagraph reports hidden sources when combines collide with each other", () => {
  const doc = parseAndNormalizeCombines(`
    combine compact-x: [ padding-inline-sm ]
    combine roomy-left: [ padding-left-xs ]
  `);
  const expansion = expandCombineParagraph("compact-x roomy-left", doc);

  assert.equal(expansion.lint.length, 1);
  assert.match(expansion.lint[0].msg, /padding-inline-sm from combine 'compact-x'/);
  assert.match(expansion.lint[0].msg, /padding-left-xs from combine 'roomy-left'/);
});

test("formatCombineSource rewrites short-form bodies into canonical order", () => {
  assert.equal(
    formatCombineSource(`
      combine option-chip: [
        pressable ground-subtle padding-inline-sm selectable
      ]
    `),
    `combine option-chip: [
  padding-inline-sm selectable ground-subtle pressable
]\n`,
  );
});

test("formatCombineSource preserves long-form metadata and formats classes", () => {
  assert.equal(
    formatCombineSource(`
      combine icon-action {
        evidence: [
          command row
          search action
        ]
        scope: shared
        intent: compact icon action

        classes: [
          pressable justify-center horizontal padding-xs align-center ink-soft
        ]
      }
    `),
    `combine icon-action {
  intent: compact icon action
  scope: shared

  evidence: [
    command row
    search action
  ]

  classes: [
    horizontal padding-xs align-center justify-center ink-soft pressable
  ]
}\n`,
  );
});

test("buildCombineStylesheet emits declarations under the combine selector", () => {
  const doc = parseAndNormalizeCombines(`
    combine option-chip: [
      selectable ground-subtle padding-inline-sm pressable
    ]
  `);
  const css = buildCombineStylesheet(doc);

  assert.match(css, /\.option-chip \{[^}]*padding-inline: var\(--spacing-sm\);/s);
  assert.match(css, /\.option-chip \{[^}]*background: var\(--ground-subtle\);/s);
  assert.match(css, /\.option-chip \{[^}]*cursor: pointer;/s);
  assert.doesNotMatch(css, /\.padding-inline-sm \{/);
  assert.doesNotMatch(css, /\.ground-subtle \{/);
});

test("buildCombineStylesheet preserves compound facet emission under one combine selector", () => {
  const doc = parseAndNormalizeCombines(`
    combine inline-row: [
      horizontal inline
    ]
  `);
  const css = buildCombineStylesheet(doc);

  assert.match(css, /\.inline-row \{[^}]*display: inline flex;/s);
  assert.match(css, /\.inline-row \{[^}]*flex-direction: row;/s);
  assert.doesNotMatch(css, /\.horizontal\.inline/);
});

test("buildCombineStylesheet maps interaction and backed state selectors to the combine selector", () => {
  const doc = parseAndNormalizeCombines(`
    combine selectable-chip: [
      selectable hover:ground-defined selected:ink-accent
    ]
  `);
  const css = buildCombineStylesheet(doc);

  assert.match(css, /\.selectable-chip:hover \{[^}]*background: var\(--ground-defined\);/s);
  assert.match(css, /\.selectable-chip\[aria-selected="true"\] \{[^}]*color: var\(--accent\);/s);
  assert.doesNotMatch(css, /\.hover\\:ground-defined/);
  assert.doesNotMatch(css, /\.selected\\:ink-accent/);
});

test("buildCombineStylesheet can emit a requested subset and rejects unknown names", () => {
  const doc = parseAndNormalizeCombines(`
    combine option-chip: [ selectable ]
    combine icon-action: [ pressable ]
  `);

  assert.match(buildCombineStylesheet(doc, { names: ["icon-action"] }), /\.icon-action \{/);
  assert.doesNotMatch(buildCombineStylesheet(doc, { names: ["icon-action"] }), /\.option-chip \{/);
  assert.throws(() => buildCombineStylesheet(doc, { names: ["missing"] }), /unknown combine name: missing/);
});
