---
register: history
---

# ADR-0032 — grid fit track

source: `reports/adoption/monky/RESIDUE-INVARIANCE.md`; `reports/adoption/monky/current-ledger.json`; `docs/non-ermine.txt`

Monky's search result list uses a two-track grid:

```css
grid-template-columns: fit-content(140px) 1fr;
```

The first track hugs command labels while capping their width; the second track takes the remaining
space. This is a general grid relation, but the cap is a project metric. The grammar therefore
admits a parameterized structure member instead of hard-coding `140px`:

- `grid-fit-<size>` emits `grid-auto-flow: row` and
  `grid-template-columns: fit-content(var(--size-<size>)) 1fr`.
- The display facet is `grid`, like the plain `grid` structure member.
- The size parameter must be an admitted layout size step.

`grid-fit-*` is a structure word, not a separate grid-track axis. It replaces plain `grid` on the
same element because both choose the grid container's inner structure. `subgrid`, fixed fractional
grids such as `1fr 3fr`, and the broader `columns-N`/intent-proportion model remain separate
questions.

Introduces R-STRUCTURE-02.
