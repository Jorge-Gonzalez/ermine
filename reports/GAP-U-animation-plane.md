# Gap Report — animation plane (motion reframe)

> **Impact analysis complete** — `reports/ANIMATION-PLANE-IMPACT.md`. Decisive finding: no application consumes any motion word, so the reframe is Ermine-internal renaming plus one contained design question (the tween consumption word). Execution recommended; awaiting the go.

## What I was doing
Gaming the motion family and finding that Ermine's MOTION axes, though already ruled
(R-MOTION-01/02/04), carry a category error in their framing and names.

## The decision that is missing
Whether to re-frame MOTION as a cross-cutting **animation** plane and rename its members:
- `motion` → `animation` — the axis governs the temporal envelope of *any* change (color,
  size, shape animate, not only position), so "motion" wrongly narrows it.
- `motion-micro` → `tween`, `motion-macro` → `choreography` — an atom and a composition of
  atoms, not two scales of one thing.
- `scene` (view-level coordinated moment) named as the *outside exception* (component
  identity), not a grammar word.
- animation and interaction are two temporal planes that do **not** touch directly; state
  is the membrane (interaction writes state; animation envelopes state-driven change).

This revisits **settled rulings**, so it needs impact analysis and regeneration — a
larger cycle than the skin-value integration.

## Where I looked
`docs/plane-model.md` (the full derivation and prior-art contrast: Director/Flash,
framer-motion, GSAP, Material easing, statecharts/Elm); `src/registry.ts` MOTION;
R-MOTION-01/02/04.

## Options I can see (NOT a recommendation)
- Rename and re-frame per the plane model (animation / tween / choreography).
- Keep the current names; record the plane framing as rationale only.
- Partial: rename `motion → animation`, keep micro/macro.

## What is blocked
Nothing immediate — motion works as ruled. This is a clarity/architecture revision,
sequenced after the skin/theme work.

## Resolution progress — duration and open tween
Phase C had deferred naming duration steps even though the Monky evidence was already strong:
ordinary interactive transitions use 0.15s, and the slower feedback step uses 0.3s. ADR-0039 /
R-MOTION-08 resolves that part: the admitted theme-bound steps are `quick` and `settled`, exposed as
`--duration-quick` and `--duration-settled`, and consumed by `tween-quick` / `tween-settled`.

The first open tween deliberately targets `all` via transition longhands. The remaining fork is
property targeting (`color`, `opacity`, `border-color`, and measured compounds) plus the larger
mechanical rename (`motion → animation`, `motion-micro → tween`, `motion-macro → choreography`).
Effect atoms have also moved since this report was filed: `shake` is admitted by R-MOTION-07, while
unapplied `flash` and `pulse` remain reserved.
