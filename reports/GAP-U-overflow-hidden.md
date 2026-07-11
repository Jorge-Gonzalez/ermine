# Gap Report — no `overflow: hidden` word

> **Resolved.** R-OVERFLOW-01 amended (ADR-0013): `hidden` admitted to the closed overflow set, distinct from `clip`; consumed in Monky at 2bf5ab2.

## What I was doing
Migrating Monky's SiteToggle (U8). A text container used `overflow: hidden` to enable
flex truncation. Ermine's overflow axis has `scroll-x/y/auto` and `clip` — but `clip`
emits `overflow: clip`, which is *not* `overflow: hidden` (no scroll container, no BFC).

## The decision that is missing
Whether Ermine's overflow axis should gain a word for `overflow: hidden` distinct from
`clip`, or whether `clip` is the sanctioned clipping primitive and `hidden` stays
component identity.

## Where I looked
`src/registry.ts` overflow axis (`scroll-x|scroll-y|scroll-auto|clip`); `src/emit.ts`
overflow emission; `reports/adoption/monky/pilots/PAGES.md` (the SiteToggle case).

## Options I can see (NOT a recommendation)
- Add a `hidden` word emitting `overflow: hidden` (scroll container + BFC semantics).
- Rule `clip` the only clipping word; `overflow: hidden` remains identity.
- Split the two behaviours explicitly (clip vs hidden) with distinct words.

## What is blocked
One Monky declaration (SiteToggle) kept as inline identity to preserve exact behaviour.
No broad blockage; recurrence in later surfaces would raise the priority.
