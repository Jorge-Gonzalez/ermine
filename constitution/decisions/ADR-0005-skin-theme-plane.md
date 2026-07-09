---
register: history
---

# ADR-0005 — Skin and theme plane

source: `docs/skin-theme-ruling-draft.md`; `docs/SKIN-GRAMMAR-PROPOSAL.md`;
`reports/adoption/monky/SKIN-EVIDENCE.md`

The Monky adoption's `skin-local` residue (U5–U8) and a design-session word-game series
produced a skin color grammar and a theme-plane boundary. Colors compose as
carrier/role/intensity — ink/ground/rule × {accent, pass, warn, fail, note} ×
{soft, muted, faint} — a shape independently confirmed by GitHub Primer. Radius, type size,
motion duration, and motion stagger join spacing as scale-bound families; corner splits into
kind × magnitude; `font` is a multi-property namespace. The theme plane is registry-owned
sockets over project-owned values (the Design Tokens model), with a Radix-style ramp
available as a theme-side value generator.

Two decisions are provisional with data triggers: the four-step intensity ramp (versus a
leaner three) and `note` distinct from `accent`.

Deferred as Gap Reports, not ruled here: the data/graph color plane, an `overflow: hidden`
word distinct from `clip`, a 24px density step, the motion→animation reframe, and the
interaction-affordance plane (see `docs/plane-model.md`).

Introduces rulings: R-SKIN-02 through R-SKIN-08, R-SCALE-03.
