# U8b uncertain ledger triage

U8b classifies the post-U8 `uncertain` ledger tail by resolution mechanism. It does
not create new Ermine vocabulary, does not rule the skin plane, and does not convert
judgment-heavy records to terminal dispositions.

Source ledger:

| Field | Value |
|---|---|
| Ermine compiler/tooling commit recorded by ledger | `00a0e4f917394bef3892dfc47df6dd5ef164d4f6` |
| Monky implementation commit recorded by ledger | `bd4bc4144dcde47e2c59523f98776585a31220dc` |
| Starting `uncertain` records | 329 |
| Terminal dispositions changed by U8b | 0 |
| Remaining `uncertain` records after U8b | 329 |

The ledger-level `pending` fields remain generic U8 human-gated notes. This report is
the sharper indexed pending note for U8b: every starting uncertain record appears in the
complete mapping below.

## Bucket summary

| Bucket | Count | Automation stance |
|---|---:|---|
| Dead-code candidate | 0 | Safe only after selector/token reachability proves no remaining consumer. No record met that bar in this pass. |
| Existing-Ermine candidate | 93 | Semi-automatable after inverse generated-CSS lookup plus context/computed-style confirmation. |
| Shared-ruling candidate | 150 | Bulk-resolvable after a constitution or skin/theme ruling; not safe to terminally classify one-by-one here. |
| Monky identity-local candidate | 49 | Mostly human/project judgment; automation can only gather evidence. |
| Ermine-evolution candidate | 37 | Gap/ruling evidence; not automatable as terminal adoption. |

## File counts by bucket

| File | Existing-Ermine | Shared-ruling | Identity-local | Ermine-evolution | Dead-code |
|---|---:|---:|---:|---:|---:|
| `src/popup/popup.css` | 0 | 4 | 0 | 0 | 0 |
| `src/styles.css` | 12 | 30 | 9 | 15 | 0 |
| `src/styles/layout-semantic.css` | 73 | 112 | 38 | 22 | 0 |
| `src/styles/pageStyles.css` | 3 | 4 | 2 | 0 | 0 |
| `src/styles/utilities.css` | 5 | 0 | 0 | 0 | 0 |

## Property-family counts by bucket

### Existing-Ermine candidates

| Property family | Count |
|---|---:|
| `padding` | 25 |
| `display` | 16 |
| `margin` | 12 |
| `align-items` | 10 |
| `margin-bottom` | 8 |
| `justify-content` | 6 |
| `gap` | 4 |
| `flex` | 3 |
| `flex-direction` | 2 |
| `position` | 2 |
| `padding-left` | 2 |
| `flex-flow` | 1 |
| `margin-right` | 1 |
| `margin-top` | 1 |

These are candidates because the property family is already covered by structural
grammar, or because the current Monky markup now carries generated structural words for
the same role. They still need context confirmation before terminal classification:
for example, a `padding` declaration may be grammar when it is layout rhythm, but
identity when it encodes a component affordance.

### Shared-ruling candidates

| Property family | Count |
|---|---:|
| `color` | 23 |
| `background-color` | 16 |
| `font-size` | 15 |
| `font-family` | 11 |
| `border-radius` | 9 |
| `font-weight` | 9 |
| `border` | 8 |
| custom spacing tokens | 7 |
| custom radius tokens | 6 |
| `line-height` | 5 |
| `background` | 4 |
| `border-color` | 4 |
| `font-style` | 4 |
| custom text tokens | 8 |
| `box-shadow` | 3 |
| `box-sizing` | 3 |
| `text-decoration` | 3 |
| custom transition tokens | 2 |
| `font-optical-sizing` | 2 |
| `--tw-ring-color` | 1 |
| `border-bottom` | 1 |
| `border-left` | 1 |
| `border-top` | 1 |
| `font-display` | 1 |
| `margin` | 1 |
| `padding` | 1 |
| `src` | 1 |

These should be resolved by rulings, not by opportunistic per-record judgment. The
largest groups are theme sockets/scales, surface/ink/rule treatment, type treatment,
and base substrate defaults.

### Monky identity-local candidates

| Property family | Count |
|---|---:|
| `width` | 6 |
| `transition` | 6 |
| `cursor` | 5 |
| `flex-shrink` | 5 |
| `outline` | 4 |
| `height` | 3 |
| `min-height` | 3 |
| `overflow` | 3 |
| `list-style-type` | 2 |
| `text-align` | 2 |
| `content` | 1 |
| `left` | 1 |
| `max-height` | 1 |
| `max-width` | 1 |
| `min-width` | 1 |
| `overflow-x` | 1 |
| `overflow-y` | 1 |
| `pointer-events` | 1 |
| `top` | 1 |
| `z-index` | 1 |

