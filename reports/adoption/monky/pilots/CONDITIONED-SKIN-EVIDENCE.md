# Monky evidence — conditioned skin (hover / focus / selected)

Recurrence evidence gathered after ratifying R-STATE-10 (the `hover:` platform-condition
prefix). It inventories every state-conditioned skin rule in Monky, classifies each for
migratability, and sets the rollout order. The purpose is to migrate only what is
provably render-equivalent and to hold the rest behind the ruling or the check it needs.

## Inventory

46 state-conditioned rules carry skin declarations (background / color / border-color /
box-shadow / opacity / outline).

| Trigger | Rules | Dominant properties |
| --- | ---: | --- |
| `:hover` | 28 | background-color, color, border-color |
| `:focus` / `:focus-visible` | 10 | box-shadow (ring), border-color, outline |
| `[aria-selected]` / `.selected` | 4 | background, color, border-color |
| `[aria-checked]` / `:checked` | 2 | background, color |
| `[data-state]`, `.active` | 2 | background, color |

## Three patterns, three dispositions

**Hover (28) — grammar via `hover:`, values already carrier words.** Every hover tone
resolves to a socket the carriers already own, so only the *condition* is new:

| Local hover | Ermine |
| --- | --- |
| `background:--tone-dim; color:--ink` | `hover:ground-subtle hover:ink` |
| `background:--tone; color:--accent` | `hover:ground-defined hover:ink-accent` |
| `background:--tone; color:--ink` | `hover:ground-defined hover:ink` |
| `background:--status-error-wash; color:--status-error` | `hover:ground-fail-faint hover:ink-fail` |
| `background:--base-tone` | `hover:ground` |

**Focus (10) — one near-canonical decoration, deferred.** Seven of ten are byte-identical
(`border-color:--accent; box-shadow:0 0 0 2px var(--tone)`); the error variant swaps
accent→fail. This is a role-parameterized `focus-ring` treatment, but it is `box-shadow`-based
— **blocked behind ruling shadow/elevation**. It becomes evidence #1 for that ruling, not a
word yet.

**Selected + checked (6) — wire through `selection-treatment`, no new ruling.** `[aria-selected]`
→ `ground-defined ink-accent rule-accent`; `[aria-checked]` → `ground=accent ink-inverse`. These
are what the existing `selectable` capability + selection sink were built for; they need wiring,
not vocabulary.

## The cascade-order refinement (what makes a hover render-safe)

A `hover:` migration moves the hover rule into the atomic stylesheet
(`ermine.generated.css`) while any `[aria-selected]`/`[aria-checked]`/`[data-state]` rule on the
**same element** stays in component CSS. Hover and those states share specificity (class +
pseudo/attribute), so when both are true the *source/file order* decides — and that order changes
across the file boundary. An element is render-safe to migrate blind **only if no same-element
state rule competes on the same properties**.

| Element-local hover | Guard? | Same-element state rule? | Disposition |
| --- | --- | --- | --- |
| `modal-nav-tab` | — | `[aria-current]` sets the **same** value | migrated (`3a12d5f`) |
| `macro-search-item-edit` | — | none (state rule is `opacity` only) | **safe** |
| `editor-popout` | — | none | **safe** |
| `ce-toolbar-btn`, `ce-style-option` | — | none | **safe** |
| `command-suggestion-action` (delete / cancel) | — | none | **safe** |
| `command-suggestion-action` (confirm) | — | none | defer — `color:--base-tone` has no exact socket (contrast inversion) |
| `macro-suggestions-command-item` | — | `[aria-selected]` competes on bg/border | **needs render check** |
| `command-suggestion-item` | `:not([data-state])` | data-state guard | **stays local** (rework discipline) |
| `seg-option` | `:not([aria-checked])` | aria-checked guard | **stays local** |
| `selectable-group > *` | — | `.is-selected` competes | **needs render check** |
| `btn-*` (controls.css) | — | none (shared control layer) | defer — not a view pass; `btn-success` uses `color-mix` |
| scrollbar-thumb `:hover` | — | — | out of scope (not socket-backed) |

## Rollout order

1. **Render-safe hovers, view by view** — `macro-search-item-edit` (search), `ce-toolbar-btn` /
   `ce-style-option` (content editor), `editor-popout` + `command-suggestion-action` delete/cancel
   (editor). Each is bridge-equivalent by construction; verify by recompile + manifest↔CSS check.
2. **Needs-render-check hovers** — `macro-suggestions-command-item`, `selectable-group`. Migrate
   only with a live hover-over-selected check, since file order now arbitrates.
3. **Guarded hovers stay local** — the `:not([data-state])` / `:not([aria-checked])` guards encode
   the exclusion that keeps `ground-fail-faint` and the checked pill authoritative.
4. **Selected/checked** — separate task: wire through `selection-treatment`.
5. **focus-ring** — evidence for a future shadow/elevation ruling; no migration until then.
