# Monky pilot — suggestions and delete-confirm overlays

## Provenance

| Evidence | Commit |
|---|---|
| U2 baseline Monky | `fc2af4525beadc0d0b85144f615e2f0fe8bd2acf` |
| Ermine U3 compiler used by generated CSS | `00a0e4f917394bef3892dfc47df6dd5ef164d4f6` |
| Prior measured Monky result | `df194bae51b905172dfd16ed38698b3a376eac7d` |
| Measured Monky U7 result | `5e1b3292fc54ffaae19e8f5c5a052ac481aade11` |

The suggestions overlay and delete-confirm popup are independently injected Shadow Roots.
Both receive the explicit `composeShadowBundle()` base and the same generated Ermine CSS
revision used by modal/settings/editor. The delete-confirm bundle appends its local CSS on
top of the shared suggestions overlay sheet.

## Declaration conservation

The canonical U2 ledger scope for U7 contains 107 declarations:

| File | Baseline declarations |
|---|---:|
| `suggestionsOverlayStyles.css` | 94 |
| `deleteConfirmStyles.ts#DELETE_CONFIRM_STYLES` | 13 |
| **Total** | **107** |

U7 gives every declaration in that scope a terminal disposition:

| Disposition | Count |
|---|---:|
| `grammar-exact` | 4 |
| `grammar-composition` | 4 |
| `skin-local` | 45 |
| `identity-local` | 31 |
| `substrate` | 2 |
| `dead` | 21 |
| **Total** | **107** |

By file:

| File | Grammar | Skin local | Identity local | Substrate | Dead | Total |
|---|---:|---:|---:|---:|---:|---:|
| `suggestionsOverlayStyles.css` | 7 | 36 | 28 | 2 | 21 | 94 |
| `deleteConfirmStyles.ts#DELETE_CONFIRM_STYLES` | 1 | 9 | 3 | 0 | 0 | 13 |

The measured Monky result keeps 86 live local residual declarations in those two files.
Therefore:

```text
86 residual + 8 grammar-mapped + 21 dead = 107 baseline declarations
```

## Mappings applied

U7 adds 3 manifest entries with 5 distinct words in those entries:

```text
compressible, gap-comfortable, gap-tight, horizontal, padding-tight
```

It also reuses existing generated words from earlier manifest entries:

```text
position-absolute, elastic, basis-ratio
```

Accepted mappings:

- suggestion arrow `position:absolute` moved to `position-absolute`;
- suggestions command list moved to `horizontal padding-tight gap-tight`;
- suggestions command option `flex: 0 1 auto` moved to `compressible`; `flex-basis:auto`
  remains the CSS initial value;
- suggestions footer display/gap moved to `horizontal gap-comfortable`;
- delete-confirm option `flex: 1 1 0` moved to `elastic basis-ratio`.

One proposed mapping was rejected during browser smoke: Ermine `justify-end` serializes to a
computed `justify-content: end`, while the baseline declaration computed to `flex-end`. The
visual result is effectively the same here, but U7 is an exact migration, so
`justify-content:flex-end` remains local identity CSS.

## State backing and dead residue

- Suggestion option selection now reads `aria-selected="true"` instead of a generic
  `.selected` class.
- Delete-confirm danger treatment also reads `aria-selected="true"`.
- The old `.macro-suggestions-item*` family is dead residue. `rg` found no live markup or
  test consumers; only the CSS definitions existed. U7 removes those 21 baseline records as
  `dead`.

## Local residuals

Identity residuals include host-page escape positioning, viewport/caret placement, arrow
geometry, exact min/max widths, clipping/truncation, off-scale padding, cursor behavior, and
`justify-content:flex-end` where Ermine's current emission is not byte/computed exact.

Skin residuals include colors, backgrounds, borders, radii, shadow, type, transition, and
selected/danger treatments. Substrate records cover Shadow-root/browser normalization:
box sizing and inherited form-control font family.

## Browser and visual evidence

`npm run test:styles` now probes internal suggestions/delete structures in addition to the
outer containers:

- suggestions command list display, padding, and gap;
- selected suggestion option flex, padding, background, color, and border color;
- footer display, gap, and exact `flex-end` justification;
- delete-confirm option `elastic basis-ratio` flex behavior.

All computed probes match. Written visual diff: no intentional appearance change was made in
U7. Caret placement, arrow placement, overlay widths, keyboard navigation, selected treatment,
and delete-confirm behavior remain covered by existing unit tests and style smoke.

## Automation yield and residuals

U7 accepted 8 grammar mappings from 107 canonical baseline declarations: **7.5%** descriptive
yield for the suggestions/delete overlay ledger scope. If the 21 dead records are excluded from
the denominator, the live-scope grammar yield is **9.3%**.

The low structural yield is expected: the overlay sheets are dominated by skin, exact popup
geometry, host-page isolation, truncation, and dead historical CSS rather than reusable layout
structure. No skin word was coined and no Gap Report was resolved by U7.

## Reproduction

From Monky:

```sh
npm run ermine:css -- --ermine-root ../ermine --check
npm run lint:css
npm test
npm run test:styles
npm run build
```

From Ermine:

```sh
npm run adoption:check
npm run check
```

