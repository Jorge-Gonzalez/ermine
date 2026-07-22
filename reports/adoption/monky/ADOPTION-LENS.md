# monky Adoption Lens

Generated from `reports/adoption/monky/current-ledger.json` and `reports/adoption/monky/rule-action-review.json` with `test/fixtures/monky-classlist-corpus.json`.

This report is an index for editor and adoption tooling. It does not change the strict
ledger counts. Semantic fragments, authored-content defaults, and browser adapters are
listed here as named non-residual categories: they are outside the flat Ermine word target
unless a later design explicitly promotes a new layer.

## Provenance

| source | commit |
|---|---|
| Ermine | `5d1629d40d9299533158c0a871706fa4757b6ded` |
| monky | `f8cfd2f6cfef8f5f4162e6f97bc70b4e872cc3df` |

## Summary

| metric | count |
| --- | --- |
| declarations | 506 |
| residue declarations | 99 |
| reviewed declarations | 99 |
| combine candidate paragraphs | 40 |
| classlists with project tokens | 301 |

## Lens Categories

| category | declarations | meaning |
| --- | --- | --- |
| ermine-infrastructure | 407 | already adopted or framework infrastructure |
| semantic-fragment | 45 | CSS-bearing reusable object below component scale |
| authored-content-default | 45 | content editor/user-authored HTML defaults, outside utility authorship |
| browser-adapter | 9 | vendor or browser-divergent selector/property boundary |

## Repeated Paragraph Evidence

These are not automatic combines. They are the repeated Ermine-only paragraph shapes the
Adoption Lens can show as combine evidence during review.

| count | words | paragraph | examples |
| --- | --- | --- | --- |
| 10 | 10 | `horizontal align-center justify-center position-relative ground ink-soft rule-soft ruled font-xs font-mono` | src/content/overlays/views/search/ui/MacroSearchFooter.tsx#4, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#5, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#7, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#9, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#11 |
| 8 | 7 | `ground-subtle ink rule corner-sm ruled font-xs font-mono` | src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#8, src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#9, src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#10, src/content/overlays/suggestionsOverlay/ui/MacroSuggestions.tsx#6, src/content/overlays/suggestionsOverlay/ui/MacroSuggestions.tsx#7 |
| 8 | 5 | `horizontal inline gap-sm margin-right-xl align-center` | src/content/overlays/views/search/ui/MacroSearchFooter.tsx#3, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#6, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#8, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#10, src/content/overlays/views/search/ui/MacroSearchFooter.tsx#12 |
| 5 | 7 | `grid-fit-sm elastic basis-ratio content-align-start scroll-auto max-height-results-md scrollbar-subtle` | src/content/overlays/views/search/ui/MacroCommandResults.tsx#1, src/content/overlays/views/search/ui/MacroCommandResults.tsx#3, src/content/overlays/views/search/ui/MacroSearchResults.tsx#1, src/content/overlays/views/search/ui/MacroSearchResults.tsx#3, src/content/overlays/views/search/ui/MacroSearchView.tsx#1 |
| 5 | 5 | `horizontal gap-lg padding-block-sm align-center justify-between` | src/content/overlays/views/settings/ui/SettingsView.tsx#8, src/content/overlays/views/settings/ui/SettingsView.tsx#11, src/content/overlays/views/settings/ui/SettingsView.tsx#17, src/content/overlays/views/settings/ui/SettingsView.tsx#20, src/content/overlays/views/settings/ui/SettingsView.tsx#26 |
| 5 | 3 | `rigid ink font-md` | src/content/overlays/views/settings/ui/SettingsView.tsx#9, src/content/overlays/views/settings/ui/SettingsView.tsx#12, src/content/overlays/views/settings/ui/SettingsView.tsx#18, src/content/overlays/views/settings/ui/SettingsView.tsx#21, src/content/overlays/views/settings/ui/SettingsView.tsx#27 |
| 4 | 4 | `boxed ink font-sm font-medium` | src/editor/ui/MacroForm.tsx#2, src/editor/ui/MacroForm.tsx#4, src/editor/ui/MacroForm.tsx#8, src/editor/ui/Settings.tsx#4 |
| 3 | 9 | `padding-xs tween-opacity-ground-quick ground-subtle ink rule corner-md font-sm pressable hover:alpha-90` | src/popup/ui/ThemeSwitcher.tsx#2, src/popup/ui/ThemeSwitcher.tsx#3, src/popup/ui/ThemeSwitcher.tsx#4 |
| 3 | 9 | `quarter padding-right-sm padding-top-md padding-bottom-none padding-left-none ink-accent-soft font-xs font-medium overline` | src/content/overlays/views/settings/ui/SettingsView.tsx#6, src/content/overlays/views/settings/ui/SettingsView.tsx#15, src/content/overlays/views/settings/ui/SettingsView.tsx#24 |
| 3 | 7 | `vertical gap-md padding-lg ground-subtle rule corner-md ruled` | src/editor/ui/Settings.tsx#1, src/options/ui/PrefixEditor.tsx#1, src/options/ui/ReplacementMode.tsx#1 |
| 3 | 6 | `control-size-lg rule corner-sm ruled pressable focus:ring` | src/content/overlays/views/macroEditor/ui/ModalMacroForm.tsx#11, src/editor/ui/MacroForm.tsx#7, src/popup/ui/SiteToggle.tsx#6 |
| 3 | 4 | `elastic basis-ratio three-quarters min-width-none` | src/content/overlays/views/settings/ui/SettingsView.tsx#7, src/content/overlays/views/settings/ui/SettingsView.tsx#16, src/content/overlays/views/settings/ui/SettingsView.tsx#25 |

