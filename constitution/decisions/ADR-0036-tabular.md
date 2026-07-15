---
register: history
---

# ADR-0036 — `tabular` figures

source: Monky `.macro-search-count { font-variant-numeric: tabular-nums }`

`tabular` is admitted as a skin type facet: `font-variant-numeric: tabular-nums`, fixed-width digits
so numbers align in columns. Disjoint from size/weight/family, so it composes. Named for the intent.
Other numeric variants (oldstyle, fractions) reserved pending evidence. Introduces R-SKIN-18.
