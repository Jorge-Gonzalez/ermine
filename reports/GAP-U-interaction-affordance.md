# Gap Report — interaction-affordance plane

> **Resolved (the ruled half).** R-SKIN-17 (ADR-0019): `pressable` is a skin treatment owning `cursor` — the read side of interaction; behaviour stays JavaScript, the IoC boundary this report drew. Consumed in Monky at 47f0cd4 (twelve non-recipe cursor rows). `draggable`/`editable`/`expandable` remain reserved family members, evidence-gated within the ruled shape.

## What I was doing
Gaming the plane model and finding that interaction is only *partly* first-class in
Ermine: the STATE axis (hover/focus/selected/disabled/dragging), capabilities
(`selectable`), and conditioned treatments exist, but the interaction *pattern* — the
bundle of affordances that makes an element "button-like" — is still embedded per component.

## The decision that is missing
Whether to lift interaction **affordance** to composable capability words
(`selectable → pressable / draggable / expandable / editable`), while explicitly leaving
interaction **behavior** (event wiring, keyboard, focus management — inversion of control)
in the component. The boundary is load-bearing: affordance *reads* state (declarative,
style-grammar); behavior *writes* state (IoC, JavaScript, not style).

## Where I looked
`docs/plane-model.md` (four-plane ontology; state as the membrane); `src/registry.ts`
STATE axis and `selection-treatment`. Prior art: React Aria, Radix Primitives (headless =
behavior separated from style), WAI-ARIA APG, Norman/Gibson affordances.

## Options I can see (NOT a recommendation)
- Grow a capability vocabulary for affordances; behavior stays in components.
- Keep interaction patterns component-owned; Ermine rules only states + treatments.
- A hybrid: a small set of high-frequency affordance capabilities, rest component-owned.

## What is blocked
Nothing immediate — the STATE axis covers today's needs. This is a larger architectural
arc, sequenced after skin/theme and the animation reframe.
