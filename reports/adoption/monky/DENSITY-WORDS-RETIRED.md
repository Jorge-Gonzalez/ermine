# Retired: the density word-scale (spacing → T-shirt)

**Scope:** Ermine grammar (the spacing scale), surfaced through the Monky adoption workbench.
**Status:** ruled by the author (2026-07-14) — spacing goes T-shirt; the density words are
retired. **Pending** the constitution amendment + `src/registry.ts`/`src/emit.ts` change +
regeneration. Promote this record to a `constitution/decisions/ADR-*` (with a stable ruling
ID and rationale) when the amendment is authored; until then it lives here as the decision
record.

## The ruling

The spacing axes (`density`/`gap`, `flow-spacing`, `padding`, `margin`) move off the named
**density** scale (`tight … separated`) onto a **T-shirt magnitude scale**
(`xs, sm, md, lg, xl, 2xl, 3xl` — 7 steps, matching Monky's own scale and the `type` scale),
with `md` as the neutral anchor — aligning spacing with the scales that are already T-shirt
(`corner`/`radius`, `font`/`type`, `size`).

So `gap-comfortable padding-snug` becomes `gap-md padding-sm`.

## Why retired (the evidence)

The density words pass the grammar-admission test as *words* (what-not-how, general), so this
is not a legitimacy problem — it is a **scale-structure** problem: a named 6-step scale is the
wrong shape for a magnitude.

- **Magnitude, not intent.** Their order is not self-evident (`snug` vs `comfortable`;
  `relaxed` vs `loose`). Words earn their keep when the name *guides the choice*; here it
  doesn't, so they were functioning as magnitude wearing intent's clothes. Magnitude wants
  T-shirt, whose order is unambiguous by construction.
- **Extensibility wall already hit.** `GAP-U-density-2xl` exists because a step was needed
  *between `loose` and `separated`* and the named scale had no graceful way to name it. T-shirt
  inserts steps without inventing an un-orderable word.
- **Invented, not universal.** `font-medium`/`font-bold` may stay named because those names
  pre-exist in every reader's head; `separated` vs `loose` is Ermine's own coinage, so the
  memorization cost is real here in a way it isn't for weight.
- **In-situ proof (`font-md font-medium`).** Monky already runs both conventions in one word —
  T-shirt `md` (size) beside named `medium` (weight) — and it reads perfectly. The lesson:
  named for universal/role scales, T-shirt for magnitude. Density is neither, so it gets the
  advantages of neither.
- **The elegance was isolation-only.** `padding-comfortable` reads well alone; inside a
  200-char button string, buried among `ground ink rule corner-md ruled font-md`, the prose
  quality is diluted and the eye is scanning for *which scale* — where `padding-md` wins.

Full derivation: `RESIDUE-THREE-WAY.md`, `ABSORPTION-PLAN.md` Phase 0, and the readability
comparison of real Monky strings that produced this ruling.

## Resurrection candidates → aliases

If future evidence shows a genuine **container-level density intent** — a small 2–3 option
choice made by feel, not a magnitude ladder — these words return as **aliases** expanding to
the T-shirt steps (the existing `Alias` mechanism, as `elastic` = `grow-1 shrink-1` on
`m2-flex`). Mapping is the **actual Monky U5 binding** (`metrics.css`), where each density var
is already defined as a T-shirt var — so this is the exact value correspondence, not a guess:

| retired density word | T-shirt step (Monky value) |
|---|---|
| `tight` | `xs` (4px) |
| `snug` | `sm` (8px) |
| `comfortable` | `md` (12px — the neutral anchor; default aligns) |
| `relaxed` | `lg` (16px) |
| `loose` | `xl` (20px) |
| `separated` | `3xl` (40px) |

**Note the `2xl` gap.** The density scale skipped `2xl` (24px): it jumped `loose` (20px/`xl`)
straight to `separated` (40px/`3xl`). That missing step *is* `GAP-U-density-2xl` — concrete
proof of the named scale's extensibility failure. T-shirt simply has `2xl` between `xl` and
`3xl`; nothing to name.

**Design note for any resurrection.** A container-density intent spans *multiple* axes
(gap + padding + margin at once), so it would not be a per-axis whole-axis alias like the m2
corners — it's a multi-axis convenience word. Resurrect at most a **3-step** intent set
(e.g. `compact`/`comfortable`/`spacious` → `sm`/`md`/`lg`), never the full six; the middle
steps were exactly the un-distinguishable ones. Do not resurrect as per-property words
(`padding-comfortable`) — that reintroduces the magnitude-wearing-intent problem.

## Consequences

- **Monky migration is now 1:1.** Monky already authors `--spacing-xs…2xl`; T-shirt spacing
  words map directly with no value change. `ABSORPTION-PLAN.md` Phase 1's scale-reconciliation
  caveat is resolved.
- **Ermine-side change (before Monky migration):** retire `SCALES.density`, add the spacing
  T-shirt scale, update the four spacing axes' tokens + `emit.ts`, regenerate spec/guide/
  ownership/theme, update tests, run impact analysis (`constitution/impact.ts`) for the
  density ruling's dependents. This is a constitution-touching work order, not a residue edit.
