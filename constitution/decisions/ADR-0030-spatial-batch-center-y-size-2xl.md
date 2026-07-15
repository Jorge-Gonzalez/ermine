---
register: history
---

# ADR-0030 — spatial batch: `center-y` and size `2xl`

source: `reports/adoption/monky/RESIDUE-INVARIANCE.md`; `reports/adoption/monky/current-ledger.json`; `docs/proportional-plane.md`

This batch admits two low-risk spatial facts from the current Monky residue.

First, Monky's search-row edit control uses the pair `top: 50%` and
`transform: translateY(-50%)` to center a positioned affordance on the block axis. This is the
vertical counterpart to `center-x`: a containing-block midpoint plus self-size compensation.
The member is admitted as `center-y`.

`center-x` and `center-y` stay mutually exclusive in the registry because both write the whole
`transform` property. A future transform tuple rule may admit combined two-axis centering, but this
batch deliberately avoids inventing that composition machinery.

Second, Monky's page container keeps `max-width: 672px`, annotated in source and in the frozen
utility ledger as the `2xl` size step (`42rem`). The existing constraints axis already owns
`max-width-*`, so the grammar expands the layout size scale from `sm md lg xl` to
`sm md lg xl 2xl` rather than minting a separate `measure` axis. The theme still owns the
numeric value through `--size-2xl`.

Introduces amendment to R-SIZE-06 (positioned-centering family) and R-SCALE-01 (layout size scale).
