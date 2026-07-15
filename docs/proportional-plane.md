# Direction — the proportional layout plane (easy case)

Status: **direction / exploration.** Not a ruling. This captures the easy-case model of
proportional layout, derived across the spacing (density→T-shirt) and clamp sessions and the
metric-theory discussion that followed. The **hard case** — layouts whose *relationship* changes
with the substrate (reflow, collapse, named regions) — is deliberately out of scope here; it is
conditioning, and Ermine already has it (the `container-<bp>:` / `viewport-<bp>:` scopes).

This is direction, not a constitution ruling. The open questions in the last section are the
author's to settle (U-R1).

## The two metrics (the foundation)

A layout value is one of two kinds, and the kind decides whether it is a grammar word or a
theme socket:

- **Relational metric** — a comparison *between* geometric objects: proportion, ratio, order
  ("centered in," "fills," "half of," "spans three of twelve"). It carries its own value — a
  ratio needs no unit — so it is **scale-free** and self-sufficient. → a **grammar word, no socket**.
- **Parametric metric** — the *resolution* a shape needs to exist in a medium at all: the grain,
  the discrete step. Under the working stance that there is no continuum, the grain is primary —
  a shape *is* the discrete thing, and the relation is the pattern across grains. → a **theme
  socket / scale** (the spacing scale, the grid's track count).

**The invariance test** (an admission criterion, alongside coherent / what-not-how / general):
would the value survive if the whole design were re-rendered at a different resolution?
- survives unchanged → **relational** → a word (`fill`, `center`, `third`).
- scales with the grain → **parametric-on-grid** → a scale reference (a spacing step, a grid track).
- neither → an **off-grid parametric value** → project identity (a deliberate resolution
  violation, e.g. a hand-tuned `52px`).

This is the theory behind Ermine's socket model — [[density-words-retired]] applied it to
spacing (the scale is the parametric grain; the steps are not a sampled continuum) — extended
here to position and size.

## The easy case: anchor + propagate

The easy case is not "we know the container." It is: **one dimension is pinned (the anchor), and
the rest follow by proportion.** The only thing the grammar must name is *which anchor* and *the
ratio*. That is small and closed, which is why it is the base. The anchor's source is the
**relatum** — the second object the relation is taken against.

## The three relata

### 1. Container-relative — `fill`
`fill` = 100% of the parent's content box; `fill-inline` → `width: 100%`, `fill-block` →
`height: 100%` (the `padding`/`margin` dial shape). Reads: `vertical fill-block`. It is pure
proportion, so it needs **no socket**. Distinct from flex growth: `grow-1`/`expandable` (m2) fill
a *flex* container's main axis; `fill` is the *explicit/block* 100% case. Viewport fill
(`100vh` — a different relatum, the viewport) is a separate word, reserved.

`cover` = attach a positioned element to all four edges of its containing block (`inset: 0`).
It is the edge-coverage sibling of `fill`: also container-relative and socket-free, but it names
edge attachment rather than self-size. It composes with `position-absolute` / `position-fixed`;
it does not imply either position mode.

### 2. Self-relative — `aspect` / `square`
Know one of the element's *own* dimensions; the other follows by ratio. The relatum is *self*,
not the parent. `square` (1:1) is the concrete member (Monky evidence: `aspect-ratio: 1`);
`wide`/`video` (16:9) is the obvious sibling; arbitrary ratios reserved pending evidence.

### 3. Grid-relative — the external general metric
The strongest form: **externalize the parametric metric into one shared declaration, and leave
every element purely relational.** The container declares the grid; elements carry only a
proportion.

- **`columns-12`** declares the grid — 12 equal `fr` tracks. This one word *is* the layout's whole
  parametric metric: the discrete grain, the resolution, "no continuum" made explicit as twelve
  tracks rather than a continuum of positions.
- **Intent-proportions** ride it and are the primary interface — `half`, `third`, `quarter`,
  `two-thirds`, `three-quarters`, `sixth` — each a relational word that compiles to a span. So a
  two-column page is `aside third`, `main two-thirds` — *not* `span-4` / `span-8`.
- **`span-N`** stays as the escape for irregular placements (the arithmetic form, demoted below
  the intent words).

**Why 12 — the centerpiece.** Twelve is not "because Bootstrap." It is the coarsest resolution at
which the common relational proportions land on *exact integer* tracks — the parametric grain
chosen so the relational metrics come out whole:

| proportion | tracks (of 12) | exact |
|---|---:|:--:|
| whole | 12 | ✓ |
| three-quarters | 9 | ✓ |
| two-thirds | 8 | ✓ |
| half | 6 | ✓ |
| third | 4 | ✓ |
| quarter | 3 | ✓ |
| sixth | 2 | ✓ |
| fifth | 2.4 | ✗ |

Twelve sacrifices only the fifth (which layouts rarely want) and captures the whole common set.
Ten would give halves and fifths but not thirds or quarters. Finer highly-composite grains (24,
60) buy eighths and fifths at the cost of a coarser-is-simpler grid; 12 is the sweet spot. This
is the two metrics doing their jobs: the relational intent (`third`) rides the parametric
substrate (12 tracks) and instantiates exactly.

## Rows and responsiveness — already in Ermine

- **Rows are rhythm, not a symmetric track count.** Horizontal space is divided by proportion;
  vertical space is *paced* — the Swiss baseline grid, not equal `fr` tracks. Ermine's spacing
  scale (`gap`/`flow`) already *is* that vertical rhythm, so there is no `rows-M`; rows stay
  content-sized and paced by the scale, with `row-span-N` for 2D placement when needed. The
  columns/rows asymmetry the frameworks stumbled into is correct under the two metrics.
- **Responsiveness is the existing scopes.** `container-md:third`, and a Material-style responsive
  resolution `container-lg:columns-12`, fall out of `container-<bp>:` with no new machinery. The
  hard case (relationship *changes*) is where a scope is the right and minimal tool.

## What is already built vs genuinely new

Grounded against the current registry:

- **Already built:** `structure` (relationships — and by `R-STRUCTURE-01` *compose-don't-coin*,
  patterns like sidebar/cluster are compositions of atoms, **not** words); `m2-flex` (flex
  fill/hug); `m3-self-size` (`basis-content` = hug); `m5-grid-placement` (`span-N`/`span-all`);
  `subgrid` (inherited tracks); the breakpoint scopes.
- **Already admitted from this direction:** block-`fill` (distinct from flex-grow),
  `aspect`/`square`, and `cover` (all-edge attachment).
- **Genuinely new (easy case):** `columns-N` (the grid metric) and the intent-proportions
  (`half`/`third`/…) over the grid.

## The interface principle

> Relationships first (structure atoms), proportion-intent second (`third` over `columns-12`),
> numeric placement (`span-N`) only as an escape.

This sits beyond Bootstrap's span arithmetic (`span-4` names a number, not an intent) and beyond
Tailwind's direct CSS transcription (`grid-cols-[14rem_minmax(0,1fr)]` is concise CSS, not a
design language), while keeping both as valid lower-level escapes. The piece neither prior-art
survey could name — intent-proportions over a ruled grain — is what the two-metric distinction
makes expressible.

