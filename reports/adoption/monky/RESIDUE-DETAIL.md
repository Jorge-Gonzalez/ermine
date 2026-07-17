# Monky Residue Detail

Generated from `reports/adoption/monky/current-ledger.json`. This lists every current Monky declaration counted as project-owned residue, excluding adopted/infrastructure and zero review buckets.

Regenerate with:

```sh
node --import tsx adoption/residue-detail.ts --name monky --write
```

## Provenance

| source | commit |
|---|---|
| Ermine | `ed12f35b46a9e139bbdec298ae11fe98d4a86840` |
| monky | `fdedcfd3ba2e159efd677473801c32bb5d5e282c` |

## Summary

- Current declarations: 510
- Adopted/infrastructure declarations: 396
- Project-owned residue declarations: 114
- Assimilable declarations: 0
- Shadowed words: 0

| code | declarations | meaning |
|---|---:|---|
| `recipe-identity` | 28 | a project recipe class bundle (R-SKIN-10) — socket-consuming product identity |
| `brand-identity` | 2 | project brand typography and type treatment |
| `component-contract` | 1 | component-owned mechanics, exact geometry, or product contract |
| `state-mechanics` | 1 | JS/native state mechanics outside backed Ermine conditions |
| `parent-relational` | 1 | guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13) |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 8 | engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15) |
| `motion-followup` | 1 | transition/animation timing (deferred to GAP-U-animation-plane) |
| `opacity-followup` | 2 | opacity state treatment (named follow-up question) |
| `user-content` | 43 | rich-text defaults inside user-authored content |
| `identity-geometry` | 4 | project-exact geometry on a grammar-family property |

## recipe-identity (28)

a project recipe class bundle (R-SKIN-10) — socket-consuming product identity

### src/styles/fragments/semantic-fragments.css (16)

