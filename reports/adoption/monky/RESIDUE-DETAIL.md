# Monky Residue Detail

Generated from `reports/adoption/monky/current-ledger.json`. This lists every current Monky declaration counted as project-owned residue, excluding adopted/infrastructure and zero review buckets.

## Provenance

| source | commit |
|---|---|
| Ermine | `122a68f3a56` |
| monky | `9634a3bbfa2` |

## Summary

- Current declarations: 516
- Adopted/infrastructure declarations: 306
- Project-owned residue declarations: 210
- Assimilable declarations: 0
- Shadowed words: 0

| code | declarations | meaning |
|---|---:|---|
| `recipe-identity` | 23 | Project recipe bundles licensed by R-SKIN-10. |
| `brand-identity` | 8 | Monky-specific brand typography and type treatment. |
| `component-contract` | 31 | Component-owned mechanics, exact geometry, or product contract. |
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
| `identity-geometry` | 39 | Project-exact dimensions, spacing, positioning, and geometry. |

## recipe-identity (23)

Project recipe bundles licensed by R-SKIN-10.

### src/content/overlays/views/settings/settingsViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 56 | `.seg-option svg` | `vertical-align: middle` |
| 61 | `.seg-option:last-child` | `border-right: none` |
| 65 | `.seg-option[aria-checked="true"]` | `border-right-color: transparent` |

### src/styles/skin/controls.css (20)

| line | selector | declaration |
|---:|---|---|
| 4 | `.input-error:focus` | `box-shadow: inset 0 0 0 2px var(--status-error-wash)` |
| 8 | `.radio-label` | `cursor: pointer` |
| 9 | `.radio-label` | `user-select: none` |
| 20 | `.btn-success:hover` | `background-color: color-mix(in oklch, var(--status-success) 82%, var(--shadow-color))` |
| 24 | `.btn-link` | `text-decoration: none` |
| 28 | `.btn-link:hover` | `text-decoration: underline` |
| 32 | `.btn-link-danger` | `text-decoration: none` |
| 36 | `.btn-link-danger:hover` | `text-decoration: underline` |
| 40 | `.btn:disabled` | `cursor: not-allowed` |
| 41 | `.btn:disabled` | `opacity: 0.6` |
| 45 | `.btn:disabled:hover` | `background-color: var(--tone-dim)` |
| 46 | `.btn:disabled:hover` | `opacity: 0.6` |
| 78 | `.selectable-group > *` | `cursor: pointer` |
| 79 | `.selectable-group > *` | `user-select: none` |
| 83 | `.selectable-group > *:active` | `transform: scale(0.98)` |
| 87 | `.selectable-group > .is-selected` | `background-color: var(--accent)` |
| 88 | `.selectable-group > .is-selected` | `color: var(--ink-alt)` |
| 89 | `.selectable-group > .is-selected` | `border-color: var(--accent)` |
| 93 | `.selectable-group > .is-selected:hover` | `background-color: var(--accent)` |
| 94 | `.selectable-group > .is-selected:hover` | `opacity: 0.9` |

## brand-identity (8)

Monky-specific brand typography and type treatment.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 67 | `.modal-nav-label` | `font-size: var(--text-base)` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 3 | `:host, #macro-suggestions` | `font-family: 'IBM Plex Condensed Light', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| 4 | `:host, #macro-suggestions` | `line-height: 1.5` |