## Deferred (the hard case) and reserved (pending evidence)

- **Hard case, not here:** intrinsic/constraint-driven layout (`auto-fit`/`minmax`, "when does the
  relationship collapse") and named regions (`grid-template-areas` topology). Both are conditioning
  on the substrate — the `container-<bp>:` scope + `structure` atoms — and get their own cycle.
- **Reserved members:** fractions beyond the common set; arbitrary aspect ratios; viewport-`fill`;
  a per-container `columns-N` override of the shared 12 (admit-one-member-with-evidence, the
  `clamp-N` pattern).

## Open questions (author to settle)

1. **Grid count** — a ruled fixed **12** as the shared external metric (predictable: `third` = 25%
   everywhere), or a per-container `columns-N`. Leaning fixed-12; the "why 12" argument is its
   justification.
2. **Aspect** — a small named set (`square`, `wide`) or a free ratio. Leaning named-set + reserved
   arbitrary.
3. **Reference frame's formal status** — whether the relatum (container / self / viewport / grid) is
   a first-class named object in the grammar or inferred from context. This is the load-bearing
   design question the metric paper should discipline; it decides whether the plane is a handful of
   words or a small frame-aware system.

## Prior art

Bootstrap / MUI (12-column span), Bulma (implicit equal-share), Foundation XY (directional cells),
Tailwind / Chakra / CSS Grid (native tracks), Every Layout (intrinsic constraints),
`grid-template-areas` (named regions), `subgrid` (inherited tracks). Ermine's contribution is not a
seventh grid — it is **intent-proportions over a ruled parametric grid**, justified by the
relational/parametric split, with the structural relationships kept atomic (compose-don't-coin) and
the responsive/topological layer left to the existing scopes. Relates to [[grammar-admission-test]]
and the plane model (`docs/plane-model.md`).
