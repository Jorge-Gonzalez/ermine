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

const contextSources: ClusterSource[] = [
  {
    file: "src/Meta.tsx",
    content: `
      <div className="horizontal inline gap-sm align-center margin-right-xl">a</div>
      <div className="horizontal inline gap-sm align-center margin-right-xl">b</div>
    `,
  },
  {
    file: "widgets/Row.tsx",
    content: `
      <div className="horizontal inline gap-sm align-center">c</div>
      <ul className="grid-fit-sm elastic scroll-auto max-height-results-md">r1</ul>
      <ul className="grid-fit-sm elastic scroll-auto max-height-results-md">r2</ul>
    `,
  },
  {
    file: "src/Only.tsx",
    content: `
      <section className="vertical gap-md padding-lg ground-subtle">x</section>
      <section className="vertical gap-md padding-lg ground-subtle">y</section>
      <ul className="grid-fit-sm elastic scroll-auto max-height-results-md">r3</ul>
    `,
  },
];

const contextCaptureSources: ClusterSource[] = [
  {
    file: "src/Nested.tsx",
    content: `
      <div className="vertical gap-md padding-lg ground-subtle">
        <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Esc</kbd>
        <button onClick={() => remove()} className="pressable padding-inline-sm">×</button>
      </div>
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

test("occurrences carry usage context: tag, content sample, nearest classed parent", () => {
  const occurrences = collectClassOccurrences(contextCaptureSources);

  const kbd = occurrences.find((occurrence) => occurrence.context.tag === "kbd");
  assert.equal(kbd?.context.content, "Esc");
  assert.equal(kbd?.context.parentClasses, "vertical gap-md padding-lg ground-subtle");

  const button = occurrences.find((occurrence) => occurrence.context.tag === "button");
  assert.equal(button?.context.content, "×");
  assert.equal(button?.context.parentClasses, "vertical gap-md padding-lg ground-subtle");
});

test("promotion candidates carry usage aligned with their examples", () => {
  const report = mineClassClusters(promotionSources, { limit: 10 });
  const chip = report.promotions.find((candidate) =>
    candidate.value === "ground-subtle ink rule corner-sm ruled font-xs font-mono"
  );

  assert.equal(chip?.usage.length, chip?.examples.length);
  assert.equal(chip?.usage[0].tag, "kbd");
  assert.equal(chip?.usage[0].content, "Esc");
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
});

test("promotion review separates candidates from stems and identity-shaped paragraphs", () => {
  const report = mineClassClusters(promotionSources, { limit: 10 });

  const chip = report.promotions.find((candidate) =>
    candidate.value === "ground-subtle ink rule corner-sm ruled font-xs font-mono"
  );
  assert.equal(chip?.disposition, "candidate");
  assert.equal(chip?.evidence.fileCount, 2);
  assert.equal(chip?.evidence.cohesion, 1);
  assert.ok((chip?.evidence.closedPairShare ?? 0) >= 0.8);
  assert.deepEqual(chip?.evidence.contextResidue, []);

  const component = report.promotions.find((candidate) =>
    candidate.value.includes("active:ground-accent") &&
    candidate.value.includes("disabled:blocked")
  );
  assert.equal(component?.disposition, "identity-shaped");
  assert.ok((component?.evidence.scopedWords.length ?? 0) >= 4);

  const stem = mineClassClusters(sources, { limit: 10 }).promotions.find((candidate) =>
    candidate.value === "padding-inline-sm ground-subtle pressable"
  );
  assert.equal(stem?.disposition, "stem");
});

test("candidates rank by context spread before raw repetition", () => {
  const report = mineClassClusters(contextSources, { limit: 10 });
  const candidates = report.promotions.filter((candidate) => candidate.disposition === "candidate");

  assert.ok(candidates.length >= 2);
  assert.equal(candidates[0].value, "grid-fit-sm elastic scroll-auto max-height-results-md");
  assert.equal(candidates[0].evidence.fileCount, 2);
});

test("cohesion stays null below the evidence floor instead of rewarding thin data", () => {
  const report = mineClassClusters(contextSources, { limit: 10 });
  const meta = report.promotions.find((candidate) =>
    candidate.value === "horizontal inline gap-sm align-center"
  );

  assert.equal(meta?.count, 3);
  assert.equal(meta?.evidence.cohesion, null);
  assert.equal(meta?.evidence.closedPairShare, null);
});

test("scale-backed margin words are stripped into context residue, not identity", () => {
  const report = mineClassClusters(contextSources, { limit: 10 });
  const meta = report.promotions.find((candidate) =>
    candidate.value === "horizontal inline gap-sm align-center"
  );

  assert.equal(meta?.disposition, "candidate");
  assert.equal(meta?.evidence.fileCount, 2);
  assert.deepEqual(meta?.evidence.contextResidue, [{ value: "margin-right-xl", count: 2, examples: [] }]);
});

test("role-bound grammar words surface as evidence for the naming review", () => {
  const report = mineClassClusters(contextSources, { limit: 10 });
  const results = report.promotions.find((candidate) =>
    candidate.value === "grid-fit-sm elastic scroll-auto max-height-results-md"
  );

  assert.equal(results?.disposition, "candidate");
  assert.deepEqual(results?.evidence.roleBoundWords, ["max-height-results-md"]);
});

test("single-file repetition is held as local evidence, not promoted", () => {
  const report = mineClassClusters(contextSources, { limit: 10 });
  const local = report.promotions.find((candidate) =>
    candidate.value === "vertical gap-md padding-lg ground-subtle"
  );

  assert.equal(local?.disposition, "local-evidence");
  assert.equal(local?.evidence.fileCount, 1);
});

test("overlapping paragraphs are grouped into families around a shared core", () => {
  const report = mineClassClusters(sources, { limit: 10 });
  const family = report.families.find((item) =>
    item.core === "padding-inline-sm ground-subtle pressable"
  );

  assert.ok(family);
  assert.equal(family?.kind, "idiom");
  assert.equal(family?.fileCount, 2);
  assert.equal(family?.totalCount, 5);
  assert.equal(family?.members.length, 2);
  const variant = family?.members.find((member) => member.variantWords.length);
  assert.deepEqual(variant?.variantWords, ["font-sm"]);
});

test("families retain count-one variants as evidence around a reusable core", () => {
  const report = mineClassClusters([
    {
      file: "src/A.tsx",
      content: `<button className="padding-inline-sm ground-subtle pressable">A</button>`,
    },
    {
      file: "src/B.tsx",
      content: `<button className="padding-inline-sm ground-subtle pressable">B</button>`,
    },
    {
      file: "widgets/C.tsx",
      content: `<button className="padding-inline-sm ground-subtle pressable font-sm">C</button>`,
    },
  ], { limit: 10 });
  const family = report.families.find((item) =>
    item.core === "padding-inline-sm ground-subtle pressable"
  );

  assert.ok(family);
  assert.ok(family?.members.some((member) =>
    member.count === 1 && member.variantWords.includes("font-sm")
  ));
});

test("renderClusterReport produces a markdown report for adoption review", () => {
  const report = mineClassClusters(sources, { limit: 3 });
  const markdown = renderClusterReport(report, "fixture");

  assert.match(markdown, /^# Ermine Class Cluster Report: fixture/);
  assert.match(markdown, /## Promotion Review/);
  assert.match(markdown, /Surplus meaning/);
  assert.match(markdown, /## Combine Families/);
  assert.match(markdown, /## Repeated Paragraphs/);
  assert.match(markdown, /3x `padding-inline-sm ground-subtle pressable`/);
  assert.match(markdown, /## Near-Identical Paragraphs/);
});
