# Monky Residue Detail

Generated from `reports/adoption/monky/current-ledger.json`. This lists every current Monky declaration counted as project-owned residue, excluding adopted/infrastructure and zero review buckets.

## Provenance

| source | commit |
|---|---|
| Ermine | `c29d615f9a06b786fb956cf2d4ebdae91a933740` |
| monky | `d58cac0d2de1cda798dc5c6d42aa6766a90f6b54` |

## Summary

- Current declarations: 527
- Adopted/infrastructure declarations: 222
- Project-owned residue declarations: 305
- Assimilable declarations: 0
- Shadowed words: 0

| code | declarations | meaning |
|---|---:|---|
| `recipe-identity` | 37 | Project recipe bundles licensed by R-SKIN-10. |
| `brand-identity` | 11 | Monky-specific brand typography and type treatment. |
| `component-contract` | 64 | Component-owned mechanics, exact geometry, or product contract. |
| `state-mechanics` | 5 | Native/JS state mechanics outside backed Ermine conditions. |
| `aria-current` | 1 | Current-state layer mechanics left local around ruled current: skin. |
| `parent-relational` | 8 | Guarded parent/descendant state mechanics outside ruled relational words. |
| `pseudo-mechanics` | 23 | Pseudo-element geometry, generated content, and fills. |
| `scrollbar-followup` | 9 | Engine-drawn scrollbar identity outside R-SKIN-15 standard properties. |
| `motion-followup` | 23 | Transition/animation timing evidence for the animation-plane follow-up. |
| `opacity-followup` | 4 | Opacity prominence/treatment evidence. |
| `elevation-followup` | 3 | Identity shadows/rings outside the shared elevated treatment. |
| `reset-absence` | 13 | Absence/reset/transparent mechanics, not positive style carriers. |
| `user-content` | 43 | Rich-text defaults inside user-authored editor content. |
| `identity-geometry` | 61 | Project-exact dimensions, spacing, positioning, and geometry. |

## recipe-identity (37)

Project recipe bundles licensed by R-SKIN-10.

### src/content/overlays/views/macroEditor/editorViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 46 | `.input-dropdown-open` | `border-bottom-left-radius: 0` |
| 47 | `.input-dropdown-open` | `border-bottom-right-radius: 0` |

### src/content/overlays/views/settings/settingsViewStyles.css (6)

| line | selector | declaration |
|---:|---|---|
| 69 | `.seg-option` | `white-space: nowrap` |
| 70 | `.seg-option` | `z-index: 1` |
| 71 | `.seg-option` | `transition: color var(--transition-fast)` |
| 77 | `.seg-option svg` | `vertical-align: middle` |
| 82 | `.seg-option:last-child` | `border-right: none` |
| 86 | `.seg-option[aria-checked="true"]` | `border-right-color: transparent` |

### src/styles/skin/controls.css (29)

