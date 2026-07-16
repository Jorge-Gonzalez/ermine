# Monky Residue Detail

Generated from `reports/adoption/monky/current-ledger.json`. This lists every current Monky declaration counted as project-owned residue, excluding adopted/infrastructure and zero review buckets.

Regenerate with:

```sh
node --import tsx adoption/residue-detail.ts --name monky --write
```

## Provenance

| source | commit |
|---|---|
| Ermine | `9bb1d71c341b389ad64877bbb70f2efe7f045214` |
| monky | `bec19d4d1734f04fc02abac3f89664dfb0c6ccb4` |

## Summary

- Current declarations: 523
- Adopted/infrastructure declarations: 388
- Project-owned residue declarations: 135
- Assimilable declarations: 0
- Shadowed words: 0

| code | declarations | meaning |
|---|---:|---|
| `recipe-identity` | 17 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `brand-identity` | 6 | project brand typography and type treatment |
| `component-contract` | 7 | component-owned mechanics, exact geometry, or product contract |
| `state-mechanics` | 1 | JS/native state mechanics outside backed Ermine conditions |
| `parent-relational` | 1 | guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13) |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 8 | engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15) |
| `motion-followup` | 1 | transition/animation timing (deferred to GAP-U-animation-plane) |
| `opacity-followup` | 2 | opacity state treatment (named follow-up question) |
| `elevation-followup` | 3 | box-shadow outside the elevated treatment — rings and identity signatures (R-SKIN-09) |
| `reset-absence` | 5 | absence/reset mechanics, not a positive carrier |
| `user-content` | 43 | rich-text defaults inside user-authored content |
| `identity-geometry` | 18 | project-exact geometry on a grammar-family property |

## recipe-identity (17)

a project recipe class bundle (R-SKIN-10) — socket-consuming product identity

### src/content/overlays/views/settings/settingsViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 35 | `.seg-option svg` | `vertical-align: middle` |

### src/styles/skin/controls.css (16)

| line | selector | declaration |
|---:|---|---|
| 4 | `.input-error:focus` | `box-shadow: inset 0 0 0 2px var(--status-error-wash)` |
| 8 | `.radio-label` | `cursor: pointer` |
| 9 | `.radio-label` | `user-select: none` |
| 15 | `.btn-success:hover` | `background-color: color-mix(in oklch, var(--status-success) 82%, var(--shadow-color))` |
| 19 | `.btn-link` | `text-decoration: none` |
| 23 | `.btn-link:hover` | `text-decoration: underline` |
| 27 | `.btn-link-danger` | `text-decoration: none` |
| 31 | `.btn-link-danger:hover` | `text-decoration: underline` |
| 35 | `.btn:disabled` | `cursor: not-allowed` |
| 36 | `.btn:disabled` | `opacity: 0.6` |
| 40 | `.btn:disabled:hover` | `background-color: var(--tone-dim)` |
| 41 | `.btn:disabled:hover` | `opacity: 0.6` |
| 73 | `.selectable-group > *` | `cursor: pointer` |
| 74 | `.selectable-group > *` | `user-select: none` |
| 78 | `.selectable-group > *:active` | `transform: scale(0.98)` |
| 82 | `.selectable-group > .is-selected:hover` | `opacity: 0.9` |

## brand-identity (6)

project brand typography and type treatment

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 3 | `:host, #macro-suggestions` | `font-family: 'IBM Plex Condensed Light', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| 4 | `:host, #macro-suggestions` | `line-height: 1.5` |

### src/content/overlays/views/search/searchViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 32 | `.macro-search-kbd` | `line-height: 1` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 29 | `.content-editor-body` | `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 12 | `.page-title` | `font-family: 'IBM Plex Condensed Light', sans-serif` |
| 16 | `body` | `font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial` |

## component-contract (7)

component-owned mechanics, exact geometry, or product contract

### src/content/overlays/modal/modalStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 19 | `.modal-backdrop` | `background-color: var(--shadow-color)` |
| 28 | `.modal-dialog` | `mix-blend-mode: multiply` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 19 | `.macro-suggestions-arrow.top` | `border-top-color: var(--base-tone)` |
| 23 | `.macro-suggestions-arrow.bottom` | `border-bottom-color: var(--base-tone)` |

### src/content/overlays/views/search/searchViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 35 | `.macro-search-kbd` | `border-radius: 4px` |

### src/styles/components/content-editor.css (2)

| line | selector | declaration |
|---:|---|---|
| 10 | `.ce-toolbar-sep` | `background-color: var(--harmonic)` |
| 21 | `.ce-style-dropdown` | `left: 0` |

## state-mechanics (1)

JS/native state mechanics outside backed Ermine conditions

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 86 | `.min-selected-1 > .is-selected:only-of-type` | `cursor: not-allowed` |

## parent-relational (1)

guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13)

