# Toward a Semantic Style Grammar

*Notes from building a CSS layout language inside a browser extension.*

> **Status:** living document — updated as the work reaches things worth sharing.
> **Last updated:** 2026-06-23. See the [Changelog](#changelog) at the bottom.
> Companion to the working spec, `STYLE-GRAMMAR.md`, and the `flex-character` playground.

---

## TL;DR

Atomic CSS is great and thoroughly proven. Working in Tailwind on a real project, I kept admiring
its core move — a styling *language that lives on the component* — while wondering whether the
vocabulary itself could say more about *what a layout means* and less about *what geometry to
apply*: `class="horizontal comfortable selectable-group"` alongside `class="flex gap-3
items-center"`. That question turned into an experiment — a small **semantic style grammar**: a
vocabulary of perceptual, composable words, governed
by a written constitution, with an algebraic engine underneath and its behaviour pinned by tests
run against a real browser.

This post is the honest story of the idea: where it came from, how it contrasts with what already
exists, the key concepts, and how far it has actually gotten. It is research and a personal design
language, not a product — I'll be clear about that throughout.

---

## 1. Origin: the friction

The project is [Monky], a keyboard-centric text-expansion browser extension, and my first real
project in **Tailwind**. Two older instincts shaped how I reacted to it.

One comes from graphic design: long before the web, desktop publishing had a *working vocabulary*
for describing the structure of a layout — a shared language for the parts of a page that was a
genuinely useful tool. The web never inherited an equivalent; our layout vocabulary today is mostly
geometry. That absence stuck with me — layout, it seemed, used to deserve language and had lost it.

The other comes from having written HTML before CSS existed. Atomic CSS, in a sense, brings styling
back onto the component — style living next to the structure you're reading — and Tailwind has
shown, at real scale, how productive that move is. What I kept wanting wasn't to undo it but to
*build on* it: `flex gap-4 items-center px-3` tells you exactly what the browser will do, and I
found myself wishing the same words could also say what the thing *was*. So the question became a
friendly one, aimed at the core principle rather than against it: *if a styling language is going to
live on the component, can it be composable and intent-bearing — a grammar — as well as precise?*

So I did a cold rewrite, replacing the Tailwind classes with words that named intent —
`horizontal`, `comfortable`, `selectable-group`. Rough (a v0), but the markup suddenly read like a
*description* of the interface instead of a recipe for it. That was the spark; the rest has been
trying to turn the instinct into something with real structure rather than vibes.

(That v0 still ships in the extension, drift and all — and that drift, honestly, is what pushed me
to stop patching and write the model down. More on that in [§6](#6-working-with-an-ai-as-auditor).)

---

## 2. The thesis: styles should read like meaning

The core bet is simple: **the markup should encode authorial intent, and the implementation should
be derivable from it.** Atomic CSS put an expressive language on the component; this asks whether
that language can be written in intent first, with the geometry derived.

```html
<!-- implementation-semantic (what the browser does) -->
<nav class="flex gap-6 items-center justify-between">

<!-- intent-semantic (what the thing is / how it feels) -->
<nav class="horizontal relaxed align-center justify-between">
```

The second reads almost like a sentence: *a horizontal cluster, relaxed spacing, centered, spread
apart.* The meaning survives without opening the stylesheet. The vocabulary is **perceptual** —
`tight · snug · comfortable · relaxed · loose · separated` — because humans perceive spacing
qualitatively (roomy/cramped) before they perceive it quantitatively (12px). That density scale
was the very first thing I worked out, and it set the tone for everything after: name the
*feeling*, compile to the *number*.

---

## 3. An honest contrast with the alternatives

This is not the first system to want readable CSS, and every system below is a serious,
battle-tested answer to a real problem — each one taught me something. The comparison is about
*emphasis and trade-offs*, not merit: it's worth being precise about what's genuinely different
here, and equally honest about where these are simply ahead.

| System | Optimizes for | Relationship to this |
| --- | --- | --- |
| **Tailwind** | author velocity, tooling, scale | Builds on its core principle — a styling language on the component — exploring whether that vocabulary can be intent-semantic (`comfortable`) and composable rather than implementation-semantic (`gap-4`). Tailwind is far ahead on ecosystem and maturity; the bet here is only on legibility-of-intent. |
| **BEM / SUIT** | naming rigor, component identity | Component-centric; this is composition-centric and perceptual, not block/element/modifier. |
| **OOCSS** | structure vs skin separation | A direct ancestor of one idea here (separate planes), but component-oriented and not a grammar. |
| **Every Layout** | layouts as relational primitives | The closest *philosophically* — layouts as relations, not appearance. This generalizes it into axes, a density vocabulary, and an algebra. |
| **CUBE CSS** | composition/utility/block/exception | The closest *methodologically* — concern separation parallels the planes here, but CUBE is a loose methodology, not a formal system. |
| **Vanilla CSS (2024+)** | the platform itself | `@scope`, container queries, `@property`, subgrid, cascade layers — many of the *mechanisms* this relies on. The value here is the *meaning layer above* them. |

And the most honest comparison of all: in spirit this is **Haskell to the mainstream's C#.**
Minority, principled, unlikely to be adopted at scale — and potentially valuable anyway, the way
Haskell's ideas (comprehensions, type inference, immutability) migrated into languages that *were*
adopted. The aim isn't market share; it's whether the ideas are worth contributing.

**Where the mainstream is simply ahead, stated plainly:** no tooling, no ecosystem, no type-safety,
validated on exactly one application (n=1). The perceptual vocabulary needs calibration that
`gap-4` never will. This is, today, a research direction and a personal design language — not
something I'd hand a team shipping next quarter.

---

## 4. The architecture (the interesting part)

The system organizes every style along **three orthogonal dimensions**.

### 4.1 Plane — *what function does this serve?*
Sort styles by function, not by file:
- **Grammar** — *how is it arranged / how does it behave?* (reusable, perceptual)
- **Skin** — *how does it look?* (appearance)
- **Identity** — *what specific thing is it?* (one-off, app-bound)

The discipline test: a class that sets *both* layout (`display/gap`) and appearance
(`background/border`) mixes planes and must be split. Most "component CSS" turns out to be identity
that absorbed grammar and skin it should have *composed* instead.

### 4.2 Role — *which direction does it face?*
Every element plays two roles at once, and they're orthogonal:
- **container-role** — how it arranges its *children* (looks down)
- **member-role** — how it sizes/aligns *itself* within its parent (looks up)

A nice confirmation: this is exactly CSS's own **inner vs outer display type** (`display: flex` =
outer `block` + inner `flex`). The spec independently encodes the same split. The discriminator is
sharp: *remove the parent — does the property still mean anything? No → member-role.*

### 4.3 Scope — *how wide does it reach?*
Not a fixed ladder but a **nesting that mirrors the DOM** — lexical scoping for style: element →
container (`> *`) → local/global ambient (inherited) → substrate (reset). A satisfying
realization: a **stacking context is just a local scope for `z-index`**, and `@property {
inherits: false }` is the *scope knob applied to a value*. The platform already had this idea
scattered across unrelated features; naming it unifies them.

### 4.4 Four sibling grammars (the document → application expansion)
The original web is a *document* — flow, no overlap, no state, no time. Modern UI added three
dimensions the document model never had. So the "grammar" plane is really **four sibling grammars
under one constitution**:
- **layout** — in-flow arrangement (*where*)
- **state** (interaction) — conditions; mirrors ARIA (*when*)
- **motion** — transitions between states; the *arrows between configurations* (*how, over time*)
- **layering** — out-of-flow depth; a named `z` scale, not raw integers (*which plane*)

I haven't seen anyone treat state/motion/layering as *semantic grammars sharing one law set*. This
is the most distinctive part.

### 4.5 The laws
The grammar is governed, not vibes-based. The core laws:
- **Axis = paradigm; one word per axis** (composition is *unification* — two words from one axis is
  a conflict, not a combination).
- **Dimensional purity *enables* composition** (it's the reason orthogonal words commute — not a
  restriction but the precondition for the algebra).
- **Markedness** — each axis has an unmarked default.
- **Value through contrast** — a word earns its place only by differing from its neighbours
  (synonyms are bugs).
- **Compositionality** — meaning of the whole = function of the parts. This is the bridge between
  the human-readable surface and the machine-checkable engine.
- **Alias law** — aliases are *discovered from repeated use*, never invented speculatively; mint a
  shorthand only once a primitive combination demonstrably recurs.
- **Derivation rule** — what is safe to derive should be derived: compile composites from atoms
  rather than enumerate hand-authored ones (keeps the vocabulary additive and single-sourced).

### 4.6 Linguistic surface, algebraic engine
Two faces of one thing: a **linguistic surface** (reads like language) over an **algebraic engine**
(feature lattice per element; ordered scales; a free tree-algebra for the DOM). Primitives are
*complete*; aliases are *kind* — and, per a rule I now hold, **aliases are discovered from repeated
usage, never invented speculatively.**

The engine's seed is the **value-channel technique**: a class binds a custom property that
*applicators* consume, instead of emitting a property directly —

```css
@property --space { syntax: "<length>"; inherits: false; initial-value: 0px; }
.comfortable { --space: var(--spacing-md); }   /* operator: a magnitude */
.gap { gap: var(--space); }                     /* applicator: which property */
.pad { padding: var(--space); }
```

This turns a class from a *constant* into a *parameter binding* — the first place the grammar
*computes* instead of *enumerates*. Payoff: **D + P** classes instead of **D × P** (define the
scale once, reuse on any property). Its honest limit: one shared channel = *one rhythm per
element*; per-property independence needs bound tokens. (A flat class list is an unordered *set*,
so it can't bind a loose modifier to a loose applicator — `comfortable pad snug gap` simply can't
mean "comfortable padding, snug gap.")

### 4.7 Layout is laws; skin is consensus
A distinction I think matters: **layout** structure is *lawful* — proportion, rhythm, grids,
symmetry have real mathematics (Le Corbusier's Modulor, Swiss grids, the `fr` unit). **Skin** is
mostly *consensus* — "good design" is largely a moving, cyclical agreement, closer to distributional
semantics ("you shall know a word by the company it keeps") than to law. So they want different
tools: *declare* the proportional layer; *learn/elicit* the connotative one. Conflating the two is
why "can we mathematize aesthetics" usually fails — most of the failures measured the object instead
of the relations, and hunted a universal constant instead of a generative system.

---

## 5. The method: models are falsifiable narratives

The most important thing I learned isn't a feature; it's a stance. **A layout model is a
falsifiable narrative, not a law handed down from the spec — and the engine is the oracle.**

A concrete story. I wrote out, carefully, the four-step pipeline by which flex resolves a row's
widths, and hand-derived a result: `[175, 150, 175]`. I was about to document it. Then I ran it
against a real browser and got `[150, 150, 200]`. My careful model was *wrong* — `min`/`max` don't
pre-clamp the distribution baseline the way I'd reasoned; growth distributes from the raw
`flex-basis`, and clamping happens later, in a freeze-and-redistribute loop.

So instead of documenting the wrong model, I **reconstructed** it: designed experiments where rival
hypotheses predicted *different* numbers, asserted my best guess, and let the engine adjudicate.
Four experiments later (`flexPipeline.browser.test.ts`) the corrected narrative held — including two
genuinely uncertain ones that could have falsified it. Only *then* did it get written down, marked
explicitly as *falsifiable-against-the-engine*, with the tests cited as evidence.

That's the whole epistemology in one episode: **don't trust the model, encode the engine.** It also
told me how to handle the real headache of modern CSS — that orthogonal inputs (flex, `min`/`max`,
basis) are independent to *author* but *entangled* in computation. You don't resolve that with a
cleverer mental model; you keep the axes orthogonal for authoring and **pin the entangled outcomes
with engine-verified tests.**

And it wasn't a one-off. The same method then reconstructed CSS **stacking** — swapping the oracle
from measured widths to `elementFromPoint` (who paints on top). It confirmed the counter-intuitive
facts (a stacking context *contains* its children's `z-index`; a `z:1` in a higher context beats a
`z:9999` in a lower one) and forced a real design constraint: a named z-scale is only reliable *with*
deliberate context boundaries. Two reconstructions in, "encode the engine" is less a story than the
working method — and each pinned behaviour is *falsifiable*: if a browser ever diverges, a test goes
red and the narrative gets rebuilt.

---

## 6. Working with an AI as auditor

I built this with heavy AI assistance, and the most useful discovery there is mechanistic:

> **A written model converts an AI collaborator from an entropy *source* into an entropy *sink*.**

Without a spec, an AI pair-programmer produces locally-plausible, globally-incoherent CSS — it
*adds* disorder (that's where my v0's drift came from). With the spec, the same AI *audits against
the law* — it removes disorder. The constitution isn't only for humans; it's the interface that
makes AI a convergent, net-negative-entropy collaborator. The whole grammar is, not coincidentally,
designed to be legible to a *meaning-model* — which is what makes the AI able to check it.

---

## 7. What's actually built

Honest inventory, so this isn't vaporware-by-blog-post:

- **A constitution** (`STYLE-GRAMMAR.md`) — the planes, roles, scope, laws, the four grammars, and
  the member-role family worked out in detail. Open decisions are tagged `[RULING]`.
- **An interactive playground** — a flex "give↔grab / size-source" sandbox with guided scenarios
  and live numeric readouts (it has, more than once, falsified my own claims on screen).
- **A compile seed** — `flexStyle()`, a pure function mapping grammar tokens → CSS flex
  declarations. The first slice of the algebra layer.
- **A test strategy, instantiated** (~30 browser tests + static rule tests): *rule* tests (token →
  CSS, in jsdom), *outcome* goldens (real widths), and *law* tests (conservation, ratio-invariance,
  clamping). Two behaviours were **reconstructed from experiment** against the engine — the flex
  resolution pipeline and CSS stacking — and the **value-channel** (one density vocabulary feeding
  many properties) is verified executably. The laws are, in a real sense, *the constitution made
  executable.*

Not built yet: the full compiler, the skin vocabulary, the namespacing decision, and the
convergence pass that pulls the shipping (v0) CSS into conformance with the model.

---

## 8. Honest limitations

- **n = 1.** One app. The coherence might not survive data tables, dashboards, dense forms.
- **No tooling, no enforcement.** Drift is prevented today by discipline + AI audit, not by a
  linter that checks the laws. That's a real gap.
- **The perceptual vocabulary needs calibration.** `comfortable` means something only relative to
  its neighbours; a team would have to internalize the scale.
- **Racing the platform.** As CSS absorbs `@scope`, container queries, and friends, maintaining a
  bespoke layer has ongoing cost a shared framework amortizes.

None of these are fatal *for what this is* — a research direction and a personal language. They'd be
fatal for "adopt this instead of Tailwind," which is not the claim.

---

## 9. Roadmap

1. Resolve the remaining `[RULING]`s in the constitution.
2. Purify the grammar file — extract the component-pattern squatters; name the skin plane.
3. Build the value-channel compile layer for real (`--space` + applicators), with `@property`.
4. The convergence pass: bring the shipping CSS into conformance and delete the v0 drift.
5. Decide the implementation-scope policy (Shadow-DOM-only vs a namespace).
6. Extend the rules+laws+goldens test pattern to the other axes (alignment, the layering `z` scale).

---

## Changelog

- **2026-06-23 (session update)** — The falsifiable-narrative *method* became a repeatable practice:
  reconstructed both the flex resolution pipeline and CSS stacking from experiment (engine as oracle),
  and verified the value-channel (D+P) mechanism executably. Added two governing principles — the
  **Alias law** and the **Derivation rule** — and resolved a batch of vocabulary rulings (space
  ownership → `gap`/`flow`/`pad`/`margin` applicators; density+padding unified; synonyms/dead-code removed).
- **2026-06-23** — First public draft. Origin framed around two precedents — desktop publishing's
  layout vocabulary, and atomic CSS's core move of bringing an expressive language onto the
  component (which this builds on, not against). Covers the
  three-dimensional architecture (plane ×
  role × scope), the four sibling grammars, the laws, the value-channel engine, the
  layout-as-laws/skin-as-consensus distinction, the falsifiable-narrative method (with the flex
  reconstruction story), the AI-as-auditor mechanism, and an honest inventory + limitations.

[Monky]: https://github.com/  <!-- TODO: link -->