| line | selector | declaration |
|---:|---|---|
| 4 | `.input` | `width: 100%` |
| 5 | `.input` | `transition: border-color var(--transition-fast)` |
| 9 | `.input-error:focus` | `box-shadow: inset 0 0 0 2px var(--status-error-wash)` |
| 13 | `.radio` | `width: 16px` |
| 14 | `.radio` | `height: 16px` |
| 18 | `.radio-label` | `cursor: pointer` |
| 19 | `.radio-label` | `user-select: none` |
| 23 | `.checkbox` | `width: 16px` |
| 24 | `.checkbox` | `height: 16px` |
| 35 | `.btn` | `transition: all var(--transition-fast)` |
| 39 | `.btn-success:hover` | `background-color: color-mix(in oklch, var(--status-success) 82%, var(--shadow-color))` |
| 43 | `.btn-link` | `text-decoration: none` |
| 47 | `.btn-link:hover` | `text-decoration: underline` |
| 51 | `.btn-link-danger` | `text-decoration: none` |
| 55 | `.btn-link-danger:hover` | `text-decoration: underline` |
| 59 | `.btn:disabled` | `cursor: not-allowed` |
| 60 | `.btn:disabled` | `opacity: 0.6` |
| 64 | `.btn:disabled:hover` | `background-color: var(--tone-dim)` |
| 65 | `.btn:disabled:hover` | `opacity: 0.6` |
| 73 | `.panel-button` | `transition: all var(--transition-fast)` |
| 100 | `.selectable-group > *` | `cursor: pointer` |
| 101 | `.selectable-group > *` | `transition: all var(--transition-fast)` |
| 102 | `.selectable-group > *` | `user-select: none` |
| 106 | `.selectable-group > *:active` | `transform: scale(0.98)` |
| 110 | `.selectable-group > .is-selected` | `background-color: var(--accent)` |
| 111 | `.selectable-group > .is-selected` | `color: var(--ink-alt)` |
| 112 | `.selectable-group > .is-selected` | `border-color: var(--accent)` |
| 116 | `.selectable-group > .is-selected:hover` | `background-color: var(--accent)` |
| 117 | `.selectable-group > .is-selected:hover` | `opacity: 0.9` |


## brand-identity (11)

Monky-specific brand typography and type treatment.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 70 | `.modal-nav-label` | `font-size: var(--text-base)` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 3 | `:host, #macro-suggestions` | `font-family: 'IBM Plex Condensed Light', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| 4 | `:host, #macro-suggestions` | `line-height: 1.5` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 82 | `.macro-search-count` | `font-variant-numeric: tabular-nums` |
| 88 | `.modal-command-item .modal-command-description` | `font-style: italic` |
| 109 | `.macro-search-kbd` | `line-height: 1` |

### src/content/overlays/views/settings/settingsViewStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 21 | `.settings-section-label` | `letter-spacing: 0.07em` |
| 22 | `.settings-section-label` | `text-transform: uppercase` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 79 | `.content-editor-body` | `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 21 | `.page-title` | `font-family: 'IBM Plex Condensed Light', sans-serif` |
| 25 | `body` | `font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial` |


## component-contract (64)

Component-owned mechanics, exact geometry, or product contract.

### src/content/overlays/modal/modalStyles.css (6)

| line | selector | declaration |
|---:|---|---|
| 19 | `.modal-backdrop` | `inset: 0` |
| 20 | `.modal-backdrop` | `background-color: var(--shadow-color)` |
| 29 | `.modal-dialog` | `mix-blend-mode: multiply` |
| 30 | `.modal-dialog` | `width: min(600px, calc(100vw - 2rem))` |
| 31 | `.modal-dialog` | `height: min(560px, 85vh)` |
| 66 | `.modal-nav-icon` | `height: 18px` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (13)

| line | selector | declaration |
|---:|---|---|
| 10 | `#macro-suggestions *` | `box-sizing: border-box` |
| 27 | `.macro-suggestions-arrow` | `width: 0` |
| 28 | `.macro-suggestions-arrow` | `height: 0` |
| 33 | `.macro-suggestions-arrow.top` | `top: 100%` |
| 34 | `.macro-suggestions-arrow.top` | `left: 50%` |
| 35 | `.macro-suggestions-arrow.top` | `transform: translateX(-50%)` |
| 36 | `.macro-suggestions-arrow.top` | `border-top-color: var(--base-tone)` |
| 40 | `.macro-suggestions-arrow.bottom` | `bottom: 100%` |
| 41 | `.macro-suggestions-arrow.bottom` | `left: 50%` |
| 42 | `.macro-suggestions-arrow.bottom` | `transform: translateX(-50%)` |
| 43 | `.macro-suggestions-arrow.bottom` | `border-bottom-color: var(--base-tone)` |
| 54 | `.macro-suggestions-text-preview` | `-webkit-line-clamp: 3` |
| 55 | `.macro-suggestions-text-preview` | `-webkit-box-orient: vertical` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (15)

