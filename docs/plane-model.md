# Direction — the plane model, animation, and interaction

Status: **direction / exploration.** Not a constitution ruling. It records the ontology
and reframes reached during the skin-grammar sessions so they can be ruled later with the
care each deserves. The skin/theme families (ground/ink/rule/corner/accent/status/font +
the duration/stagger value-scales) land *first*, as their own concrete rulings; the
animation reframe and the interaction plane are larger arcs that touch settled ground
(R-MOTION-01/02/04) and get their own revision cycles.

Each section states the idea, then **contrasts it with prior art** — because the practice
this document inaugurates is: *derive from first principles, then locate the derivation in
the literature, then verify the load-bearing pieces at the primary source.* References
here are pointers, not citations verified line-by-line; confirm them before betting a
ruling on them. (Assistant knowledge cutoff applies — treat the reference names as leads.)

## The four planes

One element is described by four orthogonal, composable planes:

| Plane | Answers | Kind |
|---|---|---|
| **structure** | where it sits | static / spatial |
| **skin** | what it looks like | static / spatial |
| **animation** | how a change unfolds over time | temporal |
| **interaction** | how it engages the user over time | temporal |

A button is a *structure*, wearing *skin*, that *responds* (interaction) with *animated*
feedback. The two static planes and the two temporal planes are genuinely different in
kind, and — the load-bearing discovery below — **the two temporal planes do not touch each
other directly.**

**Prior art.** The idea of a small composable language of design decisions is Christopher
Alexander's (*A Pattern Language*, *The Timeless Way of Building*). Separation of
presentation from behavior is the MVC/MVVM tradition. What is not standard is treating all
four as *one decidable, lint-able grammar* under a single constitution — that unification
is Ermine's, not borrowed.

## Skin is not animation; animation is not motion

`motion` is a category error as an axis name: it implies *movement* (position), but color,
size, and shape animate too. The axis governs the **temporal envelope of any change**, so
its honest name is **animation**. And its two members are not scales of one thing — they
are an atom and a composition:

- **tween** — a single interpolated change (easing + duration). (was `motion-micro`)
- **choreography** — tweens arranged in time: `together / sequence / cascade`, where
  `cascade` is the staggered timeline. (was `motion-macro`)
- **scene** — a view-level coordinated moment. By the regularity principle it is the
  *exception*: bespoke whole-view timelines are component identity, **outside** the
  grammar's word-set.

Two words are deliberately rejected: **`transition`** (colloquially owned by view/route
swaps) and **`timeline`** (that is the *visualization* of a composition, not the
composition — naming a thing after its editor is the trap).

**Prior art / contrast.** The vocabulary lineage is multimedia authoring — Macromedia
Director/Flash gave us *tween*, *keyframe*, *timeline*, *scene*; the modern descendants are
**GSAP** (timelines) and **framer-motion** (`staggerChildren` = `cascade`). Ermine's easing
words (`decelerate/accelerate/standard/emphasized`) are already **Material Design's motion
easing set** — a prior-art borrow that predates these sessions and validates the register.
Where Ermine differs: framer/GSAP express choreography *imperatively in JS*; Ermine keeps
it a *declarative* grammar member with a `--stagger` socket composed via
`calc(own-delay + --stagger)`. Same concept, declarative substrate.

## State is the membrane between interaction and animation

The relationship between interaction and animation is **not** a direct trigger link — that
was an early over-coupling. They are joined only through **state**:

- **interaction owns *when*** — it is inversion of control (callbacks / promises / signals):
  the timing is external and unpredictable because the user, or the app, fires the event.
  Interaction's product is a *written condition*.
- **state owns *what-condition*** — a discrete condition (`hover`, `selected`, `loading`).
  Crucially it can be written by interaction **or** by app logic; same state, either author.
- **animation owns *how-it-unfolds*** — it reads a change and envelopes it as a
  deterministic interpolation. It never asks what caused the change.

