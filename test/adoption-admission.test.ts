import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildAdmissionReview,
  parseAdmissionDocument,
  renderAdmissionReview,
  scoreBackTranslation,
  type AdmissionDocument,
} from "../adoption/admission-intake.ts";
import { mineClassClusters, type ClusterSource } from "../adoption/clusters.ts";

const CHIP = "ground-subtle ink rule corner-sm ruled font-xs font-mono";
const STEM = "padding-inline-sm ground-subtle pressable";

const sources: ClusterSource[] = [
  {
    file: "src/Delete.tsx",
    content: `
      <kbd className="${CHIP}">Esc</kbd>
      <kbd className="${CHIP}">Enter</kbd>
      <button className="${STEM}">A</button>
      <button className="${STEM}">B</button>
    `,
  },
  {
    file: "widgets/Suggest.tsx",
    content: `
      <kbd className="${CHIP}">Tab</kbd>
      <kbd className="${CHIP}">Space</kbd>
      <button className="${STEM}">C</button>
      <button className="${STEM} font-sm">D</button>
    `,
  },
];

const report = mineClassClusters(sources, { limit: 10 });
const candidates = report.promotions;
const families = report.families;

function doc(overrides: Partial<AdmissionDocument> = {}): AdmissionDocument {
  return {
    version: 1,
    verdicts: [{
      paragraph: CHIP,
      verdict: "admit",
      name: "keycap",
      intent: "A key legend chip rendered as typed input.",
      justification: "8 keycap usages across 2 directories; role visible in <kbd> usage.",
    }],
    expansions: [{ name: "keycap", words: ["ground-subtle", "ink", "rule", "ruled", "corner-sm", "font-mono", "padding-xs"] }],
    ...overrides,
  };
}

test("a valid admission passes validation and scores its back-translation", () => {
  const review = buildAdmissionReview(doc(), candidates, "fixture");

  assert.deepEqual(review.errors, []);
  const admitted = review.verdicts[0];
  assert.equal(admitted.candidate?.disposition, "candidate");
  assert.equal(admitted.backTranslation?.score, 0.86);
  assert.deepEqual(admitted.backTranslation?.missed, ["font-xs"]);
  assert.deepEqual(admitted.backTranslation?.extra, ["padding-xs"]);
});

test("verdicts on unknown paragraphs and mechanics-held paragraphs are flagged", () => {
  const review = buildAdmissionReview(doc({
    verdicts: [
      { paragraph: "vertical nonsense-word", verdict: "hold-as-stem", justification: "x" },
      { paragraph: STEM, verdict: "hold-as-stem", justification: "compositional" },
    ],
    expansions: [],
  }), candidates, "fixture");

  assert.ok(review.errors.some((error) => error.includes("not among the mined paragraphs")));
  assert.ok(review.warnings.some((warning) => warning.includes("mechanics hold this as stem")));
  assert.ok(review.warnings.some((warning) => warning.includes(`paragraph \`${CHIP}\` received no verdict`)));
});

test("family cores are valid admission targets", () => {
  const review = buildAdmissionReview(doc({
    verdicts: [{
      paragraph: STEM,
      verdict: "admit",
      name: "option-chip",
      intent: "A compact selectable option surface.",
      justification: "The core has exact and typed-size variants across files.",
    }],
    expansions: [{ name: "option-chip", words: ["padding-inline-sm", "ground-subtle", "pressable"] }],
  }), candidates, "fixture", {}, families);

  assert.deepEqual(review.errors, []);
  assert.equal(review.verdicts[0].target?.kind, "family-core");
  assert.equal(review.verdicts[0].target?.fileCount, 2);
});

test("name gates: grammar collisions, reserved prefix, and shape are errors", () => {
  const bad = (name: string) => buildAdmissionReview(doc({
    verdicts: [{ paragraph: CHIP, verdict: "admit", name, intent: "x", justification: "y" }],
    expansions: [],
  }), candidates, "fixture");

  assert.ok(bad("pressable").errors.some((error) => error.includes("collides with an existing grammar word")));
  assert.ok(bad("sf-keycap").errors.some((error) => error.includes("reserved for semantic fragments")));
  assert.ok(bad("KeyCap").errors.some((error) => error.includes("not kebab-case")));
});

test("admissions beyond the budget are a validation error", () => {
  const review = buildAdmissionReview(doc({
    verdicts: [
      { paragraph: CHIP, verdict: "admit", name: "keycap", intent: "x", justification: "y" },
      { paragraph: CHIP, verdict: "admit", name: "code-chip", intent: "x", justification: "y" },
    ],
    expansions: [],
  }), candidates, "fixture", { budget: 1 });

  assert.ok(review.errors.some((error) => error.includes("exceed the budget of 1")));
});

test("an existing combine name is a collision", () => {
  const review = buildAdmissionReview(doc({ expansions: [] }), candidates, "fixture", {
    combinesSource: "combine keycap: [ ground-subtle ink ]",
  });
  assert.ok(review.errors.some((error) => error.includes("collides with an existing combine")));
});

test("scoreBackTranslation measures recall against the paragraph", () => {
  const score = scoreBackTranslation("a b c d", ["a", "b", "z"]);
  assert.equal(score.score, 0.5);
  assert.deepEqual(score.recovered, ["a", "b"]);
  assert.deepEqual(score.missed, ["c", "d"]);
  assert.deepEqual(score.extra, ["z"]);
});

test("parseAdmissionDocument rejects malformed documents", () => {
  assert.throws(() => parseAdmissionDocument('{"version": 2, "verdicts": []}'), /expected version 1/);
  assert.throws(() => parseAdmissionDocument('{"version": 1, "verdicts": {}}'), /must be an array/);
});

test("renderAdmissionReview produces a draft with the ADR skeleton and ratification steps", () => {
  const markdown = renderAdmissionReview(buildAdmissionReview(doc(), candidates, "fixture"));

  assert.match(markdown, /^# Ermine Admission Review: fixture/);
  assert.match(markdown, /DRAFT — machine-validated/);
  assert.match(markdown, /admissions: 1 of budget 3/);
  assert.match(markdown, /\*\*admit `keycap`\*\*/);
  assert.match(markdown, /back-translation: 6\/7 words recovered \(0\.86\)/);
  assert.match(markdown, /usage: <kbd> "Esc"/);
  assert.match(markdown, /ADR-00NN — Admit combines: keycap/);
  assert.match(markdown, /combine keycap: \[/);
  assert.match(markdown, /## How to ratify/);
});
