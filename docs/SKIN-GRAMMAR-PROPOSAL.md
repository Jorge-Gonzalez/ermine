# Skin Grammar — Proposal

Status: **proposal**, evidence stage. Nothing here is a constitution ruling; coining
Ermine words remains gated by R-VOCAB-03. This document records the vocabulary derived
during the Monky U5.1 skin work so it can be tested against U6/U7 evidence before any
ruling.

Evidence base: the Monky modal-search screenshot pair (old vs intended skin) and the
`humo` / `acera` / `mar` theme constants in `monky/src/theme/colorTheme/`.

## The derivation

**Assumption.** A standard UI sub-element occupies a rectangular space.

**Derivation.** In skin terms that rectangle is either made perceivable — *delimited* —
or it sits *flush* with its surroundings. Flush is the unmarked default; it needs no
word.

**Implication.** Background shift, border, rounded shape, shadow are not independent
skin axes. They are *means of one delimiter*. The semantic fact is the delimitation;
the mechanism is theme territory.

Ground, rule, corner, and shadow are therefore **facets of the one delimiter** — each
a way the rectangle becomes perceivable, combining to intensify a single delimitation —
not independent containment meanings that stack.

There is no `contained` keyword. An element becomes delimited by carrying any delimiter
facet — the same way an SVG shape with `fill="none" stroke="none"` renders nothing.
Corollary (soft lint): a `corner` word without any other delimiter facet usually
signals a mistake — except **identity clipping**, where the corner delimits by
clipping the element's own visible content (images, media, framed regions).

The screenshot pair validates the primitive: the entire visual difference between the
two panels is expressible as per-element re-answers to "delimited, or flush?" — the old
skin draws rules everywhere; the intended skin delimits the input and nav by ground
shift and corner, and lets rows separate by spacing alone.

## The method

The derivation generalizes into a recipe, used for every family below:

> Take a fact about how things render → identify the perceptual choice it forces →
> make the **choice** the word → leave the **mechanism** to the theme.

Words name choices, never mechanisms. This is R-SKIN-01's seam restated: fixed words
own their meaning, scale-bound words own step names while themes own numbers, open
sockets leave everything to the theme.

## The suffix rule (two tiers, mechanically bounded)

> If a generator with a number can produce the values → **t-shirt steps**
> (`sm md lg`, extensible `xsm … xxlg` at the extremes).
> If a theme hand-binds the values per mode → **narrative departure words**.

The suffix is itself a signal: `-md` says "generator scale underneath" (R-SCALE-01);
`-mid` / `-subtle` say "perceptual relationship, theme-resolved per mode."

Alias discipline for the narrative tier: every family has an unmarked **anchor** at its
perceptual default, plus at most three named departures. Aliases bind one-way
(word → position); interior growth is evidence for a new word, not an `x-` prefix.

## Families

### ground — the interior

The figure/ground relationship: ground is the layer the marks sit on (the *fondo*;
it is hiding inside back-*ground*).

```
ground   ground-subtle   ground-mid   ground-strong
```

Anchor = the ambient application background. Departures **gain** salience. The step
says only *how differentiated from ambient*; whether that departure is lighter, darker,
or more saturated is the theme's business per mode. (Recorded trap: Monky's
`--tone-dim` is *brighter* than `--base-tone` in dark humo — luminance-direction names
lie across modes. Ground words claim no direction.)

### ink — the marks

Everything drawn on the ground: text, icons, glyphs, anything `currentColor` reaches.

```
ink   ink-soft   ink-muted   ink-faint
```

Anchor = full-prominence ink. Departures **lose** salience — the opposite direction to
ground. That asymmetry is real and is why the two families do not share suffixes:
a mirrored set (`ink-strong`, `ink-lg`) would read as *more* prominent while meaning
*most receded*.

### rule — drawn lines

One word for what earlier drafts treated as two axes: the border around a delimited
element and the separator between flush neighbors are both *rules* (print register;
the platform agrees: `<hr>` is a horizontal rule, CSS has `column-rule`).

```
rule   rule-thick   rule-heavy
```

Anchor = the standard 1px line, because that is where usage overwhelmingly sits.
There is no hairline width: the sub-pixel "hairline" effect is a 1px rule wearing a
blended low-contrast color. To be precise about where quietness lives: it is a
**color binding**, not a rule word and not a treatment. The rule facet has one color
socket; the theme binds it, typically to a blended ground-family tone. If evidence
shows two rule prominences coexisting in one view, that becomes a words game then
(see open questions).

