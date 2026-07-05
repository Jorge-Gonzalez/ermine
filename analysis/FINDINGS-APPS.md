# Ingestor viability — app-UI corpus

This is the app-UI companion to the dated, text-site-skewed
[`FINDINGS.md`](./FINDINGS.md). It applies the same C1 instrument and table shapes
to five public interactive applications across the Mozilla and Playwright product
families. The CSS snapshots and generated per-target audits are committed under
[`analysis/corpus/`](./corpus/README.md).

Fetched: **2026-07-05**. Standing assumptions: rem→16px assumed; `!important`
stripped. The instrument observes distributed CSS declarations, not computed styles.

Firefox `about:debugging` is independent of Playwright. The four Playwright targets
belong to one product family and share some theme, icon, editor, and terminal assets.
Those four are kept as separate rows rather than pooled so duplicated shared CSS is
not counted as independent evidence.

## Targets and reproduction

| target | public source | fetched | why it qualifies as app UI | reproduction command |
|---|---|---|---|---|
| Firefox `about:debugging` | [pinned source](https://hg.mozilla.org/releases/mozilla-release/file/fc12dc911f904307729760a817deb829cbf8feb4/devtools/client/aboutdebugging) | 2026-07-05 | Stateful runtime dashboard for connecting devices and inspecting extensions, tabs, and workers. | `npm run audit:apps -- firefox-about-debugging` |
| Playwright Dashboard | [CSS](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/dashboard/assets/index-BY2S1tHT.css) | 2026-07-05 | Stateful browser-session dashboard with navigation, controls, and work panels. | `npm run audit:apps -- playwright-dashboard` |
| Playwright HTML Report | [CSS](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/htmlReport/report.css) | 2026-07-05 | Searchable and filterable results application with test-detail and attachment views. | `npm run audit:apps -- playwright-html-report` |
| Playwright Recorder | [CSS directory](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/recorder/assets/) | 2026-07-05 | Inspector/codegen application with recording controls, call log, locator input, and code editor. | `npm run audit:apps -- playwright-recorder` |
| Playwright Trace Viewer | [CSS directory](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/traceViewer/) | 2026-07-05 | Time-travel debugging application with timeline, action, source, console, network, and metadata panels. | `npm run audit:apps -- playwright-trace-viewer` |

Run `npm run audit:apps` to reproduce all five reports, or
`npm run audit:apps:check` to verify that the committed reports match the corpus.
Exact upstream URLs, file hashes, retrieval details, and license provenance are in
the [corpus manifest](./corpus/README.md).

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor can express):

| corpus | coverage | theme custom-props |
|---|---|---|
| [Firefox `about:debugging`](./corpus/firefox-about-debugging/AUDIT-firefox-about-debugging.md) | 77.1% | 70.1% |
| [Playwright Dashboard](./corpus/playwright-dashboard/AUDIT-playwright-dashboard.md) | 45.3% | 55.3% |
| [Playwright HTML Report](./corpus/playwright-html-report/AUDIT-playwright-html-report.md) | 82.4% | 77.3% |
| [Playwright Recorder](./corpus/playwright-recorder/AUDIT-playwright-recorder.md) | 34.5% | 48.7% |
| [Playwright Trace Viewer](./corpus/playwright-trace-viewer/AUDIT-playwright-trace-viewer.md) | 51.3% | 49.9% |

Coverage spans **34.5–82.4%**, a wider range than the original framework and
hand-authored rows (**64.2–77.2%**). Theme custom properties account for
**48.7–77.3%** of declarations, above the original framework range (**21.4–36.9%**).
The independent Firefox row sits at **77.1%** coverage and **70.1%** custom
properties. Three lower-coverage Playwright bundles each contain 573–576 uncovered
`content` declarations from icon CSS; the HTML Report, which does not include that
block, has the highest coverage. Thus both product family and bundle composition are
visible in the app-UI measures.

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| [Firefox `about:debugging`](./corpus/firefox-about-debugging/AUDIT-firefox-about-debugging.md) | 2 | 2 | 100.0% | 100.0% | 50.0% | 13.2% |
| [Playwright Dashboard](./corpus/playwright-dashboard/AUDIT-playwright-dashboard.md) | 92 | 13 | **84.8%** | 98.9% | 66.3% | 23.4% |
| [Playwright HTML Report](./corpus/playwright-html-report/AUDIT-playwright-html-report.md) | 142 | 17 | **83.8%** | 96.5% | 84.5% | 28.0% |
| [Playwright Recorder](./corpus/playwright-recorder/AUDIT-playwright-recorder.md) | 40 | 14 | **77.5%** | 95.0% | 30.0% | 31.0% |
| [Playwright Trace Viewer](./corpus/playwright-trace-viewer/AUDIT-playwright-trace-viewer.md) | 181 | 26 | **70.7%** | 90.1% | 46.4% | 22.3% |

Across the four Playwright targets, top-six spacing coverage is **70.7–84.8%**:
above the original hand-authored row (**47.7%**) and below Bootstrap (**94.7%**).
Their 4px-grid share varies from **30.0% to 84.5%** even while top-six coverage
remains at least 70.7%; recurring off-grid values such as 3px, 5px, 6px, and 10px
account for part of that separation. Firefox exposes only **two raw spacing lengths**
because its spacing declarations are predominantly token references, so its 100%
top-six result is reported but is too small to use as a concentration estimate.

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| [Firefox `about:debugging`](./corpus/firefox-about-debugging/AUDIT-firefox-about-debugging.md) | 2 | 1 | 100.0% |
| [Playwright Dashboard](./corpus/playwright-dashboard/AUDIT-playwright-dashboard.md) | 52 | 20 | 61.5% |
| [Playwright HTML Report](./corpus/playwright-html-report/AUDIT-playwright-html-report.md) | 15 | 11 | 66.7% |
| [Playwright Recorder](./corpus/playwright-recorder/AUDIT-playwright-recorder.md) | 21 | 16 | 52.4% |
| [Playwright Trace Viewer](./corpus/playwright-trace-viewer/AUDIT-playwright-trace-viewer.md) | 75 | 32 | 42.7% |

Across Playwright, top-six size coverage is **42.7–66.7%**, versus **55%** for
Bootstrap and **23.4%** for the original hand-authored corpus. Within every
Playwright target, size is less concentrated than spacing: the top-six difference
ranges from 17.1 percentage points in the HTML Report to 28.0 points in the Trace
Viewer. Firefox has only **two raw size lengths**, both 24px, so its 100% row is also
reported without treating it as a stable distribution.

These are measurements of the committed app bundles. No scale adjustment or grammar
ruling is made here.
