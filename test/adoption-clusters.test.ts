import { test } from "node:test";
import assert from "node:assert/strict";

import {
  collectClassOccurrences,
  mineClassClusters,
  renderClusterReport,
  type ClusterSource,
} from "../adoption/clusters.ts";

const sources: ClusterSource[] = [
  {
    file: "src/App.tsx",
    content: `
      <button className="pressable padding-inline-sm ground-subtle">A</button>
      <button className='ground-subtle pressable padding-inline-sm'>B</button>
      <button className={\`padding-inline-sm ground-subtle pressable\`}>C</button>
      <button className={\`padding-inline-\${size} ground-subtle\`}>dynamic</button>
    `,
  },
  {
    file: "src/Panel.html",
    content: `
      <button class="pressable padding-inline-sm ground-subtle font-sm">D</button>
      <button class="padding-inline-sm font-sm pressable ground-subtle">D2</button>
      <div class="project-card padding-sm">E</div>
    `,
  },
];

const promotionSources: ClusterSource[] = [
  {
    file: "src/Delete.tsx",
    content: `
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Esc</kbd>
      <kbd className="font-mono font-xs ruled corner-sm rule ink ground-subtle">Enter</kbd>
      <button className="padding-block-sm padding-inline-lg tween-quick ground ink rule corner-md ruled font-md font-medium pressable hover:ground-defined focus:ring active:ground-accent active:ink-inverse disabled:ground-subtle disabled:ink-soft disabled:blocked disabled:alpha-60">Save</button>
    `,
  },
  {
    file: "src/Suggest.tsx",
    content: `
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Tab</kbd>
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Space</kbd>
      <button className="padding-block-sm padding-inline-lg tween-quick ground ink rule corner-md ruled font-md font-medium pressable hover:ground-defined focus:ring active:ground-accent active:ink-inverse disabled:ground-subtle disabled:ink-soft disabled:blocked disabled:alpha-60">Create</button>
    `,
  },
];

test("collectClassOccurrences extracts literal class attributes and canonicalizes Ermine tokens", () => {
  const occurrences = collectClassOccurrences(sources);

  assert.equal(occurrences.length, 6);
  assert.equal(occurrences[0].ermineClassString, "padding-inline-sm ground-subtle pressable");
  assert.equal(occurrences[1].ermineClassString, "padding-inline-sm ground-subtle pressable");
  assert.deepEqual(occurrences[5].tokens, ["project-card", "padding-sm"]);
  assert.deepEqual(occurrences[5].ermineTokens, ["padding-sm"]);
});

test("mineClassClusters reports repeated paragraphs, n-grams, axis constellations, and near matches", () => {
  const report = mineClassClusters(sources, { limit: 10 });

  assert.equal(report.sourceCount, 2);
  assert.equal(report.occurrenceCount, 6);
  assert.ok(report.repeatedParagraphs.some((pattern) =>
    pattern.count === 3 &&
    pattern.value === "padding-inline-sm ground-subtle pressable"
  ));
  assert.ok(report.ngrams.some((pattern) =>
    pattern.count === 5 &&
    pattern.value === "padding-inline-sm ground-subtle"
  ));
  assert.ok(report.axisConstellations.some((pattern) =>
    pattern.count === 3 &&
    pattern.value === "padding > skin-ground > affordance"
  ));
  assert.ok(report.nearIdentical.some((item) =>
    item.shared.includes("pressable") &&
    item.rightOnly.includes("font-sm")
  ));
  assert.equal(report.combineCandidates[0].value, "padding-inline-sm ground-subtle pressable");
  assert.equal(report.greedySelections[0].value, "padding-inline-sm ground-subtle pressable");
  assert.equal(report.greedySelections[0].count, 5);
  assert.equal(report.greedySelections[0].gain, 7);
  assert.deepEqual(report.greedySelections[0].axes, ["padding", "skin-ground", "affordance"]);
  assert.equal(report.semanticUnitReview[0].seed.value, "padding-inline-sm ground-subtle pressable");
  assert.match(report.semanticUnitReview[0].rule, /grow only while/);
  assert.deepEqual(report.semanticUnitReview[0].growthOptions[0].addedWords, ["font-sm"]);
  assert.equal(report.semanticUnitReview[0].growthOptions[0].value, "padding-inline-sm ground-subtle font-sm pressable");
});

test("semantic promotion review promotes compact closed units and holds component-shaped paragraphs", () => {
  const report = mineClassClusters(promotionSources, { limit: 10 });

  const promoted = report.semanticPromotions.find((candidate) =>
    candidate.value === "ground-subtle ink rule corner-sm ruled font-xs font-mono"
  );
  assert.equal(promoted?.disposition, "promote");
  assert.ok((promoted?.score ?? 0) >= 25);
  assert.equal(promoted?.metrics.fileCount, 2);
  assert.match(promoted?.reasons.join(" ") ?? "", /mechanically closed enough to name/);

  const component = report.semanticPromotions.find((candidate) =>
    candidate.value.includes("active:ground-accent") &&
    candidate.value.includes("disabled:blocked")
  );
  assert.equal(component?.disposition, "hold-component-shaped");
  assert.ok((component?.metrics.scopedWordCount ?? 0) >= 4);
});

test("renderClusterReport produces a markdown report for adoption review", () => {
  const report = mineClassClusters(sources, { limit: 3 });
  const markdown = renderClusterReport(report, "fixture");

  assert.match(markdown, /^# Ermine Class Cluster Report: fixture/);
  assert.match(markdown, /## Greedy Mechanical Selections/);
  assert.match(markdown, /round 1: gain 7, 5x, 3 words/);
  assert.match(markdown, /## Semantic Unit Growth Review/);
  assert.match(markdown, /grow only while the enlarged group can still be named/);
  assert.match(markdown, /## Semantic Promotion Review/);
  assert.match(markdown, /## Combine Candidates/);
  assert.match(markdown, /3x `padding-inline-sm ground-subtle pressable`/);
  assert.match(markdown, /## Near-Identical Paragraphs/);
});
