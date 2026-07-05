# App-UI corpus provenance

These files are byte-for-byte snapshots from three independently maintained app-UI
families. No formatting or normalization was applied.

- Playwright CSS was retrieved from the repository's installed, lockfile-pinned
  `playwright-core@1.61.1` npm artifact on 2026-07-05. A public mirror of every
  distributed file is available under
  `https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/`.
- Firefox `about:debugging` CSS and its directly imported token/DevTools styles
  were retrieved from the installed Firefox 151.0 package on 2026-07-05. That
  package records build ID `20260518133229` and Mozilla source stamp
  `fc12dc911f904307729760a817deb829cbf8feb4`.
- Swagger UI CSS was retrieved from the immutable
  [`swagger-ui-dist@5.31.1`](https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.31.1/swagger-ui.css)
  npm artifact on 2026-07-05.

Playwright is Apache-2.0 licensed; the distributed license is preserved in
[`PLAYWRIGHT-LICENSE.txt`](./PLAYWRIGHT-LICENSE.txt). Upstream source is the
[`v1.61.1` Playwright release](https://github.com/microsoft/playwright/tree/v1.61.1).
Firefox is MPL-2.0 licensed; the license is preserved in
[`FIREFOX-MPL-2.0.txt`](./FIREFOX-MPL-2.0.txt), and the snapshot maps to the
[pinned Mozilla source tree](https://hg.mozilla.org/releases/mozilla-release/file/fc12dc911f904307729760a817deb829cbf8feb4/devtools/client/aboutdebugging).
Swagger UI is Apache-2.0 licensed; the license is preserved in
[`SWAGGER-UI-LICENSE.txt`](./SWAGGER-UI-LICENSE.txt), and upstream source is the
[`v5.31.1` swagger-ui release](https://github.com/swagger-api/swagger-ui/tree/v5.31.1).

## Considered and excluded

Two widely deployed dashboard families cannot be measured by this instrument
(which reads distributed CSS files, a stated limitation):

- **Grafana 13** (checked 2026-07-05 via play.grafana.org): the only linked
  stylesheet, `grafana.app-react19.956286b013bf6a89b7b0.css` from the pinned
  `13.2.0-28666480772` asset build, is 7.4 kB of chart-library (uPlot) styles;
  the application UI is styled with emotion CSS-in-JS at runtime.
- **Home Assistant** (checked 2026-07-05 via demo.home-assistant.io): the
  document links no stylesheet at all; the lit-based frontend injects styles
  into shadow roots from JavaScript.

## Targets

| target | public source | retrieved | why it is app UI |
|---|---|---|---|
| Firefox `about:debugging` | [pinned source directory](https://hg.mozilla.org/releases/mozilla-release/file/fc12dc911f904307729760a817deb829cbf8feb4/devtools/client/aboutdebugging) | 2026-07-05 | A stateful runtime dashboard for connecting devices and inspecting extensions, tabs, and workers. |
| Playwright Dashboard | [`lib/vite/dashboard/assets/index-BY2S1tHT.css`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/dashboard/assets/index-BY2S1tHT.css) | 2026-07-05 | An interactive browser-session dashboard with navigation, controls, and stateful work panels. |
| Playwright HTML Report | [`lib/vite/htmlReport/report.css`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/htmlReport/report.css) | 2026-07-05 | A searchable, filterable test-results application with list, detail, error, and attachment views. |
| Playwright Recorder | [`lib/vite/recorder/assets/`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/recorder/assets/) | 2026-07-05 | The Inspector/codegen application: recording controls, call log, locator input, and generated-code editor. |
| Playwright Trace Viewer | [`lib/vite/traceViewer/`](https://cdn.jsdelivr.net/npm/playwright-core@1.61.1/lib/vite/traceViewer/) | 2026-07-05 | A time-travel debugging application with a timeline and actions, source, console, network, and metadata panels. |
| Swagger UI | [`swagger-ui.css`](https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.31.1/swagger-ui.css) | 2026-07-05 | An interactive API console: operation lists, expandable panels, request forms, and response viewers. |

The Firefox and Swagger UI targets are independent of Playwright and of each other. The four Playwright targets remain
separate interactive surfaces from one product family and share some React/Vite-built
UI assets; [`FINDINGS-APPS.md`](../FINDINGS-APPS.md) does not pool those four rows or
treat them as independent design organizations.

## Integrity

Firefox's 27 CSS snapshots are covered by
[`firefox-about-debugging/SHA256SUMS`](./firefox-about-debugging/SHA256SUMS).
The Playwright snapshot hashes are:

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
9e576f8322132c76949da47f9bb53c891373c303ea3a761ff548ffc9de50a98c  swagger-ui/swagger-ui.css
```
