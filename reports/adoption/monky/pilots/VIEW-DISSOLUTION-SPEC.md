# Implementation spec — view and controls dissolution

Executable specification for the next assimilation passes, covering
`editorViewStyles.css`, `settingsViewStyles.css`, `searchViewStyles.css`, and
`controls.css`. Written for an implementing agent: follow it literally, verify at every
checkpoint, and stop-and-report on any deviation instead of improvising.

Parts A–D introduce no vocabulary — every word already emits. Part E performs two
scope admissions on the Ermine side (`active:`, `disabled:`) whose exact constitutional
text is given verbatim; Part F depends on Part E. Execute in order; each part is a
separate commit pair (monky, then ermine reports).

**Snapshot warning**: this spec describes file states at the time of writing. Before
editing any block, read the current file — if a listed declaration is already gone or
differs, skip it and note the skip in the commit message; if an *unlisted* declaration
appears in a listed rule, stop and report.

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

## Part D — searchViewStyles.css (deletions and parks only)

| Delete | Supplier |
|---|---|
| `box-sizing: border-box;` inside `.macro-search-input` | substrate `*, *::before, *::after { box-sizing: border-box }` |

Everything else in this file is verified boundary — do not touch: the fill
(`height: 100%`), grid templates/subgrid, the 400px cap, the asymmetric cell paddings,
the `[aria-selected]` release and guarded tinting rows (gate-approved narrowings), the
edit-icon pin, the `mark` highlight mechanics, the kbd signature block, `tabular-nums`,
the italic description, and the transitions. Watches to append one line each to
`pilots/PATTERN-SCREEN.md`: fills (`width/height: 100%`, now ~7 sites), `align-content`,
`margin-right` shortcut rhythm.

## Part E — Ermine-side admissions (prerequisite for Part F)

Two scope admissions, both following the `focus:` precedent exactly
(commit e368b15 is the model). These are ermine-repo commits; regenerate
spec/graph/typed/vscode/audits and run `npm run check` after each.

### E1. Admit `active:` (no rule change — R-STATE-10 already names it)

- `src/registry.ts` INTERACTION_SCOPES: add
  `{ id: "active", pattern: /^active$/, shape: "active:", role: "none", note: "conditioned skin during the press" }`.
- `src/css.ts` scopePseudo: add `active: ":active"`.
- Tests: mirror the focus: serialization test (`active:ground-accent` →
  `.active\:ground-accent:active`, not `@media`).
- Evidence to cite in the commit: `.btn:active` (accent flip), `.selectable-group > *:active`.

### E2. Admit `disabled:` (one-sentence amendment to R-STATE-10)

R-STATE-10's closed set is "hover, active, focus". `:disabled` is equally
platform-supplied (form state), so this is the R-OVERFLOW-01-`hidden` amendment shape:

- `constitution/ERMINE.md` R-STATE-10: change "— hover, active, focus —" to
  "— hover, active, focus, disabled —" and append to the rule text:
  "`disabled` is platform-backed form state; its prefix serializes to `:disabled`."
- `constitution/ERMINE-RATIONALE.md` RAT:R-STATE-10: append:
  "Amended (ADR-0021): `disabled` admitted — the platform supplies it exactly as it
  supplies hover, and the button evidence (`.btn:disabled` washes) is the recurrence."
- `constitution/decisions/ADR-0021-disabled-condition.md`: history entry in the ADR-0007
  format; introduces no new ruling; amends R-STATE-10.
- registry INTERACTION_SCOPES + scopePseudo (`disabled: ":disabled"`) + tests as E1.
- `npm run graph` before committing.

## Part F — controls.css dissolution (after Part E)

Procedure differs from A–D: recipes have many consumers, so work **per class, by
survey**: `grep -rn "<class> " src --include="*.tsx"` (and `buttonClassName=`), apply the
word column to *every* consumer, then delete the CSS line(s). Fixture: grep every changed
string. Manifest: add missing words to the matching entries (search by classString).

### F1. Word table

