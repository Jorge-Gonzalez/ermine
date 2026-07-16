# Monky Residue Detail

Generated from `reports/adoption/monky/current-ledger.json`. This lists every current Monky declaration counted as project-owned residue, excluding adopted/infrastructure and zero review buckets.

## Provenance

| source | commit |
|---|---|
| Ermine | `b2946ce0be25` |
| monky | `caabf9136551` |

## Summary

- Current declarations: 514
- Adopted/infrastructure declarations: 260
- Project-owned residue declarations: 254
- Assimilable declarations: 0
- Shadowed words: 0

| code | declarations | meaning |
|---|---:|---|
| `recipe-identity` | 30 | Project recipe bundles licensed by R-SKIN-10. |
| `brand-identity` | 8 | Monky-specific brand typography and type treatment. |
| `component-contract` | 39 | Component-owned mechanics, exact geometry, or product contract. |
| `state-mechanics` | 5 | Native/JS state mechanics outside backed Ermine conditions. |
| `aria-current` | 1 | Current-state layer mechanics left local around ruled current: skin. |
| `parent-relational` | 8 | Guarded parent/descendant state mechanics outside ruled relational words. |
| `pseudo-mechanics` | 23 | Pseudo-element geometry, generated content, and fills. |
| `scrollbar-followup` | 9 | Engine-drawn scrollbar identity outside R-SKIN-15 standard properties. |
| `motion-followup` | 13 | Transition/animation timing evidence for the animation-plane follow-up. |
| `opacity-followup` | 4 | Opacity prominence/treatment evidence. |
| `elevation-followup` | 3 | Identity shadows/rings outside the shared elevated treatment. |
| `reset-absence` | 12 | Absence/reset/transparent mechanics, not positive style carriers. |
| `user-content` | 43 | Rich-text defaults inside user-authored editor content. |
| `identity-geometry` | 56 | Project-exact dimensions, spacing, positioning, and geometry. |

## recipe-identity (30)

Project recipe bundles licensed by R-SKIN-10.

### src/content/overlays/views/macroEditor/editorViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 40 | `.input-dropdown-open` | `border-bottom-left-radius: 0` |
| 41 | `.input-dropdown-open` | `border-bottom-right-radius: 0` |

### src/content/overlays/views/settings/settingsViewStyles.css (6)

| line | selector | declaration |
|---:|---|---|
| 61 | `.seg-option` | `white-space: nowrap` |
| 62 | `.seg-option` | `z-index: 1` |
| 63 | `.seg-option` | `transition: color var(--transition-fast)` |
| 69 | `.seg-option svg` | `vertical-align: middle` |
| 74 | `.seg-option:last-child` | `border-right: none` |
| 78 | `.seg-option[aria-checked="true"]` | `border-right-color: transparent` |

### src/styles/skin/controls.css (22)

| line | selector | declaration |
|---:|---|---|
| 4 | `.input` | `width: 100%` |
| 5 | `.input` | `transition: border-color var(--transition-fast)` |
| 9 | `.input-error:focus` | `box-shadow: inset 0 0 0 2px var(--status-error-wash)` |
| 12 | `.radio-label` | `cursor: pointer` |
| 13 | `.radio-label` | `user-select: none` |
| 24 | `.btn-success:hover` | `background-color: color-mix(in oklch, var(--status-success) 82%, var(--shadow-color))` |
| 28 | `.btn-link` | `text-decoration: none` |
| 32 | `.btn-link:hover` | `text-decoration: underline` |
| 36 | `.btn-link-danger` | `text-decoration: none` |
| 40 | `.btn-link-danger:hover` | `text-decoration: underline` |
| 44 | `.btn:disabled` | `cursor: not-allowed` |
| 45 | `.btn:disabled` | `opacity: 0.6` |
| 49 | `.btn:disabled:hover` | `background-color: var(--tone-dim)` |
| 50 | `.btn:disabled:hover` | `opacity: 0.6` |
| 82 | `.selectable-group > *` | `cursor: pointer` |
| 83 | `.selectable-group > *` | `user-select: none` |
| 87 | `.selectable-group > *:active` | `transform: scale(0.98)` |
| 91 | `.selectable-group > .is-selected` | `background-color: var(--accent)` |
| 92 | `.selectable-group > .is-selected` | `color: var(--ink-alt)` |
| 93 | `.selectable-group > .is-selected` | `border-color: var(--accent)` |
| 97 | `.selectable-group > .is-selected:hover` | `background-color: var(--accent)` |
| 98 | `.selectable-group > .is-selected:hover` | `opacity: 0.9` |