These are likely component contracts: popup width, editor control dimensions, menu
positioning, list behavior, exact overflow, and rich-text editor affordances.

### Ermine-evolution candidates

| Property family | Count |
|---|---:|
| scrollbar selectors/properties | 23 |
| motion/status opacity and transforms | 11 |
| `animation` | 1 |
| selection/caret opacity | 2 |

These are evidence for future Ermine questions: explicit scrollbar prominence,
motion/status treatment, and whether opacity belongs to a treatment plane.

## Same-ruling groups

These groups are non-terminal. They identify places where one later ruling could resolve
many records safely.

| Group | Records | Controlling question |
|---|---:|---|
| Theme metric sockets | 23 | Are spacing, radius, text-size, and transition scales project-side tokens, Ermine theme-plane sockets, or both with a generated socket contract? |
| Base substrate defaults | 16 | Does Ermine own baseline host/body typography, box sizing, input inheritance, and base tone/ink defaults, or are they project substrate? |
| Type/ink treatment | 55 | Are font family, optical sizing, size, weight, line height, text decoration, and ink prominence Ermine skin vocabulary or Monky-local skin? |
| Surface/rule/corner treatment | 66 | Are backgrounds, borders, border colors, shadows, separator pressure, and corner intensity Ermine skin vocabulary or Monky-local skin? |
| Scrollbar prominence | 23 | Does Ermine name scrollbars as explicit UI affordances, including track/thumb colors, width, radius, and hover treatment? |
| Motion/status treatment | 12 | Does Ermine name motion/status treatments such as shake, flash, opacity, and transition timing, or leave them local? |
| Rich-text editor content defaults | 45 | Are editor-body document defaults grammar/type skin, or are they a component-local editing contract? |

The group counts overlap because one declaration can be evidence for both a concrete
property family and a broader proposal family. The complete mapping below remains
single-bucketed so ledger conservation stays exact.

## Automation candidates

Safe automation can be added after U8b, but each class needs a guard:

- **Dead-code automation:** require static token reachability plus selector reachability.
  File deletion alone is insufficient because many records were relocated to skin or
  component sheets.
- **Existing-Ermine automation:** require generated-CSS inverse lookup, lawful word
  composition, and selector/context confirmation. For high-risk cases, add computed-style
  equality.
- **Shared-ruling automation:** only after a controlling ruling lands. Then records can
  be bulk-marked by property family and selector role.
- **Identity-local automation:** do not terminally automate. Generate candidate lists
  for human review.
- **Ermine-evolution automation:** do not terminally automate. Generate Gap Report or
  skin-evidence inputs.

## Complete indexed mapping

### Dead-code candidate — 0 records

No record is terminally safe to call dead from U8b evidence alone.

### Existing-Ermine candidate — 93 records

