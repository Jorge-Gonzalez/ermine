---
register: history
---

# ADR-0038 — Effect atoms (`shake`)

source: Monky `.shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both }` + `@keyframes shake`

Opens the animation library layer — the named-effect vocabulary that sits one level above `tween`.
The lineage is settled: Flash/Director defined `tween`/`keyframe`/`timeline`/`ease`/`stagger`/`scene`;
it migrated to JS through GSAP and framer-motion; CSS received only the primitives (`transition`,
`@keyframes`) and never the named-effect library, which is why Animate.css exists. `shake`/`pulse`/
`flash` are that library's universal idioms.

Modelled as a **closed tween**: an effect bakes its interpolated property and target ("place") into
a motion-substrate `@keyframes` block, so the word carries no socket and emits only `animation`. The
`effect` axis therefore touches no property `tween` will own (the keyframes' `transform`/`opacity`
live inside the block, never on the element) — no P7 collision. The `@keyframes` ship as a stylesheet
prelude, emitted once and only when the atom is used (`src/css.ts#keyframesPrelude`).

Scope: `shake` is admitted (Monky applies it as SelectableGroup's rejected-removal feedback).
`flash`/`pulse`/`bounce`/`spin` are **reserved** — `flash` and `pulse` existed in Monky only as
unapplied dead code, and a general idiom without an application is not yet evidence to admit. The
element's `transition: none` suppression during a shake stays local identity wiring, not part of the
atom (the atom owns `animation`, not the element's transition policy).

Deferred to the next layers: `tween` (the open builder, transition-based, with the duration scale
and property-targeting question) and the `motion → animation` reframe. Introduces R-MOTION-07.