| line | selector | declaration |
|---:|---|---|
| 7 | `.macro-editor-view` | `height: 100%` |
| 15 | `.editor-command` | `width: 280px` |
| 20 | `.editor-command-error` | `border-bottom-left-radius: var(--radius-md)` |
| 21 | `.editor-command-error` | `border-bottom-right-radius: var(--radius-md)` |
| 28 | `.editor-content.content-editor` | `min-height: 0` |
| 33 | `.editor-content .content-editor-body` | `min-height: 0` |
| 38 | `.editor-toast` | `left: 50%` |
| 39 | `.editor-toast` | `bottom: 52px` |
| 40 | `.editor-toast` | `transform: translateX(-50%)` |
| 41 | `.editor-toast` | `white-space: nowrap` |
| 52 | `.command-suggestions` | `left: 0` |
| 53 | `.command-suggestions` | `right: 0` |
| 54 | `.command-suggestions` | `top: 100%` |
| 56 | `.command-suggestions` | `border-radius: 0 0 var(--radius-md) var(--radius-md)` |
| 65 | `.command-suggestion-command` | `white-space: nowrap` |

### src/content/overlays/views/search/searchViewStyles.css (7)

| line | selector | declaration |
|---:|---|---|
| 9 | `.macro-search-view` | `height: 100%` |
| 14 | `.macro-search-input` | `width: 100%` |
| 22 | `.macro-search-results` | `align-content: start` |
| 65 | `.macro-search-item-edit` | `right: var(--spacing-sm)` |
| 66 | `.macro-search-item-edit` | `top: 50%` |
| 67 | `.macro-search-item-edit` | `transform: translateY(-50%)` |
| 112 | `.macro-search-kbd` | `border-radius: 4px` |

### src/content/overlays/views/settings/settingsViewStyles.css (4)

| line | selector | declaration |
|---:|---|---|
| 9 | `.settings-view` | `height: 100%` |
| 28 | `.settings-divider` | `height: 0` |
| 33 | `.settings-prefix-btn` | `width: 2rem` |
| 34 | `.settings-prefix-btn` | `height: 2rem` |

### src/options/options.css (4)

| line | selector | declaration |
|---:|---|---|
| 5 | `.prefix-cell` | `aspect-ratio: 1` |
| 6 | `.prefix-cell` | `width: 3rem` |
| 7 | `.prefix-cell` | `height: 3rem` |
| 14 | `.mode-row, .mode-choice` | `width: fit-content` |

### src/popup/popup.css (4)

| line | selector | declaration |
|---:|---|---|
| 6 | `.popup-container` | `width: 320px` |
| 21 | `.popup-search-input` | `width: 100%` |
| 22 | `.popup-search-input` | `box-sizing: border-box` |
| 28 | `.popup-item-toggle` | `width: 100%` |

### src/styles/components/content-editor.css (11)

| line | selector | declaration |
|---:|---|---|
| 10 | `.ce-toolbar-sep` | `width: 1px` |
| 11 | `.ce-toolbar-sep` | `height: 16px` |
| 12 | `.ce-toolbar-sep` | `background-color: var(--harmonic)` |
| 17 | `.ce-toolbar-btn` | `width: 28px` |
| 18 | `.ce-toolbar-btn` | `height: 28px` |
| 34 | `.ce-style-trigger` | `width: auto` |
| 44 | `.ce-style-dropdown` | `top: calc(100% + 4px)` |
| 45 | `.ce-style-dropdown` | `left: 0` |
| 52 | `.ce-style-option` | `width: 100%` |
| 62 | `.ce-style-option-short` | `width: 24px` |
| 70 | `.ce-link-input` | `height: 28px` |


## state-mechanics (5)

Native/JS state mechanics outside backed Ermine conditions.

### src/styles/components/content-editor.css (4)

