// C4 page provenance: the two-spec suite whose HTML report is the translated
// page. Content is immaterial — the report APP's chrome is the page under
// translation — but the demo navigation makes it a non-empty, honest report.
import { expect, test } from "playwright/test";

test("grammar demo renders", async ({ page }) => {
  await page.goto(new URL("../../../demo/index.html", import.meta.url).href);
  await expect(page.locator("body")).toBeVisible();
});

test("a second passing case", async ({ page }) => {
  await page.goto("about:blank");
  expect(1 + 1).toBe(2);
});
