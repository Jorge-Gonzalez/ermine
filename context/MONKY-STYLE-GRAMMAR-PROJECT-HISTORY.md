# The Monky Style Grammar — A Project History

*A process document for future-me and future LLMs. It records not just **what** was
decided but **how** the decisions were reached and **why** they hold — because in this
project the method turned out to be more durable than any single ruling.*

---

## 0. What this project is

The Monky Style Grammar is a **typed, composable vocabulary for CSS**: a small set of
human-facing words (`horizontal`, `comfortable`, `selected`, `viewport-md:vertical`)
that an author writes on an element, and that a build step expands into real CSS. It is
not "natural-language CSS." It is a grammar *over* CSS — closed where the platform is
closed, open only where the platform genuinely admits a free parameter.

Three things define it:

- A **constitution** (`STYLE-GRAMMAR.md`) — the single source of truth, the only place
  rulings are made, carrying its own rationale and paper trail.
- A **machine-readable registry** (`registry.ts`) — the real product; the axis set as
  typed data, from which every other artifact is derived.
- A pair of **derived documents** — a machine-consumer spec (for linters and LLMs) and a
  human author's guide — plus the generated CSS itself.

The relationship is strict: *constitution wins on drift.* The registry is an extraction
of the constitution; the spec and guide are extractions of the registry; the CSS is the
generated face. Nothing downstream may invent what the constitution does not say.

---

## 1. The shape of the journey

The project moved through four recognizable phases. They did not feel like phases at the
time — each began as a small, concrete question — but in retrospect they form a clean
progression from *exploration* to *freezing* to *stress-testing* to *mechanization*.

| Phase | Driving question | What it produced |
|---|---|---|
| **I. Exploration** | How should spacing/density be *named* so it stays perceptual and orthogonal? | The semantic-spatial-field model; the discovery that density must emit a *variable*, not a property; a proposed "proportion" axis. |
| **II. Freezing** | Can every open ruling be closed without the algebra breaking? | The two-composition-regimes keystone; ~10 rulings closed (mostly by *removal*); "extraction-stable" status; the one-source/three-document architecture. |
| **III. Stress-testing** | Does the frozen grammar survive components it wasn't designed against? | A six-component breadth audit; a full state-grammar rebuild; the first registry (23 axes) and the first executable check (predicate 4), which caught two real bugs. |
| **IV. Mechanization** | Can the constitution be turned into running, role-specialized artifacts? | `registry.ts` (34 axes), `lint.ts` (proven predicates), the spec/guide split-ready docs, an external review folded in at the source. |

The single most important fact about this progression: **the grammar got smaller and
more coherent under pressure.** Almost every resolution removed structure rather than
adding it. When something new *was* added, it was forced by the platform, never invented.

---

## 2. Phase I — Exploration: the spacing problem that taught the method

The project's earliest recorded work began with a mundane UI need: a row of tabs sharing
horizontal space with a branding block needed more breathing room than the existing
`comfortable` spacing gave. The question was simply *what to call the wider spacing.*

That question opened everything else.

### What was decided

- **`.relaxed`, not `.distributed`.** The tabs stayed a compact cluster; only the
  *local* inter-item density changed. `distributed` (implying `justify-content: space-*`)
  was too structural; `wide`, `spaced`, `airy` too geometric or editorial. This fixed a
  perceptual density scale: `tight → snug → comfortable → relaxed → spaced → loose →
  separated`.
- **Modifier-first naming.** When density turned out to need a *direction* (comfortable
  vertically, relaxed horizontally), the rule became *semantic adjective first, axis
  specialization second*: `comfortable-x`, never `x-comfortable`, `comfortable:x`, or
  `gap-x-comfortable`. The adjective is the meaning; the axis is the specialization.
- **One axis per class** (semantic orthogonality). A class declares the one dimension it
  controls *and* what it must never touch.

### The two insights that outlived this phase

1. **Density must emit a semantic *variable*, not a layout property.** The breakthrough
   was catching a `calc()` constraint: once a class compiles to `gap: …`, the semantic
   information is gone and CSS can't read "the current spacing" to modulate it. The fix
   was a pipeline:

   ```
   density   → --space-base   (perceptual scale → primitive)
   proportion → --space-x/y    (transforms the primitive)
   structure → gap / padding   (consumes the resolved values)
   ```

   Spacing stopped being a scalar and became a *field* — operators that parameterize many
   properties (`gap`, `padding`, `margin`) rather than a property-specific value. This is
   the same custom-property-additivity shape that later let `gap` and `margin` coexist,
   and that fixed the motion-stagger bug in Phase III. **The idea was right; it just
   arrived early.**

