import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { orderParagraph } from "../src/format-paragraph.ts";

const REPOSITORY_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist", "coverage", "build"]);
const MARKUP_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js", ".html"]);
const STYLE_SMOKE_FIXTURE = "tests/style-smoke-fixture.ts";

interface CliOptions {
  project: string;
  check: boolean;
}

interface RewriteStats {
  scanned: number;
  rewritten: number;
  skippedTemplates: number;
  changedFiles: string[];
}

function slash(path: string): string {
  return path.split(sep).join("/");
}

function isTestFile(file: string): boolean {
  return /(^|\/)(__tests__|test|tests)(\/|$)/.test(file) || /\.(test|spec)\.[^.]+$/.test(file);
}

function includeMarkupFile(file: string): boolean {
  return !isTestFile(file) || file === STYLE_SMOKE_FIXTURE;
}

async function walkMarkup(root: string): Promise<string[]> {
  const output: string[] = [];
  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) {
        const dot = entry.name.lastIndexOf(".");
        if (dot >= 0 && MARKUP_EXTENSIONS.has(entry.name.slice(dot))) output.push(path);
      }
    }
  }
  await visit(root);
  return output;
}

function parseCli(args: string[]): CliOptions {
  const projectIndex = args.indexOf("--project");
  const project = projectIndex >= 0 ? args[projectIndex + 1] : undefined;
  const check = args.includes("--check");
  if (!project) throw new Error("usage: format-paragraphs.ts --project <path> [--check]");
  return { project: resolve(project), check };
}

function rewriteQuotedAttributes(source: string): { source: string; count: number } {
  let count = 0;
  const next = source.replace(/\b(class(?:Name)?)\s*=\s*(["'])([\s\S]*?)\2/g, (whole, name: string, quote: string, value: string) => {
    const ordered = orderParagraph(value);
    if (ordered === value) return whole;
    count += 1;
    return `${name}=${quote}${ordered}${quote}`;
  });
  return { source: next, count };
}

function splitLeadingTemplate(template: string): { leading: string; rest: string; skipped: boolean } {
  const start = template.indexOf("${");
  if (start < 0) return { leading: template, rest: "", skipped: false };
  if (start > 0 && !/\s$/.test(template.slice(0, start))) return { leading: template, rest: "", skipped: true };

  let index = start + 2;
  let depth = 1;
  while (index < template.length && depth > 0) {
    const char = template[index];
    if (char === "\\" && index + 1 < template.length) {
      index += 2;
      continue;
    }
    if (char === "{") depth += 1;
    else if (char === "}") depth -= 1;
    index += 1;
  }
  return { leading: template.slice(0, start), rest: template.slice(start), skipped: false };
}

function rewriteTemplateAttributes(source: string): { source: string; count: number; skipped: number } {
  let count = 0;
  let skipped = 0;
  const next = source.replace(/\b(class(?:Name)?)\s*=\s*\{\s*`([\s\S]*?)`\s*\}/g, (whole, name: string, template: string) => {
    const split = splitLeadingTemplate(template);
    if (split.skipped) {
      skipped += 1;
      return whole;
    }
    const trailing = /\s$/.test(split.leading) ? " " : "";
    const ordered = orderParagraph(split.leading);
    const nextLeading = ordered ? `${ordered}${trailing}` : split.leading;
    const nextTemplate = `${nextLeading}${split.rest}`;
    if (nextTemplate === template) return whole;
    count += 1;
    return `${name}={\`${nextTemplate}\`}`;
  });
  return { source: next, count, skipped };
}

function rewriteMarkupSource(source: string): { source: string; rewritten: number; skippedTemplates: number } {
  const templates = rewriteTemplateAttributes(source);
  const quoted = rewriteQuotedAttributes(templates.source);
  return {
    source: quoted.source,
    rewritten: templates.count + quoted.count,
    skippedTemplates: templates.skipped,
  };
}

function rewriteManifestValue(value: unknown): { value: unknown; count: number } {
  if (Array.isArray(value)) {
    let count = 0;
    const array = value.map((item) => {
      const rewritten = rewriteManifestValue(item);
      count += rewritten.count;
      return rewritten.value;
    });
    return { value: array, count };
  }
  if (!value || typeof value !== "object") return { value, count: 0 };
  let count = 0;
  const next: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if ((key === "classString" || key === "parentClasses") && typeof item === "string") {
      const ordered = orderParagraph(item);
      next[key] = ordered;
      if (ordered !== item) count += 1;
      continue;
    }
    const rewritten = rewriteManifestValue(item);
    next[key] = rewritten.value;
    count += rewritten.count;
  }
  return { value: next, count };
}

async function rewriteFile(path: string, projectRoot: string, check: boolean): Promise<{ changed: boolean; rewritten: number; skippedTemplates: number }> {
  const before = await readFile(path, "utf8");
  const relativePath = slash(relative(projectRoot, path));
  const result = relativePath === "ermine.elements.json"
    ? (() => {
        const rewritten = rewriteManifestValue(JSON.parse(before));
        return {
          source: `${JSON.stringify(rewritten.value, null, 2)}\n`,
          rewritten: rewritten.count,
          skippedTemplates: 0,
        };
      })()
    : rewriteMarkupSource(before);
  if (result.source === before) return { changed: false, rewritten: result.rewritten, skippedTemplates: result.skippedTemplates };
  if (!check) await writeFile(path, result.source);
  return { changed: true, rewritten: result.rewritten, skippedTemplates: result.skippedTemplates };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const scanRoot = existsSync(resolve(options.project, "src")) ? resolve(options.project, "src") : options.project;
  const markup = (await walkMarkup(scanRoot))
    .filter((path) => includeMarkupFile(slash(relative(options.project, path))));
  const fixture = resolve(options.project, STYLE_SMOKE_FIXTURE);
  if (existsSync(fixture) && !markup.includes(fixture)) markup.push(fixture);
  const manifest = resolve(options.project, "ermine.elements.json");
  const files = existsSync(manifest) ? [...markup, manifest] : markup;
  const stats: RewriteStats = { scanned: files.length, rewritten: 0, skippedTemplates: 0, changedFiles: [] };

  for (const path of files) {
    const result = await rewriteFile(path, options.project, options.check);
    stats.rewritten += result.rewritten;
    stats.skippedTemplates += result.skippedTemplates;
    if (result.changed) stats.changedFiles.push(slash(relative(options.project, path)));
  }

  console.log(`paragraph formatter: scanned ${stats.scanned} files, rewrote ${stats.rewritten} strings, skipped ${stats.skippedTemplates} templates`);
  if (options.check && stats.changedFiles.length) {
    console.error(`paragraph formatter check failed; run without --check:\n${stats.changedFiles.map((file) => `  ${file}`).join("\n")}`);
    process.exitCode = 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
