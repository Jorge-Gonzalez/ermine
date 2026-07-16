---
register: history
---

# ADR-0047 — Role-measured dimensions

source: `reports/adoption/monky/RULE-ACTION-REVIEW.md`, especially the `dimension-constraint`
rows after the side-corner pass.

Monky's remaining dimension pressure is real but non-homogeneous:

- overlay and popover measures: 200px, 240px, 280px, 320px, 360px, and an 8em command cap;
- dialog bounds: `min(600px, calc(100vw - 2rem))` and `min(560px, 85vh)`;
- result-list caps: 256px and 400px;
- control and icon chrome: 16px, 18px, 24px, 28px, 32px, 36px, and 48px;
- reset endpoints: `width:auto` and `height:0`.

Options weighed:

- Expand the generic layout `--size-*` scale to include every observed number. Rejected: it would
  mix popover widths, control chrome, scroll caps, and layout tracks in one ladder.
- Leave all rows local. Rejected: the patterns repeat across surfaces and survive the invariance
  test as role measures.
- Admit role-measured dimension words backed by role sockets. Chosen. The grammar names the role
  and footprint; the project binds the measured values.

The explicit self-size axis now admits `dialog-measure`, `width-popover-*`,
`control-box/inline/block-*`, `separator-mark-*`, `width-auto`, and `height-none`.
The constraints axis admits role-bound min/max words for popovers, command caps, result caps,
control minimums, and editor minimums.

Amends R-SIZE-11.
