# Animation-plane reframe — impact analysis

`GAP-U-animation-plane` proposes renaming and reframing the motion family
(`motion → animation`, `motion-micro → tween`, `motion-macro → choreography`, `scene` as the
outside exception, animation/interaction as two temporal planes with state as the membrane)
and holds the Phase C defer for duration step naming. The gap report itself required this
analysis before execution, because the reframe is the first change that *renames settled
rulings* rather than adding law. This document is that analysis, measured at the post-C9
state.

## The decisive scoping fact

**No application consumes any motion word.** Monky's markup, manifest, and fixtures carry
zero of `decelerate/accelerate/standard/emphasized/symmetric/asymmetric/together/sequence/
cascade`. The reframe therefore requires **no application migration, no visual change, and
no smoke-baseline risk** — its entire blast radius is Ermine-internal renaming plus surface
regeneration. The "larger cycle" the gap report feared was sized before the adoption proved
the vocabulary unconsumed.

## Blast radius enumeration

| Surface | Touch |
|---|---|
| `constitution/ERMINE.md` | R-MOTION-01…05 retitle/renumber to R-ANIMATION-01…05 (or retitle in place); rule text renames (`micro`→`tween`, `macro`→`choreography`); cross-references in R-STATE-09, R-SCALE-02/03 prose |
| `constitution/ERMINE-RATIONALE.md` | 5 RAT entries + the plane-model derivation reference |
| `constitution/decisions/` | new ADR (the rename event); ADR-0002/0003 stay as history |
| `src/registry.ts` | `MOTION` array → `ANIMATION`; axis ids `motion-micro`/`motion-macro` → `tween`/`choreography` (~10 sites) |
| `src/emit.ts` | EMISSION keys, VOCABULARY, the `--stagger` sink comments, COMPOSED_PROOFS (~13 sites) |
| Generated surfaces | spec, guide, ownership, typed, vscode, corpus audits — all regenerate mechanically |
| Tests | 5 references (axis names in emission/ownership assertions) |
| `docs/plane-model.md` | already argues the target framing; becomes consistent instead of aspirational |
| Frozen ledger | the 9 `gap` rows (shake/pulse/flash keyframes + the `.shake` animation) reclassify — see below |
| Current ledger | `motion-followup` (~20 transition rows) waits on the duration scale, not the rename |

## The duration question (the Phase C defer)

Evidence: Monky's live transition rows are a two-step scale — `--transition-fast` (0.15s,
~18 rows) and `--transition-medium` (0.3s, 1 row) — consumed as
`transition: <properties> var(--transition-fast)`. Under the reframe:

- Duration stays an open external scale (R-MOTION-01's decision survives the rename), with
  step names finally christened. Two evidenced steps suggest two names; following the
  density scale's semantic-not-metric style, candidates: `brisk`/`deliberate` or
  `quick`/`settled`. Sockets: `--duration-<step>`, theme-bound, Monky binds 0.15s/0.3s.
- The consumption question is *what word carries the transition*: a `tween` word (the atom
  the reframe names) emitting `transition-property`/`transition-duration` reading the step
  socket is the natural shape — but which properties transition is per-element intent
  (color vs opacity vs border-color), so the emission design needs the same care
  `truncate`'s ownership split got. That design belongs to the reframe cycle, not before it.

## The 9 frozen keyframe rows

`shake`, `pulse`, `flash` are feedback signatures (error shake, confirmation flash) — under
the reframe's own vocabulary they are project *scenes*, the named outside exception, not
tween/choreography grammar. Disposition on execution: `identity-local` with evidence citing
the reframe's scene boundary. The `motion-followup` reason code then narrows to the
transition rows awaiting the duration scale.

## Execution plan (one cycle, Ermine-only until the last step)

1. ADR + retitled rulings (`R-ANIMATION-01…05`), rename rationale entries; decide
   renumber-vs-retitle with the doc system's stale-graph tooling.
2. Registry/emitter renames; regenerate all surfaces; test assertions follow.
3. Name the duration steps (two, evidence-bound) as theme-plane scale sockets.
4. Design and rule the `tween` consumption word (the transition-property ownership
   question) — this is the only genuinely new design work in the cycle.
5. Monky: bind the duration sockets, convert the ~19 uniform transition rows, reclassify
   the 9 frozen rows as scene identity.

Steps 1–3 are mechanical given this analysis; step 4 is the real decision; step 5 is a
standard consumption pass.

## Recommendation

Execute. The reframe's risk was consumer migration, and there are no consumers; what
remains is a rename with full regeneration coverage plus one contained design question
(step 4). The alternative — leaving the grammar's temporal plane named for its narrowest
member while `docs/plane-model.md` argues otherwise — keeps a standing inconsistency the
constitution's own derivation document already rejects.