| line | selector | declaration |
|---:|---|---|
| 24 | `.ce-toolbar-btn.is-active` | `background-color: var(--tone)` |
| 25 | `.ce-toolbar-btn.is-active` | `color: var(--accent)` |
| 57 | `.ce-style-option.is-active` | `color: var(--accent)` |
| 58 | `.ce-style-option.is-active` | `background-color: var(--tone)` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 121 | `.min-selected-1 > .is-selected:only-of-type` | `cursor: not-allowed` |


## aria-current (1)

Current-state layer mechanics left local around ruled current: skin.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 62 | `.modal-nav-tab[aria-current="page"]` | `border-bottom-color: var(--accent)` |


## parent-relational (8)

Guarded parent/descendant state mechanics outside ruled relational words.

### src/content/overlays/views/search/searchViewStyles.css (5)

| line | selector | declaration |
|---:|---|---|
| 44 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `white-space: normal` |
| 45 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `overflow: visible` |
| 46 | `.macro-search-item[aria-selected="true"] .macro-search-item-text` | `text-overflow: clip` |
| 51 | `.macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"]):hover .macro-search-item-text` | `background-color: var(--tone-dim)` |
| 56 | `.macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-command, .macro-search-item:not([data-state="confirming-delete"])[aria-selected="true"] .macro-search-item-text` | `background-color: var(--tone)` |

### src/content/overlays/views/settings/settingsViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 92 | `.seg-control.is-sliding .seg-option[aria-checked="true"]` | `background: transparent` |

### src/popup/popup.css (1)

| line | selector | declaration |
|---:|---|---|
| 17 | `.popup-button:hover, .popup-icon-button:hover` | `opacity: 0.9` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 66 | `.ce-style-option.is-active .ce-style-option-short` | `color: var(--accent)` |


## pseudo-mechanics (23)

Pseudo-element geometry, generated content, and fills.

### src/content/overlays/views/search/searchViewStyles.css (8)

| line | selector | declaration |
|---:|---|---|
| 117 | `.macro-search-kbd::after` | `content: ''` |
| 118 | `.macro-search-kbd::after` | `position: absolute` |
| 119 | `.macro-search-kbd::after` | `background: var(--tone-dim)` |
| 120 | `.macro-search-kbd::after` | `inset: 0 2px 4px` |
| 121 | `.macro-search-kbd::after` | `border: 1px solid var(--harmonic-minor)` |
| 122 | `.macro-search-kbd::after` | `border-radius: 2px` |
| 123 | `.macro-search-kbd::after` | `pointer-events: none` |
| 124 | `.macro-search-kbd::after` | `z-index: -1` |

### src/content/overlays/views/settings/settingsViewStyles.css (12)

| line | selector | declaration |
|---:|---|---|
| 49 | `.seg-control::before` | `content: ''` |
| 50 | `.seg-control::before` | `position: absolute` |
| 51 | `.seg-control::before` | `top: 0` |
| 52 | `.seg-control::before` | `bottom: 0` |
| 53 | `.seg-control::before` | `left: var(--pill-left, 0)` |
| 54 | `.seg-control::before` | `width: var(--pill-width, 0)` |
| 55 | `.seg-control::before` | `background: var(--accent)` |
| 56 | `.seg-control::before` | `opacity: 0` |
| 57 | `.seg-control::before` | `transition: left 0.1s ease, width 0.1s ease` |
| 58 | `.seg-control::before` | `pointer-events: none` |
| 61 | `.seg-control.is-sliding::before` | `opacity: 1` |
| 64 | `.seg-control.seg-snap::before` | `transition: none` |

### src/styles/components/content-editor.css (3)

| line | selector | declaration |
|---:|---|---|
| 84 | `.content-editor-body:empty::before` | `content: attr(data-placeholder)` |
| 85 | `.content-editor-body:empty::before` | `color: var(--ink-soft)` |
| 86 | `.content-editor-body:empty::before` | `pointer-events: none` |


## scrollbar-followup (9)

Engine-drawn scrollbar identity outside R-SKIN-15 standard properties.

