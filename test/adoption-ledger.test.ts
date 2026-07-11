import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { checkAdoptionLedgers, validateLedger } from "../adoption/validate-ledger.ts";

const validFixture = JSON.parse(await readFile(
  new URL("./fixtures/adoption-ledger.valid.json", import.meta.url),
  "utf8",
)) as Record<string, any>;

const corrupted = (mutate: (ledger: Record<string, any>) => void): string[] => {
  const ledger = structuredClone(validFixture);
  mutate(ledger);
  const result = validateLedger(ledger);
  assert.equal(result.valid, false, "corrupted ledger must fail");
  return result.errors;
};

test("the complete version-1 fixture is valid", () => {
  const result = validateLedger(validFixture);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
  assert.equal(result.ledger?.summary.totalRecords, 8);
});

test("a version-2 fixture uses projectCommit provenance", () => {
  const ledger = structuredClone(validFixture);
  ledger.version = 2;
  ledger.source.projectCommit = ledger.source.monkyCommit;
  delete ledger.source.monkyCommit;
  const result = validateLedger(ledger);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
  assert.equal(result.ledger?.version, 2);
});

test("duplicate record IDs name both occurrences", () => {
  const errors = corrupted((ledger) => { ledger.records[1].id = ledger.records[0].id; });
  assert.ok(errors.includes(
    "records[1].id: duplicate id 'src/a.css::.row::display::1' (first used at records[0])",
  ));
});

test("missing provenance names the exact source field", () => {
  const errors = corrupted((ledger) => { delete ledger.source.monkyCommit; });
  assert.ok(errors.includes(
    "source.projectCommit: expected a 40-character lowercase hexadecimal commit",
  ));
});

test("an unknown disposition is rejected by the closed version-1 set", () => {
  const errors = corrupted((ledger) => { ledger.records[2].disposition = "mostly-grammar"; });
  assert.ok(errors.includes(
    "records[2].disposition: expected one of grammar-exact, grammar-composition, skin-local, " +
    "identity-local, substrate, gap, dead, uncertain",
  ));
});

test("grammar fields are rejected on a local disposition", () => {
  const errors = corrupted((ledger) => {
    ledger.records[2].axis = "skin-surface";
    ledger.records[2].words = ["card"];
  });
  assert.ok(errors.includes("records[2].axis: allowed only for a grammar disposition"));
  assert.ok(errors.includes("records[2].words: allowed only for a grammar disposition"));
});

test("a gap without its Gap Report reference fails specifically", () => {
  const errors = corrupted((ledger) => { delete ledger.records[5].gapReport; });
  assert.ok(errors.includes("records[5].gapReport: required when disposition is gap"));
});

test("summary drift fails declaration conservation", () => {
  const errors = corrupted((ledger) => { ledger.summary.totalRecords = 7; });
  assert.ok(errors.includes("summary.totalRecords: conservation failed: expected 8, got 7"));
  assert.ok(errors.includes(
    "summary.byDisposition: conservation failed: counts sum to 8, totalRecords is 7",
  ));
});

test("per-disposition summary drift fails even when the total remains conserved", () => {
  const errors = corrupted((ledger) => {
    ledger.summary.byDisposition.dead = 0;
    ledger.summary.byDisposition.uncertain = 2;
  });
  assert.ok(errors.includes(
    "summary.byDisposition.dead: conservation failed: expected 1, got 0",
  ));
  assert.ok(errors.includes(
    "summary.byDisposition.uncertain: conservation failed: expected 1, got 2",
  ));
});

test("repository check succeeds clearly before a project ledger exists", async () => {
  const root = await mkdtemp(join(tmpdir(), "ermine-adoption-empty-"));
  const messages: string[] = [];
  assert.equal(await checkAdoptionLedgers(root, (message) => messages.push(message)), true);
  assert.deepEqual(messages, [
    "adoption:check: no reports/adoption/*/ledger.json files found; nothing to validate",
  ]);
});

test("repository check requires a referenced Gap Report to exist", async () => {
  const root = await mkdtemp(join(tmpdir(), "ermine-adoption-gap-"));
  await mkdir(join(root, "reports/adoption/fixture"), { recursive: true });
  await writeFile(
    join(root, "reports/adoption/fixture/ledger.json"),
    `${JSON.stringify(validFixture, null, 2)}\n`,
  );

  const missingMessages: string[] = [];
  assert.equal(await checkAdoptionLedgers(root, (message) => missingMessages.push(message)), false);
  assert.ok(missingMessages.includes(
    "ERROR reports/adoption/fixture/ledger.json: src/a.css::.card::border-radius::1: " +
    "referenced Gap Report is missing or unreadable: reports/GAP-U-5-fixture-skin.md",
  ));

  await writeFile(join(root, "reports/GAP-U-5-fixture-skin.md"), "# Fixture Gap Report\n");
  const validMessages: string[] = [];
  assert.equal(await checkAdoptionLedgers(root, (message) => validMessages.push(message)), true);
  assert.deepEqual(validMessages, ["valid reports/adoption/fixture/ledger.json (8 records)"]);
});