## Boundary And Word-Pressure Examples

| lens category | source | selector | property | value | reason |
| --- | --- | --- | --- | --- | --- |
| authored-content-default | src/styles/fragments/semantic-fragments.css:6 | `.sf-authored-content` | font-family | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:7 | `.sf-authored-content` | line-height | `normal` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:11 | `.sf-authored-content p` | margin-bottom | `0.75em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:15 | `.sf-authored-content p:last-child` | margin-bottom | `0` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:19 | `.sf-authored-content h1` | font-size | `1.75em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:20 | `.sf-authored-content h1` | font-weight | `700` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:21 | `.sf-authored-content h1` | margin | `0.75em 0 0.4em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:25 | `.sf-authored-content h2` | font-size | `1.4em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:26 | `.sf-authored-content h2` | font-weight | `700` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:27 | `.sf-authored-content h2` | margin | `0.75em 0 0.4em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:31 | `.sf-authored-content h3` | font-size | `1.15em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:32 | `.sf-authored-content h3` | font-weight | `700` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:33 | `.sf-authored-content h3` | margin | `0.75em 0 0.4em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:39 | `.sf-authored-content h1:first-child, .sf-authored-content h2:first-child, .sf-authored-content h3:first-child` | margin-top | `0` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:44 | `.sf-authored-content strong, .sf-authored-content b` | font-weight | `700` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:49 | `.sf-authored-content em, .sf-authored-content i` | font-style | `italic` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:53 | `.sf-authored-content u` | text-decoration | `underline` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:57 | `.sf-authored-content s` | text-decoration | `line-through` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:61 | `.sf-authored-content code` | font-family | `'IBM Plex Mono', 'Fira Code', monospace` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:62 | `.sf-authored-content code` | font-size | `0.88em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:63 | `.sf-authored-content code` | background-color | `var(--tone)` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:64 | `.sf-authored-content code` | color | `var(--ink)` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:65 | `.sf-authored-content code` | padding | `0.1em 0.35em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:66 | `.sf-authored-content code` | border-radius | `var(--radius-sm)` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:70 | `.sf-authored-content pre` | font-family | `'IBM Plex Mono', 'Fira Code', monospace` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:71 | `.sf-authored-content pre` | font-size | `0.88em` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:72 | `.sf-authored-content pre` | background-color | `var(--tone)` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:73 | `.sf-authored-content pre` | padding | `var(--spacing-md)` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:74 | `.sf-authored-content pre` | border-radius | `var(--radius-sm)` | content editor defaults are inverse to utility styling |
| authored-content-default | src/styles/fragments/semantic-fragments.css:75 | `.sf-authored-content pre` | overflow-x | `auto` | content editor defaults are inverse to utility styling |
