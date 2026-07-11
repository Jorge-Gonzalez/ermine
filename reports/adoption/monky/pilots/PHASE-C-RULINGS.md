# Monky pilot — Phase C rulings and consumption

Phase C converts the evidence Phases A/B quantified into constitutional rulings, then
consumes the new vocabulary in Monky. Ermine rulings were committed first, Monky recorded
the Ermine commit, and this report closes the loop (ADOPTION-PROTOCOL §4 order).

## Rulings

| Ruling | What it decides | Evidence it cites |
|---|---|---|
| `focus:` admitted (R-STATE-10, existing rule) | third platform condition joins hover; recolors carriers under `:focus`, never redraws the UA ring | 15 focus-state rows, one uniform treatment |
| R-STATE-12 — attribute-backed condition prefix (ADR-0009) | `current:` scoped skin backed by the element's own `aria-current`; serialization is the backing (`[aria-current]:not([aria-current="false"])`) | the nav-tab rows three pilots refused to recast |
| R-SKIN-09 — elevation treatment (ADR-0010) | `elevated` owns `box-shadow` via `--shadow-elevated` with an Ermine default composed on the `shadow` colour socket; `recessed` reserved; renamed from the follow-up's `raised`, which collides with the z-scale tier | 5 elevation rows |
| R-SKIN-10 — recipe boundary (ADR-0011) | recipes (button/alert/card/input bundles) are project compositions, not grammar words; the discipline is socket consumption | the `.btn` blocker three pilots named |
| Deferred with filings | parent-relational state → new `GAP-U-parent-relational-state`; duration step names → attached to `GAP-U-animation-plane` (naming them pre-reframe risks naming twice) | 12 parent-relational rows; ~28 motion rows |

## Consumed in Monky

| Surface | Local declaration removed | Ermine expression |
|---|---|---|
| Search input, popup search input, link input, editor body | `:focus { border-color: var(--accent) }` | `focus:rule-accent` |
| Modal nav tab | `[aria-current="page"] { color; background-color }` | `current:ink-accent current:ground-subtle` |
| Style dropdown | `box-shadow: 0 4px 12px rgb(0 0 0 / 12%)` | `elevated` |
| Command suggestions | `box-shadow: 0 4px 8px rgb(0 0 0 / 8%)` | `elevated` |

Left local, with reasons:

- The 2px tone **focus ring** stays in component CSS — `focus:` recolors carriers;
  redrawing the UA ring is the anti-pattern RAT:R-STATE-10 names, and Monky's ring is
  recorded as identity pending its own question.
- The nav tab's **bottom-rule colour under aria-current** stays local: the base
  `2px solid transparent` sentinel lives in the components layer, which outranks the
  grammar layer, so a grammar word cannot win the colour back. Layer mechanics, not
  semantics.
- **Toast, suggestions-overlay, and modal shadows** stay identity — different tiers or
  identity signatures (the modal's multiply-blend pair), per R-SKIN-09's boundary.
- The two dropdown-tier literals unified onto one themed shadow are an **approved minor
  correction** (12%/8% black → the theme's `--shadow`, now dark-mode aware).
- `.input:focus` / `.input-error:focus` are *expressible* (`focus:rule-accent` /
  `focus:rule-fail`) but stay in the recipe: R-SKIN-10 keeps recipe conditional identity
  in the recipe class, recorded as `recipe-identity` overrides.

## Ledger effect

Regenerated current ledger (`CURRENT-LEDGER.md`):

| Measure | Before Phase C | After |
|---|---:|---:|
| current declarations | 718 | 714 |
| residue | 533 | 525 |
| assimilable | 0 | 0 |
| recipe rows named terminal (`recipe-identity`) | — | 19 |
| focus-conditioned remainder | 15 | 9 (rings/mechanics only) |
| aria-current remainder | 3 | 1 (the layer-bound rule colour) |
| elevation remainder | 5 | 3 (identity shadows) |

The classifier learned the rulings: `focus:`/`current:` join the condition-aware inverse
match, and `recipe-identity` (R-SKIN-10) is a terminal reason code.

## Verification

| Check | Result |
|---|---|
| Ermine `npm run check` | passed (266 tests; docs/graph/spec/theme/ownership/typed/vscode current) |
| Monky style smoke | passed against frozen baselines |
| Monky stylelint | passed |
| Monky unit tests | 1137 passed, 1 skipped |
| Monky style audit | 208 live static classes, 0 dead-candidate declarations |
