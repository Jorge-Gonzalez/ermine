# Monky pilot — popup style rework in Ermine terms

This log records the popup pass after the modal search/settings/editor reworks. Unlike
the first search pass, this one intentionally assimilates the popup toward the shared
Ermine/Monky style language rather than preserving its older utility look exactly.

No new project config variable was added. The popup adopted existing Ermine words and
the current Monky theme bindings.

## Dissolved into Ermine

| Previous local / utility shape | Ermine expression | Notes |
| --- | --- | --- |
| popup root background and ink | `ground ink` | Root still keeps fixed popup width locally. |
| popup title `text-lg font-bold` | `font-lg font-bold ink` | Uses Ermine type/weight namespace. |
| new/edit primary button skin | `ground-accent ink-inverse corner-md font-*` | The old edit button's bespoke yellow was intentionally assimilated to accent. |
| delete button skin | `ground-fail ink-inverse corner-md font-sm` | Uses role carrier instead of legacy danger button class. |
| theme switcher button skin | `ground-subtle ink rule corner-md font-sm` | Button mechanics remain local. |
| popup search input skin/type | `ground-subtle ink rule-accent-soft corner-md font-md` | Input mechanics are local; visual vocabulary matches modal search. |
| result item rule color | `rule-soft` | Border width/style remain local. |
| result command type/weight/ink | `font-md font-bold ink-accent` | No longer uses popup-specific text utilities. |
| result text and empty state | `font-sm ink-soft` | Ellipsis remains local. |
| card and section surfaces | `ground rule corner-md` / `ground-subtle rule corner-md` | Border width/style remain local. |
| expanded macro text surface | `font-sm ink ground-subtle padding-snug corner-md` | White-space behavior remains local. |
| site-toggle label text | `font-medium ink`, `font-xs ink-soft` | Hostname truncation remains local. |

## Reduced but still local

| Selector/pattern | Local remainder | Why it remains local |
| --- | --- | --- |
| `.popup-container` | fixed 320px width | Extension popup identity/viewport contract. |
| `.popup-button`, `.popup-icon-button` | border reset, cursor, hover opacity, transition | Button interaction mechanics; Ermine supplies skin/type/corner. |
| `.popup-search-input` | width, border width/style, outline, box sizing, focus ring | Input mechanics and focus treatment remain local. |
| `.popup-item-toggle` | full-width button, transparent reset, left alignment | Disclosure control behavior. |
| `.popup-item-detail` | single-side margin/padding and top border width/style | Relationship/rhythm and separator mechanics. |
| `.popup-macro-text` | `white-space: pre-wrap` and margin reset | Content rendering contract. |
| `.popup-results` | max-height, overflow, list reset, scrollbar styling | Popup list viewport and browser scrollbar skin. |
| `.popup-result-item` | bottom border width/style | Ermine supplies `rule-soft`; CSS supplies the edge mechanism. |
| `.popup-toggle-label` and inline switch styles | switch geometry and runtime checked position | Product-specific toggle mechanic. |
| `.popup-truncate` | overflow/ellipsis/nowrap | Text clipping behavior, still unruled. |

## Currently incompatible or intentionally local

| Style shape | Current reason |
| --- | --- |
| popup scrollbar colors and WebKit pseudo-elements | Scrollbar presentation is not currently Ermine vocabulary. |
| inline switch geometry and knob movement | Runtime component mechanic; not a static Ermine word. |
| hover opacity for popup buttons | Generic treatment/motion not yet ruled for Ermine. |
| text truncation utility | No ruled text-overflow facet. |
| old monospace command treatment | Removed rather than preserved; popup now follows the shared accent/type treatment. |
| old yellow edit button | Removed rather than preserved; popup now uses shared accent semantics. |

## Follow-up for U8f

The popup contributes evidence for:

- scrollbar treatment as an open skin/control family;
- toggle/switch treatment as component-local unless it recurs broadly;
- separator mechanics where Ermine owns color (`rule-*`) but not edge placement;
- whether truncation should remain project-local or become a text-flow facet.
