---
register: history
---

# ADR-0062 — Recessed fail validation treatment

source: Monky `.input-error:focus { box-shadow: inset 0 0 0 2px var(--status-error-wash) }`
after the control-residue pass left it as the only visual row in `controls.css`.

The row is not the platform focus indicator. Monky already composes `focus:ring` for that, and
ADR-0014 keeps `ring` on `outline` so focus indication is not a box-shadow redraw. The row is
also not a component recipe: it is a reusable status emphasis for an invalid control, using the
same fail wash role already exposed as `--fail-faint`.

Admit `recessed-fail` on the elevation treatment axis. It owns `box-shadow` with the default:

```css
box-shadow: var(--shadow-recessed-fail, inset 0 0 0 2px var(--fail-faint));
```

This keeps all `box-shadow` ownership on R-SKIN-09 instead of creating a second ring axis.
The word may be authored under a state prefix, typically `focus:recessed-fail`, while the
application decides when the invalid state is present (`aria-invalid`, native validity, or a
project validation class). `recessed` without a role remains reserved until neutral inset-depth
evidence appears.

Introduces `--shadow-recessed-fail`. Refines ADR-0010, ADR-0014, and ADR-0058.
