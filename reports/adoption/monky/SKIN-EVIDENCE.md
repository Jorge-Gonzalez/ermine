# Monky skin evidence checkpoint

Status: evidence checkpoint after U5. No vocabulary here is a constitution ruling, and
no Monky class should use these proposal words until U-SKIN produces a ruling and the
registry/generated artifacts land in Ermine.

This is a cumulative document: U-SKIN extends it with per-order sections after U6–U8.
Earlier evidence is never overwritten.

## Provenance

| Evidence | Source |
|---|---|
| Modal/search pilot report | `reports/adoption/monky/pilots/MODAL-SEARCH.md` |
| Modal/search pilot evidence commit | `63f3dae docs(adoption): record modal search pilot` |
| Skin grammar proposal | `docs/SKIN-GRAMMAR-PROPOSAL.md` |
| Skin grammar proposal commit | `af95f08 docs(skin): propose evidence-stage grammar` |
| Measured Monky U5 result | `73e582c0da73db506bbddcfe5953ada1832e55d0` |
| Visual evidence | User-provided modal/search old-vs-intended screenshot pair |

The screenshot pair is evidence for intended Monky skin direction only. It is not a
new Ermine source of truth and does not override the U5 computed-style preservation
claim.

## U5 seed counts

The modal/search pilot conserved 172 baseline declarations. U5 migrated 37 structural
declarations to existing Ermine grammar, removed 8 dead declarations, and retained 127
local residuals. Of those residuals, 78 were classified `skin-local`.

U5 `skin-local` property-family seed:

| Property family | Count |
|---|---:|
| `color` | 20 |
| `background-color` | 10 |
| `font-size` | 8 |
| `border` | 5 |
| `border-radius` | 5 |
| `background` | 4 |
| `border-bottom` | 4 |
| `font-weight` | 3 |
| `opacity` | 3 |
| `transition` | 3 |
| `box-shadow` | 2 |
| `font-family` | 2 |
| `font-style` | 2 |
| `border-bottom-color` | 1 |
| `border-color` | 1 |
| `border-top` | 1 |
| `font-variant-numeric` | 1 |
| `mix-blend-mode` | 1 |
| `outline` | 1 |
| `text-align` | 1 |

These counts are descriptive. They show where skin pressure appears in one pilot
surface; they do not prove admission into Ermine.

## Visual direction captured from U5.1 discussion

The intended modal/search direction is not a layout grammar change. It is a skin
posture that can be described without binding exact colors or numbers:

- surface-led hierarchy rather than section-heavy borders;
- fewer visible separators among UI sections;
- delimited input and navigation controls through ground shift plus round/pill shape;
- icon-forward toolbar behavior, with labels reduced or removed where the command set
  is already recognizable;
- stronger contrast and prominence for command text and important marks;
- softer secondary text and footer hints;
- explicit scrollbar affordance, where the scrollbar claims real estate instead of
  disappearing into the background.

This is the first Monky evidence for the proposal families:

| Proposal family | U5.1 evidence shape | Current disposition |
|---|---|---|
| `ground` | modal, input, nav, row, and footer surfaces need named salience relationships | descriptive only |
| `ink` | command, description, footer, icon, and muted hint marks need prominence relationships | descriptive only |
| `rule` | old skin used many section rules; intended skin removes or quiets them | descriptive only |
| `corner` | input, modal shell, toolbar controls, edit buttons, and keyboard caps carry personality through radius | descriptive only |
| `treatments` | active/focus/selection/hover are composed visual effects, not just single values | descriptive only |
| `scroller` | intended scrollbar is explicit UI, not hidden mechanics | descriptive only |

Coverage note: the six proposal families do not cover the whole seed. The largest
uncovered cluster is **type** — `font-size` 8, `font-weight` 3, `font-family` 2,
`font-style` 2, `font-variant-numeric` 1 — 16 declarations, second only to color
pressure. Next are **motion** (`transition` 3), `mix-blend-mode` 1, and `text-align` 1.
The proposal deliberately names no type or motion family yet; the type decision is
already tracked by `reports/GAP-K6-skin-type.md`. These records remain `skin-local`
evidence with no family tag. (`opacity`, `outline`, and `box-shadow` sit near `ink`
and `treatments`, but that assignment is itself an open call, not made here.)

## Theme-plane observation

Monky already resolves colors through a matrix:

```text
selected color theme: humo | acera | mar
resolved mode: light | dark
concrete CSS custom properties
```

`system` mode resolves to light or dark through `prefers-color-scheme`; it is not a
third palette. The U5.1 proposal therefore treats skin words as socket names, not direct
values:

```text
proposal word → future SkinSocket → project palette × resolved mode → concrete value
```

Potential Ermine ownership, after ruling:

- value-free socket names derived from the registry;
- `Record<SkinSocket, value>` contract;
- palette completeness validation;
- theme × mode resolution shape;
- framework-free DOM application helper.

Project ownership:

- actual palette values;
- user selection and persistence;
- theme picker UI;
- React hooks and application glue.

Boundary test: Monky's current `useThemeColors` should eventually reduce to thin React
glue around a framework-free Ermine resolver/applicator, and a non-React consumer
should be able to use the same theme plane without carrying Monky dependencies.

## Monky-only follow-up (resolved)

`monky/src/styles/theme/metrics.css` contained `scrollbar-color: var(---tone)
var(--tone-dim);` — a typo for `var(--tone)`. It was fixed in Monky commit
`c444d2f fix(styles): correct scrollbar tone variable`, as its own commit separate
from skin vocabulary work, as the protocol requires. The measured U5 result
(`73e582c…`) still contained the typo; future U6/U7 scrollbar evidence should be read
from the corrected Monky state.

