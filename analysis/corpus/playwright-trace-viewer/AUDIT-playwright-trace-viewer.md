# CSS scale audit — playwright-trace-viewer

Limitations: computed styles not observed; JS-injected styles and CSS-in-JS are not extracted.
Standing assumptions: rem→16px assumed; !important stripped.

Inputs:

- analysis/corpus/playwright-trace-viewer/codeMirrorModule.DYBRYzYX.css
- analysis/corpus/playwright-trace-viewer/defaultSettingsView.CjdS-WJx.css
- analysis/corpus/playwright-trace-viewer/index.CzXZzn5A.css
- analysis/corpus/playwright-trace-viewer/uiMode.BZQ54Kgt.css
- analysis/corpus/playwright-trace-viewer/xtermModule.DYP7pi_n.css

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor could express):

| corpus | coverage | theme custom-props |
|---|---|---|
| playwright-trace-viewer | 65.2% | 49.9% |

Declarations: 4199 total; 2103 real properties; 2096 theme custom properties.
Top uncovered families: content (576), line-height (35), -webkit-user-select (26), user-select (26), pointer-events (12), visibility (9), color-scheme (5), word-break (4), vertical-align (3), float (3), text-wrap (3), direction (2).

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| playwright-trace-viewer | 181 | 26 | 70.7% | 90.1% | 46.4% | 22.3% |

Top spacing values: 4px (37), 8px (28), 5px (21), 3px (15), 2px (14), 10px (13), 16px (13), 6px (8), 50px (4), 30px (4), -50px (3), 12px (3).

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| playwright-trace-viewer | 75 | 32 | 42.7% |

Top size values: 1px (6), 32px (6), 12px (6), 16px (5), 30px (5), 400px (4), 20px (3), 28px (3), 8px (3), 18px (3), 10px (3), 24px (3).