2. **Two stabilizers keep a semantic system from decaying:** *semantic scope*
   (dimensional purity — each class owns exactly one axis) and *implementation scope*
   (namespacing / Shadow DOM — `:host`, `mk-`/`monky-`, `[data-mk]`). The slogan:
   *semantics are human-facing; namespaces are ecosystem-facing.*

### The honest note about this phase

This session also proposed a **proportion axis** (`square`/`wide`/`tall`/`panoramic`) as
a first-class dimension. **It did not survive.** Phase II retired it — proportion turned
out to be *sugar* over per-side density composition (`padding-inline-*` + `padding-block-*`),
not a new axis. Keep this as a cautionary marker: exploration legitimately overproduces
structure; the freezing phase is where overproduction gets paid back. The exploration was
not wasted — the *field* model it produced is load-bearing to this day — but its headline
proposal was a thing later dissolved.

---

## 3. Phase II — Freezing: closing the rulings by removal

The constitution arrived at this phase as scaffolding full of open `[RULING]` tags and one
deep fault line: the algebra appeared to **break at flex sizing**. The session critiqued,
resolved the keystone, closed nearly every ruling, and absorbed three rounds of external
review — finding *zero* structural faults by the third round.

### The keystone: two composition regimes

The grammar had claimed all axes "compose without conflict." Flex sizing visibly broke
this — `grow`, `shrink`, `basis`, `min`/`max` are independent to *author* but **fuse into
one width** at layout time. This had been treated as a flaw to design away.

The resolution was to stop treating it as a flaw. There are **two regimes**:

- **Free composition** — independent axes that genuinely commute and unify (placement,
  structure, state, motion, layering, skin — most of the grammar). Governed by Law 3
  (dimensional purity → composition).
- **Negotiated composition** — a per-member *demand* resolved by a **global solve** over
  the parent's space. Members don't commute. Exactly one axis-family: flex/grid sizing.

They don't fuse; they **sequence**: `place ∘ negotiate`. The solver settles sizes
globally first; placement positions each settled box locally and compositionally after.
The negotiated regime got its own algebra — five invariants: conservation, monotonicity,
ratio-invariance, order-equivariance, clamp-idempotence.

> **The lesson, stated as a principle:** *"The algebra broke" was the wrong diagnosis.
> There were two algebras run through one law.* Naming the second algebra recovered the
> coherence. **When the model breaks, look for an unnamed second structure before you look
> for a bug.**

### Resolution by removal

A pattern dominated this phase: almost every open ruling **dissolved or removed**
structure rather than adding a word.

- **Proportion axis** → retired (sugar over per-side density).
- **text/type** → moved to skin (font size is the element's own surface, not a
  between-element relationship — it fails the discriminator test).
- **`flow` vs `stack`** → dissolved (vertical stacking *is* the existing `vertical`
  member; `flow` is the unmarked default).
- **micro vs macro motion** → collapsed (macro = a group of micro edges; not a second
  kind of motion).
- **positioning axis** → recognized as already-existing (the §4.4 layering axis *is* it).

The two genuine *additions* were both **forced by the platform**, not invented:

- **`divider`** — the stroke-twin of `gap` (a line *between* siblings), backed by the CSS
  Gaps Module. Mechanism left open (Chromium-only today → a `:where(.divided > * + *)`
  fallback, explicitly bounded to single-line source-ordered containers).
- **continuous-input states** (`scroll-progress`/`drag-progress`) — so scroll/drag-driven
  motion is `state × motion`, needing no new motion vocabulary.

### Two laws promoted to first-class

- **Law 6 — "name the platform's distinctions; mint no new ontology."** A word is a
  candidate *only if* CSS / ARIA / DOM / the layout engine already draws the distinction.
  This is the positive criterion behind the no-coining rule, and it retroactively explained
  every retired name (`greedy`, `spaced`, `sections`, `equal-circle`).
- **State entails its platform backing** — the operational form of Law 6: a visual state
  class *requires* its ARIA/DOM truth (`selected ⟹ aria-selected`). Without it the grammar
  can render UI that is "visually true but semantically false." The linter treats an
  unbacked state as ill-formed.

### The layering riddle (worth preserving in full)

Jorge's framing: z-index is *"a contest for who can say the largest number, with no
winner"* — there's no shared registry, so everyone guesses against an invisible global
maximum; CSS is *"missing a state to check against."*