## How U6 and U7 should use this report

During U6 and U7, executors should:

1. keep applying existing Ermine grammar only where structural equivalence is exact;
2. keep proposal-family words out of Monky markup and generated CSS;
3. classify recurring appearance records as `skin-local`;
4. tag recurrence in pilot reports using the proposal family names as prose labels;
5. escalate to U-SKIN only when a repeated pattern crosses independent surfaces and
   needs a shared decision.

The useful question for U6/U7 is not "can this become an Ermine word now?" but
"does this surface produce independent evidence for the same perceptual choice?"

## U6 settings/editor evidence

Source report: `reports/adoption/monky/pilots/SETTINGS-EDITOR.md`  
Measured Monky result: `df194bae51b905172dfd16ed38698b3a376eac7d`

U6 conserved 208 baseline settings/editor declarations. It migrated 66 structural
declarations to existing Ermine grammar and retained 142 local residuals. Of those
residuals, 85 were classified `skin-local`.

U6 `skin-local` property-family evidence:

| Property family | Count |
|---|---:|
| `color` | 20 |
| `background` | 13 |
| `font-size` | 9 |
| `transition` | 6 |
| `background-color` | 5 |
| `border` | 5 |
| `opacity` | 5 |
| `border-radius` | 4 |
| `font-weight` | 3 |
| `border-bottom-left-radius` | 2 |
| `border-bottom-right-radius` | 2 |
| `border-right` | 2 |
| `box-shadow` | 2 |
| `border-bottom` | 1 |
| `border-right-color` | 1 |
| `border-top` | 1 |
| `letter-spacing` | 1 |
| `line-height` | 1 |
| `text-align` | 1 |
| `text-transform` | 1 |

The new evidence comes from independent surfaces beyond the U5 modal/search pilot:
settings groups, segmented controls, macro-editor chrome, command suggestions, and
shared content-editor chrome. It reinforces the same open skin families:

| Proposal family | U6 evidence shape | Current disposition |
|---|---|---|
| `ground` | editor dropdowns, command rows, segmented controls, and settings controls rely on surface shifts | descriptive only |
| `ink` | command text, selected rows, icons, labels, and status feedback need explicit prominence relationships | descriptive only |
| `rule` | settings dividers, segmented-control seams, command dropdown edges, and toolbar/menu borders show separator pressure | descriptive only |
| `corner` | segmented controls, popout/action buttons, validation panels, dropdowns, and toolbar controls repeat radius choices | descriptive only |
| `treatments` | hover, selected, checked, delete-confirming, validation, and success/error treatments recur across editor surfaces | descriptive only |
| `scroller` | no new independent scrollbar evidence was added by U6 | descriptive only |

U6 also confirms that state backing and skin treatment are separate decisions:
command suggestions now use `aria-selected`/`data-state`, and segmented controls now
use `aria-checked`; their colors, backgrounds, opacity, borders, and radius remain
Monky skin evidence until U-SKIN rules vocabulary.

## U7 suggestions/delete evidence

Source report: `reports/adoption/monky/pilots/SUGGESTIONS-DELETE.md`  
Measured Monky result: `5e1b3292fc54ffaae19e8f5c5a052ac481aade11`

U7 conserved 107 baseline suggestions/delete declarations. It migrated 8 structural
declarations to existing Ermine grammar, removed 21 dead declarations, and retained 78
local non-dead residuals. Of those residuals, 45 were classified `skin-local`.

U7 `skin-local` property-family evidence:

| Property family | Count |
|---|---:|
| `color` | 8 |
| `background-color` | 7 |
| `font-size` | 6 |
| `border` | 4 |
| `border-color` | 3 |
| `border-radius` | 3 |
| `font-family` | 3 |
| `border-bottom` | 2 |
| `transition` | 2 |
| `border-bottom-color` | 1 |
| `border-top` | 1 |
| `border-top-color` | 1 |
| `box-shadow` | 1 |
| `font-weight` | 1 |
| `line-height` | 1 |
| `text-align` | 1 |

This evidence comes from injected, caret-positioned Shadow Roots rather than the modal
surface. It reinforces the same open skin families:

| Proposal family | U7 evidence shape | Current disposition |
|---|---|---|
| `ground` | popup container, command options, selected option, and delete danger wash rely on surface shifts | descriptive only |
| `ink` | command text, footer hints, keyboard caps, and danger labels need prominence relationships | descriptive only |
| `rule` | popup container border, command-list divider, footer divider, and option borders repeat separator pressure | descriptive only |
| `corner` | popup shell, command options, and keyboard caps repeat radius choices | descriptive only |
| `treatments` | hover, selected, and danger-confirm treatments recur in an independent overlay root | descriptive only |
| `scroller` | no new independent scrollbar evidence was added by U7 | descriptive only |

U7 adds one boundary datum for exactness: `justify-end` currently computes to `end`, not
`flex-end`, so the footer's `justify-content:flex-end` remains local. This is not a skin
gap; it is a grammar-emission exactness boundary for migration work.

## Not yet decided

- Whether `ground`, `ink`, `rule`, `corner`, `treatments`, and `scroller` become Ermine
  vocabulary or remain Monky-local vocabulary.
- How Monky's existing `--base-tone`, `--tone-dim`, `--tone`, `--ink`, `--ink-soft`,
  `--ink-alt`, `--accent`, `--accent-dim`, `--harmonic`, `--harmonic-minor`, and
  temperament/wash roles map to future sockets.
- Whether one rule-color socket is sufficient or U6/U7 show coexisting rule
  prominences in a single view.
- The radius generator parameters for `corner-*`.
- Which focus, selection, hover, and status treatments deserve named choices.
