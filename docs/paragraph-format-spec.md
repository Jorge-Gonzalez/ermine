# Implementation spec — the paragraph formatter

Executable specification for an implementing agent. Read it whole before writing code.

## What it is

A formatter (Prettier-shaped, not a linter) that rewrites every Ermine class paragraph
into one canonical word order. Authors type words in any order; the formatter normalizes
on save/commit; CI runs it in `--check` mode like every other generated artifact.

## The goal (do not miss it)

Paragraphs are read far more often than written, but a ~20-word paragraph is scanned, not
read — and today the same sentence can be spelled in any order, so the reader can't build
positional habits ("skin words live at the end") and diffs churn when words are appended.
The fix must cost the author **nothing**: no order to memorize, no lint nag. Therefore:

- **The machine writes the order; the human never does.** The canonical order is *derived
  from the registry* — every word already knows its axis, every axis its plane — so
  ordering is an extraction, like the spec and the guide, per R-DOC-01: nothing downstream
  invents what the constitution doesn't say. There is no hand-maintained order table.
- Formatting must be **idempotent**, **token-preserving** (never add, drop, or rewrite a
  token — only reorder), and **safe on dynamic strings** (never reorder across an
  interpolation).

## Canonical order

Within one class string, three segments, in order:

1. **Identity tokens** — anything `parseWord(token).axis` cannot resolve (component hooks
   like `macro-search-item-edit`). Preserve their *original relative order*, first.
2. **Base words** (scope `base`), sorted by `(planeRank, axisRank, wordRank)`:
   - `planeRank`: the order of the sibling groups as the registry composes `REGISTRY`
     (layout → layering → motion/animation → state → skin). Derive from the first index at
     which each `sibling` value appears in `REGISTRY` — do not hardcode the list.
   - `axisRank`: the axis's index in `REGISTRY` (registry order is constitution order).
   - `wordRank`: for scale words, the step's index in its scale/valueSpace; otherwise
     alphabetical. Tie-break: original position (stable sort).
3. **Scoped words** (`hover:`, `focus:`, `selected:`, `checked:`, `current:`,
   `parent-hover:`, `parent-selected:`, environmental scopes), grouped by scope. Scope
   group order: `INTERACTION_SCOPES` then `STATE_SCOPES` then `RELATIONAL_SCOPES` then
   `ENVIRONMENT_SCOPES`, each in its array order — again derived by import, not
   hardcoded. Within a group, the inner word sorts by the base-word rules.

Duplicates: preserve verbatim in place of first occurrence (they are lint's business, not
the formatter's). Unknown-but-scoped tokens (e.g. a typo'd `hover:grond`): treat as
identity tokens — never guess.

## Main steps

### Step 1 — the pure function (in ermine)

`src/format-paragraph.ts`, exporting:

```ts
export function orderParagraph(classString: string): string
```

- Tokenize on whitespace; classify each token via `parseWord` (import from `src/lint.ts`).
- Build the rank tables at module load from `REGISTRY`, `INTERACTION_SCOPES`,
  `STATE_SCOPES`, `RELATIONAL_SCOPES`, `ENVIRONMENT_SCOPES` (imports from
  `src/registry.ts`). No literal axis or scope names may appear in this file — if you find
  yourself typing `"skin-ground"`, you are hardcoding what must be derived.
- Return single-space-joined result. Whitespace normalization is in scope; case is not.

Tests (`test/format-paragraph.test.ts`), all mandatory:
- **Idempotence**: `orderParagraph(orderParagraph(s)) === orderParagraph(s)` over every
  class string harvested from the Monky fixture (import it as a corpus, or inline ~10
  real paragraphs).
- **Token preservation**: sorted token multiset unchanged.
- **Identity-first**: `orderParagraph("ink foo-hook horizontal")` puts `foo-hook` first.
- **Scope grouping**: base before `hover:` before `selected:` before `parent-hover:`.
- **Derivation guard**: adding a fake axis to a copy of the vocabulary must not require
  editing the formatter (structural test: the rank table's size equals `REGISTRY.length`).

### Step 2 — the rewriter CLI

`adoption/format-paragraphs.ts` (it is an adoption-side tool: it edits *project* files):

```
node --import tsx adoption/format-paragraphs.ts --project ../monky [--check]
```

- Scan the project's markup files (reuse the walk + extensions from
  `adoption/current-ledger.ts`'s markup scanner; skip test files **except** the style-smoke
  fixture, which must be included) plus `ermine.elements.json` (`classString` fields; also
  reorder `context.parentClasses`).
- Rewrite rules, strictly:
  - Plain string attributes (`className="…"`, `class="…"` in fixture HTML strings):
    replace the inner string with `orderParagraph(inner)`.
  - Template literals: split on `${…}` interpolations; apply `orderParagraph` **only to
    the leading static segment**; leave every other segment and all interpolations
    byte-identical. If the leading segment ends mid-token (no trailing space before
    `${`), leave the whole template untouched and count it as skipped.
  - Never touch any other string in the file.
- `--check`: exit non-zero listing files that would change; write nothing.
- Report: files scanned / strings rewritten / templates skipped.

### Step 3 — first run and wiring

1. Commit the tool (ermine). 2. Run against Monky — expect one large, purely-mechanical
diff; run Monky's full gates (`test:styles`, `lint:css`, `npm test`, `audit:styles`) —
class order has zero cascade meaning, so **any** gate failure means the rewriter broke a
string: stop and report. 3. Commit Monky. 4. Add `--check` to Monky's checks next to
`styles:reconcile` (a `format:paragraphs` script mirroring `reconcile-styles.mjs`).
5. Regenerate the ermine current ledger (`--write --gate`) — counts must be identical to
before the run (order changes nothing semantically); if any count moves, stop and report.

## Acceptance criteria

- Idempotent, token-preserving, derivation-only (no hardcoded vocabulary), dynamic-safe.
- Monky fully formatted; both repos' gates green with unchanged ledger counts.
- `--check` wired into Monky's check set; docs: one paragraph in `ADOPTION-PROTOCOL.md`
  naming the canonical order as registry-derived.

## Out of scope

Editor-on-save integration (note as follow-up); sorting inside arbitrary `clsx()`/array
expressions (only plain attributes, leading template segments, manifest, fixture);
any lint rule — the formatter replaces the lint idea entirely.
