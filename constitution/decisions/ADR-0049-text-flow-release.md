---
register: history
---

# ADR-0049 — Text-flow release endpoints

source: `reports/adoption/monky/RULE-ACTION-REVIEW.md` after the rule-presence edge-facet batch,
especially the selected search-result release rows.

Monky's search results rest as `hidden truncate`, but the selected row expands the text cell so the
full macro text can wrap. The local CSS releases three declarations:

- `white-space: normal`
- `text-overflow: clip`
- `overflow: visible`

Options weighed:

- Leave local. Rejected: this is the exact scoped release follow-up recorded by ADR-0042.
- Admit broad reset words (`normal`, `visible`, `clip`). Rejected: those names are ambiguous and
  would create carrier-free reset vocabulary.
- Split the release along existing ownership seams. Chosen: `text-wrap` belongs to the
  truncation/text-flow axis and emits `white-space: normal; text-overflow: clip`;
  `overflow-visible` belongs to the overflow axis and emits visible overflow on both axes.

The release remains scoped by normal Ermine state prefixes. In Monky the selected child cell uses
`parent-selected:text-wrap parent-selected:overflow-visible`, so the base paragraph still says
`hidden truncate` and the selected condition states the release explicitly.

Amends rulings: R-SKIN-12, R-OVERFLOW-01.
