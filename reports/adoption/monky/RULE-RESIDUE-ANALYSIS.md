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
| current declarations | 520 |
| adopted/infrastructure declarations | 394 |
| project-owned residue declarations | 126 |
| project-owned residue rules | 61 |
| assimilable declarations | 0 |
| shadowed words | 0 |
| latent-generalizable declarations | 0 |

## Rule Shape

| rule shape | rules | declarations | reading |
| --- | --- | --- | --- |
| authored-content substrate | 20 | 45 | A reset/prose substrate for user-authored HTML; the point is to preserve native content semantics outside flat utility grammar. |
| editor chrome recipes | 3 | 3 | Controls around the authored content surface: dropdowns, toolbar separators, and small editor UI signatures. |
| editor layout bridge | 1 | 1 | Layout handoff between the editor shell and the authored-content island. |
| private drawing / engine pseudo | 16 | 43 | Pseudo-elements, triangle arrows, keyboard-cap drawing, segmented-control slider, placeholder drawing, and WebKit scrollbar parts. |
| control-state recipes | 11 | 16 | Local control recipes such as disabled buttons, selectable groups, and minimum-selection guards. |
| exact attachment / geometry | 4 | 5 | Exact offsets, overlay layer numbers, dropdown placement, and component geometry values. |
| component-local surface/type fragments | 3 | 5 | Small socket-consuming component signatures that do not yet justify a molecule admission. |
| root/page/host identity | 3 | 8 | Host/page reset and brand type identity. |

## Word-Assimilation Target

The conserved ledger still counts all project-owned residue. For word-assimilation planning,
semantic fragments and content-editor default substrate rules are excluded because they are
not missing flat words: they are recipe/fragments or a deliberate authored-HTML island.

| bucket | declarations | rules | reading |
| --- | --- | --- | --- |
| conserved project-owned residue | 126 | 61 | All remaining project-owned declarations in the current ledger. |
| semantic fragments excluded | 43 | 16 | Keycap, callout-arrow, segmented-pill, engine-scrollbar, and generated-placeholder fragments. |
| content-editor defaults excluded | 45 | 20 | Authored-content substrate defaults under `.sf-authored-content`, excluding pseudo drawing. |
| adjusted word-assimilation target | 38 | 25 | Residue still worth reading for future words, recipes, or project identity after those exclusions. |

The exclusion is union-aware: 88 declarations across
36 rules are outside the word-assimilation target. They remain visible
in the conserved ledger and boundary reports.

### Remaining Target Shape

| rule shape | rules | declarations | reading |
| --- | --- | --- | --- |
| editor chrome recipes | 3 | 3 | Controls around the authored content surface: dropdowns, toolbar separators, and small editor UI signatures. |
| editor layout bridge | 1 | 1 | Layout handoff between the editor shell and the authored-content island. |
| control-state recipes | 11 | 16 | Local control recipes such as disabled buttons, selectable groups, and minimum-selection guards. |
| exact attachment / geometry | 4 | 5 | Exact offsets, overlay layer numbers, dropdown placement, and component geometry values. |
| component-local surface/type fragments | 3 | 5 | Small socket-consuming component signatures that do not yet justify a molecule admission. |
| root/page/host identity | 3 | 8 | Host/page reset and brand type identity. |

## By Source File

| file | residue rules |
| --- | --- |
| `src/styles/fragments/semantic-fragments.css` | 37 |
| `src/styles/skin/controls.css` | 11 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | 3 |
| `src/styles/components/content-editor.css` | 3 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | 2 |
| `src/content/overlays/views/search/searchViewStyles.css` | 2 |
| `src/styles/entries/pages.css` | 2 |
| `src/content/overlays/modal/modalStyles.css` | 1 |

## By Primary Rule Action

Primary action is the first action attached to the rule's remaining declarations. Mixed
rules are listed later because a single selector can combine several kinds of residue.

| primary rule action | rules |
| --- | --- |
| typography-content | 17 |
| component-private-drawing | 15 |
| interaction-affordance-state | 8 |
| spacing-rhythm | 7 |
| surface-line-elevation-cutout | 7 |
| attachment-edge-layer | 3 |
| motion-transition | 2 |
| dimension-constraint | 1 |
| reset-inheritance-neutralization | 1 |

## Rule Density

| declarations per residue rule | rules |
| --- | --- |
| 1 declaration | 34 |
| 2 declarations | 13 |
| 3 declarations | 7 |
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

   `src/styles/components/content-editor.css` has 24 residue rules. Twenty are authored-content
   substrate under `.sf-authored-content`: headings,
   paragraphs, lists, inline code, pre blocks, blockquotes, links, emphasis, and decorations.
   Three are `ce-*` editor chrome. One is placeholder pseudo drawing. Treating those as one vague
   "content editor" bucket hides the important distinction: the body is an authored HTML island,
   while the surrounding `ce-*` selectors are ordinary component chrome.

