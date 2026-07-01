# Ermine — Author's Guide

> A friendly, example-led introduction to writing class strings in the style grammar. This is the
> *teaching* face of the grammar; the exhaustive rules live in the machine-consumer spec, and the
> reasoning behind every decision lives in the constitution. You don't need either to get started.
>
> One honest caveat up front: this is a **typed grammar over CSS**, not "natural-language CSS." The
> words rename layout concepts into composable, checkable names — you still reason in layout terms
> (a row, a gap, something that grows), just lawful ones. If you know flexbox, you'll move fast.

---

## The one idea

You describe a UI by composing **words from different axes**. Each axis answers one question — *how do
children arrange? how much space between them? does this element grow?* — and you pick **at most one
word per axis**. Words from different axes never fight, so you just stack them:

```html
<div class="horizontal gap-comfortable padding-relaxed">…</div>
```

That reads as a sentence: lay children out in a *row*, with *comfortable* space between them, and
*relaxed* padding inside. Three axes, three words, no conflicts.

The rest of this guide is just *which words exist* and *how they combine*.

---

## Every element plays two roles

The same element looks two directions at once:
- **toward its children** (a *container*): how they arrange, how much they're spaced, how they align.
- **toward its parent** (a *member*): how it sizes itself, whether it grows, how it aligns itself.

These never conflict, so one element can do both:

```html
<!-- a row of things (container), that itself grows to fill its parent (member) -->
<div class="horizontal gap-snug expandable">…</div>
```

When you're reaching for a word, it helps to know which direction you mean. "Space *between* my
children" is a container job (`gap-*`); "*I* should grow" is a member job (`expandable`).

---

## Layout — the common surface

### Structure: how children arrange (container)

One word, picks the arrangement of direct children:

- `horizontal` — a row
- `vertical` — a column
- `rows` — wrapping rows
- `grid` — a grid

Bare (no word) = normal document flow. You only add a word when you want flex or grid.

### Spacing: four families, one scale (container / self / member)

All spacing reads the **same scale**, so the density words are always the same:
`tight · snug · comfortable · relaxed · loose · separated`.

What changes is *which property* owns the space:

- `gap-*` — space **between** children (the default for rhythm). `gap-comfortable`
- `flow-*` — space between children in **prose/block flow** where `gap` can't reach. `flow-relaxed`
- `padding-*` — space **inside** an element. `padding-snug`
- `margin-*` — an element's **own outward** space. Reach for this only when something needs space
  independent of its container's rhythm. `margin-loose`

You can use them together on one element — they're independent:

```html
<div class="padding-comfortable gap-snug">…</div>
```

Need a different amount on each side? Use the per-side forms — same scale, with `-inline` (left/right)
or `-block` (top/bottom):

```html
<div class="padding-inline-relaxed padding-block-snug">…</div>
```

### Alignment (container vs member)

- Container aligns its children: `align-start|center|end|stretch|baseline`,
  `justify-start|center|end|between|around`.
- A member overrides its own alignment: `self-start|center|end|stretch|baseline`.

```html
<div class="horizontal align-center justify-between">
  <span>left</span>
  <span class="self-end">nudged down</span>
</div>
```

### Sizing: does this element grow or shrink? (member)

This is the one place the grammar *negotiates* — members share the parent's space, so the result
depends on all of them together. Four everyday words cover almost everything — pick **one**:

- `rigid` — never grows, never shrinks
- `compressible` — shrinks if needed (the default)
- `expandable` — grows to fill space
- `elastic` — both grows and shrinks

Need to control *how much* one grows or shrinks relative to its siblings? Use the numbered dials
instead — `grow-2`, `shrink-3` — **and one rule to remember: use the words *or* the dials, never both.**
The four words each already set both grow and shrink, so `expandable grow-2` is a conflict (they both
try to set grow). For a custom amount, drop the word and say it with dials:

- `grow-2 shrink-1` — grows with weight 2, shrinks with weight 1
- `grow-2 shrink-0` — grows with weight 2, *doesn't* shrink

> **Worth knowing:** `grow-2` on its own is **not** "grow-only." A flex item shrinks by default, and
> writing `grow-2` doesn't change that — so `grow-2` grows *and* shrinks. If you want grow-only at
> weight 2, say it: `grow-2 shrink-0`. (Grow-only at the normal weight is just `expandable`.)

And where its size *starts from* (a separate choice — pick one):

