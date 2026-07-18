# Monky Post-Assimilation Conclusions

This note records the design conclusions extracted after the Monky adoption reached terminal
assimilation. The generated reports remain the source of truth for counts; this document
captures the interpretation that should guide the next adoption.

## Status

The Monky transition is effectively complete at Monky `7eef9cd`:

| measure | count |
|---|---:|
| current declarations | 497 |
| adopted/infrastructure declarations | 400 |
| project-owned residue declarations | 97 |
| assimilable declarations | 0 |
| shadowed words | 0 |

After excluding semantic fragments and authored-content defaults from flat-word planning, the
adjusted word-assimilation target is 1 declaration across 1 rule:
`.sf-segmented-control-option svg { vertical-align: middle; }`.

That declaration is better read as segmented-control fragment accounting than as a new Ermine
word. It should remain visible until the reporting layer can attach it to the segmented-control
fragment boundary directly.

## Main Finding

Ermine's language worked. The hard part was not the final class paragraphs; it was the adoption
process that produced them.

The first conversion took too long because the tools could not initially preserve the most
important decision: what kind of thing each residual rule was. Raw CSS did not say whether a
row was a missing word, a semantic fragment, authored-content substrate, browser adapter,
project identity, dead CSS, or an existing word hidden behind a specific value. Human and AI
attention repeatedly had to rediscover those categories.

The next adoption should make those categories first-class. The missing piece is an adoption
compiler and visual lens, not merely more words.

## Where The Label Attaches

The central design question is where a name attaches:

| system | label attaches to | consequence |
|---|---|---|
| Bootstrap-like components | a broad UI object | fast assembly, but large opinionated bundles |
| Tailwind-like utilities | declarations and values | precise control, but a flat implementation-shaped surface |
| Ermine words | style intentions | compact paragraphs that describe what an element is doing |
| semantic fragments | small composed objects or mechanisms | reusable local objects without adopting full component bundles |
| composition aliases | repeated Ermine-word paragraphs | faster authoring while preserving open composition |

Ermine's strongest property is this middle attachment point. A word such as `pressable`,
`scrim`, `rule-soft`, `content-align-start`, or `alpha-35` names a design intention rather
than a raw declaration. It is more structured than utility atoms and less enclosing than a
component library.

Semantic fragments extend that idea upward by one layer. They attach names to compact objects
that cannot honestly be flat words: keycaps, callout arrows, segmented-control pills,
generated placeholders, selectable-group mechanics, and foreign overlay hosts.

## The Model Is A Graph

Ermine words do not form a simple tree. They form a typed, layered composition graph.

An element can participate in many independent facets at once:

- structure and position;
- spacing and constraints;
- skin and elevation;
- type and text treatment;
- state and backing;
- motion and effects;
- affordance and interaction cues.

Those facets converge on emitted declarations and sockets. Repeated constellations of words
can then become semantic fragments or composition aliases. A useful mental model is:

```text
element
  -> Ermine words
  -> axes and facets
  -> emitted declarations / sockets

element
  -> repeated word constellations
  -> composition aliases

element
  -> object-shaped mechanisms
  -> semantic fragments

component region
  -> words + aliases + fragments
  -> application surface
```

This graph shape matters for tooling. A tree viewer would force every word into one parent.
An adoption lens should instead show which axes a paragraph touches, which declarations those
words own, and which local fragments or aliases are being composed.

## Word Pressure

The final Monky paragraphs are clear enough to maintain, but the visible vocabulary is large:

| measure | count |
|---|---:|
| class paragraphs | 155 |
| total Ermine token uses | 1,035 |
| unique exact visible tokens | 236 |
| unique base words | 200 |
| scoped exact tokens | 47 |
| state scopes used | 11 |
| median paragraph length | 5 |
| p90 paragraph length | 14 |
| maximum paragraph length | 23 |

This is acceptable for a completed migration, but it is too much to ask every new project to
discover unaided. The pressure is not mostly asking for more core words. Long repeated
paragraphs are evidence for a higher composition layer.

## Repeated Monky Patterns