3. Pseudo and engine drawing remains correctly project-owned.

   Keyboard caps, suggestion arrows, segmented-control sliders, empty-content placeholders,
   and WebKit scrollbar parts are drawing recipes. Some declarations use values Ermine can
   name in isolation, but the authored rule is a miniature drawing program. The useful
   future extraction is a recipe/molecule with sockets, not more flat class words.

4. Local identity is small and explicit.

   5 residue rules contain `local-identity` outcomes. They are host/page
   typography, overlay layer identity, root spacing resets, or local transition
   suppression. 0 of those rules are mixed with recipe declarations,
   which is expected for real CSS selectors.

5. There is no immediate grammar pressure.

   The rule-action review reports `0` assimilable
   declarations and `0` latent-generalizable
   declarations. The next useful work is not to admit another isolated word from this
   residue. It is to decide whether one of the remaining authored systems deserves a named
   recipe surface.

## High-Signal Rule Families

### Authored Content Substrate

These rules intentionally point the other way from a utility framework. `.sf-authored-content`
is an authored HTML island: a neutral/prose substrate where user content can render ordinary
`p`, `h1`, `ul`, `em`, `u`, `s`, `a`, `code`, and `blockquote` semantics without
requiring class words on descendants.

| selector family | rules | role |
| --- | --- | --- |
| headings | 4 | `h1`, `h2`, `h3`, and first-child rhythm reset |
| paragraphs and lists | 6 | `p`, `p:last-child`, `ul`, `ol`, shared list rhythm, `li` |
| inline semantics | 6 | `a`, `a:hover`, `strong/b`, `em/i`, `u`, `s` |
| code blocks | 2 | inline `code` and block `pre` treatment |
| quoted content | 1 | `blockquote` treatment |
| editor body root | 1 | content font family and line-height normalization |

Reading: this is not a failed absorption frontier. It is a deliberate boundary where the project
restores useful native HTML defaults so users can bring their own styling and semantics. Ermine
should remember it as authored-content substrate evidence, not as scattered missing words.

### Editor Chrome And Bridges

The `ce-*` selectors are editor controls around the authored-content island. They are different
from `.sf-authored-content`: dropdown placement, toolbar separators, and tiny trigger gaps are
component chrome recipes. The `.editor-content .content-editor-body` row is different again: it
is a layout bridge that lets the editor shell hand remaining block space to the authored content.

| selector group | reading |
| --- | --- |
| `ce-*` | editor toolbar/menu chrome; recipe-local unless repeated elsewhere |
| `.sf-generated-placeholder:empty::before` | placeholder pseudo drawing, classified with private drawing |
| `.editor-content .content-editor-body` | layout bridge between shell and authored-content substrate |

### Private Drawing / Engine Pseudo

| rule | residue declarations | reading |
| --- | --- | --- |
| `.sf-segmented-pill::before` | 10 | Segmented-control active pill driven by CSS variables and state. |
| `.sf-keycap-raised::after` | 8 | Keyboard cap underside/shadow drawing. |
| `::-webkit-scrollbar*` | 8 | Browser-specific scrollbar parts after standard socket integration. |
| `.sf-callout-arrow*` | 4 | CSS triangle arrow drawing and orientation. |
| `.sf-generated-placeholder:empty::before` | 3 | Placeholder drawing tied to generated content. |
| `.sf-keycap and variants` | 7 | Exact keyboard cap geometry. |

Reading: these are named recipe boundaries, not missing flat words. The keyboard cap is a
beveled object, the callout arrow is a CSS triangle, the segmented pill is a pseudo-element
driven by component coordinate variables, the empty placeholder is generated content, and the
remaining scrollbar rules are engine pseudo-elements after Ermine's standard socket handoff.
They should stay local, move to project recipes, or be delegated to a post-processing layer
before Ermine considers any new atomic words.

### Control-State Recipes

These are not plain state variants. They encode project decisions about what controls are
allowed to do under disabled, selected, active, or constrained states.

| rule cluster | examples | reading |
| --- | --- | --- |
| disabled buttons | `.btn:disabled`, `.btn:disabled:hover` | Local disabled recipe: cursor, opacity, and hover neutralization. |
| selectable groups | `.selectable-group > *`, `.selectable-group > .is-selected:hover`, `.selectable-group > *:active` | Parent/child interaction recipe. |
| minimum-selection guard | `.min-selected-1 > .is-selected:only-of-type*` | JS/state invariant expressed through selectors. |
| radio labels | `.radio-label` | Local clickable label recipe. |
| state icons | `.seg-option svg` | Local icon alignment inside a control option. |

