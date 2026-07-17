---
register: history
---

# ADR-0021 — Disabled platform condition

source: the view-dissolution pass over Monky's `controls.css` — the `.btn` recipe's
`:disabled` block, seen across every button consumer.

R-STATE-10's closed set was "hover, active, focus". Dissolving the button recipe into words
surfaced `.btn:disabled { background: var(--tone-dim); color: var(--ink-soft) }` — a
conditioned skin override with no grammar surface, repeated on every consumer, exactly the
gap `hover:` filled for its condition.

`:disabled` is platform-supplied form state: the browser sets it from the `disabled`
attribute, no application assertion and no backing, which is the same authorship hover has.
The interaction-vs-form-state distinction does not divide the closed set — what the members
share is that the *platform* owns the condition, and `disabled` shares it. So this is the
`hidden`-into-R-OVERFLOW-01 shape: a one-sentence amendment admitting a member to an existing
closed set, not a new ruling.

Scope of the prefix: conditioned skin (ground/ink washes) and, after ADR-0063, the `blocked`
affordance cue when authored as `disabled:blocked`. The remaining mechanics that co-occur with
disabled — dimming `opacity`, hover guards, and event behavior — stay separate project or skin
decisions.

`active` was admitted alongside (its own evidence, `.btn:active`) without a rule change, since
R-STATE-10 already named it. `disabled` needed the amendment because the rule text did not.

Amends ruling: R-STATE-10. Introduces no new ruling.