## brand-identity (8)

Monky-specific brand typography and type treatment.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 69 | `.modal-nav-label` | `font-size: var(--text-base)` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 3 | `:host, #macro-suggestions` | `font-family: 'IBM Plex Condensed Light', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| 4 | `:host, #macro-suggestions` | `line-height: 1.5` |

### src/content/overlays/views/search/searchViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 72 | `.modal-command-item .modal-command-description` | `font-style: italic` |
| 93 | `.macro-search-kbd` | `line-height: 1` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 77 | `.content-editor-body` | `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 12 | `.page-title` | `font-family: 'IBM Plex Condensed Light', sans-serif` |
| 16 | `body` | `font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial` |

## component-contract (39)

Component-owned mechanics, exact geometry, or product contract.

### src/content/overlays/modal/modalStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 19 | `.modal-backdrop` | `background-color: var(--shadow-color)` |
| 28 | `.modal-dialog` | `mix-blend-mode: multiply` |
| 29 | `.modal-dialog` | `width: min(600px, calc(100vw - 2rem))` |
| 30 | `.modal-dialog` | `height: min(560px, 85vh)` |
| 65 | `.modal-nav-icon` | `height: 18px` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (6)

| line | selector | declaration |
|---:|---|---|
| 10 | `#macro-suggestions *` | `box-sizing: border-box` |
| 27 | `.macro-suggestions-arrow` | `width: 0` |
| 28 | `.macro-suggestions-arrow` | `height: 0` |
| 34 | `.macro-suggestions-arrow.top` | `border-top-color: var(--base-tone)` |
| 38 | `.macro-suggestions-arrow.bottom` | `bottom: 100%` |
| 39 | `.macro-suggestions-arrow.bottom` | `border-bottom-color: var(--base-tone)` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (10)

| line | selector | declaration |
|---:|---|---|
| 11 | `.editor-command` | `width: 280px` |
| 16 | `.editor-command-error` | `border-bottom-left-radius: var(--radius-md)` |
| 17 | `.editor-command-error` | `border-bottom-right-radius: var(--radius-md)` |
| 24 | `.editor-content.content-editor` | `min-height: 0` |
| 29 | `.editor-content .content-editor-body` | `min-height: 0` |
| 34 | `.editor-toast` | `bottom: 52px` |
| 35 | `.editor-toast` | `white-space: nowrap` |
| 47 | `.command-suggestions` | `right: 0` |
| 50 | `.command-suggestions` | `border-radius: 0 0 var(--radius-md) var(--radius-md)` |
| 59 | `.command-suggestion-command` | `white-space: nowrap` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 15 | `.macro-search-results` | `align-content: start` |
| 54 | `.macro-search-item-edit` | `right: var(--spacing-sm)` |
| 96 | `.macro-search-kbd` | `border-radius: 4px` |

### src/content/overlays/views/settings/settingsViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 20 | `.settings-divider` | `height: 0` |
| 25 | `.settings-prefix-btn` | `width: 2rem` |
| 26 | `.settings-prefix-btn` | `height: 2rem` |

### src/options/options.css (2)

| line | selector | declaration |
|---:|---|---|
| 5 | `.prefix-cell` | `width: 3rem` |
| 6 | `.prefix-cell` | `height: 3rem` |

### src/popup/popup.css (2)

| line | selector | declaration |
|---:|---|---|
| 6 | `.popup-container` | `width: 320px` |
| 21 | `.popup-search-input` | `box-sizing: border-box` |

### src/styles/components/content-editor.css (8)

| line | selector | declaration |
|---:|---|---|
| 10 | `.ce-toolbar-sep` | `width: 1px` |
| 11 | `.ce-toolbar-sep` | `height: 16px` |
| 12 | `.ce-toolbar-sep` | `background-color: var(--harmonic)` |
| 17 | `.ce-toolbar-btn` | `width: 28px` |
| 18 | `.ce-toolbar-btn` | `height: 28px` |
| 34 | `.ce-style-trigger` | `width: auto` |
| 60 | `.ce-style-option-short` | `width: 24px` |
| 68 | `.ce-link-input` | `height: 28px` |