So animation couples to *state-change*, not to interaction — which is exactly why the
coupling is **not mandatory**: a user hover and a resolved fetch both merely *write state*,
and animation reacts identically. The two temporalities never contaminate each other
because state sits between them: interaction writes it imperatively, animation reads it
declaratively. This also fixes the affordance/behavior line — affordance *reads* state
(declarative, style-grammar), behavior *writes* state (IoC, JavaScript).

**Prior art / contrast.** This is the founding theorem of modern UI architecture, and the
single highest-value review here. **David Harel's statecharts** (1987) and **XState**
formalize interaction as state transitions; **The Elm Architecture** and the `UI = f(state)`
lineage (Redux, React, signals) *are* the membrane. Reaching statecharts/Elm from first
principles is a good sign the reasoning is sound — and reviewing them will hand over edge
cases (hierarchical/parallel states, guards, entry/exit actions) for free. Ermine already
implements the pattern: the STATE axis is the pivot, `selection-treatment` reads `selected`
and paints, and a `tween` envelopes whatever state-driven change occurs without knowing its
cause.

## Interaction as a first-class plane

Interaction is *partly* first-class in Ermine already: the STATE axis (`hover`, `focus`,
`selected`, `disabled`, `dragging`, validity, disclosure) with entailment laws, capabilities
(`selectable`), and conditioned treatments. What is **still embedded** in components is the
interaction *pattern* — "button-ness," "draggable-ness" — the bundle of affordances (cursor,
focus-ring, press-feedback, keyboard activation). The frontier is lifting the **affordance**
to composable capability words (`selectable → pressable / draggable / expandable / editable`)
while **explicitly leaving the behavior** (event wiring, focus management, keyboard logic) in
the component, because that half is IoC control-flow, not declarable style.

**Prior art / contrast.** The affordance/behavior split is exactly what **headless component
libraries** ship: **React Aria** (Adobe) and **Radix Primitives** separate behavior /
keyboard / focus / a11y from all styling — the direct prior art for "lift the affordance,
leave the behavior." The role+state+behavior separation is codified in **WAI-ARIA Authoring
Practices**. The *affordance* concept is Gibson → **Don Norman** (*The Design of Everyday
Things*). Ermine's contribution would be making the affordance a *grammar word* that composes
with the other three planes, rather than a component API.

## Where Ermine already sits, honestly

| Plane | Ermine status | Nearest prior art |
|---|---|---|
| structure | built | Every Layout (Stack/Cluster/Sidebar) |
| skin | being built (these sessions) | Design Tokens (W3C/Style Dictionary), Radix Colors, GitHub Primer |
| state | built (STATE axis, capabilities, conditioned skin) | statecharts / XState / Elm |
| animation | built but mis-named/mis-framed | Material motion, framer-motion, GSAP |
| interaction affordance | frontier | React Aria, Radix Primitives, ARIA APG |

## What is genuinely not reinvention

Every plane echoes prior art — which is a good sign, not a bad one: first-principles
reasoning that keeps landing on load-bearing, independently-invented ideas is reasoning
worth trusting. What has no clear precedent is the **synthesis**: a single *decidable,
lint-able* grammar unifying structure + skin + state + animation under one constitution,
with conservation-checked, evidence-based adoption, deliberately built to be legible to an
AI collaborator. The wheels are well-known; the chassis that makes them one vehicle — with a
governance model and a machine-verifiable whole — is the original work.

## Sequencing

1. **Now:** land the skin/theme families as concrete rulings + the value-free theme-plane
   skeleton.
2. **Next revision:** the animation reframe (`motion → animation`, `micro/macro →
   tween/choreography`, `scene` as the outside exception) — a constitution change to
   R-MOTION with impact analysis and regeneration.
3. **Larger arc:** the interaction-affordance plane (capability vocabulary past
   `selectable`), with the affordance/behavior boundary ruled explicitly.

Each is a ruling the human author makes (U-R1); this document is the evidence and the map,
not the decision.