### src/styles/skin/controls.css (8)

| line | selector | declaration |
|---:|---|---|
| 77 | `::-webkit-scrollbar` | `width: var(--spacing-md) !important` |
| 78 | `::-webkit-scrollbar` | `height: var(--spacing-md) !important` |
| 82 | `::-webkit-scrollbar-track` | `background: var(--tone-dim) !important` |
| 83 | `::-webkit-scrollbar-track` | `border-radius: var(--radius-md) !important` |
| 87 | `::-webkit-scrollbar-thumb` | `background: var(--tone) !important` |
| 88 | `::-webkit-scrollbar-thumb` | `border-radius: var(--radius-md) !important` |
| 89 | `::-webkit-scrollbar-thumb` | `border: 1px solid var(--tone-dim) !important` |
| 93 | `::-webkit-scrollbar-thumb:hover` | `background: var(--accent-dim) !important` |

### src/styles/theme/metrics.css (1)

| line | selector | declaration |
|---:|---|---|
| 65 | `:root, :host` | `scrollbar-color: var(--tone) var(--tone-dim)` |


## motion-followup (23)

Transition/animation timing evidence for the animation-plane follow-up.

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 23 | `.macro-suggestions-container` | `transition: opacity 0.15s ease, transform 0.15s ease` |
| 49 | `.macro-suggestions-command-item` | `transition: all 0.15s ease` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 11 | `.editor-popout` | `transition: background-color var(--transition-fast), color var(--transition-fast)` |
| 61 | `.command-suggestion-item` | `transition: background-color var(--transition-fast)` |
| 75 | `.command-suggestion-action` | `transition: opacity var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast)` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 15 | `.macro-search-input` | `transition: border-color var(--transition-fast)` |
| 32 | `.macro-search-item-command, .macro-search-item-text` | `transition: background-color var(--transition-fast)` |
| 68 | `.macro-search-item-edit` | `transition: opacity var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast)` |

### src/popup/popup.css (2)

| line | selector | declaration |
|---:|---|---|
| 12 | `.popup-button, .popup-icon-button` | `transition: opacity var(--transition-fast), background-color var(--transition-fast)` |
| 23 | `.popup-search-input` | `transition: border-color var(--transition-fast)` |

### src/styles/components/content-editor.css (2)

| line | selector | declaration |
|---:|---|---|
| 20 | `.ce-toolbar-btn` | `transition: background var(--transition-fast), color var(--transition-fast)` |
| 53 | `.ce-style-option` | `transition: background var(--transition-fast)` |

### src/styles/skin/controls.css (3)

| line | selector | declaration |
|---:|---|---|
| 132 | `.shake` | `animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both` |
| 133 | `.shake` | `transition: none !important` |
| 137 | `.flash` | `animation: flash 0.3s ease` |

### src/styles/theme/metrics.css (8)

| line | selector | declaration |
|---:|---|---|
| 72 | `@keyframes shake > 10%, 90%` | `transform: translate3d(-1px, 0, 0)` |
| 73 | `@keyframes shake > 20%, 80%` | `transform: translate3d(2px, 0, 0)` |
| 74 | `@keyframes shake > 30%, 50%, 70%` | `transform: translate3d(-4px, 0, 0)` |
| 75 | `@keyframes shake > 40%, 60%` | `transform: translate3d(4px, 0, 0)` |
| 79 | `@keyframes pulse > 0%, 100%` | `transform: scale(1)` |
| 80 | `@keyframes pulse > 50%` | `transform: scale(1.05)` |
| 84 | `@keyframes flash > 0%, 100%` | `opacity: 1` |
| 85 | `@keyframes flash > 50%` | `opacity: 0.4` |


## opacity-followup (4)

Opacity prominence/treatment evidence.

### src/content/overlays/views/search/searchViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 78 | `.macro-search-item-text mark span` | `opacity: 0.35` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 40 | `.ce-style-caret` | `opacity: 0.6` |

