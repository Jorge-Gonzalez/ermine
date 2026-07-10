# Monky pilot — settings/editor style rework in Ermine terms

This log applies the search-view rework method to the remaining modal views:
settings and macro editor. The rule is the same: migrate stable semantic styling to
Ermine words, leave behavioral/state/geometry details local, and only add project
configuration when a concrete discrepancy proves it is needed.

No new Ermine config variable was added by this pass. Existing Monky metric/theme
bindings already make the adopted words resolve to the intended values.

## Dissolved into Ermine

These local declarations moved to Ermine classes.

| Previous local CSS | Ermine expression | Notes |
| --- | --- | --- |
| settings section label `font-size`, `font-weight`, accent-dim color | `font-xs font-medium ink-accent-soft` | `ink-accent-soft` reads `--accent-soft`, which Monky already binds from the former accent-dim tone. |
| settings row label `font-size`, ink color | `font-md ink` | Uses the configured Monky `--type-md: 15px` binding. |
| settings import status `font-size` | `font-sm` | Status color remains split: success uses `ink-accent`; error fallback remains local. |
| segmented-control container border color/radius/background | `rule corner-md ground-subtle` | Border width/style and overflow remain local. |
| segmented option base `font-size` and soft ink | `font-sm ink-soft` | Checked/hover colors remain local state styling. |
| editor shell text ink | `ink` | Removes the view-level local ink declaration. |
| editor title type/weight/ink | `font-lg font-semibold ink` | Exact scale adoption through existing Monky metric binding. |
| editor popout radius/soft ink | `corner-sm ink-soft` | Hover background/accent remains local. |
| editor command error wash | `ground-fail-faint` | Bottom-only radius remains local. |
| editor sensitive label type/ink | `font-sm ink` | Cursor and checkbox behavior remain local. |
| command suggestion dropdown background/rule color | `ground-subtle rule-accent-soft` | Exact dropdown box shape remains local. |
| command suggestion label type/ink/rule color | `font-sm ink-soft rule` | Border width/style remain local. |
| command suggestion command type/weight/accent | `font-md font-medium ink-accent` | Truncation remains local. |
| command suggestion text type/soft ink | `font-sm ink-soft` | Ellipsis behavior remains local. |
| command suggestion action radius/soft or fail ink | `corner-sm ink-soft` / `corner-sm ink-fail` | Hover fills remain local state treatment. |
| confirming-delete row wash | `ground-fail-faint` | The row keeps `data-state` for behavior; the visual wash is carried by an Ermine class. |

## Reduced but still local

These areas now use Ermine for their stable skin/type layer, but keep local CSS for
component-specific behavior or exact geometry.

| Selector/pattern | Local remainder | Why it remains local |
| --- | --- | --- |
| `.settings-view` | height and scrolling | View contract. |
| `.settings-body` / `.settings-group` | exact padding and grid columns | Page layout contract; some values are asymmetric or fixed to the settings composition. |
| `.settings-section-label` | letter spacing, uppercase transform, exact padding | Label idiom not currently ruled as an Ermine type facet. |
| `.settings-divider` | 1px filled separator and margins | Candidate for future separator/rule treatment; not just `rule` because it paints background. |
| `.settings-prefix-btn` | exact square size | Component geometry. |
| `.seg-control` | border width/style, overflow, sliding-pill pseudo-element | Animation and clipping mechanics. |
| `.seg-option` | text alignment, line height, transparent background, right divider, cursor, z-index, transition | Segmented-control mechanics and state behavior. |
| `.seg-option:hover` / `[aria-checked]` | hover/selected fills and ink | Stateful treatment remains local until Ermine has a ruled control/selection treatment for this component. |
| `.editor-command-error` | bottom-only radius | Ermine has whole-corner magnitude, not per-corner shape in this pass. |
| `.command-suggestions` | position, border-top removal, bottom-only radius, z-index, overflow, shadow | Dropdown geometry and elevation remain local. |
| `.command-suggestion-item` | cursor, transition, overflow | Row behavior. |
| `.command-suggestion-item:hover` / `[aria-selected]` | hover/selected backgrounds, excluding confirming-delete rows | State treatment remains local; exclusion prevents later component-layer rules from overriding `ground-fail-faint`. |
| `.command-suggestion-command` / `.command-suggestion-text` | nowrap/ellipsis | Search/dropdown text-clipping behavior. |
| `.command-suggestion-action` | border reset, transparent background, cursor, opacity reveal, transitions | Action affordance behavior. |
| confirm/cancel/delete hover rules | fail/neutral hover fills and text colors | Stateful action treatment not yet ruled as Ermine vocabulary. |

## Currently incompatible with ruled Ermine

"Incompatible" means not expressible by the current ruled Ermine language without
loss. These are candidates for evidence, not defects.

| Style shape | Current reason |
| --- | --- |
| section-label uppercase + tracking | No ruled typography facet for casing/tracking. |
| segmented-control sliding pill (`::before`, `--pill-left`, `--pill-width`) | Runtime-measured animation geometry; project-local control mechanic. |
| segmented-control per-option right divider | Component-local separator shape; possible future separator/rule vocabulary evidence. |
| filled divider `.settings-divider` | Separator uses background fill rather than a border/rule carrier. |
| bottom-only radii for dropdown/error seam | Ermine currently has radius magnitude, not corner-side selection. |
| dropdown shadow/elevation | Shadow/elevation vocabulary is still unruled. |
| command suggestion action opacity reveal | State/affordance behavior, not a static skin word. |
| import error fallback `--color-error, #e06c75` | Not yet proven equivalent to Ermine `fail`; left local until the value is reconciled. |

## Follow-up for U8f

The strongest relocation/generalization candidates are:

- segmented-control divider pressure and selected/hover treatment;
- bottom-only dropdown/error radii as a possible corner-shape/per-side evidence item;
- dropdown elevation as shadow/elevation evidence;
- settings divider as separator-vs-rule evidence.

Each needs recurrence evidence before becoming Ermine vocabulary.
