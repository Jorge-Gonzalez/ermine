---
register: history
---

# ADR-0046 — Side corner facets and seam endpoints

source: `reports/adoption/monky/RULE-ACTION-REVIEW.md` and the current Monky radius residue around
the macro command input and its suggestions dropdown.

Monky carries three local corner facts:

- `.editor-command-error` restores the bottom pair of corners to `var(--radius-md)`.
- `.input-dropdown-open` flattens the bottom pair to `0` while the dropdown is attached.
- `.command-suggestions` keeps only the bottom pair rounded with `var(--radius-md)`.

These are not product-specific shapes. They are side facets of the existing corner axis: a joined
surface may need its shared seam flat while the exposed side remains rounded.

Options weighed:

- Leave local. Rejected: the declarations repeat around an ordinary input/dropdown seam and use the
  same theme radius scale as `corner-md`.
- Admit individual physical corner words. Rejected for now: the evidence is paired sides, not
  arbitrary one-corner sculpture.
- Admit broad `corner-none`. Rejected for now: the evidence is side-local seam flattening, not a
  whole-box square treatment.
- Admit top/bottom side facets plus side-local `none` endpoints. Chosen:
  `corner-top-<step>`, `corner-bottom-<step>`, `corner-top-none`, and `corner-bottom-none`.

The corner axis now has footprint composition. Whole-box `corner-<step>` owns every corner slot and
conflicts with side facets. `corner-top-*` owns the top-left/top-right slots; `corner-bottom-*`
owns bottom-right/bottom-left. Top and bottom facets compose with each other.

Amends R-SKIN-06.
