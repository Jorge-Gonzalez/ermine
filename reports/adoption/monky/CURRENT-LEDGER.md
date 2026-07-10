# Ermine current ledger — monky

Generated artifact. Do not hand-edit; regenerate with:

```sh
node --import tsx adoption/current-ledger.ts --project ../monky --name monky --write
```

## Provenance

| source | commit |
|---|---|
| Ermine | `60232eb8c098a7cead1b650b80749a79de9adbe2` |
| monky | `6c8476dfbd46d474934015434d1ca3557bf2a9d7` |

Unlike the frozen baseline ledger, this report is a live reconciliation: it scans the
project's current CSS, compiles the full Ermine vocabulary through the real emitter, and
matches (condition, property, resolved value) after routing both sides through the
project's scale bindings and socket bridge. Human judgments are recorded in
`current-overrides.json` and re-validated on every run.

## Headline

| measure | count |
|---|---:|
| current declarations | 787 |
| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | 175 |
| **residue — project-owned declarations** | **612** |
| assimilable now (work list below) | 100 |

## Residue by reason code

| code | count | meaning |
|---|---:|---|
| `ermine-emitted` | 84 | the generated Ermine grammar surface (adopted, not residue) |
| `substrate` | 51 | reset, base typography, and font delivery below grammar authoring |
| `theme-metric` | 39 | project scale values and Ermine scale bindings (deliberate non-coverage) |
| `config-departure` | 1 | explicit project departure recorded in ermine.config.css |
| `assimilable` | 100 | an existing Ermine word expresses this now — next assimilation pass |
| `state-review` | 18 | same-element state condition with no matching backed prefix yet |
| `focus-state` | 15 | focus treatment pending a focus condition ruling |
| `aria-current` | 3 | aria-current backing; deliberately not recast as selected:/checked: |
| `parent-relational` | 12 | ancestor state drives a descendant; conditions are same-element today |
| `pseudo-mechanics` | 23 | pseudo-element geometry, fills, and content |
| `scrollbar-followup` | 24 | scrollbar prominence (named follow-up question) |
| `motion-followup` | 28 | transition/animation timing (named follow-up question) |
| `opacity-followup` | 9 | opacity state treatment (named follow-up question) |
| `elevation-followup` | 5 | shadow geometry pending raised/sunken (named follow-up question) |
| `reset-absence` | 42 | absence/reset mechanics, not a positive carrier |
| `user-content` | 43 | rich-text defaults inside user-authored content |
| `identity-geometry` | 99 | project-exact geometry on a grammar-family property |
| `skin-review` | 96 | paint awaiting a carrier or recipe judgment |
| `identity-review` | 95 | awaiting project judgment |

## Residue by file

| file | declarations |
|---|---:|
| `src/styles/components/content-editor.css` | 125 |
| `src/styles/skin/controls.css` | 118 |
| `src/content/overlays/views/search/searchViewStyles.css` | 73 |
| `src/popup/popup.css` | 54 |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | 50 |
| `src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` | 48 |
| `src/content/overlays/views/settings/settingsViewStyles.css` | 48 |
| `src/styles/skin/surfaces.css` | 36 |
| `src/content/overlays/modal/modalStyles.css` | 22 |
| `src/styles/entries/pages.css` | 14 |
| `src/styles/theme/metrics.css` | 9 |
| `src/content/overlays/deleteConfirm/deleteConfirmStyles.css` | 5 |
| `src/options/options.css` | 5 |
| `src/styles/skin/typography.css` | 5 |

## Assimilable work list

Declarations an existing Ermine word can express today.

