# Ingestor viability — measured findings

The ingestor is the inverse of the emitter (real CSS → grammar). Before building one,
we measured its ceiling against real, non-Ermine CSS, in two layers. Instruments:
`scope.ts` (layer 1, property coverage) and `values.ts` (layer 2, value distribution).
Re-runnable: `pnpm tsx analysis/scope.ts <css…>` / `values.ts <css…>`.

Corpora: **frameworks** — Pico, Bootstrap 5. **hand-authored** (non-framework production
CSS) — Daring Fireball, tonsky.me, eatonphil, jvns.ca, Hacker News, gnu.org (~2.5k
declarations combined). rem→16px assumed; `!important` stripped.

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor can express):

| corpus | coverage | theme custom-props |
|---|---|---|
| Pico | 64.2% | 36.9% |
| Bootstrap | 72.6% | 21.4% |
| hand-authored (combined) | **77.2%** | 1.1% |
| — jvns / HN / gnu | 74.8 / 68.6 / 76.9% | 0% |

**Robust ~65–77% across framework AND hand-authored** — property scope is *not* a framework
artifact. Custom properties (the `var()` theme seam) are 21–37% of framework CSS but ~1% of
hand-authored: **tokenization is a framework practice**; hand-authored code inlines values.

Consistent core gaps (uncovered families, by frequency): `width`, `height`, inset
(`top`/`left`/`right`/`bottom`), `transform`, `content`, typography detail
(`text-decoration`/`letter-spacing`/`text-transform`), `@font-face` (`src`/`unicode-range`),
`white-space`, `cursor`, `opacity`, `order`, `animation`, `object-fit`. Split them into
**deliberate omissions** (width/height/order — see layer 2) and **candidate axes**
(transform, opacity, the typography details).

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin) — reduces, but discipline-dependent

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| Bootstrap | 565 | 19 | **94.7%** | 98.6% | 96.3% | 10.8% |
| hand-authored | 216 | 61 | **47.7%** | 64.8% | 53.7% | 40.8% |

A scale-like **attractor exists everywhere** — the top values are a clear doubling core
(8/16/24/32/64/80). But the tight 6→95% compression is largely **framework discipline** (they
*design* the scale, e.g. Bootstrap's `$spacer`). Hand-authored spacing is a **loose cluster**:
~41% is just `0`, the core dominates, but a heavy residual tail (5, 15, 3, 35px…) means 6 steps
capture only ~48% of raw lengths and half sit off a 4px grid. This is exactly §5.1's thesis
observed: the scale is the line, the **residuals are the signal**, and they are larger where no
system enforced them.

### SIZE (width/height/min-max/basis) — does NOT reduce, anywhere

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| Bootstrap | 20 | 15 | 55% |
| hand-authored | 64 | 52 | **23.4%** |

Flat in both; ~27–34% are percentages; the "lengths" are one-off dimensions (container widths
540/720/960/1140/1320 each once; HN's 24/36/48/60/72… indent sequence). **Size is not scale-like**
— which validates the grammar's deliberate refusal to model raw `width`/`height` (it uses
negotiated grow/shrink/basis, min/max constraint bands, and fluid `self-stretch` instead).

## Conclusions

1. **Ingestor is viable** — ~70% property ceiling, robust across corpus type.
2. **The grammar's opinionatedness tracks the data**: it scales what's scale-like (spacing,
   covered) and omits what isn't (size, deliberately uncovered).
3. **Spacing value-mapping is a "snap + record residual" problem** (§5.1): high on framework CSS
   (~95% to 6 steps), moderate on hand-authored (~48% exact, the rest snaps with a residual that
   is itself the measurement of the design's deviation).
4. **Circularity caveat: mostly defeated.** Property scope is corpus-independent. The tight
   spacing compression *was* a framework artifact; the honest hand-authored floor is a loose
   cluster, which strengthens (not weakens) the §5.1 residual story.

Caveats: modest N; dev-blog-skewed (text sites, not app UIs — a component-library-driven app
might be more scale-disciplined); rem→16px; family normalization is conservative
(row-gap/column-gap under-counted as gap).
