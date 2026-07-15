# Monky Residue — Three-Way Classification

Historical pass over the 305 project-owned residue declarations from the earlier
`RESIDUE-DETAIL.md` snapshot, read through a lens the retroactive assimilation pipeline
structurally lacked. Non-destructive: it changed no Monky output. It re-labeled those
declarations to separate *genuine identity* from *latent grammar Ermine had not named yet*.

## Provenance

| source | commit |
|---|---|
| Ermine | `c29d615f9a06b786fb956cf2d4ebdae91a933740` |
| monky | `d58cac0d2de1cda798dc5c6d42aa6766a90f6b54` |

Source: `RESIDUE-DETAIL.md` (generated from `current-ledger.json`). Same 305 declarations,
reclassified.

> **Superseded in part by the Phase 0 registry triage (`ABSORPTION-PLAN.md`).** The
> "missing (215)" figure below was computed *before* checking candidates against
> `src/registry.ts`, and it **overcounts the grammar gap.** Much of it is not missing:
> ~35 rows already have an Ermine word (`padding`/`margin`/`gap`, `z-scale`/`top-layer`,
> `position-fixed`, `truncate`, `pressable`, `elevated`) and only need migrating; 96 rows
> are Monky-local molecules; 17 are blocked on the already-filed animation-plane duration
> naming. After `square`, only **~56 rows genuinely need a new shared-grammar ruling.**
> Read the category shapes below for the analysis, but take the corrected counts from
> `ABSORPTION-PLAN.md`.

> **Superseded as live accounting by the regenerated current ledger.** Later `clamp-3`,
> `fill`, `square`, `cover`, `push`, and `hug-inline` migrations moved the live ledger to 516
> current declarations and 290 project-owned residue declarations. Read `CURRENT-LEDGER.md` and `RESIDUE-DETAIL.md`
> for live counts, and `RESIDUE-INVARIANCE.md` / `docs/non-ermine.txt` for the corrected
> two-metric analysis of the remaining residue.

## Why this lens exists

The assimilation pipeline matches each declaration against the words Ermine *already has*.
It has exactly two output slots — "assimilable into an existing word" and "everything
else," labelled identity. It has **no slot for a general intent Ermine has not named yet**:
such a declaration cannot be assimilated into a word that does not exist, so it falls
through to "identity" by default. That default is why the reports read as if a modest
project were overwhelmingly bespoke. This pass adds the missing slot.

## The three categories

1. **Genuine identity (constraint).** The intent itself is project-bound, or the value *is*
   the meaning: brand fonts, bespoke keyframe scenes, raw dimensions with no scale behind
   them, true resets. This is Ermine's real floor — not a gap.
2. **General-intent / specific-value (extent).** A ruled Ermine word already covers the
   intent; the row survived as residue only for a selector/pseudo/recipe bookkeeping
   reason. The word *and* the value are already correct. Evidence the grammar reaches here.
3. **Unnamed-but-universal idiom (missing).** The intent is general but no ruled word covers
   it. This is the growth roadmap. It splits by shape:
   - **3a — atoms → shared grammar.** Smallest general intents; recur across sites; rule
     into the shared vocabulary.
   - **3b — molecules → project-scoped semantic words.** Cohesive bundles that travel
     together (the R-SKIN-10 recipe pattern applied to grammar). Mostly single-site in
     Monky, so they do not yet *earn* shared-grammar promotion — but per ruling they are
     **named as semantic words now, in Monky's own layer**, because the conversion from raw
     declarations to a semantic word is worth it on its own. Promote to shared grammar when
     a second project shows the same molecule.

## Headline

| category | declarations | share |
|---|---:|---:|
| Genuine identity (constraint) | 69 | 23% |
| General-intent / specific-value (extent) | 21 | 7% |
| **Unnamed idiom (missing)** — 3a atoms | 119 | 39% |
| **Unnamed idiom (missing)** — 3b molecules | 96 | 31% |
| **total** | **305** | |

**77% of "project-owned residue" is not project identity.** It is either already-correct
grammar (7%) or universal idiom Ermine has not yet named (70%). Genuine identity is under a
quarter, concentrated exactly where a project *should* assert itself: brand, bespoke
scenes, raw dimensions, resets.

