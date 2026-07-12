# CSS scale audit — playwright-dashboard

Limitations: computed styles not observed; JS-injected styles and CSS-in-JS are not extracted.
Standing assumptions: rem→16px assumed; !important stripped.

Inputs:

- analysis/corpus/playwright-dashboard/index-BY2S1tHT.css

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor could express):

| corpus | coverage | theme custom-props |
|---|---|---|
| playwright-dashboard | 49.5% | 55.3% |

Declarations: 3462 total; 1546 real properties; 1916 theme custom properties.
Top uncovered families: content (573), height (38), width (30), top (18), right (15), left (15), bottom (12), pointer-events (9), line-height (7), box-sizing (6), -webkit-user-select (5), user-select (5).

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| playwright-dashboard | 92 | 13 | 84.8% | 98.9% | 66.3% | 23.4% |

Top spacing values: 8px (25), 4px (22), 6px (14), 12px (9), 5px (4), -5px (4), 3px (3), 24px (3), 10px (2), 16px (2), 2px (2), 38px (1).

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| playwright-dashboard | 52 | 20 | 61.5% |

Top size values: 40px (13), 28px (4), 18px (4), 16px (4), 14px (4), 32px (3), 400px (2), 30px (2), 7px (2), 10px (2), 56px (2), 12px (2).
