// U3 — deterministic manifest-to-CSS bridge for dynamic templates and Shadow
// Roots. The manifest is deliberately explicit: it preserves the per-element
// compositions that facet and sink emission require without pretending a
// literal-source scanner can discover runtime class construction.

import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildStylesheet } from "../src/css.ts";
import { lint, type LintContext } from "../src/lint.ts";

const execFile = promisify(execFileCallback);
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const COMPILER_INPUTS = [
  "adoption/build-css.ts",
  "src/css.ts",
  "src/emit.ts",
  "src/emitter-types.ts",
  "src/lint.ts",
  "src/registry.ts",
  "engine",
];

type JsonObject = Record<string, unknown>;

export interface CssManifestElementV1 {
  id: string;
  classString: string;
  backing: string[];
  context?: LintContext;
}

export interface CssManifestV1 {
  version: 1;
  elements: CssManifestElementV1[];
}

export interface CssBuildMetadataV1 {
  version: 1;
  ermineCommit: string;
  manifestSha256: string;
  outputSha256: string;
  entryCount: number;
  distinctWordCount: number;
  reproductionCommand: string;
}

export interface CompileManifestOptions {
  ermineCommit: string;
  manifestSource: string;
  reproductionCommand: string;
}

export interface CompiledManifest {
  manifest: CssManifestV1;
  css: string;
  metadata: CssBuildMetadataV1;
}

export interface BuildCssFilesOptions {
  manifestPath: string;
  outPath: string;
  check?: boolean;
  ermineCommit?: string;
  reproductionCommand?: string;
}

const ROOT_KEYS = new Set(["version", "elements"]);
const ELEMENT_KEYS = new Set(["id", "classString", "backing", "context"]);
const CONTEXT_KEYS = new Set(["elementId", "containerAttrs", "parentClasses"]);
const COMMIT = /^[0-9a-f]{40}$/;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectUnknown(value: JsonObject, allowed: Set<string>, path: string, errors: string[]): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${path}.${key}: unknown field in manifest version 1`);
  }
}

function nonEmptyString(value: unknown, path: string, errors: string[]): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path}: expected a non-empty string`);
    return undefined;
  }
  return value.trim();
}

