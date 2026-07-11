// css.ts — the back-end: serialize authored class strings into real CSS text.
// This is the piece that turns the EmittedRule[] AST (emit.ts) into a stylesheet.
//
// JIT, not static-atomic — on purpose. The `display` FACET is the reason: a
// static `.horizontal{display:flex}` + `.inline{display:inline}` cannot express
// the merge (two `display` declarations on two classes; the cascade just picks
// the last). The two-value `display: <outer> <inner>` result only lives on a
// COMPOUND selector — `.horizontal.inline { display: inline flex }` — which only
// exists once you know the co-occurrence. So we compile the class strings
// actually authored (exactly as emit()/lint() do), merging per element.

import { emit } from "./emit.ts";
import type { FacetRule } from "./emitter-types.ts";
import { parseWord, type LintContext } from "./lint.ts";

// facet-role order for CSS's two-value `display: <outer> <inner>` syntax.
const FACET_ORDER: Record<string, number> = { outer: 0, inner: 1 };

// Merge the facet rules of ONE batch (one element's class string): group by
// property, order values by facet role, and hang the result on the compound
// selector built from the contributing words.
function mergeFacets(facets: FacetRule[]): { selector: string; property: string; value: string }[] {
  const byProp = new Map<string, FacetRule[]>();
  for (const f of facets) (byProp.get(f.property) ?? byProp.set(f.property, []).get(f.property)!).push(f);
  const out: { selector: string; property: string; value: string }[] = [];
  for (const [property, group] of byProp) {
    const ordered = [...group].sort((a, b) => (FACET_ORDER[a.facet] ?? 9) - (FACET_ORDER[b.facet] ?? 9));
    const selector = [...new Set(group.map((f) => f.selector))].join(""); // .horizontal + .inline -> .horizontal.inline
    out.push({ selector, property, value: ordered.map((f) => f.value).join(" ") });
  }
  return out;
}

// Build one stylesheet from many authored class strings. Atomic rules shared
// across elements dedup to a single block; facet/sink rules land on their
// compound selectors. Exact environment scopes become at-rules; breakpoint
// scopes without project-measured values, conditions, and mechanisms surface as
// trailing integration hints so nothing is silently dropped.
export function buildStylesheet(classStrings: string[], ctx: LintContext = {}): string {
  const bySelector = new Map<string, Map<string, string>>();
  const byCondition = new Map<string, Map<string, Map<string, string>>>();
  const notes: string[] = [];
  const put = (target: Map<string, Map<string, string>>, selector: string, prop: string, value: string) => {
    (target.get(selector) ?? target.set(selector, new Map()).get(selector)!).set(prop, value);
  };

  for (const cls of classStrings) {
    const groups = new Map<string, string[]>();
    for (const word of cls.trim().split(/\s+/).filter(Boolean)) {
      const scope = parseWord(word).scope;
      (groups.get(scope) ?? groups.set(scope, []).get(scope)!).push(word);
    }

    for (const [scope, authoredWords] of groups) {
      const base = scope === "base";
      const innerWords = base ? authoredWords : authoredWords.map((word) => word.slice(word.indexOf(":") + 1));
      // A platform interaction scope (R-STATE-10) serializes to a pseudo-class suffix and a
      // backed state scope (R-STATE-11) to an attribute suffix; both stay in the base cascade.
      // Environmental scopes become at-rules.
      const pseudo = base ? undefined : scopePseudo(scope) ?? scopeAttribute(scope);
      const condition = base || pseudo ? undefined : scopeCondition(scope);
      if (!base && !pseudo && !condition) {
        notes.push(`scope '${scope}' needs a project condition binding; no CSS emitted for ${authoredWords.map((word) => `'${word}'`).join(", ")}`);
        continue;
      }

      const target = base || pseudo
        ? bySelector
        : (byCondition.get(condition!) ?? byCondition.set(condition!, new Map()).get(condition!)!);
      const rules = emit(innerWords.join(" "), ctx, base ? undefined : scope);
      const scopedSelector = (selector: string): string => {
        if (base) return selector;
        const rewritten = innerWords.reduce(
          (current, word, index) => current.replaceAll(`.${word}`, classSelector(authoredWords[index])),
          selector,
        );
        return pseudo ? rewritten + pseudo : rewritten;
      };

      for (const m of mergeFacets(rules.filter((r): r is FacetRule => r.kind === "facet")))
        put(target, scopedSelector(m.selector), m.property, m.value);
      for (const r of rules) {
        if (r.kind === "declares" || r.kind === "reads")
          for (const [p, v] of Object.entries(r.declarations)) put(target, scopedSelector(r.selector), p, v);
        else if (r.kind === "condition")
          notes.push(`condition ${r.axis} '${base ? r.token : `${scope}:${r.token}`}' → ${r.selectorFragment}  (state-scoped emission: TODO)`);
        else if (r.kind === "mechanism")
          notes.push(`mechanism '${base ? r.token : `${scope}:${r.token}`}' → ${r.mechanism}  (no CSS)`);
      }
    }
  }

  const blocks = renderBlocks(bySelector);
  for (const [condition, selectors] of byCondition) {
    const inner = renderBlocks(selectors).map((block) => block.split("\n").map((line) => `  ${line}`).join("\n"));
    blocks.push(`${condition} {\n${inner.join("\n\n")}\n}`);
  }
  const noteBlock = notes.length
    ? `\n/* not CSS — integration hints:\n${[...new Set(notes)].map((n) => `   - ${n}`).join("\n")}\n*/\n`
    : "";
  return blocks.join("\n\n") + "\n" + noteBlock;
}

