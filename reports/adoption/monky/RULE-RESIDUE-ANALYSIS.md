# Monky Rule Residue Analysis

Generated from `reports/adoption/monky/rule-action-review.json` and
`reports/adoption/monky/current-ledger.json`.

Regenerate with:

```sh
npm run adoption:rules -- --write
```

This report changes the unit of analysis from classes/declarations to authored CSS rules.
A rule here is `file + selector`, with only project-owned residue declarations counted.
Adopted Ermine declarations, substrate, theme metrics, and emitted infrastructure are not
included.

## Snapshot

| metric | count |
| --- | --- |
| current declarations | 521 |
| adopted/infrastructure declarations | 390 |
| project-owned residue declarations | 131 |
| project-owned residue rules | 62 |
| assimilable declarations | 0 |
| shadowed words | 0 |
| latent-generalizable declarations | 0 |

## Rule Shape

| rule shape | rules | declarations | reading |
| --- | --- | --- | --- |
| rich-text/editor-content molecule | 21 | 48 | Descendant prose defaults inside user-authored content. This is one authored content recipe, not a set of Ermine utility gaps. |
| private drawing / engine pseudo | 13 | 38 | Pseudo-elements, triangle arrows, keyboard-cap drawing, segmented-control slider, placeholder drawing, and WebKit scrollbar parts. |
| control-state recipes | 11 | 16 | Local control recipes such as disabled buttons, selectable groups, and minimum-selection guards. |
| exact attachment / geometry | 8 | 12 | Exact offsets, overlay layer numbers, dropdown placement, and component geometry values. |
| component-local surface/type fragments | 6 | 9 | Small socket-consuming component signatures that do not yet justify a molecule admission. |
| root/page/host identity | 3 | 8 | Host/page reset and brand type identity. |

## By Source File

| file | residue rules |
| --- | --- |
| `src/styles/components/content-editor.css` | 24 |
| `src/styles/skin/controls.css` | 15 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | 7 |
| `src/content/overlays/views/search/searchViewStyles.css` | 5 |
| `src/content/overlays/views/settings/settingsViewStyles.css` | 5 |
| `src/content/overlays/modal/modalStyles.css` | 2 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | 2 |
| `src/styles/entries/pages.css` | 2 |

## By Primary Rule Action

Primary action is the first action attached to the rule's remaining declarations. Mixed
rules are listed later because a single selector can combine several kinds of residue.

| primary rule action | rules |
| --- | --- |
| typography-content | 17 |
| component-private-drawing | 15 |
| surface-line-elevation-cutout | 9 |
| interaction-affordance-state | 8 |
| spacing-rhythm | 6 |
| attachment-edge-layer | 3 |
| motion-transition | 2 |
| dimension-constraint | 1 |
| reset-inheritance-neutralization | 1 |

## Rule Density

| declarations per residue rule | rules |
| --- | --- |
| 1 declaration | 32 |
| 2 declarations | 15 |
| 3 declarations | 8 |
| 4+ declarations | 7 |

This matters because most remaining rules are narrow and intentional. The seven
dense rules are recognizable authored shapes: segmented slider drawing, keyboard cap
drawing, code/pre blocks, blockquotes, and host identity.

## Main Findings

1. The residue is now rule-shaped, not utility-shaped.

   At declaration level the largest buckets can look like scattered pressure. At rule
   level they collapse into authored systems: editor content, private pseudo drawing,
   control recipes, exact geometry, and local identity. That is healthier than a tail of
   missing utilities.

2. Content-editor residue is a molecule boundary.

   `src/styles/components/content-editor.css` has 24 residue rules. Twenty-one are scoped
   under `.content-editor-body` or `.content-editor .content-editor-body`, meaning they
   describe rendered user content: headings, paragraphs, lists, inline code, pre blocks,
   blockquotes, links, emphasis, decorations, and placeholder text. These rules document a
   prose/editor-content contract. Flattening them into individual words would make Ermine
   noisier without making adoption clearer.

