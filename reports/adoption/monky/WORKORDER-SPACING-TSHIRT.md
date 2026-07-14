# Work Order — Spacing scale: density → T-shirt

Implements the ruling in `DENSITY-WORDS-RETIRED.md`. Retires the named **density** scale;
the four spacing axes move to a **T-shirt** magnitude scale. Constitution-touching, so the
normative amendment (Part A) is ratified by the author (R1) before the code parts land.

## Objective

`gap-comfortable padding-snug` → `gap-md padding-sm`. One spacing scale (`xs, sm, md, lg,
xl, 2xl, 3xl`, anchor `md`) shared by `gap`/`density`, `flow-spacing`, `padding`, `margin`,
aligned with the already-T-shirt `corner`/`type`/`size` scales.

## Impact analysis (blast radius)

**Doc-graph (shallow, clean).** `constitution/impact.ts` on `R-DENSITY-01`, `R-DENSITY-04`,
`R-SPACE-02`, `R-SCALE-01/02`: each resolves to `CODE:SCALES` (`[implements]`) + its
rationale (`[rationale-of]`), **no competing sources, 0 unresolved conflicts.** The scale is
a leaf in the governance graph.

**Code (the real work) — regeneration chain.** `SCALES` feeds every generated artifact:
`src/emit.ts`, `src/generate-{spec,guide,theme}.ts`, `src/ownership.generated.json`,
`surfaces/typed/*.generated.ts`, `surfaces/vscode/*.generated.json`, and the spec/guide docs.
Density-word literals also appear in ~10 `test/*` files. All are covered by no-diff `*:check`
gates, so a miss fails `npm run check` rather than drifting silently.

**Monky.** Class strings (`gap-comfortable`, `padding-snug`, …) and `metrics.css`.

## The migration is value-identical (not a rendering change)

Monky's `metrics.css` already defines every density var as a T-shirt var (the "U5 binding"):

```
--spacing-comfortable: var(--spacing-md);   /* 12px */   --spacing-tight:  var(--spacing-xs);  /* 4px  */
--spacing-relaxed:     var(--spacing-lg);   /* 16px */   --spacing-snug:   var(--spacing-sm);  /* 8px  */
--spacing-loose:       var(--spacing-xl);   /* 20px */   --spacing-separated: var(--spacing-3xl); /* 40px */
```

So the migration **unwinds an indirection layer**, not values. `gap-comfortable` emits
`var(--spacing-comfortable)` = `var(--spacing-md)`; `gap-md` emits `var(--spacing-md)` —
identical computed value. The one non-obvious pair: **`separated` → `3xl` (40px)**, NOT `2xl`.
`2xl` (24px) was the unnamed density gap (`GAP-U-density-2xl`).

---

## Part A — Constitution amendment (author ratifies)

**Inputs:** `constitution/ERMINE.md` §§R-SPACE-02, R-DENSITY-01…04, R-PADDING-01, plus
`ERMINE-RATIONALE.md` and a new ADR. IDs are permanent (never renumbered).

Proposed normative edits (move-and-amend; the author owns the final wording):

- **R-DENSITY-01** — replace the named chain with:
  > Spacing magnitude is a closed ordered T-shirt scale `xs`, `sm`, `md`, `lg`, `xl`, `2xl`,
  > `3xl`, unmarked default `md`. The retired density words (`tight … separated`) are reserved
  > as future container-density **aliases** (R-PROPORTION-01), never as per-property words.
- **R-SPACE-02** — "…followed by the density word" → "…followed by the T-shirt step."
- **R-PADDING-01** — "over the shared **density** scale" → "over the shared **spacing** scale."
- **R-DENSITY-04** — still holds (one shared scale, four families); update the word "density"
  → "spacing" for accuracy.
- **R-DENSITY-02, R-DENSITY-03** — vestigial (their example words are retired). Leave the
  ruling IDs; add a one-line note that their examples are historical. Do not reuse the IDs.
- **R-PROPORTION-01** — already permits "a single-word reading… as an alias earned by
  recurrence." No change; it is the license for any future density-word resurrection.
- **RAT + ADR:** add `RAT:R-DENSITY-01` rationale (magnitude-not-intent; extensibility wall;
  in-situ `font-md font-medium` evidence) and one `constitution/decisions/ADR-00NN-spacing-tshirt.md`
  (source: `DENSITY-WORDS-RETIRED.md`, this work order). `history: ADR-00NN` on R-DENSITY-01.

