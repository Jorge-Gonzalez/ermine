---
register: history
---

# ADR-0063 — Blocked affordance

source: Monky `.btn:disabled { cursor: not-allowed }` after disabled colour and opacity were
already expressed through `disabled:*` skin words.

The remaining declaration is not button identity. It is the read side of an unavailable
interaction: the same plane as `pressable`, but with the opposite cue. Admit `blocked` on the
affordance axis, emitting only:

```css
cursor: not-allowed;
```

The word does not disable the element, suppress pointer events, dim opacity, neutralize hover,
or own `user-select`. Those are state, behavior, or recipe decisions. For native disabled
controls, author it as `disabled:blocked` beside disabled skin words. `pressable` and `blocked`
remain mutually exclusive in the same scope because both own the cursor cue.

Refines ADR-0019 and ADR-0021.
