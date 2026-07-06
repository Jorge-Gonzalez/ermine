# Monky pilot — modal shell and search view

## Provenance

| Evidence | Commit |
|---|---|
| U2 baseline Monky | `fc2af4525beadc0d0b85144f615e2f0fe8bd2acf` |
| Ermine U3 compiler used by generated CSS | `00a0e4f917394bef3892dfc47df6dd5ef164d4f6` |
| Pre-edit U5 ledger classification | `e2edb588ad094ae1221a21d6a5d9973b9cccf1d6` |
| Measured Monky result | `73e582c0da73db506bbddcfe5953ada1832e55d0` |

The manifest source is `monky/ermine.elements.json`. The generated pair is
`src/styles/grammar/ermine.generated.css` and its adjacent `.meta.json`. The metadata records the
compiler commit and SHA-256 hashes for both input and output.

## Declaration conservation

The baseline pilot scope contains 172 declarations: 46 in `modalStyles.css` and 126 in
`searchViewStyles.css`.

| Disposition | Count | Result |
|---|---:|---|
| `grammar-exact` | 24 | Replaced by existing Ermine words |
| `grammar-composition` | 13 | Replaced by lawful multi-axis compositions |
| `skin-local` | 78 | Retained in component CSS |
| `identity-local` | 49 | Retained as exact geometry or product behavior |
| `dead` | 8 | U4 proved the old modal regex removed these before injection |
| **Total** | **172** | **Conserved** |

The measured result contains 29 modal declarations and 98 search declarations: 127 local residuals.
Therefore `127 residual + 37 mapped + 8 dead = 172 baseline`.

The repository-wide analyzer reports 1,395 current CSS declarations. That number is not the
conservation equation: generated atomic rules deduplicate across elements, and U5 also adds six
theme-binding aliases. The declaration-level baseline ledger remains the conservation authority.

## Mappings applied

The 17 manifest compositions use 21 distinct Ermine words. Major mappings include:

- flex structure: `horizontal`, `vertical`, and `grid`;
- negotiated flex sizing: `elastic basis-ratio` for the former `flex: 1` outcomes;
- alignment: `align-center`, `justify-center`, and `justify-between`;
- positioning: `position-fixed`, `position-relative`, and `position-absolute`;
- placement: `span-all` for `grid-column: 1 / -1`;
- density: `padding-tight`, `padding-snug`, `padding-comfortable`, `padding-relaxed`, the
  block/inline padding dials, and `gap-snug`;
- display facets: `horizontal inline` for shortcut rows.

The human-approved Monky density binding preserves the pre-existing semantic classes:

```text
tight=4px, snug=8px, comfortable=12px,
relaxed=16px, loose=20px, separated=40px
```

Monky's 24px metric remains local and unbound.

## State backing

- Search-result selection now uses `aria-selected` and skin selectors read
  `[aria-selected="true"]`; the former class-only `selected` truth was removed.
- The navigation treatment reads the existing `aria-current="page"`; its redundant `active` class
  was removed.
- Delete confirmation now uses `data-state="confirming-delete"`, because it is application-only
  state rather than platform state.

## Browser and visual evidence

`npm run test:styles` loads the real generated grammar sheet through `composeShadowBundle()` and
asserts that its provenance header is present in the modal Shadow Root. Chromium then compares the
frozen outcomes for modal direction and dimensions plus search structure, flex negotiation, grid
placement, positioning, padding, alignment, gaps, footer layout, and keyboard hints. Page,
suggestion, and delete-confirmation probes remain in the same smoke.

All computed probes match. Written visual diff: no change was observed or accepted; modal geometry,
search layout, spacing, colors, typography, selection treatment, and delete-confirmation treatment
remain the same.

One contextual finding changed the initial proposal: a keyboard hint's old `inline-flex` outer mode
was blockified because it is a flex item. The final mapping uses `horizontal` without the inert
`inline` word. The shortcut container retains the meaningful `horizontal inline` facet composition.

## Automation yield and residuals

Automation produced 37 accepted mappings from 164 baseline declarations that were live at the start
of U5: **22.6%**. This is descriptive yield, not an adoption target.

The 78 skin residuals cover colors, borders, radii, shadows, typography, transitions, and state
treatments. The 49 identity residuals cover exact modal dimensions, host-page escape depth, overflow,
subgrid columns, truncation, keyboard-cap geometry, and other product-specific behavior. No skin word
was coined and no skin Gap Report was resolved by this pilot.

## Reproduction

From Monky:

```sh
npm run ermine:css -- --ermine-root ../ermine
npm run ermine:css -- --ermine-root ../ermine --check
npm test
npm run lint:css
npm run test:styles
npm run build
```

From Ermine:

```sh
npm run adoption:check
npm run check
```

No Gap Report was produced by U5.