### src/content/overlays/views/settings/settingsViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 41 | `.seg-control.is-sliding .seg-option[aria-checked="true"]` | `background: transparent` |

## pseudo-mechanics (23)

pseudo-element geometry, fills, and content

### src/content/overlays/views/search/searchViewStyles.css (8)

| line | selector | declaration |
|---:|---|---|
| 40 | `.macro-search-kbd::after` | `content: ''` |
| 41 | `.macro-search-kbd::after` | `position: absolute` |
| 42 | `.macro-search-kbd::after` | `background: var(--tone-dim)` |
| 43 | `.macro-search-kbd::after` | `inset: 0 2px 4px` |
| 44 | `.macro-search-kbd::after` | `border: 1px solid var(--harmonic-minor)` |
| 45 | `.macro-search-kbd::after` | `border-radius: 2px` |
| 46 | `.macro-search-kbd::after` | `pointer-events: none` |
| 47 | `.macro-search-kbd::after` | `z-index: -1` |

### src/content/overlays/views/settings/settingsViewStyles.css (12)

| line | selector | declaration |
|---:|---|---|
| 15 | `.seg-control::before` | `content: ''` |
| 16 | `.seg-control::before` | `position: absolute` |
| 17 | `.seg-control::before` | `top: 0` |
| 18 | `.seg-control::before` | `bottom: 0` |
| 19 | `.seg-control::before` | `left: var(--pill-left, 0)` |
| 20 | `.seg-control::before` | `width: var(--pill-width, 0)` |
| 21 | `.seg-control::before` | `background: var(--accent)` |
| 22 | `.seg-control::before` | `opacity: 0` |
| 23 | `.seg-control::before` | `transition: left 0.1s ease, width 0.1s ease` |
| 24 | `.seg-control::before` | `pointer-events: none` |
| 27 | `.seg-control.is-sliding::before` | `opacity: 1` |
| 30 | `.seg-control.seg-snap::before` | `transition: none` |

### src/styles/components/content-editor.css (3)

| line | selector | declaration |
|---:|---|---|
| 34 | `.content-editor-body:empty::before` | `content: attr(data-placeholder)` |
| 35 | `.content-editor-body:empty::before` | `color: var(--ink-soft)` |
| 36 | `.content-editor-body:empty::before` | `pointer-events: none` |

## scrollbar-followup (8)

engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15)

### src/styles/skin/controls.css (8)

| line | selector | declaration |
|---:|---|---|
| 50 | `::-webkit-scrollbar` | `width: var(--spacing-md) !important` |
| 51 | `::-webkit-scrollbar` | `height: var(--spacing-md) !important` |
| 55 | `::-webkit-scrollbar-track` | `background: var(--tone-dim) !important` |
| 56 | `::-webkit-scrollbar-track` | `border-radius: var(--radius-md) !important` |
| 60 | `::-webkit-scrollbar-thumb` | `background: var(--tone) !important` |
| 61 | `::-webkit-scrollbar-thumb` | `border-radius: var(--radius-md) !important` |
| 62 | `::-webkit-scrollbar-thumb` | `border: 1px solid var(--tone-dim) !important` |
| 66 | `::-webkit-scrollbar-thumb:hover` | `background: var(--accent-dim) !important` |

## motion-followup (1)

transition/animation timing (deferred to GAP-U-animation-plane)

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 97 | `.shake` | `transition: none !important` |

## opacity-followup (2)

opacity state treatment (named follow-up question)

### src/styles/skin/controls.css (2)

| line | selector | declaration |
|---:|---|---|
| 87 | `.min-selected-1 > .is-selected:only-of-type` | `opacity: 0.95` |
| 91 | `.min-selected-1 > .is-selected:only-of-type:hover` | `opacity: 0.95` |

## elevation-followup (3)

box-shadow outside the elevated treatment — rings and identity signatures (R-SKIN-09)

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 27 | `.modal-dialog` | `box-shadow: rgba(31, 32, 34, 0.3) 0px 1px 2px 0px, rgba(31, 32, 34, 0.15) 0px 2px 6px 2px` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 10 | `.macro-suggestions-container` | `box-shadow: 0 10px 25px -5px var(--shadow-color)` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 13 | `.editor-toast` | `box-shadow: 0 6px 16px -4px rgb(0 0 0 / 25%)` |

## reset-absence (5)

absence/reset mechanics, not a positive carrier

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 15 | `.macro-suggestions-arrow` | `border: 6px solid transparent` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 13 | `.macro-search-item-text mark` | `background: transparent` |
| 14 | `.macro-search-item-text mark` | `color: inherit` |
| 15 | `.macro-search-item-text mark` | `font-style: normal` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 30 | `.content-editor-body` | `line-height: normal` |

## user-content (43)

rich-text defaults inside user-authored content

### src/styles/components/content-editor.css (43)