### src/content/overlays/views/search/searchViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 49 | `.modal-command-item .modal-command-description` | `font-style: italic` |
| 66 | `.macro-search-kbd` | `line-height: 1` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 71 | `.content-editor-body` | `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 12 | `.page-title` | `font-family: 'IBM Plex Condensed Light', sans-serif` |
| 16 | `body` | `font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial` |

## component-contract (31)

Component-owned mechanics, exact geometry, or product contract.

### src/content/overlays/modal/modalStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 19 | `.modal-backdrop` | `background-color: var(--shadow-color)` |
| 28 | `.modal-dialog` | `mix-blend-mode: multiply` |
| 29 | `.modal-dialog` | `width: min(600px, calc(100vw - 2rem))` |
| 30 | `.modal-dialog` | `height: min(560px, 85vh)` |
| 63 | `.modal-nav-icon` | `height: 18px` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 10 | `#macro-suggestions *` | `box-sizing: border-box` |
| 26 | `.macro-suggestions-arrow` | `width: 0` |
| 27 | `.macro-suggestions-arrow` | `height: 0` |
| 32 | `.macro-suggestions-arrow.top` | `border-top-color: var(--base-tone)` |
| 36 | `.macro-suggestions-arrow.bottom` | `border-bottom-color: var(--base-tone)` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 7 | `.editor-command` | `width: 280px` |
| 14 | `.editor-content.content-editor` | `min-height: 0` |
| 19 | `.editor-content .content-editor-body` | `min-height: 0` |

### src/content/overlays/views/search/searchViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 10 | `.macro-search-results` | `align-content: start` |
| 69 | `.macro-search-kbd` | `border-radius: 4px` |

### src/content/overlays/views/settings/settingsViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 20 | `.settings-divider` | `height: 0` |
| 24 | `.settings-prefix-btn` | `width: 2rem` |
| 25 | `.settings-prefix-btn` | `height: 2rem` |

### src/options/options.css (2)

| line | selector | declaration |
|---:|---|---|
| 5 | `.prefix-cell` | `width: 3rem` |
| 6 | `.prefix-cell` | `height: 3rem` |

### src/popup/popup.css (2)

| line | selector | declaration |
|---:|---|---|
| 6 | `.popup-container` | `width: 320px` |
| 20 | `.popup-search-input` | `box-sizing: border-box` |

### src/styles/components/content-editor.css (9)

| line | selector | declaration |
|---:|---|---|
| 10 | `.ce-toolbar-sep` | `width: 1px` |
| 11 | `.ce-toolbar-sep` | `height: 16px` |
| 12 | `.ce-toolbar-sep` | `background-color: var(--harmonic)` |
| 17 | `.ce-toolbar-btn` | `width: 28px` |
| 18 | `.ce-toolbar-btn` | `height: 28px` |
| 33 | `.ce-style-trigger` | `width: auto` |
| 44 | `.ce-style-dropdown` | `left: 0` |
| 54 | `.ce-style-option-short` | `width: 24px` |
| 62 | `.ce-link-input` | `height: 28px` |

## state-mechanics (5)

Native/JS state mechanics outside backed Ermine conditions.

### src/styles/components/content-editor.css (4)

| line | selector | declaration |
|---:|---|---|
| 23 | `.ce-toolbar-btn.is-active` | `background-color: var(--tone)` |
| 24 | `.ce-toolbar-btn.is-active` | `color: var(--accent)` |
| 49 | `.ce-style-option.is-active` | `color: var(--accent)` |
| 50 | `.ce-style-option.is-active` | `background-color: var(--tone)` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 98 | `.min-selected-1 > .is-selected:only-of-type` | `cursor: not-allowed` |

## aria-current (1)

Current-state layer mechanics left local around ruled current: skin.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 59 | `.modal-nav-tab[aria-current="page"]` | `border-bottom-color: var(--accent)` |

## parent-relational (8)

Guarded parent/descendant state mechanics outside ruled relational words.

### src/content/overlays/views/search/searchViewStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 15 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `white-space: normal` |
| 16 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `overflow: visible` |
| 17 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `text-overflow: clip` |
| 22 | `.macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-text` | `background-color: var(--tone-dim)` |
| 27 | `.macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-text` | `background-color: var(--tone)` |

### src/content/overlays/views/settings/settingsViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 71 | `.seg-control.is-sliding .seg-option[aria-checked="true"]` | `background: transparent` |

### src/popup/popup.css (1)

| line | selector | declaration |
|---:|---|---|
| 16 | `.popup-button:hover, .popup-icon-button:hover` | `opacity: 0.9` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 58 | `.ce-style-option.is-active .ce-style-option-short` | `color: var(--accent)` |

## pseudo-mechanics (23)

Pseudo-element geometry, generated content, and fills.