## state-mechanics (5)

Native/JS state mechanics outside backed Ermine conditions.

### src/styles/components/content-editor.css (4)

| line | selector | declaration |
|---:|---|---|
| 24 | `.ce-toolbar-btn.is-active` | `background-color: var(--tone)` |
| 25 | `.ce-toolbar-btn.is-active` | `color: var(--accent)` |
| 55 | `.ce-style-option.is-active` | `color: var(--accent)` |
| 56 | `.ce-style-option.is-active` | `background-color: var(--tone)` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 113 | `.min-selected-1 > .is-selected:only-of-type` | `cursor: not-allowed` |

## aria-current (1)

Current-state layer mechanics left local around ruled current: skin.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 61 | `.modal-nav-tab[aria-current="page"]` | `border-bottom-color: var(--accent)` |

## parent-relational (8)

Guarded parent/descendant state mechanics outside ruled relational words.

### src/content/overlays/views/search/searchViewStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 33 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `white-space: normal` |
| 34 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `overflow: visible` |
| 35 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `text-overflow: clip` |
| 40 | `.macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-text` | `background-color: var(--tone-dim)` |
| 45 | `.macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-text` | `background-color: var(--tone)` |

### src/content/overlays/views/settings/settingsViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 84 | `.seg-control.is-sliding .seg-option[aria-checked="true"]` | `background: transparent` |

### src/popup/popup.css (1)

| line | selector | declaration |
|---:|---|---|
| 17 | `.popup-button:hover, .popup-icon-button:hover` | `opacity: 0.9` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 64 | `.ce-style-option.is-active .ce-style-option-short` | `color: var(--accent)` |

## pseudo-mechanics (23)

Pseudo-element geometry, generated content, and fills.

### src/content/overlays/views/search/searchViewStyles.css (8)

| line | selector | declaration |
|---:|---|---|
| 101 | `.macro-search-kbd::after` | `content: ''` |
| 102 | `.macro-search-kbd::after` | `position: absolute` |
| 103 | `.macro-search-kbd::after` | `background: var(--tone-dim)` |
| 104 | `.macro-search-kbd::after` | `inset: 0 2px 4px` |
| 105 | `.macro-search-kbd::after` | `border: 1px solid var(--harmonic-minor)` |
| 106 | `.macro-search-kbd::after` | `border-radius: 2px` |
| 107 | `.macro-search-kbd::after` | `pointer-events: none` |
| 108 | `.macro-search-kbd::after` | `z-index: -1` |

### src/content/overlays/views/settings/settingsViewStyles.css (12)

| line | selector | declaration |
|---:|---|---|
| 41 | `.seg-control::before` | `content: ''` |
| 42 | `.seg-control::before` | `position: absolute` |
| 43 | `.seg-control::before` | `top: 0` |
| 44 | `.seg-control::before` | `bottom: 0` |
| 45 | `.seg-control::before` | `left: var(--pill-left, 0)` |
| 46 | `.seg-control::before` | `width: var(--pill-width, 0)` |
| 47 | `.seg-control::before` | `background: var(--accent)` |
| 48 | `.seg-control::before` | `opacity: 0` |
| 49 | `.seg-control::before` | `transition: left 0.1s ease, width 0.1s ease` |
| 50 | `.seg-control::before` | `pointer-events: none` |
| 53 | `.seg-control.is-sliding::before` | `opacity: 1` |
| 56 | `.seg-control.seg-snap::before` | `transition: none` |

### src/styles/components/content-editor.css (3)

| line | selector | declaration |
|---:|---|---|
| 82 | `.content-editor-body:empty::before` | `content: attr(data-placeholder)` |
| 83 | `.content-editor-body:empty::before` | `color: var(--ink-soft)` |
| 84 | `.content-editor-body:empty::before` | `pointer-events: none` |

## scrollbar-followup (9)

Engine-drawn scrollbar identity outside R-SKIN-15 standard properties.

### src/styles/skin/controls.css (8)

