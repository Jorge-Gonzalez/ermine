# Gap Report — density gap at 24px (2xl)

## What I was doing
Migrating Monky's modal nav tab (U8). Its inline padding is 24px, which falls between
the density steps `loose` (20px) and `separated` (40px) — no density word names it.

## The decision that is missing
Whether the density scale needs a step at 24px (a `2xl`-equivalent between `loose` and
`separated`), or whether 24px values stay component identity.

## Where I looked
`src/registry.ts` density scale (`tight snug comfortable relaxed loose separated`);
`reports/adoption/monky/pilots/PAGES.md` (the modal-nav-tab case). Note R-SCALE-01/02:
the density scale is generator-defined, so a new step is a generator question, not a
hand-added value.

## Options I can see (NOT a recommendation)
- Add a step at 24px to the density generator's output.
- Leave 24px as identity; the generated scale stays as ruled.
- Revisit the generator parameters (R-SCALE-02) so the scale includes 24px naturally.

## What is blocked
One Monky declaration (modal-nav-tab padding) kept as component identity. No broad
blockage.
