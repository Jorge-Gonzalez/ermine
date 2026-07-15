# CSS scale audit — playwright-recorder

Limitations: computed styles not observed; JS-injected styles and CSS-in-JS are not extracted.
Standing assumptions: rem→16px assumed; !important stripped.

Inputs:

- analysis/corpus/playwright-recorder/codeMirrorModule-DYBRYzYX.css
- analysis/corpus/playwright-recorder/index-4ZiSSCmn.css

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor could express):

| corpus | coverage | theme custom-props |
|---|---|---|
| playwright-recorder | 39.1% | 48.7% |

Declarations: 2157 total; 1107 real properties; 1050 theme custom properties.
Top uncovered families: content (573), height (15), bottom (11), width (10), right (9), visibility (7), text-decoration (6), line-height (6), color-scheme (3), -webkit-user-select (3), user-select (3), direction (2).

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| playwright-recorder | 40 | 14 | 77.5% | 95.0% | 30.0% | 31.0% |

Top spacing values: 4px (10), 3px (6), 5px (6), -50px (3), 10px (3), 2px (3), 0.1px (2), 50px (1), 1.6px (1), 12.8px (1), 8px (1), 6px (1).

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| playwright-recorder | 21 | 16 | 52.4% |

Top size values: 1px (2), 400px (2), 12px (2), 16px (2), 7px (2), 300px (1), 20px (1), 320px (1), 32px (1), 28px (1), 40px (1), 250px (1).
