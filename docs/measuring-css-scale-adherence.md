# Measuring CSS scale adherence

A method and instrument set for answering one question about real stylesheets:
**how closely does shipped CSS adhere to a small set of named steps?** The
method stands on its own — it measures adherence, it does not argue for any
particular styling system, and it draws no conclusions about adopting one. All
numbers below are copied from committed, generated report files, each cited at
the table that uses it and regenerable with a stated command.

## 1. The measurement model

Adherence is measured in two layers, plus a translation model that turns the
second layer's deviations into data.

**Layer 1 — property scope.** For each CSS declaration, does the measuring
vocabulary have a *concept* for the property at all? Properties are normalized
into families (`padding-inline-start` → `padding`; the normalization is
deliberately conservative — see limitations) and compared against a declared
28-family universe. The result — real-property family coverage — is the
*ceiling* on what any property-level translation could express. Declarations of
custom properties (`--x: …`) are counted separately as the theme seam:
their share measures how much of a stylesheet is token plumbing rather than
direct styling.

**Layer 2 — value distribution.** For the families where a scale could exist,
do the *values* cluster? Spacing (`gap`/`padding`/`margin`) and size
(`width`/`height`/min-max/`flex-basis`) lengths are collected raw (rem→16px, see
limitations), then summarized as: raw length count, distinct values, top-6 and
top-12 coverage (what share of raw lengths the k most frequent values capture),
share on a 4px grid, and the share of literal `0`.

**Snap and residual.** A scale is a line through value space; real values sit
near it or off it. The translation model snaps each mappable length to the
*nearest* scale step and records the signed difference — `requested 15px →
snapped 16px, residual −1px`. Residuals are the measurement: their histogram
says how far a real design sits from a given scale. Translation is
conservation-checked — every declaration is either translated or passed through
verbatim, and the counts must sum to the original (asserted in the instrument;
nothing is dropped, nothing is invented).

## 2. The instruments

All run from the repository root with Node 20+ and `npm install`.

| instrument | what it emits | reproduction command |
|---|---|---|
| `analysis/scope.ts` | layer-1 coverage per input CSS | `npx tsx analysis/scope.ts <css…>` |
| `analysis/values.ts` | layer-2 distributions per input CSS | `npx tsx analysis/values.ts <css…>` |
| `analysis/audit.ts` | one combined report (`AUDIT-<slug>.md`) for local files or a URL | `npm run audit -- <css-or-url…>` |
| `analysis/generate-app-audits.ts` | the committed per-target audits for the app corpus | `npm run audit:apps` (no-diff check: `npm run audit:apps:check`) |
| `analysis/translate.ts` | the snap-and-residual translation of one real page + report | `npm run translate:original` then `npm run translate` |

A fixture test (`test/audit-cli.test.ts`) pins the instrument's arithmetic to
hand-computed values; the app-corpus audits are covered by a no-diff check, so a
drifted committed number fails CI.

## 3. Corpora

Three corpus groups, measured with the same instruments:

- **Frameworks** — Pico and Bootstrap 5 (designed scales; ~live fetches,
  recorded in the dated `analysis/FINDINGS.md`).
- **Hand-authored production CSS** — Daring Fireball, tonsky.me, eatonphil,
  jvns.ca, Hacker News, gnu.org; ~2.5k declarations combined (same record).
- **App UIs** — six targets across three independent organizations, committed
  byte-for-byte with hashes and licenses under `analysis/corpus/`
  (provenance: `analysis/corpus/README.md`): Firefox `about:debugging`
  (Firefox 151.0), four Playwright 1.61.1 surfaces (one product family, kept as
  separate rows and never pooled), and Swagger UI 5.31.1.

Two widely deployed dashboard families were probed and **excluded as
unmeasurable by this instrument**, with evidence recorded in the corpus
manifest: Grafana 13 distributes only a 7.4 kB chart-library stylesheet (its UI
is emotion CSS-in-JS) and Home Assistant links no stylesheet at all (lit
shadow-DOM injection). Distributed-CSS instruments cannot see either.

## 4. Results — layer 1 (property scope)

Sources: `analysis/FINDINGS.md` (framework, hand-authored);
`analysis/FINDINGS-APPS.md` and `analysis/corpus/<slug>/AUDIT-<slug>.md`
(apps). Regenerate the app rows with `npm run audit:apps`.

| corpus | coverage | theme custom-props |
|---|---|---|
| Pico | 64.2% | 36.9% |
| Bootstrap | 72.6% | 21.4% |
| hand-authored (combined) | 77.2% | 1.1% |
| Firefox `about:debugging` | 77.1% | 70.1% |
| Playwright Dashboard | 45.3% | 55.3% |
| Playwright HTML Report | 82.4% | 77.3% |
| Playwright Recorder | 34.5% | 48.7% |
| Playwright Trace Viewer | 51.3% | 49.9% |
| Swagger UI | 78.5% | 0.0% |

What the numbers show: coverage is 64–77% across frameworks and hand-authored
CSS and 34.5–82.4% across app UIs — the wider app range tracks bundle
composition (icon/editor blocks), not organization. The custom-property share
splits by styling era and practice, not by app-ness: ~1% for hand-authored,
21–37% for frameworks, 48.7–77.3% for the variables-era app families, and 0.0%
for Swagger UI — an app-UI stylesheet with no token seam at all.

## 5. Results — layer 2 (value distribution)

### Spacing (gap/padding/margin)

Sources: `analysis/FINDINGS.md`; `analysis/FINDINGS-APPS.md`. Regenerate app
rows with `npm run audit:apps`.