3. Pseudo and engine drawing remains correctly project-owned.

   Keyboard caps, suggestion arrows, segmented-control sliders, empty-content placeholders,
   and WebKit scrollbar parts are drawing recipes. Some declarations use values Ermine can
   name in isolation, but the authored rule is a miniature drawing program. The useful
   future extraction is a recipe/molecule with sockets, not more flat class words.

4. Local identity is small and explicit.

   6 residue rules contain `local-identity` outcomes. They are host/page
   typography, overlay layer identity, root spacing resets, or local transition
   suppression. 2 of those rules are mixed with recipe declarations,
   which is expected for real CSS selectors.

5. There is no immediate grammar pressure.

   The rule-action review reports `0` assimilable
   declarations and `0` latent-generalizable
   declarations. The next useful work is not to admit another isolated word from this
   residue. It is to decide whether one of the remaining authored systems deserves a named
   recipe surface.

## High-Signal Rule Families

### Rich Text / Editor Content

These rules form a content rendering molecule. Their selectors are descendants of
`.content-editor-body`, not standalone visual utilities.

| selector family | rules | role |
| --- | --- | --- |
| headings | 4 | `h1`, `h2`, `h3`, and first-child rhythm reset |
| paragraphs and lists | 6 | `p`, `p:last-child`, `ul`, `ol`, shared list rhythm, `li` |
| inline semantics | 6 | `a`, `a:hover`, `strong/b`, `em/i`, `u`, `s` |
| code blocks | 2 | inline `code` and block `pre` treatment |
| quoted/placeholder content | 2 | `blockquote` and empty placeholder |
| editor body root | 1 | content font family and line-height normalization |

Reading: these are becoming clearer, not noisier. The selectors document browser-rendered
content semantics that class strings cannot attach to directly unless the project rewrites
authored HTML. Ermine should remember the conversion as a prose/editor molecule boundary.

### Private Drawing / Engine Pseudo

| rule | residue declarations | reading |
| --- | --- | --- |
| `.seg-control::before` | 10 | Segmented-control active pill driven by CSS variables and state. |
| `.macro-search-kbd::after` | 8 | Keyboard cap underside/shadow drawing. |
| `::-webkit-scrollbar*` | 8 | Browser-specific scrollbar parts after standard socket integration. |
| `.macro-suggestions-arrow*` | 4 | CSS triangle arrow drawing and orientation. |
| `.content-editor-body:empty::before` | 3 | Placeholder drawing tied to generated content. |
| `.macro-search-kbd and variants` | 6 | Exact keyboard cap geometry. |

Reading: the remaining browser-specific scrollbar rules are not a failure of Ermine's skin
integration. Ermine owns the standard socket handoff; the project owns the engine-specific
pseudo selectors or delegates them to a future post-processing/recipe layer.

### Control-State Recipes

These are not plain state variants. They encode project decisions about what controls are
allowed to do under disabled, selected, active, or constrained states.

| rule cluster | examples | reading |
| --- | --- | --- |
| disabled buttons | `.btn:disabled`, `.btn:disabled:hover` | Local disabled recipe: cursor, opacity, and hover neutralization. |
| selectable groups | `.selectable-group > *`, `.selectable-group > .is-selected:hover`, `.selectable-group > *:active` | Parent/child interaction recipe. |
| minimum-selection guard | `.min-selected-1 > .is-selected:only-of-type*` | JS/state invariant expressed through selectors. |
| radio labels | `.radio-label` | Local clickable label recipe. |

Reading: these are good candidates for recipe documentation, but poor candidates for flat
Ermine words because the semantics depend on component state contracts.

## Complete Rule Inventory