### src/styles/skin/controls.css (2)

| line | selector | declaration |
|---:|---|---|
| 122 | `.min-selected-1 > .is-selected:only-of-type` | `opacity: 0.95` |
| 126 | `.min-selected-1 > .is-selected:only-of-type:hover` | `opacity: 0.95` |


## elevation-followup (3)

Identity shadows/rings outside the shared elevated treatment.

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 28 | `.modal-dialog` | `box-shadow: rgba(31, 32, 34, 0.3) 0px 1px 2px 0px, rgba(31, 32, 34, 0.15) 0px 2px 6px 2px` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 20 | `.macro-suggestions-container` | `box-shadow: 0 10px 25px -5px var(--shadow-color)` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 42 | `.editor-toast` | `box-shadow: 0 6px 16px -4px rgb(0 0 0 / 25%)` |


## reset-absence (13)

Absence/reset/transparent mechanics, not positive style carriers.

### src/content/overlays/deleteConfirm/deleteConfirmStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 8 | `.macro-suggestions-command-item.delete-confirm-option` | `max-width: none` |

### src/content/overlays/modal/modalStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 55 | `.modal-nav-tab` | `border-bottom: 2px solid transparent` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (2)

| line | selector | declaration |
|---:|---|---|
| 16 | `button, input, textarea, select` | `font-family: inherit` |
| 29 | `.macro-suggestions-arrow` | `border: 6px solid transparent` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 55 | `.command-suggestions` | `border-top: none` |

### src/content/overlays/views/search/searchViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 72 | `.macro-search-item-text mark` | `background: transparent` |
| 73 | `.macro-search-item-text mark` | `color: inherit` |
| 74 | `.macro-search-item-text mark` | `font-style: normal` |

### src/popup/popup.css (4)

| line | selector | declaration |
|---:|---|---|
| 11 | `.popup-button, .popup-icon-button` | `border: none` |
| 29 | `.popup-item-toggle` | `border: none` |
| 30 | `.popup-item-toggle` | `background: transparent` |
| 56 | `.popup-results` | `list-style: none` |

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 80 | `.content-editor-body` | `line-height: normal` |


## user-content (43)

Rich-text defaults inside user-authored editor content.

### src/styles/components/content-editor.css (43)

