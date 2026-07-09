# Skin & Theme — Ruling Draft (for ratification)

Status: **DRAFT for human ratification.** Nothing here is in the constitution yet. This
consolidates the word-games that post-date `docs/SKIN-GRAMMAR-PROPOSAL.md` (which remains
the evidence/derivation record) plus the U8b triage and the prior-art contrast (Primer,
Radix, Design Tokens). Ratifying any of it into `constitution/ERMINE.md` is the author's
act (U-R1, U-R9); an executor may not admit vocabulary. Proposed rule IDs are placeholders.

## 1. Theme/skin boundary

**Ermine owns** (value-free): the socket names and families, the `Record<SkinSocket,value>`
contract, palette-completeness validation, the theme × mode resolution *interface*, and a
framework-free DOM application helper. **Projects own**: palette values, user theme
selection and persistence, framework glue, and migration timing. The skeleton's identity is
the socket list, which only the registry can define — so this is a plane *within* Ermine,
not a parallel project.

*Proposed:* **R-THEME-01** — The theme plane is registry-owned structure over
project-owned values; a project theme is an exhaustive, validated binding of exactly the
registry's sockets, resolved across theme × mode.

## 2. Admitted vocabulary (proposed rulings)

**R-SKIN-02 — Delimiter default.** A rectangle is *delimited* only by carrying a delimiter
facet (`ground`, `rule`, `corner`); *flush* is the unnamed default and needs no word. A
`corner` with no other facet is a soft-lint, except identity clipping (media/framed
content).

**R-SKIN-03 — Color carriers.** `ink` owns `color`, `ground` owns `background`, `rule` owns
`border-color`. Each carrier anchors a default color and full intensity; the anchor is
unnamed.

**R-SKIN-04 — Carrier/role/intensity composition.** Color words compose as
`<carrier>[-<role>][-<intensity>]`. The role slot overrides the hue; the intensity slot
overrides prominence; each unnamed slot is its anchor (default hue, full intensity). A role
never stands alone — it rides a carrier, which is why it cannot collide with a property
owner. (Confirmed by GitHub Primer's `[carrier]-[role]-[intensity]`; `fgColor/bgColor/
borderColor` = `ink/ground/rule`.)

**R-SKIN-05 — Intensity ramp.** Anchor + `soft`, `muted`, `faint` (receding). *Four steps,
provisional* — revision trigger: reduce toward three (`anchor/muted/faint`) if evidence
shows `soft` unused. The theme owns realization (alpha channel or `color-mix` into ground).

**R-SKIN-06 — Color roles and the constrained palette.** Roles are `accent` (brand
pointing) and the status set `pass warn fail note` (a shared *reporting register*, not one
axis). `note` is kept distinct from `accent`, *provisional* — revision trigger: fold into
accent-toned info if data shows no separate need. The interface palette is deliberately
constrained; the *data/graph* palette is a different plane and is **out of scope** here
(GAP below). Anchor placement: bare role = the full/solid color (diverges from Primer's
subtle-default; chosen for authoring intuition).

**R-SKIN-07 — Corner.** Kind × magnitude. Kind `miter | round | bevel` (fixed, from SVG
`stroke-linejoin`). Magnitude `square` (zero) → `sm md lg` (scale) → `pill` (saturation,
`calc(infinity*1px)`). Endpoints fixed; interior scale-bound.

**R-SKIN-08 — Typography namespace.** `font` is a multi-property responsibility area (like
the delimiter), with sibling composable facets: size (rung-2 t-shirt scale `sm md lg xl`),
weight (`medium semibold bold`), typeface variant (`mono`). Facets compose because they own
disjoint properties; the parser separates them by disjoint value vocabularies.

**R-SCALE-03 — Scale-bound skin families.** Radius (corner magnitude), type-size, motion
`duration`, and motion `stagger` are rung-2 scale-bound alongside spacing: grammar owns the
step names, the theme owns the numbers (generator params remain open per R-SCALE-02).

## 3. Socket contract (for the skeleton)

Derived mechanically from §2 — the theme fills every socket; validation fails on any
missing/extra. Shape (illustrative, not exhaustive):

```
ink, ink-soft, ink-muted, ink-faint
ink-accent[-soft|-muted|-faint]      ground-accent[-…]     rule-accent
ink-{pass,warn,fail,note}[-…]        ground-{…}[-…]        rule-{…}
--radius-{sm,md,lg}   --font-size-{sm,md,lg,xl}   --font-weight-{medium,semibold,bold}
--duration-<steps>    --stagger-<steps>
```

Theme-side value generation may use a Radix-style 12-step hue ramp (position → usage) to
fill the semantic sockets from one base hue — semantic authoring on top, positional ramp
underneath.

## 4. Deferrals (proposed Gap Reports)

- **GAP-U-dataviz-palette** — the data/graph color plane (Plane 2): indexed/generative,
  versatile by design; warm↔cold / temperament naming lives here, not in the interface
  palette. Explicitly outside the constrained skin palette.
- **GAP-U-overflow-hidden** — Ermine's overflow axis has `clip` but no `hidden`
  (`overflow: clip` ≠ `hidden`: no scroll container/BFC). Add a `hidden` word, or rule
  `clip` the sanctioned primitive and `hidden` identity?
- **GAP-U-density-2xl** — no density step at 24px (between `loose` 20 and `separated` 40).
- **GAP-U-animation-plane** — `motion → animation`; `micro/macro → tween/choreography`;
  `scene` as the outside exception; animation as a temporal plane. See `docs/plane-model.md`.
- **GAP-U-interaction-affordance** — lift interaction *affordance* to capability words
  (`selectable → pressable/draggable/…`), leaving *behavior* (IoC) in components; state is
  the membrane. See `docs/plane-model.md`.

## 5. Prior art (verified at source)

- **GitHub Primer** — `[carrier]-[role]-[intensity]` composition; confirms R-SKIN-03/04/06.
- **Radix Colors** — 12-step positional scale; the theme-side value generator (§3), the
  road deliberately not taken for authoring.
- **W3C Design Tokens / Style Dictionary** — the socket-as-token, theme×mode resolution
  model behind R-THEME-01.

## 6. What ratification needs from the author

Per family in §2: admit / retain-project-local / defer. The two live judgment calls are the
**intensity-ramp depth** (four vs three) and **`note` vs accent** — both currently drafted
as *keep, with a data-triggered revision*. Everything else is derivation validated by prior
art and ready to rule.
