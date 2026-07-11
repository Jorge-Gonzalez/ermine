---
register: history
---

# ADR-0010 — Elevation treatment

source: Phase C — the elevation follow-up named at the U8e theme binding.

The theme plane bound `shadow` as a colour socket and deliberately parked its geometry: "its
geometry belongs to the elevation treatment, not here" (SKIN_PLANE plane data). Since then every
box-shadow in Monky has been a project literal. The current ledger holds five under the
`elevation-followup` reason code: the modal dialog (two-layer, `mix-blend-mode: multiply`), the
editor style dropdown, the editor toast, the suggestions overlay container, and the command
suggestions panel.

Options weighed:

- A size-graded scale (`shadow-sm/md/lg`), Tailwind-shaped. Rejected for now: the evidence shows
  two tiers at most, and size names say how (blur pixels) rather than what (the surface's
  relation to its ground) — the admission test's what-not-how bar.
- Socket-only (theme binds the socket, no Ermine default). Rejected: carriers ship default
  colours (R-SKIN-03); the parallel treatment ships a default geometry, so the word works before
  a theme binds it.
- The follow-up's working names `raised`/`sunken`. Rejected on collision: `raised` is already a
  z-scale stacking tier (`base content raised dropdown sticky tooltip`) and one word resolves to
  one axis. Stacking order and depth treatment are genuinely different planes.
- `elevated` with a like-named socket (`--shadow-elevated`) and an Ermine default composed on
  `var(--shadow)`; `recessed` (inset) named as the reserved family member — the
  hover/active/focus admission pattern. Chosen.

Out of scope, recorded as boundary: the modal's multiply-blend two-layer shadow is an identity
signature, not scale evidence; rings (focus, error) are conditioned skin or project identity, not
elevation.

Introduces ruling: R-SKIN-09. Refines R-SKIN-08. Anticipated by R-SKIN-03's plane data.
