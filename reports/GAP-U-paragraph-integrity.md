# Gap Report — paragraph integrity across cascade layers

> **Resolved.** R-IMPL-02 (ADR-0020): the paragraph must be true or silent about every property; sanctioned overrides live in the `overrides` layer; all project CSS must be layered. Enforced by the `findShadowedWords` gate — whose first run found six real defeats (dead hover highlights shipped by earlier conversions, fixed at Monky 1faa1cc) and whose condition model distinguishes state layering and ancestor narrowing from genuine shadowing.

## What I was doing
Reviewing the transition dynamics after the surface-family dissolution. The layer order that
makes recipes work (`reset, theme, grammar, skin, components, overrides`) has a corollary:
any later-layer declaration beats any word for the same property on the same element,
silently. Three real cases hit it during the conversion cycles — the nav tab's transparent
border sentinel (components layer) permanently defeating any `current:` rule colour, and the
two editor min-height floors, one of which shipped an 88px regression the smoke caught when
a word was added without its local counterpart being removed.

## The decision that is missing
The system's value proposition is that the class paragraph is the design document. A defeated
word makes the paragraph *lie* — worse than silence, because readers and tools trust it.
Missing is the integrity contract: under what conditions may non-Ermine CSS override a word,
and how is the honest state enforced? Sub-questions:

- Is the invariant "a paragraph is true or silent about every property" normative?
- Where do *intentional* overrides live so that intent is visible in the cascade itself?
  (The `overrides` layer exists in the stack and is unused.)
- What about unlayered CSS, which the cascade spec ranks above **all** layers — third-party
  or careless project styles can defeat every word invisibly?
- Who verifies? No current lint or gate detects a shadowed word.

## Where I looked
Monky: the three layer-bound override records in `current-overrides.json`; the C5 smoke
regression; `styles.css` / `baseBundle.ts` (every sheet layered — protection by
construction); the shadow roots isolating overlay surfaces from host-page CSS. Ermine:
R-IMPL-01 (deployment membership), R-SKIN-10 (recipes legitimately own bundled properties —
which is why a global "later layers may not touch grammar-owned properties" rule is too
strict: recipe elements simply don't carry words for bundled properties, respecting the
per-element invariant already).

## Options I can see (NOT a recommendation)
- Rule the per-element invariant + sanctioned-override location (`overrides` layer) + the
  everything-layered requirement, with a shadowed-word check in the reconciler as the gate.
- Detection only: report shadowed words without a constitutional rule; projects decide.
- Restriction only: forbid later layers from grammar-owned properties globally — rejected
  above by R-SKIN-10's own logic, recorded here for completeness.

## What is blocked
Nothing renders wrong today. Blocked is trust at scale: without enforcement, every
half-converted element degrades the paragraph from design document to suggestion.
