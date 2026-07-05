# App-UI corpus provenance

These files are byte-for-byte snapshots of the compiled CSS distributed with
`playwright-core@1.61.1`. They were retrieved from the repository's installed,
lockfile-pinned npm artifact on 2026-07-05; no formatting or normalization was
applied. A public mirror of every distributed file is available under
`https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/`.

Playwright is Apache-2.0 licensed; the distributed license is preserved in
[`PLAYWRIGHT-LICENSE.txt`](./PLAYWRIGHT-LICENSE.txt). Upstream source is the
[`v1.61.1` Playwright release](https://github.com/microsoft/playwright/tree/v1.61.1).

## Targets

| target | public source | retrieved | why it is app UI |
|---|---|---|---|
| Playwright Dashboard | [`lib/vite/dashboard/assets/index-BY2S1tHT.css`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/dashboard/assets/index-BY2S1tHT.css) | 2026-07-05 | An interactive browser-session dashboard with navigation, controls, and stateful work panels. |
| Playwright HTML Report | [`lib/vite/htmlReport/report.css`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/htmlReport/report.css) | 2026-07-05 | A searchable, filterable test-results application with list, detail, error, and attachment views. |
| Playwright Recorder | [`lib/vite/recorder/assets/`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/recorder/assets/) | 2026-07-05 | The Inspector/codegen application: recording controls, call log, locator input, and generated-code editor. |
| Playwright Trace Viewer | [`lib/vite/traceViewer/`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/traceViewer/) | 2026-07-05 | A time-travel debugging application with a timeline and actions, source, console, network, and metadata panels. |

The four targets are separate interactive surfaces but share a product family and
some React/Vite-built UI assets. The comparison therefore tests app-style CSS while
remaining correlated; [`FINDINGS-APPS.md`](../FINDINGS-APPS.md) does not pool the
rows or treat them as four independent design organizations.

## Integrity

```text
4e741ba6be0fb15305f6dfd907e245e68554f6dbd5282a58dcc1e9d2493eb917  playwright-dashboard/index-BY2S1tHT.css
3298f11062d5112516c8b3fa2368c6138b4700aa9fa215bb5fc0a1f0efe94e3f  playwright-html-report/report.css
70bf421a13e87857ca684bfa2cc55f06d7c5a50f71253a3ff1d74769b14a957e  playwright-recorder/codeMirrorModule-DYBRYzYX.css
4278e600a533667369328e9eb52a212693d52e46072ec37228e0ef8621a48ead  playwright-recorder/index-4ZiSSCmn.css
70bf421a13e87857ca684bfa2cc55f06d7c5a50f71253a3ff1d74769b14a957e  playwright-trace-viewer/codeMirrorModule.DYBRYzYX.css
de9c068d0e8043820fe42f30558e972eb7e2a8a45a34f65c7c8f73fa2dbc9fd0  playwright-trace-viewer/defaultSettingsView.CjdS-WJx.css
4ec2a3d49db259ce9025cb4fa48d73b1afd58215e567eef3b4a4cbf76c1674d9  playwright-trace-viewer/index.CzXZzn5A.css
a548cd88f2041433da2d60fd3a33ef23af2fb8ddf2557b7bef79806364498e57  playwright-trace-viewer/uiMode.BZQ54Kgt.css
7c5a01f382f76539fc9b4db6b18e18a7035741845fd14968c5cdc0a7e373d817  playwright-trace-viewer/xtermModule.DYP7pi_n.css
```