| file | selector | declarations | rule actions | outcome | residue declarations |
| --- | --- | --- | --- | --- | --- |
| `src/content/overlays/modal/modalStyles.css` | `.modal-backdrop` | 2 | surface-line-elevation-cutout, attachment-edge-layer | recipe, local-identity | background-color: var(--shadow-color)<br>z-index: 10000 |
| `src/content/overlays/modal/modalStyles.css` | `.modal-dialog` | 2 | surface-line-elevation-cutout | recipe | box-shadow: rgba(31, 32, 34, 0.3) 0px 1px 2px 0px, rgba(31, 32, 34, 0.15) 0px 2px 6px 2px<br>mix-blend-mode: multiply |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `:host, #macro-suggestions` | 4 | typography-content, attachment-edge-layer | local-identity | font-family: 'IBM Plex Condensed Light', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif<br>line-height: 1.5<br>position: fixed !important<br>z-index: 2147483646 !important |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-arrow` | 2 | component-private-drawing | recipe | width: 0<br>border: 6px solid transparent |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-arrow.bottom` | 1 | component-private-drawing | recipe | border-bottom-color: var(--base-tone) |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-arrow.top` | 1 | component-private-drawing | recipe | border-top-color: var(--base-tone) |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-command-item` | 1 | spacing-rhythm | recipe | padding: 3px 6px |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-container` | 1 | surface-line-elevation-cutout | recipe | box-shadow: 0 10px 25px -5px var(--shadow-color) |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-kbd` | 1 | component-private-drawing | recipe | padding: 1px 4px |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | `.editor-content .content-editor-body` | 1 | dimension-constraint | recipe | flex: 1 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | `.editor-toast` | 2 | attachment-edge-layer, surface-line-elevation-cutout | recipe | bottom: 52px<br>box-shadow: 0 6px 16px -4px rgb(0 0 0 / 25%) |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-item-edit` | 1 | attachment-edge-layer | recipe | right: var(--spacing-sm) |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-item-text mark` | 3 | reset-inheritance-neutralization | recipe | background: transparent<br>color: inherit<br>font-style: normal |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-kbd` | 5 | component-private-drawing | recipe | line-height: 1<br>padding: 3px 6px 6px<br>min-width: 26px<br>border-radius: 4px<br>z-index: 0 |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-kbd::after` | 8 | component-private-drawing | recipe | content: ''<br>position: absolute<br>background: var(--tone-dim)<br>inset: 0 2px 4px<br>border: 1px solid var(--harmonic-minor)<br>border-radius: 2px<br>pointer-events: none<br>z-index: -1 |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-kbd:first-child` | 1 | component-private-drawing | recipe | margin-left: 0 |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.seg-control::before` | 10 | component-private-drawing, motion-transition | recipe | content: ''<br>position: absolute<br>top: 0<br>bottom: 0<br>left: var(--pill-left, 0)<br>width: var(--pill-width, 0)<br>background: var(--accent)<br>opacity: 0<br>transition: left 0.1s ease, width 0.1s ease<br>pointer-events: none |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.seg-control.is-sliding .seg-option[aria-checked="true"]` | 1 | component-private-drawing | recipe | background: transparent |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.seg-control.is-sliding::before` | 1 | component-private-drawing | recipe | opacity: 1 |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.seg-control.seg-snap::before` | 1 | motion-transition | recipe | transition: none |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.seg-option svg` | 1 | interaction-affordance-state | recipe | vertical-align: middle |
| `src/styles/components/content-editor.css` | `.ce-style-dropdown` | 3 | attachment-edge-layer, reset-inheritance-neutralization, spacing-rhythm | recipe | top: calc(100% + 4px)<br>left: 0<br>gap: 2px |
| `src/styles/components/content-editor.css` | `.ce-style-trigger` | 1 | spacing-rhythm | recipe | gap: 2px |
| `src/styles/components/content-editor.css` | `.ce-toolbar-sep` | 1 | surface-line-elevation-cutout | recipe | background-color: var(--harmonic) |
| `src/styles/components/content-editor.css` | `.content-editor .content-editor-body ol` | 1 | typography-content | recipe | list-style-type: decimal |
| `src/styles/components/content-editor.css` | `.content-editor .content-editor-body ul` | 1 | typography-content | recipe | list-style-type: disc |
| `src/styles/components/content-editor.css` | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | 2 | spacing-rhythm | recipe | padding-left: 1.5em<br>margin-bottom: 0.75em |
| `src/styles/components/content-editor.css` | `.content-editor-body` | 2 | typography-content, reset-inheritance-neutralization | recipe, local-identity | font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif<br>line-height: normal |
| `src/styles/components/content-editor.css` | `.content-editor-body a` | 2 | surface-line-elevation-cutout, typography-content | recipe | color: var(--accent)<br>text-decoration: underline |
| `src/styles/components/content-editor.css` | `.content-editor-body a:hover` | 1 | typography-content | recipe | opacity: 0.8 |
| `src/styles/components/content-editor.css` | `.content-editor-body blockquote` | 5 | surface-line-elevation-cutout, spacing-rhythm, typography-content | recipe | border-left: 3px solid var(--accent-dim)<br>padding-left: var(--spacing-md)<br>margin: 0.75em 0<br>color: var(--ink-soft)<br>font-style: italic |
| `src/styles/components/content-editor.css` | `.content-editor-body code` | 6 | typography-content, surface-line-elevation-cutout, spacing-rhythm | recipe | font-family: 'IBM Plex Mono', 'Fira Code', monospace<br>font-size: 0.88em<br>background-color: var(--tone)<br>color: var(--ink)<br>padding: 0.1em 0.35em<br>border-radius: var(--radius-sm) |
| `src/styles/components/content-editor.css` | `.content-editor-body em, .content-editor-body i` | 1 | typography-content | recipe | font-style: italic |
| `src/styles/components/content-editor.css` | `.content-editor-body h1` | 3 | typography-content, spacing-rhythm | recipe | font-size: 1.75em<br>font-weight: 700<br>margin: 0.75em 0 0.4em |
| `src/styles/components/content-editor.css` | `.content-editor-body h1:first-child, .content-editor-body h2:first-child, .content-editor-body h3:first-child` | 1 | spacing-rhythm | recipe | margin-top: 0 |
| `src/styles/components/content-editor.css` | `.content-editor-body h2` | 3 | typography-content, spacing-rhythm | recipe | font-size: 1.4em<br>font-weight: 700<br>margin: 0.75em 0 0.4em |
| `src/styles/components/content-editor.css` | `.content-editor-body h3` | 3 | typography-content, spacing-rhythm | recipe | font-size: 1.15em<br>font-weight: 700<br>margin: 0.75em 0 0.4em |
| `src/styles/components/content-editor.css` | `.content-editor-body li` | 2 | typography-content, spacing-rhythm | recipe | display: list-item<br>margin-bottom: 0.2em |
| `src/styles/components/content-editor.css` | `.content-editor-body p` | 1 | spacing-rhythm | recipe | margin-bottom: 0.75em |
| `src/styles/components/content-editor.css` | `.content-editor-body p:last-child` | 1 | spacing-rhythm | recipe | margin-bottom: 0 |
| `src/styles/components/content-editor.css` | `.content-editor-body pre` | 7 | typography-content, surface-line-elevation-cutout, spacing-rhythm, reset-inheritance-neutralization | recipe | font-family: 'IBM Plex Mono', 'Fira Code', monospace<br>font-size: 0.88em<br>background-color: var(--tone)<br>padding: var(--spacing-md)<br>border-radius: var(--radius-sm)<br>overflow-x: auto<br>margin: 0.75em 0 |
| `src/styles/components/content-editor.css` | `.content-editor-body s` | 1 | typography-content | recipe | text-decoration: line-through |
| `src/styles/components/content-editor.css` | `.content-editor-body strong, .content-editor-body b` | 1 | typography-content | recipe | font-weight: 700 |
| `src/styles/components/content-editor.css` | `.content-editor-body u` | 1 | typography-content | recipe | text-decoration: underline |
| `src/styles/components/content-editor.css` | `.content-editor-body:empty::before` | 3 | component-private-drawing | recipe | content: attr(data-placeholder)<br>color: var(--ink-soft)<br>pointer-events: none |
| `src/styles/entries/pages.css` | `.page-title` | 1 | typography-content | local-identity | font-family: 'IBM Plex Condensed Light', sans-serif |
| `src/styles/entries/pages.css` | `body` | 3 | typography-content, spacing-rhythm | local-identity | font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial<br>margin: 0<br>padding: 0 |
| `src/styles/skin/controls.css` | `::-webkit-scrollbar` | 2 | component-private-drawing | recipe | width: var(--spacing-md) !important<br>height: var(--spacing-md) !important |
| `src/styles/skin/controls.css` | `::-webkit-scrollbar-thumb` | 3 | component-private-drawing | recipe | background: var(--tone) !important<br>border-radius: var(--radius-md) !important<br>border: 1px solid var(--tone-dim) !important |
| `src/styles/skin/controls.css` | `::-webkit-scrollbar-thumb:hover` | 1 | component-private-drawing | recipe | background: var(--accent-dim) !important |
| `src/styles/skin/controls.css` | `::-webkit-scrollbar-track` | 2 | component-private-drawing | recipe | background: var(--tone-dim) !important<br>border-radius: var(--radius-md) !important |
| `src/styles/skin/controls.css` | `.btn-success:hover` | 1 | surface-line-elevation-cutout | recipe | background-color: color-mix(in oklch, var(--status-success) 82%, var(--shadow-color)) |
| `src/styles/skin/controls.css` | `.btn:disabled` | 2 | interaction-affordance-state | recipe | cursor: not-allowed<br>opacity: 0.6 |
| `src/styles/skin/controls.css` | `.btn:disabled:hover` | 2 | surface-line-elevation-cutout, interaction-affordance-state | recipe | background-color: var(--tone-dim)<br>opacity: 0.6 |
| `src/styles/skin/controls.css` | `.input-error:focus` | 1 | surface-line-elevation-cutout | recipe | box-shadow: inset 0 0 0 2px var(--status-error-wash) |
| `src/styles/skin/controls.css` | `.min-selected-1 > .is-selected:only-of-type` | 2 | interaction-affordance-state | recipe | cursor: not-allowed<br>opacity: 0.95 |
| `src/styles/skin/controls.css` | `.min-selected-1 > .is-selected:only-of-type:hover` | 1 | interaction-affordance-state | recipe | opacity: 0.95 |
| `src/styles/skin/controls.css` | `.radio-label` | 2 | interaction-affordance-state, reset-inheritance-neutralization | recipe | cursor: pointer<br>user-select: none |
| `src/styles/skin/controls.css` | `.selectable-group > .is-selected:hover` | 1 | interaction-affordance-state | recipe | opacity: 0.9 |
| `src/styles/skin/controls.css` | `.selectable-group > *` | 2 | interaction-affordance-state, reset-inheritance-neutralization | recipe | cursor: pointer<br>user-select: none |
| `src/styles/skin/controls.css` | `.selectable-group > *:active` | 1 | interaction-affordance-state | recipe | transform: scale(0.98) |
| `src/styles/skin/controls.css` | `.shake` | 1 | motion-transition | local-identity | transition: none !important |

## Reading

- Rule analysis is stricter than class analysis for the remaining residue. It shows where
  authored CSS still has meaning after Ermine removes the general structural pressure.
- A declaration may look admissible in isolation, but if it participates in a pseudo
  drawing, browser engine selector, content molecule, or state contract, the rule remains
  project-owned.
- Future adoptions should run this report shape once `assimilable = 0`. It is the handoff
  point from "which words are missing?" to "which authored systems remain outside flat
  grammar?"