| line | selector | declaration |
|---:|---|---|
| 70 | `::-webkit-scrollbar` | `width: var(--spacing-md) !important` |
| 71 | `::-webkit-scrollbar` | `height: var(--spacing-md) !important` |
| 75 | `::-webkit-scrollbar-track` | `background: var(--tone-dim) !important` |
| 76 | `::-webkit-scrollbar-track` | `border-radius: var(--radius-md) !important` |
| 80 | `::-webkit-scrollbar-thumb` | `background: var(--tone) !important` |
| 81 | `::-webkit-scrollbar-thumb` | `border-radius: var(--radius-md) !important` |
| 82 | `::-webkit-scrollbar-thumb` | `border: 1px solid var(--tone-dim) !important` |
| 86 | `::-webkit-scrollbar-thumb:hover` | `background: var(--accent-dim) !important` |

### src/styles/theme/metrics.css (1)

| line | selector | declaration |
|---:|---|---|
| 63 | `:root, :host` | `scrollbar-color: var(--tone) var(--tone-dim)` |

## motion-followup (13)

Transition/animation timing evidence for the animation-plane follow-up.

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 23 | `.macro-suggestions-container` | `transition: opacity 0.15s ease, transform 0.15s ease` |
| 45 | `.macro-suggestions-command-item` | `transition: all 0.15s ease` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 7 | `.editor-popout` | `transition: background-color var(--transition-fast), color var(--transition-fast)` |
| 55 | `.command-suggestion-item` | `transition: background-color var(--transition-fast)` |
| 63 | `.command-suggestion-action` | `transition: opacity var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast)` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 9 | `.macro-search-input` | `transition: border-color var(--transition-fast)` |
| 21 | `.macro-search-item-command, .macro-search-item-text` | `transition: background-color var(--transition-fast)` |
| 55 | `.macro-search-item-edit` | `transition: opacity var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast)` |

### src/popup/popup.css (2)

| line | selector | declaration |
|---:|---|---|
| 12 | `.popup-button, .popup-icon-button` | `transition: opacity var(--transition-fast), background-color var(--transition-fast)` |
| 22 | `.popup-search-input` | `transition: border-color var(--transition-fast)` |

### src/styles/components/content-editor.css (2)

| line | selector | declaration |
|---:|---|---|
| 20 | `.ce-toolbar-btn` | `transition: background var(--transition-fast), color var(--transition-fast)` |
| 51 | `.ce-style-option` | `transition: background var(--transition-fast)` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 124 | `.shake` | `transition: none !important` |

## opacity-followup (4)

Opacity prominence/treatment evidence.

### src/content/overlays/views/search/searchViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 65 | `.macro-search-item-text mark span` | `opacity: 0.35` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 40 | `.ce-style-caret` | `opacity: 0.6` |

### src/styles/skin/controls.css (2)

| line | selector | declaration |
|---:|---|---|
| 114 | `.min-selected-1 > .is-selected:only-of-type` | `opacity: 0.95` |
| 118 | `.min-selected-1 > .is-selected:only-of-type:hover` | `opacity: 0.95` |

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
| 36 | `.editor-toast` | `box-shadow: 0 6px 16px -4px rgb(0 0 0 / 25%)` |

## reset-absence (12)

Absence/reset/transparent mechanics, not positive style carriers.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 54 | `.modal-nav-tab` | `border-bottom: 2px solid transparent` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 16 | `button, input, textarea, select` | `font-family: inherit` |
| 29 | `.macro-suggestions-arrow` | `border: 6px solid transparent` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 49 | `.command-suggestions` | `border-top: none` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 59 | `.macro-search-item-text mark` | `background: transparent` |
| 60 | `.macro-search-item-text mark` | `color: inherit` |
| 61 | `.macro-search-item-text mark` | `font-style: normal` |

### src/popup/popup.css (4)

| line | selector | declaration |
|---:|---|---|
| 11 | `.popup-button, .popup-icon-button` | `border: none` |
| 27 | `.popup-item-toggle` | `border: none` |
| 28 | `.popup-item-toggle` | `background: transparent` |
| 54 | `.popup-results` | `list-style: none` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 78 | `.content-editor-body` | `line-height: normal` |

## user-content (43)

Rich-text defaults inside user-authored editor content.

### src/styles/components/content-editor.css (43)