## Every report bucket fractures

None of the 14 residue buckets is monolithic. Each shatters across the three categories:

| report bucket | total | identity | extent | missing |
|---|---:|---:|---:|---:|
| recipe-identity | 37 | 7 | 7 | 23 |
| brand-identity | 11 | 4 | 2 | 5 |
| component-contract | 64 | 17 | 2 | 45 |
| state-mechanics | 5 | 1 | 0 | 4 |
| aria-current | 1 | 0 | 1 | 0 |
| parent-relational | 8 | 0 | 2 | 6 |
| pseudo-mechanics | 23 | 0 | 0 | 23 |
| scrollbar-followup | 9 | 0 | 1 | 8 |
| motion-followup | 23 | 11 | 0 | 12 |
| opacity-followup | 4 | 0 | 0 | 4 |
| elevation-followup | 3 | 0 | 0 | 3 |
| reset-absence | 13 | 6 | 6 | 1 |
| user-content | 43 | 0 | 0 | 43 |
| identity-geometry | 61 | 23 | 0 | 38 |
| **total** | **305** | **69** | **21** | **215** |

## File legend

Paths are relative to `src/`. Abbreviations used in the tables below:

| abbr | file |
|---|---|
| modal | `content/overlays/modal/modalStyles.css` |
| suggestions | `content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css` |
| deleteConfirm | `content/overlays/deleteConfirm/deleteConfirmStyles.css` |
| macroEditor | `content/overlays/views/macroEditor/editorViewStyles.css` |
| search | `content/overlays/views/search/searchViewStyles.css` |
| settings | `content/overlays/views/settings/settingsViewStyles.css` |
| content-editor | `styles/components/content-editor.css` |
| controls | `styles/skin/controls.css` |
| metrics | `styles/theme/metrics.css` |
| pages | `styles/entries/pages.css` |
| options | `options/options.css` |
| popup | `popup/popup.css` |

---

# Category 3 — the roadmap (215)

## 3a — atoms → shared grammar (119)

High-recurrence, transferable. Rule into the shared vocabulary. Ranked by declaration
count.

### Spatial word-set (78) — the largest gap

Ermine began as a semantic *layout* framework but never atomized its spatial primitives
into words. Most of these already reference `var(--spacing-*)` / `var(--radius-*)` — the
values are correct, only the words are absent. Cheapest, highest-recurrence, most on-mission
gap to close.

**`pad` (13)** — padding from the spacing scale.

| loc | selector |
|---|---|
| modal:54 | `.modal-nav-tab` |
| search:36 | `.macro-search-item-command` |
| search:40 | `.macro-search-item-text` |
| search:61 | `.macro-search-item-confirm` |
| settings:13 | `.settings-body` |
| settings:23 | `.settings-section-label` |
| settings:39 | `.settings-import-status` |
| content-editor:29 | `.ce-toolbar-icon` |
| content-editor:36 | `.ce-style-trigger` |
| content-editor:71 | `.ce-link-input` |
| popup:36 | `.popup-item-detail` |
| popup:54 | `.popup-results` |
| pages:11 | `.page-container` |

**`gap` (8)** — margin-as-gap / flex gap from the spacing scale.

| loc | selector |
|---|---|
| modal:40 | `.modal-nav-branding` |
| search:104 | `.macro-search-shortcut` |
| settings:29 | `.settings-divider` |
| popup:35 | `.popup-item-detail` |
| popup:46 | `.popup-toggle-label` |
| content-editor:13 | `.ce-toolbar-sep` |
| content-editor:37 | `.ce-style-trigger` |
| content-editor:48 | `.ce-style-dropdown` |

**`fill` (10)** — occupy container: `width/height: 100%`, `flex: 1`, `min-height: 100vh`.

| loc | selector |
|---|---|
| controls:4 | `.input` |
| macroEditor:7 | `.macro-editor-view` |
| macroEditor:32 | `.editor-content .content-editor-body` |
| search:9 | `.macro-search-view` |
| search:14 | `.macro-search-input` |
| settings:9 | `.settings-view` |
| popup:21 | `.popup-search-input` |
| popup:28 | `.popup-item-toggle` |
| content-editor:52 | `.ce-style-option` |
| pages:14 | `.page-container` |

