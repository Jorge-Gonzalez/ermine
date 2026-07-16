# Monky Residue Detail

Generated from `reports/adoption/monky/current-ledger.json`. This lists every current Monky declaration counted as project-owned residue, excluding adopted/infrastructure and zero review buckets.

## Provenance

| source | commit |
|---|---|
| Ermine | `a3a421271201` |
| monky | `3052c7043fa7` |

## Summary

- Current declarations: 532
- Adopted/infrastructure declarations: 352
- Project-owned residue declarations: 180
- Assimilable declarations: 0
- Shadowed words: 0

| code | declarations | meaning |
|---|---:|---|
| `recipe-identity` | 23 | Project recipe bundles licensed by R-SKIN-10. |
| `brand-identity` | 8 | Monky-specific brand typography and type treatment. |
| `component-contract` | 10 | Component-owned mechanics, exact geometry, or product contract. |
| `state-mechanics` | 5 | Native/JS state mechanics outside backed Ermine conditions. |
| `aria-current` | 1 | Current-state layer mechanics left local around ruled current: skin. |
| `parent-relational` | 8 | Guarded parent/descendant state mechanics outside ruled relational words. |
| `pseudo-mechanics` | 23 | Pseudo-element geometry, generated content, and fills. |
| `scrollbar-followup` | 9 | Engine-drawn scrollbar identity outside R-SKIN-15 standard properties. |
| `motion-followup` | 1 | Transition/animation timing evidence for the animation-plane follow-up. |
| `opacity-followup` | 4 | Opacity prominence/treatment evidence. |
| `elevation-followup` | 3 | Identity shadows/rings outside the shared elevated treatment. |
| `reset-absence` | 12 | Absence/reset/transparent mechanics, not positive style carriers. |
| `user-content` | 43 | Rich-text defaults inside user-authored editor content. |
| `identity-geometry` | 30 | Project-exact dimensions, spacing, positioning, and geometry. |

## recipe-identity (23)

Project recipe bundles licensed by R-SKIN-10.

### src/content/overlays/views/settings/settingsViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 50 | `.seg-option svg` | `vertical-align: middle` |
| 55 | `.seg-option:last-child` | `border-right: none` |
| 59 | `.seg-option[aria-checked="true"]` | `border-right-color: transparent` |

### src/styles/skin/controls.css (20)

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
| 82 | `.selectable-group > .is-selected` | `background-color: var(--accent)` |
| 83 | `.selectable-group > .is-selected` | `color: var(--ink-alt)` |
| 84 | `.selectable-group > .is-selected` | `border-color: var(--accent)` |
| 88 | `.selectable-group > .is-selected:hover` | `background-color: var(--accent)` |
| 89 | `.selectable-group > .is-selected:hover` | `opacity: 0.9` |

## brand-identity (8)

Monky-specific brand typography and type treatment.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 56 | `.modal-nav-label` | `font-size: var(--text-base)` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 3 | `:host, #macro-suggestions` | `font-family: 'IBM Plex Condensed Light', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| 4 | `:host, #macro-suggestions` | `line-height: 1.5` |

### src/content/overlays/views/search/searchViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 48 | `.modal-command-item .modal-command-description` | `font-style: italic` |
| 65 | `.macro-search-kbd` | `line-height: 1` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 59 | `.content-editor-body` | `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 12 | `.page-title` | `font-family: 'IBM Plex Condensed Light', sans-serif` |
| 16 | `body` | `font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial` |

## component-contract (10)

Component-owned mechanics, exact geometry, or product contract.

### src/content/overlays/modal/modalStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 19 | `.modal-backdrop` | `background-color: var(--shadow-color)` |
| 28 | `.modal-dialog` | `mix-blend-mode: multiply` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 10 | `#macro-suggestions *` | `box-sizing: border-box` |
| 29 | `.macro-suggestions-arrow.top` | `border-top-color: var(--base-tone)` |
| 33 | `.macro-suggestions-arrow.bottom` | `border-bottom-color: var(--base-tone)` |

### src/content/overlays/views/search/searchViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 9 | `.macro-search-results` | `align-content: start` |
| 68 | `.macro-search-kbd` | `border-radius: 4px` |

### src/popup/popup.css (1)

| line | selector | declaration |
|---:|---|---|
| 16 | `.popup-search-input` | `box-sizing: border-box` |

