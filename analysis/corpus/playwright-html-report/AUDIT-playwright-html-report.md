# CSS scale audit — playwright-html-report

Limitations: computed styles not observed; JS-injected styles and CSS-in-JS are not extracted.
Standing assumptions: rem→16px assumed; !important stripped.

Inputs:

- analysis/corpus/playwright-html-report/report.css

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor could express):

| corpus | coverage | theme custom-props |
|---|---|---|
| playwright-html-report | 89.9% | 77.3% |

Declarations: 2471 total; 562 real properties; 1909 theme custom properties.
Top uncovered families: line-height (15), -webkit-user-select (7), user-select (7), fill (5), float (4), color-scheme (3), visibility (3), vertical-align (3), -webkit-text-stroke (2), box-sizing (1), pointer-events (1), list-style (1).

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| playwright-html-report | 142 | 17 | 83.8% | 96.5% | 84.5% | 28.0% |

Top spacing values: 8px (40), 4px (23), 24px (18), 16px (16), 32px (16), 12px (6), 6px (5), 10px (5), 5px (3), -1px (2), 2px (2), 7px (1).

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| playwright-html-report | 15 | 11 | 66.7% |

Top size values: 24px (5), 20px (1), 1024px (1), 48px (1), 70px (1), 250px (1), 30px (1), 18px (1), 200px (1), 16px (1), 1px (1).
