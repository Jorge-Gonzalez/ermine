// typed-surface.test.ts — D1 acceptance. (a) One valid props example per axis
// shape round-trips through toClassString → lint with zero errors (state cases
// lint with their declared P8 backing, mirroring the authoring contract's
// convention). (b) Every ENCODED exclusion has a @ts-expect-error case — the
// suppression only passes typecheck if the type actually rejects, so
// `npm run typecheck` is itself the assertion.

import { test } from "node:test";
import assert from "node:assert/strict";

import { lint } from "../src/lint.ts";
import { toClassString } from "../surfaces/typed/toClassString.ts";
import type { ErmineProps } from "../surfaces/typed/ermine-props.generated.ts";

const roundTrips: { name: string; props: ErmineProps; expect: string; backing?: string[] }[] = [
  { name: "plain closed axes", props: { structure: "horizontal", flowParticipation: "boxed" }, expect: "horizontal boxed" },
  { name: "scale-step props (density, padding whole-axis)", props: { structure: "vertical", gap: "md", padding: "lg" }, expect: "vertical gap-md padding-lg" },
  { name: "step dials compose (padding sides)", props: { paddingInline: "sm", paddingBlock: "xs" }, expect: "padding-inline-sm padding-block-xs" },
  { name: "numeric dials (m2)", props: { grow: 2, shrink: 0 }, expect: "grow-2 shrink-0" },
  { name: "whole-axis alias (m2)", props: { flex: "elastic", selfSize: "basis-ratio" }, expect: "elastic basis-ratio" },
  { name: "parametric member (m3 size step)", props: { flex: "rigid", selfSize: "basis-exact-md" }, expect: "rigid basis-exact-md" },
  { name: "parametric integer member (m5)", props: { gridPlacement: "span-3" }, expect: "span-3" },
  { name: "independent step dials (constraints)", props: { minWidth: "sm", maxWidth: "xl" }, expect: "min-width-sm max-width-xl" },
  { name: "word dials (alignment)", props: { align: "align-center", justify: "justify-between" }, expect: "align-center justify-between" },
  { name: "whole-axis overflow", props: { overflow: "scroll-auto" }, expect: "scroll-auto" },
  { name: "overflow dials compose", props: { overflowX: "scroll-x", overflowY: "scroll-y" }, expect: "scroll-x scroll-y" },
  { name: "exclusivity-one state group", props: { disclosure: "expanded" }, expect: "expanded", backing: ["aria-expanded"] },
  { name: "exclusivity-many state group as array", props: { validity: ["required", "invalid"] }, expect: "required invalid", backing: ["aria-required", "aria-invalid"] },
  { name: "enumerated state member", props: { sort: "sorted-ascending" }, expect: "sorted-ascending", backing: ["aria-sort=ascending"] },
  { name: "capability + conditioned skin", props: { selection: ["selectable", "selected"], selectionTreatment: "selection-subtle" }, expect: "selectable selected selection-subtle", backing: ["aria-selected"] },
  { name: "environment scope", props: { structure: "vertical", viewportMd: { structure: "horizontal" } }, expect: "vertical viewport-md:horizontal" },
  { name: "preference scope", props: { prefersColorSchemeDark: { selectionTreatment: "selection-strong" } }, expect: "prefers-color-scheme-dark:selection-strong" },
];

for (const { name, props, expect, backing } of roundTrips) {
  test(`round-trip: ${name}`, () => {
    const result = toClassString(props);
    assert.equal(result, expect);
    const errors = lint(result, new Set(backing ?? []), {}).filter((issue) => issue.level === "error");
    assert.deepEqual(errors, [], errors.map((issue) => `${issue.rule}: ${issue.msg}`).join("; "));
  });
}

test("canonical order is descriptor order, not props-literal order", () => {
  assert.equal(
    toClassString({ gap: "md", structure: "horizontal" }),
    "horizontal gap-md",
  );
});

test("the dev gate throws on values the types cannot bound (P3 numeric dials)", () => {
  assert.throws(() => toClassString({ grow: 1.5 }), /bad-parameter/);
});

test("the dev gate throws on registry conflicts the many-group arrays admit (P1 leak)", () => {
  assert.throws(
    () => toClassString({ selection: ["selected", "checked-mixed"] }),
    /state-conflict/,
  );
});

// ---------------------------------------------------------------------------
// (b) compile-time rejections — one @ts-expect-error per ENCODED exclusion.
// A suppression that stops erroring fails `npm run typecheck`, so these lines
// are assertions, not comments. `accepts` is never called; only checked.
// ---------------------------------------------------------------------------
const accepts = (props: ErmineProps): ErmineProps => props;

export const compileRejections = [
  // @ts-expect-error P5/XOR: a whole-axis m2 alias cannot combine with a dial
  accepts({ flex: "elastic", grow: 2 }),
  // @ts-expect-error P5/XOR: whole-axis padding cannot combine with a side dial
  accepts({ padding: "sm", paddingInline: "xs" }),
  // @ts-expect-error P5/XOR: whole-axis margin cannot combine with a side dial
  accepts({ margin: "xl", marginBlock: "sm" }),
  // @ts-expect-error P5/XOR: whole-axis overflow cannot combine with an axis dial
  accepts({ overflow: "clip", overflowX: "scroll-x" }),
  // @ts-expect-error P2/coining: `rows` was retired (compose `horizontal wrap-allowed`)
  accepts({ structure: "rows" }),
  // @ts-expect-error P3: a raw length is not a density step
  accepts({ gap: "16px" }),
  // @ts-expect-error P4: an enumerated state word cannot be written bare
  accepts({ sort: "sorted" }),
  // @ts-expect-error P1: an exclusivity-"one" group holds a single word, never an array
  accepts({ disclosure: ["expanded", "open"] }),
  // @ts-expect-error scopes hold BASE props only — a scope cannot nest a scope
  accepts({ viewportMd: { viewportSm: { structure: "horizontal" } } }),
  // @ts-expect-error P9/coining: unknown props do not exist on the surface
  accepts({ skinTone: "warm" }),
];
