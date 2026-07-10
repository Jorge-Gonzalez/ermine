# Monky pilot — render-verified hover + selection penetration

This pass migrates the suggestions overlay command chip through the first
stateful skin boundary where hover and selected can co-occur on the same
element.

## What moved into Ermine

| Local selector/declaration | Ermine expression | Notes |
| --- | --- | --- |
| base suggestion chip background | `ground-subtle` | Formerly `background-color: var(--tone-dim)`. |
| base suggestion chip ink | `ink` | Formerly `color: var(--ink)`. |
| base suggestion chip rule color | `rule-soft` | Formerly a transparent border. This is an intentional assimilation into the shared ruled-surface language. |
| base suggestion chip radius/type | `corner-md font-sm` | Preserves the prior `6px` radius and `13px` type through Monky's Ermine config. |
| hover background/rule | `hover:ground-defined hover:rule` | Formerly `.macro-suggestions-command-item:hover`. |
| selected background/ink/rule | `selected:ground-defined selected:ink-accent selected:rule-accent` | Formerly `.macro-suggestions-command-item[aria-selected="true"]`. Backed by `aria-selected`. |

The component stylesheet now keeps only mechanics: dimensions, exact local
padding, border width/style, cursor, transition, text alignment, and overflow.

## Cascade finding

The first naive migration failed the render smoke even though the generated
selectors matched the element. The reason was cascade layer order:

- generated Ermine CSS is emitted in the `grammar` layer;
- component CSS is emitted in the later `components` layer;
- later component-layer base declarations for `background`, `color`, and
  `border-color` defeat earlier grammar-layer state declarations, regardless of
  selector specificity.

Therefore a render-safe state migration must move the competing base skin
declarations together with hover and selected declarations. Moving only selected
or hover is not enough.

## Render verification

`scripts/style-smoke.mjs` now verifies four states for the suggestion chip:

| State | Expected result |
| --- | --- |
| base | `ground-subtle ink rule-soft` |
| hover only | `ground-defined ink rule` |
| selected only | `ground-defined ink-accent rule-accent` |
| selected + hover | `ground-defined ink-accent rule-accent` |

The selected + hover case is the critical assertion: selected remains the later
generated state winner for accent ink/rule when hover and selected co-occur.
The smoke waits for the chip's existing `0.15s` transition before reading hover
styles, so it verifies the settled rendered state.

Reproduction:

```sh
npm run test:styles
```

## Remaining frontier

This proves the migration method for one unguarded same-element hover/selected
surface. Remaining candidates need the same discipline:

- `selectable-group` where `.is-selected` competes with hover;
- content-editor toolbar/style options where active state competes with hover;
- guarded component states such as delete-confirming rows should stay local
  unless the guard itself is modeled, because the guard is behavior/state
  exclusion, not only skin.
