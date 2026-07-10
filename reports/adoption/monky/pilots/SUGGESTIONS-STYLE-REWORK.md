# Monky pilot — suggestions overlay style rework in Ermine terms

This pass follows the state-skin penetration pass by assimilating the rest of the
suggestions overlay and delete-confirm popup skin into Ermine words.

The goal was not pixel preservation. The overlay now follows the same semantic
surface language used by the modal, popup, and editor surfaces while keeping
placement and browser/Shadow-root mechanics local.

## Dissolved into Ermine

| Previous local shape | Ermine expression | Notes |
| --- | --- | --- |
| overlay shell background, border color, radius, type | `ground rule corner-lg font-md` | Moves the shell to the shared surface vocabulary. The type step intentionally adopts Monky's Ermine `font-md` binding. |
| command-list separator color | `rule-soft` | Border width/style remain local. |
| command chip base skin | `ground-subtle ink rule-soft corner-md font-sm` | Base skin travels with hover/selected so component-layer declarations do not mask generated state rules. |
| command chip hover | `hover:ground-defined hover:rule` | Render-verified in `npm run test:styles`. |
| command chip selected | `selected:ground-defined selected:ink-accent selected:rule-accent` | Backed by `aria-selected`. |
| preview text | `padding-block-snug padding-inline-comfortable font-xs ink-soft` | Clamp/overflow mechanics remain local. |
| footer | `horizontal gap-comfortable padding-block-tight padding-inline-comfortable font-xs ink-soft ground rule` | `justify-content:flex-end` remains local because prior U7 rejected Ermine `justify-end` as non-exact. |
| keyboard hints | `corner-sm font-xs ink ground-subtle rule` | Exact tiny padding and monospace identity remain local. |
| delete-confirm message | `padding-block-snug padding-inline-comfortable font-sm ink rule-soft` | Border edge mechanics remain local. |
| delete-confirm command text | `font-semibold ink-accent` | Monospace command identity remains local. |
| delete-confirm cancel option | base chip + normal selected treatment | Shares the suggestion chip vocabulary. |
| delete-confirm danger option | `hover:ground-fail-faint hover:rule-fail selected:ground-fail-faint selected:ink-fail selected:rule-fail` | Replaces the local danger selected rule with role-carrier composition. |

## Reduced but still local

| Selector/pattern | Local remainder | Why it remains local |
| --- | --- | --- |
| `:host`, `#macro-suggestions` | host font family, line-height, fixed positioning, z-index | Shadow-root and host-page escape contract. |
| `.macro-suggestions-container` | shadow, min/max width, overflow, opacity/transform transition, border width/style | Elevation, popup geometry, clipping, and motion remain unruled or product-local. |
| `.macro-suggestions-arrow*` | triangle geometry and side-specific border color | CSS triangle mechanics cannot be expressed by current Ermine carriers. |
| `.macro-suggestions-commands-list` | bottom border width/style | Ermine supplies the `rule-soft` color. |
| `.macro-suggestions-command-item` | min/max width, exact 3px/6px padding, cursor, transition, alignment, nowrap/ellipsis | Chip mechanics and off-scale exact padding. |
| `.macro-suggestions-text-preview` | line clamp and overflow | Text-flow/clamp behavior is still project-local. |
| `.macro-suggestions-footer` | top border width/style and `justify-content:flex-end` | Edge placement and exact justification remain local. |
| `.macro-suggestions-kbd` | exact 1px/4px padding, monospace, border width/style | Keyboard-token identity and off-scale padding. |
| `.delete-confirm-message` | border-bottom width/style | Ermine supplies spacing/type/ink/rule color. |
| `.delete-confirm-command` | monospace | Command identity. |
| `.delete-confirm-option` | `max-width:none` | Delete-confirm option layout contract. |

## Intentionally changed

| Change | Reason |
| --- | --- |
| overlay shell font size now computes to 15px | The shell adopts `font-md`, which Monky binds to its configured Ermine middle type step. |
| footer block padding now uses `padding-block-tight` | The old 6px block padding was off-scale; the rework favors Ermine density vocabulary. |
| delete-confirm message block padding now uses `padding-block-snug` | The old 10px block padding was off-scale. |
| kbd color/background/border now use shared sockets | The old `--kbd-*` colors remain evidence but are no longer this overlay's local skin authority. |

## Follow-up evidence

This pass strengthens the case for future rulings around:

- elevation/shadow as a skin/treatment family;
- arrow/anchored-popover mechanics;
- line clamp/truncation as text-flow vocabulary;
- keyboard-token treatment;
- off-scale micro padding in compact controls.

## Verification

```sh
npm run test:styles
```

The smoke now continues to verify the suggestions command chip's base, hover,
selected, and selected+hover render states after the broader overlay shell
assimilation.