function validateContext(value: unknown, path: string, errors: string[]): LintContext | undefined {
  if (!isObject(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  rejectUnknown(value, CONTEXT_KEYS, path, errors);
  const output: LintContext = {};
  if (value.elementId !== undefined) {
    const elementId = nonEmptyString(value.elementId, `${path}.elementId`, errors);
    if (elementId) output.elementId = elementId;
  }
  if (value.parentClasses !== undefined) {
    const parentClasses = nonEmptyString(value.parentClasses, `${path}.parentClasses`, errors);
    if (parentClasses) output.parentClasses = parentClasses.replace(/\s+/g, " ");
  }
  if (value.containerAttrs !== undefined) {
    if (!isObject(value.containerAttrs)) {
      errors.push(`${path}.containerAttrs: expected an object of string values`);
    } else {
      const attributes: Record<string, string> = {};
      for (const [key, item] of Object.entries(value.containerAttrs)) {
        if (key.trim() === "" || typeof item !== "string") {
          errors.push(`${path}.containerAttrs.${key || "<empty>"}: expected a string value`);
        } else {
          attributes[key] = item;
        }
      }
      output.containerAttrs = attributes;
    }
  }
  return output;
}

export function validateCssManifest(value: unknown): CssManifestV1 {
  const errors: string[] = [];
  if (!isObject(value)) throw new Error("manifest: expected an object");
  rejectUnknown(value, ROOT_KEYS, "manifest", errors);
  if (value.version !== 1) errors.push("manifest.version: expected exactly 1");
  if (!Array.isArray(value.elements)) errors.push("manifest.elements: expected an array");

  const elements: CssManifestElementV1[] = [];
  const ids = new Map<string, number>();
  const classStrings = new Map<string, number>();
  if (Array.isArray(value.elements)) value.elements.forEach((item, index) => {
    const path = `manifest.elements[${index}]`;
    if (!isObject(item)) {
      errors.push(`${path}: expected an object`);
      return;
    }
    rejectUnknown(item, ELEMENT_KEYS, path, errors);
    const id = nonEmptyString(item.id, `${path}.id`, errors);
    const sourceClassString = nonEmptyString(item.classString, `${path}.classString`, errors);
    const classString = sourceClassString?.replace(/\s+/g, " ");
    if (classString && /^GAP(?:\s|$)/.test(classString)) {
      errors.push(`${path}.classString: GAP blocks are reports, not CSS input`);
    }

    const backing: string[] = [];
    if (!Array.isArray(item.backing)) {
      errors.push(`${path}.backing: expected an array of strings`);
    } else {
      const seen = new Set<string>();
      item.backing.forEach((entry, backingIndex) => {
        const normalized = nonEmptyString(entry, `${path}.backing[${backingIndex}]`, errors);
        if (!normalized) return;
        if (seen.has(normalized)) errors.push(`${path}.backing[${backingIndex}]: duplicate backing '${normalized}'`);
        else { seen.add(normalized); backing.push(normalized); }
      });
    }

    const context = item.context === undefined
      ? undefined
      : validateContext(item.context, `${path}.context`, errors);
    if (!id || !classString) return;

    const firstId = ids.get(id);
    if (firstId !== undefined) errors.push(`${path}.id: duplicate id '${id}' (first used at manifest.elements[${firstId}])`);
    else ids.set(id, index);
    const firstClassString = classStrings.get(classString);
    if (firstClassString !== undefined) {
      errors.push(`${path}.classString: duplicate class string '${classString}' (first used at manifest.elements[${firstClassString}])`);
    } else classStrings.set(classString, index);

    elements.push({ id, classString, backing, ...(context ? { context } : {}) });
  });

  if (errors.length) throw new Error(errors.join("\n"));

  const lintErrors: string[] = [];
  for (const element of elements) {
    for (const issue of lint(element.classString, new Set(element.backing), element.context ?? {})) {
      if (issue.level === "error") lintErrors.push(`entry '${element.id}': ${issue.rule}: ${issue.msg}`);
    }
  }
  if (lintErrors.length) throw new Error(lintErrors.join("\n"));

  return { version: 1, elements };
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function compileCssManifest(value: unknown, options: CompileManifestOptions): CompiledManifest {
  if (!COMMIT.test(options.ermineCommit)) {
    throw new Error("ermineCommit: expected a 40-character lowercase hexadecimal commit");
  }
  const manifest = validateCssManifest(value);
  const elements = [...manifest.elements].sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
  const body = buildStylesheet(elements.map((element) => element.classString));
  const css = `/* GENERATED by Ermine adoption/build-css.ts at ${options.ermineCommit}; do not edit. */\n\n${body}`;
  const words = new Set(elements.flatMap((element) => element.classString.split(/\s+/)));
  const metadata: CssBuildMetadataV1 = {
    version: 1,
    ermineCommit: options.ermineCommit,
    manifestSha256: sha256(options.manifestSource),
    outputSha256: sha256(css),
    entryCount: elements.length,
    distinctWordCount: words.size,
    reproductionCommand: options.reproductionCommand,
  };
  return { manifest: { version: 1, elements }, css, metadata };
}

function slash(path: string): string {
  return path.split(sep).join("/");
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function defaultCommand(manifestPath: string, outPath: string): string {
  return `node --import tsx adoption/build-css.ts --manifest ${shellQuote(manifestPath)} --out ${shellQuote(outPath)}`;
}

async function compilerCommit(): Promise<string> {
  const status = await execFile("git", ["status", "--porcelain", "--", ...COMPILER_INPUTS], { cwd: REPOSITORY_ROOT });
  if (status.stdout.trim()) {
    throw new Error("Manifest compiler sources are uncommitted; commit the compiler before recording provenance");
  }
  const commit = await execFile("git", ["log", "-1", "--format=%H", "--", ...COMPILER_INPUTS], { cwd: REPOSITORY_ROOT });
  return commit.stdout.trim();
}

function metadataPath(outPath: string): string {
  return `${outPath}.meta.json`;
}

async function assertCurrent(path: string, expected: string): Promise<void> {
  const current = await readFile(path, "utf8").catch((cause: NodeJS.ErrnoException) => {
    if (cause.code === "ENOENT") return "";
    throw cause;
  });
  if (current !== expected) throw new Error(`${slash(path)} is missing, stale, or tampered; regenerate without --check`);
}

export async function buildCssFiles(options: BuildCssFilesOptions): Promise<CompiledManifest> {
  const manifestPath = resolve(options.manifestPath);
  const outPath = resolve(options.outPath);
  const manifestSource = await readFile(manifestPath, "utf8");
  let value: unknown;
  try { value = JSON.parse(manifestSource); }
  catch (cause) { throw new Error(`Invalid JSON in ${slash(manifestPath)}: ${(cause as Error).message}`); }

  const command = options.reproductionCommand ?? defaultCommand(options.manifestPath, options.outPath);
  const compiled = compileCssManifest(value, {
    ermineCommit: options.ermineCommit ?? await compilerCommit(),
    manifestSource,
    reproductionCommand: command,
  });
  const metadata = `${JSON.stringify(compiled.metadata, null, 2)}\n`;

  if (options.check) {
    await assertCurrent(outPath, compiled.css);
    await assertCurrent(metadataPath(outPath), metadata);
  } else {
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, compiled.css);
    await writeFile(metadataPath(outPath), metadata);
  }
  return compiled;
}

interface CliOptions { manifestPath: string; outPath: string; check: boolean }

function parseCli(args: string[]): CliOptions {
  let manifestPath: string | undefined;
  let outPath: string | undefined;
  let check = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--check" && !check) check = true;
    else if (argument === "--manifest" && !manifestPath && args[index + 1] && !args[index + 1].startsWith("--")) manifestPath = args[++index];
    else if (argument === "--out" && !outPath && args[index + 1] && !args[index + 1].startsWith("--")) outPath = args[++index];
    else throw new Error("usage: build-css.ts --manifest <elements.json> --out <ermine.generated.css> [--check]");
  }
  if (!manifestPath || !outPath) {
    throw new Error("usage: build-css.ts --manifest <elements.json> --out <ermine.generated.css> [--check]");
  }
  return { manifestPath, outPath, check };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  await buildCssFiles(options);
  console.log(`${options.check ? "current" : "wrote"} ${slash(relative(REPOSITORY_ROOT, resolve(options.outPath)))}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
