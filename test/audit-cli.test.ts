import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { extractPageCss, loadCssSources, renderAudit } from "../analysis/audit.ts";
import { measureCss, type CssSource } from "../analysis/lib.ts";

test("C1 fixture reproduces exact property coverage and top-k value statistics", async () => {
  const location = new URL("./fixtures/audit-known.css", import.meta.url);
  const css = await readFile(location, "utf8");
  const sources: CssSource[] = [{ label: "audit-known.css", location: location.pathname, css }];
  const measurements = measureCss(sources, "known");

  assert.equal(measurements.scope.total, 14);
  assert.equal(measurements.scope.custom, 1);
  assert.equal(measurements.scope.real, 13);
  assert.equal(measurements.scope.covered, 9);
  assert.deepEqual([...measurements.scope.uncovered], [
    ["width", 2],
    ["height", 1],
    ["transform", 1],
  ]);

  const spacing = measurements.values.spacing;
  assert.equal(spacing.totalTokens, 7);
  assert.equal(spacing.rawLengths, 6);
  assert.equal(spacing.distinctLengths, 4);
  assert.deepEqual(spacing.topValues, [[8, 3], [16, 1], [4, 1], [12, 1]]);
  assert.equal(spacing.topCoverage(6), 1);
  assert.equal(spacing.topCoverage(12), 1);
  assert.equal(spacing.gridAlignedShare, 1);
  assert.equal(spacing.zeroShare, 1 / 7);

  const size = measurements.values.size;
  assert.equal(size.totalTokens, 5);
  assert.equal(size.rawLengths, 4);
  assert.equal(size.distinctLengths, 3);
  assert.deepEqual(size.topValues, [[100, 2], [32, 1], [200, 1]]);
  assert.equal(size.topCoverage(6), 1);

  const report = renderAudit("known", sources, measurements);
  assert.match(report, /computed styles not observed/);
  assert.match(report, /rem→16px assumed; !important stripped/);
  assert.match(report, /\| known \| 69\.2% \| 7\.1% \|/);
  assert.match(report, /\| known \| 6 \| 4 \| 100\.0% \| 100\.0% \| 100\.0% \| 14\.3% \|/);
  assert.match(report, /\| known \| 4 \| 3 \| 100\.0% \|/);
});

test("HTML extraction keeps inline and same-origin stylesheets only", () => {
  const html = `
    <link rel="stylesheet" href="/assets/app.css">
    <link rel="preload stylesheet" href="theme.css?v=1&amp;x=2">
    <link rel="stylesheet" href="https://cdn.example.net/external.css">
    <style>.inline { gap: 8px; }</style>
  `;
  const extracted = extractPageCss(html, "https://example.com/docs/page");
  assert.equal(extracted.inline.length, 1);
  assert.equal(extracted.inline[0].css, ".inline { gap: 8px; }");
  assert.deepEqual(extracted.stylesheets, [
    "https://example.com/assets/app.css",
    "https://example.com/docs/theme.css?v=1&x=2",
  ]);
});

test("URL ingestion fetches the page and only its same-origin stylesheet", async () => {
  const calls: string[] = [];
  const fetcher = async (input: string | URL | Request): Promise<Response> => {
    const url = String(input);
    calls.push(url);
    if (url === "https://example.com/page") {
      return new Response(
        '<style>.inline { margin: 4px; }</style><link rel="stylesheet" href="/app.css">' +
          '<link rel="stylesheet" href="https://elsewhere.example/external.css">',
        { status: 200, headers: { "content-type": "text/html" } },
      );
    }
    if (url === "https://example.com/app.css") {
      return new Response(".linked { padding: 8px; }", {
        status: 200,
        headers: { "content-type": "text/css" },
      });
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  const sources = await loadCssSources(["https://example.com/page"], fetcher);
  assert.deepEqual(calls, ["https://example.com/page", "https://example.com/app.css"]);
  assert.deepEqual(sources.map((source) => source.css), [
    ".inline { margin: 4px; }",
    ".linked { padding: 8px; }",
  ]);
});
