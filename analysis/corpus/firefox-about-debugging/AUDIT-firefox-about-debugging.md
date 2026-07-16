# CSS scale audit — firefox-about-debugging

Limitations: computed styles not observed; JS-injected styles and CSS-in-JS are not extracted.
Standing assumptions: rem→16px assumed; !important stripped.

Inputs:

- analysis/corpus/firefox-about-debugging/aboutdebugging.css
- analysis/corpus/firefox-about-debugging/dependencies/devtools-variables.css
- analysis/corpus/firefox-about-debugging/dependencies/tokens-brand.css
- analysis/corpus/firefox-about-debugging/dependencies/tokens-shared.css
- analysis/corpus/firefox-about-debugging/src/base.css
- analysis/corpus/firefox-about-debugging/src/components/App.css
- analysis/corpus/firefox-about-debugging/src/components/ProfilerDialog.css
- analysis/corpus/firefox-about-debugging/src/components/RuntimeActions.css
- analysis/corpus/firefox-about-debugging/src/components/RuntimeInfo.css
- analysis/corpus/firefox-about-debugging/src/components/connect/ConnectPage.css
- analysis/corpus/firefox-about-debugging/src/components/connect/ConnectSection.css
- analysis/corpus/firefox-about-debugging/src/components/connect/ConnectSteps.css
- analysis/corpus/firefox-about-debugging/src/components/connect/NetworkLocationsForm.css
- analysis/corpus/firefox-about-debugging/src/components/connect/NetworkLocationsList.css
- analysis/corpus/firefox-about-debugging/src/components/debugtarget/DebugTargetItem.css
- analysis/corpus/firefox-about-debugging/src/components/debugtarget/DebugTargetList.css
- analysis/corpus/firefox-about-debugging/src/components/debugtarget/DebugTargetPane.css
- analysis/corpus/firefox-about-debugging/src/components/debugtarget/ExtensionDetail.css
- analysis/corpus/firefox-about-debugging/src/components/debugtarget/FieldPair.css
- analysis/corpus/firefox-about-debugging/src/components/debugtarget/ServiceWorkerAction.css
- analysis/corpus/firefox-about-debugging/src/components/debugtarget/TemporaryExtensionInstallSection.css
- analysis/corpus/firefox-about-debugging/src/components/shared/IconLabel.css
- analysis/corpus/firefox-about-debugging/src/components/shared/Message.css
- analysis/corpus/firefox-about-debugging/src/components/sidebar/Sidebar.css
- analysis/corpus/firefox-about-debugging/src/components/sidebar/SidebarFixedItem.css
- analysis/corpus/firefox-about-debugging/src/components/sidebar/SidebarItem.css
- analysis/corpus/firefox-about-debugging/src/components/sidebar/SidebarRuntimeItem.css

## Layer 1 — property scope (does the grammar have a *concept* for the property?)

Real-property FAMILY coverage (the ceiling on what an ingestor could express):

| corpus | coverage | theme custom-props |
|---|---|---|
| firefox-about-debugging | 76.7% | 70.1% |

Declarations: 1504 total; 450 real properties; 1054 theme custom properties.
Top uncovered families: height (21), width (15), fill (14), line-height (13), -moz-context-properties (10), column-gap (6), box-sizing (4), syntax (3), inherits (3), initial-value (3), content (3), user-select (2).

## Layer 2 — value distribution (do real values snap to a small scale?)

### SPACING (gap/padding/margin)

| | raw lengths | distinct | top-6 cover | top-12 | on 4px grid | `0` share |
|---|---|---|---|---|---|---|
| firefox-about-debugging | 2 | 2 | 100.0% | 100.0% | 50.0% | 13.2% |

Top spacing values: 12px (1), 9px (1).

### SIZE (width/height/min-max/basis)

| | raw lengths | distinct | top-6 cover |
|---|---|---|---|
| firefox-about-debugging | 2 | 1 | 100.0% |

Top size values: 24px (2).
