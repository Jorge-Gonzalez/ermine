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
      <div class="project-card padding-sm">E</div>
    `,
  },
];

test("collectClassOccurrences extracts literal class attributes and canonicalizes Ermine tokens", () => {
  const occurrences = collectClassOccurrences(sources);

  assert.equal(occurrences.length, 5);
  assert.equal(occurrences[0].ermineClassString, "padding-inline-sm ground-subtle pressable");
  assert.equal(occurrences[1].ermineClassString, "padding-inline-sm ground-subtle pressable");
  assert.deepEqual(occurrences[4].tokens, ["project-card", "padding-sm"]);
  assert.deepEqual(occurrences[4].ermineTokens, ["padding-sm"]);
});

test("mineClassClusters reports repeated paragraphs, n-grams, axis constellations, and near matches", () => {
  const report = mineClassClusters(sources, { limit: 10 });

  assert.equal(report.sourceCount, 2);
  assert.equal(report.occurrenceCount, 5);
  assert.ok(report.repeatedParagraphs.some((pattern) =>
    pattern.count === 3 &&
    pattern.value === "padding-inline-sm ground-subtle pressable"
  ));
  assert.ok(report.ngrams.some((pattern) =>
    pattern.count === 4 &&
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
  assert.equal(report.greedySelections[0].count, 4);
  assert.equal(report.greedySelections[0].gain, 5);
  assert.deepEqual(report.greedySelections[0].axes, ["padding", "skin-ground", "affordance"]);
});

test("renderClusterReport produces a markdown report for adoption review", () => {
  const report = mineClassClusters(sources, { limit: 3 });
  const markdown = renderClusterReport(report, "fixture");

  assert.match(markdown, /^# Ermine Class Cluster Report: fixture/);
  assert.match(markdown, /## Greedy Mechanical Selections/);
  assert.match(markdown, /round 1: gain 5, 4x, 3 words/);
  assert.match(markdown, /## Combine Candidates/);
  assert.match(markdown, /3x `padding-inline-sm ground-subtle pressable`/);
  assert.match(markdown, /## Near-Identical Paragraphs/);
});
