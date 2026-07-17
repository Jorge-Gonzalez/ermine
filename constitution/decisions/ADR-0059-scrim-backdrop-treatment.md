---
register: history
---

# ADR-0059 — `scrim` backdrop treatment

Status: accepted

## Context

After the modal structure and soft elevation passes, Monky's modal backdrop still carried one
general paint declaration:

```css
background-color: var(--shadow-color);
```

The adjacent `z-index: 10000` is host/attachment identity: it exists to win inside an injected
extension page context. The colour declaration is different. It describes the translucent field
between an overlay and the page behind it, and it must not be represented with element opacity,
because the modal dialog is a descendant of the backdrop.

## Decision

Admit `scrim` as a backdrop-dimming treatment on the `skin-ground` axis. It owns `background`,
conflicts with ordinary `ground-*` words in the same scope, and reads a full background-colour
socket with an Ermine default:

```css
background: var(--scrim, rgb(0 0 0 / 35%));
```

The default is intentionally neutral black alpha rather than a palette role. A project may bind
`--scrim` when its overlay dimming should follow a theme-specific alpha or colour policy.

## Consequences

Overlay backdrops can use a semantic word without inventing component names such as
`modal-backdrop-bg`. `alpha-*` remains opacity on the rendered element and descendants, so it is
not the right word for backdrop dimming. Stacking tiers, top-layer mechanisms, and host-beating
z-index constants remain layering/host identity and are not part of `scrim`.

Amends R-SKIN-21.
