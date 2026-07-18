import { test } from "node:test";
import assert from "node:assert/strict";

import { parseAndNormalizeCombines } from "../src/combines.ts";
import { explainParagraph } from "../src/paragraph-explainer.ts";

test("explainParagraph returns normalized words, axes, lint, emissions, and graph nodes", () => {
  const explanation = explainParagraph("pressable padding-inline-sm ground-subtle");

  assert.equal(explanation.normalizedVisible, "padding-inline-sm ground-subtle pressable");
  assert.equal(explanation.normalizedExpanded, "padding-inline-sm ground-subtle pressable");
  assert.deepEqual(explanation.lint, []);
  assert.deepEqual(
    explanation.words.map((word) => [word.token, word.axis, word.sibling]),
    [
      ["padding-inline-sm", "padding", "layout"],
      ["ground-subtle", "skin-ground", "skin"],
      ["pressable", "affordance", "skin"],
    ],
  );
  assert.ok(explanation.words.every((word) => word.reference?.startsWith("src/ERMINE-SPEC.md")));
  assert.ok(explanation.emitted.some((rule) =>
    rule.kind === "declares" &&
    rule.token === "pressable" &&
    rule.declarations?.cursor === "pointer"
  ));
  assert.ok(explanation.graph.nodes.some((node) => node.id === "axis:padding"));
  assert.ok(explanation.graph.nodes.some((node) => node.kind === "declaration" && node.label === "background"));
});

test("explainParagraph keeps combines visible and explains hidden expanded words", () => {
  const combines = parseAndNormalizeCombines(`
    combine option-chip: [
      selectable padding-inline-sm ground-subtle
    ]
  `);
  const explanation = explainParagraph("option-chip selected:ink-accent", { combines });

  assert.equal(explanation.normalizedVisible, "option-chip selected:ink-accent");
  assert.equal(explanation.normalizedExpanded, "padding-inline-sm selectable ground-subtle selected:ink-accent");
  assert.equal(explanation.visibleTokens[0].kind, "combine");
  assert.ok(explanation.words.some((word) =>
    word.token === "ground-subtle" &&
    word.origin.kind === "combine" &&
    word.origin.combine === "option-chip"
  ));
  assert.ok(explanation.words.some((word) =>
    word.token === "selected:ink-accent" &&
    word.scope === "selected" &&
    word.origin.kind === "direct"
  ));
  assert.ok(explanation.graph.edges.some((edge) =>
    edge.from === "combine:option-chip" &&
    edge.label === "expands" &&
    edge.to.includes("ground-subtle")
  ));
});

test("explainParagraph emits scoped direct words under their scope", () => {
  const combines = parseAndNormalizeCombines(`
    combine choice-core: [
      selectable ground-subtle
    ]
  `);
  const explanation = explainParagraph("choice-core selected:ink-accent", { combines });
  const selectedInk = explanation.emitted.find((rule) => rule.token === "ink-accent" && rule.scope === "selected");

  assert.equal(selectedInk?.kind, "declares");
  assert.equal(selectedInk?.declarations?.color, "var(--accent)");
  assert.deepEqual(selectedInk?.sourceWords, [{
    token: "selected:ink-accent",
    origin: { kind: "direct", sourceToken: "selected:ink-accent" },
  }]);
});

test("explainParagraph annotates lint collisions with hidden combine sources", () => {
  const combines = parseAndNormalizeCombines(`
    combine compact-x: [
      padding-inline-sm
    ]
  `);
  const explanation = explainParagraph("compact-x padding-left-xs", { combines });

  assert.equal(explanation.lint.length, 1);
  assert.equal(explanation.lint[0].rule, "one-word-per-axis");
  assert.match(explanation.lint[0].msg, /padding-inline-sm from combine 'compact-x'/);
});

test("explainParagraph keeps unknown project classes visible but outside Ermine axes", () => {
  const explanation = explainParagraph("project-card padding-sm");

  assert.equal(explanation.visibleTokens[0].token, "project-card");
  assert.equal(explanation.visibleTokens[0].axis, null);
  assert.equal(explanation.words[0].token, "project-card");
  assert.equal(explanation.words[0].axis, null);
  assert.ok(explanation.lint.some((issue) => issue.rule === "unknown-word" && issue.msg.includes("'project-card'")));
});
