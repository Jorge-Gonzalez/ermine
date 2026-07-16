---
register: history
---

# ADR-0055 — `alpha-*` opacity treatment

Status: accepted

## Context

ADR-0018 admitted `concealed` and `revealed` as opacity endpoints for conditioned visibility, but
left mid-opacity values unruled because the early evidence mixed emphasis intents. Monky's current
residue narrowed the problem: remaining generalizable rows were literal alpha treatments such as
`opacity: 0.35`, `0.6`, and `0.9`. Naming those values as `muted`, `soft`, or `faint` would invent
a semantic scale the evidence does not prove.

## Decision

Admit `alpha-<percent>` on the existing opacity treatment axis, where `<percent>` is a multiple of
5 from 5 through 95. The word emits `opacity: <percent / 100>`.

`alpha-0` and `alpha-100` are not admitted. The semantic endpoint words remain `concealed` and
`revealed`, so conditioned visibility stays readable and does not gain synonyms.

## Consequences

Authors can express bounded mid-opacity paint without raw CSS or false semantic names:
`alpha-35`, `alpha-60`, `hover:alpha-90`. Because these words share the `concealment` axis,
they conflict with each other and with `concealed` / `revealed` in the same scope, while scoped
state overrides still compose normally.

Amends R-SKIN-16 and ADR-0018.