| corpus | raw lengths | distinct | top-6 | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| Bootstrap | 565 | 19 | 94.7% | 98.6% | 96.3% | 10.8% |
| hand-authored | 216 | 61 | 47.7% | 64.8% | 53.7% | 40.8% |
| Firefox `about:debugging` | 2 | 2 | 100.0% | 100.0% | 50.0% | 13.2% |
| Playwright Dashboard | 92 | 13 | 84.8% | 98.9% | 66.3% | 23.4% |
| Playwright HTML Report | 142 | 17 | 83.8% | 96.5% | 84.5% | 28.0% |
| Playwright Recorder | 40 | 14 | 77.5% | 95.0% | 30.0% | 31.0% |
| Playwright Trace Viewer | 181 | 26 | 70.7% | 90.1% | 46.4% | 22.3% |
| Swagger UI | 867 | 41 | 54.8% | 81.3% | 86.5% | 22.8% |

Spacing concentrates everywhere, to degrees that order by discipline: a
designed framework scale reaches 94.7% top-6; component-built app UIs sit at
70.7–84.8%; Swagger UI's large sample (867 lengths) reaches 54.8%; hand-authored
CSS bottoms at 47.7%. The recurring top values are a doubling core
(8/16/24/32/64/80 in the original corpora; 16/8/4/32/64/128/256 in Swagger UI).
Grid share and top-k concentration separate: Swagger UI has the corpus's
highest 4px-grid share (86.5%) with the lowest app top-6, while the Recorder
combines 77.5% top-6 with only 30.0% on-grid. Firefox's two raw lengths are
reported but too few to treat as a distribution — its spacing is predominantly
token references, which layer 2 does not resolve.

### Size (width/height/min-max/basis)

Same sources and commands.

| corpus | raw lengths | distinct | top-6 |
|---|---|---|---|
| Bootstrap | 20 | 15 | 55% |
| hand-authored | 64 | 52 | 23.4% |
| Firefox `about:debugging` | 2 | 1 | 100.0% |
| Playwright Dashboard | 52 | 20 | 61.5% |
| Playwright HTML Report | 15 | 11 | 66.7% |
| Playwright Recorder | 21 | 16 | 52.4% |
| Playwright Trace Viewer | 75 | 32 | 42.7% |
| Swagger UI | 146 | 41 | 48.6% |

Size concentrates less than spacing in every corpus with a usable sample: the
original record's one-off container widths and indent sequences (540/720/960…
each once) recur as the pattern; within each Playwright target the spacing/size
top-6 gap is 17.1–28.0 percentage points; Swagger UI's 6.2-point gap is the
narrowest measured, with the same doubling values recurring in both length
families.

## 6. Results — translating one real page

Source: `analysis/translation/TRANSLATION-REPORT.md`; artifacts under
`analysis/translation/`. Regenerate with `npm run translate:original` then
`npm run translate`. The page is the corpus target with the highest layer-1
coverage (the Playwright HTML Report snapshot, 82.4%).

| | declarations | share |
|---|---:|---:|
| original (parsed) | 2501 | 100% |
| translated to scale words | 72 | 2.9% |
| passed through verbatim | 2429 | 97.1% |

The gap between the 82.4% *ceiling* and the 2.9% *translation rate* decomposes
almost entirely into measured categories rather than misses: 1939 declarations
(77.5%) are custom properties — the token seam itself, matching the layer-1
custom-property share for the same target (77.3%) — and the non-token tail is
dominated by properties outside the measuring vocabulary (line-height,
border-radius, physical single-side margins). Of the 33 declarations snapped to
a scale, 19 landed exactly, 5 sat beyond 16px — the largest residual being
+256px on a `max-width` — reproducing at declaration level what the layer-2
tables show in aggregate: spacing snaps, size resists. Conservation held
exactly (2501 = 72 + 2429, asserted in the instrument), and a browser smoke
test (`test/browser/translated.test.ts`) verifies both versions render without
console errors with equal computed `display` on key elements.

## 7. Limitations

Copied from the caveats recorded alongside each measurement:

- The instruments read **distributed CSS text**, not computed styles;
  JS-injected styles and CSS-in-JS are invisible (this excluded Grafana and
  Home Assistant outright — see §3).
- **rem→16px assumed; `!important` stripped** (standing assumptions in every
  report header).
- Family normalization is conservative (e.g. `row-gap`/`column-gap`
  under-counted toward `gap`).
- The original framework/hand-authored corpus is **modest-N and text-site
  skewed**, and its input CSS was fetched live rather than committed;
  `analysis/FINDINGS.md` is a dated record. The app corpus corrected the
  committed-bytes practice.
- The four Playwright rows share build assets and are **not independent
  evidence**; they are never pooled. Firefox's layer-2 rows have samples of two
  and are reported without being treated as distributions.
- The translation spike covers **one page**, uses a static rendered-DOM
  snapshot, and deliberately collapses cascade specificity onto class selectors
  with pass-throughs loaded last; visual differences arising from that collapse
  are recorded as data, not corrected.

## 8. Related work

Designed scales are established practice rather than a novel idea: Tailwind
ships a numeric spacing scale on a 0.25rem grid precisely so that authored
values cluster by construction, and the measured Bootstrap rows show what such
a designed scale looks like from the outside (94.7% top-6). Design-token
practice — popularized by tools like Style Dictionary and being standardized by
the W3C Design Tokens Community Group — is the industry mechanism behind the
custom-property seam this method measures directly, and the 8pt-grid tradition
in design systems corresponds to the 4px-grid share reported in layer 2. The
measured stylesheets sit at every point of that spectrum, from token-free
(Swagger UI, hand-authored) to majority-token (Playwright, Firefox), which is
what makes the seam share a useful axis of the measurement rather than an
assumption of it.

---

*Every table above is copied from a committed report file named at the table,
and each is regenerable with the stated command. This document records the
measurement method and its results; it makes no recommendation.*