| line | selector | declaration |
|---:|---|---|
| 41 | `.content-editor-body p` | `margin-bottom: 0.75em` |
| 45 | `.content-editor-body p:last-child` | `margin-bottom: 0` |
| 49 | `.content-editor-body h1` | `font-size: 1.75em` |
| 50 | `.content-editor-body h1` | `font-weight: 700` |
| 51 | `.content-editor-body h1` | `margin: 0.75em 0 0.4em` |
| 55 | `.content-editor-body h2` | `font-size: 1.4em` |
| 56 | `.content-editor-body h2` | `font-weight: 700` |
| 57 | `.content-editor-body h2` | `margin: 0.75em 0 0.4em` |
| 61 | `.content-editor-body h3` | `font-size: 1.15em` |
| 62 | `.content-editor-body h3` | `font-weight: 700` |
| 63 | `.content-editor-body h3` | `margin: 0.75em 0 0.4em` |
| 69 | `.content-editor-body h1:first-child, .content-editor-body h2:first-child, .content-editor-body h3:first-child` | `margin-top: 0` |
| 74 | `.content-editor-body strong, .content-editor-body b` | `font-weight: 700` |
| 79 | `.content-editor-body em, .content-editor-body i` | `font-style: italic` |
| 83 | `.content-editor-body u` | `text-decoration: underline` |
| 87 | `.content-editor-body s` | `text-decoration: line-through` |
| 91 | `.content-editor-body code` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 92 | `.content-editor-body code` | `font-size: 0.88em` |
| 93 | `.content-editor-body code` | `background-color: var(--tone)` |
| 94 | `.content-editor-body code` | `color: var(--ink)` |
| 95 | `.content-editor-body code` | `padding: 0.1em 0.35em` |
| 96 | `.content-editor-body code` | `border-radius: var(--radius-sm)` |
| 100 | `.content-editor-body pre` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 101 | `.content-editor-body pre` | `font-size: 0.88em` |
| 102 | `.content-editor-body pre` | `background-color: var(--tone)` |
| 103 | `.content-editor-body pre` | `padding: var(--spacing-md)` |
| 104 | `.content-editor-body pre` | `border-radius: var(--radius-sm)` |
| 105 | `.content-editor-body pre` | `overflow-x: auto` |
| 106 | `.content-editor-body pre` | `margin: 0.75em 0` |
| 110 | `.content-editor-body blockquote` | `border-left: 3px solid var(--accent-dim)` |
| 111 | `.content-editor-body blockquote` | `padding-left: var(--spacing-md)` |
| 112 | `.content-editor-body blockquote` | `margin: 0.75em 0` |
| 113 | `.content-editor-body blockquote` | `color: var(--ink-soft)` |
| 114 | `.content-editor-body blockquote` | `font-style: italic` |
| 119 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `padding-left: 1.5em` |
| 120 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `margin-bottom: 0.75em` |
| 124 | `.content-editor .content-editor-body ul` | `list-style-type: disc` |
| 128 | `.content-editor .content-editor-body ol` | `list-style-type: decimal` |
| 132 | `.content-editor-body li` | `display: list-item` |
| 133 | `.content-editor-body li` | `margin-bottom: 0.2em` |
| 137 | `.content-editor-body a` | `color: var(--accent)` |
| 138 | `.content-editor-body a` | `text-decoration: underline` |
| 142 | `.content-editor-body a:hover` | `opacity: 0.8` |

## identity-geometry (18)

project-exact geometry on a grammar-family property

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 20 | `.modal-backdrop` | `z-index: 10000` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 5 | `:host, #macro-suggestions` | `position: fixed !important` |
| 6 | `:host, #macro-suggestions` | `z-index: 2147483646 !important` |
| 14 | `.macro-suggestions-arrow` | `width: 0` |
| 27 | `.macro-suggestions-command-item` | `padding: 3px 6px` |
| 32 | `.macro-suggestions-kbd` | `padding: 1px 4px` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 7 | `.editor-content .content-editor-body` | `flex: 1` |
| 12 | `.editor-toast` | `bottom: 52px` |

### src/content/overlays/views/search/searchViewStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 9 | `.macro-search-item-edit` | `right: var(--spacing-sm)` |
| 33 | `.macro-search-kbd` | `padding: 3px 6px 6px` |
| 34 | `.macro-search-kbd` | `min-width: 26px` |
| 36 | `.macro-search-kbd` | `z-index: 0` |
| 51 | `.macro-search-kbd:first-child` | `margin-left: 0` |

### src/styles/components/content-editor.css (3)

| line | selector | declaration |
|---:|---|---|
| 15 | `.ce-style-trigger` | `gap: 2px` |
| 20 | `.ce-style-dropdown` | `top: calc(100% + 4px)` |
| 22 | `.ce-style-dropdown` | `gap: 2px` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 17 | `body` | `margin: 0` |
| 18 | `body` | `padding: 0` |
