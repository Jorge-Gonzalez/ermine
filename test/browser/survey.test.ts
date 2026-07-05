import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, type Browser, type Page } from "playwright";

const surveyPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "survey", "index.html");

let browser: Browser;
let page: Page;

before(async () => {
  browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ offline: true });
  page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { __copied: string }).__copied = value;
        },
      },
    });
  });
  await page.goto(`file://${surveyPath}`);
});

after(async () => { await browser?.close(); });

test("survey works offline, reorders accessibly, and copies one complete response", async () => {
  const initial = await page.locator("li").evaluateAll((items) =>
    items.map((item) => (item as HTMLElement).dataset.word));
  assert.equal(initial.length, 6);
  assert.equal(new Set(initial).size, 6);

  await page.locator("li").first().getByRole("button", { name: /^Move down/ }).click();
  const moved = await page.locator("li").evaluateAll((items) =>
    items.map((item) => (item as HTMLElement).dataset.word));
  assert.equal(moved[0], initial[1]);
  assert.equal(moved[1], initial[0]);

  await page.getByRole("button", { name: "Copy results" }).click();
  const copied = await page.evaluate(() => (window as unknown as { __copied: string }).__copied);
  assert.equal(copied, `ORDER-v1:${moved.join(">")}`);
  assert.match(await page.locator("#status").textContent() ?? "", /Copied/);
});
