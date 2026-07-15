# CSS scale audit — swagger-ui

Limitations: computed styles not observed; JS-injected styles and CSS-in-JS are not extracted.
Standing assumptions: rem→16px assumed; !important stripped.

Inputs:

- analysis/corpus/swagger-ui/swagger-ui.css

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor could express):

| corpus | coverage | theme custom-props |
|---|---|---|
| swagger-ui | 83.3% | 0.0% |

Declarations: 3989 total; 3989 real properties; 0 theme custom properties.
Top uncovered families: width (137), height (91), top (48), order (40), bottom (36), right (35), vertical-align (27), line-height (24), align-content (24), text-decoration (23), -webkit-text-decoration (21), text-transform (21).

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| swagger-ui | 867 | 41 | 54.8% | 81.3% | 86.5% | 22.8% |

Top spacing values: 16px (89), 8px (83), 4px (81), 32px (78), 64px (72), 128px (72), 256px (72), 10px (53), 20px (37), 5px (28), -4px (20), -8px (20).

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| swagger-ui | 146 | 41 | 48.6% |

Top size values: 16px (14), 32px (12), 64px (12), 128px (12), 256px (12), 20px (9), 480px (5), 512px (4), 768px (4), 1024px (4), 1536px (4), 544px (4).