function renderBlocks(selectors: Map<string, Map<string, string>>): string[] {
  return [...selectors].map(([selector, decls]) =>
    `${selector} {\n${[...decls].map(([p, v]) => `  ${p}: ${v};`).join("\n")}\n}`);
}

function classSelector(word: string): string {
  return `.${word.replace(/([^a-zA-Z0-9_-])/g, "\\$1")}`;
}

// Breakpoint values are intentionally theme-measured, not registry constants.
// Only conditions whose platform query is fully determined by the authored
// prefix can be serialized without inventing a project decision.
function scopeCondition(scope: string): string | undefined {
  const exact: Record<string, string> = {
    "viewport-portrait": "@media (orientation: portrait)",
    "viewport-landscape": "@media (orientation: landscape)",
    "prefers-reduced-motion": "@media (prefers-reduced-motion: reduce)",
    "prefers-color-scheme-dark": "@media (prefers-color-scheme: dark)",
    "prefers-contrast-more": "@media (prefers-contrast: more)",
    "prefers-reduced-transparency": "@media (prefers-reduced-transparency: reduce)",
  };
  return exact[scope];
}

// Platform interaction scopes (R-STATE-10) the browser supplies with no project binding.
// They append a pseudo-class to the selector rather than wrapping it in an at-rule.
function scopePseudo(scope: string): string | undefined {
  const exact: Record<string, string> = { hover: ":hover", focus: ":focus" };
  return exact[scope];
}

// Backed state scopes (R-STATE-11) serialize to the backing attribute selector the
// container asserts — the same attribute the `selectable`/`selected` entailment implies.
// `current` (R-STATE-12) is backed by the element's own attribute; the :not guard keeps
// an explicit aria-current="false" from matching.
function scopeAttribute(scope: string): string | undefined {
  const exact: Record<string, string> = {
    selected: '[aria-selected="true"]',
    checked: '[aria-checked="true"]',
    current: '[aria-current]:not([aria-current="false"])',
  };
  return exact[scope];
}

// Convenience: serialize a single class string (tests, inspection).
export function toCss(classString: string, ctx: LintContext = {}): string {
  return buildStylesheet([classString], ctx);
}
