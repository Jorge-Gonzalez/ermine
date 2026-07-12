# Gap Report — data/graph color plane (Plane 2)

> **Held for evidence.** The conversion arc (2026-07) deliberately did not take this question: it has zero Monky rows, and every ruling that landed cleanly was evidence-gated. It waits for a real graph/dashboard consumer.

## What I was doing
Ruling the skin color plane (R-SKIN-05). The interface palette is deliberately
constrained (ground/ink/rule + accent + pass/warn/fail/note); dashboards, graphs, and
infographics need many perceptually-distinct colors instead.

## The decision that is missing
Whether Ermine owns a second, *versatile* color plane for data visualization —
indexed/categorical series, sequential and diverging ramps — or leaves it fully
project-local. Its requirements are the opposite of the interface palette's
(many/distinct/indexed vs few/coherent/semantic), so it must not share the interface roles.

## Where I looked
`docs/skin-theme-ruling-draft.md` §4; ADR-0005; R-SKIN-05 and its rationale. Prior art:
categorical/sequential/diverging palette practice (e.g. the dataviz-skill palette model).

## Options I can see (NOT a recommendation)
- A separate Ermine `data-color` plane with indexed series + generated ramps.
- Leave data color entirely project-local; Ermine rules only the interface palette.
- A minimal shared primitive (a hue-ramp generator) usable by both planes.

## What is blocked
Nothing on the interface palette. Only a home for graph/dashboard color, currently
deferred. The temperament/warm-cold naming (Monky's charged/active/calm/still) would
migrate here if this plane is admitted.