| file | selector | property | word(s) |
|---|---|---|---|
| `src/content/overlays/modal/modalStyles.css` | `.modal-dialog` | `border-radius` | `corner-lg` |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | `.editor-toast` | `position` | `position-absolute` |
| `src/content/overlays/views/macroEditor/editorViewStyles.css` | `.command-suggestion-item > .command-suggestion-action, .command-suggestion-actions` | `flex-shrink` | `expandable`, `rigid` |
| `src/content/overlays/views/search/searchViewStyles.css` | `.macro-search-results` | `overflow-y` | `scroll-auto` |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.settings-view` | `overflow-y` | `scroll-auto` |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.settings-row-label` | `flex-shrink` | `expandable`, `rigid` |
| `src/content/overlays/views/settings/settingsViewStyles.css` | `.seg-option svg` | `display` | `boxed-inline` |
| `src/popup/popup.css` | `.popup-results` | `overflow-y` | `scroll-auto` |
| `src/styles/components/content-editor.css` | `.content-editor` | `background-color` | `ground-subtle` |
| `src/styles/components/content-editor.css` | `.ce-toolbar` | `background-color` | `ground` |
| `src/styles/components/content-editor.css` | `.ce-toolbar-btn` | `border-radius` | `corner-sm` |
| `src/styles/components/content-editor.css` | `.ce-toolbar-btn` | `color` | `ink-soft` |
| `src/styles/components/content-editor.css` | `.ce-toolbar-btn:hover` | `background-color` | `hover:ground-defined` |
| `src/styles/components/content-editor.css` | `.ce-toolbar-btn:hover` | `color` | `hover:ink` |
| `src/styles/components/content-editor.css` | `.ce-toolbar-btn svg` | `display` | `boxed` |
| `src/styles/components/content-editor.css` | `.ce-toolbar-icon` | `color` | `ink-soft` |
| `src/styles/components/content-editor.css` | `.ce-style-trigger` | `font-size` | `font-sm` |
| `src/styles/components/content-editor.css` | `.ce-style-trigger` | `font-weight` | `font-medium` |
| `src/styles/components/content-editor.css` | `.ce-style-caret svg` | `display` | `boxed` |
| `src/styles/components/content-editor.css` | `.ce-style-dropdown` | `background-color` | `ground` |
| `src/styles/components/content-editor.css` | `.ce-style-dropdown` | `border-radius` | `corner-md` |
| `src/styles/components/content-editor.css` | `.ce-style-option` | `border-radius` | `corner-sm` |
| `src/styles/components/content-editor.css` | `.ce-style-option` | `color` | `ink` |
| `src/styles/components/content-editor.css` | `.ce-style-option` | `font-size` | `font-sm` |
| `src/styles/components/content-editor.css` | `.ce-style-option:hover` | `background-color` | `hover:ground-defined` |
| `src/styles/components/content-editor.css` | `.ce-style-option-short` | `font-size` | `font-xs` |
| `src/styles/components/content-editor.css` | `.ce-style-option-short` | `font-weight` | `font-semibold` |
| `src/styles/components/content-editor.css` | `.ce-style-option-short` | `color` | `ink-soft` |
| `src/styles/components/content-editor.css` | `.ce-link-input` | `border-radius` | `corner-sm` |
| `src/styles/components/content-editor.css` | `.ce-link-input` | `background-color` | `ground-subtle` |
| `src/styles/components/content-editor.css` | `.ce-link-input` | `color` | `ink` |
| `src/styles/components/content-editor.css` | `.ce-link-input` | `font-size` | `font-sm` |
| `src/styles/components/content-editor.css` | `.content-editor-body` | `padding` | `padding-comfortable` |
| `src/styles/components/content-editor.css` | `.content-editor-body` | `color` | `ink` |
| `src/styles/components/content-editor.css` | `.content-editor-body` | `font-size` | `font-md` |
| `src/styles/components/content-editor.css` | `.content-editor-body` | `border-radius` | `corner-lg` |
| `src/styles/entries/pages.css` | `.page-title` | `font-size` | `font-2xl` |
| `src/styles/entries/pages.css` | `.page-title` | `color` | `ink` |
| `src/styles/entries/pages.css` | `body` | `background-color` | `ground` |
| `src/styles/entries/pages.css` | `body` | `color` | `ink` |
| `src/styles/skin/controls.css` | `.label` | `display` | `boxed` |
| `src/styles/skin/controls.css` | `.label` | `font-size` | `font-sm` |
| `src/styles/skin/controls.css` | `.label` | `font-weight` | `font-medium` |
| `src/styles/skin/controls.css` | `.label` | `color` | `ink` |
| `src/styles/skin/controls.css` | `.input` | `border-radius` | `corner-3xl` |
| `src/styles/skin/controls.css` | `.input` | `font-size` | `font-md` |
| `src/styles/skin/controls.css` | `.input` | `background-color` | `ground-subtle` |
| `src/styles/skin/controls.css` | `.input` | `color` | `ink` |
| `src/styles/skin/controls.css` | `.input-error` | `border-color` | `rule-fail` |
| `src/styles/skin/controls.css` | `.radio-label` | `font-size` | `font-md` |
| `src/styles/skin/controls.css` | `.radio-label` | `color` | `ink` |
| `src/styles/skin/controls.css` | `.checkbox` | `border-radius` | `corner-sm` |
| `src/styles/skin/controls.css` | `.editor-content` | `color` | `ink` |
| `src/styles/skin/controls.css` | `.btn` | `border-radius` | `corner-md` |
| `src/styles/skin/controls.css` | `.btn` | `font-size` | `font-md` |
| `src/styles/skin/controls.css` | `.btn` | `font-weight` | `font-medium` |
| `src/styles/skin/controls.css` | `.btn-secondary` | `background-color` | `ground-subtle` |
| `src/styles/skin/controls.css` | `.btn-secondary` | `color` | `ink` |
| `src/styles/skin/controls.css` | `.btn-secondary:hover` | `background-color` | `hover:ground-defined` |
| `src/styles/skin/controls.css` | `.btn-outlined` | `background-color` | `ground` |
| `src/styles/skin/controls.css` | `.btn-outlined` | `color` | `ink` |
| `src/styles/skin/controls.css` | `.btn-outlined:hover` | `background-color` | `hover:ground-defined` |
| `src/styles/skin/controls.css` | `.btn-success` | `background-color` | `ground-pass` |
| `src/styles/skin/controls.css` | `.btn-success` | `color` | `ink-inverse` |
| `src/styles/skin/controls.css` | `.btn-link` | `color` | `ink-accent` |
| `src/styles/skin/controls.css` | `.btn-link` | `font-size` | `font-sm` |
| `src/styles/skin/controls.css` | `.btn-link-danger` | `color` | `ink-fail` |
| `src/styles/skin/controls.css` | `.btn-link-danger` | `font-size` | `font-sm` |
| `src/styles/skin/controls.css` | `.btn:disabled:hover` | `background-color` | `hover:ground-subtle` |
| `src/styles/skin/controls.css` | `.panel-button` | `font-weight` | `font-medium` |
| `src/styles/skin/controls.css` | `.selectable-group > *` | `position` | `position-relative` |
| `src/styles/skin/controls.css` | `.selectable-group > *:hover` | `background-color` | `hover:ground-defined` |
| `src/styles/skin/controls.css` | `.selectable-group > .is-selected:hover` | `background-color` | `hover:ground-accent` |
| `src/styles/skin/surfaces.css` | `.section` | `padding` | `padding-relaxed` |
| `src/styles/skin/surfaces.css` | `.section` | `border-radius` | `corner-md` |
| `src/styles/skin/surfaces.css` | `.section` | `background-color` | `ground-subtle` |
| `src/styles/skin/surfaces.css` | `.section-title` | `font-size` | `font-lg` |
| `src/styles/skin/surfaces.css` | `.section-title` | `color` | `ink` |
| `src/styles/skin/surfaces.css` | `.section-description` | `color` | `ink-soft` |
| `src/styles/skin/surfaces.css` | `.alert` | `padding` | `padding-comfortable` |
| `src/styles/skin/surfaces.css` | `.alert` | `border-radius` | `corner-md` |
| `src/styles/skin/surfaces.css` | `.alert-error` | `background-color` | `ground-fail-faint` |
| `src/styles/skin/surfaces.css` | `.alert-error` | `border-color` | `rule-fail` |
| `src/styles/skin/surfaces.css` | `.alert-error` | `color` | `ink-fail` |
| `src/styles/skin/surfaces.css` | `.alert-success` | `background-color` | `ground-pass-faint` |
| `src/styles/skin/surfaces.css` | `.alert-success` | `border-color` | `rule-pass` |
| `src/styles/skin/surfaces.css` | `.alert-success` | `color` | `ink-pass` |
| `src/styles/skin/surfaces.css` | `.validation-error` | `color` | `ink-fail` |
| `src/styles/skin/surfaces.css` | `.validation-error` | `font-size` | `font-xs` |
| `src/styles/skin/surfaces.css` | `.card` | `background-color` | `ground` |
| `src/styles/skin/surfaces.css` | `.card` | `border-radius` | `corner-md` |
| `src/styles/skin/surfaces.css` | `.card` | `padding` | `padding-comfortable` |
| `src/styles/skin/surfaces.css` | `.empty-state` | `padding` | `padding-relaxed` |
| `src/styles/skin/surfaces.css` | `.empty-state` | `color` | `ink-soft` |
| `src/styles/skin/surfaces.css` | `.empty-state` | `font-size` | `font-md` |
| `src/styles/skin/typography.css` | `.text-sm` | `font-size` | `font-sm` |
| `src/styles/skin/typography.css` | `.text-lg` | `font-size` | `font-lg` |
| `src/styles/skin/typography.css` | `.font-medium` | `font-weight` | `font-medium` |
| `src/styles/skin/typography.css` | `.font-semibold` | `font-weight` | `font-semibold` |
| `src/styles/skin/typography.css` | `.font-bold` | `font-weight` | `font-bold` |

Every record with its code is in `current-ledger.json`.
