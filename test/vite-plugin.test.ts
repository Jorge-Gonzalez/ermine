// vite-plugin.test.ts — D3 acceptance, main-suite half. The scanning core is
// pure (no vite import), so the fixture criteria run here; the real `vite
// build` runs as a subprocess from the plugin's isolated package, and the
// byte-compare finding (identical to demo/ermine.css modulo provenance
// headers) is locked as an assertion.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildStylesheet } from "../src/css.ts";
import { classAttributes, formatWarning, scanSources } from "../surfaces/vite-plugin/scan.ts";

const REPO = fileURLToPath(new URL("..", import.meta.url));

test("foreign classes produce zero warnings and zero output", () => {
  const { elements, warnings } = scanSources([{
    file: "foreign.html",
    content: `<div class="btn btn-primary lg:col-span-2"><span className="badge badge--active">x</span></div>`,
  }]);
  assert.deepEqual(elements, []);
  assert.deepEqual(warnings, []);
});

test("a same-axis conflict produces exactly one warning containing the linter's reason", () => {
  const { warnings } = scanSources([{
    file: "conflict.html",
    content: `<div class="horizontal vertical card">two structures</div>`,
  }]);
  assert.equal(warnings.length, 1);
  const text = formatWarning(warnings[0]);
  assert.match(text, /one-word-per-axis/);
  assert.match(text, /'horizontal', 'vertical' conflict — all axis 'structure'/);
  assert.match(text, /conflict\.html/);
});

test("state words alone warn nothing — entailment is a runtime obligation, not a scan finding", () => {
  const { warnings } = scanSources([{
    file: "state.html",
    content: `<li class="selectable selected selection-subtle">item</li>`,
  }]);
  assert.deepEqual(warnings, []);
});

test("each attribute is one element: facet compounds survive into the stylesheet", () => {
  const { elements } = scanSources([{
    file: "facet.html",
    content: `<span class="horizontal inline gap-tight">chip</span>`,
  }]);
  assert.deepEqual(elements, ["horizontal inline gap-tight"]);
  const css = buildStylesheet(elements);
  assert.match(css, /\.horizontal\.inline \{\n  display: inline flex;/);
});

test("attribute forms: class, className, and literal template — interpolation is invisible", () => {
  const content = [
    `<div class="vertical">a</div>`,
    `<div className='gap-snug'>b</div>`,
    "<div className={`padding-relaxed`}>c</div>",
    "<div className={`gap-${size}`}>dynamic — skipped</div>",
  ].join("\n");
  assert.deepEqual(classAttributes(content), ["vertical", "gap-snug", "padding-relaxed"]);
});

test("duplicate elements dedupe; distinct compositions do not", () => {
  const { elements } = scanSources([{
    file: "dup.html",
    content: `<div class="vertical gap-snug"></div><div class="vertical gap-snug"></div><div class="vertical"></div>`,
  }]);
  assert.deepEqual(elements, ["vertical gap-snug", "vertical"]);
});

test("building the demo through the plugin reproduces demo/ermine.css modulo provenance headers", () => {
  const run = spawnSync(process.execPath, ["--import", "tsx", "surfaces/vite-plugin/build-demo.ts"], {
    cwd: REPO, encoding: "utf8", timeout: 120_000,
  });
  assert.equal(run.status, 0, run.stderr);

  const stripHeader = (css: string) => css.replace(/^\/\* GENERATED[^*]*\*\/\n\n/, "");
  const noToolchain = stripHeader(readFileSync(new URL("../demo/ermine.css", import.meta.url), "utf8"));
  const viaPlugin = stripHeader(readFileSync(new URL("../demo/ermine.generated.css", import.meta.url), "utf8"));
  assert.equal(viaPlugin, noToolchain);
});