### src/styles/components/content-editor.css (2)

| line | selector | declaration |
|---:|---|---|
| 10 | `.ce-toolbar-sep` | `background-color: var(--harmonic)` |
| 38 | `.ce-style-dropdown` | `left: 0` |

## state-mechanics (5)

Native/JS state mechanics outside backed Ermine conditions.

### src/styles/components/content-editor.css (4)

| line | selector | declaration |
|---:|---|---|
| 19 | `.ce-toolbar-btn.is-active` | `background-color: var(--tone)` |
| 20 | `.ce-toolbar-btn.is-active` | `color: var(--accent)` |
| 43 | `.ce-style-option.is-active` | `color: var(--accent)` |
| 44 | `.ce-style-option.is-active` | `background-color: var(--tone)` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 93 | `.min-selected-1 > .is-selected:only-of-type` | `cursor: not-allowed` |

## aria-current (1)

Current-state layer mechanics left local around ruled current: skin.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 52 | `.modal-nav-tab[aria-current="page"]` | `border-bottom-color: var(--accent)` |

## parent-relational (8)

Guarded parent/descendant state mechanics outside ruled relational words.

### src/content/overlays/views/search/searchViewStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 14 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `white-space: normal` |
| 15 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `overflow: visible` |
| 16 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `text-overflow: clip` |
| 21 | `.macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-text` | `background-color: var(--tone-dim)` |
| 26 | `.macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-text` | `background-color: var(--tone)` |

### src/content/overlays/views/settings/settingsViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 65 | `.seg-control.is-sliding .seg-option[aria-checked="true"]` | `background: transparent` |

### src/popup/popup.css (1)

| line | selector | declaration |
|---:|---|---|
| 12 | `.popup-button:hover, .popup-icon-button:hover` | `opacity: 0.9` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 48 | `.ce-style-option.is-active .ce-style-option-short` | `color: var(--accent)` |

## pseudo-mechanics (23)

Pseudo-element geometry, generated content, and fills.

### src/content/overlays/views/search/searchViewStyles.css (8)

| line | selector | declaration |
|---:|---|---|
| 73 | `.macro-search-kbd::after` | `content: ''` |
| 74 | `.macro-search-kbd::after` | `position: absolute` |
| 75 | `.macro-search-kbd::after` | `background: var(--tone-dim)` |
| 76 | `.macro-search-kbd::after` | `inset: 0 2px 4px` |
| 77 | `.macro-search-kbd::after` | `border: 1px solid var(--harmonic-minor)` |
| 78 | `.macro-search-kbd::after` | `border-radius: 2px` |
| 79 | `.macro-search-kbd::after` | `pointer-events: none` |
| 80 | `.macro-search-kbd::after` | `z-index: -1` |

### src/content/overlays/views/settings/settingsViewStyles.css (12)

| line | selector | declaration |
|---:|---|---|
| 30 | `.seg-control::before` | `content: ''` |
| 31 | `.seg-control::before` | `position: absolute` |
| 32 | `.seg-control::before` | `top: 0` |
| 33 | `.seg-control::before` | `bottom: 0` |
| 34 | `.seg-control::before` | `left: var(--pill-left, 0)` |
| 35 | `.seg-control::before` | `width: var(--pill-width, 0)` |
| 36 | `.seg-control::before` | `background: var(--accent)` |
| 37 | `.seg-control::before` | `opacity: 0` |
| 38 | `.seg-control::before` | `transition: left 0.1s ease, width 0.1s ease` |
| 39 | `.seg-control::before` | `pointer-events: none` |
| 42 | `.seg-control.is-sliding::before` | `opacity: 1` |
| 45 | `.seg-control.seg-snap::before` | `transition: none` |

### src/styles/components/content-editor.css (3)

| line | selector | declaration |
|---:|---|---|
| 64 | `.content-editor-body:empty::before` | `content: attr(data-placeholder)` |
| 65 | `.content-editor-body:empty::before` | `color: var(--ink-soft)` |
| 66 | `.content-editor-body:empty::before` | `pointer-events: none` |

## scrollbar-followup (9)

Engine-drawn scrollbar identity outside R-SKIN-15 standard properties.

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

### src/styles/theme/metrics.css (1)