- `src/styles.css::.macro-search-input-container::padding::1`
- `src/styles.css::.macro-search-input::padding::1`
- `src/styles.css::.macro-search-results::padding::1`
- `src/styles.css::.macro-search-empty::padding::1`
- `src/styles.css::.macro-search-item::padding::1`
- `src/styles.css::.macro-search-item-command::margin-bottom::1`
- `src/styles.css::.macro-search-footer::padding::1`
- `src/styles.css::.macro-search-footer::display::1`
- `src/styles.css::.macro-search-footer::justify-content::1`
- `src/styles.css::.macro-search-kbd::display::1`
- `src/styles.css::.macro-search-kbd::padding::1`
- `src/styles.css::.macro-search-kbd::margin::1`
- `src/styles/layout-semantic.css::.align-start::align-items::1`
- `src/styles/layout-semantic.css::.align-end::align-items::1`
- `src/styles/layout-semantic.css::.justify-start::justify-content::1`
- `src/styles/layout-semantic.css::.justify-end::justify-content::1`
- `src/styles/layout-semantic.css::.section::padding::1`
- `src/styles/layout-semantic.css::.section::margin-bottom::1`
- `src/styles/layout-semantic.css::.section-title::margin::1`
- `src/styles/layout-semantic.css::.section-description::margin::1`
- `src/styles/layout-semantic.css::.label::display::1`
- `src/styles/layout-semantic.css::.label::margin-bottom::1`
- `src/styles/layout-semantic.css::.input::padding::1`
- `src/styles/layout-semantic.css::.radio::margin-right::1`
- `src/styles/layout-semantic.css::.content-editor::display::1`
- `src/styles/layout-semantic.css::.content-editor::flex-direction::1`
- `src/styles/layout-semantic.css::.ce-toolbar::display::1`
- `src/styles/layout-semantic.css::.ce-toolbar::flex-flow::1`
- `src/styles/layout-semantic.css::.ce-toolbar::align-items::1`
- `src/styles/layout-semantic.css::.ce-toolbar::gap::1`
- `src/styles/layout-semantic.css::.ce-toolbar::padding::1`
- `src/styles/layout-semantic.css::.ce-toolbar-sep::margin::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::display::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::align-items::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::justify-content::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::padding::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn svg::display::1`
- `src/styles/layout-semantic.css::.ce-toolbar-icon::display::1`
- `src/styles/layout-semantic.css::.ce-toolbar-icon::align-items::1`
- `src/styles/layout-semantic.css::.ce-toolbar-icon::padding::1`
- `src/styles/layout-semantic.css::.ce-style-menu::position::1`
- `src/styles/layout-semantic.css::.ce-style-caret::display::1`
- `src/styles/layout-semantic.css::.ce-style-caret::align-items::1`
- `src/styles/layout-semantic.css::.ce-style-caret svg::display::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::position::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::padding::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::display::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::flex-direction::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::gap::1`
- `src/styles/layout-semantic.css::.ce-style-option::display::1`
- `src/styles/layout-semantic.css::.ce-style-option::align-items::1`
- `src/styles/layout-semantic.css::.ce-style-option::gap::1`
- `src/styles/layout-semantic.css::.ce-style-option::padding::1`
- `src/styles/layout-semantic.css::.ce-style-option-label::flex::1`
- `src/styles/layout-semantic.css::.ce-link-field::display::1`
- `src/styles/layout-semantic.css::.ce-link-field::align-items::1`
- `src/styles/layout-semantic.css::.ce-link-field::gap::1`
- `src/styles/layout-semantic.css::.ce-link-field::flex::1`
- `src/styles/layout-semantic.css::.ce-link-input::flex::1`
- `src/styles/layout-semantic.css::.ce-link-input::padding::1`
- `src/styles/layout-semantic.css::.content-editor-body::padding::1`
- `src/styles/layout-semantic.css::.content-editor-body p::margin-bottom::1`
- `src/styles/layout-semantic.css::.content-editor-body p:last-child::margin-bottom::1`
- `src/styles/layout-semantic.css::.content-editor-body h1::margin::1`
- `src/styles/layout-semantic.css::.content-editor-body h2::margin::1`
- `src/styles/layout-semantic.css::.content-editor-body h3::margin::1`
- `src/styles/layout-semantic.css::.content-editor-body h1:first-child, .content-editor-body h2:first-child, .content-editor-body h3:first-child::margin-top::1`
- `src/styles/layout-semantic.css::.content-editor-body code::padding::1`
- `src/styles/layout-semantic.css::.content-editor-body pre::padding::1`
- `src/styles/layout-semantic.css::.content-editor-body pre::margin::1`
- `src/styles/layout-semantic.css::.content-editor-body blockquote::padding-left::1`
- `src/styles/layout-semantic.css::.content-editor-body blockquote::margin::1`
- `src/styles/layout-semantic.css::.content-editor .content-editor-body ul, .content-editor .content-editor-body ol::padding-left::1`
- `src/styles/layout-semantic.css::.content-editor .content-editor-body ul, .content-editor .content-editor-body ol::margin-bottom::1`
- `src/styles/layout-semantic.css::.content-editor-body li::display::1`
- `src/styles/layout-semantic.css::.content-editor-body li::margin-bottom::1`
- `src/styles/layout-semantic.css::.btn::padding::1`
- `src/styles/layout-semantic.css::.btn-link::padding::1`
- `src/styles/layout-semantic.css::.btn-link-danger::padding::1`
- `src/styles/layout-semantic.css::.button-group::display::1`
- `src/styles/layout-semantic.css::.alert::padding::1`
- `src/styles/layout-semantic.css::.alert::margin-bottom::1`
- `src/styles/layout-semantic.css::.card::padding::1`
- `src/styles/layout-semantic.css::.empty-state::padding::1`
- `src/styles/layout-semantic.css::.divider::margin::1`
- `src/styles/pageStyles.css::.page-container::padding::1`
- `src/styles/pageStyles.css::.page-container::margin::1`
- `src/styles/pageStyles.css::.page-title::margin::1`
- `src/styles/utilities.css::.inline::display::1`
- `src/styles/utilities.css::.items-start::align-items::1`
- `src/styles/utilities.css::.items-end::align-items::1`
- `src/styles/utilities.css::.justify-start::justify-content::1`
- `src/styles/utilities.css::.justify-end::justify-content::1`

