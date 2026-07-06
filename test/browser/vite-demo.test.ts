// vite-demo.test.ts — D3 acceptance, browser half: the demo styled by the
// plugin-emitted CSS renders identically to the no-toolchain build. One smoke
// assertion in the render.test.ts harness style: computed layout styles are
// equal across both stylesheets for representative elements.

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "playwright";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const demoDir = join(repo, "demo");
const smokePage = join(demoDir, "index.plugin-smoke.html");

let browser: Browser;

before(async () => {
  // ensure the plugin artifact is current, then a copy of the demo page that
  // links it instead of the no-toolchain ermine.css (same dir → theme resolves)
  const build = spawnSync(process.execPath, ["--import", "tsx", "surfaces/vite-plugin/build-demo.ts"], {
    cwd: repo, encoding: "utf8", timeout: 120_000,
  });
  assert.equal(build.status, 0, build.stderr);
  const html = readFileSync(join(demoDir, "index.html"), "utf8");
  writeFileSync(smokePage, html.replace('href="ermine.css"', 'href="ermine.generated.css"'));
  browser = await chromium.launch({ args: ["--no-sandbox"] });
});

after(async () => {
  await browser?.close();
  rmSync(smokePage, { force: true });
});

const PROBES: { selector: string; props: string[] }[] = [
  { selector: "body", props: ["display"] },
  { selector: ".horizontal", props: ["display", "flex-direction", "gap"] },
  { selector: ".vertical", props: ["display", "flex-direction", "gap"] },
  { selector: ".pill.horizontal", props: ["display", "padding-top"] },
  { selector: ".expandable", props: ["flex-grow", "flex-shrink"] },
];

async function computed(page: Page, selector: string, prop: string): Promise<string> {
  return page.$eval(selector, (el, p) => getComputedStyle(el).getPropertyValue(p as string), prop);
}

test("plugin-built CSS renders the demo identically to the no-toolchain build", async () => {
  const original = await browser.newPage();
  await original.goto("file://" + join(demoDir, "index.html"));
  const viaPlugin = await browser.newPage();
  await viaPlugin.goto("file://" + smokePage);

  for (const { selector, props } of PROBES) {
    for (const prop of props) {
      const [a, b] = [await computed(original, selector, prop), await computed(viaPlugin, selector, prop)];
      assert.equal(b, a, `${selector} { ${prop} }: no-toolchain '${a}' vs plugin '${b}'`);
    }
  }
});
