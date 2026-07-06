import assert from "node:assert/strict";
import { test } from "node:test";

import { analyzeProject } from "../adoption/analyze.ts";
import { validateLedger } from "../adoption/validate-ledger.ts";

const fixture = new URL("./fixtures/adoption-project", import.meta.url).pathname;
const commits = {
  ermineCommit: "1111111111111111111111111111111111111111",
  projectCommit: "2222222222222222222222222222222222222222",
};

test("fixture pins exact source, delivery, class, and declaration counts", async () => {
  const artifacts = await analyzeProject({ projectRoot: fixture, name: "fixture", ...commits });
  assert.deepEqual(artifacts.inventory.counts, {
    cssFiles: 3,
    cssTemplates: 1,
    declarations: 10,
    importEdges: 1,
    rawImports: 1,
    linkedStylesheets: 1,
    styleInjections: 1,
    shadowRoots: 1,
    bundles: 2,
    staticClassTokens: 5,
    classOccurrences: 2,
    dynamicClassExpressions: 1,
    inlineStyleObjects: 1,
    directStyleWrites: 1,
    duplicateDefinitions: 1,
    contextDependentDefinitions: 1,
    undefinedStaticTokens: 3,
    grammarPropertyCandidates: 9,
  });
  assert.deepEqual(artifacts.inventory.measurements.scope, {
    total: 10,
    custom: 0,
    real: 10,
    covered: 9,
    uncovered: { "box-sizing": 1 },
  });
  assert.deepEqual(artifacts.inventory.classes.undefinedStaticTokens, [
    "html-only",
    "selected",
    "undefined-token",
  ]);
  assert.equal(artifacts.inventory.definitions.duplicates[0]?.selector, ".duplicate");
  assert.deepEqual(artifacts.inventory.definitions.contextDependent[0]?.values, ["4px", "8px"]);
});

test("every fixture declaration appears once in a valid conservative ledger", async () => {
  const { ledger } = await analyzeProject({ projectRoot: fixture, name: "fixture", ...commits });
  assert.equal(new Set(ledger.records.map((record) => record.id)).size, 10);
  assert.deepEqual(ledger.summary, {
    totalRecords: 10,
    byDisposition: {
      "grammar-exact": 0,
      "grammar-composition": 0,
      "skin-local": 0,
      "identity-local": 0,
      substrate: 1,
      gap: 0,
      dead: 0,
      uncertain: 9,
    },
  });
  assert.deepEqual(validateLedger(ledger).errors, []);
  assert.equal(ledger.records.find((record) => record.property === "box-sizing")?.disposition, "substrate");
  assert.ok(ledger.records.filter((record) => record.disposition === "uncertain")
    .every((record) => record.pending.length > 0));
});

test("analysis rendering is byte-deterministic for a pinned source", async () => {
  const first = await analyzeProject({ projectRoot: fixture, name: "fixture", ...commits });
  const second = await analyzeProject({ projectRoot: fixture, name: "fixture", ...commits });
  assert.equal(JSON.stringify(second.inventory, null, 2), JSON.stringify(first.inventory, null, 2));
  assert.equal(JSON.stringify(second.ledger, null, 2), JSON.stringify(first.ledger, null, 2));
  assert.equal(second.baseline, first.baseline);
  assert.match(first.baseline, /No grammar or skin ruling is made here\./);
});
