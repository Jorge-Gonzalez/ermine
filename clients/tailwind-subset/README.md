# Tailwind subset — a second vocabulary for the engine

This client encodes a deliberately small subset of Tailwind's utility
vocabulary as an engine registry and lets `createLinter` judge it — the same
parser and predicates that judge Ermine, with zero special-casing on either
side. It exists to demonstrate vocabulary-independence (B1) and one thesis:

> **The engine's algebra rejects, with a reason, what Tailwind resolves by
> source order.** Tailwind's conflict semantics live in the cascade and in
> heuristic tooling (`tailwind-merge`); the engine's live in the registry's
> declared structure. Where they disagree, this client encodes the natural
> structure and documents the divergence — bending the engine to reproduce
> cascade semantics would defeat the demonstration.

## What is encoded

| Axis | Words | Mechanism |
|---|---|---|
| `display` | `flex` `grid` `block` `inline-flex` `hidden` | plain closed axis |
| `flex-direction` | `flex-row` `flex-col` | plain closed axis |
| `gap` | `gap-0`…`gap-12` | parametric token over the `tw-spacing` scale |
| `padding` | `p-N`, `px-N`, `py-N` | `px`/`py` as sub-dials; `p-N` as the whole-axis form — the same dial/alias mechanism as Ermine's m2 |
| `width` | `w-N`, `w-full`, `w-auto` | closed axis with a parametric member |
| scopes | `sm:` `md:` `lg:` | environment scope prefixes, like Ermine's `viewport-<bp>:` |

Judge-only: there is no emission for this client, and no purity rulings
(`mustNeverTouch` is empty — no constitution governs this vocabulary).

## Deliberately absent

Everything else — colors, typography, position, flex sizing, state variants
(`hover:`), arbitrary values (`w-[13px]`), and the half-steps of the spacing
scale (`gap-0.5`). Full coverage is explicitly out of scope; the subset is the
demonstration.

## Divergence findings

1. **`p-4 px-2` — legal Tailwind, rejected here (the thesis case).** Tailwind
   resolves it by source order: `px-2` wins the x-sides, `p-4` keeps the
   y-sides. The natural encoding — `p-N` as a whole-axis value, `px`/`py` as
   sub-dials — makes the engine reject it: a whole-axis value fixes every
   dial, so a dial cannot also apply. The engine's answer to the intent is to
   say what you mean: `px-2 py-4`. This is not a bug in either system; it is
   the difference between cascade semantics and declared structure.
2. **Duplicate and conflicting utilities are errors, not dedupe fodder.**
   `tailwind-merge` exists because raw Tailwind strings accumulate
   contradictions that the cascade then resolves silently (`p-4 p-2` → last
   wins). The engine rejects the contradiction itself and names the axis.
3. **Where the two vocabularies agree by construction: scopes.** `gap-2
   md:gap-4` is lawful in both systems, because both treat the prefix as a
   separate condition scope rather than a conflicting word.
4. **Off-scale values get a reasoned diagnosis.** `gap-13` and `w-huge` are
   `bad-parameter` (shape recognized, value not sanctioned) rather than a
   generic unknown-word — the registry's scale is data the diagnosis can cite.

## Three worked examples

Each is reproduced verbatim by `test/tailwind-client.test.ts` — string, rule
id, and message.

**1. `flex-row flex-col`** — `tailwind-merge` keeps whichever comes last.
The engine:

```
one-word-per-axis: 'flex-row', 'flex-col' conflict — all axis 'flex-direction' in scope 'base'
```

**2. `sm:gap-2 sm:gap-4`** — same axis AND same scope, so the scope prefix
does not save it (contrast `gap-2 sm:gap-4`, which is lawful in both systems):

```
one-word-per-axis: 'sm:gap-2', 'sm:gap-4' conflict — all axis 'gap' in scope 'sm'
```

**3. `p-4 p-2`** — two whole-axis padding values; `tailwind-merge` resolves by
source order, the engine names the mechanism:

```
one-word-per-axis: 'p-4' is a whole-axis value (it fixes every dial of 'padding') — it cannot combine with 'p-2'. Use either the alias OR the numbered dials.
```

## Running it

```ts
import { createLinter, validateRegistry } from "../../engine/index.ts";
import { TAILWIND_SUBSET, TW_RECORDS, TW_SCOPES } from "./registry.ts";

const tw = createLinter(TW_RECORDS, TW_SCOPES);
tw.lint("p-4 px-2");            // → the thesis rejection above
validateRegistry(TAILWIND_SUBSET); // → [] (structurally well-formed)
```
