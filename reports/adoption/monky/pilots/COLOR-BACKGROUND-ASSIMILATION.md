# Monky pilot — color/background skin assimilation

This pass assimilates the remaining obvious `color`, `background`, and `background-color`
skin declarations that can be expressed by already-ruled Ermine carriers.

It is intentionally narrower than "all skin": pseudo-elements, parent-relational state,
`aria-current`, transparent reset mechanics, and project-owned indicators remain local.

## Starting point

The earlier reconciliation table grouped historical `skin-local` rows by property family:

| Historical family | Rows |
|---|---:|
| `color` | 21 |
| `background` | 14 |
| `background-color` | 13 |

Those figures came from the frozen U2 ledger and a broad file-level literal check. Before
editing this pass, a selector-level scan of current Monky CSS found **23 actual current
declarations** in those three families across modal, editor, search, and settings sheets.

## Assimilated

| Surface | Local declaration removed | Ermine expression |
|---|---|---|
| Modal dialog | `background-color: var(--base-tone)` | `ground` |
| Modal wordmark/nav branding | `color: var(--accent)` plus redundant SVG inherit | `ink-accent` |
| Modal nav tab base | `color: var(--ink-soft)` | `ink-soft` |
| Editor popout base | `background: transparent` | reset substrate + existing `hover:ground-defined hover:ink-accent` |
| Command suggestion row hover | `background: var(--base-tone)` | `hover:ground` |
| Command suggestion row selected | `background: var(--tone)` | `selected:ground-defined` with `selectable` |
| Command suggestion action base | `background: transparent` | reset substrate |
| Delete action hover | fail wash + fail ink | `hover:ground-fail-faint hover:ink-fail` |
| Confirm action hover | fail ground + inverse ink | `hover:ground-fail hover:ink-inverse` |
| Cancel action hover | defined ground + ink | `hover:ground-defined hover:ink` |
| Segmented option base | `background: transparent` | reset substrate |
| Segmented option hover | defined ground + ink | `hover:ground-defined hover:ink` |
| Segmented option checked | accent ground + inverse ink | `checked:ground-accent checked:ink-inverse` with `selectable` |
| Import error status | error/fail ink | `ink-fail` |
| Settings divider | `background: var(--harmonic)` on a 1px box | local border mechanics + `rule` |

The compiler required `selectable` for both `selected:` and `checked:` backed state scopes;
that requirement was kept and the elements were updated.

## Left local

After the pass, **11** current `color` / `background` / `background-color` declarations
remain:

| Local family | Count | Why not assimilated here |
|---|---:|---|
| `background-color` | 5 | backdrop shadow, `aria-current` nav state, parent-relational search row state, button baseline |
| `background` | 5 | transparent markup/highlight reset, keyboard pseudo-element, pill mechanics, sliding-pill suppression |
| `color` | 1 | `aria-current` nav state |

These are not treated as failures:

- `aria-current` is not Ermine's `selected:` backing and should not be silently recast.
- search result row backgrounds are parent-relational (`row:hover` affects child cells);
  current Ermine conditioned skin is same-element.
- `::before` / `::after` fills belong to component mechanics until a pseudo/indicator
  treatment is ruled.
- `transparent` declarations often express absence/reset, not a positive skin carrier.
- `.settings-view .btn-outlined` is blocked by the shared `.btn-outlined` skin rule; changing
  it requires a button recipe decision, not just adding `ground-subtle` to markup.

## Verification

Run in Monky:

```sh
npm run ermine:css -- --ermine-root /home/jorge/Documents/code/ermine
npm run test:styles
npm run lint:css
npm run audit:styles
```

Observed after the pass:

| Check | Result |
|---|---|
| Ermine CSS generation | passed |
| style smoke | passed |
| CSS lint | passed |
| style audit | 203 live static classes, 0 dead-candidate declarations |