### src/content/overlays/views/search/searchViewStyles.css (8)

| line | selector | declaration |
|---:|---|---|
| 74 | `.macro-search-kbd::after` | `content: ''` |
| 75 | `.macro-search-kbd::after` | `position: absolute` |
| 76 | `.macro-search-kbd::after` | `background: var(--tone-dim)` |
| 77 | `.macro-search-kbd::after` | `inset: 0 2px 4px` |
| 78 | `.macro-search-kbd::after` | `border: 1px solid var(--harmonic-minor)` |
| 79 | `.macro-search-kbd::after` | `border-radius: 2px` |
| 80 | `.macro-search-kbd::after` | `pointer-events: none` |
| 81 | `.macro-search-kbd::after` | `z-index: -1` |

### src/content/overlays/views/settings/settingsViewStyles.css (12)

| line | selector | declaration |
|---:|---|---|
| 36 | `.seg-control::before` | `content: ''` |
| 37 | `.seg-control::before` | `position: absolute` |
| 38 | `.seg-control::before` | `top: 0` |
| 39 | `.seg-control::before` | `bottom: 0` |
| 40 | `.seg-control::before` | `left: var(--pill-left, 0)` |
| 41 | `.seg-control::before` | `width: var(--pill-width, 0)` |
| 42 | `.seg-control::before` | `background: var(--accent)` |
| 43 | `.seg-control::before` | `opacity: 0` |
| 44 | `.seg-control::before` | `transition: left 0.1s ease, width 0.1s ease` |
| 45 | `.seg-control::before` | `pointer-events: none` |
| 48 | `.seg-control.is-sliding::before` | `opacity: 1` |
| 51 | `.seg-control.seg-snap::before` | `transition: none` |

### src/styles/components/content-editor.css (3)

| line | selector | declaration |
|---:|---|---|
| 76 | `.content-editor-body:empty::before` | `content: attr(data-placeholder)` |
| 77 | `.content-editor-body:empty::before` | `color: var(--ink-soft)` |
| 78 | `.content-editor-body:empty::before` | `pointer-events: none` |

## scrollbar-followup (9)

Engine-drawn scrollbar identity outside R-SKIN-15 standard properties.

### src/styles/skin/controls.css (8)

| line | selector | declaration |
|---:|---|---|
| 55 | `::-webkit-scrollbar` | `width: var(--spacing-md) !important` |
| 56 | `::-webkit-scrollbar` | `height: var(--spacing-md) !important` |
| 60 | `::-webkit-scrollbar-track` | `background: var(--tone-dim) !important` |
| 61 | `::-webkit-scrollbar-track` | `border-radius: var(--radius-md) !important` |
| 65 | `::-webkit-scrollbar-thumb` | `background: var(--tone) !important` |
| 66 | `::-webkit-scrollbar-thumb` | `border-radius: var(--radius-md) !important` |
| 67 | `::-webkit-scrollbar-thumb` | `border: 1px solid var(--tone-dim) !important` |
| 71 | `::-webkit-scrollbar-thumb:hover` | `background: var(--accent-dim) !important` |

### src/styles/theme/metrics.css (1)

| line | selector | declaration |
|---:|---|---|
| 67 | `:root, :host` | `scrollbar-color: var(--tone) var(--tone-dim)` |

## motion-followup (1)

Transition/animation timing evidence for the animation-plane follow-up.

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 109 | `.shake` | `transition: none !important` |

## opacity-followup (4)

Opacity prominence/treatment evidence.

### src/content/overlays/views/search/searchViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 42 | `.macro-search-item-text mark span` | `opacity: 0.35` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 39 | `.ce-style-caret` | `opacity: 0.6` |

### src/styles/skin/controls.css (2)

| line | selector | declaration |
|---:|---|---|
| 99 | `.min-selected-1 > .is-selected:only-of-type` | `opacity: 0.95` |
| 103 | `.min-selected-1 > .is-selected:only-of-type:hover` | `opacity: 0.95` |

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
| 25 | `.editor-toast` | `box-shadow: 0 6px 16px -4px rgb(0 0 0 / 25%)` |