Reading: Ermine already owns the reusable visual side when a backed state can carry skin
(`selected:`, `checked:`, `pressed:`, `expanded:`, `current:`, and ordinary hover/focus
skin). What remains here is different: behavior and invariants. Disabled hover neutralization,
minimum-selection lockout, parent/child selectable-group mechanics, clickable-label affordance,
and local control icon alignment are project control contracts. They are good recipe boundary
evidence and poor flat-word candidates.

## Complete Rule Inventory

| file | selector | declarations | rule actions | outcome | residue declarations |
| --- | --- | --- | --- | --- | --- |
| `src/content/overlays/modal/modalStyles.css` | `.modal-backdrop` | 1 | attachment-edge-layer | local-identity | z-index: 10000 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `:host, #macro-suggestions` | 4 | typography-content, attachment-edge-layer | local-identity | font-family: 'IBM Plex Condensed Light', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif<br>line-height: 1.5<br>position: fixed !important<br>z-index: 2147483646 !important |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-command-item` | 1 | spacing-rhythm | recipe | padding: 3px 6px |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | `.macro-suggestions-container` | 1 | surface-line-elevation-cutout | recipe | box-shadow: 0 10px 25px -5px var(--shadow-color) |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | `.editor-content .content-editor-body` | 1 | dimension-constraint | recipe | flex: 1 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | `.editor-toast` | 2 | attachment-edge-layer, surface-line-elevation-cutout | recipe | bottom: 52px<br>box-shadow: 0 6px 16px -4px rgb(0 0 0 / 25%) |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-item-edit` | 1 | attachment-edge-layer | recipe | right: var(--spacing-sm) |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-item-text mark` | 3 | reset-inheritance-neutralization | recipe | background: transparent<br>color: inherit<br>font-style: normal |
| `src/styles/components/content-editor.css` | `.ce-style-dropdown` | 1 | spacing-rhythm | recipe | gap: 2px |
| `src/styles/components/content-editor.css` | `.ce-style-trigger` | 1 | spacing-rhythm | recipe | gap: 2px |
| `src/styles/components/content-editor.css` | `.ce-toolbar-sep` | 1 | surface-line-elevation-cutout | recipe | background-color: var(--harmonic) |
| `src/styles/entries/pages.css` | `.page-title` | 1 | typography-content | local-identity | font-family: 'IBM Plex Condensed Light', sans-serif |
| `src/styles/entries/pages.css` | `body` | 3 | typography-content, spacing-rhythm | local-identity | font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial<br>margin: 0<br>padding: 0 |
| `src/styles/fragments/semantic-fragments.css` | `::-webkit-scrollbar` | 2 | component-private-drawing | recipe | width: var(--spacing-md) !important<br>height: var(--spacing-md) !important |
| `src/styles/fragments/semantic-fragments.css` | `::-webkit-scrollbar-thumb` | 3 | component-private-drawing | recipe | background: var(--tone) !important<br>border-radius: var(--radius-md) !important<br>border: 1px solid var(--tone-dim) !important |
| `src/styles/fragments/semantic-fragments.css` | `::-webkit-scrollbar-thumb:hover` | 1 | component-private-drawing | recipe | background: var(--accent-dim) !important |
| `src/styles/fragments/semantic-fragments.css` | `::-webkit-scrollbar-track` | 2 | component-private-drawing | recipe | background: var(--tone-dim) !important<br>border-radius: var(--radius-md) !important |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content` | 2 | typography-content, reset-inheritance-neutralization | recipe | font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif<br>line-height: normal |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content a` | 2 | surface-line-elevation-cutout, typography-content | recipe | color: var(--accent)<br>text-decoration: underline |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content a:hover` | 1 | typography-content | recipe | opacity: 0.8 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content blockquote` | 5 | surface-line-elevation-cutout, spacing-rhythm, typography-content | recipe | border-left: 3px solid var(--accent-dim)<br>padding-left: var(--spacing-md)<br>margin: 0.75em 0<br>color: var(--ink-soft)<br>font-style: italic |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content code` | 6 | typography-content, surface-line-elevation-cutout, spacing-rhythm | recipe | font-family: 'IBM Plex Mono', 'Fira Code', monospace<br>font-size: 0.88em<br>background-color: var(--tone)<br>color: var(--ink)<br>padding: 0.1em 0.35em<br>border-radius: var(--radius-sm) |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content em, .sf-authored-content i` | 1 | typography-content | recipe | font-style: italic |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content h1` | 3 | typography-content, spacing-rhythm | recipe | font-size: 1.75em<br>font-weight: 700<br>margin: 0.75em 0 0.4em |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content h1:first-child, .sf-authored-content h2:first-child, .sf-authored-content h3:first-child` | 1 | spacing-rhythm | recipe | margin-top: 0 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content h2` | 3 | typography-content, spacing-rhythm | recipe | font-size: 1.4em<br>font-weight: 700<br>margin: 0.75em 0 0.4em |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content h3` | 3 | typography-content, spacing-rhythm | recipe | font-size: 1.15em<br>font-weight: 700<br>margin: 0.75em 0 0.4em |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content li` | 2 | typography-content, spacing-rhythm | recipe | display: list-item<br>margin-bottom: 0.2em |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content ol` | 1 | typography-content | recipe | list-style-type: decimal |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content p` | 1 | spacing-rhythm | recipe | margin-bottom: 0.75em |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content p:last-child` | 1 | spacing-rhythm | recipe | margin-bottom: 0 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content pre` | 7 | typography-content, surface-line-elevation-cutout, spacing-rhythm, reset-inheritance-neutralization | recipe | font-family: 'IBM Plex Mono', 'Fira Code', monospace<br>font-size: 0.88em<br>background-color: var(--tone)<br>padding: var(--spacing-md)<br>border-radius: var(--radius-sm)<br>overflow-x: auto<br>margin: 0.75em 0 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content s` | 1 | typography-content | recipe | text-decoration: line-through |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content strong, .sf-authored-content b` | 1 | typography-content | recipe | font-weight: 700 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content u` | 1 | typography-content | recipe | text-decoration: underline |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content ul` | 1 | typography-content | recipe | list-style-type: disc |
| `src/styles/fragments/semantic-fragments.css` | `.sf-authored-content ul, .sf-authored-content ol` | 2 | spacing-rhythm | recipe | padding-left: 1.5em<br>margin-bottom: 0.75em |
| `src/styles/fragments/semantic-fragments.css` | `.sf-callout-arrow` | 2 | component-private-drawing | recipe | width: 0<br>border: 6px solid transparent |
| `src/styles/fragments/semantic-fragments.css` | `.sf-callout-arrow-bottom` | 1 | component-private-drawing | recipe | border-bottom-color: var(--base-tone) |
| `src/styles/fragments/semantic-fragments.css` | `.sf-callout-arrow-top` | 1 | component-private-drawing | recipe | border-top-color: var(--base-tone) |
| `src/styles/fragments/semantic-fragments.css` | `.sf-generated-placeholder:empty::before` | 3 | component-private-drawing | recipe | content: attr(data-placeholder)<br>color: var(--ink-soft)<br>pointer-events: none |
| `src/styles/fragments/semantic-fragments.css` | `.sf-keycap` | 1 | component-private-drawing | recipe | padding: 1px 4px |
| `src/styles/fragments/semantic-fragments.css` | `.sf-keycap-raised` | 5 | component-private-drawing | recipe | line-height: 1<br>padding: 3px 6px 6px<br>min-width: 26px<br>border-radius: 4px<br>z-index: 0 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-keycap-raised::after` | 8 | component-private-drawing | recipe | content: ''<br>position: absolute<br>background: var(--tone-dim)<br>inset: 0 2px 4px<br>border: 1px solid var(--harmonic-minor)<br>border-radius: 2px<br>pointer-events: none<br>z-index: -1 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-keycap-raised:first-child` | 1 | component-private-drawing | recipe | margin-left: 0 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-segmented-control-option svg` | 1 | interaction-affordance-state | recipe | vertical-align: middle |
| `src/styles/fragments/semantic-fragments.css` | `.sf-segmented-pill::before` | 10 | component-private-drawing, motion-transition | recipe | content: ''<br>position: absolute<br>top: 0<br>bottom: 0<br>left: var(--pill-left, 0)<br>width: var(--pill-width, 0)<br>background: var(--accent)<br>opacity: 0<br>transition: left 0.1s ease, width 0.1s ease<br>pointer-events: none |
| `src/styles/fragments/semantic-fragments.css` | `.sf-segmented-pill.is-sliding .sf-segmented-control-option[aria-checked="true"]` | 1 | component-private-drawing | recipe | background: transparent |
| `src/styles/fragments/semantic-fragments.css` | `.sf-segmented-pill.is-sliding::before` | 1 | component-private-drawing | recipe | opacity: 1 |
| `src/styles/fragments/semantic-fragments.css` | `.sf-segmented-pill.seg-snap::before` | 1 | motion-transition | recipe | transition: none |
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