| line | selector | declaration |
|---:|---|---|
| 6 | `.sf-authored-content` | `font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| 7 | `.sf-authored-content` | `line-height: normal` |
| 126 | `:host(.sf-foreign-overlay-host), .sf-foreign-overlay-host` | `position: fixed !important` |
| 127 | `:host(.sf-foreign-overlay-host), .sf-foreign-overlay-host` | `z-index: var(--monky-foreign-overlay-z, 10000) !important` |
| 132 | `.sf-callout-arrow` | `width: 0` |
| 133 | `.sf-callout-arrow` | `border: 6px solid transparent` |
| 137 | `.sf-callout-arrow-top` | `border-top-color: var(--base-tone)` |
| 141 | `.sf-callout-arrow-bottom` | `border-bottom-color: var(--base-tone)` |
| 146 | `.sf-keycap` | `padding: 1px 4px` |
| 151 | `.sf-keycap-raised` | `line-height: 1` |
| 152 | `.sf-keycap-raised` | `padding: 3px 6px 6px` |
| 153 | `.sf-keycap-raised` | `min-width: 26px` |
| 154 | `.sf-keycap-raised` | `border-radius: 4px` |
| 155 | `.sf-keycap-raised` | `z-index: 0` |
| 170 | `.sf-keycap-raised:first-child` | `margin-left: 0` |
| 196 | `.sf-segmented-control-option svg` | `vertical-align: middle` |

### src/styles/skin/controls.css (12)

| line | selector | declaration |
|---:|---|---|
| 4 | `.input-error:focus` | `box-shadow: inset 0 0 0 2px var(--status-error-wash)` |
| 8 | `.radio-label` | `cursor: pointer` |
| 9 | `.radio-label` | `user-select: none` |
| 15 | `.btn-success:hover` | `background-color: color-mix(in oklch, var(--status-success) 82%, var(--shadow-color))` |
| 19 | `.btn:disabled` | `cursor: not-allowed` |
| 20 | `.btn:disabled` | `opacity: 0.6` |
| 24 | `.btn:disabled:hover` | `background-color: var(--tone-dim)` |
| 25 | `.btn:disabled:hover` | `opacity: 0.6` |
| 37 | `.selectable-group > *` | `cursor: pointer` |
| 38 | `.selectable-group > *` | `user-select: none` |
| 42 | `.selectable-group > *:active` | `transform: scale(0.98)` |
| 46 | `.selectable-group > .is-selected:hover` | `opacity: 0.9` |

## brand-identity (2)

project brand typography and type treatment

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 12 | `.page-title` | `font-family: 'IBM Plex Condensed Light', sans-serif` |
| 16 | `body` | `font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial` |

## component-contract (1)

component-owned mechanics, exact geometry, or product contract

### src/styles/components/content-editor.css (1)

| line | selector | declaration |
|---:|---|---|
| 10 | `.ce-toolbar-sep` | `background-color: var(--harmonic)` |

## state-mechanics (1)

JS/native state mechanics outside backed Ermine conditions

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 50 | `.min-selected-1 > .is-selected:only-of-type` | `cursor: not-allowed` |

## parent-relational (1)

guarded/JS-state relational mechanics outside the ruled prefixes (R-STATE-13)

### src/styles/fragments/semantic-fragments.css (1)

| line | selector | declaration |
|---:|---|---|
| 200 | `.sf-segmented-pill.is-sliding .sf-segmented-control-option[aria-checked="true"]` | `background: transparent` |

## pseudo-mechanics (23)

pseudo-element geometry, fills, and content

### src/styles/fragments/semantic-fragments.css (23)

| line | selector | declaration |
|---:|---|---|
| 117 | `.sf-generated-placeholder:empty::before` | `content: attr(data-placeholder)` |
| 118 | `.sf-generated-placeholder:empty::before` | `color: var(--ink-soft)` |
| 119 | `.sf-generated-placeholder:empty::before` | `pointer-events: none` |
| 159 | `.sf-keycap-raised::after` | `content: ''` |
| 160 | `.sf-keycap-raised::after` | `position: absolute` |
| 161 | `.sf-keycap-raised::after` | `background: var(--tone-dim)` |
| 162 | `.sf-keycap-raised::after` | `inset: 0 2px 4px` |
| 163 | `.sf-keycap-raised::after` | `border: 1px solid var(--harmonic-minor)` |
| 164 | `.sf-keycap-raised::after` | `border-radius: 2px` |
| 165 | `.sf-keycap-raised::after` | `pointer-events: none` |
| 166 | `.sf-keycap-raised::after` | `z-index: -1` |
| 175 | `.sf-segmented-pill::before` | `content: ''` |
| 176 | `.sf-segmented-pill::before` | `position: absolute` |
| 177 | `.sf-segmented-pill::before` | `top: 0` |
| 178 | `.sf-segmented-pill::before` | `bottom: 0` |
| 179 | `.sf-segmented-pill::before` | `left: var(--pill-left, 0)` |
| 180 | `.sf-segmented-pill::before` | `width: var(--pill-width, 0)` |
| 181 | `.sf-segmented-pill::before` | `background: var(--accent)` |
| 182 | `.sf-segmented-pill::before` | `opacity: 0` |
| 183 | `.sf-segmented-pill::before` | `transition: left 0.1s ease, width 0.1s ease` |
| 184 | `.sf-segmented-pill::before` | `pointer-events: none` |
| 188 | `.sf-segmented-pill.is-sliding::before` | `opacity: 1` |
| 192 | `.sf-segmented-pill.seg-snap::before` | `transition: none` |

## scrollbar-followup (8)

engine-drawn scrollbar identity outside the ruled treatment (R-SKIN-15)

### src/styles/fragments/semantic-fragments.css (8)

| line | selector | declaration |
|---:|---|---|
| 205 | `::-webkit-scrollbar` | `width: var(--spacing-md) !important` |
| 206 | `::-webkit-scrollbar` | `height: var(--spacing-md) !important` |
| 210 | `::-webkit-scrollbar-track` | `background: var(--tone-dim) !important` |
| 211 | `::-webkit-scrollbar-track` | `border-radius: var(--radius-md) !important` |
| 215 | `::-webkit-scrollbar-thumb` | `background: var(--tone) !important` |
| 216 | `::-webkit-scrollbar-thumb` | `border-radius: var(--radius-md) !important` |
| 217 | `::-webkit-scrollbar-thumb` | `border: 1px solid var(--tone-dim) !important` |
| 221 | `::-webkit-scrollbar-thumb:hover` | `background: var(--accent-dim) !important` |

## motion-followup (1)

transition/animation timing (deferred to GAP-U-animation-plane)

### src/styles/skin/controls.css (1)

| line | selector | declaration |
|---:|---|---|
| 61 | `.shake` | `transition: none !important` |

## opacity-followup (2)

opacity state treatment (named follow-up question)

### src/styles/skin/controls.css (2)

| line | selector | declaration |
|---:|---|---|
| 51 | `.min-selected-1 > .is-selected:only-of-type` | `opacity: 0.95` |
| 55 | `.min-selected-1 > .is-selected:only-of-type:hover` | `opacity: 0.95` |

## user-content (43)

rich-text defaults inside user-authored content

### src/styles/fragments/semantic-fragments.css (43)

| line | selector | declaration |
|---:|---|---|
| 11 | `.sf-authored-content p` | `margin-bottom: 0.75em` |
| 15 | `.sf-authored-content p:last-child` | `margin-bottom: 0` |
| 19 | `.sf-authored-content h1` | `font-size: 1.75em` |
| 20 | `.sf-authored-content h1` | `font-weight: 700` |
| 21 | `.sf-authored-content h1` | `margin: 0.75em 0 0.4em` |
| 25 | `.sf-authored-content h2` | `font-size: 1.4em` |
| 26 | `.sf-authored-content h2` | `font-weight: 700` |
| 27 | `.sf-authored-content h2` | `margin: 0.75em 0 0.4em` |
| 31 | `.sf-authored-content h3` | `font-size: 1.15em` |
| 32 | `.sf-authored-content h3` | `font-weight: 700` |
| 33 | `.sf-authored-content h3` | `margin: 0.75em 0 0.4em` |
| 39 | `.sf-authored-content h1:first-child, .sf-authored-content h2:first-child, .sf-authored-content h3:first-child` | `margin-top: 0` |
| 44 | `.sf-authored-content strong, .sf-authored-content b` | `font-weight: 700` |
| 49 | `.sf-authored-content em, .sf-authored-content i` | `font-style: italic` |
| 53 | `.sf-authored-content u` | `text-decoration: underline` |
| 57 | `.sf-authored-content s` | `text-decoration: line-through` |
| 61 | `.sf-authored-content code` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 62 | `.sf-authored-content code` | `font-size: 0.88em` |
| 63 | `.sf-authored-content code` | `background-color: var(--tone)` |
| 64 | `.sf-authored-content code` | `color: var(--ink)` |
| 65 | `.sf-authored-content code` | `padding: 0.1em 0.35em` |
| 66 | `.sf-authored-content code` | `border-radius: var(--radius-sm)` |
| 70 | `.sf-authored-content pre` | `font-family: 'IBM Plex Mono', 'Fira Code', monospace` |
| 71 | `.sf-authored-content pre` | `font-size: 0.88em` |
| 72 | `.sf-authored-content pre` | `background-color: var(--tone)` |
| 73 | `.sf-authored-content pre` | `padding: var(--spacing-md)` |
| 74 | `.sf-authored-content pre` | `border-radius: var(--radius-sm)` |
| 75 | `.sf-authored-content pre` | `overflow-x: auto` |
| 76 | `.sf-authored-content pre` | `margin: 0.75em 0` |
| 80 | `.sf-authored-content blockquote` | `border-left: 3px solid var(--accent-dim)` |
| 81 | `.sf-authored-content blockquote` | `padding-left: var(--spacing-md)` |
| 82 | `.sf-authored-content blockquote` | `margin: 0.75em 0` |
| 83 | `.sf-authored-content blockquote` | `color: var(--ink-soft)` |
| 84 | `.sf-authored-content blockquote` | `font-style: italic` |
| 89 | `.sf-authored-content ul, .sf-authored-content ol` | `padding-left: 1.5em` |
| 90 | `.sf-authored-content ul, .sf-authored-content ol` | `margin-bottom: 0.75em` |
| 94 | `.sf-authored-content ul` | `list-style-type: disc` |
| 98 | `.sf-authored-content ol` | `list-style-type: decimal` |
| 102 | `.sf-authored-content li` | `display: list-item` |
| 103 | `.sf-authored-content li` | `margin-bottom: 0.2em` |
| 107 | `.sf-authored-content a` | `color: var(--accent)` |
| 108 | `.sf-authored-content a` | `text-decoration: underline` |
| 112 | `.sf-authored-content a:hover` | `opacity: 0.8` |

## identity-geometry (4)

project-exact geometry on a grammar-family property

### src/styles/components/content-editor.css (2)

| line | selector | declaration |
|---:|---|---|
| 15 | `.ce-style-trigger` | `gap: 2px` |
| 20 | `.ce-style-dropdown` | `gap: 2px` |

### src/styles/entries/pages.css (2)

| line | selector | declaration |
|---:|---|---|
| 17 | `body` | `margin: 0` |
| 18 | `body` | `padding: 0` |
