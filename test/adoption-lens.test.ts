import assert from "node:assert/strict";
import { test } from "node:test";

import { buildAdoptionLensReport, renderAdoptionLensMarkdown } from "../adoption/lens-report.ts";

test("adoption lens separates word pressure from fragments and boundaries", () => {
  const report = buildAdoptionLensReport({
    inputs: {
      currentLedger: "reports/adoption/demo/current-ledger.json",
      ruleActionReview: "reports/adoption/demo/rule-action-review.json",
      classlistCorpus: "test/fixtures/demo-classlist-corpus.json",
    },
    ledger: {
      version: 2,
      project: "demo",
      source: { ermineCommit: "abc123", projectCommit: "def456" },
      summary: {
        totalDeclarations: 5,
        residueDeclarations: 4,
        assimilable: 1,
        byCode: {
          "ermine-emitted": 1,
          substrate: 0,
          "theme-metric": 0,
          "config-departure": 0,
          assimilable: 1,
          "recipe-identity": 0,
          "rule-mechanics": 0,
          "brand-identity": 0,
          "affordance-mechanics": 0,
          "component-contract": 0,
          "state-mechanics": 0,
          "state-review": 0,
          "focus-state": 0,
          "aria-current": 0,
          "parent-relational": 0,
          "pseudo-mechanics": 1,
          "scrollbar-followup": 1,
          "motion-followup": 0,
          "opacity-followup": 0,
          "elevation-followup": 0,
          "reset-absence": 0,
          "user-content": 1,
          "identity-geometry": 0,
          "skin-review": 0,
          "identity-review": 0,
        },
      },
      records: [
        { id: "r1", file: "src/a.css", line: 1, selector: ".horizontal", property: "display", value: "flex", code: "ermine-emitted" },
        { id: "r2", file: "src/a.css", line: 2, selector: ".legacy", property: "width", value: "min(90vw, 320px)", code: "assimilable", words: ["width-popover-md"] },
        { id: "r3", file: "src/a.css", line: 3, selector: ".sf-keycap::after", property: "content", value: "''", code: "pseudo-mechanics" },
        { id: "r4", file: "src/a.css", line: 4, selector: ".sf-authored-content p", property: "margin", value: "1em 0", code: "user-content" },
        { id: "r5", file: "src/a.css", line: 5, selector: ".panel::-webkit-scrollbar", property: "width", value: "8px", code: "scrollbar-followup" },
      ],
      shadowedWords: [],
    },
    review: {
      version: 1,
      project: "demo",
      source: { ermineCommit: "abc123", projectCommit: "def456" },
      inputs: { currentLedger: "reports/adoption/demo/current-ledger.json" },
      summary: {
        reviewedDeclarations: 4,
        latentGeneralizable: 1,
        likelyRecipe: 2,
        likelyLocal: 1,
      },
      declarations: [
        { id: "r2", latentOutcome: "admitted", ruleAction: "dimension-constraint", erminePressure: "migrate to existing words" },
        { id: "r3", latentOutcome: "recipe", ruleAction: "component-private-drawing", erminePressure: "promote as molecule/recipe only if reused" },
        { id: "r4", latentOutcome: "recipe", ruleAction: "typography-content", erminePressure: "authored-content substrate" },
        { id: "r5", latentOutcome: "local-identity", ruleAction: "component-private-drawing", erminePressure: "browser adapter" },
      ],
    },
    classlistCorpus: {
      schema: "ermine.classlist-corpus.v1",
      project: "demo",
      source: { ermineCommit: "abc123", projectCommit: "def456" },
      summary: {
        occurrenceCount: 3,
        distinctErmineParagraphs: 2,
        classlistsWithProjectTokens: 1,
      },
      distinctErmineParagraphs: [
        { value: "horizontal align-center gap-sm", count: 2, examples: ["src/a.tsx#1"] },
        { value: "vertical", count: 1, examples: ["src/a.tsx#2"] },
      ],
    },
  });

  assert.equal(report.summary.byCategory["ermine-infrastructure"], 1);
  assert.equal(report.summary.byCategory["existing-ermine-word"], 1);
  assert.equal(report.summary.byCategory["semantic-fragment"], 1);
  assert.equal(report.summary.byCategory["authored-content-default"], 1);
  assert.equal(report.summary.byCategory["browser-adapter"], 1);
  assert.equal(report.summary.combineCandidateParagraphs, 1);

  const markdown = renderAdoptionLensMarkdown(report);
  assert.match(markdown, /semantic-fragment/);
  assert.match(markdown, /authored-content-default/);
  assert.match(markdown, /browser-adapter/);
  assert.match(markdown, /horizontal align-center gap-sm/);
});
