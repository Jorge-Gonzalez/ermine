# Ermine Admission Review: monky

> DRAFT — machine-validated, awaiting human ratification. Nothing below changes the
> grammar until the ADR and combine definitions are committed.

## Validation

- admissions: 3 of budget 3
- errors: none
- warnings (7):
  - `keycap`: back-translation recovered only 43% of the paragraph — opaque or project-bound name
  - `panel`: back-translation recovered only 43% of the paragraph — opaque or project-bound name
  - `page-frame`: back-translation recovered only 29% of the paragraph — opaque or project-bound name
  - family-core `ground rule corner-lg ruled elevated-soft` received no verdict
  - family-core `padding-block-xs padding-inline-sm tween-opacity-ground-quick ink-inverse corner-md pressable hover:alpha-90` received no verdict
  - family-core `horizontal padding-xs align-center justify-center corner-sm pressable` received no verdict
  - family-core `ground rule corner-md ruled` received no verdict

## Verdicts

- **admit `keycap`** — paragraph, 8x, 2 files, 2 directories
  paragraph: `ground-subtle ink rule corner-sm ruled font-xs font-mono`
  intent: A single keyboard-key legend: a small, subtly grounded, bordered mono chip.
  justification: 8x across 2 directories; every occurrence is a <kbd> with a key legend (Esc, Tab, ↵, arrows) — the role is invisible in the words and decisive in usage.
  usage: <kbd> "Tab" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  usage: <kbd> "↵" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  usage: <kbd> "Esc" in `macro-suggestions-footer horizontal justify-end gap-md paddi`
  back-translation: 3/7 words recovered (0.43)
    missed: `ground-subtle rule ruled font-xs`
    extra: `basis-content padding-xs ground-defined elevated-soft pressable text-center font-sm`
- **admit `page-frame`** — paragraph, 2x, 2 files, 2 directories
  paragraph: `vertical gap-lg padding-2xl centered flush-block max-width-2xl fill-viewport`
  intent: The top-level page shell: a centered, width-capped, viewport-filling vertical flow.
  justification: Only 2x, but those are both of the corpus's full pages (Editor and Options roots) — frequency matches opportunity, spread is 2 directories.
  usage: <div>
  back-translation: 2/7 words recovered (0.29)
    missed: `gap-lg padding-2xl centered flush-block max-width-2xl`
    extra: `height-none scroll-y ground max-width-3xl margin-centered padding-lg`
- **admit `panel`** — paragraph, 3x, 3 files, 2 directories
  paragraph: `vertical gap-md padding-lg ground-subtle rule corner-md ruled`
  intent: A grouped content surface: a subtly grounded, bordered, padded vertical section.
  justification: 3 files across 2 directories (editor + options), consistently a <div> section wrapper; 'panel' states the grouping role the seven words spell as a recipe.
  usage: <div>
  back-translation: 3/7 words recovered (0.43)
    missed: `gap-md ground-subtle rule corner-md`
    extra: `flow-spacing-md ground ground-defined corner-lg elevated-soft overflow-visible`
- role-bound-hold — paragraph, 5x
  paragraph: `grid-fit-sm elastic basis-ratio content-align-start scroll-auto max-height-results-md scrollbar-subtle`
  justification: Mechanically the strongest unit (1.0 closure, 90% closed pairs) but it contains role-bound max-height-results-md and lives in a single directory — general within the results role only.
  usage: <div>
  usage: <div> "{commands.map((cmd, index) => ("
  usage: <div> "{macros.map((macro, index) => ("
- hold-as-stem — paragraph, 4x
  paragraph: `boxed ink font-sm font-medium`
  justification: All four usages are form <label>s — a real field-label role — but confined to one directory; a next-pass candidate if it spreads.
  usage: <label> "{t('macroForm.triggerLabel')}" in `vertical gap-md`
  usage: <label> "{t('macroForm.textLabel')}" in `vertical gap-md`
  usage: <span> "{t('macroForm.sensitiveLabel')}" in `vertical gap-md`
- hold-as-stem — paragraph, 3x
  paragraph: `control-size-lg rule corner-sm ruled pressable focus:ring`
  justification: Widest spread in the corpus (3 files, 3 directories, all <input> controls) but only 3x, and 'outlined-control' adds the least surplus of the admit candidates — first in line for the next pass as repetition grows.
  usage: <input> in `editor-sensitive horizontal gap-sm align-center ink font-sm `
  usage: <input> in `vertical gap-md`
  usage: <input> in `horizontal inline rigid margin-left-sm align-center gap-xs p`
