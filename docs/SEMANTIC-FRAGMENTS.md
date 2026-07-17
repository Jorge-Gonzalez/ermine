# Semantic Fragments

Semantic fragments are the middle layer discovered during the Monky adoption. They sit above
Ermine's application-agnostic word grammar and below conventional component libraries.

They emerged by contrast. Once Ermine had absorbed the declarations that are honest flat words,
and once substrate, authored content, browser hooks, and product identity were separated, some
residue still had a clear shape. It was too object-like to become a word, but too portable to
dismiss as one project's private CSS.

## Position In The Stack

| layer | meaning | example |
|---|---|---|
| Ermine words | application-agnostic style facts | `padding-md`, `attach-below`, `underlined`, `alpha-35` |
| semantic fragments | portable object-shaped style units | keycap, callout arrow, selected pill, generated placeholder |
| project recipes | product/component contracts | command row, content-editor chrome, selectable group |
| project identity | one-off brand, offsets, exact signatures | modal blend, extension top layer, local shadow signature |

The important distinction is that a semantic fragment can be atomic in meaning without being
atomic in implementation. It may own pseudo-elements, internal selectors, structural state,
browser-specific hooks, or several declarations that only make sense together.

## Why They Are Not Words

Ermine words name broad property choices. They stay portable because they do not name a product
object. A fragment crosses that line. A `keycap` is not merely padding plus radius plus shadow;
it is a small drawn object. A `callout arrow` is not merely transparent borders; it is an
orientation-aware shape attached to a surface.

Flattening these shapes into words would make the grammar noisy and would hide the thing a
designer actually wants to control.

## Why They Are Not Bootstrap Components

Bootstrap-style components are broad UI objects: buttons, cards, modals, dropdowns. They often
carry opinionated markup, state, and visual identity.

Semantic fragments are smaller and more modular. They are application-shaped, but not
application-bound. They can be assembled inside project components without taking over the whole
component. This gives designers control over the internal style structure:

```text
command row =
  selectable row contract
  keycap chord
  search highlight
  generated placeholder
  selected indicator
```

A designer can then alter the keycap, selected pill, or placeholder independently, without
overriding an opaque component bundle or dropping to raw declarations.

## Current Monky-Discovered Fragments

Monky now makes the layer explicit with the `sf-*` prefix in markup and one stylesheet,
`src/styles/fragments/semantic-fragments.css`, imported after skin and before components.
The prefix means "semantic fragment": project-owned, utility-like, and deliberately outside
Ermine's flat word grammar.
In adoption accounting, these are positive sub-products of the conversion process. They are
not targets for Ermine absorption. They stay visible in the conserved project-owned ledger so
the CSS remains fully accounted for, but they are excluded from the adjusted word-assimilation
target rather than counted as unassimilated residue.
Vendor-specific selectors and properties that adapt a standard socket to a browser engine are
accounted the same way: visible for audit, excluded from residual Ermine word pressure once
the browser-adapter boundary is explicit.

| fragment | explicit Monky shape | why it is a fragment |
|---|---|---|
| keycap drawing | `.sf-keycap`, `.sf-keycap-raised`, `.sf-keycap-raised::after` | bevel, face, shadow, micro-padding, and layer combine into one keyboard-cap object |
| callout arrow | `.sf-callout-arrow`, `.sf-callout-arrow-top`, `.sf-callout-arrow-bottom` | zero-size box plus border triangle and orientation colour form one attached arrow |
| segmented pill | `.sf-segmented-pill::before`, snap/slide state | active indicator uses pseudo geometry, custom coordinates, opacity, and local timing |
| engine scrollbar | `::-webkit-scrollbar*` inside the fragment file | browser-engine pseudo-elements adapt the standard scrollbar socket handoff |
| generated placeholder | `.sf-generated-placeholder:empty::before` | generated content, placeholder colour, and pointer-event suppression form one empty-state affordance |
| effect composition | `.sf-shake-suppression` | local tween suppression lets the admitted Ermine `shake` effect atom own the frame |
| authored-content substrate | `.sf-authored-content` descendants | user-authored HTML defaults deliberately point away from utility grammar |
| control-state recipe | disabled/selectable/min-selection/radio-label mechanics | behavior and invariants remain project control contracts after state skin migrates |

The first six are private drawing, engine-adapter, or effect-composition fragments. The last two are adjacent
boundaries that clarify what should not become flat utilities.

## Adoption Workflow

Semantic fragments come from subtraction:

1. Generate the current ledger and inverse-match Ermine emission.
2. Migrate anything that already has an honest Ermine word.
3. Register substrate, authored-content, reset, and product-identity boundaries.
4. Read the remaining residue at rule level, not declaration level.
5. Name recurring object-shaped clusters as semantic fragments.
6. Keep them local, promote them to project recipes, or eventually model them with a fragment
   layer.

This process is useful because it is discoverable. The framework does not need to invent every
fragment up front. Real applications expose the fragments that matter.

For assimilation reporting, semantic fragments should be excluded from the flat-word target
while remaining visible in the conserved project-owned residue ledger. In Monky, the current
fragment set accounts for 46 declarations across 18 rules; paired with the authored-content
default substrate, it narrows the current word-assimilation target to 8 declarations across
7 rules.

## Possible Future Shape

A future fragment repository could publish small, portable style units rather than full UI
components. A fragment entry would likely declare:

- semantic name;
- selector or markup shape;
- pseudo-elements it owns;
- required state or accessibility assumptions;
- sockets for colour, radius, spacing, motion, and elevation;
- Ermine words it composes with;
- boundaries it owns;
- portability notes and adoption evidence.

This keeps Ermine's word layer pure while giving the ecosystem a place for reusable, designer
controllable style objects.
