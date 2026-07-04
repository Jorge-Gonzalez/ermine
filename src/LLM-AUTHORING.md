# Ermine — LLM Authoring Contract (derived)

> Shared sections §1–§2 live in src/ERMINE-SPEC.md — read them there first.

This document emits a class string from intent: what existing registry words express the intent
without coining?

## Read path

Start at §3 for the closed-vs-open priors, compose-don't-coin reframe, stop-and-report protocol, and
intent-to-string patterns. Treat P1–P10 in Obligations as conditions to satisfy before emitting —
most importantly P8 entailment and P9 no-coining. Use shared §2 to resolve every word; never emit a
word that cannot be traced to the registry's value space or a sanctioned token parameter.

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
word choice (full predicate in `src/LINT-SPEC.md` §5, P8):
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

## Obligations

- **P1 —** Before emitting, choose at most one member per axis and condition scope, refined to one value per sub-dial; never combine a whole-axis word with another word on that axis.
- **P2 —** Before emitting a closed-axis word, verify that it is an existing member; otherwise compose or report a gap.
- **P3 —** Before emitting an open or parametric word, verify that its value matches the sanctioned parameter domain.
- **P4 —** Before emitting an enumerated state, include one value from its closed `enumValues` set.
- **P5 —** Before emitting flex character, use either one whole-axis alias or numbered grow/shrink dials, never both, with at most one value per dial.
- **P6 —** Before emitting `selected`, do not use mixed/indeterminate backing; emit the dedicated `checked-mixed` word instead.
- **P7 —** Before emitting, ensure each free-regime word stays within its axis `controls` and touches none of its `mustNeverTouch` properties.
- **P8 —** Before emitting an instance or relational state, ensure its required element or container backing exists with the specific value or relationship; capability and conditioned-skin words entail nothing.
- **P9 —** Before emitting any word, resolve it to a closed member or sanctioned open parameter; if neither applies, stop and report the gap rather than coining.
- **P10 —** Before emitting `divided` with `wrap-allowed` or `wrap-reverse`, surface the divider/wrap warning and verify graceful degradation.

