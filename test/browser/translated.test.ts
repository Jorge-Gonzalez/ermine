// translated.test.ts — C4 smoke assertion (browser-verified): the original
// snapshot and its Ermine translation both render without console errors, and
// key elements carry equal computed `display` values. Visual fidelity beyond
// this is DATA recorded in analysis/translation/TRANSLATION-REPORT.md, not a
// test subject. Same Chromium harness as render.test.ts; runs in
// `npm run test:browser`, not the fast gate.

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const translationDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "analysis", "translation");
const url = (file: string) => "file://" + join(translationDir, file);

let browser: Browser;
before(async () => { browser = await chromium.launch({ args: ["--no-sandbox"] }); });
after(async () => { await browser?.close(); });

async function open(file: string): Promise<{ page: Page; errors: string[] }> {
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(url(file));
  await page.waitForLoadState("load");
  return { page, errors };
}

// stable, style-bearing elements present in both documents
const KEY_SELECTORS = ["body", ".subnav-item", ".test-file-test", ".hbox", ".test-file-title"];

test("C4 smoke: both versions render without console errors and key displays match", async () => {
  const original = await open("original.html");
  const translated = await open("translated.html");

  assert.deepEqual(original.errors, [], `original console errors: ${original.errors.join("; ")}`);
  assert.deepEqual(translated.errors, [], `translated console errors: ${translated.errors.join("; ")}`);

  for (const selector of KEY_SELECTORS) {
    const display = (page: Page) =>
      page.$eval(selector, (el) => getComputedStyle(el).display);
    const [a, b] = [await display(original.page), await display(translated.page)];
    assert.equal(b, a, `computed display for '${selector}': original '${a}' vs translated '${b}'`);
  }
});