- hold-as-stem — paragraph, 2x
  paragraph: `hidden ink-soft font-sm truncate`
  justification: 2x; plausible role (truncating content-text preview) but naming it now would outrun the evidence.
  usage: <span> "{macro.text}" in `command-suggestions hidden position-absolute attach-below st`
  usage: <p> "{result.obj.text}" in `padding-sm rule-soft ruled-bottom`
- hold-as-stem — paragraph, 2x
  paragraph: `horizontal gap-xs padding-xs rule-soft ruled-bottom`
  justification: 2x; any name would state the appearance (soft bottom rule) rather than a role, and the paragraph reads fine spelled out.
  usage: <div> in `macro-suggestions-container delete-confirm min-width-popover`
  usage: <div> "{visibleMacros.map((macro, index) => (" in `macro-suggestions-container hidden min-width-popover-sm max-`
- hold-as-stem — paragraph, 2x
  paragraph: `span-all padding-lg ink-soft font-md text-center`
  justification: Both occurrences are the same empty-state message inside one results feature, and span-all couples it to that grid context.
  usage: <div> "{t('modalSearch.noMatchingCommands')}" in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
  usage: <div> "{searchQuery ? t('modalSearch.noMacrosFound') : t('modalSear" in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
- identity — paragraph, 2x
  paragraph: `subgrid span-all position-relative selectable`
  justification: The selectable row mechanism of the search-results lists specifically — component-owned structure, not vocabulary.
  usage: <div> in `macro-search-results grid-fit-sm elastic basis-ratio max-hei`
  usage: <div>

## Draft ADR

Ratify by committing as `constitution/decisions/ADR-00NN-admit-combines.md`:

```markdown
---
register: history
---

# ADR-00NN — Admit combines: keycap, panel, page-frame

source: adoption review pack for monky; verdicts validated by
`adoption/admission-intake.ts` (see the admission review alongside this ADR).

## `keycap`

intent: A single keyboard-key legend: a small, subtly grounded, bordered mono chip.

paragraph: `ground-subtle ink rule corner-sm ruled font-xs font-mono`

evidence: paragraph, 8x across 2 files, 2 directories; examples src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#8, src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#9, src/content/overlays/deleteConfirm/DeleteConfirmPopup.tsx#10

8x across 2 directories; every occurrence is a <kbd> with a key legend (Esc, Tab, ↵, arrows) — the role is invisible in the words and decisive in usage.

## `panel`

intent: A grouped content surface: a subtly grounded, bordered, padded vertical section.

paragraph: `vertical gap-md padding-lg ground-subtle rule corner-md ruled`

evidence: paragraph, 3x across 3 files, 2 directories; examples src/editor/ui/Settings.tsx#1, src/options/ui/PrefixEditor.tsx#1, src/options/ui/ReplacementMode.tsx#1

3 files across 2 directories (editor + options), consistently a <div> section wrapper; 'panel' states the grouping role the seven words spell as a recipe.

## `page-frame`

intent: The top-level page shell: a centered, width-capped, viewport-filling vertical flow.

paragraph: `vertical gap-lg padding-2xl centered flush-block max-width-2xl fill-viewport`

evidence: paragraph, 2x across 2 files, 2 directories; examples src/editor/ui/Editor.tsx#1, src/options/ui/Options.tsx#1

Only 2x, but those are both of the corpus's full pages (Editor and Options roots) — frequency matches opportunity, spread is 2 directories.

## Combine definitions

combine keycap: [
  ground-subtle ink rule corner-sm ruled font-xs font-mono
]

combine panel: [
  vertical gap-md padding-lg ground-subtle rule corner-md ruled
]

combine page-frame: [
  vertical gap-lg padding-2xl centered flush-block max-width-2xl fill-viewport
]

```

## How to ratify

1. Review the verdicts and warnings above; edit names or demote admissions freely.
2. Add the combine definitions to the project's combines source.
3. Commit the ADR under `constitution/decisions/` with the next number.
4. Record `grammar` / `identity-local` dispositions in the adoption ledger.
