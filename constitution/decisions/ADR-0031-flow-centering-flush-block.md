---
register: history
---

# ADR-0031 — flow centering and block flush

source: `reports/adoption/monky/RESIDUE-INVARIANCE.md`; `reports/adoption/monky/current-ledger.json`; `docs/non-ermine.txt`

Monky's page container preserves the common CSS idiom `margin: 0 auto`. The shorthand is useful
evidence, but it is not one semantic operation. It expands to an inline-axis relation and a
block-axis reset:

- `margin-inline: auto` centers a normal-flow block inside available inline space once its used
  inline size is narrower than the containing block.
- `margin-block: 0` removes block-axis outside spacing.

Admitting the shorthand as one word would make a centering word erase block spacing. Admitting only
the centering half would fail to reproduce the current Monky declaration. The ruling therefore
admits two words:

- `centered` emits `margin-inline: auto`.
- `flush-block` emits `margin-block: 0`.

The composition `centered flush-block` is the grammar representation of `margin: 0 auto`. The words
remain separate from positioned centering (`center-x` / `center-y`), text alignment, flex/grid
alignment, and scale-backed margin words.

Introduces R-SIZE-07.
