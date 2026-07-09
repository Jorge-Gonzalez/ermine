# Monky pilot — theme plane binding and coverage (U8e)

## Provenance

| Evidence | Source |
|---|---|
| Order | `docs/Monky-implementation.md` § U8e; `docs/skin-theme-ruling-draft.md` |
| Skin/theme rulings | R-SKIN-02…08, R-SCALE-03 (ADR-0005) |
| Theme plane | `src/theme/theme-plane.ts`, `src/theme/sockets.generated.ts` |
| Measured Monky result | `f2f0e2a5daacace8b43e0b055022f89d500ae02e` |

## What was done

Monky's `humo` / `acera` / `mar` palettes are bound to Ermine's skin socket contract and
the theme is now driven from the plane. Consumption uses the **data path** (no runtime
Ermine import, consistent with how Monky consumes generated CSS): Monky owns
`src/theme/socketPalette.ts` (its tones mapped onto sockets, plus an alias bridge), and
both apply paths — `useThemeColors` (overlays) and `ThemeManager` (pages) — set
`themeSocketVars()` on the themed root. Component CSS is unchanged: it keeps reading
`--base-tone` / `--harmonic` / `--status-error`, now aliased to sockets.

## Coverage result

**The socket contract fully covers Monky's theme-varying colour palette, proven by
byte-identical rendering.**

- **22 sockets bound** per theme × mode, all **contract-valid** (required floor
  `ground`/`ink`/`rule` present; no unregistered socket) — validated through the real
  `validateBindings`.
- **Parity**: `style-smoke` matches every frozen baseline (modal/search, settings/editor,
  suggestions, delete-confirm); **1147 unit tests** pass; build clean. Rendering did not
  change — the sockets reproduce Monky's tones exactly.

Mapping (Monky var → socket):

| Monky | Socket | | Monky | Socket |
|---|---|---|---|---|
| `--base-tone` | `ground` | | `--accent` | `accent` |
| `--tone-dim` | `ground-subtle` | | `--accent-dim` | `accent-soft` |
| `--tone` | `ground-defined` | | `--status-success` | `pass` |
| `--ink` | `ink` | | `--status-warning` | `warn` |
| `--ink-soft` | `ink-soft` | | `--status-error` | `fail` |
| `--ink-alt` | `ink-inverse` | | `--status-info` | `note` |
| `--harmonic` | `rule` | | `--status-*-wash` | `*-faint` |
| `--harmonic-minor` | `rule-soft` | | | |

## Residuals (honest)

- **`--shadow-color`** — *resolved.* Absorbed as a standalone `shadow` socket (Monky
  `518ecba`): a theme colour that is neither carrier nor role, read by the elevation
  treatment (`raised`/`sunken`); its geometry (offset/blur) stays with the treatment, not
  the socket. `--shadow-color` now aliases to `--shadow`; rendering unchanged. 23 sockets
  bound. No colour residual remains.
- **Scales** (`--radius-*`, `--spacing-*`, `--text-*`, `--transition-*`) stay in
  `metrics.css`. They are mode-invariant, so they are *not* routed through the theme-plane
  resolver — a deliberate boundary (the plane resolves theme × mode colour), not a gap.
  The `radius`/`type`/`weight` sockets exist for themes that *do* vary them; Monky doesn't.
- **`ink-muted` / `ink-faint`** unbound — Monky's UI doesn't use those recession steps.
  Optional sockets, correctly left empty.
- **Dedup follow-up**: `src/theme/colorTheme/*` constants are now superseded by
  `socketPalette.ts` (values duplicated). Making `socketPalette` the single source and
  retiring `colorTheme` is a cleanup, not a coverage question.

## What this measures for Ermine

A real production theme — three palettes, light/dark, multiple Shadow-DOM and page roots —
binds to the socket contract with **zero rendering change**. The colour plane's socket set
(surface hierarchy, ink family + inverse, rule, accent, status + washes, interaction tones)
is sufficient to express a real theme end-to-end. The one true colour residual is a shadow
alpha; everything else is either bound or a deliberate non-colour boundary.

## Reproduction

```sh
cd ../monky && npm test && npm run test:styles && npm run build   # parity + suite
# Ermine: validate Monky's socket subset against the contract
node --import tsx -e 'import {themeSocketVars} from "../monky/src/theme/socketPalette.ts"; …'
```
