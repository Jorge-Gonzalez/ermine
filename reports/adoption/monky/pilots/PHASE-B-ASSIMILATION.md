# Monky pilot — Phase B assimilation

This pass consumed only vocabulary Ermine already emits or can emit from
`ermine.elements.json`. It deliberately did not decide button recipes, focus,
`aria-current`, parent-relational reveals, transitions, shadows, or scrollbar prominence.

## Starting point

The Phase A current ledger reported **100** assimilable declarations in current Monky:

| Area | Assimilable rows |
|---|---:|
| `src/styles/skin/controls.css` | 33 |
| `src/styles/components/content-editor.css` | 28 |
| `src/styles/skin/surfaces.css` | 22 |
| `src/styles/skin/typography.css` | 5 |
| overlay/page/popup stragglers | 12 |

## Assimilated

| Area | Result |
|---|---|
| Typography | Replaced the remaining `text-lg` consumer with `font-lg`, confirmed the weight utilities are already emitted by Ermine, deleted `skin/typography.css`, and removed it from page and Shadow-DOM bundles. |
| Surfaces | Moved section, alert, card, empty-state, validation, and divider paint/type/radius/padding onto `ground*`, `ink*`, `rule*`, `corner-*`, and `padding-*`; kept line mechanics and rhythm local. |
| Controls | Moved labels, inputs, checkboxes, radio labels, editor content, panel-button weight, and selectable-group base hover/position onto emitted words; left `.btn-*` for Phase C. |
| Content editor | Moved toolbar, dropdown, link input, content body, and icon display rows onto emitted words; kept `.is-active`, focus, and user-content rules local. |
| Popup scrollbar sockets | Replaced popup scrollbar hexes and the manual `.dark` block with `--ground-subtle`, `--rule`, and `--ground-defined`; prominence geometry remains local. |
| Stragglers | Assimilated modal radius, overlay scroll containers, settings label rigidity, command-suggestion action rigidity, segmented icon display, and page title/body colour/type. |
| Guardrail | Added a Stylelint override banning hex and named colours in skin, component, overlay, popup, and options CSS; theme files remain the source of colour literals/sockets. |

## Left local

| Area | Rows | Reason |
|---|---:|---|
| `.btn*` controls | 16 | Deliberately deferred to Phase C button recipe ruling. Recorded in `current-overrides.json` as `skin-review`. |
| `.selectable-group > .is-selected:hover` | 1 | JS-toggled `.is-selected` compound state; recorded as `state-review` instead of silently recasting to a backed condition. |
| Border/scrollbar mechanics | unchanged | Width/style, radius, and scrollbar prominence remain project-owned or gap evidence; Phase B only socketed colours. |
| Rich text body descendants | unchanged | User-content boundary. |

## Result

| Measure | Before | After |
|---|---:|---:|
| Current declarations | 787 | 718 |
| Project-owned residue | 612 | 533 |
| Assimilable work list | 100 | 0 |
| Generated Ermine declarations | 84 | 94 |
| Scrollbar follow-up rows | 24 | 19 |

The 17 deliberately declined rows are now validated overrides, so the generated current
ledger has no open assimilable work list.

Monky implementation commit: `6b457f2` (`Assimilate Ermine Phase B skin words`).

## Verification

Run in Monky:

```sh
npm run ermine:css -- --ermine-root ../ermine --check
npm run lint:css
npm run test:styles
npm run audit:styles
```

Observed after the pass:

| Check | Result |
|---|---|
| Ermine CSS generation check | passed |
| CSS lint | passed, including the colour-literal guard |
| style smoke | passed; frozen computed-style baseline unchanged |
| style audit | 204 live static classes, 0 dead-candidate declarations |

Run in Ermine:

```sh
npm run adoption:current -- --project ../monky --name monky --write
```

Observed: `assimilable now = 0`, with 17 override notes validated against the current
Monky scan.