### Shared-ruling candidate — 150 records

- `src/popup/popup.css::.popup-container::background-color::1`
- `src/popup/popup.css::.popup-container::color::1`
- `src/popup/popup.css::.dark .popup-toggle-bg:focus-within::--tw-ring-color::1`
- `src/popup/popup.css::.dark .popup-toggle-knob::border-color::1`
- `src/styles.css::.macro-search-input::border::1`
- `src/styles.css::.macro-search-input::border-radius::1`
- `src/styles.css::.macro-search-input::font-size::1`
- `src/styles.css::.macro-search-input::background::1`
- `src/styles.css::.macro-search-input::color::1`
- `src/styles.css::.macro-search-input:focus::border-color::1`
- `src/styles.css::.macro-search-empty::color::1`
- `src/styles.css::.macro-search-empty::font-style::1`
- `src/styles.css::.macro-search-item::border-bottom::1`
- `src/styles.css::.macro-search-item:hover, .macro-search-item.selected::background-color::1`
- `src/styles.css::.macro-search-item-command::font-family::1`
- `src/styles.css::.macro-search-item-command::font-weight::1`
- `src/styles.css::.macro-search-item-command::color::1`
- `src/styles.css::.macro-search-item-text::color::1`
- `src/styles.css::.macro-search-item-text::font-size::1`
- `src/styles.css::.macro-search-item-text::line-height::1`
- `src/styles.css::.macro-search-footer::border-top::1`
- `src/styles.css::.macro-search-footer::background-color::1`
- `src/styles.css::.macro-search-footer::font-size::1`
- `src/styles.css::.macro-search-footer::color::1`
- `src/styles.css::.macro-search-kbd::background-color::1`
- `src/styles.css::.macro-search-kbd::border::1`
- `src/styles.css::.macro-search-kbd::border-radius::1`
- `src/styles.css::.macro-search-kbd::font-family::1`
- `src/styles.css::.macro-search-kbd::font-size::1`
- `src/styles.css::body::font-family::1`
- `src/styles.css::body::background-color::1`
- `src/styles.css::body::color::1`
- `src/styles.css::body::margin::1`
- `src/styles.css::body::padding::1`
- `src/styles/layout-semantic.css::@font-face::font-family::1`
- `src/styles/layout-semantic.css::@font-face::src::1`
- `src/styles/layout-semantic.css::@font-face::font-weight::1`
- `src/styles/layout-semantic.css::@font-face::font-style::1`
- `src/styles/layout-semantic.css::@font-face::font-display::1`
- `src/styles/layout-semantic.css:::root, :host::--spacing-xs::1`
- `src/styles/layout-semantic.css:::root, :host::--spacing-sm::1`
- `src/styles/layout-semantic.css:::root, :host::--spacing-md::1`
- `src/styles/layout-semantic.css:::root, :host::--spacing-lg::1`
- `src/styles/layout-semantic.css:::root, :host::--spacing-xl::1`
- `src/styles/layout-semantic.css:::root, :host::--spacing-2xl::1`
- `src/styles/layout-semantic.css:::root, :host::--spacing-3xl::1`
- `src/styles/layout-semantic.css:::root, :host::--radius-sm::1`
- `src/styles/layout-semantic.css:::root, :host::--radius-md::1`
- `src/styles/layout-semantic.css:::root, :host::--radius-lg::1`
- `src/styles/layout-semantic.css:::root, :host::--radius-xl::1`
- `src/styles/layout-semantic.css:::root, :host::--radius-2xl::1`
- `src/styles/layout-semantic.css:::root, :host::--radius-3xl::1`
- `src/styles/layout-semantic.css:::root, :host::--text-xs::1`
- `src/styles/layout-semantic.css:::root, :host::--text-sm::1`
- `src/styles/layout-semantic.css:::root, :host::--text-base::1`
- `src/styles/layout-semantic.css:::root, :host::--text-md::1`
- `src/styles/layout-semantic.css:::root, :host::--text-lg::1`
- `src/styles/layout-semantic.css:::root, :host::--text-xl::1`
- `src/styles/layout-semantic.css:::root, :host::--text-2xl::1`
- `src/styles/layout-semantic.css:::root, :host::--text-3xl::1`
- `src/styles/layout-semantic.css:::root, :host::--transition-fast::1`
- `src/styles/layout-semantic.css:::root, :host::--transition-medium::1`
- `src/styles/layout-semantic.css::*::box-sizing::1`
- `src/styles/layout-semantic.css::*::line-height::1`
- `src/styles/layout-semantic.css:::host::box-sizing::1`
- `src/styles/layout-semantic.css:::host::font-family::1`
- `src/styles/layout-semantic.css:::host::font-optical-sizing::1`
- `src/styles/layout-semantic.css:::host::line-height::1`
- `src/styles/layout-semantic.css::body::font-family::1`
- `src/styles/layout-semantic.css::body::font-optical-sizing::1`
- `src/styles/layout-semantic.css:::host *::box-sizing::1`
- `src/styles/layout-semantic.css:::host *::line-height::1`
- `src/styles/layout-semantic.css::input, textarea, button, select, optgroup::font-family::1`
- `src/styles/layout-semantic.css::.editor-content::color::1`
- `src/styles/layout-semantic.css::.content-editor::background-color::1`
- `src/styles/layout-semantic.css::.ce-toolbar::background-color::1`
- `src/styles/layout-semantic.css::.ce-toolbar-sep::background-color::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::border::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::border-radius::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::background::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::color::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn:hover::background-color::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn:hover::color::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn.is-active::background-color::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn.is-active::color::1`
- `src/styles/layout-semantic.css::.ce-toolbar-icon::color::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::background-color::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::border::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::border-radius::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::box-shadow::1`
- `src/styles/layout-semantic.css::.ce-style-option::border::1`
- `src/styles/layout-semantic.css::.ce-style-option::border-radius::1`
- `src/styles/layout-semantic.css::.ce-style-option::background::1`
- `src/styles/layout-semantic.css::.ce-style-option::color::1`
- `src/styles/layout-semantic.css::.ce-style-option::font-size::1`
- `src/styles/layout-semantic.css::.ce-style-option:hover::background-color::1`
- `src/styles/layout-semantic.css::.ce-style-option.is-active::color::1`
- `src/styles/layout-semantic.css::.ce-style-option.is-active::background-color::1`
- `src/styles/layout-semantic.css::.ce-style-option-short::font-size::1`
- `src/styles/layout-semantic.css::.ce-style-option-short::font-weight::1`
- `src/styles/layout-semantic.css::.ce-style-option-short::color::1`
- `src/styles/layout-semantic.css::.ce-style-option.is-active .ce-style-option-short::color::1`
- `src/styles/layout-semantic.css::.ce-link-input::border::1`
- `src/styles/layout-semantic.css::.ce-link-input::border-radius::1`
- `src/styles/layout-semantic.css::.ce-link-input::background-color::1`
- `src/styles/layout-semantic.css::.ce-link-input::color::1`
- `src/styles/layout-semantic.css::.ce-link-input::font-size::1`
- `src/styles/layout-semantic.css::.ce-link-input:focus::border-color::1`
- `src/styles/layout-semantic.css::.ce-link-input:focus::box-shadow::1`
- `src/styles/layout-semantic.css::.content-editor-body::color::1`
- `src/styles/layout-semantic.css::.content-editor-body::font-size::1`
- `src/styles/layout-semantic.css::.content-editor-body::border::1`
- `src/styles/layout-semantic.css::.content-editor-body::border-radius::1`
- `src/styles/layout-semantic.css::.content-editor-body::font-family::1`
- `src/styles/layout-semantic.css::.content-editor-body::line-height::1`
- `src/styles/layout-semantic.css::.content-editor-body:focus::border-color::1`
- `src/styles/layout-semantic.css::.content-editor-body:focus::box-shadow::1`
- `src/styles/layout-semantic.css::.content-editor-body:empty::before::color::1`
- `src/styles/layout-semantic.css::.content-editor-body h1::font-size::1`
- `src/styles/layout-semantic.css::.content-editor-body h1::font-weight::1`
- `src/styles/layout-semantic.css::.content-editor-body h2::font-size::1`
- `src/styles/layout-semantic.css::.content-editor-body h2::font-weight::1`
- `src/styles/layout-semantic.css::.content-editor-body h3::font-size::1`
- `src/styles/layout-semantic.css::.content-editor-body h3::font-weight::1`
- `src/styles/layout-semantic.css::.content-editor-body strong, .content-editor-body b::font-weight::1`
- `src/styles/layout-semantic.css::.content-editor-body em, .content-editor-body i::font-style::1`
- `src/styles/layout-semantic.css::.content-editor-body u::text-decoration::1`
- `src/styles/layout-semantic.css::.content-editor-body s::text-decoration::1`
- `src/styles/layout-semantic.css::.content-editor-body code::font-family::1`
- `src/styles/layout-semantic.css::.content-editor-body code::font-size::1`
- `src/styles/layout-semantic.css::.content-editor-body code::background-color::1`
- `src/styles/layout-semantic.css::.content-editor-body code::color::1`
- `src/styles/layout-semantic.css::.content-editor-body code::border-radius::1`
- `src/styles/layout-semantic.css::.content-editor-body pre::font-family::1`
- `src/styles/layout-semantic.css::.content-editor-body pre::font-size::1`
- `src/styles/layout-semantic.css::.content-editor-body pre::background-color::1`
- `src/styles/layout-semantic.css::.content-editor-body pre::border-radius::1`
- `src/styles/layout-semantic.css::.content-editor-body blockquote::border-left::1`
- `src/styles/layout-semantic.css::.content-editor-body blockquote::color::1`
- `src/styles/layout-semantic.css::.content-editor-body blockquote::font-style::1`
- `src/styles/layout-semantic.css::.content-editor-body a::color::1`
- `src/styles/layout-semantic.css::.content-editor-body a::text-decoration::1`
- `src/styles/layout-semantic.css::.panel-button::border::1`
- `src/styles/layout-semantic.css::.panel-button::background::1`
- `src/styles/layout-semantic.css::.panel-button::font-weight::1`
- `src/styles/layout-semantic.css::.panel-button::font-size::1`
- `src/styles/pageStyles.css::.page-title::font-size::1`
- `src/styles/pageStyles.css::.page-title::font-weight::1`
- `src/styles/pageStyles.css::.page-title::font-family::1`
- `src/styles/pageStyles.css::.page-title::color::1`

