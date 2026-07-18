import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

interface CorpusOccurrence {
  id: string;
  classString: string;
  ermineParagraph: string;
  projectTokens: string[];
}

interface ClasslistCorpusFixture {
  schema: string;
  project: string;
  summary: {
    sourceCount: number;
    occurrenceCount: number;
    distinctClasslists: number;
    distinctErmineParagraphs: number;
    classlistsWithProjectTokens: number;
  };
  occurrences: CorpusOccurrence[];
  distinctErmineParagraphs: { value: string; count: number }[];
}

test("Monky classlist corpus fixture preserves the current adoption bench", async () => {
  const corpus = JSON.parse(await readFile("test/fixtures/monky-classlist-corpus.json", "utf8")) as ClasslistCorpusFixture;

  assert.equal(corpus.schema, "ermine.classlist-corpus.v1");
  assert.equal(corpus.project, "monky");
  assert.equal(corpus.summary.sourceCount, 158);
  assert.equal(corpus.summary.occurrenceCount, 356);
  assert.equal(corpus.summary.distinctClasslists, 230);
  assert.equal(corpus.summary.distinctErmineParagraphs, 139);
  assert.equal(corpus.summary.classlistsWithProjectTokens, 301);
  assert.equal(corpus.occurrences.length, corpus.summary.occurrenceCount);
  assert.equal(new Set(corpus.occurrences.map((occurrence) => occurrence.classString)).size, corpus.summary.distinctClasslists);
  assert.equal(corpus.distinctErmineParagraphs.length, corpus.summary.distinctErmineParagraphs);
  assert.equal(corpus.occurrences.at(0)?.id, "0001");
  assert.equal(corpus.occurrences.at(-1)?.id, String(corpus.summary.occurrenceCount).padStart(4, "0"));
  assert.ok(corpus.occurrences.some((occurrence) => occurrence.ermineParagraph === ""));
  assert.ok(corpus.occurrences.some((occurrence) =>
    occurrence.ermineParagraph === "ground-subtle ink rule corner-sm ruled font-xs font-mono"
  ));
});
