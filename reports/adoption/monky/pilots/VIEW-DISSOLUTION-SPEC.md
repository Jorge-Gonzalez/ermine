# Implementation spec — editor/settings view dissolution

Executable specification for the next assimilation pass. Written for an implementing agent:
follow it literally, verify at every checkpoint, and stop-and-report on any deviation
instead of improvising. No new vocabulary is introduced; every word used below already
emits.

## The point (do not miss it)

Two failure modes have bitten this transition before; both are checked by gates, but the
gates fire *after* you've made the mistake:

1. **R-IMPL-02 (the layer seam).** Adding a word without deleting its local counterpart in
   a later layer leaves the word silently defeated — the markup lies. Every conversion is
   **remove-and-replace in the same commit**: word into markup + declaration out of CSS.
2. **Fixture drift.** `tests/style-smoke-fixture.ts` carries verbatim copies of markup
   class strings. Every class-string change in a `.tsx` file must be mirrored in the
   fixture *if the same string appears there* (grep it every time; absence is fine).

Also: never delete a declaration as "redundant" without identifying **which earlier layer
already supplies it** (substrate/recipe) — name the supplier in the commit message.

## Preconditions

- Both worktrees clean (`git status` in ermine and monky).
- Baseline gates green: in monky `npm run test:styles && npm run lint:css && npm test`,
  in ermine `npm run adoption:current -- --project ../monky --name monky --check --gate`.

## Part A — deletions (duplication of an earlier layer; no markup changes)

File `src/content/overlays/views/macroEditor/editorViewStyles.css`:

| Delete | Supplier that already provides it |
|---|---|
| `.editor-title { margin: 0 }` — whole rule | substrate `* { margin: 0 }` (reset.css) |
| `border: none;` line inside `.editor-popout` | substrate button reset (`button … { border: none }`); element is a `<button>` |
| `border: none;` line inside `.command-suggestion-action` | same substrate button reset |
| `margin: 0;` line inside `.editor-toast` | substrate `* { margin: 0 }` |
| `.editor-sensitive { }` — empty husk + nothing else | n/a (empty) |
| `.editor-command .input { width: 100% }` — whole rule | the `.input` recipe already declares `width: 100%` (controls.css) |

File `src/content/overlays/views/settings/settingsViewStyles.css`:

| Delete | Supplier |
|---|---|
| `line-height: 1.5;` line inside `.seg-option` | substrate `:host * { line-height: 1.5 }` |

Checkpoint A: run monky `npm run test:styles` — must pass unchanged (all deletions are
computed no-ops). If it fails, a supplier assumption was wrong: **stop and report**.

## Part B — assimilations (word in, declaration out)

### B1. `.settings-rows` → `elastic basis-ratio`

- Markup: `src/content/overlays/views/settings/ui/SettingsView.tsx` has three
  `className="settings-rows min-width-none"` → change each to
  `className="settings-rows elastic basis-ratio min-width-none"`.
- CSS: delete the whole `.settings-rows { flex: 1; }` rule.
- Rationale to preserve in the commit: `flex: 1` ≡ `flex-grow: 1; flex-shrink: 1;
  flex-basis: 0%` ≡ `elastic` + `basis-ratio`, exactly.
- Fixture: grep `settings-rows` in the fixture; mirror if present.
- Manifest: `ermine.elements.json` entry `cycle5-settings-rows` (classString
  `"min-width-none"`) → `"elastic basis-ratio min-width-none"`.

### B2. `.seg-control` → `ruled hidden`

- Markup (SettingsView.tsx and the fixture, plus manifest entry `u6-segmented-control`):
  string `seg-control horizontal position-relative ground-subtle rule corner-md`
  → `seg-control horizontal position-relative ground-subtle rule ruled corner-md hidden`.
- CSS: delete `border-width: 1px;`, `border-style: solid;`, and `overflow: hidden;` from
  `.seg-control` (the rule then holds nothing — delete it; keep the pill comment block).
- Note: the smoke probes `seg-control` for `overflow` and `border-radius`; computed values
  must be identical (they are — `hidden` emits `overflow-x/y: hidden`, probe reads
  `overflow`). If the probe diff shows anything, **stop and report**.

### B3. `.seg-option` → `text-center pressable ruled-right`

- Markup (SettingsView.tsx, fixture, manifest entry `u6-segmented-option`): string
  `seg-option elastic basis-ratio padding-block-tight padding-inline-comfortable position-relative font-sm ink-soft rule selectable …`
  → insert `pressable text-center` after `seg-option` and `ruled-right` after `rule`.
- CSS: delete from `.seg-option`: `text-align: center;`, `cursor: pointer;`, and the
  three-line border dance `border-width: 0; border-style: solid; border-right-width: 1px;`
  (all three — `ruled-right` emits `border-right-width: var(--rule-weight, 1px)` +
  `border-right-style: solid`, and the other sides fall back to the initial `style: none`,
  so no zeroing is needed).
- **Do not touch**: `.seg-option:last-child { border-right: none }` (the trim) and the two
  `[aria-checked]` / `.is-sliding` rules — they are gate-approved narrowings that must keep
  beating the words from the components layer. That is the design, not a leftover.
- `white-space: nowrap`, `z-index: 1`, `transition` stay (identity / animation cycle).

Checkpoint B: monky `npm run ermine:css -- --ermine-root ../ermine --check` (words all
exist already — if it reports stale, a word was mistyped: **stop**), then
`npm run test:styles && npm run lint:css && npm test && npm run audit:styles`.

## Part C — record and gate

1. Commit monky (single commit; message must name each deletion's supplier and each
   assimilation's exact equivalence).
2. In ermine: `npm run adoption:current -- --project ../monky --name monky --write --gate`.
   Expected: gate closed, `assimilable 0`, `shadowedWords 0`, residue drops by ~12.
   If the gate reports shadowed words, Part B left a local declaration behind: fix in
   monky, re-commit, re-run. Never override the gate.
3. Commit ermine reports.

## Explicitly out of scope (do not do these "while you're at it")

- The 4 `transition` declarations (animation-plane cycle).
- `.settings-view .btn-outlined` (button cycle; needs `active:`/`disabled:` admissions).
- The watch items: `height: 100%` fills, `margin-left: auto` push, label treatment,
  `settings-body` 24px (GAP-U-density-2xl evidence). Add a one-line note per watch to
  `pilots/PATTERN-SCREEN.md`'s watch table instead.
- The toast shadow (identity tier by R-SKIN-09's boundary; unifying it to `elevated` is a
  design decision, not an assimilation).
