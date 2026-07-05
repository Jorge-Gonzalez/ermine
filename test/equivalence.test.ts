// D2 — surface equivalence is a permanent CI property.
//
// Each class string is written in toClassString's canonical order. Most pairs
// reuse A1 intent patterns, but canonical order can differ from the prose's
// presentation order (notably P07 and P16). The emitted AST comparison catches
// semantic divergence; the UTF-8 stylesheet comparison catches rule-order and
// serialization divergence.

import assert from "node:assert/strict";
import { test } from "node:test";

import { toCss } from "../src/css.ts";
import { emit } from "../src/emit.ts";
import type { ErmineProps } from "../surfaces/typed/ermine-props.generated.ts";
import { toClassString } from "../surfaces/typed/toClassString.ts";

interface EquivalenceFixture {
  name: string;
  classString: string;
  props: ErmineProps;
}

const FIXTURES: readonly EquivalenceFixture[] = [
  {
    name: "P01 stacked content",
    classString: "vertical gap-comfortable padding-relaxed",
    props: { structure: "vertical", gap: "comfortable", padding: "relaxed" },
  },
  {
    name: "P02 aligned header row",
    classString: "horizontal gap-snug align-center justify-between",
    props: { structure: "horizontal", gap: "snug", align: "align-center", justify: "justify-between" },
  },
  {
    name: "P04 structure plus m1 display facets",
    classString: "horizontal inline gap-tight padding-snug",
    props: { structure: "horizontal", flowParticipation: "inline", gap: "tight", padding: "snug" },
  },
  {
    name: "P07 whole-axis flex alias",
    classString: "vertical expandable gap-tight",
    props: { structure: "vertical", flex: "expandable", gap: "tight" },
  },
  {
    name: "P10 numeric flex dials",
    classString: "grow-2 shrink-0",
    props: { grow: 2, shrink: 0 },
  },
  {
    name: "P12 responsive structure",
    classString: "vertical viewport-md:horizontal",
    props: { structure: "vertical", viewportMd: { structure: "horizontal" } },
  },
  {
    name: "P13 preference-scoped treatment",
    classString: "prefers-color-scheme-dark:selection-strong",
    props: { prefersColorSchemeDark: { selectionTreatment: "selection-strong" } },
  },
  {
    name: "P16 layered scrolling popup",
    classString: "scroll-y max-height-md dropdown position-absolute isolate",
    props: {
      overflowY: "scroll-y",
      maxHeight: "md",
      zScale: "dropdown",
      positionMode: "position-absolute",
      stackingContext: "isolate",
    },
  },
  {
    name: "P06 selected-treatment sink",
    classString: "selectable selected selection-subtle",
    props: { selection: ["selectable", "selected"], selectionTreatment: "selection-subtle" },
  },
  {
    name: "P19 enumerated sort state",
    classString: "sorted-ascending",
    props: { sort: "sorted-ascending" },
  },
  {
    name: "P20 co-present validity states",
    classString: "required invalid",
    props: { validity: ["required", "invalid"] },
  },
  {
    name: "cross-axis motion sink",
    classString: "decelerate cascade",
    props: { motionMicro: "decelerate", motionMacro: "cascade" },
  },
];

test("D2 carries at least ten unique paired authorings", () => {
  assert.ok(FIXTURES.length >= 10);
  assert.equal(new Set(FIXTURES.map((fixture) => fixture.name)).size, FIXTURES.length);
  assert.equal(new Set(FIXTURES.map((fixture) => fixture.classString)).size, FIXTURES.length);
});

for (const fixture of FIXTURES) {
  test(`surface equivalence: ${fixture.name}`, () => {
    const typedClassString = toClassString(fixture.props);

    assert.equal(
      typedClassString,
      fixture.classString,
      "the paired class-string fixture must use the typed surface's canonical word order",
    );
    assert.deepEqual(
      emit(typedClassString),
      emit(fixture.classString),
      "both authoring surfaces must produce the same emitted rule AST",
    );
    assert.deepEqual(
      Buffer.from(toCss(typedClassString), "utf8"),
      Buffer.from(toCss(fixture.classString), "utf8"),
      "both authoring surfaces must serialize to byte-identical CSS",
    );
  });
}

test("the byte comparison is sensitive to noncanonical rule order", () => {
  const canonical = FIXTURES.find((fixture) => fixture.name === "P02 aligned header row")!;
  const reordered = "justify-between align-center gap-snug horizontal";
  assert.notDeepEqual(Buffer.from(toCss(reordered)), Buffer.from(toCss(canonical.classString)));
});
