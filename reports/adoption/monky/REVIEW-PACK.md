# Ermine Admission Review Pack: monky

Input for one admission pass: the mechanical candidates with their evidence, the
structures around them, and the vocabulary they must fit. The mechanics never promote;
this review decides, and a human ratifies.

## Protocol

You are the admission reviewer for emergent combines. Promotion is vocabulary growth,
not compression: a group earns a name only when the name says more than the words
already say — never merely shorter. The default verdict for every candidate is
**hold-as-stem**: holding costs nothing, a wrong admission costs forever. Admission
must be argued from the evidence below, never from a name merely sounding good.

Run two passes:

1. **Proposer** — for each idiom family target, read the core words as intent and read the usage
   contexts, then either propose one or two names or hold. A name is one general role
   noun, optionally preceded by a variant modifier.
2. **Gatekeeper** — attack every proposed name. Reject when the name paraphrases the
   words (no surplus meaning), when an existing word or combine already covers the
   role, when the role noun is domain- or project-bound, or when the evidence is one
   context's markup dressed as generality.

A surviving name must pass all three admission tests, in order:

1. **Surplus meaning** — the name states a role the word list does not state.
2. **Role noun** — exactly one general role noun (chip, panel, row, frame, cell,
   keycap, control, …), optional variant modifier, no mechanism words, no domain nouns.
3. **Project-agnostic** — the name would mean the same thing in a different product.
   Back-translation check: ask a model that has NOT seen the definition to expand the
   name into Ermine words; low overlap with the actual paragraph exposes an opaque or
   project-bound name.

Budget: admit at most 3 combines in this pass. If more survive, rank them and hold
the rest for the next iteration.

