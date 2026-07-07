# Monky pilot — extension pages and utility-vocabulary retirement (U8)

## Provenance

| Evidence | Source |
|---|---|
| Order | `docs/Monky-implementation.md` § U8 |
| Ermine commit (tooling used) | build-css / lint / registry at `adc3137` (emitter unchanged since `00a0e4f`) |
| Measured Monky result | recorded in `ledger.json` `source.monkyCommit` |
| Prior surface | U7 suggestions/delete at Monky `5e1b329` |

U8 migrates the popup, options, and editor pages; retires the temporary
`grammar/legacy.css` compatibility sheet (which carried both the pre-Ermine structural
patterns and the Tailwind-like utility grid); and leaves one canonical grammar surface
plus explicit skin and identity.

## What changed

**Legacy sheet retired.** `src/styles/grammar/legacy.css` (707 lines) is deleted and
removed from both delivery paths (`styles.css` page bundle and `baseBundle.ts` Shadow
bundle). `utilities.css` did not exist as a separate file — its utilities had been
folded into `legacy.css` during U4, so retiring `legacy.css` retires the utility
vocabulary. No `grammar/legacy.css` remains.

**Structure migrated to Ermine grammar.** Page markup now composes generated Ermine
words. Six manifest entries were added (`ermine.elements.json`, 37 → 42 entries; 36
distinct words) so the page-only words emit: `gap-loose`, `margin-block-snug`,
`grow-1`, plus the already-present structural set. `flex`→`horizontal`,
`items-center`→`align-center`, numeric `gap-2`/`gap-1`→`gap-snug`/`gap-tight`,
`p-2`→`padding-snug`, `px-2 py-1`→`padding-inline-snug padding-block-tight`,
`relative`→`position-relative`, `inline-flex`→`horizontal inline`.

**Shared skin consolidated into the skin layer.** The utilities the pages actually use
(`text-*`, `font-bold`, `text-primary/secondary/white`, `truncate`,
`whitespace-pre-wrap`, `bg-secondary`, `shadow-sm`, `border-t/b`, `border-primary`,
`transition-colors`) moved from the deleted sheet into `skin/typography.css`,
`skin/surfaces.css`, `skin/controls.css`. `selectable-group`, `min-selected-1`,
`is-selected`, `shake`, `flash` moved verbatim into `skin/controls.css` (their
`@keyframes` already live in `theme/metrics.css`). A `.ui-rounded` radius recipe
replaces `.rounded`.

**Identity kept local.** `popup.css` was rewritten to hold only popup-local identity
(`popup-container`, `popup-item-toggle`, `popup-item-detail`, `popup-toggle-label`, and
the popup result-list scrollbar renamed `popup-results` to end a name collision with the
Shadow-DOM `macro-search-results`). The modal nav tab's 24px inline padding — which has
no Ermine density step (2xl) — folded into `.modal-nav-tab` identity.

## Named computed-style changes (U-R8)

These are intended, not regressions:

- **Stale no-op tokens now deliver their intent.** `space-y-md`, `space-y-sm`, `gap-md`
  were *undefined* (no rule anywhere) and produced zero spacing. They are now
  `vertical gap-comfortable` / `vertical gap-snug` / `gap-comfortable`, adding the
  vertical rhythm the original author intended. Density mapping proven by the pinned
  theme (`--spacing-comfortable` = `--spacing-md` = 12px; `snug` = 8px).
- **Popup inter-child margins absorbed into container gap.** `mb-2`/`my-2` on popup
  children became a uniform `vertical gap-snug` on the container (loses only a trailing
  8px below the last child).

`overflow-hidden` on the SiteToggle description was **not** mapped to Ermine `clip`:
`clip` emits `overflow: clip`, which is not `overflow: hidden` (no scroll container / no
BFC). To preserve exact behavior it stays inline identity (`style={{ overflow: 'hidden' }}`).
Ermine's overflow vocabulary has no `hidden` — recorded as evidence below.

## Declaration conservation

U8 gave a terminal disposition to 559 of the 888 baseline declarations that were still
`uncertain`. Full ledger after U8 (1409 conserved):

| disposition | before U8 | after U8 | Δ |
|---|---:|---:|---:|
| grammar-exact | 65 | 104 | +39 |
| grammar-composition | 46 | 46 | 0 |
| skin-local | 208 | 339 | +131 |
| identity-local | 137 | 138 | +1 |
| substrate | 36 | 37 | +1 |
| gap | 0 | 0 | 0 |
| dead | 29 | 416 | +387 |
| uncertain | 888 | 329 | −559 |
| **total** | **1409** | **1409** | — |

The 387 new `dead` records are the never-consumed Tailwind-like utility grid and unused
structural patterns (263 distinct base classes; every one verified to have zero static
and zero dynamic consumers before the verdict). The 131 new `skin-local` are the
appearance utilities consolidated into the skin layer; Ermine has no grammar axis for
their properties (color, background, border, radius, shadow, type, transition). The 39
new `grammar-exact` are structural utilities whose function moved to an emitted Ermine
word.

## Remaining uncertain — human-gated (U-R9)

329 records remain `uncertain`, indexed by id in the ledger (each carries a `pending`
note). These are the genuinely ambiguous cases automation may not decide: the
skin-vs-identity split for surviving component classes (`btn*`, `card`, `alert*`,
`section*`, `input`, `label`, `ce-*`, `popup-container`, `macro-search-*`, …) and a few
structural residues needing per-element review. They are not blocked work for behavior —
rendering is preserved — only for final ledger ownership. U9's analyzer rerun and a
human classification pass resolve them.

## Verification

- **Ermine bridge `--check`**: generated CSS reproduces byte-identically.
- **Style-smoke probes**: page + modal/search + settings/editor + suggestions +
  delete-confirm all match frozen baselines. The fixture's synthetic `#row` moved off
  the retired `gap-2` to `gap-snug` (same 8px).
- **Unit tests**: 1147 passed, 1 skipped (unchanged).
- **Build**: clean.
- **Source CSS lint** (`lint:css`): clean. The derived `ermine.generated.css` is added
  to stylelint `ignoreFiles` — Ermine deliberately emits overflow *longhands*
  (documented in `src/emit.ts`), which conflicts with `stylelint`'s redundant-longhand
  rule; the gate now covers hand-authored source only.
- **Ermine `npm run check`** and **`adoption:check`**: pass.

## Skin/grammar evidence surfaced

- **Ermine overflow vocabulary lacks `hidden`.** Only `scroll-x/y/auto` and `clip`
  exist. `overflow: hidden` (scroll container + BFC) has no lawful word, so it stayed
  identity. Candidate for the skin/grammar discussion.
- **Density scale gap at 2xl (24px).** `padded-comfortable-loose`'s 24px inline padding
  has no density step between `loose` (20px) and `separated` (40px). Stayed identity.
- Recurring page skin (type sizes, weights, colors, borders, radius, shadow) reinforces
  the U5.1 families; recorded in `SKIN-EVIDENCE.md` § U8.

## Reproduction

```sh
# Ermine root
node --import tsx adoption/build-css.ts --manifest ../monky/ermine.elements.json \
  --out ../monky/src/styles/grammar/ermine.generated.css --check
npm run adoption:check && npm run check
# Monky root
npm test && npm run build && npm run test:styles && npm run lint:css
```
