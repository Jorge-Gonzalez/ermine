# Toward a Semantic Style Grammar

*Notes from building a CSS layout language inside a browser extension.*

> **Status:** living document — updated as the work reaches things worth sharing.
> **Last updated:** 2026-07-01. See the [Changelog](#changelog) at the bottom.
> Companion to the constitution (`ERMINE.md`), the shared machine-consumer spec (`ERMINE-SPEC.md`),
> the validator and authoring contracts (`LINT-SPEC.md`, `LLM-AUTHORING.md`), the author's guide
> (`ERMINE-GUIDE.md`), the typed registry + linter (`registry.ts`, `lint.ts`), and the
> `flex-character` playground. (The project now has a name — **Ermine** — and, more importantly, a
> registry and a running linter; see [§7](#7-whats-actually-built).)

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

### 4.7 Two vocabulary primitives, and a case study in letting a model break

Building the registry forced a question the prose had been fudging: *how many kinds of vocabulary are
there?* Each axis declares whether its words are **closed** (an exhaustive set — don't invent more) or
**open** (a parameter admitted by a rule, like `grow-2` or `span-3`). Several axes looked like they
needed a *third* kind — something in between, a few named presets sitting on top of an open dial. I
tried three different framings of that third thing over the course of a long session. Each one
dissolved on inspection: what looked like a new primitive was always one of the two I already had,
just *applied at a different scope* (a closed axis whose one member happens to carry an open value) or
*wearing earned sugar* (an open axis with a handful of named points). The settled result is smaller
than where I started: **two primitives, applied at two scopes — the axis's membership, and a member's
value — with aliases as the only sugar.** No third kind survived examination. That's the no-coining
law (§4.5) turned inward on the grammar's own metalanguage: mint no new ontology, not even for
describing the vocabulary.

The clearest case study is **flex**, and it's really a story about the method (§5): following a pretty
model until it breaks, on purpose. CSS flex is genuinely strange — `flex-grow`/`flex-shrink` are two
independent dials, but we *talk* about flex with four words (rigid, compressible, expandable,
elastic). I spent a lot of effort modelling those four words as presets over the dials, with a "weight
modifier" you could add — `expandable` plus a `grow-2` to tune it. It felt right. It was wrong, and
watching it fail taught me the actual shape. The tell: to keep the "modifier" model consistent I'd had
to hand-write a special rule relating two supposedly independent axes — and *genuinely independent
things never need a bespoke rule tying them together.* The rule's existence was the evidence the split
was fake. The clean model turns out to be almost embarrassingly simple: the dials are the real axis;
the four words are **whole-axis aliases**, each a complete value (it sets *both* dials), so you write
**either** a word **or** the dials, never both. A word and a dial together (`expandable grow-2`) tries
to write the same CSS property twice — which is exactly the collision the dimensional-purity law
already forbids, now showing up one level down at the sub-property. No new machinery; the existing law
covered it once I stopped inventing a second one. The long detour wasn't wasted — it's the only way
I'd have trusted that the simple answer was *right* rather than merely *first*.

### 4.8 Layout is laws; skin is consensus
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

Honest inventory, so this isn't vaporware-by-blog-post. Since the last update the grammar picked up
two things it was missing — a **machine-readable registry** and a **running linter** — which move it
from "a document plus discipline" to something with a mechanized contract.

- **A constitution** (`ERMINE.md`) — the planes, roles, scope, laws, the four grammars, and the
  member-role family worked out in detail, with the reasoning (including the wrong turns) preserved.
  Open decisions are tagged `[RULING]`.
- **A typed registry** (`registry.ts`) — the laws as data: 33 axes, each with its vocabulary kind,
  role, regime, the CSS properties it controls, and what it must never touch. This is now the
  authoritative source the linter reads; when the prose and the registry disagree, the data wins.
- **A running linter** (`lint.ts`) — a parser plus a set of validation predicates, with a smoke suite
  of 70 cases. It actually rejects the things the constitution says are ill-formed and accepts the
  compositions it says are legal — *the laws made executable, and now checkable.* What it enforces
  today: one-word-per-axis (including sub-dial composition and per-group state rules, plus a
  refinement relation for states that are platform *subsets* of each other rather than alternatives),
  no-coining, a distinct diagnosis for a word whose *shape* is right but whose *value* isn't,
  enumerated-value arity that checks the actual value against the backing attribute (not just that
  the attribute exists), arity misuse, state entailment — including the *inverted* kind, where a
  child's state is backed by an attribute on its container — and a warning for a specific hazard
  (a between-children divider composed with wrapping). Every predicate the spec describes now has a
  real check behind it except one (below).
- **An interactive playground** — a flex "give↔grab / size-source" sandbox with guided scenarios
  and live numeric readouts (it has, more than once, falsified my own claims on screen).
- **A test strategy, instantiated** — *rule* tests (token → CSS), *outcome* goldens (real widths),
  and *law* tests (conservation, ratio-invariance, clamping). Two behaviours were **reconstructed from
  experiment** against the engine — the flex resolution pipeline and CSS stacking.

One of the smaller checks caught something none of the six earlier component audits surfaced: the
registry had a bare word, `sticky`, doing double duty — once as a named rung on the z-index scale,
once as the literal CSS `position: sticky` value — and the parser silently resolved it to whichever
axis happened to be listed first. Nothing crashed; `position: sticky` was just quietly unwritable.
It's the same shape of bug as the property collisions the dimensional-purity check exists to catch,
one layer up: not two axes fighting over a CSS property, but two axes fighting over a *word*. It got
the same treatment — a standing check, run over the whole registry, that fails loudly the moment two
axes claim the same token, rather than trusting that authoring discipline will notice.

Not built yet — and I want to be precise about the biggest gap, which is now also the *only*
specified predicate without a real check behind it. The linter reasons about which CSS properties
each axis controls from a **hand-transcribed** list in the registry, not from CSS it actually
generates. The check that two axes never fight over a property is therefore only as honest as that
transcription. Closing that means standing up a real **CSS emitter** so the property list is
*derived* from output rather than typed by hand — the point where the registry stops being a faithful
description and becomes executable in the strong sense. Also still open: the skin vocabulary, the
namespacing decision, and the convergence pass that pulls the shipping (v0) CSS into conformance.

---

## 8. Honest limitations

- **n = 1.** One app. The coherence might not survive data tables, dashboards, dense forms.
- **Enforcement is partial.** There is now a linter that checks the composition laws, so drift is no
  longer prevented by discipline alone — but it isn't yet wired into the build, and it verifies
  property-disjointness against a *transcribed* list rather than generated CSS. Real enforcement (in
  CI, against emitted output) is still ahead.
- **Still one target.** The vocabulary names intent, but the registry is coupled to CSS — the words
  compile to CSS, and only CSS. Calling the grammar "a layer above CSS" is true of the *words* and
  overclaims the *registry*; flex is where the coupling shows most. A genuinely target-independent
  version would need the intent and the CSS binding split into separate layers, which isn't worth
  building against a single target yet.
- **The perceptual vocabulary needs calibration.** `comfortable` means something only relative to
  its neighbours; a team would have to internalize the scale.
- **Racing the platform.** As CSS absorbs `@scope`, container queries, and friends, maintaining a
  bespoke layer has ongoing cost a shared framework amortizes.

None of these are fatal *for what this is* — a research direction and a personal language. They'd be
fatal for "adopt this instead of Tailwind," which is not the claim.

---

## 9. Roadmap

1. **Stand up the CSS emitter** — the highest-value next step. Once each axis *generates* its CSS,
   the property-ownership list is derived rather than transcribed, and the dimensional-purity check
   becomes authoritative instead of indicative.
2. Wire the linter into CI, so the laws are enforced on every change rather than on request.
3. Split the constitution into normalized documents (current law / rationale / log / spec / guide)
   linked by stable ids — referential integrity over Markdown, so the pieces read as one document.
4. Build the value-channel compile layer for real (`--space` + applicators), with `@property`.
5. The convergence pass: bring the shipping CSS into conformance and delete the v0 drift.
6. Decide the implementation-scope policy (Shadow-DOM-only vs a namespace).

---

## Changelog

- **2026-07-01 (session update)** — A registry-hardening pass, mostly driven by external review: real
  bugs found and fixed, real gaps flagged rather than silently patched. The concrete one worth telling:
  a bare `sticky` was doing double duty as both a z-index rung name and the literal CSS position value,
  and the parser silently picked whichever axis was listed first — `position: sticky` was quietly
  unwritable, and nothing said so. Fixed the collision and added a standing check (token uniqueness)
  so the registry itself now refuses to build if two axes ever claim the same word again — the same
  discipline the dimensional-purity check applies to CSS properties, one layer up, at words. The
  linter also picked up its last two smaller predicates (a distinct diagnosis for a
  right-shape/wrong-value word, and a warning for a specific divider/wrapping hazard), fixed a case
  where one malformed word was producing two competing error messages instead of one clear fix, and
  gained a genuine refinement relation for state words that are platform *subsets* of each other
  (`focus-visible` of `focus`) rather than modeling them as flatly incompatible. On the honesty side:
  found that `prefers-reduced-motion:no-motion` — used as the constitution's own worked example for
  how conditional prefixes are written — named a word that was never actually registered. Didn't coin
  one to make the example true; flagged it as an open gap instead, which is the whole point of the
  no-coining law applied to itself. Smoke suite: 47 → 70. Every predicate the spec describes now has a
  real check behind it except the CSS emitter (§7).
- **2026-06-30 (session update)** — The project got a name — **Ermine** — and, more substantially, the
  two pieces it was missing: a **typed registry** (`registry.ts`, 33 axes as machine-readable data) and
  a **running linter** (`lint.ts`, 47 smoke cases). The linter enforces one-word-per-axis (with
  sub-dial composition and per-group state rules), no-coining, enumerated arity, arity misuse, and
  state entailment — including the *inverted* kind (a child's state backed by its container). The
  "no enforcement" limitation is now only partly true. On the conceptual side, the **vocabulary shape**
  settled: two primitives (`closed`/`open`) applied at two scopes, with aliases the only sugar — no
  third kind survived (see [§4.7](#47-two-vocabulary-primitives-and-a-case-study-in-letting-a-model-break)).
  The **flex axis** was resolved via that lens (whole-axis aliases over independent dials), after a long
  and instructive detour that the section tells honestly. Refreshed [§7](#7-whats-actually-built),
  [§8](#8-honest-limitations), and the [Roadmap](#9-roadmap) — the headline open problem is now
  deriving property-ownership from *generated* CSS so the dimensional-purity check becomes authoritative.
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
