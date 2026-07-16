---
register: history
---

# ADR-0051 — Pressed condition prefix

Status: accepted

## Context

Ermine previously let `selected` be backed by `aria-pressed` under the Law 6b merge. That was
adequate for bare state entailment, but it broke down once application-asserted states gained
condition prefixes. A `selected:` selector can honestly serialize to `[aria-selected="true"]`;
it cannot also mean `[aria-pressed="true"]` without making the generated CSS choose the wrong
platform truth for toggle buttons.

Monky's content-editor toolbar exposed the seam. Its active buttons are real toggle buttons with
`aria-pressed`, not selected options with `aria-selected`.

## Decision

Admit `pressed` as a binary application-asserted state member backed by `aria-pressed`. Admit
`pressed:` as a backed condition prefix. It requires the existing `pressable` affordance and
serializes to `[aria-pressed="true"]`.

`selected` no longer accepts `aria-pressed` as backing. It remains item-selection truth backed by
`aria-selected` or `:checked`; `checked-mixed` remains the dedicated mixed/indeterminate state.

## Consequences

Toggle-button state can use ordinary carrier composition such as
`pressable pressed:ground-defined pressed:ink-accent` without local `.is-active` skin CSS.
Selection and pressed truth no longer share a selector path, so generated CSS stays faithful to
the platform attribute that actually exists in markup.

Amends R-STATE-11.
