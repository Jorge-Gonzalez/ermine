# Dimension and Constraint Pilot

Generated from `reports/adoption/monky/current-ledger.json`.

This pilot implements the first assimilation queue item from `docs/non-ermine.txt`: do
not reject raw sizes as local identity until they have been tested against existing
scales, proportional relationships, or measure/control-size roles.

| metric | count |
| --- | --- |
| dimension/constraint declarations | 36 |
| latent scale | 21 |
| latent word | 8 |
| latent facet | 4 |
| recipe | 3 |
| local identity | 0 |

## By Dimension Intent

| intent | declarations |
| --- | --- |
| icon/control square | 14 |
| inline measure/popover width | 6 |
| dimension constraint | 4 |
| interaction/content floor | 3 |
| bounded dialog/container measure | 2 |
| min-content escape | 2 |
| flex negotiation | 2 |
| scrollable result cap | 2 |
| block-size measure | 1 |

## Candidate Vocabulary Pressure

- control/icon squares: test `square-*`, `icon-*`, or `control-size-*` against 16px,
  18px, 24px, 28px, 2rem, and 3rem before calling them local.
- measures/popovers: test `measure-*`, `popover-measure`, and `dialog-measure`
  roles against 200px, 240px, 280px, 320px, 360px, and the viewport-bounded dialog
  formulas.
- block caps/floors: test `max-block-*`, `scroll-cap-*`, `control-min-block`,
  and `editor-min-block` against result caps and minimum interaction/content floors.
- escapes: keep the remaining `min-height:0`, `width:auto`, `height:0`, and related
  values as facets or layer/specificity repairs, not positive size words. The observed
  `max-width:none` endpoint is now admitted as `max-width-none`.

## Declarations

| source | property | value | intent | latent outcome | scale/proportion mapping | proposed form |
| --- | --- | --- | --- | --- | --- | --- |
| src/content/overlays/deleteConfirm/deleteConfirmStyles.css:2 | min-width | 240px | inline measure/popover width | latent-scale | 6 * spacing-3xl | measure/popover size role |
| src/content/overlays/modal/modalStyles.css:29 | width | min(600px, calc(100vw - 2rem)) | bounded dialog/container measure | latent-word | proportional/viewport relation | dialog-measure recipe with viewport bound |
| src/content/overlays/modal/modalStyles.css:30 | height | min(560px, 85vh) | bounded dialog/container measure | latent-word | proportional/viewport relation | dialog-measure recipe with viewport bound |
| src/content/overlays/modal/modalStyles.css:35 | min-height | 48px | interaction/content floor | latent-scale | 2 * spacing-2xl | control-min-block or editor-min-block |
| src/content/overlays/modal/modalStyles.css:65 | height | 18px | icon/control square | latent-scale | off current named scale | square/icon/control-size scale member |
| src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css:21 | min-width | 200px | inline measure/popover width | latent-scale | 5 * spacing-3xl | measure/popover size role |
| src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css:22 | max-width | 360px | inline measure/popover width | latent-scale | 9 * spacing-3xl | measure/popover size role |
| src/content/overlays/suggestionsOverlay/suggestionsOverlayStyles.css:48 | max-width | 8em | inline measure/popover width | latent-word | content-relative measure | measure/popover size role |
| src/content/overlays/views/macroEditor/editorViewStyles.css:11 | width | 280px | inline measure/popover width | latent-scale | 7 * spacing-3xl | measure/popover size role |
| src/content/overlays/views/macroEditor/editorViewStyles.css:24 | min-height | 0 | min-content escape | latent-facet |  | min-height-none escape, possibly layer/specificity fix |
| src/content/overlays/views/macroEditor/editorViewStyles.css:28 | flex | 1 | flex negotiation | recipe |  | prose/editor-content molecule |
| src/content/overlays/views/macroEditor/editorViewStyles.css:29 | min-height | 0 | min-content escape | recipe |  | prose/editor-content molecule |
| src/content/overlays/views/search/searchViewStyles.css:14 | max-height | 400px | scrollable result cap | latent-scale | 10 * spacing-3xl | max-block/scroll-cap scale |
| src/content/overlays/views/settings/settingsViewStyles.css:20 | height | 0 | block-size measure | latent-facet |  | constraint reset/escape facet |
| src/content/overlays/views/settings/settingsViewStyles.css:25 | width | 2rem | icon/control square | latent-word | 2 * spacing-lg | square/icon/control-size scale member |
| src/content/overlays/views/settings/settingsViewStyles.css:26 | height | 2rem | icon/control square | latent-word | 2 * spacing-lg | square/icon/control-size scale member |
| src/options/options.css:5 | width | 3rem | icon/control square | latent-word | 2 * spacing-2xl | square/icon/control-size scale member |
| src/options/options.css:6 | height | 3rem | icon/control square | latent-word | 2 * spacing-2xl | square/icon/control-size scale member |
| src/options/options.css:7 | flex | 0 0 auto | flex negotiation | latent-facet |  | flex-negotiation facet or shorthand decomposition |
| src/popup/popup.css:6 | width | 320px | inline measure/popover width | latent-scale | 8 * spacing-3xl | measure/popover size role |
| src/popup/popup.css:51 | max-height | 256px | scrollable result cap | latent-scale | 16 * spacing-lg | max-block/scroll-cap scale |
| src/styles/components/content-editor.css:10 | width | 1px | dimension constraint | latent-scale | off current named scale | size/measure scale role |
| src/styles/components/content-editor.css:11 | height | 16px | icon/control square | latent-scale | spacing-lg | square/icon/control-size scale member |
| src/styles/components/content-editor.css:17 | width | 28px | icon/control square | latent-scale | off current named scale | square/icon/control-size scale member |
| src/styles/components/content-editor.css:18 | height | 28px | icon/control square | latent-scale | off current named scale | square/icon/control-size scale member |
| src/styles/components/content-editor.css:34 | width | auto | dimension constraint | latent-facet |  | constraint reset/escape facet |
| src/styles/components/content-editor.css:35 | min-width | 36px | dimension constraint | latent-scale | off current named scale | size/measure scale role |
| src/styles/components/content-editor.css:60 | width | 24px | icon/control square | latent-scale | spacing-2xl | square/icon/control-size scale member |
| src/styles/components/content-editor.css:68 | height | 28px | icon/control square | latent-scale | off current named scale | square/icon/control-size scale member |
| src/styles/components/content-editor.css:74 | min-height | 150px | interaction/content floor | recipe | off current named scale | prose/editor-content molecule |
| src/styles/skin/controls.css:4 | width | 100% | dimension constraint | latent-word | proportional/viewport relation | size/measure scale role |
| src/styles/skin/controls.css:13 | width | 16px | icon/control square | latent-scale | spacing-lg | square/icon/control-size scale member |
| src/styles/skin/controls.css:14 | height | 16px | icon/control square | latent-scale | spacing-lg | square/icon/control-size scale member |
| src/styles/skin/controls.css:23 | width | 16px | icon/control square | latent-scale | spacing-lg | square/icon/control-size scale member |
| src/styles/skin/controls.css:24 | height | 16px | icon/control square | latent-scale | spacing-lg | square/icon/control-size scale member |
| src/styles/skin/controls.css:29 | min-height | 150px | interaction/content floor | latent-scale | off current named scale | control-min-block or editor-min-block |
