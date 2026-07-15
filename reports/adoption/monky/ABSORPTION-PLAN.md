# Monky Residue — Absorption Plan

The step-by-step plan for converting Monky project-owned residue declarations into Ermine
words or Monky-local semantic classes — without changing Monky's rendered output. The first
version targeted the 305-declaration snapshot re-read in `RESIDUE-THREE-WAY.md`; the live
current ledger is now 278 project-owned declarations after the `fill`, `square`, `cover`, `push`,
`hug-inline`, `center-x`, `center-y`, `max-width-2xl`, `centered flush-block`, `grid-fit-sm`,
and `min-width-sm` migrations. Live counts come from
`CURRENT-LEDGER.md`; the corrected invariance overlay is `RESIDUE-INVARIANCE.md`.

## Provenance

| source | commit |
|---|---|
| Ermine | `c33cce42c033004aa8750c0a9c8d00c035d96699` |
| monky | `5ff992bd9ad27944d570149aadb9ca219478db73` |

Registry state read from `src/registry.ts` at the Ermine commit above.

## The three mechanisms (Ermine's rules constrain what "absorb" means)

Per `docs/ERMINE-WORK-ORDERS.md` §0: the constitution is the only place words are ruled
(R1); an executor may never coin vocabulary (R2). So every residue row resolves to exactly
one of:

1. **Migrate to an existing word.** A ruled Ermine word already covers the intent; Monky
   just authors raw CSS instead of the word. No ruling — rewrite the component CSS, verify
   byte-identical rendering, regenerate the ledger.
2. **Gap Report → ruling → registry/emit → migrate.** The intent is general but no ruled
   word covers it. File `reports/GAP-<id>-<slug>.md` in the §0.1 format (neutral, no
   recommendation); the human author rules it into `constitution/ERMINE.md`; encode in
   `src/registry.ts` + `src/emit.ts`; regenerate derived artifacts; then migrate Monky.
3. **Monky-local semantic class.** A cohesive molecule that is single-site in Monky and does
   not yet earn shared-grammar promotion. Named as a project-scoped semantic class now (per
   ruling: the conversion is worth it on its own); no constitution involvement.

---

# Phase 0 — Registry triage (DONE)

Every Category-3 candidate word from `RESIDUE-THREE-WAY.md` checked against `src/registry.ts`.
**This corrects a real overcount in that report:** a large share of the "215 missing" is not
a grammar gap. It is either already a word (migrate), a molecule bound for Monky's own layer,
or blocked on the already-filed animation-plane duration naming.

## Triage by action

### A — Already a word → migrate (no ruling)

| candidate | ~rows | existing Ermine word | note |
|---|---:|---|---|
| `pad` | 13 | `padding` axis (`padding-<density>`, `-inline`/`-block`) | **scale reconcile** — see caveat |
| `gap` | 8 | `margin` / `gap` / `flow` density axes | scale reconcile; `gap:2px` may be off-scale |
| `layer` | 5 | `z-scale` (base…tooltip) + `top-layer-mechanism` (`overlay`/`modal`) | big z-values are top-layer, not z rungs |
| `nowrap` | 3 | `truncate` (owns white-space + text-overflow) | exact where ellipsis is wanted |
| `pressable` (cursor) | 2 | `affordance: pressable` (owns `cursor`) | press-feedback transform is *not* covered |
| `cover` (position) | 1 | `position-fixed` | the `inset:0` half is missing (below) |
| `elevation` | 3 | `elevation: elevated` | migrate only if the shared shadow is acceptable; else identity |
| `measure` | 4 | `constraints` (`max-width-<size>`) | page `672px` migrated as `max-width-2xl`; remaining values need type/viewport rulings |

**~35 rows migrate with no ruling.** This is the bulk of Phase 1.

### B — Reserved pending evidence → Gap Report (anticipated)

| candidate | ~rows | reserved member | source |
|---|---:|---|---|
| `clamp-lines` | 3 | `truncate-N` on the truncation axis | `registry.ts` truncation notes |

Clean Gap Reports: the constitution already named the member and is waiting for evidence.
Monky is the evidence. (`recessed` elevation and `draggable`/`editable`/`expandable`
affordances are also reserved but have no Monky residue.)

### C — Genuinely missing → Gap Report (new word/axis)

