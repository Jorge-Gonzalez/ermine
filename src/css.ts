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
import type { LintContext } from "./lint.ts";

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
// compound selectors. Conditions/mechanisms are not CSS — surfaced as a trailing
// comment so nothing is silently dropped (state-scoped emission is a follow-up).
export function buildStylesheet(classStrings: string[], ctx: LintContext = {}): string {
  const bySelector = new Map<string, Map<string, string>>();
  const notes: string[] = [];
  const put = (selector: string, prop: string, value: string) => {
    (bySelector.get(selector) ?? bySelector.set(selector, new Map()).get(selector)!).set(prop, value);
  };

  for (const cls of classStrings) {
    const rules = emit(cls, ctx);
    for (const m of mergeFacets(rules.filter((r): r is FacetRule => r.kind === "facet")))
      put(m.selector, m.property, m.value);
    for (const r of rules) {
      if (r.kind === "declares" || r.kind === "reads")
        for (const [p, v] of Object.entries(r.declarations)) put(r.selector, p, v);
      else if (r.kind === "condition")
        notes.push(`condition ${r.axis} '${r.token}' → ${r.selectorFragment}  (state-scoped emission: TODO)`);
      else if (r.kind === "mechanism")
        notes.push(`mechanism '${r.token}' → ${r.mechanism}  (no CSS)`);
    }
  }

  const blocks = [...bySelector].map(([selector, decls]) =>
    `${selector} {\n${[...decls].map(([p, v]) => `  ${p}: ${v};`).join("\n")}\n}`);
  const noteBlock = notes.length
    ? `\n/* not CSS — integration hints:\n${[...new Set(notes)].map((n) => `   - ${n}`).join("\n")}\n*/\n`
    : "";
  return blocks.join("\n\n") + "\n" + noteBlock;
}

// Convenience: serialize a single class string (tests, inspection).
export function toCss(classString: string, ctx: LintContext = {}): string {
  return buildStylesheet([classString], ctx);
}
