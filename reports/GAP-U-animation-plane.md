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

## Phase C evidence — duration step names deliberately wait here
Phase C considered naming duration steps now (R-MOTION-01 already places duration on an
open external skin scale; R-SCALE-02 leaves its step names open). The Monky evidence is
strong and uniform — ~19 transition declarations, essentially all `var(--transition-fast)`
(0.15s), with a single `--transition-medium` (0.3s) — a two-step scale waiting for names.
Deferred anyway: this report proposes renaming the motion family itself
(`motion → animation`, `tween`/`choreography`), and christening duration steps under the
old framing risks naming them twice. The ledger's nine motion `gap` rows and the current
ledger's `motion-followup` count stay attached here; whoever takes this reframe should
name the duration steps in the same cycle.