| line | selector | declaration |
|---:|---|---|
| 89 | `.content-editor-body p` | `margin-bottom: 0.75em` |
| 93 | `.content-editor-body p:last-child` | `margin-bottom: 0` |
| 97 | `.content-editor-body h1` | `font-size: 1.75em` |
| 98 | `.content-editor-body h1` | `font-weight: 700` |
| 99 | `.content-editor-body h1` | `margin: 0.75em 0 0.4em` |
| 103 | `.content-editor-body h2` | `font-size: 1.4em` |
| 104 | `.content-editor-body h2` | `font-weight: 700` |
| 105 | `.content-editor-body h2` | `margin: 0.75em 0 0.4em` |
| 109 | `.content-editor-body h3` | `font-size: 1.15em` |
| 110 | `.content-editor-body h3` | `font-weight: 700` |
| 111 | `.content-editor-body h3` | `margin: 0.75em 0 0.4em` |
| 117 | `.content-editor-body h1:first-child, .content-editor-body h2:first-child, .content-editor-body h3:first-child` | `margin-top: 0` |
| 122 | `.content-editor-body strong, .content-editor-body b` | `font-weight: 700` |
| 127 | `.content-editor-body em, .content-editor-body i` | `font-style: italic` |
| 131 | `.content-editor-body u` | `text-decoration: underline` |
| 135 | `.content-editor-body s` | `text-decoration: line-through` |
| 139 | `.content-editor-body code` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 140 | `.content-editor-body code` | `font-size: 0.88em` |
| 141 | `.content-editor-body code` | `background-color: var(--tone)` |
| 142 | `.content-editor-body code` | `color: var(--ink)` |
| 143 | `.content-editor-body code` | `padding: 0.1em 0.35em` |
| 144 | `.content-editor-body code` | `border-radius: var(--radius-sm)` |
| 148 | `.content-editor-body pre` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 149 | `.content-editor-body pre` | `font-size: 0.88em` |
| 150 | `.content-editor-body pre` | `background-color: var(--tone)` |
| 151 | `.content-editor-body pre` | `padding: var(--spacing-md)` |
| 152 | `.content-editor-body pre` | `border-radius: var(--radius-sm)` |
| 153 | `.content-editor-body pre` | `overflow-x: auto` |
| 154 | `.content-editor-body pre` | `margin: 0.75em 0` |
| 158 | `.content-editor-body blockquote` | `border-left: 3px solid var(--accent-dim)` |
| 159 | `.content-editor-body blockquote` | `padding-left: var(--spacing-md)` |
| 160 | `.content-editor-body blockquote` | `margin: 0.75em 0` |
| 161 | `.content-editor-body blockquote` | `color: var(--ink-soft)` |
| 162 | `.content-editor-body blockquote` | `font-style: italic` |
| 167 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `padding-left: 1.5em` |
| 168 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `margin-bottom: 0.75em` |
| 172 | `.content-editor .content-editor-body ul` | `list-style-type: disc` |
| 176 | `.content-editor .content-editor-body ol` | `list-style-type: decimal` |
| 180 | `.content-editor-body li` | `display: list-item` |
| 181 | `.content-editor-body li` | `margin-bottom: 0.2em` |
| 185 | `.content-editor-body a` | `color: var(--accent)` |
| 186 | `.content-editor-body a` | `text-decoration: underline` |
| 190 | `.content-editor-body a:hover` | `opacity: 0.8` |

## identity-geometry (56)

Project-exact dimensions, spacing, positioning, and geometry.

### src/content/overlays/deleteConfirm/deleteConfirmStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 2 | `.macro-suggestions-container.delete-confirm` | `min-width: 240px` |

### src/content/overlays/modal/modalStyles.css (4)

| line | selector | declaration |
|---:|---|---|
| 20 | `.modal-backdrop` | `z-index: 10000` |
| 35 | `.modal-nav-container` | `min-height: 48px` |
| 39 | `.modal-nav-branding` | `margin-right: 1rem` |
| 53 | `.modal-nav-tab` | `padding: var(--spacing-md) var(--spacing-2xl)` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (9)

