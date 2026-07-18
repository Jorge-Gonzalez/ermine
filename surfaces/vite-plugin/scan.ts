// surfaces/vite-plugin/scan.ts — the pure scanning core (no Vite import, so
// the acceptance fixtures test it directly in the main suite).
//
// Scanning is deliberately conservative: literal `class="…"` / `className='…'`
// / `className={`…`}` attribute values only, split on whitespace. Dynamic
// class expressions are invisible (a stated false-negative risk — README).
// Candidates resolve through the real parser; unknown words are SILENTLY
// ignored — they belong to other systems on the page and are never an error.
//
// Each class attribute is ONE element's word set. That granularity is
// load-bearing: facet compounds (`horizontal inline` → `display: inline flex`
// on `.horizontal.inline`) only exist per element, so collecting single words
// globally would silently drop them. Elements dedupe as whole strings.

import { expandCombineParagraph, type CombineDocument } from "../../src/combines.ts";
import { lint, parseWord, type Issue } from "../../src/lint.ts";

export interface ScanSource { file: string; content: string }
export interface ScanWarning { file: string; classAttribute: string; issues: Issue[] }
export interface ScanOptions { combines?: CombineDocument }
export interface ScanResult {
  // deduped per-element strings of RESOLVED words, in first-seen order
  elements: string[];
  warnings: ScanWarning[];
}

// literal class/className attribute values; template literals only when they
// carry no interpolation (a `${` makes the value dynamic and invisible).
const CLASS_ATTRIBUTE = /(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`$]*)`\s*\})/g;

// P8/P8b assert runtime DOM truths (aria attributes, container pointers) that
// a static markup scan cannot see; warning on them would flag every lawful
// state word. Same filter as the typed surface's dev gate (ENFORCEMENT.md).
const RUNTIME_OBLIGATION_RULES = new Set(["state-entailment", "state-entailment-relational"]);

export function classAttributes(content: string): string[] {
  return [...content.matchAll(CLASS_ATTRIBUTE)]
    .map((m) => m[1] ?? m[2] ?? m[3] ?? "")
    .filter((value) => value.trim().length > 0);
}

function combineNames(document: CombineDocument | undefined): Set<string> {
  return new Set(document?.combines.map((combine) => combine.name) ?? []);
}

function lintResolved(element: string, options: ScanOptions): Issue[] {
  const issues = options.combines
    ? expandCombineParagraph(element, options.combines).lint
    : lint(element);
  return issues.filter((issue) => issue.level === "error" && !RUNTIME_OBLIGATION_RULES.has(issue.rule));
}

export function scanSources(sources: readonly ScanSource[], options: ScanOptions = {}): ScanResult {
  const seen = new Set<string>();
  const elements: string[] = [];
  const warnings: ScanWarning[] = [];
  const combines = combineNames(options.combines);

  for (const source of sources) {
    for (const attribute of classAttributes(source.content)) {
      const resolved = attribute.split(/\s+/).filter((word) =>
        word && (parseWord(word).axis !== null || combines.has(word)));
      if (!resolved.length) continue;
      const element = resolved.join(" ");
      if (seen.has(element)) continue;
      seen.add(element);
      elements.push(element);

      const issues = lintResolved(element, options);
      if (issues.length) warnings.push({ file: source.file, classAttribute: attribute, issues });
    }
  }
  return { elements, warnings };
}

export function formatWarning(warning: ScanWarning): string {
  const reasons = warning.issues.map((issue) => `${issue.rule}: ${issue.msg}`).join("; ");
  return `[ermine] ${warning.file}: class "${warning.classAttribute}" — ${reasons}`;
}
