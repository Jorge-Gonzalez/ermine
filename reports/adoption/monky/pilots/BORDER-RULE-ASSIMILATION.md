# Monky pilot — border/rule assimilation

This pass continues the skin reconciliation by assimilating safe border colour declarations
into Ermine's `rule` carrier.

It does not try to make Ermine own border width, border style, transparent spacing
sentinels, pseudo-element geometry, or focus/current state semantics. `rule` owns colour;
component CSS can still own the mechanics of where a line exists.

## Starting point

The historical reconciliation table listed `border` as an 8-row surviving `skin-local`
family. Looking at the broader border family (`border`, side borders, and border colours)
in the current modal/search/settings/editor adoption surfaces found 16 selector-level
declarations before this pass.

## Assimilated

| Surface | Local declaration changed | Ermine expression |
|---|---|---|
| Modal dialog | `border: 1px solid var(--harmonic)` | local `border-width`/`border-style` + `rule` |
| Search input container | `border-bottom: 1px solid var(--harmonic)` | local bottom width/style + `rule` |
| Segmented option separator | `border-right: 1px solid var(--harmonic)` | local right width/style + `rule` |

The segmented option required a cascade-safe split: the old `border: none` shorthand would
reset `border-color` after the grammar layer, so it became width/style mechanics
(`border-width: 0; border-style: solid; border-right-width: 1px`) while `rule` supplies the
colour.

## Left local

After the pass, 13 border-family declarations remain in the targeted adoption surfaces:

| Family | Count | Reason |
|---|---:|---|
| `border` | 5 | reset/none declarations, pseudo arrow geometry, keyboard pseudo-element |
| `border-bottom` | 1 | transparent nav-tab spacing sentinel |
| `border-bottom-color` | 2 | `aria-current` nav state and pseudo arrow geometry |
| `border-top` | 1 | reset/none declaration |
| `border-top-color` | 1 | pseudo arrow geometry |
| `border-color` | 1 | focus state on search input |
| `border-right` | 1 | last-child separator reset |
| `border-right-color` | 1 | checked segmented-control overlap suppression |

These are intentionally not assimilated here:

- `aria-current` is not Ermine's `selected:` state.
- `:focus` is not yet a skin condition in this adoption pass.
- pseudo arrows and keyboard pseudo-elements use border mechanics to draw geometry, not
  merely colour a rule line.
- transparent and `none` declarations are absence/reset mechanics, not positive carriers.
- checked segmented-control border suppression is overlap mechanics that pairs with the
  sliding pill.

## Verification

Run in Monky:

```sh
npm run ermine:css -- --ermine-root /home/jorge/Documents/code/ermine --check
npm run test:styles
npm run lint:css
npm run audit:styles
```

Observed after the pass:

| Check | Result |
|---|---|
| Ermine CSS generation check | passed |
| style smoke | passed |
| CSS lint | passed |
| style audit | 203 live static classes, 0 dead-candidate declarations |
