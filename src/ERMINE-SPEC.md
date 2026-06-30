# Ermine — Machine-Consumer Spec (derived)

> **Derived artifact. Do not edit here.** This document is a *mechanical extraction* of
> `ERMINE.md` (the constitution): the axis registry plus the laws, restated for the two
> *machine* consumers of the grammar. Register-flat, predicate-form, no metaphors, no rationale, no
> history. If this drifts from the constitution, the constitution wins — fix it there and re-extract.
> (The friendly, example-led document for *human* authors is the separate **human guide**.)

## Two machine roles share one registry

This spec serves two roles that **converge on the registry (§2) but diverge on what they do with it**.
The registry is the single source of truth — its *predicate face* is the linter, its *generative face*
is the LLM, its *generated face* is the shipped CSS. Both roles read the same records; they differ only
in direction.

| Role | Direction | Question | Reads |
|---|---|---|---|
| **Validator / linter** | judges a string that exists | "is this well-formed, and if not, *why*?" | §1 schema · §2 registry · §4 per-axis predicates · §5 cross-cutting predicates · §6 negotiated invariants · §7 trust boundary |
| **Author / LLM (generation)** | emits a string from intent | "what string expresses this, *without coining*?" | §1 schema · §2 registry · §3 generation contract · §4–§5 (as obligations, not just rejections) |

**Read-path — validator.** Skip §3. Run the three passes in §4–§5 in order; emit the error/warn codes
verbatim. §6 tells you what you must *not* flag (the negotiated regime is not part-wise checkable). §7
bounds how much to trust property-disjointness today.

