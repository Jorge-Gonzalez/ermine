---
register: history
---

# ADR-0039 — Open tween duration (`tween-quick`, `tween-settled`)

source: Monky transition residue: repeated `transition: ... var(--transition-fast)` plus one
`--transition-medium` binding in `src/styles/theme/metrics.css`.

Admits the open tween layer. A tween is the builder beneath named effect atoms: it does not bake in
the target value. Instead, state or a conditioned skin rule supplies the new value and the tween
supplies the temporal envelope for the interpolation.

The first duration scale has two named steps:

- `quick` — Monky's 0.15s interactive feedback step.
- `settled` — Monky's 0.3s slower feedback step.

The emitted sockets are `--duration-quick` and `--duration-settled`; themes bind the numeric values.
The grammar consumes those sockets through `tween-quick` and `tween-settled`.

Emission uses `transition-property: all` plus `transition-duration: var(--duration-*)`, not the
`transition` shorthand. This keeps easing as an independent closed vocabulary
(`standard`, `emphasized`, etc.) and avoids a source-order bug where a later shorthand would reset a
previously authored easing word.

This is intentionally the universal first form. Property-targeted tween words (`color`, `opacity`,
`border-color`, compound sets) remain deferred until the animation-plane pass measures them as their
own fork. Introduces R-MOTION-08.
