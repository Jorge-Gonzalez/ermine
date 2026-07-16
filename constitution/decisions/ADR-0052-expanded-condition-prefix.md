---
register: history
---

# ADR-0052 — Expanded condition prefix

Status: accepted

## Context

R-STATE-12 admitted `current:` for element-owned attribute truth: the element itself carries the
attribute, so serialization can enforce the state without a capability word. Monky's content-editor
style trigger has the same shape. Its open visual state is backed by `aria-expanded`, not by
selection or pressed toggle state.

Leaving that state in `.is-active` component CSS hides a general disclosure condition that Ermine
already models as the `expanded` state member.

## Decision

Admit `expanded:` as an attribute-backed condition prefix over existing carrier words. It
serializes to `[aria-expanded="true"]` and requires no capability word.

## Consequences

Disclosure triggers can express their open skin with
`expanded:ground-defined expanded:ink-accent`. The generated selector cannot match unless the
application has asserted `aria-expanded="true"`, so the styling remains tied to platform truth.

Amends R-STATE-12.
