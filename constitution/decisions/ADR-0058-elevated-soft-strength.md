---
register: history
---

# ADR-0058 — `elevated-soft` elevation strength

Status: accepted

## Context

ADR-0010 admitted `elevated` as the cast-shadow treatment and deliberately left identity
shadows local. Monky's modal dialog kept a two-layer shadow plus `mix-blend-mode: multiply` as
modal identity. During the final assimilation pass, the project relaxed pixel-perfect fidelity:
the useful part was not "modal", nor the blend compositing detail, but a close, low-offset drop
shadow softer than the existing `elevated` default.

## Decision

Admit `elevated-soft` as a second member of the elevation treatment. It owns `box-shadow` on the
same axis as `elevated`, so the two conflict in the same scope. It reads a full shadow socket,
`--shadow-elevated-soft`, with an Ermine default:

```css
0 1px 2px rgb(0 0 0 / 30%), 0 2px 6px rgb(0 0 0 / 15%)
```

The default is intentionally neutral black rather than a palette role. A project can bind the
socket when its shadow geometry or colour wants theme control.

## Consequences

Close floating surfaces can be expressed without coining component names such as `modal-shadow`
or opening an arbitrary blur scale. `elevated` remains the normal raised surface. `recessed`
remains reserved for true inset-depth evidence. Blend-mode compositing is not part of the
treatment and stays project-owned when exact rendering requires it.

Amends R-SKIN-09 and ADR-0010.
