---
register: history
---

# ADR-0042 — Text wrapping treatments

source: `reports/adoption/monky/RULE-ACTION-REVIEW.md` and the current Monky text-wrapping
residue (`white-space: nowrap` and `white-space: pre-wrap` rows).

Monky repeats text-flow declarations outside the existing ellipsis and clamp cases:
commands and segmented options prevent soft wrapping, while popup macro text preserves
authored line breaks. The behavior is reusable, but it shares the same CSS property that
R-SKIN-12 already owns for `truncate`.

Options weighed:

- Leave local. Rejected: the rows repeat across surfaces and are not product-specific
  identity.
- Add a new wrapping axis. Rejected: `white-space` is already controlled by the
  truncation/text-flow treatment axis, so a separate axis would violate P7 property ownership.
- Fold into R-SKIN-12. Chosen: the existing axis already answers how text yields to its
  inline measure. `text-nowrap` emits only `white-space: nowrap`; `text-pre-wrap` emits only
  `white-space: pre-wrap`. They conflict with `truncate` and `clamp-N` as members of the
  same text-flow treatment axis.

The conditioned reset/release rows (`white-space: normal`, `overflow: visible`,
`text-overflow: clip`) were deferred here and later ruled by ADR-0049 as `text-wrap` plus
`overflow-visible`.

Amends ruling: R-SKIN-12.