**`center` (5)** — `translate(-50%)` centering, `margin: 0 auto`.

| loc | selector |
|---|---|
| macroEditor:38 | `.editor-toast` (left) |
| macroEditor:40 | `.editor-toast` (transform) |
| search:66 | `.macro-search-item-edit` (top) |
| search:67 | `.macro-search-item-edit` (transform) |
| pages:13 | `.page-container` |

**`anchor` (6)** — attach to a container edge / to the element above.

| loc | selector |
|---|---|
| macroEditor:52 | `.command-suggestions` (left) |
| macroEditor:53 | `.command-suggestions` (right) |
| macroEditor:54 | `.command-suggestions` (top) |
| search:65 | `.macro-search-item-edit` (right) |
| content-editor:44 | `.ce-style-dropdown` (top) |
| content-editor:45 | `.ce-style-dropdown` (left) |

**`layer` (5)** — z-index scale (modal / overlay / dropdown tiers).

| loc | selector |
|---|---|
| settings:70 | `.seg-option` |
| modal:21 | `.modal-backdrop` |
| suggestions:6 | `:host, #macro-suggestions` |
| macroEditor:57 | `.command-suggestions` |
| content-editor:46 | `.ce-style-dropdown` |

**`measure` (4)** — readable / clamped width.

| loc | selector |
|---|---|
| modal:30 | `.modal-dialog` (width) |
| modal:31 | `.modal-dialog` (height) |
| suggestions:47 | `.macro-suggestions-command-item` |
| pages:12 | `.page-container` |

**`cover` (3)** — full-viewport backdrop / scrim.

| loc | selector |
|---|---|
| modal:19 | `.modal-backdrop` (inset) |
| modal:20 | `.modal-backdrop` (background) |
| suggestions:5 | `:host, #macro-suggestions` (position:fixed) |

**`join-corner` (5)** — square the corner that meets an adjacent surface.

| loc | selector |
|---|---|
| macroEditor:46 | `.input-dropdown-open` |
| macroEditor:47 | `.input-dropdown-open` |
| macroEditor:20 | `.editor-command-error` |
| macroEditor:21 | `.editor-command-error` |
| macroEditor:56 | `.command-suggestions` |

**`aspect` (1)** — `options:5` `.prefix-cell` (aspect-ratio:1). &nbsp; **`fit` (1)** —
`options:14` `.mode-row, .mode-choice` (width:fit-content; later migrated as `hug-inline`). &nbsp; **`push` (1)** —
`macroEditor:71` `.command-suggestion-action` (margin-left:auto; later migrated).

### Animation (17)

**`tween` (17)** — a transition on state-change. The R-MOTION reframe (`motion → animation`,
`tween`/`choreography`) already scopes this in `plane-model.md`.

| loc | selector |
|---|---|
| settings:71 | `.seg-option` |
| controls:5 | `.input` |
| controls:35 | `.btn` |
| controls:73 | `.panel-button` |
| controls:101 | `.selectable-group > *` |
| suggestions:23 | `.macro-suggestions-container` |
| suggestions:49 | `.macro-suggestions-command-item` |
| macroEditor:11 | `.editor-popout` |
| macroEditor:61 | `.command-suggestion-item` |
| macroEditor:75 | `.command-suggestion-action` |
| search:15 | `.macro-search-input` |
| search:32 | `.macro-search-item-command, .macro-search-item-text` |
| search:68 | `.macro-search-item-edit` |
| popup:12 | `.popup-button, .popup-icon-button` |
| popup:23 | `.popup-search-input` |
| content-editor:20 | `.ce-toolbar-btn` |
| content-editor:53 | `.ce-style-option` |

### Treatment & affordance atoms (24)

**`prominence` (6)** — opacity as de-emphasis (needs a ruled scale like duration/stagger).