| line | selector | declaration |
|---:|---|---|
| 91 | `.content-editor-body p` | `margin-bottom: 0.75em` |
| 95 | `.content-editor-body p:last-child` | `margin-bottom: 0` |
| 99 | `.content-editor-body h1` | `font-size: 1.75em` |
| 100 | `.content-editor-body h1` | `font-weight: 700` |
| 101 | `.content-editor-body h1` | `margin: 0.75em 0 0.4em` |
| 105 | `.content-editor-body h2` | `font-size: 1.4em` |
| 106 | `.content-editor-body h2` | `font-weight: 700` |
| 107 | `.content-editor-body h2` | `margin: 0.75em 0 0.4em` |
| 111 | `.content-editor-body h3` | `font-size: 1.15em` |
| 112 | `.content-editor-body h3` | `font-weight: 700` |
| 113 | `.content-editor-body h3` | `margin: 0.75em 0 0.4em` |
| 119 | `.content-editor-body h1:first-child, .content-editor-body h2:first-child, .content-editor-body h3:first-child` | `margin-top: 0` |
| 124 | `.content-editor-body strong, .content-editor-body b` | `font-weight: 700` |
| 129 | `.content-editor-body em, .content-editor-body i` | `font-style: italic` |
| 133 | `.content-editor-body u` | `text-decoration: underline` |
| 137 | `.content-editor-body s` | `text-decoration: line-through` |
| 141 | `.content-editor-body code` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 142 | `.content-editor-body code` | `font-size: 0.88em` |
| 143 | `.content-editor-body code` | `background-color: var(--tone)` |
| 144 | `.content-editor-body code` | `color: var(--ink)` |
| 145 | `.content-editor-body code` | `padding: 0.1em 0.35em` |
| 146 | `.content-editor-body code` | `border-radius: var(--radius-sm)` |
| 150 | `.content-editor-body pre` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 151 | `.content-editor-body pre` | `font-size: 0.88em` |
| 152 | `.content-editor-body pre` | `background-color: var(--tone)` |
| 153 | `.content-editor-body pre` | `padding: var(--spacing-md)` |
| 154 | `.content-editor-body pre` | `border-radius: var(--radius-sm)` |
| 155 | `.content-editor-body pre` | `overflow-x: auto` |
| 156 | `.content-editor-body pre` | `margin: 0.75em 0` |
| 160 | `.content-editor-body blockquote` | `border-left: 3px solid var(--accent-dim)` |
| 161 | `.content-editor-body blockquote` | `padding-left: var(--spacing-md)` |
| 162 | `.content-editor-body blockquote` | `margin: 0.75em 0` |
| 163 | `.content-editor-body blockquote` | `color: var(--ink-soft)` |
| 164 | `.content-editor-body blockquote` | `font-style: italic` |
| 169 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `padding-left: 1.5em` |
| 170 | `.content-editor .content-editor-body ul, .content-editor .content-editor-body ol` | `margin-bottom: 0.75em` |
| 174 | `.content-editor .content-editor-body ul` | `list-style-type: disc` |
| 178 | `.content-editor .content-editor-body ol` | `list-style-type: decimal` |
| 182 | `.content-editor-body li` | `display: list-item` |
| 183 | `.content-editor-body li` | `margin-bottom: 0.2em` |
| 187 | `.content-editor-body a` | `color: var(--accent)` |
| 188 | `.content-editor-body a` | `text-decoration: underline` |
| 192 | `.content-editor-body a:hover` | `opacity: 0.8` |


## identity-geometry (61)

Project-exact dimensions, spacing, positioning, and geometry.

### src/content/overlays/deleteConfirm/deleteConfirmStyles.css (1)

| line | selector | declaration |
|---:|---|---|
| 2 | `.macro-suggestions-container.delete-confirm` | `min-width: 240px` |

### src/content/overlays/modal/modalStyles.css (4)

| line | selector | declaration |
|---:|---|---|
| 21 | `.modal-backdrop` | `z-index: 10000` |
| 36 | `.modal-nav-container` | `min-height: 48px` |
| 40 | `.modal-nav-branding` | `margin-right: 1rem` |
| 54 | `.modal-nav-tab` | `padding: var(--spacing-md) var(--spacing-2xl)` |

### src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css (9)

| line | selector | declaration |
|---:|---|---|
| 5 | `:host, #macro-suggestions` | `position: fixed !important` |
| 6 | `:host, #macro-suggestions` | `z-index: 2147483646 !important` |
| 21 | `.macro-suggestions-container` | `min-width: 200px` |
| 22 | `.macro-suggestions-container` | `max-width: 360px` |
| 47 | `.macro-suggestions-command-item` | `max-width: 8em` |
| 48 | `.macro-suggestions-command-item` | `padding: 3px 6px` |
| 53 | `.macro-suggestions-text-preview` | `display: -webkit-box` |
| 59 | `.macro-suggestions-footer` | `justify-content: flex-end` |
| 64 | `.macro-suggestions-kbd` | `padding: 1px 4px` |

### src/content/overlays/views/macroEditor/editorViewStyles.css (3)

| line | selector | declaration |
|---:|---|---|
| 32 | `.editor-content .content-editor-body` | `flex: 1` |
| 57 | `.command-suggestions` | `z-index: 10` |
| 71 | `.command-suggestion-item > .command-suggestion-action, .command-suggestion-actions` | `margin-left: auto` |

### src/content/overlays/views/search/searchViewStyles.css (11)

