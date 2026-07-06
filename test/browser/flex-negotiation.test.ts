// U0 provenance: adapted from Monky's pre-Ermine browser experiments at
// 47a082bffeef40b6361f16340a0644cab3cef971.
// flexCharacter.browser.test.ts sha256 e43d6b84a6014823d528041c3f123a2e074b24b40ca0fd309892efa92aaaaf63
// flexPipeline.browser.test.ts  sha256 4eb602cca7558f4bc7bf17c69e79c06daa0963ff70417b9506b74e33a866bf2b
// This is not a port of Monky's compiler helper: every class string is linted
// and serialized by Ermine's real lint/emit/css path before Chromium measures it.

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { chromium, type Browser, type Page } from "playwright";

import { buildStylesheet } from "../../src/css.ts";
import { lint } from "../../src/lint.ts";

type SizeStep = "sm" | "md" | "lg" | "xl";
type Theme = Partial<Record<SizeStep, number>>;
type Child = { classes: string; content?: string };

let browser: Browser;
before(async () => { browser = await chromium.launch({ args: ["--no-sandbox"] }); });
after(async () => { await browser?.close(); });

function assertCanonical(classStrings: string[]): void {
  const errors = classStrings.flatMap((classString) =>
    lint(classString, new Set(), {})
      .filter((issue) => issue.level === "error")
      .map((issue) => `${classString}: ${issue.rule}: ${issue.msg}`));
  assert.deepEqual(errors, [], errors.join("\n"));
}

async function measureRow(
  width: number,
  children: Child[],
  theme: Theme = {},
): Promise<number[]> {
  const classStrings = children.map((child) => child.classes);
  assertCanonical(classStrings);
  const sizes = { sm: 50, md: 100, lg: 150, xl: 240, ...theme };
  const generated = buildStylesheet(classStrings);
  const page: Page = await browser.newPage();
  try {
    await page.setContent(`<style>
      :root {
        --size-sm: ${sizes.sm}px;
        --size-md: ${sizes.md}px;
        --size-lg: ${sizes.lg}px;
        --size-xl: ${sizes.xl}px;
      }
      .probe { display:flex; flex-direction:row; align-items:stretch; }
      .probe > * { box-sizing:border-box; min-width:0; overflow:hidden; }
      ${generated}
    </style><div class="probe"></div>`);
    await page.$eval(".probe", (row, input) => {
      const { rowWidth, rowChildren } = input as {
        rowWidth: number;
        rowChildren: Child[];
      };
      (row as HTMLElement).style.width = `${rowWidth}px`;
      for (const child of rowChildren) {
        const box = document.createElement("div");
        box.className = child.classes;
        box.textContent = child.content ?? "";
        row.appendChild(box);
      }
    }, { rowWidth: width, rowChildren: children });
    return await page.$$eval(".probe > *", (boxes) =>
      boxes.map((box) => Math.round(box.getBoundingClientRect().width)));
  } finally {
    await page.close();
  }
}

const child = (classes: string, content?: string): Child => ({ classes, content });

test("basis-ratio ignores content and divides equal flex characters equally", async () => {
  const classes = "elastic basis-ratio";
  assert.deepEqual(await measureRow(600, [
    child(classes, "OK"),
    child(classes, "Open preferences"),
    child(classes, "Hi"),
  ]), [200, 200, 200]);
});

test("grow weights determine the ratio and scale proportionally", async () => {
  const base = await measureRow(600, [
    child("grow-1 shrink-1 basis-ratio"),
    child("grow-2 shrink-1 basis-ratio"),
    child("grow-1 shrink-1 basis-ratio"),
  ]);
  const scaled = await measureRow(600, [
    child("grow-2 shrink-1 basis-ratio"),
    child("grow-4 shrink-1 basis-ratio"),
    child("grow-2 shrink-1 basis-ratio"),
  ]);
  assert.deepEqual(base, [150, 300, 150]);
  assert.deepEqual(scaled, base);
});

test("negotiation conserves width and is equivariant under child order", async () => {
  const forward = await measureRow(600, [
    child("grow-1 shrink-1 basis-ratio"),
    child("grow-2 shrink-1 basis-ratio"),
    child("grow-3 shrink-1 basis-ratio"),
  ]);
  const reverse = await measureRow(600, [
    child("grow-3 shrink-1 basis-ratio"),
    child("grow-2 shrink-1 basis-ratio"),
    child("grow-1 shrink-1 basis-ratio"),
  ]);
  assert.equal(forward.reduce((sum, value) => sum + value, 0), 600);
  assert.deepEqual(forward, [100, 200, 300]);
  assert.deepEqual(reverse, [...forward].reverse());
});

test("increasing one grow weight cannot shrink that child", async () => {
  const before = await measureRow(600, [
    child("grow-1 shrink-1 basis-ratio"),
    child("grow-1 shrink-1 basis-ratio"),
    child("grow-1 shrink-1 basis-ratio"),
  ]);
  const afterGrowth = await measureRow(600, [
    child("grow-3 shrink-1 basis-ratio"),
    child("grow-1 shrink-1 basis-ratio"),
    child("grow-1 shrink-1 basis-ratio"),
  ]);
  assert.ok(afterGrowth[0]! > before[0]!);
});

test("deficit is weighted by shrink times the resolved basis", async () => {
  const widths = await measureRow(280, [
    child("grow-0 shrink-1 basis-exact-sm"),
    child("grow-0 shrink-1 basis-exact-xl"),
    child("grow-0 shrink-1 basis-exact-md"),
  ], { sm: 60, md: 120, xl: 240 });
  assert.deepEqual(widths, [40, 160, 80]);
});

test("a minimum freezes and redistributes the remaining deficit", async () => {
  const widths = await measureRow(240, [
    child("grow-0 shrink-1 basis-exact-lg min-width-xl"),
    child("grow-0 shrink-1 basis-exact-lg"),
    child("grow-0 shrink-1 basis-exact-lg"),
  ], { lg: 120, xl: 100 });
  assert.deepEqual(widths, [100, 70, 70]);
  assert.equal(widths.reduce((sum, value) => sum + value, 0), 240);
});

test("maximum violations freeze and redistribute surplus", async () => {
  const oneFreeze = await measureRow(500, [
    child("grow-1 shrink-1 basis-exact-md max-width-lg"),
    child("grow-1 shrink-1 basis-exact-md"),
    child("grow-1 shrink-1 basis-exact-md"),
  ], { md: 100, lg: 150 });
  assert.deepEqual(oneFreeze, [150, 175, 175]);

  const cascading = await measureRow(600, [
    child("grow-1 shrink-1 basis-exact-md max-width-lg"),
    child("grow-1 shrink-1 basis-exact-md max-width-lg"),
    child("grow-1 shrink-1 basis-exact-md"),
  ], { md: 100, lg: 120 });
  assert.deepEqual(cascading, [120, 120, 360]);
});

test("basis-content remains content-shaped rather than equal-width", async () => {
  const widths = await measureRow(680, [
    child("compressible basis-content", "OK"),
    child("compressible basis-content", "Open preferences"),
    child("compressible basis-content", "Hi"),
  ]);
  assert.equal(widths[1], Math.max(...widths));
  assert.ok(new Set(widths).size > 1);
});
