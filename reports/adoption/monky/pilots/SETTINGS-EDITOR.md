# Monky pilot — settings and macro editor

## Provenance

| Evidence | Commit |
|---|---|
| U2 baseline Monky | `fc2af4525beadc0d0b85144f615e2f0fe8bd2acf` |
| Ermine U3 compiler used by generated CSS | `00a0e4f917394bef3892dfc47df6dd5ef164d4f6` |
| Prior measured Monky result | `73e582c0da73db506bbddcfe5953ada1832e55d0` |
| Measured Monky U6 result | `df194bae51b905172dfd16ed38698b3a376eac7d` |

The U6 manifest source is `monky/ermine.elements.json`. The generated pair is
`src/styles/grammar/ermine.generated.css` and its adjacent `.meta.json`. The metadata records
34 manifest entries, 31 distinct words, the compiler commit, and SHA-256 hashes for both
manifest and generated output.

## Declaration conservation

The canonical U2 ledger scope for U6 contains 208 declarations:

| File | Baseline declarations |
|---|---:|
| `settingsViewStyles.css` | 81 |
| `editorViewStyles.css` | 127 |
| **Total** | **208** |

U6 gives every declaration in that scope a terminal disposition:

| Disposition | Count |
|---|---:|
| `grammar-exact` | 37 |
| `grammar-composition` | 29 |
| `skin-local` | 85 |
| `identity-local` | 57 |
| **Total** | **208** |

By file:

| File | Grammar | Skin local | Identity local | Total |
|---|---:|---:|---:|---:|
| `settingsViewStyles.css` | 20 | 34 | 27 | 81 |
| `editorViewStyles.css` | 46 | 51 | 30 | 127 |

The measured Monky result keeps 142 local residual declarations in those two files:
61 settings declarations and 81 editor declarations. Therefore:

```text
142 residual + 66 grammar-mapped = 208 baseline declarations
```

U6 also migrated current-tree shared content-editor chrome and the obsolete `.items` child-flex
rule. Those declarations were not present in the U2 canonical ledger, so they are recorded as an
adjunct current-tree migration rather than added to the baseline conservation equation:

```text
66 ledger-backed settings/editor structural declarations
+ 34 shared content-editor chrome structural declarations
+ 1 obsolete .items child-flex rule
= 101 Monky local structural declarations removed
```

The raw diff removes one additional `opacity` line only because `.ce-style-caret` was compacted
without changing the declaration; it is not counted as structural migration.

## Mappings applied

The U6 manifest adds 17 entries using 23 distinct Ermine words:

```text
align-center, basis-ratio, elastic, gap-comfortable, gap-relaxed,
gap-snug, gap-tight, horizontal, justify-between, justify-center,
padding-block-loose, padding-block-snug, padding-block-tight,
padding-inline-comfortable, padding-inline-separated,
padding-inline-snug, padding-loose, padding-tight,
position-absolute, position-relative, rigid, vertical, wrap-allowed
```

Major mappings:

- settings groups, rows, appearance controls, and segmented-control shells moved to
  `grid`, `horizontal`, alignment, density, padding, and `position-relative`;
- segmented-control options now use `elastic basis-ratio`, exact padding words, and
  `position-relative`; the sliding pill geometry remains local;
- macro editor shell/form/topbar/bottombar moved to `vertical`, `horizontal`, `elastic
  basis-ratio`, alignment, gap, padding, and position words;
- command suggestions moved row, action, dropdown, and label structure to Ermine words;
- shared content-editor chrome moved toolbar/menu/link-field structure to Ermine words while
  retaining user-authored rich-text content as a boundary.

The human-approved Monky density binding remains:

```text
tight=4px, snug=8px, comfortable=12px,
relaxed=16px, loose=20px, separated=40px
```

## State backing and retired compatibility

- Command suggestion selection is now backed by `aria-selected="true"` rather than a generic
  `.selected` class.
- Command delete confirmation is now backed by `data-state="confirming-delete"` because the
  state is application-specific.
- Segmented-control selection is now backed by `aria-checked="true"`; the former parallel
  `.is-selected` state class was removed from that component.
- The obsolete `.items > * { flex: 0 0 auto; }` compatibility rule was removed. Its exact
  consumers were rewritten with explicit member behavior (`rigid`) or were already covered by
  `fit-content` child behavior.

SelectableGroup still owns its existing `.is-selected` skin state; that component is outside
the segmented-control state rewrite and remains for a later utility-retirement pass.

## Content boundary

Only shared content-editor chrome was migrated: the editor container, toolbar, style menu,
style dropdown, style options, and link field. The rich-text body remains local so user-authored
macro content keeps its neutral font and formatting behavior. U6 does not apply Monky UI
typography or extra Ermine structural words inside user-authored content.

## Browser and visual evidence

`npm run test:styles` now probes settings/editor surfaces in the same browser style smoke that
already covered generated grammar, modal/search, suggestions, and delete confirmation. The smoke
loads the generated grammar sheet and verifies the frozen computed outcomes for settings group,
row, appearance controls, segmented control, prefix button, editor shell/form/topbar/popout,
command field, content editor, bottom bar, and command suggestion state selectors.

All computed probes match. Written visual diff: no intentional appearance change was made in
U6. Skin residue remains in Monky CSS and is recorded as evidence for the skin-ruling loop.

## Automation yield and residuals

U6 accepted 66 grammar mappings from 208 canonical baseline declarations: **31.7%** descriptive
yield for the settings/editor ledger scope. This is not an adoption target.

The 85 skin residuals cover colors, backgrounds, borders, radii, type, opacity, motion, and
state treatments. The 57 identity residuals cover exact dimensions, overflow/clipping, stacking,
segmented-control pill mechanics, truncation, cursor behavior, and component-specific content
boundaries.

No skin word was coined and no skin Gap Report was resolved by U6.

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

