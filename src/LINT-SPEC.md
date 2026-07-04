# Ermine — Validator / Linter Spec (derived)

> Shared sections §1–§2 live in src/ERMINE-SPEC.md — read them there first.

This document judges a class string that already exists: is it well-formed, and if not, why?

## Read path

Run the three passes in §§4–5 in order and emit the error/warn codes verbatim. §6 tells you what
must not be flagged because the negotiated regime is not part-wise checkable. §7 bounds how much to
trust property-disjointness today; §8 records the current implementation surface.

---

## 0. How a class string is validated  ‹LINT›

**Precondition, checked once at the registry level, not per string: P0 token uniqueness.** Every
word in the finite/closed vocabulary must resolve to exactly one axis. `registry.ts` exports
`checkTokenUniqueness()`, run via `npx tsx registry.ts`; it fails the process (non-zero exit) if any
word matches more than one axis's tokens. This isn't a per-string lint rule — an ambiguous word
doesn't error at validation time, it silently resolves to whichever axis is listed first in
`REGISTRY`, permanently shadowing the other axis's meaning of that word. P0 catches the authoring bug
before it reaches a class string at all. (Caught a real collision this session: `sticky` matched both
`z-scale` and `position-mode`; fixed by prefixing `position-mode`'s members.)

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
- **Sub-dial refinement:** axes with sub-dials (m2 grow/shrink, alignment align/justify, padding/margin
  inline/block, overflow x/y, constraints min/max-width/min/max-height) admit one value *per dial*,
  since dials write disjoint CSS properties: `align-center justify-between` and
  `padding-inline-relaxed padding-block-snug` and `min-width-sm max-width-lg` compose; two values on
  one dial conflict. A **whole-axis** word (an m2 corner, `padding-<density>`, `scroll-auto`/`clip`)
  writes every dial, so it is mutually exclusive with any other word on the axis. (Constraints has no
  whole-axis word — there's no single term that sets all four bounds at once.)
- **State-group refinement:** within a `one` group, a second member is an **error**. Within a `many`
  group, a declared `conflicts` pair is an **error**; a declared `implies` pair (the narrower state is
  a platform subset of the wider) present together is a **`warn`**, not an error — it's redundant, not
  incompatible. Everything else in a `many` group co-occurs silently.

### P2 — closed vocabulary admits no new members
On a `closed` axis, any word not in `members` is rejected.
- `stretchy`, `loose-wide`, `centered-grow` → **error** `unknown-word` / `coined-word`.
- A missing distinction on a closed axis is either a composition across axes or a gap to report
  (`[RULING]`), never a coined word.

### P3 — open vocabulary admits only its stated parameter  ‹IMPLEMENTED›
On an open/parametric axis, a word matching the axis's *shape* (its dash-prefix) but not a
*sanctioned value* gets a dedicated `bad-parameter` diagnosis, via a `fallback` token listed after
the valid-value token (same ordering discipline as the enumerated-state fallback tokens — valid
matches win first). This is deliberately narrower than "any word that merely resembles the concept":
a word with no structural match at all (no dash-prefix) still correctly falls through to P2
`unknown-word` — P3 only fires when the *shape* is right and the *value* isn't.
- `grow-3` → **ok**. `grow-abc` → **error** `bad-parameter` (shape `grow-` recognized, "abc" isn't a
  sanctioned non-negative integer). `growish` (no dash) → **error** `unknown-word` (P2), not P3 — the
  shape isn't recognized at all.
- Same mechanism on `basis-exact-<size>` (`basis-exact-240` → `bad-parameter`, raw px is OUT in v0),
  `span-<N>`/`row-span-<N>`, and `constraints`' four dials (`min-width-huge` → `bad-parameter`).

### P4 — enumerated arity must carry a value from its closed set  ‹IMPLEMENTED›
A state with `arity === "enumerated"` must be written WITH a value from `enumValues`. The parser
captures a valid value via the per-member valid-value token; a bare or wrong-valued word matches a
fallback token (no value captured), which P4 flags — distinguishing the two cases:
- `sorted` (no value) → **error** `enum-arity` (needs one of {none, ascending, descending}).
- `sorted-sideways` (value not in set) → **error** `enum-arity` (not in {none, ascending, descending}).
- `sorted-ascending` → **ok**. (P8 entailment is suppressed for a malformed enum word — P4 owns it.)

### P5 — whole-axis aliases & per-dial conflicts (folded into one-word-per-axis)
*(No longer a standalone "weight-implies-direction" predicate — that was a cross-class rule for the
retired m2 split. It is now a consequence of the single invariant: no CSS property written by two
co-present classes, at longhand granularity.)*
On an `open + whole-axis aliases` axis (m2):
- a **whole-axis alias** writes *both* longhands, so it conflicts with any other word on the axis:
  `rigid grow-2`, `elastic grow-2`, `expandable shrink-2` → **error** `one-word-per-axis`.
- **dials** compose one-per-longhand-dial: `grow-2 shrink-1` ok; `grow-2 grow-3` → **error**
  `one-word-per-axis` (two values for the `flex-grow` dial).

### P6 — arity misuse (binary can't hold a tri-state)  ‹IMPLEMENTED (form b)›
The implemented form: a **binary** state whose backing is a tri-state truth that has its own dedicated
word.
- `selected` with `aria-checked=mixed` (or `:indeterminate`) backing → **error** `arity-misuse`
  (use the dedicated word `checked-mixed`).
- A binary word written with a value suffix (`selected-mixed`) is caught by **P2 `unknown-word`** —
  there is no such token — rather than P6; this is accurate and avoids over-matching typos with
  binary "base + illegal tail" fallback tokens.

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

### P8 — state entailment (category-dispatched)  ‹IMPLEMENTED›
- `instance`, binary: requires *one of* its backing set present on the element. None present →
  **error** `state-entailment` (e.g. `selected` with no `aria-selected`/`aria-pressed`/`:checked`).
  Suppressed for a word P6 already gave a more specific diagnosis (`selected` with mixed backing
  reports only `arity-misuse`, not also a redundant `state-entailment` — one fix, not two).
- `instance`, enumerated (**value-aware**, this revision): requires *one of* its backing set present
  **with the specific value the word carries** — `sorted-ascending` requires `aria-sort=ascending` on
  the element, not merely `aria-sort` present with any value (or a different one). Backing must be
  supplied as `attr=value` pairs for enumerated checks; bare-attribute backing no longer satisfies.
  Suppressed for a malformed enum word (P4 owns that diagnosis).
- `relational` ‹IMPLEMENTED›: requires the **container** to point at this element's id via the member's
  `relationalBacking.containerAttr` (e.g. listbox `aria-activedescendant` === this option's id).
  Otherwise → **error** `state-entailment-relational`. Needs a `LintContext` (`{elementId,
  containerAttrs}`); when no context is supplied the check is **skipped, not failed** (the linter can't
  see the container, so it doesn't guess).
- `capability` / `conditioned-skin`: entail nothing; never fire.

### P9 — no-coining (the extension contract)
1. Closed axes admit no new members (P2). A consumer that wants a word not present must **stop and
   report the gap**, never guess.
2. Open axes admit only their sanctioned parameter values (P3).
3. Aliases are **earned by recurrence**, never invented — codified only after a primitive combination
   demonstrably recurs in real use.

### P10 — divider/wrap interaction (warn)  ‹IMPLEMENTED›
`divided` composed with `wrap-allowed` or `wrap-reverse` → **warn** `divider-wrap`: the
between-children line assumes authored order, so verify it degrades to no divider rather than
mis-rendering once children can wrap or reverse. `wrap-prevent` is unaffected (order can't change).
Global check, not scope-bucketed. (There's no `order`/reordering axis in the registry yet to extend
this to — if one is added, it belongs in the same check.)

---

## 6. Negotiated regime — invariants (not part-wise)  ‹LINT›

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

## 7. Trust boundary  ‹LINT›

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

## 8. Reference: what the linter implements  ‹LINT›

**`lint.ts`** (runs under `npx tsx lint.ts`; smoke suite 70/70) implements, today:
- **P0** — token uniqueness (registry-build invariant, not per-string): every closed/finite word must
  resolve to exactly one axis. Run via `npx tsx registry.ts` (`checkTokenUniqueness()`), exits non-zero
  on any collision. Caught a real `sticky` collision between `z-scale` and `position-mode` this
  session — fixed by prefixing `position-mode`'s members (`position-static`, `position-sticky`, …).
- **P1** — one word per axis per condition scope, including the sub-dial refinement (m2, alignment,
  padding/margin, overflow, constraints) and per-group state exclusivity (`one`/`many` + pairwise
  `conflicts` as errors + pairwise `implies` as `warn`-level redundancy notices).
- **P2** — unknown/coined word.
- **P3** — bad-parameter: a word matching an open/parametric axis's *shape* (prefix) with an
  unsanctioned *value* (`grow-abc`, `basis-exact-240`, `span-abc`, `min-width-huge`) gets a specific
  `bad-parameter` diagnosis via a dedicated `fallback` token, rather than falling through to P2's
  coarser `unknown-word`.
- **P4** — enumerated arity (missing value vs value-not-in-set), via per-member valid + fallback tokens.
- **P6** — arity misuse, form (b): a binary word with a tri-state backing that has its own word. P6's
  target word is now suppressed from P8 (see below) so an author gets one diagnosis, not two.
- **P8 instance** — instance-state entailment (set-valued, Law-6b disjunction), **value-aware for
  enumerated states** (checks `attr=value`, not just attribute presence), suppressed for malformed
  enums and for any word P6 already gave a more specific diagnosis (`selected` with mixed backing
  reports only `arity-misuse`, not also `state-entailment`).
- **P8 relational** — inverted entailment against a container context (`LintContext`); skipped, not
  failed, when no context is supplied.
- **P10** — divider/wrap interaction: `divided` composed with `wrap-allowed`/`wrap-reverse` emits a
  `warn`-level `divider-wrap` notice (the between-children line assumes authored order).

**Not yet implemented in `lint.ts`** (specified above; deferred): P7 dimensional-purity *from
generated CSS* (the `controls` are still transcribed, not derived — the highest-value remaining
piece).

Earlier session scripts (not committed) that mechanized parts of this spec: `full-registry.ts` (P7 over
all axes + ownership index), `collision-analysis.ts` (the two predicate-4 collisions), `combobox-audit.ts`
/ `tree-audit.ts` (relational entailment). Folding their checks into `lint.ts` + CI is the open work.