## reset-absence (12)

Absence/reset/transparent mechanics, not positive style carriers.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 52 | `.modal-nav-tab` | `border-bottom: 2px solid transparent` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 16 | `button, input, textarea, select` | `font-family: inherit` |
| 28 | `.macro-suggestions-arrow` | `border: 6px solid transparent` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 30 | `.command-suggestions` | `border-top: none` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 36 | `.macro-search-item-text mark` | `background: transparent` |
| 37 | `.macro-search-item-text mark` | `color: inherit` |
| 38 | `.macro-search-item-text mark` | `font-style: normal` |

### src/popup/popup.css (4)

| line | selector | declaration |
|---:|---|---|
| 11 | `.popup-button, .popup-icon-button` | `border: none` |
| 25 | `.popup-item-toggle` | `border: none` |
| 26 | `.popup-item-toggle` | `background: transparent` |
| 40 | `.popup-results` | `list-style: none` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 72 | `.content-editor-body` | `line-height: normal` |

## user-content (43)

Rich-text defaults inside user-authored editor content.

### src/styles/components/content-editor.css (43)

| line | selector | declaration |
|---:|---|---|
| 83 | `.content-editor-body p` | `margin-bottom: 0.75em` |
| 87 | `.content-editor-body p:last-child` | `margin-bottom: 0` |
| 91 | `.content-editor-body h1` | `font-size: 1.75em` |
| 92 | `.content-editor-body h1` | `font-weight: 700` |
| 93 | `.content-editor-body h1` | `margin: 0.75em 0 0.4em` |
| 97 | `.content-editor-body h2` | `font-size: 1.4em` |
| 98 | `.content-editor-body h2` | `font-weight: 700` |
| 99 | `.content-editor-body h2` | `margin: 0.75em 0 0.4em` |
| 103 | `.content-editor-body h3` | `font-size: 1.15em` |
| 104 | `.content-editor-body h3` | `font-weight: 700` |
| 105 | `.content-editor-body h3` | `margin: 0.75em 0 0.4em` |
| 111 | `.content-editor-body h1:first-child, .content-editor-body h2:first-child, .content-editor-body h3:first-child` | `margin-top: 0` |
| 116 | `.content-editor-body strong, .content-editor-body b` | `font-weight: 700` |
| 121 | `.content-editor-body em, .content-editor-body i` | `font-style: italic` |
| 125 | `.content-editor-body u` | `text-decoration: underline` |
| 129 | `.content-editor-body s` | `text-decoration: line-through` |
| 133 | `.content-editor-body code` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 134 | `.content-editor-body code` | `font-size: 0.88em` |
| 135 | `.content-editor-body code` | `background-color: var(--tone)` |
| 136 | `.content-editor-body code` | `color: var(--ink)` |
| 137 | `.content-editor-body code` | `padding: 0.1em 0.35em` |
| 138 | `.content-editor-body code` | `border-radius: var(--radius-sm)` |
| 142 | `.content-editor-body pre` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 143 | `.content-editor-body pre` | `font-size: 0.88em` |
| 144 | `.content-editor-body pre` | `background-color: var(--tone)` |
| 145 | `.content-editor-body pre` | `padding: var(--spacing-md)` |
| 146 | `.content-editor-body pre` | `border-radius: var(--radius-sm)` |
| 147 | `.content-editor-body pre` | `overflow-x: auto` |
| 148 | `.content-editor-body pre` | `margin: 0.75em 0` |
| 152 | `.content-editor-body blockquote` | `border-left: 3px solid var(--accent-dim)` |
| 153 | `.content-editor-body blockquote` | `padding-left: var(--spacing-md)` |
| 154 | `.content-editor-body blockquote` | `margin: 0.75em 0` |
| 155 | `.content-editor-body blockquote` | `color: var(--ink-soft)` |
| 156 | `.content-editor-body blockquote` | `font-style: italic` |
| 161 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `padding-left: 1.5em` |
| 162 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `margin-bottom: 0.75em` |
| 166 | `.content-editor .content-editor-body ul` | `list-style-type: disc` |
| 170 | `.content-editor .content-editor-body ol` | `list-style-type: decimal` |
| 174 | `.content-editor-body li` | `display: list-item` |
| 175 | `.content-editor-body li` | `margin-bottom: 0.2em` |
| 179 | `.content-editor-body a` | `color: var(--accent)` |
| 180 | `.content-editor-body a` | `text-decoration: underline` |
| 184 | `.content-editor-body a:hover` | `opacity: 0.8` |

