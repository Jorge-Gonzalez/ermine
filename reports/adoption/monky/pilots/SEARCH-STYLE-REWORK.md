# Monky pilot — search style rework in Ermine terms

This log records the search-view rework after Monky introduced the project-side
Ermine config layer. The key process rule is that Ermine words are adopted first, and
project-specific numeric differences are handled by Ermine variable configuration, not
by keeping parallel local style names.

## Configuration premise

Monky now configures the confirmed text-scale departure directly:

```css
--type-md: 15px;
```

Therefore migrating `font-size: var(--text-md)` to `font-md` is a configuration-backed
Ermine adoption, not a visual incompatibility. Future discrepancies should add only the
specific Ermine variable that the migration proves is intentionally different.

## Dissolved into Ermine

These local declarations were removed because an Ermine word now owns the same intent:

| Previous local CSS | Ermine expression | Notes |
| --- | --- | --- |
| `.macro-search-input { font-size: var(--text-md); }` | `font-md` | Preserved by Monky config `--type-md: 15px`. |
| `.macro-search-empty { font-size: var(--text-md); }` | `font-md` | Applied to all empty/awaiting search states. |
| `.macro-search-item-command { font-size: var(--text-md); }` | `font-md` | Applied to macro command cells and modal command-name cells. |
| confirming-delete `background-color: var(--status-error-wash)` | `ground-fail-faint` | Reads Ermine socket `--fail-faint`, which Monky already resolves to the former wash. |
| confirming-delete command `color: var(--status-error)` | `ink-fail` | Dynamic class replaces the descendant state override. |

The delete-confirm row keeps its `data-state="confirming-delete"` platform marker for
behavior/tests, but the visual error treatment has moved to Ermine classes on the
affected cells.

## Reduced but still local

These selectors now carry Ermine classes for the semantic skin/scale layer, but still
retain local declarations for behavior, exact structure, or selector context:

| Selector/pattern | Local remainder | Why it remains local |
| --- | --- | --- |
| `.macro-search-input` | width, border width/style, outline reset, box sizing, transition | Input component mechanics; Ermine currently owns color/radius/type, not the full input primitive. |
| `.macro-search-input:focus` | accent border and focus ring | Stateful focus treatment is not yet a ruled Ermine treatment word for this control. |
| `.macro-search-results` | max height, overflow-y, subgrid columns, align-content | Component geometry and result-list contract. |
| `.macro-search-item-command` / `.macro-search-item-text` | border width/style, cursor, transition, ellipsis/nowrap | Row behavior and exact text clipping. Ermine supplies color/rule/type/padding. |
| cell side padding | `padding-right` / `padding-left` deltas | Relationship/rhythm between adjacent grid columns; candidate for parent/row relocation under U8f, not an exact leaf-cell replacement. |
| hover/selected row backgrounds | `background-color` under `:hover` / `[aria-selected]`, excluding confirming-delete rows | State treatment remains local until Ermine has a matching conditioned-skin rule/value. The exclusion prevents later component-layer state rules from overriding the Ermine `ground-fail-faint` error carrier. |
| selected text expansion | white-space/overflow/text-overflow | Search-specific behavior. |
| edit button | absolute offset, transform, transparent background, opacity reveal, hover treatment | Floating action affordance and state behavior. |
| footer count | tabular numeric variant | Typography facet not yet represented by ruled Ermine words. |

## Currently incompatible with ruled Ermine

"Incompatible" here means "not expressible by the currently ruled Ermine language
without loss"; it does not mean Ermine can never grow to cover it.

| Style shape | Current reason |
| --- | --- |
| `font-family: monospace` for command names and keyboard hints | Ermine has no ruled `font-mono` / typeface facet yet. |
| `font-style: italic` for command descriptions | Ermine has no ruled emphasis/style facet yet. |
| placeholder mark internals (`mark`, nested opacity spans) | Rich-text/token highlighting structure is component-local. |
| keyboard cap pseudo-element (`::after`, inset, layered border, exact radii) | Physical keycap illusion is a component-specific drawing, not a general Ermine word. |
| exact keyboard hint geometry (`padding: 3px 6px 6px`, `min-width: 26px`) | Not on an Ermine scale and intentionally visual/identity-specific. |
| `font-variant-numeric: tabular-nums` | No ruled numeric-variant facet. |

## Follow-up for U8f

The asymmetric cell padding is the main relocation candidate:

- command cell adds right-side breathing room;
- text/confirm cell adds left-side breathing room;
- both already have `padding-comfortable`.

That pattern likely describes inter-column rhythm more than intrinsic cell padding. U8f
should report it as `relocation-candidate` / `local-adjustment`, not as a missing Ermine
word.