**Gate:** `npm run docs:check && npm run graph:check` (no dangling refs; every ruling has a
RAT; new ADR discovered by front-matter).

## Part B — Registry (`src/registry.ts`)

- **SCALES (line 27):** rename the key and change the steps:
  ```
  -  density: ["tight", "snug", "comfortable", "relaxed", "loose", "separated"],
  +  spacing: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"],
  ```
  Update every `SCALES.density` reference to `SCALES.spacing` (the `densityToken` helper
  line 89-90; the `density`/`flow-spacing`/`padding`/`margin` axis `valueSpace`).
- **`density` axis default (line 220):** `"comfortable"` → `"md"`.
- **De-hardcode the aliasMatch regexes** (lines 243, 260) — they hand-list density words;
  derive from the scale so this never needs a hand-edit again:
  ```
  -  aliasMatch: (word) => /^padding-(tight|snug|comfortable|relaxed|loose|separated)$/.test(word),
  +  aliasMatch: (word) => new RegExp(`^padding-(${SCALES.spacing.join("|")})$`).test(word),
  ```
  (same for `margin`).
- **Axis id `density`:** keep it (bounds churn; it is the future home of the container-density
  alias). Optional: rename the `densityToken`/`densityDial` helpers → `spacingToken`/`spacingDial`
  for clarity. Rename is cosmetic; do it or not, but not half.
- **P0 note:** the new bare steps (`xs…3xl`) match zero axis tokens (spacing words are always
  prefixed `gap-`/`padding-`/…), so `checkTokenUniqueness()` stays clean — verified against the
  `size`/`radius`/`breakpoint`/`zTier2` vocabularies.

## Part C — Emitter (`src/emit.ts`)

- **`densityDial` (line 60):** the regex uses `SCALES.density` → becomes `SCALES.spacing`
  automatically after Part B. Line 61 already emits `var(--spacing-${step})` — **no change**,
  and it now produces `var(--spacing-md)`, matching Monky's native variable.
- **De-hardcode the padding/margin dispatch regexes** (lines 251, 301) exactly as Part B's
  aliasMatch — derive from `SCALES.spacing`.

## Part D — Ermine theme (`demo/`)

- `demo/theme.css`, `demo/theme-alt.css`: rename `--spacing-<density>` → `--spacing-<t-shirt>`
  and set values (a demo theme owns its numbers; pick a clean scale). Regenerate
  `demo/ermine.generated.css` via `npm run theme` (do not hand-edit generated files, R3).

## Part E — Regenerate + tests

1. Run generators: `npm run spec && npm run guide && npm run ownership && npm run theme &&
   npm run typed && npm run vscode`.
2. Update density-word literals in `test/*` (registry, lint, css, emit, authoring-patterns,
   format-paragraph, browser/render, equivalence, bench, survey) to the T-shirt steps.
3. `npm run check` exits 0 — the full chain (`*:check` no-diff gates + typecheck + tests).

## Part F — Monky migration (after A–E land)

1. Rewrite class strings across `monky/src`: `-comfortable`→`-md`, `-tight`→`-xs`,
   `-snug`→`-sm`, `-relaxed`→`-lg`, `-loose`→`-xl`, `-separated`→**`-3xl`** (all four families
   + inline/block variants).
2. Remove the now-dead density var block (`metrics.css` lines 19-24) once no class or CSS
   references it.
3. **Verify:** style-smoke **byte-identical computed-style parity** across frozen baselines
   (values are unchanged by construction); `npm run adoption:current`; `styles:reconcile
   --check --gate`. The `pad`/`gap` residue rows resolve; `assimilable` stays 0.

## Acceptance criteria

- Author has ratified the Part A amendment; `docs:check` + `graph:check` green.
- `npm run check` exits 0 (all no-diff gates, typecheck, tests).
- `checkTokenUniqueness()` reports ok.
- Monky style-smoke parity byte-identical; ledger regenerated; spacing residue down.

## Non-goals

- Renaming the `density` axis id or the `size`/`radius`/`type` scales.
- Resurrecting any density word as an alias now (reserved; needs its own evidence).
- Touching any other residue phase.

## Decisions the author must confirm before Part A

1. Scale steps `xs…3xl` (7, matching Monky + `type`) and default `md`. **Recommended.**
2. Rename `SCALES.density` → `SCALES.spacing`; **keep** axis id `density`. **Recommended.**
3. Amendment wording for R-DENSITY-01 (above is a proposal, not the ruling).