| loc | selector |
|---|---|
| controls:117 | `.selectable-group > .is-selected:hover` |
| controls:122 | `.min-selected-1 > .is-selected:only-of-type` |
| controls:126 | `.min-selected-1 > .is-selected:only-of-type:hover` |
| search:78 | `.macro-search-item-text mark span` |
| content-editor:40 | `.ce-style-caret` |
| popup:17 | `.popup-button:hover, .popup-icon-button:hover` |

**`disabled` (3)** — `controls:59/60/65` `.btn:disabled` (cursor:not-allowed + opacity).
**`pressable` (3)** — `controls:18` `.radio-label`, `controls:100` `.selectable-group > *`
(cursor:pointer), `controls:106` `:active` (transform:scale press-feedback). Affordance
plane. **`unselectable` (2)** — `controls:19` / `controls:102` (user-select:none).
**`link` (4)** — `controls:43/47/51/55` `.btn-link*` (text-decoration none/underline).
**`active` (5)** — `content-editor:24/25/57/58/66` `.is-active` treatment; general
`active`/`selected` skin, blocked on a *backed condition* for the JS-set class.
**`reveal` (3)** — `search:44/45/46` `[aria-selected] .text` (un-truncate on select).
**`nowrap` (3)** — `settings:69`, `macroEditor:41`, `macroEditor:65`. **`clamp-lines` (3)**
— `suggestions:53/54/55`. **`overline` (2)** — `settings:21/22` (uppercase + letter-spacing).
**`tabular` (1)** — `search:82`. **`emphasis` (1)** — `search:88` (italic). **`prewrap` (1)**
— `popup:40` (white-space:pre-wrap). **`elevation` (3)** — `modal:28`, `suggestions:20`,
`macroEditor:42` (bespoke shadows; `elevated` exists but wants *tiers* to absorb these
without changing the look).

## 3b — molecules → project-scoped semantic words, now (96)

Cohesive bundles. Per ruling, each is named as a semantic word in Monky's own layer now —
the conversion from raw declarations to one semantic word is worth it independent of shared-
grammar promotion. Recurrence noted; promote to shared grammar on a second project.

**`prose` (43, 1 site)** — rich-text defaults for user-authored HTML.
`content-editor:91–192` (all of `.content-editor-body` element rules: p, h1–h3, strong/em/u/s,
code, pre, blockquote, ul/ol/li, a). One word for the whole block; the internals are its
licensed contents.

**`keycap` (14, 2 sites)** — raised key-cap styling.

| loc | selector |
|---|---|
| search:117–124 | `.macro-search-kbd::after` (content, position, background, inset, border, radius, pointer-events, z-index) |
| search:109 | `.macro-search-kbd` (line-height) |
| search:110 | `.macro-search-kbd` (padding) |
| search:111 | `.macro-search-kbd` (min-width) |
| search:113 | `.macro-search-kbd` (z-index) |
| search:112 | `.macro-search-kbd` (border-radius) |
| suggestions:64 | `.macro-suggestions-kbd` (padding) |

**`selection-indicator` (13, 1 site)** — the sliding highlight behind the selected segment.

| loc | selector |
|---|---|
| settings:49–64 | `.seg-control::before` and `.seg-control.is-sliding/.seg-snap::before` (12 rows) |
| settings:92 | `.seg-control.is-sliding .seg-option[aria-checked="true"]` (hide underlying bg) |

**`caret` (11, 1 site)** — CSS-triangle pointer.

| loc | selector |
|---|---|
| suggestions:27/28 | `.macro-suggestions-arrow` (width/height 0) |
| suggestions:29 | `.macro-suggestions-arrow` (border 6px transparent) |
| suggestions:33–36 | `.macro-suggestions-arrow.top` (placement + border-top-color) |
| suggestions:40–43 | `.macro-suggestions-arrow.bottom` (placement + border-bottom-color) |

**`scrollbar` (8, 1 site)** — engine-drawn scrollbar identity (values already tokens).
`controls:77–93` (`::-webkit-scrollbar`, `-track`, `-thumb`, `-thumb:hover`).

**`divider` (4, 2 sites)** — hairline separator.

