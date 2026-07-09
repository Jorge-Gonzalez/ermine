# Ermine → Monky — Coverage Report

Status snapshot of the adoption. Declaration figures are the frozen U2 baseline ledger
(`reports/adoption/monky/ledger.json`), measured at Monky `bd4bc41`. Theme figures are the
U8e binding at Monky `cf547f7`. Ermine at `fb87529`.

## Summary

- **Surfaces:** every Monky surface is migrated — modal/search, settings/editor,
  suggestions/delete, and the extension pages — onto one canonical Ermine grammar surface;
  the Tailwind-like utility vocabulary and the temporary legacy grammar are gone.
- **Declarations:** of 1409 conserved baseline declarations, **77% have a terminal
  disposition**; 23% remain `uncertain`, and every one is triaged (below).
- **Theme:** the skin **colour plane fully covers Monky's theme** — 23 sockets bound per
  theme × mode, contract-valid, byte-identical rendering, no colour residual.
- **Nothing is lost:** every residual is either a triaged uncertain record or a filed Gap
  Report.

## 1. Declaration coverage (the ledger)

1409 conserved declarations, by disposition:

| Disposition | Count | Share | Meaning |
|---|---:|---:|---|
| grammar-exact | 104 | 7.4% | migrated to an Ermine word that reproduces the computed property |
| grammar-composition | 46 | 3.3% | migrated to an Ermine composition |
| skin-local | 339 | 24.1% | appearance (colour/type/border/shadow) — not grammar; theme/skin |
| identity-local | 138 | 9.8% | component-specific geometry / product identity |
| substrate | 37 | 2.6% | user-agent resets |
| dead | 416 | 29.5% | never-consumed (the Tailwind-like utility grid) — removed |
| gap | 0 | — | no unresolved blocker holds an open Gap disposition |
| uncertain | 329 | 23.4% | triaged, awaiting resolution (§4) |

**Reading it honestly.** Grammar is 150 declarations — ~15% of the 993 *live* (non-dead)
declarations. That is not a shortfall: structure is only about a third of what a stylesheet
does, and Ermine's grammar deliberately owns structure, not appearance. The large `dead`
share (30%) is the open utility grid that was never consumed. `skin-local` (the biggest
live bucket) is exactly what the skin/theme plane now addresses.

## 2. Surface coverage

| Surface | Order | Result |
|---|---|---|
| Modal shell + search | U5 | structure → grammar; skin/identity retained; pilot report |
| Settings, segmented controls, macro editor | U6 | migrated; segmented-control geometry kept local |
| Suggestions + delete-confirm overlays | U7 | migrated; ARIA state; same base bundle across roots |
| Popup, options, editor pages | U8 | migrated; **utilities + legacy grammar retired** |
| Theme (humo/acera/mar × light/dark) | U8e | bound to the socket contract (§3) |

One grammar revision drives every Shadow-DOM and page root; a class name has one meaning
across surfaces.

## 3. Theme coverage (the socket plane)

The ratified skin colour plane (R-SKIN-02…08, R-SCALE-03) was bound to Monky's real theme:

- **45-socket contract**; Monky binds **23** per theme × mode, all **contract-valid**.
- Covers the whole theme-varying palette: surface hierarchy (`ground` + subtle/defined +
  hover/active/selected), ink family + inverse + selected, `rule` + soft, `accent` + soft,
  status `pass/warn/fail/note` + washes, and `shadow`.
- **Byte-identical rendering** — style-smoke parity across all frozen baselines, 1137 tests,
  clean build.
- **No colour residual.** Source of truth is one file (`socketPalette.ts`).

Full detail: `pilots/THEME-LEDGER-RESOLUTION.md`.

## 4. What remains — specification

### 4.1 The 329 uncertain declarations (triaged in `pilots/UNCERTAIN-TRIAGE.md`)

| Bucket | Count | Status / next action |
|---|---:|---|
| **Shared-ruling** | 150 | **Newly unblocked.** These were "resolvable after a skin/theme ruling" — those rulings now exist (R-SKIN-02…08, ADR-0005). Reclassify as `skin-local` under the rulings. The largest single win still open. |
| Existing-Ermine | 93 | Semi-automatable: inverse generated-CSS lookup + computed-style confirmation → `grammar-exact`/`grammar-composition`. |
| Identity-local | 49 | Human classification (component contract / public hook / viewport). |
| Ermine-evolution | 37 | Feed the Gap Reports (§4.2); not terminal adoption. |
| Dead-code | 0 | none met the reachability bar in this pass. |

Uncertain records live in baseline files `layout-semantic.css` (245), `styles.css` (66),
`pageStyles.css` (9), `utilities.css` (5), `popup.css` (4).

### 4.2 Open design questions (filed Gap Reports)

| Gap Report | Question |
|---|---|
| `GAP-U-dataviz-palette` | a second, versatile colour plane for graphs/dashboards |
| `GAP-U-overflow-hidden` | an `overflow: hidden` word distinct from `clip` |
| `GAP-U-density-2xl` | a 24px density step (between `loose` and `separated`) |
| `GAP-U-animation-plane` | `motion → animation` reframe (tween/choreography; state as membrane) |
| `GAP-U-interaction-affordance` | lift interaction affordance to capability words |
| `GAP-K6-skin-surface`, `GAP-K6-skin-type` | pre-adoption skin-surface / skin-type questions (largely superseded by R-SKIN) |

### 4.3 Named follow-ups

- **Ratify `raised`/`sunken`** as the elevation treatment — the formal home for the shadow
  *geometry* (offset/blur) that pairs with the `shadow` colour socket.
- **Duration/stagger step names** — scale-bound per R-SCALE-03 but unnamed (R-SCALE-02).
- **U9** — generalize the adoption tooling away from Monky specifics and publish the final
  case study (the adoption's own closing order).

## 5. Deliberate non-coverage (boundaries, not gaps)

- **Scales** (`--spacing`, `--radius`, `--text`, `--transition`) stay in `metrics.css` —
  mode-invariant metrics, not routed through the theme-plane resolver. The contract has
  `radius`/`type`/`weight` sockets for themes that *do* vary them; Monky doesn't.
- **Component identity** stays project-owned (U-R2) — exact widths, caret/viewport
  positioning, subgrid, product-specific geometry are correctly not grammar.
- **Interaction behaviour** (event wiring, keyboard, focus management) is JavaScript, not
  style; only the *affordance* is a grammar candidate (`GAP-U-interaction-affordance`).

## 6. Distance to "complete"

Against the order's completion definition, met: one pinned grammar, separated strata,
utility/legacy vocabulary gone, generated classes lint+emit, one grammar revision across
roots, skin gaps ruled or honestly local, behaviour preserved. **Open:** every baseline
declaration terminal (329 uncertain remain — 150 now unblocked by the skin rulings), and
U9's tooling generalization + final report. That is the remaining path to close.