| line | selector | declaration |
|---:|---|---|
| 5 | `:host, #macro-suggestions` | `position: fixed !important` |
| 6 | `:host, #macro-suggestions` | `z-index: 2147483646 !important` |
| 21 | `.macro-suggestions-container` | `min-width: 200px` |
| 22 | `.macro-suggestions-container` | `max-width: 360px` |
| 33 | `.macro-suggestions-arrow.top` | `top: 100%` |
| 43 | `.macro-suggestions-command-item` | `max-width: 8em` |
| 44 | `.macro-suggestions-command-item` | `padding: 3px 6px` |
| 49 | `.macro-suggestions-footer` | `justify-content: flex-end` |
| 54 | `.macro-suggestions-kbd` | `padding: 1px 4px` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (4)

| line | selector | declaration |
|---:|---|---|
| 28 | `.editor-content .content-editor-body` | `flex: 1` |
| 46 | `.command-suggestions` | `left: 0` |
| 48 | `.command-suggestions` | `top: 100%` |
| 51 | `.command-suggestions` | `z-index: 10` |

### src/content/overlays/views/search/searchViewStyles.css (9)

| line | selector | declaration |
|---:|---|---|
| 14 | `.macro-search-results` | `max-height: 400px` |
| 25 | `.macro-search-item-command` | `padding-right: var(--spacing-xs)` |
| 29 | `.macro-search-item-text` | `padding-left: var(--spacing-xs)` |
| 50 | `.macro-search-item-confirm` | `padding-left: var(--spacing-xs)` |
| 88 | `.macro-search-shortcut` | `margin-right: var(--spacing-xl)` |
| 94 | `.macro-search-kbd` | `padding: 3px 6px 6px` |
| 95 | `.macro-search-kbd` | `min-width: 26px` |
| 97 | `.macro-search-kbd` | `z-index: 0` |
| 112 | `.macro-search-kbd:first-child` | `margin-left: 0` |

### src/content/overlays/views/settings/settingsViewStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 9 | `.settings-body` | `padding: var(--spacing-2xl) 0 var(--spacing-xl)` |
| 15 | `.settings-section-label` | `padding: var(--spacing-md) var(--spacing-sm) 0 0` |
| 21 | `.settings-divider` | `margin: var(--spacing-sm) var(--spacing-xl)` |
| 27 | `.settings-prefix-btn` | `padding: 0` |
| 31 | `.settings-import-status` | `padding: var(--spacing-xs) var(--spacing-xl) var(--spacing-sm)` |

### src/options/options.css (1)

| line | selector | declaration |
|---:|---|---|
| 7 | `.prefix-cell` | `flex: 0 0 auto` |

### src/popup/popup.css (8)

| line | selector | declaration |
|---:|---|---|
| 33 | `.popup-item-detail` | `margin-top: var(--spacing-sm)` |
| 34 | `.popup-item-detail` | `padding-top: var(--spacing-sm)` |
| 38 | `.popup-macro-text` | `white-space: pre-wrap` |
| 39 | `.popup-macro-text` | `margin: 0` |
| 44 | `.popup-toggle-label` | `margin-left: var(--spacing-sm)` |
| 51 | `.popup-results` | `max-height: 256px` |
| 52 | `.popup-results` | `padding: var(--spacing-sm) 0` |
| 53 | `.popup-results` | `margin: 0` |

### src/styles/components/content-editor.css (12)

| line | selector | declaration |
|---:|---|---|
| 13 | `.ce-toolbar-sep` | `margin: 0 var(--spacing-xs)` |
| 19 | `.ce-toolbar-btn` | `padding: 0` |
| 29 | `.ce-toolbar-icon` | `padding: 0 var(--spacing-xs)` |
| 35 | `.ce-style-trigger` | `min-width: 36px` |
| 36 | `.ce-style-trigger` | `padding: 0 var(--spacing-xs)` |
| 37 | `.ce-style-trigger` | `gap: 2px` |
| 44 | `.ce-style-dropdown` | `top: calc(100% + 4px)` |
| 45 | `.ce-style-dropdown` | `left: 0` |
| 46 | `.ce-style-dropdown` | `z-index: 10` |
| 47 | `.ce-style-dropdown` | `gap: 2px` |
| 69 | `.ce-link-input` | `padding: 0 var(--spacing-sm)` |
| 74 | `.content-editor-body` | `min-height: 150px` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 17 | `body` | `margin: 0` |
| 18 | `body` | `padding: 0` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 29 | `.editor-content` | `min-height: 150px` |