Verdicts: `admit` (name + one-sentence intent), `hold-as-stem`, `role-bound-hold`
(coherent but bound to a role-bound word's role), `identity` (component-owned).

## Required Output

Produce a single fenced JSON document — nothing else — matching:

```json
{
  "version": 1,
  "verdicts": [
    { "paragraph": "<family core or candidate paragraph, copied verbatim>",
      "verdict": "admit | hold-as-stem | role-bound-hold | identity",
      "name": "<required for admit>",
      "intent": "<one sentence, required for admit>",
      "justification": "<one line citing evidence: spread, cohesion, usage, flags>" }
  ],
  "expansions": [ { "name": "<admitted name>", "words": ["<ermine word>", "..."] } ]
}
```

One verdict per idiom family target. The `expansions` are the back-translation check: produce
them in a FRESH conversation (or subagent) that has seen only the Existing Vocabulary
section and the admitted names — never the candidate paragraphs — listing the words
each name suggests. Ermine scores the overlap itself.

Save the JSON as `admission-verdicts.json` and validate it with:

```sh
npm run adoption:admission -- --project <path> --verdicts admission-verdicts.json
```

The intake validates paragraphs, budget, and name collisions mechanically, scores the
back-translation, and renders the draft review. Admissions are drafts. A human
ratifies them in commit review; nothing in this pass changes the grammar by itself.

## Family Candidates for Review

Review idiom family cores. Members are evidence for whether the core has a general
name, and variants should normally remain direct Ermine additions. Fluency families
are shown separately as held structure.

- idiom: 3x, 3 files, 3 directories
  paragraph: `ground rule corner-lg ruled elevated-soft`
  core axes: skin-ground, skin-rule, corner, rule-presence, elevation
  usage: <div>
  usage: <div> in `modal-backdrop sf-foreign-overlay-host horizontal align-cent`
  members:
  - 1x, 1 files, local-evidence `hidden max-width-popover-2xl min-width-popover-sm tween-opacity-transform-quick ground rule corner-lg ruled font-md elevated-soft` + `hidden max-width-popover-2xl min-width-popover-sm tween-opacity-transform-quick font-md`
  - 1x, 1 files, local-evidence `max-width-popover-2xl min-width-popover-md tween-opacity-transform-quick ground rule corner-lg ruled font-md elevated-soft` + `max-width-popover-2xl min-width-popover-md tween-opacity-transform-quick font-md`
  - 1x, 1 files, local-evidence `vertical hidden dialog-measure ground rule corner-lg ruled elevated-soft` + `vertical hidden dialog-measure`
- idiom: 3x, 2 files, 1 directories
  paragraph: `padding-block-xs padding-inline-sm tween-opacity-ground-quick ink-inverse corner-md pressable hover:alpha-90`
  core axes: padding, tween, skin-ink, corner, affordance, concealment
  usage: <button> "+ {t('popup.newMacro')}"
  usage: <button> "{t('macroItem.edit')}" in `horizontal gap-sm`
  usage: <button> "{t('macroItem.delete')}" in `horizontal gap-sm`
  members:
  - 1x, 1 files, local-evidence `padding-block-xs padding-inline-sm tween-opacity-ground-quick ground-accent ink-inverse corner-md font-sm pressable hover:alpha-90` + `ground-accent font-sm`
  - 1x, 1 files, local-evidence `padding-block-xs padding-inline-sm tween-opacity-ground-quick ground-accent ink-inverse corner-md font-xs font-semibold pressable hover:alpha-90` + `ground-accent font-xs font-semibold`
  - 1x, 1 files, local-evidence `padding-block-xs padding-inline-sm tween-opacity-ground-quick ground-fail ink-inverse corner-md font-sm pressable hover:alpha-90` + `ground-fail font-sm`
- idiom: 3x, 2 files, 1 directories
  paragraph: `horizontal padding-xs align-center justify-center corner-sm pressable`
  core axes: structure, padding, alignment-container, corner, affordance
  usage: <button> in `command-suggestion-actions horizontal rigid push gap-xs alig`
  usage: <button> in `editor-topbar-lead horizontal rigid gap-sm align-center`
  members:
  - 1x, 1 files, local-evidence `horizontal padding-xs align-center justify-center tween-ground-ink-quick ink-soft corner-sm pressable hover:ground-defined hover:ink-accent` + `tween-ground-ink-quick ink-soft hover:ground-defined hover:ink-accent`
  - 1x, 1 files, local-evidence `horizontal rigid padding-xs align-center justify-center tween-opacity-ground-ink-quick ink-fail corner-sm pressable hover:ground-fail hover:ink-inverse` + `rigid tween-opacity-ground-ink-quick ink-fail hover:ground-fail hover:ink-inverse`
  - 1x, 1 files, local-evidence `horizontal rigid padding-xs align-center justify-center tween-opacity-ground-ink-quick ink-soft corner-sm pressable hover:ground-defined hover:ink` + `rigid tween-opacity-ground-ink-quick ink-soft hover:ground-defined hover:ink`
- idiom: 2x, 2 files, 2 directories
  paragraph: `ground rule corner-md ruled`
  core axes: skin-ground, skin-rule, corner, rule-presence
  usage: <div>
  members:
  - 1x, 1 files, local-evidence `padding-md ground rule corner-md ruled` + `padding-md`
  - 1x, 1 files, local-evidence `padding-sm ground rule corner-md ruled` + `padding-sm`

## Fluency Families (held structure)

- fluency: 59x, 23 files, 10 directories
  paragraph: ``
  usage: <div>
  usage: <form>
  usage: <ContentEditor> in `editor-form vertical elastic basis-ratio gap-md min-height-n`
  usage: <span> "{t(opt.labelKey as Parameters" in `ce-style-option fill-inline horizontal gap-sm padding-block-`
  usage: <div> "{childrenWithProps}" in `modal-dialog vertical hidden dialog-measure ground rule corn`
  members:
  - 8x, 1 files, local-evidence `horizontal inline gap-sm align-center` + `horizontal inline gap-sm align-center`
  - 5x, 3 files, candidate `grid-fit-sm elastic basis-ratio content-align-start scroll-auto max-height-results-md scrollbar-subtle` + `grid-fit-sm elastic basis-ratio content-align-start scroll-auto max-height-results-md scrollbar-subtle`
  - 5x, 1 files, local-evidence `horizontal gap-lg padding-block-sm align-center justify-between` + `horizontal gap-lg padding-block-sm align-center justify-between`
  - 3x, 1 files, local-evidence `elastic basis-ratio three-quarters min-width-none` + `elastic basis-ratio three-quarters min-width-none`
  - 3x, 2 files, stem `horizontal gap-sm` + `horizontal gap-sm`
  - 3x, 3 files, candidate `vertical gap-md padding-lg ground-subtle rule corner-md ruled` + `vertical gap-md padding-lg ground-subtle rule corner-md ruled`
  - 2x, 2 files, stem `horizontal gap-md align-center` + `horizontal gap-md align-center`
  - 2x, 2 files, candidate `horizontal gap-xs padding-xs rule-soft ruled-bottom` + `horizontal gap-xs padding-xs rule-soft ruled-bottom`
  - 2x, 2 files, stem `horizontal inline` + `horizontal inline`
  - 2x, 1 files, local-evidence `horizontal rigid gap-sm align-center hug-inline` + `horizontal rigid gap-sm align-center hug-inline`
  - 2x, 1 files, local-evidence `horizontal rigid gap-xs padding-block-xs padding-inline-sm align-center wrap-allowed ground` + `horizontal rigid gap-xs padding-block-xs padding-inline-sm align-center wrap-allowed ground`
  - 1x, 1 files, stem `elastic basis-ratio` + `elastic basis-ratio`
  - 1x, 1 files, stem `elastic basis-ratio min-height-none` + `elastic basis-ratio min-height-none`
  - 1x, 1 files, local-evidence `elastic basis-ratio width-popover-lg position-relative` + `elastic basis-ratio width-popover-lg position-relative`
  - 1x, 1 files, stem `horizontal align-center alpha-60` + `horizontal align-center alpha-60`
  - 1x, 1 files, local-evidence `horizontal elastic basis-ratio gap-xs align-center` + `horizontal elastic basis-ratio gap-xs align-center`
  - 1x, 1 files, local-evidence `horizontal gap-lg align-center justify-between` + `horizontal gap-lg align-center justify-between`
  - 1x, 1 files, stem `horizontal gap-sm align-center` + `horizontal gap-sm align-center`
  - 1x, 1 files, local-evidence `horizontal gap-sm align-center ink font-sm pressable` + `horizontal gap-sm align-center ink font-sm pressable`
  - 1x, 1 files, local-evidence `horizontal gap-sm align-center ink-accent` + `horizontal gap-sm align-center ink-accent`
  - 1x, 1 files, local-evidence `horizontal gap-sm align-center justify-between` + `horizontal gap-sm align-center justify-between`
  - 1x, 1 files, stem `horizontal gap-sm wrap-allowed` + `horizontal gap-sm wrap-allowed`
  - 1x, 1 files, stem `horizontal gap-xs` + `horizontal gap-xs`
  - 1x, 1 files, local-evidence `horizontal grow-1 gap-sm align-center` + `horizontal grow-1 gap-sm align-center`
  - 1x, 1 files, stem `horizontal inline gap-sm` + `horizontal inline gap-sm`
  - 1x, 1 files, local-evidence `horizontal inline rigid gap-xs align-center pressable` + `horizontal inline rigid gap-xs align-center pressable`
  - 1x, 1 files, local-evidence `horizontal padding-inline-lg align-center justify-between min-height-control-3xl` + `horizontal padding-inline-lg align-center justify-between min-height-control-3xl`
  - 1x, 1 files, local-evidence `horizontal rigid gap-md align-center justify-between` + `horizontal rigid gap-md align-center justify-between`
  - 1x, 1 files, local-evidence `horizontal rigid gap-sm align-center` + `horizontal rigid gap-sm align-center`
  - 1x, 1 files, local-evidence `horizontal rigid gap-xs push align-center` + `horizontal rigid gap-xs push align-center`
  - 1x, 1 files, local-evidence `vertical elastic basis-ratio gap-md min-height-none position-relative` + `vertical elastic basis-ratio gap-md min-height-none position-relative`
  - 1x, 1 files, local-evidence `vertical elastic basis-ratio hidden min-height-none` + `vertical elastic basis-ratio hidden min-height-none`
  - 1x, 1 files, stem `vertical gap-md` + `vertical gap-md`
- fluency: 9x, 8 files, 4 directories
  paragraph: `font-md`
  core axes: font-size
  usage: <div> "{t('modalSearch.noMatchingCommands')}" in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
  usage: <div> "{searchQuery ? t('modalSearch.noMacrosFound') : t('modalSear" in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
  usage: <div> "{emptyState}"
  usage: <div> "No items found"
  usage: <p> "{t('options.prefixEditor.description')}" in `section vertical gap-md padding-lg ground-subtle rule corner`
  members:
  - 2x, 2 files, stem `ink-soft font-md` + `ink-soft`
  - 2x, 2 files, stem `padding-lg ink-soft font-md` + `padding-lg ink-soft`
  - 2x, 2 files, candidate `span-all padding-lg ink-soft font-md text-center` + `span-all padding-lg ink-soft text-center`
  - 1x, 1 files, local-evidence `padding-left-xs padding-top-md padding-right-md padding-bottom-md tween-ground-quick ink-soft rule-soft font-md parent-hover:ground-subtle parent-selected:ground-defined` + `padding-left-xs padding-top-md padding-right-md padding-bottom-md tween-ground-quick ink-soft rule-soft parent-hover:ground-subtle parent-selected:ground-defined`
  - 1x, 1 files, local-evidence `padding-lg ink-soft font-md text-center` + `padding-lg ink-soft text-center`
  - 1x, 1 files, local-evidence `span-all padding-lg font-md text-center` + `span-all padding-lg text-center`
- fluency: 9x, 4 files, 4 directories
  paragraph: `rigid font-md`
  core axes: m2-flex, font-size
  usage: <span> "{t('options.prefixEditor.title')}" in `settings-row horizontal gap-lg padding-block-sm align-center`
  usage: <span> "{t('replacementMode.title')}" in `settings-row horizontal gap-lg padding-block-sm align-center`
  usage: <span> "{t('settings.colorTheme')}" in `settings-row horizontal gap-lg padding-block-sm align-center`
  usage: <span> "{t('settings.language')}" in `settings-row horizontal gap-lg padding-block-sm align-center`
  usage: <span> "{t('settings.importExport.title')}" in `settings-row horizontal gap-lg padding-block-sm align-center`
  members:
  - 5x, 1 files, stem `rigid ink font-md` + `ink`
  - 2x, 1 files, local-evidence `rigid ink font-md pressable` + `ink pressable`
  - 1x, 1 files, stem `rigid font-md`
  - 1x, 1 files, local-evidence `rigid ink-accent font-md font-medium text-nowrap` + `ink-accent font-medium text-nowrap`
- fluency: 7x, 6 files, 6 directories
  paragraph: ``
  usage: <p> "{t('macroList.noMacros')}" in `vertical gap-xs padding-block-sm padding-inline-none margin-`
  usage: <div>
  usage: <hr> in `page-container fill-viewport vertical gap-lg padding-2xl max`
  usage: <div> in `settings-body padding-top-2xl padding-right-none padding-bot`
  usage: <div> in `macro-suggestions-container hidden min-width-popover-sm max-`
  members:
  - 2x, 1 files, local-evidence `margin-block-sm margin-inline-xl height-none rule ruled-top` + `margin-block-sm margin-inline-xl height-none rule ruled-top`
  - 1x, 1 files, local-evidence `horizontal gap-md padding-block-xs padding-inline-md justify-end ground ink-soft rule font-xs` + `horizontal gap-md padding-block-xs padding-inline-md justify-end ground ink-soft rule font-xs`
  - 1x, 1 files, local-evidence `horizontal gap-md padding-block-xs padding-inline-md justify-end ground ink-soft rule ruled-top font-xs` + `horizontal gap-md padding-block-xs padding-inline-md justify-end ground ink-soft rule ruled-top font-xs`
  - 1x, 1 files, local-evidence `horizontal padding-sm justify-between ground ink-soft rule ruled-top font-sm` + `horizontal padding-sm justify-between ground ink-soft rule ruled-top font-sm`
  - 1x, 1 files, stem `padding-sm ink-soft font-sm` + `padding-sm ink-soft font-sm`
  - 1x, 1 files, stem `rule ruled-top` + `rule ruled-top`
- fluency: 5x, 3 files, 2 directories
  paragraph: `ink font-medium`
  core axes: skin-ink, font-weight
  usage: <label> "{t('macroForm.triggerLabel')}" in `vertical gap-md`
  usage: <label> "{t('macroForm.textLabel')}" in `vertical gap-md`
  usage: <span> "{t('macroForm.sensitiveLabel')}" in `vertical gap-md`
  usage: <label> "{t('settings.language')}" in `horizontal gap-md align-center`
  usage: <p> "{t('popup.macrosOnThisSite')}" in `hidden font-sm`
  members:
  - 4x, 2 files, candidate `boxed ink font-sm font-medium` + `boxed font-sm`
  - 1x, 1 files, stem `ink font-medium`
- fluency: 4x, 4 files, 2 directories
  paragraph: `vertical gap-sm`
  core axes: structure, density
  usage: <div>
  usage: <div> "{macros.map(m =>"
  usage: <div> in `padding-sm ground rule corner-md ruled`
  members:
  - 1x, 1 files, stem `vertical gap-sm`
  - 1x, 1 files, stem `vertical gap-sm margin-block-sm` + `margin-block-sm`
  - 1x, 1 files, local-evidence `vertical gap-sm padding-sm width-popover-xl ground ink` + `padding-sm width-popover-xl ground ink`
  - 1x, 1 files, local-evidence `vertical gap-sm padding-top-sm rule-soft ruled-top` + `padding-top-sm rule-soft ruled-top`
- fluency: 4x, 3 files, 2 directories
  paragraph: `hidden`
  core axes: overflow
  usage: <span> "{macro.text}" in `command-suggestions hidden position-absolute attach-below st`
  usage: <p> "{result.obj.text}" in `padding-sm rule-soft ruled-bottom`
  usage: <div> in `horizontal padding-sm align-center justify-between ground-su`
  usage: <p> "{displayHostname}" in `hidden font-sm`
  members:
  - 2x, 2 files, candidate `hidden ink-soft font-sm truncate` + `ink-soft font-sm truncate`
  - 1x, 1 files, stem `hidden font-sm` + `font-sm`
  - 1x, 1 files, local-evidence `hidden ink-soft font-xs truncate` + `ink-soft font-xs truncate`
- fluency: 3x, 3 files, 3 directories
  paragraph: `vertical fill-block`
  core axes: structure, fill
  usage: <div>
  members:
  - 1x, 1 files, stem `vertical fill-block`
  - 1x, 1 files, local-evidence `vertical padding-xl fill-block ink` + `padding-xl ink`
  - 1x, 1 files, local-evidence `vertical scroll-auto fill-block scrollbar-subtle` + `scroll-auto scrollbar-subtle`
- fluency: 2x, 2 files, 2 directories
  paragraph: `font-semibold font-mono`
  core axes: font-weight, font-family
  usage: <span> "{macro.command}" in `delete-confirm-message padding-block-sm padding-inline-md in`
  usage: <span> "{macro.command}" in `card padding-md ground rule corner-md ruled`
  members:
  - 1x, 1 files, stem `font-semibold font-mono`
  - 1x, 1 files, stem `ink-accent font-semibold font-mono` + `ink-accent`
- fluency: 2x, 2 files, 2 directories
  paragraph: `ink font-lg`
  core axes: skin-ink, font-size
  usage: <h1> "{t('popup.title')}" in `horizontal grow-1 gap-sm align-center`
  usage: <h1> "{editing ? t('macroEditor.title.editShort') : t('macroEditor" in `editor-topbar-lead horizontal rigid gap-sm align-center`
  members:
  - 1x, 1 files, stem `ink font-lg font-bold` + `font-bold`
  - 1x, 1 files, stem `ink font-lg font-semibold` + `font-semibold`
- fluency: 2x, 1 files, 1 directories
  paragraph: `font-sm undecorated hover:underlined`
  core axes: font-size, text-decoration
  usage: <button> "{t('macroItemEditor.edit')}" in `button-group horizontal inline`
  usage: <button> "{t('macroItemEditor.delete')}" in `button-group horizontal inline`
  members:
  - 1x, 1 files, local-evidence `ink-accent font-sm undecorated hover:underlined` + `ink-accent`
  - 1x, 1 files, local-evidence `ink-fail font-sm undecorated hover:underlined` + `ink-fail`

## Individual Paragraph Evidence

- 3x, 6 words, 3 files, 3 directories
  paragraph: `control-size-lg rule corner-sm ruled pressable focus:ring`
  axes: fill, skin-rule, corner, rule-presence, affordance, focus-ring
  cohesion: below evidence floor (3x)
  scoped: `focus:ring`
  usage: <input> in `editor-sensitive horizontal gap-sm align-center ink font-sm `
  usage: <input> in `vertical gap-md`
  usage: <input> in `horizontal inline rigid margin-left-sm align-center gap-xs p`
  examples: src/content/overlays/views/macroEditor/ui/ModalMacroForm.tsx#11, src/editor/ui/MacroForm.tsx#7, src/popup/ui/SiteToggle.tsx#6
- 3x, 7 words, 3 files, 2 directories
  paragraph: `vertical gap-md padding-lg ground-subtle rule corner-md ruled`
  axes: structure, density, padding, skin-ground, skin-rule, corner, rule-presence
  cohesion: below evidence floor (3x)
  usage: <div>
  examples: src/editor/ui/Settings.tsx#1, src/options/ui/PrefixEditor.tsx#1, src/options/ui/ReplacementMode.tsx#1
- 5x, 7 words, 3 files, 1 directories
  paragraph: `grid-fit-sm elastic basis-ratio content-align-start scroll-auto max-height-results-md scrollbar-subtle`
  axes: structure, m2-flex, m3-self-size, alignment-container, overflow, constraints, scrollbar
  cohesion: 1 median closure, 90% closed pairs
  role-bound: `max-height-results-md`
  usage: <div>
  usage: <div> "{commands.map((cmd, index) => ("
  usage: <div> "{macros.map((macro, index) => ("
  examples: src/content/overlays/views/search/ui/MacroCommandResults.tsx#1, src/content/overlays/views/search/ui/MacroCommandResults.tsx#3, src/content/overlays/views/search/ui/MacroSearchResults.tsx#1, src/content/overlays/views/search/ui/MacroSearchResults.tsx#3, src/content/overlays/views/search/ui/MacroSearchView.tsx#1
- 8x, 7 words, 2 files, 2 directories
  paragraph: `ground-subtle ink rule corner-sm ruled font-xs font-mono`
  axes: skin-ground, skin-ink, skin-rule, corner, rule-presence, font-size, font-family
  cohesion: 0.67 median closure, 38% closed pairs
  usage: <kbd> "Tab" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  usage: <kbd> "↵" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  usage: <kbd> "Esc" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  usage: <kbd> "←" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  usage: <kbd> "→" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  examples: src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#8, src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#9, src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#10, src/content/overlays/suggestionsOverlay/ui/MacroSuggestions.tsx#6, src/content/overlays/suggestionsOverlay/ui/MacroSuggestions.tsx#7
- 2x, 7 words, 2 files, 2 directories
  paragraph: `vertical gap-lg padding-2xl centered flush-block max-width-2xl fill-viewport`
  axes: structure, density, padding, margin, constraints, viewport-fill
  cohesion: below evidence floor (2x)
  usage: <div>
  examples: src/editor/ui/Editor.tsx#1, src/options/ui/Options.tsx#1
- 2x, 5 words, 2 files, 2 directories
  paragraph: `horizontal gap-xs padding-xs rule-soft ruled-bottom`
  axes: structure, density, padding, skin-rule, rule-presence
  cohesion: below evidence floor (2x)
  usage: <div> in `macro-suggestions-container delete-confirm min-width-popover`
  usage: <div> "{visibleMacros.map((macro, index) => (" in `macro-suggestions-container hidden min-width-popover-sm max-`
  examples: src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#4, src/content/overlays/suggestionsOverlay/ui/MacroSuggestions.tsx#2
- 2x, 4 words, 2 files, 2 directories
  paragraph: `hidden ink-soft font-sm truncate`
  axes: overflow, skin-ink, font-size, truncation
  cohesion: below evidence floor (2x)
  usage: <span> "{macro.text}" in `command-suggestions hidden position-absolute attach-below st`
  usage: <p> "{result.obj.text}" in `padding-sm rule-soft ruled-bottom`
  examples: src/content/overlays/views/macroEditor/ui/CommandSuggestions.tsx#4, src/popup/ui/MacroSearch.tsx#6
- 4x, 4 words, 2 files, 1 directories
  paragraph: `boxed ink font-sm font-medium`
  axes: m1-flow-participation, skin-ink, font-size, font-weight
  cohesion: 1 median closure, 50% closed pairs
  usage: <label> "{t('macroForm.triggerLabel')}" in `vertical gap-md`
  usage: <label> "{t('macroForm.textLabel')}" in `vertical gap-md`
  usage: <span> "{t('macroForm.sensitiveLabel')}" in `vertical gap-md`
  usage: <label> "{t('settings.language')}" in `horizontal gap-md align-center`
  examples: src/editor/ui/MacroForm.tsx#2, src/editor/ui/MacroForm.tsx#4, src/editor/ui/MacroForm.tsx#8, src/editor/ui/Settings.tsx#4
- 2x, 5 words, 2 files, 1 directories
  paragraph: `span-all padding-lg ink-soft font-md text-center`
  axes: m5-grid-placement, padding, skin-ink, font-size, text-align
  cohesion: below evidence floor (2x)
  usage: <div> "{t('modalSearch.noMatchingCommands')}" in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
  usage: <div> "{searchQuery ? t('modalSearch.noMacrosFound') : t('modalSear" in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
  examples: src/content/overlays/views/search/ui/MacroCommandResults.tsx#2, src/content/overlays/views/search/ui/MacroSearchResults.tsx#2
- 2x, 4 words, 2 files, 1 directories
  paragraph: `subgrid span-all position-relative selectable`
  axes: structure, m5-grid-placement, position-mode, state.selection
  cohesion: below evidence floor (2x)
  usage: <div> in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
  usage: <div>
  examples: src/content/overlays/views/search/ui/MacroCommandResults.tsx#4, src/content/overlays/views/search/ui/MacroSearchResults.tsx#4

## Held by the Mechanics (context, not review targets)

- stem (compositional core; stays spelled out): 3x `horizontal gap-sm`
- stem (compositional core; stays spelled out): 2x `horizontal gap-md align-center`
- stem (compositional core; stays spelled out): 2x `padding-lg ink-soft font-md`
- stem (compositional core; stays spelled out): 2x `horizontal inline`
- stem (compositional core; stays spelled out): 2x `ink-soft font-md`
- stem (compositional core; stays spelled out): 5x `rigid ink font-md`
- stem (compositional core; stays spelled out): 3x `columns-12 padding-block-xl padding-inline-3xl`
- stem (compositional core; stays spelled out): 2x `rigid control-size-lg pressable`
- stem (compositional core; stays spelled out): 1x `padding-bottom-xl padding-top-2xl padding-right-none padding-left-none`
- stem (compositional core; stays spelled out): 1x `elastic basis-ratio min-height-none`

## Existing Vocabulary

A new name must not collide with any word below and should follow the same
morphology. `<…>` marks parametric steps.

- structure (layout): horizontal, vertical, grid, grid-fit-<size>, columns-12, subgrid
- m1-flow-participation (layout): inline, boxed, boxed-inline
- m2-flex (layout): grow-N, shrink-N, rigid, compressible, expandable, elastic
- m3-self-size (layout): basis-content, basis-ratio, basis-exact-<size>
- m4-self-alignment (layout): self-start, self-center, self-end, self-stretch, self-baseline
- m5-grid-placement (layout): span-N, row-span-N, span-all, half, third, quarter, two-thirds, three-quarters, sixth
- density (layout): xs, sm, md, lg, xl, 2xl, 3xl
- flow-spacing (layout): xs, sm, md, lg, xl, 2xl, 3xl
- padding (layout): xs, sm, md, lg, xl, 2xl, 3xl, none
- margin (layout): xs, sm, md, lg, xl, 2xl, 3xl, none, centered, flush-block
- push (layout): push
- alignment-container (layout): align-start, align-center, align-end, align-stretch, align-baseline, justify-start, justify-center, justify-end, justify-between, justify-around, content-align-start, content-align-center, content-align-end, content-align-stretch, content-align-between, content-align-around
- divider (layout): divided, undivided
- wrapping (layout): wrap-allowed, wrap-prevent, wrap-reverse
- overflow (layout): scroll-y, scroll-x, scroll-auto, clip, hidden, overflow-visible
- constraints (layout): min-width-<size>, max-width-<size>, min-height-<size>, max-height-<size>, min-width-popover-<step>, max-width-popover-<step>, max-width-command, min-width-control-<step>, min-height-control-<step>, min-height-editor, max-height-results-<step>, max-width-none
- fill (layout): fill, fill-inline, fill-block, hug-inline, width-auto, height-none, dialog-measure, width-popover-<step>, control-box-<step>, control-inline-<step>, control-block-<step>, separator-mark-<step>, control-size-<spacing>
- aspect (layout): square
- positioned-relation (layout): cover, center-x, center-y, attach-below, attach-above, attach-below-xs, attach-above-xs, attach-below-sm, attach-above-sm, attach-below-md, attach-above-md, attach-below-lg, attach-above-lg, attach-below-xl, attach-above-xl, attach-below-2xl, attach-above-2xl, attach-below-3xl, attach-above-3xl, attach-left, attach-right, stretch-inline, inset-top-xs, inset-top-sm, inset-top-md, inset-top-lg, inset-top-xl, inset-top-2xl, inset-top-3xl, inset-right-xs, inset-right-sm, inset-right-md, inset-right-lg, inset-right-xl, inset-right-2xl, inset-right-3xl, inset-bottom-xs, inset-bottom-sm, inset-bottom-md, inset-bottom-lg, inset-bottom-xl, inset-bottom-2xl, inset-bottom-3xl, inset-left-xs, inset-left-sm, inset-left-md, inset-left-lg, inset-left-xl, inset-left-2xl, inset-left-3xl
- viewport-fill (layout): fill-viewport
- z-scale (layering): base, content, raised, dropdown, sticky, tooltip
- top-layer-mechanism (layering): overlay, modal, popover, toast
- position-mode (layering): position-static, position-relative, position-absolute, position-fixed, position-sticky
- stacking-context (layering): isolate
- tween (motion): tween-quick, tween-settled, tween-ground-quick, tween-ground-settled, tween-ink-quick, tween-ink-settled, tween-rule-quick, tween-rule-settled, tween-ground-ink-quick, tween-ground-ink-settled, tween-opacity-ground-quick, tween-opacity-ground-settled, tween-opacity-ground-ink-quick, tween-opacity-ground-ink-settled, tween-opacity-transform-quick, tween-opacity-transform-settled
- motion-micro (motion): decelerate, accelerate, standard, emphasized, symmetric, asymmetric
- motion-macro (motion): together, sequence, cascade
- effect (motion): shake
- state.focus (state): hover, focus, focus-visible, active
- state.selection (state): selectable, selected, pressed, checked-mixed, current
- state.availability (state): disabled, read-only, busy
- state.disclosure (state): expanded, open
- state.validity (state): invalid, user-invalid, required, out-of-range
- state.sort (state): sorted
- state.drag (state): dragging
- state.continuous-input (state): scroll-progress, drag-progress
- state.relational (state): active-descendant
- skin-ground (skin): ground, ground-subtle, ground-defined, ground-hover, ground-active, ground-selected, ground-accent, ground-accent-soft, ground-accent-faint, ground-pass, ground-pass-faint, ground-warn, ground-warn-faint, ground-fail, ground-fail-faint, ground-note, ground-note-faint, scrim
- skin-ink (skin): ink, ink-soft, ink-muted, ink-faint, ink-inverse, ink-selected, ink-accent, ink-accent-soft, ink-accent-faint, ink-pass, ink-pass-faint, ink-warn, ink-warn-faint, ink-fail, ink-fail-faint, ink-note, ink-note-faint
- skin-rule (skin): rule, rule-soft, rule-accent, rule-accent-soft, rule-accent-faint, rule-pass, rule-pass-faint, rule-warn, rule-warn-faint, rule-fail, rule-fail-faint, rule-note, rule-note-faint, rule-top, rule-top-soft, rule-top-accent, rule-top-accent-soft, rule-top-accent-faint, rule-top-pass, rule-top-pass-faint, rule-top-warn, rule-top-warn-faint, rule-top-fail, rule-top-fail-faint, rule-top-note, rule-top-note-faint, rule-top-transparent, rule-right, rule-right-soft, rule-right-accent, rule-right-accent-soft, rule-right-accent-faint, rule-right-pass, rule-right-pass-faint, rule-right-warn, rule-right-warn-faint, rule-right-fail, rule-right-fail-faint, rule-right-note, rule-right-note-faint, rule-right-transparent, rule-bottom, rule-bottom-soft, rule-bottom-accent, rule-bottom-accent-soft, rule-bottom-accent-faint, rule-bottom-pass, rule-bottom-pass-faint, rule-bottom-warn, rule-bottom-warn-faint, rule-bottom-fail, rule-bottom-fail-faint, rule-bottom-note, rule-bottom-note-faint, rule-bottom-transparent, rule-left, rule-left-soft, rule-left-accent, rule-left-accent-soft, rule-left-accent-faint, rule-left-pass, rule-left-pass-faint, rule-left-warn, rule-left-warn-faint, rule-left-fail, rule-left-fail-faint, rule-left-note, rule-left-note-faint, rule-left-transparent
- corner (skin): corner-sm, corner-md, corner-lg, corner-xl, corner-2xl, corner-3xl, corner-top-sm, corner-bottom-sm, corner-top-md, corner-bottom-md, corner-top-lg, corner-bottom-lg, corner-top-xl, corner-bottom-xl, corner-top-2xl, corner-bottom-2xl, corner-top-3xl, corner-bottom-3xl, corner-top-none, corner-bottom-none
- rule-presence (skin): ruled, ruled-top, ruled-bottom, ruled-left, ruled-right
- font-size (skin): font-xs, font-sm, font-md, font-lg, font-xl, font-2xl, font-3xl
- font-weight (skin): font-medium, font-semibold, font-bold
- font-family (skin): font-mono
- text-align (skin): text-start, text-center
- text-decoration (skin): undecorated, underlined, struck
- elevation (skin): elevated-soft, elevated, recessed-fail
- affordance (skin): pressable, blocked
- concealment (skin): concealed, revealed, alpha-5, alpha-10, alpha-15, alpha-20, alpha-25, alpha-30, alpha-35, alpha-40, alpha-45, alpha-50, alpha-55, alpha-60, alpha-65, alpha-70, alpha-75, alpha-80, alpha-85, alpha-90, alpha-95
- numeric (skin): tabular
- type-label (skin): overline
- scrollbar (skin): scrollbar-subtle
- focus-ring (skin): ring
- truncation (skin): truncate, clamp-N, text-nowrap, text-pre-wrap, text-wrap
- selection-treatment (skin): selection-subtle, selection-strong

Scope prefixes: `viewport-<bp>:`, `viewport-<orientation>:`, `container-<bp>:`, `prefers-<x>:`, `hover:`, `focus:`, `active:`, `disabled:`, `selected:`, `checked:`, `pressed:`, `expanded:`, `current:`, `parent-hover:`, `parent-selected:`

## Existing Combines

_None defined yet — this is the first admission pass._