| line | selector | declaration |
|---:|---|---|
| 89 | `:root, :host` | `scrollbar-color: var(--tone) var(--tone-dim)` |

## motion-followup (1)

Transition/animation timing evidence for the animation-plane follow-up.

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 104 | `.shake` | `transition: none !important` |

## opacity-followup (4)

Opacity prominence/treatment evidence.

### src/content/overlays/views/search/searchViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 41 | `.macro-search-item-text mark span` | `opacity: 0.35` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 33 | `.ce-style-caret` | `opacity: 0.6` |

### src/styles/skin/controls.css (2)

| line | selector | declaration |
|---:|---|---|
| 94 | `.min-selected-1 > .is-selected:only-of-type` | `opacity: 0.95` |
| 98 | `.min-selected-1 > .is-selected:only-of-type:hover` | `opacity: 0.95` |

## elevation-followup (3)

Identity shadows/rings outside the shared elevated treatment.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 27 | `.modal-dialog` | `box-shadow: rgba(31, 32, 34, 0.3) 0px 1px 2px 0px, rgba(31, 32, 34, 0.15) 0px 2px 6px 2px` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 20 | `.macro-suggestions-container` | `box-shadow: 0 10px 25px -5px var(--shadow-color)` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 13 | `.editor-toast` | `box-shadow: 0 6px 16px -4px rgb(0 0 0 / 25%)` |

## reset-absence (12)

Absence/reset/transparent mechanics, not positive style carriers.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 45 | `.modal-nav-tab` | `border-bottom: 2px solid transparent` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 16 | `button, input, textarea, select` | `font-family: inherit` |
| 25 | `.macro-suggestions-arrow` | `border: 6px solid transparent` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 18 | `.command-suggestions` | `border-top: none` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 35 | `.macro-search-item-text mark` | `background: transparent` |
| 36 | `.macro-search-item-text mark` | `color: inherit` |
| 37 | `.macro-search-item-text mark` | `font-style: normal` |

### src/popup/popup.css (4)

| line | selector | declaration |
|---:|---|---|
| 7 | `.popup-button, .popup-icon-button` | `border: none` |
| 21 | `.popup-item-toggle` | `border: none` |
| 22 | `.popup-item-toggle` | `background: transparent` |
| 35 | `.popup-results` | `list-style: none` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 60 | `.content-editor-body` | `line-height: normal` |

## user-content (43)

Rich-text defaults inside user-authored editor content.

### src/styles/components/content-editor.css (43)

| line | selector | declaration |
|---:|---|---|
| 71 | `.content-editor-body p` | `margin-bottom: 0.75em` |
| 75 | `.content-editor-body p:last-child` | `margin-bottom: 0` |
| 79 | `.content-editor-body h1` | `font-size: 1.75em` |
| 80 | `.content-editor-body h1` | `font-weight: 700` |
| 81 | `.content-editor-body h1` | `margin: 0.75em 0 0.4em` |
| 85 | `.content-editor-body h2` | `font-size: 1.4em` |
| 86 | `.content-editor-body h2` | `font-weight: 700` |
| 87 | `.content-editor-body h2` | `margin: 0.75em 0 0.4em` |
| 91 | `.content-editor-body h3` | `font-size: 1.15em` |
| 92 | `.content-editor-body h3` | `font-weight: 700` |
| 93 | `.content-editor-body h3` | `margin: 0.75em 0 0.4em` |
| 99 | `.content-editor-body h1:first-child, .content-editor-body h2:first-child, .content-editor-body h3:first-child` | `margin-top: 0` |
| 104 | `.content-editor-body strong, .content-editor-body b` | `font-weight: 700` |
| 109 | `.content-editor-body em, .content-editor-body i` | `font-style: italic` |
| 113 | `.content-editor-body u` | `text-decoration: underline` |
| 117 | `.content-editor-body s` | `text-decoration: line-through` |
| 121 | `.content-editor-body code` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 122 | `.content-editor-body code` | `font-size: 0.88em` |
| 123 | `.content-editor-body code` | `background-color: var(--tone)` |
| 124 | `.content-editor-body code` | `color: var(--ink)` |
| 125 | `.content-editor-body code` | `padding: 0.1em 0.35em` |
| 126 | `.content-editor-body code` | `border-radius: var(--radius-sm)` |
| 130 | `.content-editor-body pre` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 131 | `.content-editor-body pre` | `font-size: 0.88em` |
| 132 | `.content-editor-body pre` | `background-color: var(--tone)` |
| 133 | `.content-editor-body pre` | `padding: var(--spacing-md)` |
| 134 | `.content-editor-body pre` | `border-radius: var(--radius-sm)` |
| 135 | `.content-editor-body pre` | `overflow-x: auto` |
| 136 | `.content-editor-body pre` | `margin: 0.75em 0` |
| 140 | `.content-editor-body blockquote` | `border-left: 3px solid var(--accent-dim)` |
| 141 | `.content-editor-body blockquote` | `padding-left: var(--spacing-md)` |
| 142 | `.content-editor-body blockquote` | `margin: 0.75em 0` |
| 143 | `.content-editor-body blockquote` | `color: var(--ink-soft)` |
| 144 | `.content-editor-body blockquote` | `font-style: italic` |
| 149 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `padding-left: 1.5em` |
| 150 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `margin-bottom: 0.75em` |
| 154 | `.content-editor .content-editor-body ul` | `list-style-type: disc` |
| 158 | `.content-editor .content-editor-body ol` | `list-style-type: decimal` |
| 162 | `.content-editor-body li` | `display: list-item` |
| 163 | `.content-editor-body li` | `margin-bottom: 0.2em` |
| 167 | `.content-editor-body a` | `color: var(--accent)` |
| 168 | `.content-editor-body a` | `text-decoration: underline` |
| 172 | `.content-editor-body a:hover` | `opacity: 0.8` |

