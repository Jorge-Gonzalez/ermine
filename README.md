# Ermine

**A typed, machine-checkable style registry — and the four things it makes possible.**

Ermine began as a structural style grammar for CSS: a small, closed vocabulary of
words like `horizontal gap-comfortable expandable`, where every word belongs to exactly
one axis, every axis owns a disjoint set of CSS properties, and a linter can judge any
composition — with reasons, not just verdicts.

What the project turned out to be is slightly larger than that. The grammar sits on a
typed registry (33 axes, executable predicates, generated documentation), and that
registry has four distinct consumers. Each is a subproject; two of them are useful even
if you never write an Ermine class.

## The four faces

**The grammar (A) — an LLM-native styling language.** A closed vocabulary plus a
verifier that returns *reasons* is exactly the shape a generate-verify loop needs:
a model emits, the linter rejects with an explanation, the explanation goes back into
context, and convergence is fast because the surface is small. The authoring contract
(compose, don't coin; stop and report gaps) is written for machine authors as much as
human ones.

**The engine (B) — a vocabulary-independent verifier.** The predicate machinery
(orthogonality, dimensional purity, entailment, scope discipline) doesn't care that the
words are `horizontal` and `snug`. Bring your own registry — your design tokens, or a
subset of an existing utility vocabulary — and the engine derives conflict detection
with explanations, from data rather than hand-maintained heuristics.

**The instrument (C) — a CSS measurement tool.** Before trusting its own scales, the
project measured real stylesheets: property-family coverage, scale adherence,
residual distributions. The findings are published in [`analysis/FINDINGS.md`](analysis/FINDINGS.md),
including the ones that cut against the project's assumptions. The instrument runs on
any CSS and is useful to people who never adopt the grammar.

**The surfaces (D) — one registry, multiple syntaxes.** The same registry compiles to
class strings (for HTML and LLMs), a typed-props API (for TypeScript, where the compiler
enforces one-word-per-axis), and the generated CSS — with an equivalence test asserting
that both authoring surfaces emit identical output.

The strategy, sequencing, and evidence gates for all four live in
[`docs/DIRECTION.md`](docs/DIRECTION.md).

## The idea in one example

```
card = "vertical gap-comfortable padded-relaxed elevation-raised"
```

Four words, four axes. `vertical` owns flow direction; `gap-comfortable` owns
inter-child spacing; each axis touches CSS properties no other axis touches — a
property the linter *proves* rather than asserts. `vertical horizontal` is rejected
with a reason (one word per axis). `gap-comfortable gap-tight` likewise. There is no
cascade-order tiebreaking because conflicts are inexpressible, not resolved.

## How the project is governed

The design is legislated in a constitution (`constitution/ERMINE.md`) organized as three
registers — normative law, explanatory rationale, decision history — connected by
stable IDs and typed references, with a document linter that fails the build on a
dangling reference or an unexplained ruling. Derived artifacts (the machine spec, the
guide's vocabulary tables, property-ownership sets) are generated from the registry
and CI-checked so they cannot drift. Design changes enter through one door: Gap
Reports, ruled on in the constitution, propagated by regeneration and impact analysis.

The same discipline the grammar applies to CSS — no two authorities touch the same
ground without an executable law saying who wins — applies to the project's own
documents.

## Status

Research, not a product. Honest ledger:

- **Internal consistency: high and executable.** The orthogonality and purity claims
  are runnable predicates; the test suite includes browser-level rendering checks.
- **Empirical adequacy: partial.** Audited against real component patterns; not yet
  proven by a full application built end-to-end. That build, and its gap log, is the
  current critical path.
- **Emission: partial.** The linter covers the full registry; CSS emission is being
  completed axis-by-axis, with every genuine design question recorded rather than
  improvised.

## Repository map

| Path | What it is |
|---|---|
| `constitution/ERMINE.md` | The constitution — normative rulings (source of truth) |
| `constitution/ERMINE-RATIONALE.md` | Why each ruling holds |
| `constitution/decisions/` | Append-only decision records |
| `src/registry.ts` | The typed axis registry |
| `src/lint.ts` / `src/emit.ts` | Verifier and emitter |
| `src/ERMINE-SPEC.md` | Shared machine schema and generated registry |
| `src/LINT-SPEC.md` / `src/LLM-AUTHORING.md` | Validator and authoring contracts |
| `src/ERMINE-GUIDE.md` | Human guide (generated word-list sections) |
| `analysis/` | The measurement instrument and findings |
| `demo/` | A rendered demo page |
| `docs/DIRECTION.md` | Strategy: the four subprojects, gates, and status |

## Name

An ermine changes its coat with the season while remaining the same animal — the
grammar's words stay constant while themes change what they render to.

## License

MIT.