| candidate | ~rows | why missing |
|---|---:|---|
| `fill` (width/height:100%, flex:1 basis-0) | 10 | no plain width/height word; `constraints` is min/max only, `width` is guarded |
| `anchor` (top/left/right/bottom offsets) | 6 | no inset axis; `inset` is in position-mode `mustNeverTouch` |
| `prominence` (mid-scale opacity) | 6 | `concealment` is endpoints only — mid-scale dimming *explicitly excluded* |
| `center-x` / `center-y` / flow-center | 5 | `center-x` and `center-y` are **done** (R-SIZE-06/ADR-0029/ADR-0030); flow centering is **done** as `centered flush-block` (R-SIZE-07/ADR-0031) |
| `join-corner` (per-corner squaring) | 5 | `corner` axis is whole-element radius, no per-corner member |
| `link` (text-decoration) | 4 | no text-decoration axis |
| `disabled` treatment (not-allowed cursor + dim) | 3 | `disabled` state exists; the *treatment* has no word |
| `cover` (inset:0) | 2 | no inset axis (as `anchor`) |
| `unselectable` (user-select:none) | 2 | no word; guarded on `affordance` |
| `overline` (uppercase + letter-spacing) | 2 | no text-transform/letter-spacing axis |
| `aspect` (aspect-ratio) | 1 | **done** — admitted as `square` (R-SIZE-02/ADR-0025) and migrated |
| `fit` (width:fit-content) | 1 | **done** — admitted as `hug-inline` (R-SIZE-05/ADR-0028) and migrated |
| `push` (margin auto) | 1 | **done** — admitted as `push` (R-SIZE-04/ADR-0027) and migrated |
| `tabular` (font-variant-numeric) | 1 | no axis |
| `press-feedback` (`:active` transform) | 1 | `pressable` owns cursor only |
| `emphasis` (italic) | 1 | no word (may be prose-internal) |

**~51 rows needed new shared-grammar rulings after `hug-inline`; `center-x`, `center-y`,
size `2xl`, `centered flush-block`, and `grid-fit-sm` have since consumed the
positioned-centering, page-measure, flow-centering, and search grid-fit slices.** The
`--size-sm` binding also unlocked and migrated the content-editor dropdown as `min-width-sm`.
Most remaining rows are small, single-site atoms. The
spatial cluster (`fill`/`anchor`/`cover-inset`/`push`/`hug-inline`/`center-x`/`center-y`/flow-center) is the one coherent
arc; it finishes the spatial plane Ermine started but never atomized.

### D — Blocked on the animation-plane ruling (already filed)

| candidate | ~rows | status |
|---|---:|---|
| `tween` (transitions) | 17 | `motion-micro` easing axis exists, but **duration step names are unruled** (`SKIN_PLANE` note; `GAP-U-animation-plane`) |

Not a fresh gap: the easing vocabulary exists; migrating a `transition: … var(--transition-fast)`
needs a ruled duration name, which is the deferred `R-SCALE-02`/animation-plane work.

### E — Monky-local molecules (project-scoped, no ruling)

| molecule | rows | note |
|---|---:|---|
| `prose` | 43 | rich-text bundle; one word |
| `keycap` | 14 | 2 sites |
| `selection-indicator` | 13 | sliding pill (`::before`) |
| `caret` | 11 | CSS triangle |
| `scrollbar` | 8 | engine-drawn `::-webkit-*`; the standard-property half migrates to `scrollbar-subtle`, the webkit mechanics stay Monky-local (R-SKIN-15 rules this identity) |
| `placeholder` | 3 | empty-state `::before` |
| `divider` | 4 | standalone separator element — note the `divided` axis is a *between-children* rule, a different pattern, so this stays local |

**96 rows → Monky's own layer.**

## Corrected headline (supersedes RESIDUE-THREE-WAY's 215-missing split)

| resolution | ~rows | mechanism |
|---|---:|---|
| Genuine identity (unchanged) | 69 | stays local |
| Extent — already a word, already migrated | 21 | — |
| **Migrate to existing word** | ~35 | no ruling (Phase 1) |
| **Monky-local molecule** | 96 | no ruling (Phase 5) |
| **Blocked on animation-plane duration naming** | 17 | filed follow-up (Phase 4) |
| **Reserved-member Gap Report** | 3 | anticipated ruling (Phase 2) |
| **New shared-grammar Gap Report** | ~51 | new rulings (Phase 3; `square`/`push`/`hug-inline`/`center-x`/`center-y`, size `2xl`, and `centered flush-block` consumed) |

The load-bearing correction: of the 215 my report called "missing," only a minority genuinely
need new shared grammar after the spatial migrations (reserved + new), and even those are mostly small single-site atoms.
**131 of the 215 need no shared-grammar ruling at all** — ~35 migrate to existing words, 96
become Monky-local. Monky can reach a near-complete semantic state via Phases 1 + 5 alone.

## Scale reconciliation — RESOLVED (density retired → T-shirt)