## identity-geometry (39)

Project-exact dimensions, spacing, positioning, and geometry.

### src/content/overlays/deleteConfirm/deleteConfirmStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 2 | `.macro-suggestions-container.delete-confirm` | `min-width: 240px` |

### src/content/overlays/modal/modalStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 20 | `.modal-backdrop` | `z-index: 10000` |
| 35 | `.modal-nav-container` | `min-height: 48px` |
| 39 | `.modal-nav-branding` | `margin-right: 1rem` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (7)

| line | selector | declaration |
|---:|---|---|
| 5 | `:host, #macro-suggestions` | `position: fixed !important` |
| 6 | `:host, #macro-suggestions` | `z-index: 2147483646 !important` |
| 21 | `.macro-suggestions-container` | `min-width: 200px` |
| 22 | `.macro-suggestions-container` | `max-width: 360px` |
| 40 | `.macro-suggestions-command-item` | `padding: 3px 6px` |
| 44 | `.macro-suggestions-command-item:not(.delete-confirm-option)` | `max-width: 8em` |
| 49 | `.macro-suggestions-kbd` | `padding: 1px 4px` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 18 | `.editor-content .content-editor-body` | `flex: 1` |
| 24 | `.editor-toast` | `bottom: 52px` |

### src/content/overlays/views/search/searchViewStyles.css (6)

| line | selector | declaration |
|---:|---|---|
| 9 | `.macro-search-results` | `max-height: 400px` |
| 32 | `.macro-search-item-edit` | `right: var(--spacing-sm)` |
| 67 | `.macro-search-kbd` | `padding: 3px 6px 6px` |
| 68 | `.macro-search-kbd` | `min-width: 26px` |
| 70 | `.macro-search-kbd` | `z-index: 0` |
| 85 | `.macro-search-kbd:first-child` | `margin-left: 0` |

### src/content/overlays/views/settings/settingsViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 9 | `.settings-body` | `padding: var(--spacing-2xl) 0 var(--spacing-xl)` |
| 15 | `.settings-section-label` | `padding: var(--spacing-md) var(--spacing-sm) 0 0` |
| 26 | `.settings-prefix-btn` | `padding: 0` |

### src/popup/popup.css (4)

| line | selector | declaration |
|---:|---|---|
| 30 | `.popup-macro-text` | `margin: 0` |
| 37 | `.popup-results` | `max-height: 256px` |
| 38 | `.popup-results` | `padding: var(--spacing-sm) 0` |
| 39 | `.popup-results` | `margin: 0` |

### src/styles/components/content-editor.css (10)

| line | selector | declaration |
|---:|---|---|
| 13 | `.ce-toolbar-sep` | `margin: 0 var(--spacing-xs)` |
| 19 | `.ce-toolbar-btn` | `padding: 0` |
| 28 | `.ce-toolbar-icon` | `padding: 0 var(--spacing-xs)` |
| 34 | `.ce-style-trigger` | `min-width: 36px` |
| 35 | `.ce-style-trigger` | `padding: 0 var(--spacing-xs)` |
| 36 | `.ce-style-trigger` | `gap: 2px` |
| 43 | `.ce-style-dropdown` | `top: calc(100% + 4px)` |
| 45 | `.ce-style-dropdown` | `gap: 2px` |
| 63 | `.ce-link-input` | `padding: 0 var(--spacing-sm)` |
| 68 | `.content-editor-body` | `min-height: 150px` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 17 | `body` | `margin: 0` |
| 18 | `body` | `padding: 0` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 14 | `.editor-content` | `min-height: 150px` |