- `basis-content` — size to its content (Figma's *Hug*)
- `basis-ratio` — take a share of the space (like `1fr`)
- `basis-exact-md` — a specific size from the size scale

```html
<!-- two columns that split space equally regardless of content -->
<div class="horizontal">
  <div class="elastic basis-ratio">…</div>
  <div class="elastic basis-ratio">…</div>
</div>
```

> "Fill the parent" isn't one word — it's `expandable` (grow along the row) plus `self-stretch` (stretch
> across it). That's the grammar working as intended: a felt gap is usually a *combination* of axes you
> already have.

### A few more container words

- `divided` / `undivided` — a line drawn *between* children (not on each child). `undivided` is the default.
- `wrap-allowed` / `wrap-prevent` / `wrap-reverse` — wrapping behaviour.

---

## State — styling by condition

A **state** word names *when* something is true (hovered, selected, disabled), never *what it looks
like*. You compose the condition with the look:

```html
<div class="selectable selection-subtle">…</div>
```

`selectable` says "these can be selected"; `selection-subtle` is the skin for the selected look. Keeping
them separate is the point — the same condition can drive different looks.

The everyday state words: `hover`, `focus`, `selected`, `disabled`, `expanded`, `open`, `invalid`,
`required`. States from different groups stack freely (`hover` + `selected` + `invalid` can all be true
at once).

> **One rule worth internalizing:** a visible state must be *backed by the real thing*. If you mark
> something `selected`, the element also needs its real selection truth (`aria-selected`, `aria-pressed`,
> or `:checked`). Otherwise it *looks* selected but isn't — which trips up assistive tech and the linter.
> The grammar styles the condition; you still set the condition.

### Responsive is just state

There's no separate responsive system. A breakpoint is a *condition* like any other, so a responsive
layout is a state word composed with a layout word:

```html
<div class="vertical viewport-md:horizontal">…</div>
```

The same shape covers preferences. Like the breakpoint prefixes above, these are written as a
**condition prefix**, not a bare word — the part after the colon is an ordinary grammar word from
whichever axis fits:

```html
<div class="prefers-color-scheme-dark:selection-strong">…</div>
```

> One honest gap: `prefers-reduced-motion` is a real condition prefix, but there isn't yet a
> registered word for "turn motion off/down" to pair it with — motion's current words
> (`decelerate`, `standard`, `together`, …) all still animate. Per the golden rule above, don't
> invent one; this is a real capability gap, flagged to the maintainer rather than coined here.

---

## The golden rule: don't invent words

This is the single most important habit. **If a word you want doesn't exist, it almost never means the
grammar is missing something — it means you compose two words you already have.** When you're stuck,
work down this list and stop at the first that fits:

1. **Is there a word for it?** Look it up.
2. **Can two words say it together?** ("Centered and growing" = `expandable self-center`.)
3. **Is it a number on an open axis?** (`grow-2`, `span-3`, `basis-exact-md`.)
4. **None of the above?** Then the word genuinely doesn't exist — don't make one up. Flag it to the
   maintainer so it can be decided properly.

A few tempting inventions and what to write instead:

| You might reach for… | Write instead |
|---|---|
| `stretchy` | `expandable` or `self-stretch` (decide which you mean) |
| `centered-grow` | `expandable self-center` |
| `loose-wide` | `padding-inline-relaxed padding-block-snug` |
| `circle` | size word + a skin radius token |
| `stack` | `vertical` |

Why so strict? Because the whole value of the grammar is that the words are *few, composable, and
checkable*. The moment everyone invents their own synonyms, the meaning stops surviving without reading
the CSS — which is the one thing this is built to prevent.

---

## Don't mix planes in one class

A class should do **one kind of thing**. Layout words arrange; skin words (colour, border, font) decorate;
a state word names a condition. If you find a class trying to set a background *and* a layout *and* a
hover colour, split it:

```html
<!-- mixed: layout + appearance fighting in one class -->
<div class="card-row">…</div>

<!-- split: each plane named separately -->
<div class="grid padding-comfortable selection-subtle">…</div>
```

The reward is that everything composes cleanly and you can swap the skin without touching the layout.

---

## A worked example

A selectable list row that expands when chosen:

```html
<ul class="vertical gap-snug divided">
  <li class="grid padding-comfortable selectable selection-subtle"
      aria-selected="true">
    …row content…
  </li>
</ul>
```

Reading it back: a **column** (`vertical`) of rows with **snug** spacing and a **line between** them
(`divided`); each row is a **grid** with **comfortable** padding, is **selectable**, wears the
**selection** skin, and carries its real `aria-selected` truth. No bespoke CSS — every word is shared
grammar, and the row's only custom code is its true one-off bits (the expand animation, its subgrid
span).

That shrink-to-residue is the goal: compose grammar + skin in markup, and write CSS only for what's
genuinely unique to this component.

---

## Where to go next

- Need the exact, exhaustive word lists and the validation rules? → the **machine-consumer spec**.
- Want to know *why* a decision was made, or propose a change? → the **constitution** (`ERMINE.md`).
  All changes are made there first; this guide is derived from it.