The mismatch between Monky's t-shirt spacing (`--spacing-xs…3xl`) and Ermine's named
**density** scale (`tight…separated`) is resolved by ruling (2026-07-14,
`DENSITY-WORDS-RETIRED.md`): **Ermine's spacing scales go T-shirt** (`xs…3xl`, anchor `md`),
retiring the density words to a resurrection record (future aliases). Consequences:
- Monky's `pad`/`gap` rows migrate **value-identically** — Monky already defines its density
  vars as aliases of its T-shirt vars (the U5 binding in `metrics.css`), so the migration just
  unwinds that indirection. Note `separated`→`3xl` (40px), not `2xl`.
- Phase 1 gains an **Ermine-side prerequisite** — the density→T-shirt change, fully specified
  in `WORKORDER-SPACING-TSHIRT.md` (constitution amendment + registry/emit diffs +
  regeneration/verification checklist; impact analysis done, blast radius shallow). Must land
  before the Monky spacing migration.

---

# Phase 1 — Migrate to existing words

**Goal:** author the Ermine word instead of raw CSS for the Group-A rows.
**Prerequisite (Ermine-side):** land the density→T-shirt spacing change
(`DENSITY-WORDS-RETIRED.md`) — a constitution-touching work order — before migrating any
Monky spacing row. After it lands, `pad`/`gap` migrate 1:1.
**Steps:** per file, replace raw declarations with the word — `z-index:10000`→`modal`,
`position:fixed`→`position-fixed`, `white-space:nowrap`(+ellipsis)→`truncate`,
`cursor:pointer`→`pressable`, padding/margin→density words (post-reconcile).
**Verify:** `npm run audit:styles` + style-smoke **byte-identical** parity; `npm run
adoption:current`; `styles:reconcile --check --gate`. Residue drops; `assimilable` stays 0.

**Result (executed 2026-07-14).** The spacing slice — `pad`/`gap`, the bulk of Group A — is
migrated (density→T-shirt work order + Monky rewrite; style-smoke byte-identical; reconcile
gate green). The T-shirt scale also unlocked one assimilation the density scale could not name
(`.page-container padding: var(--spacing-2xl)` → the word `padding-2xl`, 24px). **The rest of
Group A does not survive inspection and is reclassified — none is a clean byte-identical
migration:**
- `cursor:pointer` → `pressable`: **blocked by R-SKIN-10** — every case is recipe-owned
  (`.radio-label`, `.selectable-group > *`); the ruling explicitly lets a recipe own its cursor.
  Stays identity.
- `white-space:nowrap` → `truncate`: **not equivalent** — all three cases are *bare* nowrap
  (floating toast, command label, segment), no ellipsis; `truncate` emits ellipsis + nowrap, a
  behaviour change. No Ermine word exists for prevent-wrap-without-truncate → a genuine small
  gap (`nowrap`), not a migration.
- `position:fixed` → `position-fixed`: the only case is `:host { position: fixed !important }`
  on the injected overlay; the `!important` is load-bearing and the word emits without it. Stays local.
- `layer`/z-index, `elevated`/box-shadow, remaining `measure` values: off-scale or bespoke
  values → not byte-identical. Stay identity (or later Gap Reports). The page-container
  `672px` case was later admitted by adding size `2xl` and migrated as `max-width-2xl`.

So Phase 1 is **complete**: the automated `assimilable=0` and this manual pass agree that
nothing byte-identical remains. The reclassified rows move to identity or to Phase 3 gaps.

# Phase 2 — Reserved-member Gap Reports

**Goal:** unlock `truncate-N` with Monky as the evidence.
**Steps:** `reports/GAP-<id>-truncate-n.md` in §0.1 format → human ruling → `registry.ts`
+ `emit.ts` → `npm run spec/guide/ownership` → `npm run check` → migrate `clamp-lines` rows.

# Phase 3 — New shared-grammar Gap Reports

