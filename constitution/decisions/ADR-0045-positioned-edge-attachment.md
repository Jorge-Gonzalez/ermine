---
register: history
---

# ADR-0045 — Positioned edge attachment

source: `reports/adoption/monky/RULE-ACTION-REVIEW.md` and the current Monky attachment residue
containing `top: 100%`, `left: 0`, and `right: 0` on an anchored command dropdown.

Monky has local dropdown placement rules that are not product identity: a positioned popup is
placed directly below its anchor and stretched to the anchor's inline edges. The values survive
re-resolution at another scale because they are edge relations, not measurements.

Options weighed:

- Leave local. Rejected: `top: 100%` and the paired inline edge pins are ordinary anchored
  placement facts and were already called out by the proportional-plane roadmap.
- Admit a dropdown recipe. Rejected: the relation is smaller than a recipe and composes with
  independently authored position mode, border, radius, width, and skin.
- Admit positioned edge relations. Chosen: `attach-below` emits `top: 100%`; `attach-above`
  emits `bottom: 100%`; `stretch-inline` emits `left: 0` and `right: 0`.

The existing positioned-centering words and the new edge-attachment words share one positioned
relation axis because they compete for physical offset slots. The axis now uses footprints:
`center-x` owns `left` plus `transform`, `center-y` owns `top` plus `transform`,
`attach-below` owns `top`, `attach-above` owns `bottom`, and `stretch-inline` owns `left` and
`right`. Therefore `attach-below stretch-inline` composes, while `center-y attach-below` and
`center-x stretch-inline` do not.

Out of scope: raw offsets such as `bottom: 52px`, offset anchors such as
`top: calc(100% + 4px)`, component arrow geometry, and top-layer or z-index policy.

Introduces R-SIZE-10.
