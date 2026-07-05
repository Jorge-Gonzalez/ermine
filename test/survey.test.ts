import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  RESPONSE_PREFIX,
  parseResponse,
  renderTally,
  responseLines,
  tallyResponses,
} from "../survey/tally.ts";

async function fixture(name: string): Promise<string[]> {
  const source = await readFile(new URL(`../survey/fixtures/${name}`, import.meta.url), "utf8");
  return responseLines(source);
}

test("above-threshold fixture reproduces 449/450 by hand", async () => {
  const result = tallyResponses(await fixture("above-090.txt"));
  assert.equal(result.completeResponses, 30);
  assert.equal(result.totalAgreements, 449);
  assert.equal(result.totalPairObservations, 450);
  assert.equal(result.meanPairwiseAgreement, 449 / 450);
  assert.equal(result.branch, "names-remain-canonical");
  assert.equal(result.pairs.find((pair) => pair.first === "tight" && pair.second === "snug")?.share, 29 / 30);
  assert.ok(result.pairs.filter((pair) => pair.share === 1).length === 14);
});

test("boundary fixture reproduces exactly 0.90 and takes the pre-committed lower branch", async () => {
  const result = tallyResponses(await fixture("at-090.txt"));
  assert.equal(result.completeResponses, 30);
  assert.equal(result.totalAgreements, 405);
  assert.equal(result.totalPairObservations, 450);
  assert.equal(result.meanPairwiseAgreement, 0.9);
  assert.ok(result.pairs.every((pair) => pair.share === 0.9));
  assert.equal(result.branch, "numeric-steps-become-canonical");
});

test("malformed responses are excluded with reasons", () => {
  const canonical = `${RESPONSE_PREFIX}tight>snug>comfortable>relaxed>loose>separated`;
  const duplicate = `${RESPONSE_PREFIX}tight>tight>comfortable>relaxed>loose>separated`;
  const incomplete = `${RESPONSE_PREFIX}tight>snug>comfortable`;
  const result = tallyResponses([canonical, duplicate, incomplete, "not-a-response"]);
  assert.equal(result.completeResponses, 1);
  assert.equal(result.excludedResponses.length, 3);
  assert.equal(result.branch, "insufficient-sample");
  assert.match(result.excludedResponses[0].reason, /exactly once/);
  assert.match(result.excludedResponses[1].reason, /expected 6 words/);
  assert.match(result.excludedResponses[2].reason, /missing ORDER-v1:/);
  assert.match(renderTally(result), /Excluded responses: 3/);
  assert.equal(parseResponse(canonical).ok, true);
});

test("the participant page is a self-contained offline drag instrument", async () => {
  const html = await readFile(new URL("../survey/index.html", import.meta.url), "utf8");
  assert.match(html, /Order these words from least space to most space\./);
  assert.match(html, /draggable = true/);
  assert.match(html, /addEventListener\("dragover"/);
  assert.match(html, /Copy results/);
  assert.match(html, /ORDER-v1:/);
  assert.doesNotMatch(html, /<(?:script|link)[^>]+(?:src|href)=["']https?:/i);
  assert.doesNotMatch(html, /\bCSS\b/i);
});