Verified against the platform: the missing-state is missing *deliberately*. "What's on
top" isn't a global scalar; it resolves hierarchically. The platform's real answer is the
**top layer** (native `<dialog>`, Popover API): content renders above everything with *no
z-index*, ordered by an engine-kept registry (last-opened-wins). You don't *read* the
top; you **join it by opening.** Three-tier resolution: (1) above everything → top layer;
(2) structured in-page middle → a named z-scale inside `isolation: isolate`; (3)
host-beating constant → one quarantined number for content-script overlays (Monky's case).
Genuine top-querying needs JS and was legislated *out* of grammar scope — the same shape as
the sizing keystone: name the seam where declaration stops.

### The slot left open on purpose

The proportional **scale** (what base + ratio generates spacing/type/radius/motion steps)
was **frozen as a slot, not filled.** A scale is not a list of values; it's the *output of
a generator* (`function, base, ratio`). The generator is the real object. Picking a ratio
now would guess at a quantity a *separate planned project* intends to **measure** — an
algorithm to derive the generating function from existing designs. A recovered generator
*is* a layout equivalence class, making that project the measurement instrument for the
long-term layout-taxonomy vision. The slot is shaped to receive something richer than one
ratio: possibly ratio-varying, possibly per-property-family.

### The architecture made explicit

The constitution had been trying to be three documents at once (rationale, manual, machine
spec) whose registers conflict. Split:

| Document | Audience | Register |
|---|---|---|
| **STYLE-GRAMMAR.md** | maintainer | constitutional, with rationale + history; *the only place rulings are made* |
| **Well-formedness spec** (derived) | LLMs, linters | register-flat, predicate-form |
| **Human guide** (derived) | authors | friendly, example-led |

**The pivot is the machine-readable registry**: spec is its predicate face, guide its
example face, CSS its generated face. The status moved from *"scaffold with open rulings"*
to **"extraction-stable — empirically provisional."** Crucially, "extraction-stable" was
chosen over "structurally frozen" precisely because *a future audit revealing a missing
sibling grammar would be structural.* That honesty was load-bearing in the very next phase.

---

## 4. Phase III — Stress-testing: the breadth audit that broke state

The freezing phase had audited the grammar against exactly **one** component (a search row)
and explicitly flagged that broader audits *could still force a structural revision.* This
phase ran that breadth test, acted on what it found, and built the registry the prior phase
had named as the real product but had not made.

### The six-component audit

The §9 decomposition method — `(plane · role · scope)`, watching for declarations that
*resist placement* — was run against six maximally-dissimilar components:

| Component | What it stressed | Result |
|---|---|---|
| Modal dialog | top-layer, focus management | **state broke** (no `open`; `expanded ≠ open`) |
| Responsive sidebar | breakpoints | **state broke** (no breakpoint grammar anywhere) |
| Data-table row | sort at scale | **state broke** (`aria-sort` is enumerated, not binary) |
| Form field | validity | **state broke** (entire validity family missing) |
| Combobox | composite widget, roving | **held** — one finding: `state-relational` (new category) |
| Tree | hierarchy + roving + range | **held, zero new findings** |

**The pattern was decisive and lopsided: layout, layering, sizing, and motion held across
all six. State broke — and *only* state.** The diagnosis: the state vocabulary had been
*closed prematurely*, enumerated from one component's needs rather than from the platform's
actual state surface — which Law 6 forbids.

The real evidence was not any single audit but **the convergence trend**: 3 structural
findings → 1 → 0. Findings shrank in count *and in kind* — from "missing whole dimensions"
to "complete one symmetry" to "nothing." That trend is what justified declaring state
defensibly stable.

### The state grammar rebuilt

State was re-derived from the *whole* platform surface — ARIA 1.2 states + CSS Selectors L4
UI/validity pseudo-classes, **both verified by web search, not memory.** Five structural
changes:

1. **Arity is a trichotomy**, not a dichotomy: binary (`hover`) · enumerated (`aria-sort
   ∈ {none, asc, desc}`; `aria-checked` includes `mixed`) · continuous (scroll/drag).
2. **Three driver kinds**: interaction · input (continuous) · **environmental** — the
   last is new and **homes responsive** (a media query is a condition selecting which rule
   applies = exactly a state). No fifth sibling. It also adopted the orphaned
   `prefers-reduced-motion` / `prefers-color-scheme`.
3. **A fourth entailment category — `state-relational`**: a member is in a state because
   the *container* asserts it (`aria-activedescendant`), so the backing lives on the parent
   — **inverted entailment.** The mirror-twin of the `selectable` capability.
4. **Law 6b folded in** — *mirroring is rebuttable by Contrast.* If two platform-named
   states produce no actionable difference, they collapse to one member carrying both as a
   backing *set*. (Guardrail: can only *reduce* member count, never coin. Worked case:
   `aria-pressed` folds into `selected`.) Entailment became **set-valued** (any-one
   satisfies).
5. **A mirror-boundary inclusion test** with three explicit OUT classes (ARIA wiring /
   quantitative properties / live-region announcements).

Web search additionally surfaced `:user-invalid` vs `:invalid` (invalid-after-interaction
vs constraint-invalid) and `:open`/`:popover-open` — real platform lines the audits hadn't
reached.

### The registry's first executable confirmation: predicate 4

The first machine-readable registry was built (23 axes, each with explicit `controls` /
`mustNeverTouch` property lists) and **predicate 4** — the static check of the grammar's
central claim, *free-regime axes touch disjoint property sets, which is why they compose* —
was run. It had been asserted everywhere, verified nowhere.

**It found two real collisions six rounds of component auditing had missed:**

1. **Motion stagger overwrote micro-delay.** Both emitted `transition-delay`; the child
   wins, the stagger vanishes. *Fixed:* stagger emits a separate `--stagger` custom
   property composed *additively* — the same shape from Phase I.
2. **`stretch` lived in two axes.** Self-size (m3) listed "fill/stretch" while alignment
   (m4) owns `align-self` (which includes `stretch`). *Fixed:* m3 shrank to
   `flex-basis`-only; main-axis fill is m2 `grow`, cross-axis stretch is m4 `align-self`.
   (A removal — the recurring pattern.)

After both fixes, predicate 4 passes; the only shared free-axis property is `display`, the
documented container/member twin. **This was the first executable confirmation of Law 3,
and it arrived bundled with two bug-fixes the constitution needed.**

> **The argument for the registry, in one event:** a static whole-set check sees collisions
> no single-component walk can. Six careful audits missed both; a machine reading the
> property table all at once caught both instantly.

The phase closed with honest test registration: the scripts *run and pass* but are **not yet
in CI**, and their property lists are *hand-transcribed*, not generated from shipped CSS — so
the correct citation is *"verified by session script, promotion pending,"* never
*"CI-enforced."*

---

## 5. Phase IV — Mechanization: the real registry, the linter, and a review at the source

This phase extracted the machine-consumer artifacts the constitution had described, folded
in a detailed external review, and — following the project's iron workflow rule — **updated
the constitution first** (it is the source of truth and carries the flexibility to log
decisions), then built the first real `registry.ts` and linter.

### What was produced

| File | Role | Status |
|---|---|---|
| `STYLE-GRAMMAR.md` | constitution (source of truth) | 4 on-record changes + new session-log entry |
| `registry.ts` | machine-readable registry | **new — 34 axes, strict-typecheck clean** |
| `lint.ts` | parser + core predicates | **new — 14/14 smoke cases pass** |
| `STYLE-GRAMMAR-SPEC.md` | machine-consumer spec (validator + LLM) | new, then synced |
| `STYLE-GRAMMAR-GUIDE.md` | human author's guide | new, then synced |

### Linter vs LLM: two roles on one registry

A structural question was posed: the linter and the LLM converge on the registry but
*diverge on direction.*

- **The linter is a decision procedure** — it judges an existing string. It needs
  exhaustive predicates, exact error codes, the property-ownership index, and the list of
  things it must NOT flag (the negotiated regime). It consumes the registry's **predicate
  face.**
- **The LLM is a generation procedure** — it emits a string from intent. Its dominant
  failure mode is *inventing a plausible word.* It needs closed-vs-open priors, the
  compose-don't-coin reframe, the stop-and-report contract, intent→string patterns, and
  entailment-as-obligation. It consumes the registry's **generative face.**

The decision (deliberately): **one spec with two read-paths now** — keep progress
centralized; split into separate `LLM-AUTHORING.md` / `LINT-SPEC.md` only when the size
asymmetry that justifies two files is real. Every section was tagged `‹LINT›` / `‹LLM›` /
`‹SHARED›` so the eventual split is a mechanical lift, not a reconciliation.

### The external review, handled at the source

A detailed review came in; ~80% accepted. The most important finding: **state isn't shaped
like the other axes, and the "23 axes" count is fuzzy.** Resolved by making **each state
group its own axis** (`state.focus`, `state.selection`, …) so "one word per axis" is
naturally enforceable — conflict within a group, compose across groups. Other accepted
points: separate `valueSpace` (the conceptual scale) from `tokens` (regexes matching real
authored strings) on every axis; rule `basis-exact` token-indexed over the size scale
(raw lengths out of v0); add a `selection-treatment` record so `selectable +
selection-subtle` is operational.

Where the response *diverged* from the review (worth noting, because the divergences were
the higher-leverage calls):

- The **z-scale contradiction was escalated** from "registry risk" to "the source
  contradicts itself — fix upstream first." `overlay`/`modal`/`popover`/`toast` were
  removed from the z-scale (they contradicted the section's own Tier-1 resolution) and
  re-homed as a separate **`top-layer-mechanism`** axis that emits no `z-index`.
- **Environmental-state syntax** was treated as a constitution-level `[RULING]`, not a spec
  fix — because choosing the variant-prefix surface (`viewport-md:vertical`) *forces* an
  amendment to Law 2. So **Law 2 became "one word per axis *per condition scope*."**
  Environmental prefixes open scopes; the same axis may recur once per scope — which is
  exactly what makes responsive layout well-formed (`horizontal viewport-md:vertical`).
- **Deriving `controls` from generated CSS** was ranked *higher* than the review placed it:
  until it's done, predicate 4 is only "indicative, not authoritative."

### The build, and the bug the build surfaced

`registry.ts` shipped as **34 first-class axes**, strict-typechecking. `lint.ts` implements
a scope-aware `parseWord` and predicates P1 (one-word-per-axis-per-scope), P2 (no-coining),
P5 (weight-implies-direction), P8 (state entailment) — **14/14 smoke cases behave as
expected.**

Testing surfaced one registry-level correction worth remembering as a pattern: the linter
flagged `elastic grow-2` as a false P1 conflict, because the corner alias and the weight
primitive had collapsed into one `m2` axis. The constitution's prose frames these as "two
primitives," so `m2` was **split** into `m2-flex-corner` (closed: rigid/compressible/
expandable/elastic) and `m2-flex-weight` (open: `grow-N`/`shrink-N`). After the split,
`elastic grow-2` composes and `rigid grow-2` correctly fails on **P5** (the right reason)
rather than P1. *They remain a negotiated pair, legitimately sharing `flex-grow`/`flex-shrink`.*

> **Open ratification thread (carry forward):** this is the one place the registry made a
> structural call (two axes) the constitution states only *implicitly* (one m2 section, "two
> primitives" in prose). It deserves a small constitution edit so the registry stays a
> faithful extraction rather than a slight elaboration.

---

## 6. The principles that survived all four phases

These are the through-lines. If a future session forgets everything else, keep these.

1. **Resolve by removal.** The strongest move was repeatedly *dissolving* a decision rather
   than adding a word — recovered via the framework's own laws (markedness, the
   decomposition test, Law 6). Of ~10 freezing-phase resolutions, the large majority removed
   structure; only two added, both platform-forced. *The grammar got smaller and more
   coherent under pressure. Treat growth of the vocabulary as a smell to investigate, not a
   sign of progress.*

2. **Name the seam; don't force the algebra.** Sizing and layering both turned out to be
   irreducible *global* resolutions. The fix both times was to name where declaration stops
   (`place ∘ negotiate`; the top-layer/JS boundary), not to pretend the declarative layer
   could do the global solve. *When the model breaks, look for an unnamed second structure
   before you look for a bug.*

3. **Oracle over model — encode the engine, don't trust your picture of it.** Every state
   rebuild was driven by *web search against the real platform* (ARIA 1.2, Selectors L4),
   never from memory. The proportional scale is left as a slot precisely because a future
   *measurement* will fill it. *Don't pick the quantity the oracle can tell you.*

4. **Honesty by scoping strengthens claims.** Every overclaim was fixed by *narrowing* it:
   "frozen" → "extraction-stable"; "compositionality" → "free-regime compositionality +
   negotiated determinism"; "verified" → "verified by session script, promotion pending."
   Narrowing made the claims *more* credible, not less. *Never let a document assert
   "verified" while pointing at nothing.*

5. **Mirror the platform — but Contrast can rebut the mirror (Law 6 + 6b).** Name only
   distinctions CSS/ARIA/DOM already draw; *and* collapse two platform names to one member
   when they produce no actionable difference. The mirror keeps the grammar from inventing
   ontology; the rebuttal keeps it from inheriting the platform's accreted incoherence.

6. **The extraction discipline *is* a correctness tool.** This is the meta-principle the last
   two phases proved twice over. Every structural defect that mattered — the z-scale
   contradiction, the `basis-exact` under-specification, the unstated environmental syntax,
   the implicit m2 two-axis split, and *both* property collisions — was surfaced not by
   re-reading prose but by **trying to turn the prose into data and having a machine (or
   reviewer) read it.** "Build the registry" was the proof the constitution kept asking for,
   and it paid for itself the moment it ran. *When in doubt, mechanize the claim — the act of
   making it executable is what finds the bug.*

---

## 7. Where things stand, and what's next

### Stable

- The **two composition regimes** (free / negotiated) and `place ∘ negotiate` sequencing.
- The **spatial siblings** (layout, layering, sizing, motion) — held across six audits and
  pass predicate 4.
- The **state grammar** — rebuilt on the full platform surface, validated across six
  components, re-shaped into per-group first-class axes; *defensibly extraction-stable.*
- The **architecture** — one constitution → registry → spec + guide + CSS, with
  constitution-wins-on-drift.
- **`registry.ts` (34 axes)** and **`lint.ts`** (core predicates proven, 14/14).

### Open, by intent

- **The proportional-scale generator (§5.1)** — left as a slot, to be *filled by
  measurement* (the planned derive-the-generating-function project), not by a guessed ratio.
- **Tier-2 z-scale value rulings** (member names + ranges, surface spellings) — non-blocking,
  value-level.

### Next actions, in priority order

1. **Generate the spec `.md` from the registry** — makes "do not edit here" mechanically true
   rather than hand-synced.
2. **Generate the CSS** from the registry.
3. **Derive `controls` from the generated CSS** — *the highest-value next move.* It turns
   predicate 4 from indicative to authoritative and grounds the whole executable-Law-3 claim;
   it also closes the "property lists are hand-transcribed" honesty gap.
4. **Port the full predicate set (P1–P10)** as runnable tests and **promote the session
   scripts + `lint.ts` to committed CI tests** — nothing is in CI yet; "the logic is
   verified" is not "the system is verified end-to-end."
5. **Ratify the m2 split in the constitution** so the registry stays a faithful extraction.
6. **Split the spec** (one-doc Option A → two-doc `LLM-AUTHORING.md` + `LINT-SPEC.md`) once
   the LLM guidance is short enough to ship as a system-prompt fragment and the lint spec
   needs no prose.
7. **Calibrate on a real second app** — the empirical basis is still n ≈ 6 components
   (structural) and n = 1 app (shipped).

### Carried-forward honesty (do not lose this)

- **Nothing is in CI.** Every script ran in-session against hand-modelled inputs.
- **Property lists are hand-transcribed**, not generated from shipped CSS — predicate 4 could
  be fooled by a transcription gap until the lists are derived from real output (action #3).
- **Only state was pushed this hard.** The spatial siblings pass the *static* purity check,
  but their *outcome* behaviour (do disjoint axes also avoid layout side-effect interference?)
  is untested — that's the named remaining frontier (the §10 browser/outcome tests).
- **Skin is sampled, not exhaustive** in the registry; a fuller enumeration could surface a
  grammar/skin overlap.

---

## 8. One paragraph for the next session to start from

The Monky Style Grammar is a typed vocabulary over CSS, governed by a constitution that is
its single source of truth, extracted into a 34-axis machine-readable registry from which a
linter, a machine spec, a human guide, and the CSS are all derived. It has two composition
regimes (free axes that commute via dimensional purity; one negotiated sizing family resolved
by a global solve, sequenced as `place ∘ negotiate`), and it admits a word only when the
platform already draws the distinction (Law 6), collapsing redundant platform names when they
make no actionable difference (Law 6b). It is extraction-stable and has its first executable
confirmation of compositionality (predicate 4, which caught two real bugs), but **nothing is
in CI and the property lists are not yet generated from shipped CSS** — so the single
highest-value next move is to generate the CSS and derive `controls` from it, turning the
central claim from "indicative" to "authoritative." The discipline that produced every real
correction here was the same one to keep using: *mechanize the claim; resolve by removal; name
the seam; encode the oracle, not your picture of it; and narrow every claim until it points at
something that runs.*

---

*End of project history.*
