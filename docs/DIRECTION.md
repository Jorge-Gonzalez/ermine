# DIRECTION — what Ermine is becoming, and how we'll know

> This is the strategy register. The [README](README.md) orients a stranger; this
> document governs the work. It changes when gates are passed or rulings alter course.
> Execution detail lives in [`ERMINE-WORK-ORDERS.md`](ERMINE-WORK-ORDERS.md).

## 1. The reframe

Ermine set out as one thing — a structural style grammar — and, in the way of projects
treated as discovery rather than construction, turned out to contain four. The registry
is the product; the grammar is its first and flagship consumer:

| Id | Subproject | Thesis to prove |
|---|---|---|
| **A** | LLM-native language | A closed grammar + reason-bearing verifier makes model-generated UI measurably more reliable than open-vocabulary emission |
| **B** | Verifier engine | The predicate machinery is vocabulary-independent: bring your words, we check your algebra |
| **C** | Measurement instrument | Scale adherence and residuals are measurable properties of real CSS, useful even to non-adopters |
| **D** | Multi-surface registry | One registry compiles to class strings, typed props, and CSS, with equivalence enforced by test |

They share a **kernel** (K): the constitution's three-register restructure with stable
IDs and an integrity-checked reference graph, registry→doc generation with no-diff CI,
complete emission, and the published core package. Nothing in A–D may fork the kernel.

## 2. Why parallel, and why it's safe

The synergies are load-bearing, not decorative: C produces the evidence A's contract
cites; B is the abstraction A's verifier and D's typegen both consume; A's gap harvest
is a continuous empirical-adequacy probe feeding the constitution; D's typed surface is
B's second proof of vocabulary-independence.

The classic failure of between-areas work — four fronts, none finishing — is defended
against architecturally: **each subproject's gate is an evidence statement reachable
alone.** If only one lands, it stands by itself; the connections multiply value rather
than prop up weakness.

## 3. Gates and status

A gate is passed when its evidence exists in the repo, not when effort was spent.

| Gate | Evidence required | Status |
|---|---|---|
| K — kernel true | Regeneration is a CI no-op; emission covers all axes with design-question count recorded; doc graph lints clean; core published | ☐ |
| A — loop proven | Benchmark table (loop vs one-shot vs baseline) committed; ≥1 ruling revised by a model-filed gap report | ☐ |
| B — engine independent | Ermine consumes the engine as a plain client; Tailwind-subset demo catches a real conflict with a reason | ☐ |
| C — measurement stands | Audit CLI runs on arbitrary CSS; app-corpus findings published; density survey decision rule executed; one real page translated with residual report | ☐ |
| D — surfaces equivalent | Byte-equivalence CI green; per-law enforcement table written; plugin builds the demo | ☐ |
| U — contact with reality | The end-to-end application built on the grammar, with its gap log and at least one ruling revised under field protest | ☐ |

Thread U is the integrating test: it consumes all four subprojects at once and is the
program's true critical path (its latency is soak time, not effort).

## 4. Sequencing

Kernel first and serial (it is the only stretch where focus beats parallelism), with
one exception launched on day one: the density survey, whose response latency is the
longest external fuse in the program. Then A, B, C in parallel; K7/K8 (the document
graph) on a dedicated executor; D starts when the engine schema freezes; U starts at
the first working build plugin and outlives the schedule.

Critical path: kernel emission → survey latency → engine schema freeze → real-UI soak.
Deliberately *not* on the path: A's benchmark and C's write-up — the two most
publishable results are also the most schedule-safe.

Estimates are denominated in evidence, not dates. At AI-assisted velocity, effort is
not the scarce resource; validated findings are, and they arrive at reality's pace.

## 5. Governance invariants

1. **The constitution wins.** All design decisions are rulings in `constitution/ERMINE.md`,
   addressed by stable ID, connected to rationale and history by typed, lint-checked
   references.
2. **Gap Reports are the only channel** by which delegated or generated work changes
   the design. An executor that improvises has failed even if the code works.
3. **Derived means generated.** Any artifact marked derived is produced by a script
   with a no-diff CI check. Hand edits to derived files are build failures.
4. **Conflicts are explained or escalated, never swallowed.** In the grammar, by
   exclusion (one word per axis); in the documents, by the three-tier arbitration
   canon (register rank → recency → explicit deferral), with incomparable maximal
   elements flagged for human ruling. This symmetry — no two authorities touch the
   same ground without an executable law saying who wins — is the project's actual
   invariant, of which the styling grammar is the first instance.
5. **Findings that cut against the project are published with the same prominence as
   findings that flatter it.** The instrument exists to be believed.

## 6. Known weaknesses being addressed (not papered over)

- The legislative apparatus still outweighs the working machinery; K6's completed
  emission and Thread U are the corrective, and the design-question count K6 reports
  is the honest measure of how real "mechanical repetition" was.
- Prior-art engagement is thinnest exactly where the neighbors are closest (Sprinkles,
  Styled System); D1's enforcement table is written to lose where we lose.
- The perceptual density vocabulary is unproven; C3's pre-committed decision rule
  settles it with data either way.