| Recipe declaration | Becomes (words on every consumer) | Notes |
|---|---|---|
| `.label { margin-bottom: xs }` | *nothing* — delete rule | rhythm is the parent column's `gap`; **also delete** the two inline `style={{ marginBottom: 0 }}` fights (MacroForm.tsx:133, Settings.tsx:17) |
| `.input` padding | `padding-block-snug padding-inline-comfortable` | |
| `.input` border pair | `ruled` | |
| `.input { outline: none }` | *delete* — `focus:ring` restyles the outline; a surviving `outline: none` in the skin layer would defeat it (R-IMPL-02) | |
| `.input:focus` border-color + ring | `focus:rule-accent focus:ring` | ring colour unifies to the `--ring` socket default — **recorded visual correction** |
| `.input-error:focus` border-color | `focus:rule-fail` on `input-error` consumers | the inset wash ring stays local (error signature) |
| `.radio { margin-right }` | *delete* — parent rows carry `gap-snug` | verify each consumer's parent |
| `.radio/.checkbox { cursor }` | `pressable` | |
| `.checkbox` border pair | `ruled` | |
| `.radio { accent-color }`, `.checkbox:checked { accent-color }` | *delete both* — add **one substrate rule** to reset.css: `input, select, textarea { accent-color: var(--accent); }` under a "native controls follow the theme accent" comment | platform-first |
| `.checkbox:focus` outline | `focus:ring` — **recorded correction** (accent → socket default) | |
| `.btn` padding/radius/font | `padding-block-snug padding-inline-relaxed corner-md font-md font-medium` | |
| `.btn { cursor }` | `pressable` | |
| `.btn { border: none; outline: none }` | *delete* — substrate button reset + focus:ring | |
| `.btn:focus` ring | `focus:ring` — recorded correction as above | |
| `.btn:active` | `active:ground-accent active:ink-inverse` | needs E1 |
| `.btn:disabled` ground/ink | `disabled:ground-subtle disabled:ink-soft` | needs E2; `cursor: not-allowed` + `opacity: .6` + the `:disabled:hover` guard stay local (disabled affordance identity) |
| `.btn-secondary` | `ground-subtle ink ruled rule hover:ground-defined` | |
| `.btn-outlined` | `ground ink ruled rule hover:ground-defined` | in settings-view consumers use `ground-subtle` instead of `ground` and **delete** the `.settings-view .btn-outlined:not(…)` context rule — variant-by-context becomes words at the call site |
| `.btn-success` | `ground-pass ink-inverse` | the color-mix darkened hover stays local (identity line) |
| `.btn-link`, `.btn-link-danger` | `ink-accent font-sm` / `ink-fail font-sm` | `background/border/padding/font-weight:400` lines delete (substrate or initial); `text-decoration` base+hover stays local — note the *link affordance* watch |
| `.button-group { display: inline-flex }` | `horizontal inline` | facet merge — verify emitted `.horizontal.inline` compound appears |
| `.panel-button { cursor }` | `pressable` | |
| `.panel-button { font-size: var(--text-base) }` | `font-md` — **recorded correction** 14→15px (the stranded-off-scale rule, section-description precedent) | |

Consumers stack variants (`btn btn-outlined btn-secondary` exists): resolve the stack to
**one** coherent word set per element, preferring the *last* variant's colours; note each
resolution in the commit.

### F2. Stays in controls.css, untouched

Global `::-webkit-scrollbar*` block (R-SKIN-15 identity), `.selectable-group` block
(JS-state `.is-selected` — converting it is a component-behaviour change, not a styling
pass; leave, with its `user-select: none` and `:active` transform), `.shake`/`.flash`
(animation cycle), `.editor-content { min-height: 150px }` (identity floor), all
`transition` lines.

### F3. Checkpoint

Full monky gates. Then the ermine gated reconcile — expect `shadowedWords 0` (the
outline deletions in F1 are exactly what R-IMPL-02 exists to verify), `assimilable 0`,
residue down by ~35–40, and `recipe-identity` sharply reduced. Then remove `.input`,
`.label`, `.checkbox`, `.radio`, `.btn` from `project.json`'s recipes list **only if**
their CSS blocks are fully gone except parked lines; re-run the gate after pruning.

## Explicitly out of scope (do not do these "while you're at it")

- All `transition` declarations (animation-plane cycle) and `.shake`/`.flash`.
- `.selectable-group` (component-behaviour change; parked above).
- The watch items: fills, `margin-left: auto` push, label treatment, link underline
  affordance, `settings-body` 24px (GAP-U-density-2xl evidence), `align-content`. Add a
  one-line note per watch to `pilots/PATTERN-SCREEN.md`'s watch table instead.
- The toast shadow (identity tier by R-SKIN-09's boundary; unifying it to `elevated` is a
  design decision, not an assimilation).
- Any new vocabulary beyond E1/E2 — in particular, do **not** invent a fill word; that
  admission needs its own ruling cycle.
