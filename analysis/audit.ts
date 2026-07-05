import { readFile, writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import {
  type AuditMeasurements,
  type CssSource,
  formatPercent,
  measureCss,
  ratioPercent,
} from "./lib.ts";

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface PageCss {
  inline: CssSource[];
  stylesheets: string[];
}

export interface AuditDocument {
  slug: string;
  sources: CssSource[];
  measurements: AuditMeasurements;
  markdown: string;
}

const URL_PATTERN = /^https?:\/\//i;

function attributes(tag: string): Map<string, string> {
  const result = new Map<string, string>();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(tag))) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

export function extractPageCss(html: string, pageUrl: string): PageCss {
  const page = new URL(pageUrl);
  const inline: CssSource[] = [];
  const stylesheets: string[] = [];
  const seen = new Set<string>();

  const stylePattern = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
  let style: RegExpExecArray | null;
  while ((style = stylePattern.exec(html))) {
    inline.push({
      label: `inline style ${inline.length + 1}`,
      css: style[1],
      location: `${page.href}#inline-style-${inline.length + 1}`,
    });
  }

  const linkPattern = /<link\b[^>]*>/gi;
  let link: RegExpExecArray | null;
  while ((link = linkPattern.exec(html))) {
    const attrs = attributes(link[0]);
    const rel = (attrs.get("rel") ?? "").toLowerCase().split(/\s+/);
    const href = attrs.get("href")?.replace(/&amp;/g, "&");
    if (!rel.includes("stylesheet") || !href) continue;
    const url = new URL(href, page);
    if (url.origin !== page.origin || seen.has(url.href)) continue;
    seen.add(url.href);
    stylesheets.push(url.href);
  }
  return { inline, stylesheets };
}

async function fetchText(url: string, fetcher: Fetcher): Promise<{ response: Response; text: string }> {
  const response = await fetcher(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`Could not fetch ${url}: HTTP ${response.status}`);
  return { response, text: await response.text() };
}

async function loadUrl(input: string, fetcher: Fetcher): Promise<CssSource[]> {
  const { response, text } = await fetchText(input, fetcher);
  const finalUrl = response.url || input;
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("text/css") || new URL(finalUrl).pathname.toLowerCase().endsWith(".css")) {
    return [{ label: basename(new URL(finalUrl).pathname) || new URL(finalUrl).hostname, css: text, location: finalUrl }];
  }

  const discovered = extractPageCss(text, finalUrl);
  const linked = await Promise.all(discovered.stylesheets.map(async (url): Promise<CssSource> => {
    const fetched = await fetchText(url, fetcher);
    return {
      label: basename(new URL(url).pathname) || new URL(url).hostname,
      css: fetched.text,
      location: fetched.response.url || url,
    };
  }));
  const sources = [...discovered.inline, ...linked];
  if (!sources.length) throw new Error(`No inline or same-origin stylesheet CSS found at ${finalUrl}`);
  return sources;
}

export async function loadCssSources(inputs: readonly string[], fetcher: Fetcher = fetch): Promise<CssSource[]> {
  const groups = await Promise.all(inputs.map(async (input): Promise<CssSource[]> => {
    if (URL_PATTERN.test(input)) return loadUrl(input, fetcher);
    if (extname(input).toLowerCase() !== ".css") {
      throw new Error(`Local audit input must be a .css file: ${input}`);
    }
    const path = resolve(input);
    return [{ label: basename(path), css: await readFile(path, "utf8"), location: path }];
  }));
  return groups.flat();
}

function inputStem(input: string): string {
  if (URL_PATTERN.test(input)) {
    const url = new URL(input);
    const leaf = basename(url.pathname).replace(/\.[^.]+$/, "");
    return `${url.hostname}-${leaf || "page"}`;
  }
  return basename(input).replace(/\.[^.]+$/, "");
}

export function auditSlug(inputs: readonly string[]): string {
  const joined = inputs.map(inputStem).join("-").toLowerCase();
  const slug = joined.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);
  return slug || "css";
}

function topValues(values: Array<[number, number]>): string {
  return values.length
    ? values.slice(0, 12).map(([value, count]) => `${value}px (${count})`).join(", ")
    : "—";
}

export function renderAudit(slug: string, sources: readonly CssSource[], measurements = measureCss(sources, slug)): string {
  const scope = measurements.scope;
  const spacing = measurements.values.spacing;
  const size = measurements.values.size;
  const uncovered = [...scope.uncovered.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 12)
    .map(([family, count]) => `${family} (${count})`)
    .join(", ") || "—";
  const lines = [
    `# CSS scale audit — ${slug}`,
    "",
    "Limitations: computed styles not observed; JS-injected styles and CSS-in-JS are not extracted.",
    "Standing assumptions: rem→16px assumed; !important stripped.",
    "",
    "Inputs:",
    "",
    ...sources.map((source) => `- ${source.location}`),
    "",
    "## Layer 1 — property scope (does the grammar have a *concept* for the property?)",
    "",
    "Real-property FAMILY coverage (the ceiling on what an ingestor could express):",
    "",
    "| corpus | coverage | theme custom-props |",
    "|---|---|---|",
    `| ${slug} | ${formatPercent(ratioPercent(scope.covered, scope.real))} | ${formatPercent(ratioPercent(scope.custom, scope.total))} |`,
    "",
    `Declarations: ${scope.total} total; ${scope.real} real properties; ${scope.custom} theme custom properties.`,
    `Top uncovered families: ${uncovered}.`,
    "",
    "## Layer 2 — value distribution (do real values snap to a small scale?)",
    "",
    "### SPACING (gap/padding/margin)",
    "",
    "| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |",
    "|---|---|---|---|---|---|---|",
    `| ${slug} | ${spacing.rawLengths} | ${spacing.distinctLengths} | ${formatPercent(spacing.topCoverage(6))} | ` +
      `${formatPercent(spacing.topCoverage(12))} | ${formatPercent(spacing.gridAlignedShare)} | ${formatPercent(spacing.zeroShare)} |`,
    "",
    `Top spacing values: ${topValues(spacing.topValues)}.`,
    "",
    "### SIZE (width/height/min-max/basis)",
    "",
    "| | raw lengths | distinct | top-6 cover |",
    "|---|---|---|---|",
    `| ${slug} | ${size.rawLengths} | ${size.distinctLengths} | ${formatPercent(size.topCoverage(6))} |`,
    "",
    `Top size values: ${topValues(size.topValues)}.`,
  ];
  return `${lines.join("\n")}\n`;
}

export async function createAudit(inputs: readonly string[], fetcher: Fetcher = fetch): Promise<AuditDocument> {
  if (!inputs.length) throw new Error("ermine-audit requires at least one local .css path or http(s) URL");
  const slug = auditSlug(inputs);
  const sources = await loadCssSources(inputs, fetcher);
  const measurements = measureCss(sources, slug);
  return { slug, sources, measurements, markdown: renderAudit(slug, sources, measurements) };
}

async function main(): Promise<void> {
  const inputs = process.argv.slice(2);
  if (!inputs.length) {
    console.error("usage: tsx analysis/audit.ts <file.css|http(s)://url> [...]");
    process.exitCode = 1;
    return;
  }
  const audit = await createAudit(inputs);
  const output = resolve(`AUDIT-${audit.slug}.md`);
  await writeFile(output, audit.markdown);
  console.log(`wrote ${output}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
