# Ermine

Ermine is a structural abstraction layer — a style specification that CSS implements. A typed, composable grammar: orthogonal axes (structure, spacing, sizing, state…) compose without conflict, each owning disjoint CSS properties. A constitution defines the rules, a registry mechanizes them, a linter checks well-formedness with reasons.

---

## The idea

You describe an interface by combining words from independent **axes** — how children arrange, how much space sits between them, whether an element grows, what condition it's in — and you pick at most one word per axis:

```html
<div class="horizontal gap-comfortable padding-relaxed">…</div>
```

That reads as a sentence: lay children out in a *row*, with *comfortable* space between them, and *relaxed* padding inside. Three axes, three words.

The axes compose without conflict because each one owns a **disjoint set of properties** and never touches another's. That isn't a convention you're trusted to follow — it's a property the linter checks. The name is the law: an ermine keeps its coat clean by refusing to touch what would stain it, and an Ermine axis does the same.

CSS is the first thing the grammar compiles to, not the limit of what it is. The artifact is the grammar; CSS is one implementation of it.

## Why a layer above CSS

Ordinary styling lets any rule touch any property, so two rules can quietly fight over the same one and nothing warns you. Ermine sits one level up: it reasons in concepts, and because the concepts own disjoint properties, the conflicts CSS happily lets you write can't be expressed — and when a string *is* malformed, the linter rejects it **with a reason**, which raw CSS gives you no way to do.

## How it's structured

Four layers, each derived from the one above it. The upstream document is the single source of truth; everything below is extracted from it.

| Layer | Artifact | Role |
|---|---|---|
| **Constitution** | `STYLE-GRAMMAR.md` | The legislated grammar and its laws. The single source of truth; every decision is recorded here with its reasoning. |
| **Registry** | `registry.ts` | Those laws as machine-readable data — the axes, members, tokens, and predicates. |
| **Spec** | `STYLE-GRAMMAR-SPEC.md` | The machine-consumer view: validation predicates for a linter, a generation contract for an LLM authoring inside the grammar. |
| **Guide** | `STYLE-GRAMMAR-GUIDE.md` | The human-facing teaching document — example-led, the common surface. |

The linter (`lint.ts`) decides whether a class string is well-formed and explains why; the authoring contract lets a generator emit only inside the grammar, never coining a word that doesn't exist.

## A taste of the laws

- **One word per axis, per condition scope.** Two words from the same axis is a conflict, not a composition. Conditions (like a responsive breakpoint) open a new scope, so the same axis may recur once per scope — which is how responsive layout works without a separate system.
- **Dimensional purity.** Free-regime axes touch disjoint property sets. This is *checked*, not asserted — the check has already caught real collisions and forced corrections.
- **Mint no new ontology.** Name the platform's existing distinctions (ARIA states, CSS features); never invent a word for something the platform doesn't already distinguish. When a wanted word doesn't exist, the rule is to stop and report the gap, not to coin one.
- **Compose, don't coin.** A felt gap is almost always a *composition* of existing axes, not a missing word. "Fill the parent" isn't one word — it's `expandable` (grow) + `self-stretch` (cross-axis).

## Status

**Extraction-stable.** The structure is settled enough to extract the spec, guide, and registry from, and no open item affects whether a class string is well-formed. Two axes of confidence are tracked separately:

- **Internal consistency — high, and executable.** The central composition law is no longer just asserted; a dimensional-purity predicate runs across all axes and passes (after two corrections it surfaced). The one-word-per-axis, state-entailment, weight-implies-direction, and arity laws run against audited components.
- **Empirical adequacy — validated for state, partial for the spatial core.** The state vocabulary was rebuilt on the full ARIA + CSS-UI surface and survived audits against seven dissimilar components. The spatial/layering/sizing axes pass the purity check and survived those audits by inspection, but their runtime *outcome* behaviour is not yet under browser tests. That's the remaining frontier, not a known defect.

A few value-slots remain open by intent (the scale generator, some tier-2 layer names, the breakpoint scale values). Anything marked `[RULING]` in the constitution is a value/name decision, not a structural one.

### What exists today

- The constitution, registry, machine-consumer spec, and human guide.
- A working parser and a core predicate set (`lint.ts`) that rejects malformed strings with reasons; the registry typechecks and the linter's checks pass.

### What's next

- Generate the spec from the registry (so "derived, don't edit here" is mechanically enforced).
- Generate the CSS implementation.
- Derive each axis's property list from the generated CSS, so the purity check becomes authoritative rather than indicative.
- Promote the audit/validation scripts to a committed test suite.

## A note on the name

An ermine is a small mustelid whose coat stays clean because it won't touch what would soil it. That's the whole system in one animal: an axis touches only the properties it owns, and the grammar composes cleanly as a result. No heraldry intended — just the animal, and the discipline it stands for.

## License

[MIT](./LICENSE). The ideas are not owned and cannot be — they're built on the work of others, as anyone's are. The license governs this particular text and code, and keeps the lineage honest. Build on it freely.