## identity-geometry (30)

Project-exact dimensions, spacing, positioning, and geometry.

### src/content/overlays/modal/modalStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 20 | `.modal-backdrop` | `z-index: 10000` |
| 32 | `.modal-nav-branding` | `margin-right: 1rem` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 5 | `:host, #macro-suggestions` | `position: fixed !important` |
| 6 | `:host, #macro-suggestions` | `z-index: 2147483646 !important` |
| 24 | `.macro-suggestions-arrow` | `width: 0` |
| 37 | `.macro-suggestions-command-item` | `padding: 3px 6px` |
| 42 | `.macro-suggestions-kbd` | `padding: 1px 4px` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 7 | `.editor-content .content-editor-body` | `flex: 1` |
| 12 | `.editor-toast` | `bottom: 52px` |

### src/content/overlays/views/search/searchViewStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 31 | `.macro-search-item-edit` | `right: var(--spacing-sm)` |
| 66 | `.macro-search-kbd` | `padding: 3px 6px 6px` |
| 67 | `.macro-search-kbd` | `min-width: 26px` |
| 69 | `.macro-search-kbd` | `z-index: 0` |
| 84 | `.macro-search-kbd:first-child` | `margin-left: 0` |

### src/content/overlays/views/settings/settingsViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 9 | `.settings-body` | `padding: var(--spacing-2xl) 0 var(--spacing-xl)` |
| 15 | `.settings-section-label` | `padding: var(--spacing-md) var(--spacing-sm) 0 0` |
| 20 | `.settings-prefix-btn` | `padding: 0` |

### src/popup/popup.css (3)

| line | selector | declaration |
|---:|---|---|
| 26 | `.popup-macro-text` | `margin: 0` |
| 33 | `.popup-results` | `padding: var(--spacing-sm) 0` |
| 34 | `.popup-results` | `margin: 0` |

### src/styles/components/content-editor.css (8)

| line | selector | declaration |
|---:|---|---|
| 11 | `.ce-toolbar-sep` | `margin: 0 var(--spacing-xs)` |
| 15 | `.ce-toolbar-btn` | `padding: 0` |
| 24 | `.ce-toolbar-icon` | `padding: 0 var(--spacing-xs)` |
| 29 | `.ce-style-trigger` | `padding: 0 var(--spacing-xs)` |
| 30 | `.ce-style-trigger` | `gap: 2px` |
| 37 | `.ce-style-dropdown` | `top: calc(100% + 4px)` |
| 39 | `.ce-style-dropdown` | `gap: 2px` |
| 52 | `.ce-link-input` | `padding: 0 var(--spacing-sm)` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 17 | `body` | `margin: 0` |
| 18 | `body` | `padding: 0` |

