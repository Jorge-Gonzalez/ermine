# C4 translation report — one real page

**Page**: the Playwright HTML Report (rendered-DOM snapshot, provenance in
`make-original.ts`) — chosen as the C2 corpus target with the **highest layer-1
coverage: 82.4%** (see `analysis/FINDINGS-APPS.md`).
Stylesheet: `analysis/corpus/playwright-html-report/report.css`.
Reproduce: `npm run translate:original` then `npm run translate`.

## 1. Translation rate

| | declarations | share |
|---|---:|---:|
| original (parsed) | 2501 | 100% |
| translated to grammar words | 72 | 2.9% |
| passed through to residual.css | 2429 | 97.1% |

Conservation is asserted in `translate.ts` (`assert.equal(originalCount,
translatedCount + residualCount)`): the translator never drops a declaration and
never coins a word (R2).

Words attached to the page: 25 distinct across 52 selectors
(36 selectors matched no element in this snapshot — their rules were
translated but style nothing on this page, on either side).

## 2. Residual histogram (snapped spacing/size values)

33 declarations were snapped to the nearest scale step:

| residual | count |
|---|---:|
| 0px (exact) | 19 |
| ±1–2px | 5 |
| ±3–4px | 1 |
| ±5–8px | 3 |
| ±9–16px | 0 |
| >16px | 5 |

Largest snaps: `max-width: 1024px` → `max-width-xl` (+256px); `min-height: 18px` → `min-height-sm` (-174px); `min-width: 20px` → `min-width-sm` (-172px); `min-width: 70px` → `min-width-sm` (-122px); `max-width: 250px` → `max-width-sm` (+58px).

## 3. Pass-through category breakdown

| category | declarations |
|---|---:|
| custom property | 1939 |
| property without emission inverse | 270 |
| pseudo selector | 65 |
| value behind var() | 58 |
| shorthand shape without inverse | 36 |
| at-rule block | 28 |
| display without single-word inverse | 19 |
| non-length or negative value | 14 |

Top properties inside "property without emission inverse" (the skin-shaped tail):
`flex` (27) · `margin-right` (14) · `line-height` (14) · `border-radius` (13) · `margin-left` (12) · `overflow` (12) · `margin-top` (11) · `height` (11)

## Findings

- **Lint check of the attached words**: 1 element word string(s) lint with errors — overlapping original rules mapped conflicting words onto one element:
  - `boxed boxed-inline position-absolute`: one-word-per-axis
- **Cascade fidelity is not reproduced, by design**: original specificity ordering
  collapses onto single-class word selectors plus residual.css loaded last. Visual
  differences from that collapse are data, not bugs (see the visual note).
- Screenshots: `original.png` / `translated.png` (1200px viewport, full page),
  regenerated on every run of `npm run translate`.
