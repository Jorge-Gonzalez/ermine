// render.test.ts — browser-verified P7: the completion of the on-paper purity
// check. P7 (emit.ts) proves free axes own disjoint properties in the AST; this
// asserts the RENDERED computed styles are actually what the grammar intended —
// vars resolve, the display facet merges, the sink paints, and a theme swap
// changes only values. Runs against demo/index.html in real Chromium.
//
// Separate from the fast gate on purpose: `pnpm test:browser` (needs the
// Chromium binary: `pnpm exec playwright install chromium`), not `pnpm test`.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const demoDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "demo");
const url = (f: string) => "file://" + join(demoDir, f);

let browser: Browser;
before(async () => { browser = await chromium.launch({ args: ["--no-sandbox"] }); });
after(async () => { await browser?.close(); });

const css = (page: Page, sel: string, prop: string) =>
  page.$eval(sel, (el, p) => getComputedStyle(el).getPropertyValue(p), prop);

async function openDemo(): Promise<Page> {
  const page = await browser.newPage();
  await page.goto(url("index.html"));
  return page;
}

test("var seam resolves in the browser: theme value → computed style", async () => {
  const page = await openDemo();
  assert.equal(await css(page, "body", "row-gap"), "16px", "gap-md → var(--spacing-md)=16px");
  assert.equal(await css(page, "body", "padding-top"), "24px", "padding-lg → var(--spacing-lg)=24px");
  assert.equal(await css(page, "#card", "max-width"), "512px", "max-width-lg → var(--size-lg)=32rem=512px");
  await page.close();
});

test("facet merge is real: `horizontal inline` in FLOW context computes inline-flex", async () => {
  const page = await openDemo();
  // #badge sits in a <p> (flow), so the `inline` outer-display survives.
  assert.equal(await css(page, "#badge", "display"), "inline-flex", "compound `.horizontal.inline` wins → inline flex");
  assert.equal(await css(page, "#header-row", "display"), "flex", "single facet stays plain flex");
  assert.equal(await css(page, "#header-row", "flex-direction"), "row");
  await page.close();
});

// A finding the browser gate surfaced (paper P7 could not): CSS blockifies a
// flex/grid item's OUTER display, so `m1-flow-participation` (inline/boxed/
// boxed-inline) is INERT on a child of a flex/grid container. Not a property
// collision — a semantic no-op imposed by the parent's layout mode. Locked here
// as a regression test; candidate for a lint warning (see the constitution note).
test("blockification: `inline` is inert on a flex/grid item (real CSS, not a bug)", async () => {
  const page = await openDemo();
  // note: pass parentDisplay as an ARG — a named inner function inside evaluate()
  // gets an esbuild `__name` wrapper that isn't defined in the page context.
  const displayUnder = (parentDisplay: string) => page.evaluate((pd) => {
    const parent = document.createElement("div");
    if (pd) parent.style.display = pd;
    const child = document.createElement("span");
    child.className = "horizontal inline";
    parent.appendChild(child);
    document.body.appendChild(parent);
    const d = getComputedStyle(child).display;
    parent.remove();
    return d;
  }, parentDisplay);
  assert.equal(await displayUnder(""), "inline-flex", "in flow context, `inline` takes effect");
  assert.equal(await displayUnder("flex"), "flex", "as a flex item, the outer display is blockified — `inline` is a no-op");
  await page.close();
});

test("sink paints under its entailment selector; unselected does not", async () => {
  const page = await openDemo();
  assert.equal(await css(page, "#selected-row", "background-color"), "rgb(238, 242, 255)", "harmonic-wash via the selection sink");
  assert.equal(await css(page, "#unselected-row", "background-color"), "rgba(0, 0, 0, 0)", "no aria-selected → sink doesn't match");
  await page.close();
});

test("re-skin: swapping the theme <link> re-proportions & re-tints, no markup change", async () => {
  const page = await openDemo();
  // theme.css
  assert.equal(await css(page, "body", "row-gap"), "16px");
  assert.equal(await css(page, "#card", "max-width"), "512px");
  assert.equal(await css(page, "#selected-row", "background-color"), "rgb(238, 242, 255)");
  // swap to theme-alt.css in place — nothing else touched
  await page.evaluate(() => {
    (document.querySelector('link[href="theme.css"]') as HTMLLinkElement).href = "theme-alt.css";
  });
  await page.waitForFunction(() => getComputedStyle(document.body).rowGap === "10px");
  assert.equal(await css(page, "body", "row-gap"), "10px", "spacing re-proportioned");
  assert.equal(await css(page, "#card", "max-width"), "352px", "size re-proportioned (22rem)");
  assert.equal(await css(page, "#selected-row", "background-color"), "rgb(253, 238, 230)", "sink re-tinted from the new theme");
  await page.close();
});