**Read-path — author / LLM.** Start at §3 (the generation contract: closed-vs-open priors, the
compose-don't-coin reframe, the stop-and-report protocol, intent→string patterns). Treat §4–§5 as
*obligations you must satisfy before emitting* — most importantly P8 entailment (emit `selected` ⇒ you
are responsible for the backing existing) and P9 no-coining. Use §2 to resolve every word; never emit a
word you cannot point to in `members` or derive from a `parameter` pattern.

> **On the eventual split.** This single document keeps progress centralized while the structure
> settles (mirroring the constitution's "hold until stable, then extract" discipline). It is
> *pre-cut* for a later split along section boundaries: a lift of §3 (+ the §4–§5 obligation framing)
> becomes `LLM-AUTHORING.md`; §1–§2 + §4–§7 become `LINT-SPEC.md`; §2 is the shared registry both
> import. Until the size asymmetry that justifies two files is real, the split is deferred, not
> reconciled away. Section boundaries below are marked `‹LINT›`, `‹LLM›`, or `‹SHARED›` so the cut is
> mechanical when it comes.

---

## 0. How a class string is validated  ‹SHARED›

A class string is a set of words. Validation is three passes, in order:

1. **Parse** each word to `(axis, member, value?)` against the registry (§2). A word that resolves to
   no axis is `unknown-word`.
2. **Per-axis laws** (§4): one-word-per-axis, closed/open vocabulary, enumerated arity, weight-implies-
   direction.
3. **Cross-cutting laws** (§5): dimensional purity (`must-never-touch`), state entailment, no-coining.

**Two regimes** (every axis declares one):
- **free** — independent; axes commute and unify. Well-formedness is *part-wise* (validate each word
  against its axis in isolation).
- **negotiated** — a per-member demand resolved by a global solve (member-role sizing only). Does not
  satisfy dimensional purity; validated by the §6 invariants, not part-wise.

**Two roles** (every axis declares one): `container` (governs direct children, `> *`), `member`
(governs the element itself within its parent), `self` (the element's own box), `none`.

---

## 1. Registry record schema  ‹SHARED›

Each axis is one record:

```ts
interface AxisRecord {
  axis: string;                 // unique axis id
  sibling: "layout" | "state" | "motion" | "layering" | "skin";
  role: "container" | "member" | "self" | "none";
  signature: "set-with-exclusivity" | "ordered-chain"
           | "container-operation" | "negotiated-field";
  vocabulary: "closed" | "open";        // open = admits a stated parameter only
  regime: "free" | "negotiated";
  members: string[];                    // the words; in order if a scale
  default: string | null;               // unmarked value
  controls: string[];                   // concrete CSS properties it emits
  mustNeverTouch: string[];             // explicit out-of-scope ("*" = everything else)
  parameter?: { pattern: RegExp };      // open axes only: the sanctioned value form
  // state-only:
  stateCategory?: "capability" | "instance" | "conditioned-skin" | "relational";
  arity?: "binary" | "enumerated" | "continuous";
  driver?: "interaction" | "input" | "environmental";
  enumValues?: string[];                // arity === "enumerated": the closed value set
  entails?: string[];                   // instance/relational: backing SET, any-one satisfies
}
```

Field rules:
- `vocabulary` default expectation: numeric ratio/count/degree → **open**; perceptual or
  platform-mirrored (fixed scale, ARIA state set, named z-ladder) → **closed**.
- `entails` is a **set** (any-one satisfies), supporting Law 6b merges.
- `controls` lists must eventually be *generated from shipped CSS*, not transcribed; until then treat
  property-disjointness checks as indicative, not authoritative (see §7).

---

## 2. The axis registry (34 axes — see `registry.ts`)  ‹SHARED›

> **Source note (extraction revision).** The authoritative registry is now **`registry.ts`** (structured
> data), not this Markdown. This section is a human-readable mirror; when it disagrees with `registry.ts`,
> the data wins, and the data in turn derives from the constitution. The count is now meaningful: every
> state *group* is a first-class axis (`state.focus`, `state.selection`, …), so "one word per axis" is
> enforceable per group. 34 = 16 layout + 4 layering + 2 motion + 9 state-groups + 3 skin.

### 2.1 LAYOUT (§4.1)

#### structure
- role: container · signature: container-operation · vocabulary: closed · regime: free
- members: `horizontal` `vertical` `rows` `grid`
- default: `flow` (the unmarked inner display; `flow` is reserved for this default only, never a member)
- controls: `display` (inner), `flex-direction`, `grid-template-columns`, `grid-auto-flow`
- mustNeverTouch: `gap` `padding` `margin` `align-self` `flex` `background` `border`, outer display

#### m1-flow-participation (outer display)
- role: member · signature: set-with-exclusivity · vocabulary: closed · regime: free
- members: `inline` `boxed` `boxed-inline`  *(surface names provisional — guide-level)*
- default: natural (override-only)
- controls: `display` (outer)
- mustNeverTouch: `gap` `padding` `background`

#### m2-flex (give↔grab)
- role: member · signature: set-with-exclusivity · vocabulary: **open + whole-axis aliases** · regime: **negotiated**
- dials (open, one CSS longhand each): `grow-N` → `flex-grow:N` · `shrink-N` → `flex-shrink:N` (N ≥ 0)
- parameter: `/^(grow|shrink)-\d+$/`
- aliases (whole-axis, write BOTH longhands): `rigid`=grow-0 shrink-0 · `compressible`=0,1 · `expandable`=1,0 · `elastic`=1,1
- default: `compressible` (= CSS initials flex-grow:0 flex-shrink:1)
- controls: `flex-grow` `flex-shrink` — **emit longhands, never the `flex` shorthand**
- mustNeverTouch: `flex-basis` `min-width` `max-width` `gap` `align-self` `flex`
- composition rule (the single invariant): dials compose one-per-dial (`grow-2 shrink-1`); an **alias
  writes both longhands**, so it conflicts with any other m2 word (`expandable grow-2` double-writes
  `flex-grow`; `rigid grow-2`, `expandable shrink-2` likewise). Write an alias **or** the dials.
- per-dial default: an unspecified dial keeps its CSS initial, so **`grow-2` is not grow-only** (shrink
  stays 1); grow-only at weight 2 = `grow-2 shrink-0`.

#### m3-self-size (basis)
- role: member · signature: set-with-exclusivity · vocabulary: **closed + parametric member** · regime: **negotiated**
- members (closed): `basis-content` `basis-ratio` `basis-exact` — `basis-exact` is the parametric member
- parameter (closed value space): `/^basis-exact-(sm|md|lg|xl)$/` (size tokens; raw lengths OUT in v0)
- default: auto (`basis-content`)
- controls: `flex-basis` ONLY (does NOT control `align-self` — corrected, §10.1 collision 2)
- mustNeverTouch: `flex-grow` `flex-shrink` `min-width` `max-width` `align-self`
- note: bare `content`/`ratio`/`exact` are value words, never standalone classes; always `basis-` prefixed.
  Two members of this closed axis conflict (`basis-content basis-exact-md`).

#### m4-self-alignment
- role: member · signature: set-with-exclusivity · vocabulary: closed · regime: free
- members: `self-start` `self-center` `self-end` `self-stretch` `self-baseline`
- default: inherit group
- controls: `align-self`
- mustNeverTouch: `align-items` `justify-content` `gap`

#### m5-grid-placement
- role: member · signature: set-with-exclusivity (positional) · vocabulary: **closed + parametric member** · regime: free
- members (closed): `span` `row-span` (parametric, carry an integer) · `span-all` (contextual — spans every column)
- parameter (open value): `/^(span|row-span)-\d+$/` · plus the literal `span-all`
- default: auto-place
- controls: `grid-column` `grid-row`
- mustNeverTouch: `align-self` `flex` `gap`
- note: only meaningful under a `grid` parent. Two members conflict (`span-2 span-all`). `span-all`
  resolves to the grid's column count (`grid-column: 1 / -1`), not a value of `span-N`.

#### density (gap)
- role: container · signature: ordered-chain · vocabulary: closed · regime: free
- members (order): `tight` `snug` `comfortable` `relaxed` `loose` `separated`
- expression: `gap-<density>`
- default: `comfortable`
- controls: `gap`
- mustNeverTouch: `padding` `margin` `structure`

#### flow-spacing
- role: container · signature: ordered-chain · vocabulary: closed · regime: free
- members: `flow-<density>` (same scale)
- controls: `margin-block-start` (the owl `> * + *`)
- default: none
- mustNeverTouch: `gap` `padding` `display`
- constraint: correct ONLY for single-line, source-ordered block/prose flow

#### padding
- role: self · signature: ordered-chain · vocabulary: closed · regime: free
- members: `padding-<density>`, `padding-inline-<density>`, `padding-block-<density>` (same scale)
- controls: `padding`
- default: none
- mustNeverTouch: `margin` `gap` `display`

#### margin
- role: member · signature: ordered-chain · vocabulary: closed · regime: free
- members: `margin-<density>`, `margin-inline-<density>`, `margin-block-<density>` (same scale)
- controls: `margin`
- default: none (marked-by-preference: reach for it only outside container rhythm)
- mustNeverTouch: `padding` `gap` `display`

#### alignment-container
- role: container · signature: set-with-exclusivity (main/cross sub-axes) · vocabulary: closed · regime: free
- members: `align-start|center|end|stretch|baseline` · `justify-start|center|end|between|around`
- controls: `align-items` `justify-content`
- default: none
- mustNeverTouch: `align-self` `gap` `padding`

#### divider
- role: container · signature: set-with-exclusivity · vocabulary: closed · regime: free
- members: `divided` `undivided`
- default: `undivided`
- controls: `row-rule` `column-rule` (gap-decoration; fallback `:where(.divided > * + *)` leading border)
- mustNeverTouch: `border` `gap` `padding` `background`
- constraint: `divided` + `wrap-allowed`/`order`/reversed REQUIRES native gap-decoration; else degrade
  to no divider (the `* + *` fallback is correct only single-line source-ordered). Linter WARNS on this
  composition.

#### wrapping
- role: container · signature: set-with-exclusivity · vocabulary: closed · regime: free
- members: `wrap-allowed` `wrap-prevent` `wrap-reverse`
- controls: `flex-wrap`
- default: none
- mustNeverTouch: `gap` `display` `flex`

#### overflow
- role: self · signature: set-with-exclusivity · vocabulary: closed · regime: free
- members: `scroll-y` `scroll-x` `scroll-auto` `clip`
- controls: `overflow-x` `overflow-y`
- default: none
- mustNeverTouch: `display` `padding`

#### constraints
- role: self · signature: set-with-exclusivity · vocabulary: open · regime: free
- members: `min-width-*` `max-width-*` `min/max/fixed-N-col`
- parameter: carries values
- controls: `min-width` `max-width` `min-height` `max-height`
- default: none
- mustNeverTouch: `flex-grow` `flex-shrink` `flex-basis` `width`

### 2.2 LAYERING (§4.4)

#### z-scale (tier-2 only)
- role: member · signature: ordered-chain · vocabulary: closed · regime: free
- members (order): `base` `content` `raised` `dropdown` `sticky` `tooltip`
  *(TIER-2 ONLY; member list + ranges are a value-level `[RULING]`; structure frozen)*
- controls: `z-index`
- default: `base`
- mustNeverTouch: `position` `isolation` `display`
- note: only meaningful within an `isolation: isolate` context

#### top-layer-mechanism (tier-1 — NOT a z-scale)
- role: self · signature: set-with-exclusivity · vocabulary: closed · regime: free
- members: `overlay` `modal` `popover` `toast`
- controls: **none** (joined by *opening* — `showModal()`/popover/top-layer promotion; emits no `z-index`)
- default: none
- mustNeverTouch: `z-index` `position`
- note: ordered at runtime by last-opened-is-topmost. Choosing `modal` = promotion, not a number. This
  is a *different axis* from `z-scale` so the linter never treats `modal` as a z rung.

#### position-mode
- role: member · signature: set-with-exclusivity · vocabulary: closed · regime: free
- controls: `position`
- default: static
- mustNeverTouch: `z-index` `display` `inset`

#### stacking-context
- role: container · signature: set-with-exclusivity · vocabulary: closed · regime: free
- members: `isolate`
- controls: `isolation`
- default: none
- mustNeverTouch: `z-index` `position`

Tier-1 (`top-layer-mechanism`) = promotion, NOT z-numbers. Tier-3 (host-beating constant) = one
quarantined boundary value, never a scale member. Dynamic "what is on top, place above it" → JS, never a
coined CSS property.

### 2.3 MOTION (§4.3)

#### motion-micro (the atom, member-level)
- role: member · signature: set-with-exclusivity · vocabulary: mixed · regime: free
- parameters: `duration` (open skin scale) · `delay` (open skin scale) · `easing` (closed) · `direction` (closed)
- easing (closed): `decelerate` `accelerate` `standard` `emphasized`
- direction (closed): `symmetric` `asymmetric`
- controls: `transition-duration` `transition-timing-function` `transition-delay`
- mustNeverTouch: `animation` `transform` `background`

#### motion-macro (container-operation over micro edges)
- role: container · signature: container-operation · vocabulary: mixed · regime: free
- parameters: `stagger` (open skin scale) · `choreography` (closed)
- choreography (closed): `together` `sequence` `cascade`
- controls: `--stagger` (NOT raw `transition-delay`; composed additively — §10.1 collision 1)
- mustNeverTouch: `transition-duration` `transition-delay` `transform`
- compose rule: `transition-delay: calc(var(--own-delay,0ms) + var(--stagger,0ms))`

### 2.4 STATE (§4.2) — closed; mirrored from ARIA 1.2 + CSS Selectors L4 UI

Each **group below is a first-class axis** with id `state.<group>` (e.g. `state.selection`). Within a
group: set-with-exclusivity (one word per scope) — so P1 fires on `selected current` (same group).
Across groups: free composition — `hover selected invalid` is fine. State controls **nothing**
(`controls: []`); it carries the *condition only* and composes via `state × plane → rule`.

Each member: `(arity · driver · stateCategory · backing-set)`.

**focus group** (interaction) — resting none
- `hover` (binary · interaction · instance · `:hover`)
- `focus` / `focus-visible` (binary · interaction · instance · `:focus` / `:focus-visible`)
- `active` / `pressed-momentary` (binary · interaction · instance · `:active`)

**selection group** (interaction) — resting unselected
- `selectable` (— · interaction · **capability** · entails nothing)
- `selected` (binary · interaction · instance · {`aria-selected` ∨ `aria-pressed` ∨ `:checked`}) — Law 6b merge
- `checked-mixed` (enumerated · interaction · instance · {`aria-checked=mixed` ∨ `:indeterminate`})
- `current` (enumerated · interaction · instance · `aria-current` ∈ {page, step, location, date, time, true})

**availability group** (interaction) — resting enabled/idle/writable
- `disabled` (binary · interaction · instance · {`:disabled` ∨ `aria-disabled`})
- `read-only` (binary · interaction · instance · {`:read-only` ∨ `aria-readonly`})
- `busy` (binary · interaction · instance · `aria-busy`) — visual "updating" sense only

**disclosure group** (interaction)
- `expanded` (binary · interaction · instance · `aria-expanded`) — in-place; resting collapsed
- `open` (binary · interaction · instance · {`[open]` ∨ `:open` ∨ `:popover-open`}) — top-layer; resting closed

**validity group** (interaction) — resting valid/writable
- `invalid` (binary · interaction · instance · {`:invalid` ∨ `aria-invalid`})
- `user-invalid` (binary · interaction · instance · `:user-invalid`)
- `required` (binary · interaction · instance · {`:required` ∨ `aria-required`})
- `out-of-range` (binary · interaction · instance · {`:out-of-range` ∨ `aria-valuemin`/`max` breach})

**sort group** (interaction) — resting unsorted
- `sorted` (enumerated · interaction · instance · `aria-sort` ∈ {none, ascending, descending})

**drag group** (interaction) — resting at-rest
- `dragging` (binary · interaction · instance · pointer-drag/`@drag`)

**continuous-input group** (input-driven) — resting at-origin
- `scroll-progress` (continuous · input · instance · `scroll()`/`animation-timeline`)
- `drag-progress` (continuous · input · instance · pointer 0→1)

**environmental — NOT bare members; SCOPE PREFIXES** (Law 2 amended). A prefix opens a condition scope;
the word after the colon is an ordinary grammar word. Closed prefix set:
- `viewport-<bp>:` (`@media (width)`) · `viewport-portrait:` / `viewport-landscape:` (`@media (orientation)`)
- `container-<bp>:` (`@container`) — container-role (conditions on container size, distributes to children)
- `prefers-reduced-motion:` `prefers-color-scheme-dark:` `prefers-contrast-more:` `prefers-reduced-transparency:` (`@media`)

Parse a prefixed word to `{ scope: "viewport-md" | …, axis, member }`; P1 runs per scope. Example:
`horizontal viewport-md:vertical` is well-formed; `viewport-md:horizontal viewport-md:vertical` is not.

**relational** (interaction) — backing on the CONTAINER (inverted entailment)
- `active-descendant` (binary · interaction · **relational** · container `aria-activedescendant` === this id)

State category dispatch for entailment:
- `capability` → entails nothing.
- `conditioned-skin` → entails nothing.
- `instance` → entails its backing **set** on the element itself; any-one satisfies.
- `relational` → entails `container[attr] === member.id` (inverted).

### 2.5 SKIN (§5) — not grammar; sampled here only to test disjointness

#### skin-surface
- role: self · regime: free
- controls: `background` `color` `border` `border-radius` `box-shadow`
- mustNeverTouch: `display` `gap` `flex` `position`

#### skin-type
- role: self · regime: free · (font-size/line-height are §5.1 generated scales)
- controls: `font-size` `line-height` `font-family` `font-weight` `text-align`
- mustNeverTouch: `display` `gap` `flex` `margin`

---

---

## 3. Generation contract (author / LLM read-path)  ‹LLM›

This section is for the *generating* consumer — emitting a class string from intent. The validator can
skip it. Everything here is the constitution's anti-coining machinery restated as authoring priors. The
single dominant failure mode when generating is **inventing a plausible-sounding word**; every rule
below exists to prevent that.

### 3.1 The four moves, in order

When intent doesn't obviously map to a word, work down this list and **stop at the first that applies**:

1. **Find the member.** Resolve the intent to an existing `member` in §2. Most intent is one word on
   one axis. (`a row` → `horizontal`; `space between children` → `gap-*`.)
2. **Compose across axes.** If no single word fits, the felt gap is *usually a composition of existing
   axes*, not a missing word (Law 6). Combine one word each from several axes. ("Fill the parent" is
   not an axis — it is `expandable` (m2, main-axis) + `self-stretch` (m4, cross-axis). "A circle" is
   size grammar + a skin radius, not a `circle` word.)
3. **Use the open parameter.** If the axis is `open`, the distinction is a *value*, not a new word:
   `grow-2`, `span-3`, `basis-exact-md`, `padding-relaxed`. Emit a value matching the axis
   `parameter.pattern`; never a new word.
4. **Stop and report the gap.** If 1–3 fail on a `closed` axis, the word does **not** exist and you may
   **not** mint it. Surface a structured gap (§3.4) and stop. This is a legitimate terminal state, not
   a failure to try harder.

There is no fifth move. "Invent a word that sounds right" is never available.

### 3.2 Closed vs open — the prior that does the most work

- **closed** axis → the `members` list is *exhaustive*. A word not in it does not exist. Do not coin,
  do not pluralize, do not hyphenate two members together. (`structure`, `density`, `alignment`, all
  of state, the z-scale, easing, choreography are closed.)
- **open** axis → admits *only* its sanctioned parameter, by `parameter.pattern`. New **values**, never
  new **words**. (`m2` weights, `m3` `basis-exact-<size>`, `m5` spans, `constraints`.)

When unsure which an axis is, treat it as **closed** — that is the safe default and forces move 4 rather
than a guess.

### 3.3 Common coinages and their correct substitutions

These are the tempting inventions and what to emit instead. The pattern is always *compose or
parameterize*, never coin:

| Tempting coinage | Why it's wrong | Emit instead |
|---|---|---|
| `stretchy` | conflates two axes | `expandable` (grow) or `self-stretch` (cross-axis) — pick the one meant |
| `centered-grow` | bundles two axes | `expandable self-center` |
| `loose-wide` | density + a retired proportion idea | `padding-inline-relaxed padding-block-snug` (per-side) |
| `greedy` / `fill` | named a *symptom* of surplus | `elastic basis-ratio` |
| `circle` | plane-mix (size + skin) | size grammar + a skin radius token |
| `fixed` (sizing) | collides with `position:fixed` | `basis-exact-<size>` |
| `sticky-high` (z) | invents a scale rung | an existing `z-scale` member, within an `isolate` context |
| `dialog-on-top` | invents above-everything z | top-layer mechanism (tier-1), not a z-number |
| `stack` | a member that duplicates the default | `vertical` (the marked column) |

### 3.4 Stop-and-report protocol

When move 4 fires, do **not** emit a class. Emit a gap report the maintainer can act on:

```
GAP: axis=<axis or "unknown">, intent="<what was wanted>",
     tried=[member-lookup, composition, parameter],
     candidate-word="<the word you were tempted to coin>",
     note="<why composition/parameter did not cover it>"
```

A real missing distinction becomes a constitution `[RULING]`; a non-distinction is dropped. Either way
the decision is the maintainer's, made in the constitution, never improvised at generation time.

### 3.5 State entailment is an authoring *obligation*

Emitting a state word commits you to its truth. This is the one place generation carries a duty beyond
word choice (full predicate in §5, P8):
- Emit a **`state-instance`** word (`selected`, `open`, `invalid`, …) ⇒ you are responsible for *one of*
  its backing set existing on the element (`selected` ⇒ `aria-selected` ∨ `aria-pressed` ∨ `:checked`).
  A state class without backing renders something *visually true but semantically false* — never emit it.
- Emit a **`state-relational`** word (`active-descendant`) ⇒ the backing is on the **container**
  (`aria-activedescendant` pointing at this element's id), not the element.
- **`state-capability`** (`selectable`) and **conditioned-skin** entail nothing — safe to emit alone.

### 3.6 What is out of grammar — route, don't coin

Some intent has no grammar word *by design*. Route it; never invent a property:
- **ARIA wiring** (`aria-controls`, `aria-labelledby`, focus management, `inert`) → authoring/JS, not a
  state member.
- **"What is currently on top, place me above it"** → top-layer promotion (tier-1) or JS. There is no
  CSS-readable scalar for it; do not coin one.
- **Type, font, content size** → skin tokens (§5 of the constitution), not a layout word.
- **A specific component's one-off positioning** → identity residue, not grammar.

---

## 4. Per-axis predicates  ‹LINT› (authors: read as obligations)

### P1 — one word per axis, per condition scope (both regimes)
A well-formed string picks **at most one** member per axis **within each condition scope**. Parsing
assigns every word a `scope` (`base`, or an environment prefix like `viewport-md`). Bucket by scope,
then apply one-word-per-axis within each bucket.
- `horizontal vertical` → **error** `one-word-per-axis` (both `structure`, same `base` scope).
- `horizontal viewport-md:vertical` → **ok** (same axis, *different* scopes — the basis of responsive
  layout; Law 2 amended).
- `viewport-md:horizontal viewport-md:vertical` → **error** `one-word-per-axis` (same axis, same scope).
- Only **environmental** states open scopes; bare interaction/input states do not.

### P2 — closed vocabulary admits no new members
On a `closed` axis, any word not in `members` is rejected.
- `stretchy`, `loose-wide`, `centered-grow` → **error** `unknown-word` / `coined-word`.
- A missing distinction on a closed axis is either a composition across axes or a gap to report
  (`[RULING]`), never a coined word.

### P3 — open vocabulary admits only its stated parameter
On an `open` axis, only values matching `parameter.pattern` are admitted; no new *words*, only new
sanctioned *values*.
- `grow-3` ok; `growish` → **error** `bad-parameter`.

### P4 — enumerated arity must carry a value from its closed set
A state with `arity === "enumerated"` requires a value in `enumValues`.
- `sorted` with no value → **error** `enum-arity` (needs one of {none, ascending, descending}).
- `sorted=sideways` → **error** `enum-arity` (not in set).

### P5 — whole-axis aliases & per-dial conflicts (folded into one-word-per-axis)
*(No longer a standalone "weight-implies-direction" predicate — that was a cross-class rule for the
retired m2 split. It is now a consequence of the single invariant: no CSS property written by two
co-present classes, at longhand granularity.)*
On an `open + whole-axis aliases` axis (m2):
- a **whole-axis alias** writes *both* longhands, so it conflicts with any other word on the axis:
  `rigid grow-2`, `elastic grow-2`, `expandable shrink-2` → **error** `one-word-per-axis`.
- **dials** compose one-per-longhand-dial: `grow-2 shrink-1` ok; `grow-2 grow-3` → **error**
  `one-word-per-axis` (two values for the `flex-grow` dial).

### P6 — arity misuse (binary can't hold a tri-state)
A binary member cannot carry an enumerated value.
- `selected` with `aria-checked=mixed` backing → **error** `arity-misuse` (use `checked-mixed`).

---

## 5. Cross-cutting predicates  ‹LINT› (authors: read as obligations)

### P7 — dimensional purity (free regime)
For the free regime, no two axes touch the same CSS property, so a word must touch only its own axis's
`controls` and none of its `mustNeverTouch`. The checkable form runs over the whole registry (the §10.1
predicate-4 family):
- **4a self-consistency:** no axis controls a property it also forbids.
- **4b cross-axis disjointness (free):** no two free axes control the same property, except the
  documented container/member **twin** on a facet-split property (only `display`: `structure` sets
  inner, `m1` sets outer — CSS resolves independently).
- **4c free-vs-negotiated:** a negotiated axis may share with other negotiated axes (the flex solve)
  but must be disjoint from every free axis.
- **4d state controls nothing:** any state axis with non-empty `controls` is a violation.

A grammar word touching a `must-never-touch` property (e.g. a layout word emitting `background`) →
**error** `plane-mix`. This is also the decomposition test: split a class that mixes planes.

### P8 — state entailment (category-dispatched)
- `instance`: requires *one of* its backing set present on the element. None present →
  **error** `state-entailment` (e.g. `selected` with no `aria-selected`/`aria-pressed`/`:checked`).
- `relational`: requires the container's attribute to point at this member's id. Otherwise →
  **error** `state-entailment` (inverted).
- `capability` / `conditioned-skin`: entail nothing; never fire.

### P9 — no-coining (the extension contract)
1. Closed axes admit no new members (P2). A consumer that wants a word not present must **stop and
   report the gap**, never guess.
2. Open axes admit only their sanctioned parameter values (P3).
3. Aliases are **earned by recurrence**, never invented — codified only after a primitive combination
   demonstrably recurs in real use.

### P10 — divider/wrap interaction (warn)
`divided` composed with `wrap-allowed` (or any `order`/reversed member) where native gap-decoration is
unavailable → **warn** `divider-wrap`: must degrade to no divider, not mis-render.

---

## 6. Negotiated regime — invariants (not part-wise)  ‹SHARED›

Member-role sizing (`m2` give↔grab, `m3` basis, the min/max band) does not commute and is not validated
part-wise. Its correctness is the solver's invariants (the oracle is the engine; tests in §10):
- **conservation** — Σ settled = available space.
- **monotonicity** — more `grab` never shrinks you; more `give` never grows you.
- **ratio-invariance** — scaling all weights by *c* leaves the result fixed.
- **order-equivariance** — permuting members permutes the result identically.
- **clamp-idempotence** — applying `bounds` twice = once.

Phase order is `place ∘ negotiate` (never the reverse): the solver fixes sizes globally first;
placement positions each settled box locally after. The two never interleave — so an element may
legitimately carry `expandable` (negotiated) and `self-center` (free) at once.

---

## 7. Trust boundary  ‹SHARED›

- `controls` lists are currently **transcribed from prose**, not generated from shipped CSS. Property-
  disjointness checks (P7) are therefore **indicative**, not authoritative, until `controls` is derived
  from the generated output (the real build gate). A property an axis emits but the prose didn't name
  could hide a collision.
- Property-disjointness is **necessary, not sufficient** for compositionality: two property-disjoint
  axes can still interact through layout side-effects. Those are caught by outcome/browser tests, not
  by this static spec.
- Skin is **sampled** (surface + type), not exhaustive; a fuller enumeration could surface a grammar/
  skin overlap.

---

## 8. Reference: session scripts that mechanize this spec  ‹SHARED›

These run under `npx tsx <file>` and pass; **not yet committed** to `src/styles/grammar/`:
- `full-registry.ts` — populates all axes, runs P7 (4a–4d), prints the property-ownership index.
- `collision-analysis.ts` — diagnoses + proves the fixes for the two predicate-4 collisions.
- `registry-lint.ts` — P8 (entailment, set-valued), P4 (enum-arity), P6 (arity-misuse).
- `combobox-audit.ts` — `state-relational` (inverted entailment) confirming audit.
- `tree-audit.ts` — confirms `state-relational` stays at one member (admission filters independent).