### corner — the delimiter's shape

Kind × magnitude. Kind comes from SVG's own corner vocabulary (`stroke-linejoin`):

```
kind:      miter | round | bevel
magnitude: corner-square   corner-sm   corner-md   corner-lg   corner-pill
```

Magnitude steps are generator-scale (R-SCALE-01 already claims radius), hence t-shirt
and extensible. The endpoints are fixed words because they are not magnitudes:
`square` is the zero where kind stops mattering; `pill` is a *saturation behavior* —
`border-radius: calc(infinity * 1px)` (fallback `9999px`), which the spec clamps to
half the shorter side. Never `50%`: that produces ellipses, not pills.

### treatments — composed effects

The layer above facets: named effects a theme composes from ground + rule + shadow.

```
raised   sunken
```

Perceived elevation, deliberately *not* ground aliases: a raised surface may bundle a
ground shift with a rule or shadow, and the bundle is the theme's choice. Conditioned
skin already has a registry precedent (`selection-treatment`); focus and selection
words belong to this layer when evidence warrants named choices.

### scroller — overflow affordance

A scroll container either claims real estate for its scrollbar as part of the layout,
or treats scrolling as a hidden mechanic.

```
scroller-explicit   scroller-implicit
```

(`hidden` was rejected: it collides with `overflow: hidden`, which means unscrollable.)

## The theme plane

The skin vocabulary is one side of a contract; the theme plane is the other. Monky's
theme system — which predates Ermine and was arguably the first empirical discovery of
the seam — shows where the split runs. Humo, acera, and mar are parameters; the
skeleton that accepts them is the integrable element.

- **Ermine theme plane** — everything value-free and framework-free: the `SkinSocket`
  type derived from the registry; `Theme = Record<SkinSocket, value>`; the theme × mode
  matrix and its resolution (including the `prefers-color-scheme` fallback); DOM
  application of a binding set; palette validation against the registry. This is a
  plane *within* Ermine, not a parallel project: the skeleton's identity comes from the
  socket list, which only the registry can define.
- **Project side** — everything that varies per app: the palette data, selection
  persistence, picker UI, framework glue.

Boundary test: Monky's `useThemeColors` should reduce to thin React glue around the
plane, and a non-React consumer should be able to use the plane with no dead weight.

Sequencing gate: Monky renames its constants to the new sockets first, as the evidence
pilot; the Ermine-side contract lands only once the vocabulary is ruled.

## Naming hazards recorded

Kept as tests for future words:

- **Platform collision** — `fill` and `stroke` are literal CSS property names, and SVG
  colors glyphs with `fill`; both rejected. `line` collides with text lines
  (`line-height`); `rule` disambiguates.
- **Direction lies** — words encoding luminance (`dim`, `deep`) or the wrong salience
  direction (`ink-strong`, `ink-lg`) flip meaning across modes or families.
- **Chain failure** — adjective ladders whose order must be memorized
  (`quiet/clear/strong`), and `extra-` prefixes (the insertion problem in costume).
  T-shirt sizing is the one culturally pre-ordered ladder, admitted for metric
  families only.
- **False friends** — `fund` (fondo → *ground*), `floating` (means "elevated" in
  design talk, the opposite of flush).

## Open questions

- Whether these words become Ermine vocabulary or stay Monky-local: decided by
  recurrence evidence from U6 (settings/editor) and U7 (overlays), not by this document.
- Migration of Monky's `--base-tone / --tone-dim / --tone / --ink-*` constants to
  ground/ink bindings across the humo/acera/mar × light/dark matrix.
- The radius generator's parameters (R-SCALE-02 keeps the slot open — steps are named,
  numbers are not).
- Treatment words beyond `raised`/`sunken` (focus, selection, hover reveal).
- The not-yet-ruled families in Monky's theme constants: `accent`, `harmonic`/`harmonic-minor`,
  the temperament set (`charged`/`active`/`calm`/`still`), and the `-wash` derivations.
  These roles predate Ermine and must be named before any binding contract freezes them.
- Whether adjacency ("drawn / implied / absent") needs words of its own or stays fully
  derivable from rule-vs-spacing usage.
- Whether a single view can need two coexisting rule prominences (quiet separators
  alongside pronounced dividers). If recurrence shows it, rule color graduates from a
  single theme socket to a ruled word.