| loc | selector |
|---|---|
| content-editor:10/11/12 | `.ce-toolbar-sep` (width, height, background) |
| settings:28 | `.settings-divider` (height:0) |

**`placeholder` (3, 1 site)** — empty-state prompt text.
`content-editor:84/85/86` `.content-editor-body:empty::before` (content attr, color,
pointer-events). Universally recognized idiom; strong promote-candidate despite one site.

---

# Category 1 — genuine identity (69)

Ermine's real floor. Not gaps.

**Brand (4)** — `suggestions:3`, `content-editor:79`, `pages:21`, `pages:25` (font-family
choices, incl. `IBM Plex Condensed Light`).

**Scene (11)** — bespoke keyframe animations; `plane-model.md` defines `scene` as the
deliberate outside-the-grammar exception. `controls:132/133` `.shake`, `controls:137`
`.flash`; `metrics:72–75` shake, `metrics:79–80` pulse, `metrics:84–85` flash keyframes.

**Raw dimension (40)** — exact px/rem with no scale behind them: `deleteConfirm:2` (240),
`controls:13/14/23/24` (radio/checkbox 16), `modal:36` (48), `modal:66` (18),
`macroEditor:15` (280), `macroEditor:39` (52), `suggestions:21/22` (200/360),
`suggestions:48` (3px 6px), `settings:33/34` (2rem), `options:6/7` (3rem), `popup:6` (320),
`search:20` (400), `search:21` (grid 140), `settings:17` (grid 1fr 3fr), `popup:53` (256),
`content-editor:17/18` (28), `content-editor:35` (36), `content-editor:47` (140),
`content-editor:62` (24), `content-editor:70` (28), `content-editor:76` (150),
`controls:29` (150), plus grid/flex mechanics (`search:22/27`, `options:8`, `suggestions:59`,
`macroEditor:28/33`, `modal:29` mix-blend, `settings:77` vertical-align).

**Reset (14)** — absence, no positive intent: `settings:82/86`, `macroEditor:55`,
`search:72/73/74/128`, `settings:35`, `popup:41/55`, `content-editor:19/34/80`,
`deleteConfirm:8`.

(Counts above: brand 4 + scene 11 + raw-dimension/mechanism 40 + reset 14 = 69.)

---

# Category 2 — extent, already correct (21)

A ruled Ermine word already covers these; residue only for a bookkeeping reason.

| word | declarations |
|---|---|
| `selected` | controls:110/111/112/116, search:56 |
| `status` / `focus` | controls:9 (error+focus ring), controls:39 (success hover) |
| `tone` | controls:26, search:51 |
| `current:` | modal:62, modal:55 (resting underline) |
| `type` scale | modal:70, suggestions:4 |
| `elevated`/R-SKIN-15 | metrics:65 (scrollbar-color, ruled standard property) |
| substrate reset | suggestions:10, popup:22 (border-box); suggestions:16 (font-family:inherit); popup:11/29/30/56 (control/list resets) |

---

# Sequencing

1. **Spatial word-set (3a, ~78).** Biggest, safest, most on-mission — values are already
   scale tokens, only words are missing. `pad`, `gap`, `fill`, `center`, `anchor`, `layer`,
   `measure`, `cover`, `join-corner`, `aspect`, `fit`, `push` (some now migrated; see
   `CURRENT-LEDGER.md`).
2. **Animation `tween` (3a, 17).** Already scoped by the R-MOTION reframe in `plane-model.md`.
3. **Treatment atoms (3a, 24).** `prominence` (needs a ruled scale), `disabled`, `pressable`,
   `unselectable`, `link`, `active` (needs a backed condition), `nowrap`, `clamp-lines`,
   `reveal`, `overline`, `tabular`, `emphasis`, `prewrap`, `elevation` tiers.
4. **Molecules (3b, 96) — name now, project-scoped.** `prose`, `keycap`,
   `selection-indicator`, `caret`, `scrollbar`, `divider`, `placeholder`. Promote each to
   shared grammar when a second project shows the same molecule.

Category 1 (69) stays local by design. Category 2 (21) is already done. None of this changes
Monky's rendered output — it renames residue into words, which is the point.
