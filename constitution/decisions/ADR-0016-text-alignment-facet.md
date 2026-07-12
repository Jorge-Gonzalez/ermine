---
register: history
---

# ADR-0016 — Text alignment facet; skin-type retirement

source: `GAP-K6-skin-type`, the registry's last gap axis, examined against the current
Monky ledger.

The axis held `line-height` and `text-align` as fallback ownership. The row-level evidence:

- `text-align: center` ×4 (suggestion chips, two empty states, one recipe) and
  `text-align: left` ×2 — both `left`s are buttons restoring natural alignment against the
  platform's centring.
- `line-height`: a 1.5 base that already lives in the substrate (reset, entry-point font),
  one copy of that base duplicated into the suggestions shadow root, `normal` as
  user-content neutralization, and a single `1` on the keycap signature.

Options weighed:

- Rule both facets symmetrically (an alignment word set plus a leading scale). Rejected:
  the leading scale would be invented from one deviation — the R-SCALE discipline that kept
  `--rule-weight` a socket rather than a scale applies with more force here.
- Keep the gap axis open for line-height alone. Rejected: an open axis implies a pending
  word; the honest disposition is that leading is substrate/theme-owned and its deviations
  are identity, which is a decision, not a pending question.
- Rule alignment (`text-start`/`text-center` admitted on evidence, `text-end` reserved,
  logical values), disposition leading as substrate + identity, retire the axis. Chosen.

Noted for future evidence, not admitted: `tabular-nums` as a `font-*` facet (one
occurrence), the uppercase/letter-spaced label treatment (one occurrence).

Introduces ruling: R-SKIN-14. Resolves GAP-K6-skin-type. Retires the last gap axis.
