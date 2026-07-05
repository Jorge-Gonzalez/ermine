# Ingestor viability — app-UI corpus

This is the app-UI companion to the dated, text-site-skewed
[`FINDINGS.md`](./FINDINGS.md). It applies the same C1 instrument and table shapes
to four public interactive applications distributed with
[`playwright-core@1.61.1`](./corpus/README.md). The CSS snapshots and generated
per-target audits are committed under `analysis/corpus/`.

Fetched: **2026-07-05**. Standing assumptions: rem→16px assumed; `!important`
stripped. The instrument observes distributed CSS declarations, not computed styles.

All four targets are React/Vite-built application surfaces, but they belong to one
product family and share some theme, icon, editor, and terminal assets. They are kept
as separate rows rather than pooled so duplicated shared CSS is not counted as
independent evidence.

## Targets and reproduction

| target | public source | fetched | why it qualifies as app UI | reproduction command |
|---|---|---|---|---|
| Playwright Dashboard | [CSS](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/dashboard/assets/index-BY2S1tHT.css) | 2026-07-05 | Stateful browser-session dashboard with navigation, controls, and work panels. | `npm run audit:apps -- playwright-dashboard` |
| Playwright HTML Report | [CSS](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/htmlReport/report.css) | 2026-07-05 | Searchable and filterable results application with test-detail and attachment views. | `npm run audit:apps -- playwright-html-report` |
| Playwright Recorder | [CSS directory](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/recorder/assets/) | 2026-07-05 | Inspector/codegen application with recording controls, call log, locator input, and code editor. | `npm run audit:apps -- playwright-recorder` |
| Playwright Trace Viewer | [CSS directory](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/traceViewer/) | 2026-07-05 | Time-travel debugging application with timeline, action, source, console, network, and metadata panels. | `npm run audit:apps -- playwright-trace-viewer` |

Run `npm run audit:apps` to reproduce all four reports, or
`npm run audit:apps:check` to verify that the committed reports match the corpus.
Exact upstream URLs, file hashes, retrieval details, and license provenance are in
the [corpus manifest](./corpus/README.md).

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor can express):

| corpus | coverage | theme custom-props |
|---|---|---|
| [Playwright Dashboard](./corpus/playwright-dashboard/AUDIT-playwright-dashboard.md) | 45.3% | 55.3% |
| [Playwright HTML Report](./corpus/playwright-html-report/AUDIT-playwright-html-report.md) | 82.4% | 77.3% |
| [Playwright Recorder](./corpus/playwright-recorder/AUDIT-playwright-recorder.md) | 34.5% | 48.7% |
| [Playwright Trace Viewer](./corpus/playwright-trace-viewer/AUDIT-playwright-trace-viewer.md) | 51.3% | 49.9% |

Coverage spans **34.5–82.4%**, a wider range than the original framework and
hand-authored rows (**64.2–77.2%**). Theme custom properties account for
**48.7–77.3%** of declarations, above the original framework range (**21.4–36.9%**).
The three lower-coverage bundles each contain 573–576 uncovered `content`
declarations from icon CSS; the HTML Report, which does not include that block, has
the highest coverage. Thus bundle composition visibly moves both app-UI measures.

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| [Playwright Dashboard](./corpus/playwright-dashboard/AUDIT-playwright-dashboard.md) | 92 | 13 | **84.8%** | 98.9% | 66.3% | 23.4% |
| [Playwright HTML Report](./corpus/playwright-html-report/AUDIT-playwright-html-report.md) | 142 | 17 | **83.8%** | 96.5% | 84.5% | 28.0% |
| [Playwright Recorder](./corpus/playwright-recorder/AUDIT-playwright-recorder.md) | 40 | 14 | **77.5%** | 95.0% | 30.0% | 31.0% |
| [Playwright Trace Viewer](./corpus/playwright-trace-viewer/AUDIT-playwright-trace-viewer.md) | 181 | 26 | **70.7%** | 90.1% | 46.4% | 22.3% |

Top-six spacing coverage is **70.7–84.8%**: above the original hand-authored row
(**47.7%**) and below Bootstrap (**94.7%**) in every target. The 4px-grid share varies
from **30.0% to 84.5%** even while top-six coverage remains at least 70.7%; recurring
off-grid values such as 3px, 5px, 6px, and 10px account for part of that separation.
Zero shares (**22.3–31.0%**) fall between Bootstrap (**10.8%**) and the original
hand-authored corpus (**40.8%**).

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| [Playwright Dashboard](./corpus/playwright-dashboard/AUDIT-playwright-dashboard.md) | 52 | 20 | 61.5% |
| [Playwright HTML Report](./corpus/playwright-html-report/AUDIT-playwright-html-report.md) | 15 | 11 | 66.7% |
| [Playwright Recorder](./corpus/playwright-recorder/AUDIT-playwright-recorder.md) | 21 | 16 | 52.4% |
| [Playwright Trace Viewer](./corpus/playwright-trace-viewer/AUDIT-playwright-trace-viewer.md) | 75 | 32 | 42.7% |

Top-six size coverage is **42.7–66.7%**, versus **55%** for Bootstrap and **23.4%**
for the original hand-authored corpus. Within every app target, size is less
concentrated than spacing: the top-six difference ranges from 17.1 percentage points
in the HTML Report to 28.0 points in the Trace Viewer.

These are measurements of the committed app bundles. No scale adjustment or grammar
ruling is made here.