### Monky identity-local candidate — 49 records

- `src/styles.css::.macro-search-input::width::1`
- `src/styles.css::.macro-search-input::outline::1`
- `src/styles.css::.macro-search-input::transition::1`
- `src/styles.css::.macro-search-results::max-height::1`
- `src/styles.css::.macro-search-results::overflow-y::1`
- `src/styles.css::.macro-search-empty::text-align::1`
- `src/styles.css::.macro-search-item::cursor::1`
- `src/styles.css::.macro-search-item::transition::1`
- `src/styles.css::.popup-container::width::1`
- `src/styles/layout-semantic.css::.min-selected-1 > .is-selected:only-of-type::cursor::1`
- `src/styles/layout-semantic.css::.shake::transition::1`
- `src/styles/layout-semantic.css::.editor-content::min-height::1`
- `src/styles/layout-semantic.css::.editor-content::outline::1`
- `src/styles/layout-semantic.css::.editor-content::overflow::1`
- `src/styles/layout-semantic.css::.content-editor::overflow::1`
- `src/styles/layout-semantic.css::.ce-toolbar::flex-shrink::1`
- `src/styles/layout-semantic.css::.ce-toolbar-sep::width::1`
- `src/styles/layout-semantic.css::.ce-toolbar-sep::height::1`
- `src/styles/layout-semantic.css::.ce-toolbar-sep::flex-shrink::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::width::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::height::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::cursor::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::transition::1`
- `src/styles/layout-semantic.css::.ce-toolbar-btn::flex-shrink::1`
- `src/styles/layout-semantic.css::.ce-toolbar-icon::flex-shrink::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::top::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::left::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::z-index::1`
- `src/styles/layout-semantic.css::.ce-style-dropdown::min-width::1`
- `src/styles/layout-semantic.css::.ce-style-option::width::1`
- `src/styles/layout-semantic.css::.ce-style-option::cursor::1`
- `src/styles/layout-semantic.css::.ce-style-option::text-align::1`
- `src/styles/layout-semantic.css::.ce-style-option::transition::1`
- `src/styles/layout-semantic.css::.ce-style-option-short::width::1`
- `src/styles/layout-semantic.css::.ce-style-option-short::flex-shrink::1`
- `src/styles/layout-semantic.css::.ce-link-input::height::1`
- `src/styles/layout-semantic.css::.ce-link-input::outline::1`
- `src/styles/layout-semantic.css::.content-editor-body::min-height::1`
- `src/styles/layout-semantic.css::.content-editor-body::outline::1`
- `src/styles/layout-semantic.css::.content-editor-body::overflow::1`
- `src/styles/layout-semantic.css::.content-editor-body:empty::before::content::1`
- `src/styles/layout-semantic.css::.content-editor-body:empty::before::pointer-events::1`
- `src/styles/layout-semantic.css::.content-editor-body pre::overflow-x::1`
- `src/styles/layout-semantic.css::.content-editor .content-editor-body ul::list-style-type::1`
- `src/styles/layout-semantic.css::.content-editor .content-editor-body ol::list-style-type::1`
- `src/styles/layout-semantic.css::.panel-button::cursor::1`
- `src/styles/layout-semantic.css::.panel-button::transition::1`
- `src/styles/pageStyles.css::.page-container::max-width::1`
- `src/styles/pageStyles.css::.page-container::min-height::1`