The most useful recurring clusters were not new atomic words. They were small design
constellations:

| pattern | representative shape |
|---|---|
| selectable option / option chip | selectable surface, soft rule, small padding, centered text, pressable, truncate, selected/hover state skin |
| native button control | button spacing, rule, corner, pressable state skin, disabled blocking, focus ring |
| icon action | compact horizontal control, centered icon, soft ink, hover ground/ink transition |
| scroll region | overflow behaviour plus standard scrollbar treatment |
| form field | fill-inline, padding, ground, ink, rule, focus ring |
| command row | horizontal row, gap, padding, center alignment, pressable selection skin |

These clusters suggest two related but distinct layers:

- semantic fragments, when the cluster owns internal selectors, pseudo-elements, browser hooks,
  or object-shaped mechanics;
- semantic composition aliases, when the cluster is only a named expansion of Ermine words.

A composition alias could be authored and expanded by tooling without becoming a core Ermine
word:

```text
@compose option-chip =
  selectable ground-subtle ink rule-soft corner-md ruled
  padding-block-xs padding-inline-sm font-sm text-center
  pressable truncate tween-quick
```

The alias should accelerate adoption and authoring while keeping the underlying paragraph
inspectable. The implementation plan for this layer, now called **combines**, is recorded in
[`COMBINES-AND-ADOPTION-LENS.md`](COMBINES-AND-ADOPTION-LENS.md).

## Semantic Fragments

Semantic fragments were discovered by subtraction. Once Ermine words, substrate, browser
adapters, authored content, dead CSS, and product identity were accounted for, a few small
objects remained.

Those objects are not failed assimilation. They are positive adoption sub-products:

- they are more semantic and reusable than one-off project CSS;
- they are smaller and more controllable than Bootstrap-style components;
- they preserve the framework's open composition model;
- they give designers names for meaningful internal units of a component.

The important rule is accounting clarity. Semantic fragments are conserved and audited, but
they are not residual Ermine word pressure. They belong beside Ermine, not inside the flat word
grammar.

## Adoption Compiler

The next adoption should be faster because this one produced a reusable process. The adoption
compiler should:

1. generate baseline and current ledgers;
2. inverse-match emitted Ermine CSS against project CSS;
3. apply playbook recipes before asking for vocabulary decisions;
4. classify every residual rule as word pressure, semantic fragment, composition alias,
   authored-content substrate, browser adapter, project identity, config departure, or dead CSS;
5. mine repeated word clusters and class-paragraph n-grams;
6. propose before/after paragraphs with confidence and visual risk;
7. keep rule-level decisions stable across report refreshes;
8. update adoption reports and boundary documentation.

Human review should focus on category rulings and true vocabulary decisions, not re-reading
the same declaration patterns by hand.

## VS Code Adoption Lens

The graph model should become visible in the editor. The implementation plan for this surface
is recorded in [`COMBINES-AND-ADOPTION-LENS.md`](COMBINES-AND-ADOPTION-LENS.md). A VS Code
lens or popup could show, for a selected class paragraph:

- the words and their axes;
- the emitted declarations and sockets;
- conflicts, shadowing, and backed-state requirements;
- matched playbook recipes;
- detected semantic fragments or composition aliases;
- residual boundary status;
- exact before/after conversion suggestions.

At file or project scope, the same lens could mine repeated clusters and suggest aliases or
fragments with examples. This would turn the adoption graph into an interactive explanation
surface rather than a hidden report artifact.

## Consequences

Future work should not flatten semantic fragments into Tailwind-like declarations, and it
should not promote them into Bootstrap-like component bundles. The durable path is layered:

1. keep Ermine words application-agnostic and intentional;
2. keep semantic fragments explicit, local or shareable, and auditable;
3. add composition aliases for repeated word paragraphs;
4. make adoption tooling classify and visualize the graph early.

The Monky adoption was expensive, but it revealed the next layer of the system. The payoff is
not only a migrated project; it is a repeatable way to discover what belongs in Ermine, what
belongs beside it, and what should remain project-owned.