| line | selector | declaration |
|---:|---|---|
| 20 | `.macro-search-results` | `max-height: 400px` |
| 21 | `.macro-search-results` | `grid-template-columns: fit-content(140px) 1fr` |
| 27 | `.macro-search-item` | `grid-template-columns: subgrid` |
| 36 | `.macro-search-item-command` | `padding-right: var(--spacing-xs)` |
| 40 | `.macro-search-item-text` | `padding-left: var(--spacing-xs)` |
| 61 | `.macro-search-item-confirm` | `padding-left: var(--spacing-xs)` |
| 104 | `.macro-search-shortcut` | `margin-right: var(--spacing-xl)` |
| 110 | `.macro-search-kbd` | `padding: 3px 6px 6px` |
| 111 | `.macro-search-kbd` | `min-width: 26px` |
| 113 | `.macro-search-kbd` | `z-index: 0` |
| 128 | `.macro-search-kbd:first-child` | `margin-left: 0` |

### src/content/overlays/views/settings/settingsViewStyles.css (6)

| line | selector | declaration |
|---:|---|---|
| 13 | `.settings-body` | `padding: var(--spacing-2xl) 0 var(--spacing-xl)` |
| 17 | `.settings-group` | `grid-template-columns: 1fr 3fr` |
| 23 | `.settings-section-label` | `padding: var(--spacing-md) var(--spacing-sm) 0 0` |
| 29 | `.settings-divider` | `margin: var(--spacing-sm) var(--spacing-xl)` |
| 35 | `.settings-prefix-btn` | `padding: 0` |
| 39 | `.settings-import-status` | `padding: var(--spacing-xs) var(--spacing-xl) var(--spacing-sm)` |

### src/options/options.css (1)

| line | selector | declaration |
|---:|---|---|
| 8 | `.prefix-cell` | `flex: 0 0 auto` |

### src/popup/popup.css (8)

| line | selector | declaration |
|---:|---|---|
| 35 | `.popup-item-detail` | `margin-top: var(--spacing-sm)` |
| 36 | `.popup-item-detail` | `padding-top: var(--spacing-sm)` |
| 40 | `.popup-macro-text` | `white-space: pre-wrap` |
| 41 | `.popup-macro-text` | `margin: 0` |
| 46 | `.popup-toggle-label` | `margin-left: var(--spacing-sm)` |
| 53 | `.popup-results` | `max-height: 256px` |
| 54 | `.popup-results` | `padding: var(--spacing-sm) 0` |
| 55 | `.popup-results` | `margin: 0` |

### src/styles/components/content-editor.css (11)

| line | selector | declaration |
|---:|---|---|
| 13 | `.ce-toolbar-sep` | `margin: 0 var(--spacing-xs)` |
| 19 | `.ce-toolbar-btn` | `padding: 0` |
| 29 | `.ce-toolbar-icon` | `padding: 0 var(--spacing-xs)` |
| 35 | `.ce-style-trigger` | `min-width: 36px` |
| 36 | `.ce-style-trigger` | `padding: 0 var(--spacing-xs)` |
| 37 | `.ce-style-trigger` | `gap: 2px` |
| 46 | `.ce-style-dropdown` | `z-index: 10` |
| 47 | `.ce-style-dropdown` | `min-width: 140px` |
| 48 | `.ce-style-dropdown` | `gap: 2px` |
| 71 | `.ce-link-input` | `padding: 0 var(--spacing-sm)` |
| 76 | `.content-editor-body` | `min-height: 150px` |

### src/styles/entries/pages.css (6)

| line | selector | declaration |
|---:|---|---|
| 11 | `.page-container` | `padding: var(--spacing-2xl)` |
| 12 | `.page-container` | `max-width: 672px` |
| 13 | `.page-container` | `margin: 0 auto` |
| 14 | `.page-container` | `min-height: 100vh` |
| 26 | `body` | `margin: 0` |
| 27 | `body` | `padding: 0` |

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 29 | `.editor-content` | `min-height: 150px` |