### Ermine-evolution candidate — 37 records

- `src/styles.css::.macro-search-results::scrollbar-width::1`
- `src/styles.css::.macro-search-results::scrollbar-color::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar::width::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar::height::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar-track::background::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar-track::border-radius::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar-thumb::background::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar-thumb::border-radius::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar-thumb::border::1`
- `src/styles.css::.macro-search-results::-webkit-scrollbar-thumb:hover::background::1`
- `src/styles.css::.dark .macro-search-results::scrollbar-color::1`
- `src/styles.css::.dark .macro-search-results::-webkit-scrollbar-track::background::1`
- `src/styles.css::.dark .macro-search-results::-webkit-scrollbar-thumb::background::1`
- `src/styles.css::.dark .macro-search-results::-webkit-scrollbar-thumb::border::1`
- `src/styles.css::.dark .macro-search-results::-webkit-scrollbar-thumb:hover::background::1`
- `src/styles/layout-semantic.css:::root, :host::scrollbar-color::1`
- `src/styles/layout-semantic.css::@keyframes shake > 10%, 90%::transform::1`
- `src/styles/layout-semantic.css::@keyframes shake > 20%, 80%::transform::1`
- `src/styles/layout-semantic.css::@keyframes shake > 30%, 50%, 70%::transform::1`
- `src/styles/layout-semantic.css::@keyframes shake > 40%, 60%::transform::1`
- `src/styles/layout-semantic.css::@keyframes pulse > 0%, 100%::transform::1`
- `src/styles/layout-semantic.css::@keyframes pulse > 50%::transform::1`
- `src/styles/layout-semantic.css::@keyframes flash > 0%, 100%::opacity::1`
- `src/styles/layout-semantic.css::@keyframes flash > 50%::opacity::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar::width::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar::height::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar-track::background::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar-track::border-radius::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar-thumb::background::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar-thumb::border-radius::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar-thumb::border::1`
- `src/styles/layout-semantic.css::::-webkit-scrollbar-thumb:hover::background::1`
- `src/styles/layout-semantic.css::.min-selected-1 > .is-selected:only-of-type::opacity::1`
- `src/styles/layout-semantic.css::.min-selected-1 > .is-selected:only-of-type:hover::opacity::1`
- `src/styles/layout-semantic.css::.shake::animation::1`
- `src/styles/layout-semantic.css::.ce-style-caret::opacity::1`
- `src/styles/layout-semantic.css::.content-editor-body a:hover::opacity::1`

## Next resolution path

U9 should not try to resolve the 329 records as one flat list. The order should:

1. terminally mark any records proven dead by reachability checks;
2. run inverse generated-CSS matching over the 93 existing-Ermine candidates;
3. ask for shared rulings before touching the 150 shared-ruling candidates;
4. treat the 49 identity-local candidates as Monky component ownership unless a human
   chooses to generalize a pattern;
5. feed the 37 Ermine-evolution candidates into Gap Reports or the skin/theme proposal,
   especially scrollbar prominence and motion/status treatment.
