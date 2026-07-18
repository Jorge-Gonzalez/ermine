import { test } from "node:test";
import assert from "node:assert/strict";

import { buildReviewPack } from "../adoption/review-pack.ts";
import type { ClusterSource } from "../adoption/clusters.ts";

const sources: ClusterSource[] = [
  {
    file: "src/Delete.tsx",
    content: `
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Esc</kbd>
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Enter</kbd>
    `,
  },
  {
    file: "widgets/Suggest.tsx",
    content: `
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Tab</kbd>
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono">Space</kbd>
      <kbd className="ground-subtle ink rule corner-sm ruled font-xs font-mono padding-inline-xs">Plus</kbd>
    `,
  },
];

test("review pack assembles protocol, candidates with usage, and vocabulary", () => {
  const pack = buildReviewPack(sources, "fixture");

  assert.match(pack, /^# Ermine Admission Review Pack: fixture/);
  assert.match(pack, /## Protocol/);
  assert.match(pack, /default verdict for every candidate is\n\*\*hold-as-stem\*\*/);
  assert.match(pack, /admit at most 3 combines/);
  assert.match(pack, /Back-translation check/);
  assert.match(pack, /## Family Candidates for Review/);
  assert.match(pack, /`ground-subtle ink rule corner-sm ruled font-xs font-mono`/);
  assert.match(pack, /members:/);
  assert.match(pack, /usage: <kbd> "Esc"/);
  assert.match(pack, /## Individual Paragraph Evidence/);
  assert.match(pack, /## Existing Vocabulary/);
  assert.match(pack, /- structure \(layout\):/);
  assert.match(pack, /Scope prefixes:/);
  assert.match(pack, /## Required Output/);
});

test("review pack honors the admission budget option", () => {
  const pack = buildReviewPack(sources, "fixture", { budget: 1 });
  assert.match(pack, /admit at most 1 combine in this pass/);
});

test("explicitly undefined options fall back to defaults instead of clobbering them", () => {
  const pack = buildReviewPack(sources, "fixture", { limit: undefined, minCount: undefined });
  assert.match(pack, /`ground-subtle ink rule corner-sm ruled font-xs font-mono`/);
});

test("review pack lists existing combines when a definition source is given", () => {
  const pack = buildReviewPack(sources, "fixture", {
    combinesSource: `
      combine option-chip: [
        pressable selectable padding-inline-sm ground-subtle
      ]
    `,
  });
  assert.match(pack, /## Existing Combines/);
  assert.match(pack, /`option-chip`/);

  const empty = buildReviewPack(sources, "fixture");
  assert.match(empty, /None defined yet — this is the first admission pass/);
});
