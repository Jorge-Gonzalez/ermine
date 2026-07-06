// U0 provenance: adapted from Monky's pre-Ermine layering experiment at
// 47a082bffeef40b6361f16340a0644cab3cef971.
// layering.browser.test.ts sha256 9bd183eada8c93afedf71e9bf172c45952f64465cfe636568dd490c8e5436a52
// Canonical classes below are linted and emitted by Ermine. Raw integer z-index
// appears only in the quarantined unknown-host boundary probes from R-LAYER-02.

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser } from "playwright";

import { buildStylesheet } from "../../src/css.ts";
import { lint } from "../../src/lint.ts";

const grammarClasses = [
  "position-absolute isolate",
  "position-absolute base",
  "position-absolute content",
  "position-absolute raised",
  "position-absolute dropdown",
  "position-absolute tooltip",
];

const errors = grammarClasses.flatMap((classString) =>
  lint(classString, new Set(), {})
    .filter((issue) => issue.level === "error")
    .map((issue) => `${classString}: ${issue.rule}: ${issue.msg}`));
assert.deepEqual(errors, [], errors.join("\n"));

const generated = buildStylesheet(grammarClasses);
const baseCss = `
  :root {
    --z-base: 0;
    --z-content: 1;
    --z-raised: 10;
    --z-dropdown: 20;
    --z-sticky: 30;
    --z-tooltip: 40;
  }
  body { margin: 0; }
  ${generated}
`;

let browser: Browser;
before(async () => { browser = await chromium.launch({ args: ["--no-sandbox"] }); });
after(async () => { await browser?.close(); });

const box = (id: string, classes = "", extra = "") =>
  `<div data-id="${id}" class="${classes}" style="inset:0;${extra}"></div>`;
const stage = (inner: string) =>
  `<div style="position:fixed;left:0;top:0;width:80px;height:80px">${inner}</div>`;

async function topmostAt(scene: string): Promise<string | null> {
  const page = await browser.newPage();
  try {
    await page.setContent(`<style>${baseCss}</style>${scene}`);
    return await page.evaluate(() => {
      let element = document.elementFromPoint(20, 20) as HTMLElement | null;
      while (element && !element.dataset.id) element = element.parentElement;
      return element?.dataset.id ?? null;
    });
  } finally {
    await page.close();
  }
}

test("Z1: isolate contains descendant z while an unisolated child escapes", async () => {
  const trapped = stage(
    `<div class="position-absolute isolate" style="inset:0">${box("trapped", "position-absolute tooltip")}</div>` +
    box("sibling", "position-absolute content"),
  );
  assert.equal(await topmostAt(trapped), "sibling");

  const escaped = stage(
    `<div class="position-absolute" style="inset:0">${box("escaped", "position-absolute tooltip")}</div>` +
    box("sibling", "position-absolute content"),
  );
  assert.equal(await topmostAt(escaped), "escaped");
});

test("Z2: cross-context parent order dominates descendant z", async () => {
  const scene = stage(
    `<div class="position-absolute content" style="inset:0">${box("high-child", "position-absolute tooltip")}</div>` +
    `<div class="position-absolute raised" style="inset:0">${box("low-child", "position-absolute content")}</div>`,
  );
  assert.equal(await topmostAt(scene), "low-child");
});

test("Z3: named Ermine z steps order elements within one context", async () => {
  const scene = stage(
    box("dropdown", "position-absolute dropdown") +
    box("base", "position-absolute base") +
    box("tooltip", "position-absolute tooltip"),
  );
  assert.equal(await topmostAt(scene), "tooltip");
});

test("Z4: transform creates an accidental context that traps child z", async () => {
  const scene = stage(
    `<div class="position-absolute" style="inset:0;transform:translateZ(0)">${box("trapped", "position-absolute tooltip")}</div>` +
    box("sibling", "position-absolute content"),
  );
  assert.equal(await topmostAt(scene), "sibling");
});

test("Z5: an unknown-host boundary works only at the root", async () => {
  const atRoot =
    box("host", "", "position:fixed;z-index:1000000;width:80px;height:80px") +
    box("overlay", "", "position:fixed;z-index:2147483646;width:80px;height:80px");
  assert.equal(await topmostAt(atRoot), "overlay");

  const trapped = stage(
    `<div style="position:absolute;inset:0;z-index:1">${box("overlay", "", "position:absolute;z-index:2147483646")}</div>` +
    box("host-sibling", "", "position:absolute;z-index:2"),
  );
  assert.equal(await topmostAt(trapped), "host-sibling");
});