**Goal:** the Group-C gaps, sequenced by recurrence and coherence.
1. **Spatial arc** — sequenced by recurrence after inspecting the *current* residue.
   The offset residue triages mostly to **bespoke identity** (exact `bottom: 52px`,
   `calc(100% + 4px)`, dynamic `var(--pill-left)`, molecule placement), not gaps. The general
   primitives, by recurrence: **`fill`** (100% container sizing) — **done** (R-SIZE-01/ADR-0024,
   the first proportional-plane member; 7 Monky sites migrated, gate green); **`square`**
   (self-ratio, `aspect-ratio: 1`) — **done** (R-SIZE-02/ADR-0025, `.prefix-cell` migrated,
   gate green); **`cover`**
   (`inset: 0`) — **done** (R-SIZE-03/ADR-0026; Monky modal backdrop migrated, gate green);
   **`push`** (`margin-inline-start: auto`) — **done** (R-SIZE-04/ADR-0027; Monky command
   actions migrated, gate green); **`hug-inline`** (`inline-size: fit-content`) — **done**
   (R-SIZE-05/ADR-0028; Monky options row/choices migrated, gate green);
   **`center-x`** (`left: 50%` + `translateX(-50%)`) — **done** (R-SIZE-06/ADR-0029;
   suggestion arrows/editor toast migrated, gate green); **`center-y`** (`top: 50%` +
   `translateY(-50%)`) — **done** (R-SIZE-06/ADR-0030; search edit action migrated, gate
   green); and size **`2xl`** — **done** (R-SCALE-01/ADR-0030; page `max-width-2xl`
   migrated, gate green); **`centered flush-block`** — **done** (R-SIZE-07/ADR-0031;
   page `margin: 0 auto` decomposed into `margin-inline:auto` + `margin-block:0`, gate
   green); **`grid-fit-sm`** — **done** (R-STRUCTURE-02/ADR-0032; search results migrated,
   gate green, with `min-width-sm` folded in after the new `--size-sm` binding exposed it).
   The broader proportional plane — `columns-N` +
   intent-proportions — is captured in `docs/proportional-plane.md`.
2. **`prominence`** — mid-scale opacity as a ruled scale (new axis; explicitly not `concealment`).
3. **Treatments** — `link`, `disabled`-treatment, `press-feedback`, `unselectable`.
4. **Type roles** — `overline`, `tabular`, `emphasis` (small, single-site; last).
Each: derive via admission test → Gap Report → ruling → registry/emit → regenerate → migrate → verify parity.

# Phase 4 — Animation plane (`tween`)

**Goal:** the `R-MOTION` reframe + duration step naming (`GAP-U-animation-plane`,
`plane-model.md`). A constitution arc, not an atom. Sequence as its own revision after
Phases 1–3. `shake`/`flash`/`pulse` keyframes stay `scene` (identity).

# Phase 5 — Monky-local molecules

**Goal:** convert the Group-E molecules to project-scoped semantic classes now (per ruling).
**Steps:** replace each raw bundle with an intent-named Monky-local class (`prose`, `keycap`,
`selection-indicator`, `caret`, `placeholder`, `divider`; `scrollbar` webkit half local,
standard half → `scrollbar-subtle` in Phase 1). Record each in a Monky-side registry of
project-scoped words with recurrence, so a second project can later promote it via Gap Report.
**Verify:** byte-identical parity. Parallel-safe with all other phases (no rulings).

---

# Sequencing & guardrails

Order: **0 (done) → 1 → 2 → 5 → 3 → 4.** Rationale: 1+2+5 need no new shared rulings and
retire the most rows; 3+4 are the ruling-heavy arcs.

Invariants, every phase: the assistant files Gap Reports and does migrations; **the human
author makes every ruling** (R1/R2). No rendered output changes — byte-identical style-smoke
parity gates every migration. The ledger is regenerated (`npm run adoption:current`), never
hand-edited.

## Status

- [x] **Phase 0** — registry triage complete; headline corrected above.
- [x] **Spacing scale ruled** — density retired → T-shirt (`DENSITY-WORDS-RETIRED.md`,
  `WORKORDER-SPACING-TSHIRT.md`; Ermine committed, `npm run check` green).
- [x] **Phase 1 — complete.** Spacing migrated in Monky (style-smoke byte-identical, reconcile
  gate `assimilable=0`); `padding-2xl` assimilation unlocked. Remaining Group-A candidates
  reclassified — none byte-identical (recipe-owned cursor, bare nowrap ≠ truncate,
  `!important` position, off-scale layer/elevation/measure). See Phase 1 §Result.
- [x] **Phase 2 — done.** Multi-line clamp admitted as `clamp-N` (not `truncate-N`; the
  number now reads as the retained-line limit), R-SKIN-12/ADR-0023; Monky's 3-line preview
  migrated to `clamp-3` (style-smoke identical, gate green). `GAP-U-truncate-clamp` resolved.
- [ ] **Phase 3 — underway.** Spatial/proportional arc has landed `fill`, `square`,
  `cover`, `push`, `hug-inline`, `center-x`, `center-y`, size `2xl`/`max-width-2xl`, and
  `centered flush-block`, `grid-fit-sm`, and the unlocked `min-width-sm` cleanup. Next clean
  candidates are remaining measure, then `columns-12` + intent-proportions. See
  `RESIDUE-INVARIANCE.md`.
- [ ] Phase 4 — animation plane.
- [ ] Phase 5 — Monky-local molecules.
