import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

import {
  buildCssFiles,
  compileCssManifest,
  validateCssManifest,
  type CssManifestV1,
} from "../adoption/build-css.ts";

const COMMIT = "1111111111111111111111111111111111111111";

const manifest: CssManifestV1 = {
  version: 1,
  elements: [
    { id: "plain", classString: "vertical", backing: [] },
    { id: "dial", classString: "grow-2 shrink-1", backing: [] },
    { id: "alias", classString: "elastic", backing: [] },
    { id: "responsive", classString: "viewport-landscape:horizontal", backing: [] },
    { id: "backed-state", classString: "selected", backing: ["aria-selected"] },
    { id: "facet", classString: "horizontal inline", backing: [] },
    { id: "mechanism", classString: "modal", backing: [] },
  ],
};

function compile(value: unknown, source = JSON.stringify(value)): ReturnType<typeof compileCssManifest> {
  return compileCssManifest(value, {
    ermineCommit: COMMIT,
    manifestSource: source,
    reproductionCommand: "fixture command",
  });
}

test("manifest bridge covers plain, dial, alias, exact responsive scope, backed state, facet, and mechanism", () => {
  const { css, metadata } = compile(manifest);
  assert.match(css, /\.vertical \{[^}]*display: flex;/s);
  assert.match(css, /\.grow-2 \{[^}]*flex-grow: 2;/s);
  assert.match(css, /\.shrink-1 \{[^}]*flex-shrink: 1;/s);
  assert.match(css, /\.elastic \{[^}]*flex-grow: 1;[^}]*flex-shrink: 1;/s);
  assert.match(css, /@media \(orientation: landscape\) \{/);
  assert.match(css, /\.viewport-landscape\\:horizontal \{/);
  assert.match(css, /condition state\.selection 'selected'/);
  assert.match(css, /\.horizontal\.inline \{[^}]*display: inline flex;/s);
  assert.match(css, /mechanism 'modal' → dialog\.showModal\(\)/);
  assert.equal(metadata.entryCount, 7);
  assert.equal(metadata.distinctWordCount, 9);
  assert.match(metadata.manifestSha256, /^[0-9a-f]{64}$/);
  assert.match(metadata.outputSha256, /^[0-9a-f]{64}$/);
});

test("named breakpoints remain visible when project-measured condition values are unavailable", () => {
  const { css } = compile({
    version: 1,
    elements: [{ id: "breakpoint", classString: "viewport-md:horizontal", backing: [] }],
  });
  assert.match(css, /scope 'viewport-md' needs a project condition binding/);
  assert.match(css, /'viewport-md:horizontal'/);
  assert.doesNotMatch(css, /@media \(.*md/);
});

test("canonical ID sorting makes equivalent entry orders byte-identical", () => {
  const forward = compile(manifest, JSON.stringify(manifest));
  const reversedValue = { ...manifest, elements: [...manifest.elements].reverse() };
  const reversed = compile(reversedValue, JSON.stringify(reversedValue));
  assert.equal(reversed.css, forward.css);
  assert.notEqual(reversed.metadata.manifestSha256, forward.metadata.manifestSha256);
});

test("duplicate IDs and normalized class strings are rejected", () => {
  assert.throws(() => validateCssManifest({
    version: 1,
    elements: [
      { id: "same", classString: "vertical", backing: [] },
      { id: "same", classString: "horizontal", backing: [] },
      { id: "third", classString: "  vertical  ", backing: [] },
    ],
  }), (error: Error) => {
    assert.match(error.message, /duplicate id 'same'/);
    assert.match(error.message, /duplicate class string 'vertical'/);
    return true;
  });
});

test("lint errors include entry ID plus the linter's verbatim rule and message", () => {
  assert.throws(() => validateCssManifest({
    version: 1,
    elements: [{ id: "conflict", classString: "horizontal vertical", backing: [] }],
  }), /entry 'conflict': one-word-per-axis: 'horizontal', 'vertical' conflict — all axis 'structure'/);
});

test("GAP blocks are rejected as reports rather than treated as CSS", () => {
  assert.throws(() => validateCssManifest({
    version: 1,
    elements: [{ id: "gap", classString: "GAP\nmissing: skin vocabulary", backing: [] }],
  }), /GAP blocks are reports, not CSS input/);
});

test("invalid input fails before output is written", async () => {
  const directory = resolve(tmpdir(), `ermine-u3-invalid-${process.pid}-${Date.now()}`);
  const manifestPath = resolve(directory, "elements.json");
  const outPath = resolve(directory, "ermine.generated.css");
  await mkdir(directory, { recursive: true });
  await writeFile(manifestPath, JSON.stringify({
    version: 1,
    elements: [{ id: "conflict", classString: "horizontal vertical", backing: [] }],
  }));

  await assert.rejects(buildCssFiles({ manifestPath, outPath, ermineCommit: COMMIT }), /one-word-per-axis/);
  await assert.rejects(readFile(outPath), (error: NodeJS.ErrnoException) => error.code === "ENOENT");
});

test("regenerate/check succeeds and output tampering makes check fail", async () => {
  const directory = resolve(tmpdir(), `ermine-u3-check-${process.pid}-${Date.now()}`);
  await mkdir(directory, { recursive: true });
  const manifestPath = resolve(directory, "elements.json");
  const outPath = resolve(directory, "ermine.generated.css");
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  await buildCssFiles({ manifestPath, outPath, ermineCommit: COMMIT });
  await buildCssFiles({ manifestPath, outPath, ermineCommit: COMMIT, check: true });
  const metadata = JSON.parse(await readFile(`${outPath}.meta.json`, "utf8"));
  assert.equal(metadata.ermineCommit, COMMIT);
  assert.equal(metadata.entryCount, manifest.elements.length);

  await writeFile(outPath, `${await readFile(outPath, "utf8")}/* tampered */\n`);
  await assert.rejects(
    buildCssFiles({ manifestPath, outPath, ermineCommit: COMMIT, check: true }),
    /missing, stale, or tampered/,
  );
});
