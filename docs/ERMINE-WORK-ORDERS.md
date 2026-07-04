# Ermine — Work Orders for Delegated Execution

> **What this document is.** A set of self-contained task specifications ("work orders")
> for the Ermine project, written so that each can be handed to a separate AI model or
> session with no other context beyond the repository itself. Each work order defines
> its objective, inputs, exact steps, deliverables with file paths, checkable acceptance
> criteria, explicit non-goals, and the conditions under which the executor must STOP
> and report instead of improvising.
>
> **Who reads it.** An executing model with access to the repository. The document is
> deliberately literal and repetitive; that is a feature, not sloppiness.

---

## 0. Rules for every executor (read before any task)

These rules apply to EVERY work order below. A work order may add rules; it may never
cancel one of these.

**R1 — The constitution wins.** The file `constitution/ERMINE.md` (the constitution) is the only
place where design decisions ("rulings") are made. If your task reveals that a decision
is needed and the constitution does not already contain it, you do NOT make the decision.
You STOP and produce a **Gap Report** (format in §0.1) as your output for that task.
Making an undocumented design decision is a task failure even if the code works.

**R2 — Never coin vocabulary.** You may not invent a new axis, word, token, scale step,
alias, or state member under any circumstances. If a task seems to require one, that is
a Gap Report situation (R1). This mirrors the grammar's own "mint no new ontology" law
and applies to you, the executor, as much as to the grammar.

**R3 — Derived means generated.** Files marked "derived" (`src/ERMINE-SPEC.md` sections
generated from the registry, generated CSS, generated type surfaces) must never be edited
by hand once their generator exists. If a derived file looks wrong, fix the generator or
the registry, then regenerate.

**R4 — Do not restructure beyond your order.** Each work order names the files you may
create or modify. Touching any other file is out of scope. If you believe another file
must change, say so in your report; do not change it.

**R5 — Tests define done.** Every work order lists acceptance criteria as commands that
must succeed (exit code 0) or as observable artifacts. "It should work" is not done;
the listed command passing is done. Run `npm run check` (typecheck + tests) at the end
of every task even if your task did not touch tests.

**R6 — Preserve existing behavior unless the order says otherwise.** All 95 existing
tests must still pass after your task unless the work order explicitly says a test will
be retired or changed, and names it.

**R7 — No new runtime dependencies.** The project has zero runtime dependencies and dev
dependencies limited to `typescript`, `tsx`, `playwright`, `@types/node`. Do not add a
package without the order explicitly authorizing it. (Orders that authorize one say so
in a line beginning `DEPENDENCY AUTHORIZED:`.)

**R8 — Comment the why, not the what.** When you write code, comments must explain
reasoning and cite the constitution section or predicate ID they implement (e.g.
`// P7 dimensional purity — constitution §2, Law 3`), matching the existing style in
`src/lint.ts` and `src/emit.ts`.

**R9 — Commit discipline.** One work order = one commit (or one small series). Commit
message format: `<type>(<area>): <summary>` matching the existing history, e.g.
`feat(engine): extract vocabulary-independent predicate core`. Body: 2–5 lines stating
what the order was and which acceptance criteria were verified.

### 0.1 Gap Report format

When R1 or R2 triggers, output a file `reports/GAP-<taskid>-<slug>.md` containing exactly
these sections:

```markdown
# Gap Report — <task id>
## What I was doing
<one paragraph: the step in the work order that triggered this>
## The decision that is missing
<one paragraph: the specific choice that cannot be made from the constitution as written>
## Where I looked
<list of constitution sections / registry entries consulted, with line references>
## Options I can see (NOT a recommendation)
<2–4 options, one line each, neutral phrasing>
## What is blocked
<which acceptance criteria of the task cannot be met until this is ruled>
```

Do not include a recommendation. The Gap Report is input to a human ruling, not a vote.

### 0.2 Repository map (orientation only — do not "fix" anything here)

```
constitution/ERMINE.md          — the constitution (source of truth; ~2,000 lines)
src/ERMINE-SPEC.md     — machine-consumer spec (currently hand-written; will become derived)
src/ERMINE-GUIDE.md    — human author's guide
src/registry.ts        — the typed axis registry (SCALES, AxisRecord[], ~26 axes)
src/lint.ts            — parser (parseWord) + predicates P1..P11, lint()
src/emit.ts            — axis-walker emitter; EMISSION table (partial: ~6 axes)
src/emitter-types.ts   — EmittedRule union, deriveControls()
src/css.ts             — CSS serializer
src/audits/            — audit scripts (to be promoted to tests)
test/                  — node:test suites; test/browser/ uses Playwright
analysis/scope.ts      — layer-1 property-coverage instrument
analysis/values.ts     — layer-2 value-distribution instrument
analysis/FINDINGS.md   — measured ingestor-viability findings
demo/                  — rendered demo page + build script + two themes
docs/blog-…md          — the blog draft
context/…HISTORY.md    — project history (context only; never edit)
```

Known inconsistency you will encounter: prose in `README.md`, `registry.ts` comments, and
elsewhere refers to `STYLE-GRAMMAR.md`, `STYLE-GRAMMAR-SPEC.md`, `STYLE-GRAMMAR-GUIDE.md`.
The actual files are `constitution/ERMINE.md`, `src/ERMINE-SPEC.md`, `src/ERMINE-GUIDE.md`.
Work order K1 fixes this; no other order should.

---

## SUBPROJECT K — THE KERNEL

Sequential. K1 → K2 → K3 → K4 → K5 → K6. Do not parallelize inside K.
Everything in subprojects A–D depends on K being complete.

---

### K1 — Naming reconciliation

**Objective.** Make every reference to the constitution/spec/guide use the real filenames,
so no future generator or reader resolves a dangling name.

**Inputs.** Whole repository.

**Steps.**
1. Search the entire repo (excluding `.git/` and `context/`) for the strings
   `STYLE-GRAMMAR.md`, `STYLE-GRAMMAR-SPEC.md`, `STYLE-GRAMMAR-GUIDE.md`,
   `STYLE-GRAMMAR-SPEC`, `STYLE-GRAMMAR-GUIDE`, and bare `STYLE-GRAMMAR` used as a
   filename reference.
2. Replace each with the corresponding real path: `src/ERMINE.md`, `src/ERMINE-SPEC.md`,
   `src/ERMINE-GUIDE.md`. When the reference appears in running prose as the *name of the
   document* rather than a path (e.g. "the constitution (`STYLE-GRAMMAR.md`)"), keep the
   prose but correct the filename.
3. EXCEPTIONS — do not modify: (a) anything in `context/` (it is a historical record);
   (b) the constitution's own internal title line `# STYLE-GRAMMAR — the constitution`
   IF changing it would break internal anchors — check for intra-document links first;
   if there are none, retitle it `# ERMINE — the constitution` and note this in the
   commit body.
4. Run `npm run check`.

**Deliverables.** Modified files only; no new files.

**Acceptance criteria.**
- `grep -rn "STYLE-GRAMMAR" --include="*.md" --include="*.ts" . | grep -v context/ | grep -v .git` returns ONLY matches inside `context/` (i.e. zero lines after the filters), OR zero lines total.
- `npm run check` exits 0.

**Out of scope.** Restructuring any document; renaming any file; editing `context/`.

---

### K2 — Registry → spec generation (make "derived" true)

**Objective.** Generate the registry-derived sections of `src/ERMINE-SPEC.md` from
`src/registry.ts` mechanically, and add a check that regeneration produces no diff.

**Inputs.** `src/registry.ts`, `src/ERMINE-SPEC.md` (current hand-written version, which
is the target rendering to match), `src/lint.ts` (for predicate IDs).

**Steps.**
1. Read `src/ERMINE-SPEC.md` fully. Identify which sections are *pure restatements of
   registry data* (the axis tables in its §2: axis id, sibling, role, signature,
   vocabulary, regime, tokens/shapes, scales, state groups, aliases, dials) versus
   sections that contain *prose judgment* (the generation contract §3, the trust-boundary
   §7, reading-path preamble). Only the pure-restatement sections are generated in this
   task.
2. Create `src/generate-spec.ts`. It must:
   a. Import `REGISTRY`, `SCALES`, `ENVIRONMENT_SCOPES` from `./registry.ts`.
   b. Render the registry sections as markdown whose *content* matches what the
      hand-written spec says today. Formatting may differ slightly (column order,
      whitespace); facts may not. If you find a place where the hand-written spec and
      the registry DISAGREE on a fact (a word listed in one and not the other, a
      different exclusivity, a different scale), STOP for that item and file a Gap
      Report (this is doc drift, and which side is right is a ruling — R1). Generate
      the rest.
   c. Write output between sentinel comments inside `src/ERMINE-SPEC.md`:
      `<!-- BEGIN GENERATED: registry (do not edit between markers) -->` and
      `<!-- END GENERATED: registry -->`. Everything outside the markers is untouched
      hand prose. Insert the markers around the identified sections as part of this task.
   d. Support two modes: `tsx src/generate-spec.ts` (writes the file) and
      `tsx src/generate-spec.ts --check` (exits 1 with a diff summary if regeneration
      would change the file, 0 otherwise).
3. Add npm scripts: `"spec": "tsx src/generate-spec.ts"` and
   `"spec:check": "tsx src/generate-spec.ts --check"`. Append `spec:check` to the
   existing `check` script chain.
4. Add a note at the very top of the generated block (inside the markers, emitted by the
   generator): `> Generated from src/registry.ts by src/generate-spec.ts — do not edit.`
5. Run `npm run spec` then `npm run check`.

**Deliverables.** `src/generate-spec.ts`; modified `src/ERMINE-SPEC.md` (markers +
generated block); modified `package.json` (scripts only).

**Acceptance criteria.**
- `npm run spec:check` exits 0 immediately after `npm run spec`.
- Manually deleting one axis row from the generated block and running `npm run spec:check`
  exits 1 (verify, then restore by running `npm run spec`).
- `npm run check` exits 0.
- Zero Gap Reports, OR each drift item has a Gap Report and the generator skips only
  those items (list them in the commit body).

**Out of scope.** Generating the guide (that is K3); changing any fact in the registry;
rewriting the spec's hand-prose sections; the `LINT-SPEC`/`LLM-AUTHORING` split (K4).

---

### K3 — Guide table generation

**Objective.** Same discipline as K2 for the *tabular/word-list* content of
`src/ERMINE-GUIDE.md`: the "which words exist" listings become generated; the teaching
prose stays human.

**Steps.**
1. In `src/ERMINE-GUIDE.md`, identify every list that enumerates words of an axis or
   steps of a scale (e.g. the density scale listing, the structure words, spacing
   families). These become generated blocks with the same sentinel-marker mechanism as K2.
2. Extend `src/generate-spec.ts` OR create `src/generate-guide.ts` (executor's choice;
   if extending, rename nothing) to emit those blocks from the registry, preserving the
   guide's friendly rendering style (inline word lists with middle dots are fine —
   match what is there).
3. Wire `guide` / `guide:check` scripts exactly as in K2 step 3, and append `guide:check`
   to `check`.
4. Prose sentences that *mention* a word inline (e.g. "…`gap-comfortable`…") are NOT
   generated and NOT markers — leave them. Only standalone enumerations are generated.

**Acceptance criteria.** Same pattern as K2: regenerate → check exits 0; tamper → check
exits 1; `npm run check` exits 0; drift items (a guide listing disagreeing with the
registry) become Gap Reports, not silent fixes.

**Out of scope.** Rewriting any teaching prose; adding examples.

---

### K4 — Spec split along the pre-cut markers

**Objective.** Execute the split the spec already declares: produce `src/LINT-SPEC.md`
and `src/LLM-AUTHORING.md` from `src/ERMINE-SPEC.md`, using the `‹LINT›` / `‹LLM›` /
`‹SHARED›` section markers in that document.

**Steps.**
1. Read `src/ERMINE-SPEC.md` and list every section with its marker. Sections marked
   `‹SHARED›` (notably §1 schema and the generated §2 registry block) go into BOTH
   output files by *transclusion note*, not duplication: each new file contains a line
   `> Shared sections §1–§2 live in src/ERMINE-SPEC.md — read them there first.` and the
   spec file retains them. (Rationale: duplicating a generated block creates two
   regeneration targets; do not do it.)
2. `src/LINT-SPEC.md` receives: the validator read-path preamble, §4 per-axis predicates,
   §5 cross-cutting predicates, §6 negotiated invariants, §7 trust boundary.
3. `src/LLM-AUTHORING.md` receives: the author/LLM read-path preamble, §3 generation
   contract, plus a short section titled "Obligations" that restates §4–§5 predicate IDs
   as pre-emission obligations in one line each (e.g. "P8 — before emitting `selected`,
   the backing must exist; you are responsible for it"). Copy the framing already present
   in the spec's read-path text; do not invent new obligations.
4. `src/ERMINE-SPEC.md` becomes the shared core: keep §1, generated §2, and replace the
   moved sections with one-line pointers to the two new files. Keep the "derived, do not
   edit" header.
5. Update `package.json` `files` array to include the two new documents.
6. Search the repo for references to spec section numbers that moved (e.g. "spec §4")
   and update them to point at the new file (e.g. "LINT-SPEC §4"). `context/` excluded
   as always.

**Acceptance criteria.**
- All three files exist; no section of the original spec is lost (verify by heading
  count: every `##`/`###` heading of the pre-split spec appears in exactly one of the
  three files or is a deliberate pointer stub — list the mapping in the commit body).
- `npm run spec:check` still exits 0 (the generated block did not move out of the spec).
- `npm run check` exits 0.

**Out of scope.** Changing any predicate's substance; renumbering predicates.

---

### K5 — Promote audits to the committed suite

**Objective.** The scripts in `src/audits/` (`collision-analysis.ts`, `combobox-audit.ts`,
`tree-audit.ts`) become `node:test` suites that run in `npm test`.

**Steps.**
1. For each audit script: read it, identify its assertions (explicit or implicit — a
   console table that a human eyeballs is an implicit assertion; make it explicit by
   asserting the property the table was checking).
2. Create `test/audit-collisions.test.ts`, `test/audit-combobox.test.ts`,
   `test/audit-tree.test.ts` using the same `node:test` harness style as the existing
   tests in `test/`.
3. If an audit's assertion cannot be made explicit without deciding what "correct" is
   (i.e. the script only printed data for human judgment and no criterion exists in the
   constitution), file a Gap Report for that audit and convert the others.
4. Leave the original scripts in `src/audits/` unchanged (they remain runnable
   exploratory instruments); the tests import from them where practical rather than
   copying logic.

**Acceptance criteria.** `npm test` runs the new suites; total test count strictly
greater than 95; `npm run check` exits 0.

**Out of scope.** Deleting `src/audits/`; changing audit logic.

---

### K6 — Complete the EMISSION table (and count the design questions)

**Objective.** Every axis in `REGISTRY` has an `EMISSION` entry in `src/emit.ts`, and the
number of *genuine design questions* encountered is recorded — this number is a project
metric, not an embarrassment.

**Inputs.** `src/registry.ts` (all axes), `src/emit.ts` (existing entries are the pattern
library: plain closed, ordered-chain scale, open+dial+alias, closed+parametric member,
facet-split, state condition, platform mechanism, sink shapes — the header comment lists
them), `constitution/ERMINE.md` §4 (per-axis rulings, which often name the CSS property),
`demo/theme.css` (the variable naming convention, e.g. `--spacing-<step>`).

**Steps.**
1. Enumerate all axes: `REGISTRY.map(a => a.axis)`. Diff against `Object.keys(EMISSION)`.
   The difference is your worklist. Record it in the commit body.
2. For each missing axis, in this order of authority: (a) find its constitution section
   in `constitution/ERMINE.md` §4 — if it names the CSS property/value mapping, implement exactly
   that; (b) if the constitution gives the property but the *value* must come from a
   theme variable, follow the existing `var(--…)` conventions visible in `emit.ts` and
   `demo/theme.css`; (c) if neither the property nor the value mapping is derivable from
   the constitution + existing conventions, that axis is a design question: file ONE Gap
   Report per such axis and skip it.
3. Heed the warning already encoded in `emit.ts`'s `densityDial` comment: the authored
   word prefix and the CSS property are SEPARATE things that sometimes coincide
   (`gap-*` → `gap`) and sometimes do not (`flow-*` → `margin-block-start`). For every
   entry you write, verify the token pattern in `registry.ts` before trusting the
   obvious mapping. This exact conflation has already produced a silent bug once.
4. For each completed axis, add at least one test case to `test/emit.test.ts`: one valid
   word of that axis emits the expected declaration object. Follow the existing test
   style.
5. Update the coverage comment at the top of `emit.ts` (currently "one representative
   axis per structural pattern… remaining ~20 axes") to state actual coverage:
   `N of M axes emitted; K axes gap-reported (see reports/)`.
6. Run `npm run check`.

**Acceptance criteria.**
- `Object.keys(EMISSION).length + <number of Gap Reports filed in this task> ===
  REGISTRY.length` (state the three numbers in the commit body).
- Every new EMISSION entry has ≥1 passing test.
- `npm run check` exits 0.
- The count of Gap Reports filed here is reported prominently — it is the empirical test
  of the "mechanical repetition, not a design question" claim and feeds scheduling for
  subprojects A and D.

**Out of scope.** Inventing value mappings not derivable from constitution + existing
convention (that is exactly what Gap Reports are for); touching the linter; adding
theme variables to `demo/theme.css` (if an emission needs a variable that no theme
defines, note it in the entry's comment — themes are a downstream concern).

---

### K7 — Three-register restructure of the constitution (stable IDs + document-integrity linter)

**Depends on K1 only.** May run in parallel with K2–K6 PROVIDED no other active order is
editing `constitution/ERMINE.md` at the same time (coordinator schedules). K2/K3 generation reads
`src/registry.ts`, not the constitution, so they are unaffected.

**Objective.** Split the constitution's three interleaved registers — normative law,
explanatory rationale, decision history — into three artifacts connected by stable IDs
and typed references, with an integrity linter that makes a dangling reference or an
unexplained ruling a build failure.

**Background (read, do not re-litigate).** The design rationale for this order:
normative/informative separation as in standards bodies; ADR-style append-only decision
records; and — the part specific to this project — references treated as foreign keys
with mechanical integrity checking. The executor implements; the design is settled.

**Amendment — one tree, self-identifying registers, typed binding (author ruling; amends
DOC-SYSTEM §10, which the author updates in tandem).** DOC-SYSTEM §2 already holds that
"location is not identity" and that containment "may change freely"; the original binding
did not yet honor it. Four changes below make the implementation match the architecture:
- **One tree at `constitution/`.** The three registers plus the binding and the linter live
  together under `constitution/`; the constitution moves out of `src/` (which is for code),
  so the corpus stops straddling two directories.
- **Self-identifying registers.** Each register file declares its class in YAML front-matter
  (`register: normative|rationale|history`); the linter DISCOVERS the corpus by scanning for
  it — no hardcoded path list to break when folders move.
- **Typed binding.** The binding is `constitution/binding-ermine.ts`, a compiler-checked
  module the linter imports, not prose markdown.
- **Symbol-keyed code refs.** A `code:` footer is keyed on `#<symbol>`; the `<file>` is
  advisory (resolved by finding the exporting file), so reorganizing `src/` never
  invalidates a footer.

**Steps.**
1. Install the authored `docs/DOC-SYSTEM.md` (provided by the project author — it is
   the ruling this order implements; do NOT write, extend, or modify it; on any
   discrepancy between it and this order, DOC-SYSTEM.md wins and the discrepancy is
   reported in the commit body). Its key provisions, restated for convenience only, AS
   AMENDED by the note above:
   - **Registers, in one tree.** The whole governed corpus lives under `constitution/`.
     `constitution/ERMINE.md` = normative only (laws and rulings; terse; present tense; a
     sentence that constrains nothing does not belong here).
     `constitution/ERMINE-RATIONALE.md` = commentary (why each ruling holds; what was
     rejected; what evidence exists). `constitution/decisions/ADR-NNNN-<slug>.md` = history
     (one file per decision event; append-only; never edited after commit — supersession is
     a NEW record referencing the old). Each register file begins with YAML front-matter
     declaring its class (`register: normative|rationale|history`); the linter discovers the
     corpus by that front-matter, never by a hardcoded path.
   - **ID scheme.** Laws: `LAW-<n>` (numbering follows the constitution's existing Law
     numbers where they exist). Rulings: `R-<AREA>-<nn>` where `<AREA>` is a short
     uppercase token derived from the ruling's existing section context (e.g. `DENSITY`,
     `M2`, `STATE`, `LAYER`, `SPACE`) — derive the AREA list from existing headings,
     record it as typed data in `constitution/binding-ermine.ts` (the binding DOC-SYSTEM.md
     §10 calls for, as a compiler-checked module the linter IMPORTS — the only doc-system
     files this order creates are this binding and the linter), and DO NOT invent areas
     beyond what the headings support. Decision records: `ADR-<nnnn>` zero-padded,
     chronological. Predicates keep their existing `P1`…`P11` identifiers as code-side IDs.
     IDs are PERMANENT: they survive any restructuring; they are never renumbered or reused.
   - **Reference footer syntax.** Every law/ruling in the constitution ends with one
     metadata line:
     `→ rationale: RAT:<ID> · history: ADR-NNNN[, ADR-NNNN…] · code: <file>#<symbol>[, …] [· defers-to: <ID> (scope: <one line>)]`
     Fields that do not apply are omitted, EXCEPT: `rationale:` is mandatory for every
     ruling; `history:` is mandatory but may carry the literal token `unrecorded` when
     no source material exists (see the split step). In a `code:` field the `#<symbol>` is
     the key; the `<file>` is advisory (the linter resolves the symbol by finding its
     exporting file), so reorganizing `src/` never invalidates a footer.
2. **Relocate the corpus.** Create `constitution/`; `git mv src/ERMINE.md
   constitution/ERMINE.md`; add the `register: normative` front-matter to it. Update every
   repository reference to the old path — `package.json` (`files`), the README repository
   map, and any sibling work order that names `src/ERMINE.md` — to the new location. The
   derived spec and guide stay in `src/` for now (they are generated artifacts, not
   registers); `src/*.ts` code citations are handled in the migration step below.
3. **Inventory pass.** Enumerate every law and ruling currently in
   `constitution/ERMINE.md` — they are findable by the markers already in the text
   (`settled`, `RULED`, `REVISED`, `RESOLVED`, `[RULING]`, `Law <n>`). Produce a mapping
   table (ID → current heading → current line range) and include it in the commit body.
   Every marked item gets an ID; if an item's status marker is ambiguous (you cannot tell
   whether it is a ruling or commentary), file a Gap Report for that item and continue.
4. **The split — move text, never write text.** This is the anti-confabulation rule for
   the whole order:
   a. `constitution/ERMINE.md` retains, per ID: the ID as heading, the normative
      statement(s), and the reference footer. Sentences that explain, justify, narrate, or
      record history MOVE OUT.
   b. Explanatory sentences move to `constitution/ERMINE-RATIONALE.md` under a `## RAT:<ID>`
      heading. You may reorder moved sentences for flow and add connective phrases of
      ≤5 words; you may NOT add substantive claims, examples, or reasoning that the
      source text did not contain.
   c. Historical narration (how a decision evolved, what an audit found, what was
      retired) becomes ADR files under `constitution/decisions/`. Source material: the
      paper-trail passages inside `constitution/ERMINE.md` itself, and
      `context/MONKY-STYLE-GRAMMAR-PROJECT-HISTORY.md` (read-only — quote/summarize with a
      source pointer, never edit it). Every ADR carries a `source:` line naming where its
      content came from. **If no recorded source exists for a ruling's history, write NO
      ADR** — the footer says `history: unrecorded`. Inventing plausible history is the
      worst possible failure of this order.
5. **Migrate code citations.** `src/registry.ts`, `src/lint.ts`, `src/emit.ts` currently
   cite constitution sections positionally (`§4.1`, `§5.1`, `§2`). Using the inventory
   mapping table, replace each with the stable ID (e.g. `constitution §4.1` → `R-M2-01`).
   Positional citations break under restructuring; ID citations do not — that is the point.
6. **Build `constitution/lint-docs.ts`.** It DISCOVERS the register files by their
   front-matter and IMPORTS `constitution/binding-ermine.ts` for ID shapes and footer
   grammar. Checks, each with a distinct error code:
   - `DOC-E01` duplicate ID anywhere.
   - `DOC-E02` a reference (footer field, RAT heading, ADR mention, code-comment ID)
     that resolves to no defined ID.
   - `DOC-E03` a ruling in the constitution with no `RAT:<ID>` entry.
   - `DOC-E04` a ruling whose `history:` field is absent (note: `unrecorded` is present,
     not absent). Report the count of `unrecorded` as an INFO line.
   - `DOC-E05` a `code:` reference whose `#<symbol>` appears as an exported name in NO
     file under `src/` (string-level check is sufficient: `export … <symbol>`). The symbol
     is the key; a stale advisory `<file>` is a warning, not an error.
   - `DOC-E06` a cycle in `supersedes` references among ADRs.
   - `DOC-E07` an ADR file that has been modified after a later-numbered ADR referenced
     it as superseded (checkable via `git log --follow` on the file; if git history is
     unavailable in the execution environment, emit INFO "E07 skipped" rather than
     failing).
7. Wire `docs:check` (`tsx constitution/lint-docs.ts`) into the `check` script chain, and
   add `constitution` to the `tsconfig.json` include array.
8. Run `npm run check`.

**Deliverables.** `constitution/binding-ermine.ts` (typed binding: AREA list, ID shapes,
footer grammar); relocated + restructured `constitution/ERMINE.md` (with `register:`
front-matter); new `constitution/ERMINE-RATIONALE.md`; `constitution/decisions/` directory;
`constitution/lint-docs.ts`; migrated `src/*.ts` code comments; updated `package.json` and
`tsconfig.json`; updated README repository map. `docs/DOC-SYSTEM.md` is already installed;
its §10 file-mapping is amended by the author in tandem (this order does not edit it).

**Acceptance criteria.**
- `npm run check` exits 0 (including `docs:check`).
- Tamper tests, each verified then reverted: delete one RAT entry → `DOC-E03`; corrupt
  one footer ID → `DOC-E02`; point one `code:` ref at a symbol exported nowhere → `DOC-E05`.
- `grep -n "§" src/*.ts` returns zero lines.
- Moving any register file to a different folder and re-running `docs:check` still passes
  (proves discovery is path-independent, not hardcoded).
- Commit body reports: the ID inventory table; constitution line count before → after
  (a large reduction is expected and is the headline number); the `unrecorded` history
  count; and a spot-check list of 5 randomly chosen RAT/ADR entries each with the source
  line range the text was moved from.

**Out of scope.** Changing the substance of any law or ruling (moving text is the ONLY
permitted operation on meaning-bearing prose); writing new rationale; the graph export,
impact analysis, staleness, and arbitration (all K8); renaming predicate IDs; moving the
derived spec/guide out of `src/`.

---

### K8 — The graph layer: export, impact analysis, staleness, arbitration canon

**Depends on K7.**

**Objective.** Materialize the reference system as a typed directed graph with: a
derived machine-readable export, reverse-edge impact analysis, a human-driven staleness
ledger, cycle policy, and a fixed three-tier arbitration canon that orders conflicting
sources and flags genuinely undecidable conflicts for human ruling.

**Design constants (these restate `docs/DOC-SYSTEM.md` §5–§9, which is authoritative;
on any discrepancy DOC-SYSTEM.md wins and the discrepancy is reported; extending any
of these lists is a Gap Report).**
- **Edge types (frozen canon, six):** `depends-on`, `constrains`, `supersedes`,
  `rationale-of`, `implements` (code → ruling), `defers-to`. There is deliberately no
  `see-also`.
- **Edge admission test** (DOC-SYSTEM.md §5): *if the target changed,
  would this node genuinely need review?* If no — no edge, however related the topics.
- **Arbitration canon (three tiers, fixed forever):**
  Tier 1 — register rank: constitution > rationale > history.
  Tier 2 — recency within a register: the live end of a `supersedes` chain controls.
  Tier 3 — explicit `defers-to` edges, each carrying a one-line `scope`.
  Together these induce a strict partial order over the live sources bearing on a node.
  **Resolution = the maximal elements of that order.** Exactly one maximal element →
  it controls. Two or more mutually incomparable maximal elements → the conflict is
  UNRESOLVED and is surfaced for human ruling (whose eventual output is a new
  `defers-to` edge — a ruling like any other).
- **Cycle policy:** `supersedes` and `defers-to` must be acyclic (errors `DOC-E06`,
  `DOC-E08`). `depends-on` cycles are PERMITTED: detect strongly-connected components
  and report each as a named cluster (INFO), because a mutual-dependency cluster is a
  fact about the design ("these rulings must be reviewed together"), not an error.

**Steps.**
1. Extend `constitution/lint-docs.ts` to emit `constitution/graph.generated.json`:
   `{ nodes: [{id, register: "constitution"|"rationale"|"history"|"code", file, anchor}],`
   ` edges: [{from, to, type, scope?}],`
   ` clusters: [{name, members: [id…]}] }`
   — where edges come from the K7 footer fields plus `rationale-of` (derived from RAT
   headings) and `implements` (derived from code-comment IDs). Add a `graph:check`
   no-diff script (K2 pattern) wired into `check`. Humans never read this file; tools do.
2. Create `constitution/impact.ts`:
   - `tsx constitution/impact.ts <ID>` → the reverse transitive closure from `<ID>`, grouped by
     hop distance and register, each line showing the edge type it arrived by. For any
     affected node with multiple live inbound sources, append the arbitration verdict:
     `controls: <ID>` or `UNRESOLVED: {<ID>, <ID>} incomparable — human ruling required`.
   - `tsx constitution/impact.ts <ID> --mark` → additionally writes the DIRECT (one-hop reverse)
     dependents into the staleness ledger.
3. Staleness ledger `constitution/stale.json`: entries `{id, staleSince: <ISO date>,
   cause: <the changed ID>}`. Commands: `--mark` (above) and
   `tsx constitution/impact.ts --clear <ID>` (a human reviewed the node; remove its entry).
   `docs:check` reports the stale count as WARN — CI does NOT fail on staleness (review
   is human-paced) but DOES fail (`DOC-E09`) on a ledger entry whose `id` or `cause` no
   longer resolves. Staleness never edits content; it only routes attention (this
   sentence restates DOC-SYSTEM.md §9.2).
4. Implement SCC detection (Tarjan or Kosaraju — cite which in a comment) for the
   `depends-on` subgraph; clusters named `CLUSTER-<smallest-member-id>`.
5. Implement the arbitration comparator as a pure function
   `precedes(a: NodeRef, b: NodeRef, graph): "a"|"b"|"incomparable"` in
   `constitution/arbitration.ts`, with the three tiers applied in order; `impact.ts` consumes
   it. Property to encode in tests: the induced relation is irreflexive and transitive
   on every fixture (i.e. actually a strict partial order).
6. Fixture-based tests `test/doc-graph.test.ts` covering, minimum: a dangling edge
   (E02); a supersedes cycle (E06); a defers-to cycle (E08); a depends-on SCC reported
   as a cluster, not an error; a two-source conflict resolved by Tier 1; one resolved by
   Tier 2; one resolved by Tier 3; one genuinely incomparable pair flagged UNRESOLVED;
   mark → stale → clear round-trip.
7. Verify implementation-to-spec consistency: every constant above (edge types, tiers,
   cycle policy, resolution rule) matches `docs/DOC-SYSTEM.md` §5–§9 exactly. Do not
   add to, paraphrase, or "improve" that document; a perceived defect in it is a Gap
   Report, not an edit.

**Acceptance criteria.**
- `npm run check` exits 0 including `graph:check`.
- All fixture tests pass; the tamper protocol from K7 extended with: adding a
  `defers-to` cycle to a fixture fails with `DOC-E08`.
- Running `impact` on a real constitution ID (pick one with known dependents from the
  K7 inventory, e.g. the density ruling) produces grouped, arbitration-annotated output;
  paste it into the commit body.
- The number of UNRESOLVED conflicts found on the real corpus is reported (zero is a
  valid result; each nonzero item is handed to the human as a pending ruling, NOT
  resolved by the executor).

**Out of scope.** Auto-editing any document from graph data; graph visualization; new
edge types; weighting or ranking beyond the three tiers; resolving any UNRESOLVED
conflict.

---

## SUBPROJECT A — THE LLM-NATIVE LANGUAGE

Depends on: K complete. A1 → A2 → A3 may proceed serially; A4 after A2; A5 is continuous.

---

### A1 — Operationalize the authoring contract

**Objective.** Turn `src/LLM-AUTHORING.md` (from K4) into a contract precise enough that
a model reading ONLY that file plus the shared spec sections can emit lawful class
strings, and knows exactly what to output when it cannot.

**Steps.**
1. Add a section `## Output protocol` specifying the exact emission format: a single
   line of space-separated grammar words, nothing else — no markdown, no quotes, no
   commentary. Define the failure output as a structured gap report block:
   ```
   GAP
   intent: <the intent that cannot be expressed>
   nearest: <the closest lawful composition, if any>
   missing: <what the grammar lacks, in one line>
   ```
   (This machine gap format is intentionally smaller than §0.1's human format; A5 maps
   one to the other.)
2. Add a section `## Intent patterns` with exactly 20 entries. Each entry: an intent in
   plain English ("a horizontal toolbar whose middle section absorbs extra width"), the
   lawful class string, and a one-line note naming the axes used. Source the intents
   from: the demo page markup (`demo/index.html`), the seven audited components named in
   the constitution's audit sections, and the guide's examples. DO NOT invent class
   strings from imagination: every word you write must be verified by running it through
   the linter (write a throwaway script or add a temporary test) before it goes in the
   document. An intent-pattern entry containing a string the linter rejects is a task
   failure.
3. Add a section `## Obligations before emitting` if K4 did not already create it, one
   line per predicate, phrased as an obligation (see K4 step 3).
4. Keep the whole file under ~400 lines — it will be injected into prompts; length is a
   cost.

**Acceptance criteria.** A test file `test/authoring-patterns.test.ts` exists that parses
the 20 intent-pattern strings out of `src/LLM-AUTHORING.md` (by a stable delimiter you
define in the doc, e.g. fenced blocks tagged `ermine`) and asserts `lint()` returns zero
errors for each. `npm run check` exits 0.

**Out of scope.** Prompt engineering for any specific model; adding words to the grammar.

---

### A2 — The generate-verify loop harness

**Objective.** A runnable harness: intent in → model emits → linter judges → diagnostics
fed back → iterate to valid or budget exhausted → full trace recorded.

DEPENDENCY AUTHORIZED: none for the loop itself. The model call must be pluggable, not
hard-wired: define an interface `type Generator = (prompt: string) => Promise<string>`
and ship two implementations: (a) `generators/manual.ts` — reads the emission from stdin
(so the harness is testable with a human or any external model pasted in); (b)
`generators/anthropic.ts` — calls the Anthropic API IF an `ANTHROPIC_API_KEY` env var is
present, else throws with a clear message. Use plain `fetch`; add no SDK.

**Steps.**
1. Create `loop/harness.ts` with:
   - `runLoop(intent: string, gen: Generator, opts: {maxRounds: number}): Promise<Trace>`
   - Round 1 prompt = fixed preamble + full text of `src/LLM-AUTHORING.md` + shared spec
     registry section + the intent. Round N+1 prompt = previous prompt + the emitted
     string + the linter `Issue[]` serialized verbatim (rule id + msg), + one fixed line:
     "Correct the string. Emit only the corrected string."
   - Terminal states: `valid` (lint returns zero errors), `gap` (model emitted the GAP
     block from A1), `exhausted` (maxRounds hit).
2. Define `Trace` in `loop/types.ts`: intent, rounds (each: prompt hash, emission, issues,
   ms), terminal state, final string. Serialize traces to `loop/traces/<timestamp>-<slug>.json`.
3. Create `loop/run.ts` CLI: `tsx loop/run.ts --intent "…" [--generator manual|anthropic]
   [--max-rounds 4]`.
4. Write `test/loop.test.ts` using a FAKE generator (a scripted function returning a
   known-bad string then a known-good one) asserting: the loop feeds diagnostics back,
   terminates `valid` in round 2, and the trace records both rounds. No network in tests.

**Acceptance criteria.** `npm run check` exits 0 including the new loop test; the CLI
runs end-to-end with `--generator manual`.

**Out of scope.** The benchmark (A3); any UI; retry/backoff sophistication; streaming.

---

### A3 — The benchmark

**Objective.** Numbers comparing Ermine-with-loop against a raw-utility baseline on a
frozen intent set. The benchmark definition is frozen BEFORE any runs.

**Steps.**
1. Create `bench/intents.json`: exactly 30 intents. Composition: the 20 from A1's intent
   patterns (strings stripped — intents only) + 10 new ones drawn from the audited
   components' harder cases (responsive scope changes, state entailment cases, negotiated
   sizing). Each entry: `{id, intent, mustInclude?: string[], mustNotInclude?: string[]}`
   where the optional fields are *semantic* checks (axis ids that a correct answer must
   touch — e.g. a responsive intent must produce a `viewport-*:` scoped word). Freeze the
   file: subsequent tasks may not edit it; corrections require a new versioned file.
2. Arms: (a) **ermine-loop** — A2 harness, maxRounds 4; (b) **ermine-oneshot** — same
   prompt, no feedback rounds; (c) **tailwind-oneshot** — same intents, prompt asks for
   Tailwind classes, validity judged by a permissive shape check only (documented in the
   report as not equivalent — Tailwind has no reason-bearing validator, WHICH IS THE
   POINT; state this in the report). Metrics per arm: first-emission validity rate,
   rounds-to-valid distribution (loop arm), gap rate, semantic-check pass rate.
3. Create `bench/run.ts` (runs all arms for a given generator, writes
   `bench/results/<date>-<generator>.json`) and `bench/report.ts` (renders the JSON to a
   markdown table in `bench/RESULTS.md`).
4. Runs against a real model are executed only when a key is present; everything else
   (loading intents, computing metrics, rendering) is covered by `test/bench.test.ts`
   with fake traces.

**Acceptance criteria.** `npm run check` exits 0; a dry run with the fake generator
produces a well-formed `RESULTS.md`; `bench/intents.json` contains exactly 30 entries
each with unique `id`.

**Out of scope.** Judging visual/rendered fidelity (that requires the browser rig and is
a later extension — note it in `RESULTS.md` as a limitation); prompt tuning per arm
beyond the fixed prompts defined here.

---

### A4 — MCP server for lint/emit/gap

**Objective.** Expose three tools over MCP so any agent can target the grammar:
`ermine_lint(classString) → Issue[]`, `ermine_emit(classString) → EmittedRule[]`,
`ermine_contract() → text of LLM-AUTHORING.md`.

DEPENDENCY AUTHORIZED: `@modelcontextprotocol/sdk` (dev/runtime of the server package
only). Put the server in `mcp/` with its own `package.json` so the core package keeps
zero runtime deps.

**Steps.**
1. `mcp/server.ts`: stdio transport; the three tools; inputs validated (a class string
   is a single line, ≤ 2,000 chars — reject otherwise with a clear error, do not crash).
2. `mcp/README.md`: how to register the server in a client, one example call per tool
   with real output.
3. `test/mcp.test.ts` (in the main suite, spawning the server as a subprocess): each tool
   answers correctly for one known-good and one known-bad input.

**Acceptance criteria.** `npm run check` exits 0; the three tool round-trips pass in the
test; the server refuses malformed input without crashing.

**Out of scope.** Auth; HTTP transport; any tool that MUTATES the registry (explicitly
forbidden — the server is read/judge only).

---

### A5 — Gap harvest (continuous)

**Objective.** Every machine `GAP` block produced in A2/A3 runs becomes a human-format
Gap Report (§0.1) so it can enter the constitution's ruling pipeline.

**Steps.** Create `loop/harvest.ts`: scans `loop/traces/` and `bench/results/`, extracts
GAP terminals, deduplicates by `missing` line similarity (exact-match dedupe is enough;
do not build fuzzy matching), emits `reports/GAP-A5-<slug>.md` files in the §0.1 format
with the "What I was doing" section auto-filled from the trace. Idempotent: re-running
creates no duplicates.

**Acceptance criteria.** Running harvest twice on the same traces produces identical
`reports/` contents; a test with a fixture trace verifies the mapping.

**Out of scope.** Deciding whether a gap deserves a ruling (never — R1).

---

### A6 — Graph-aware context tool (`ermine_context`)

**Depends on A4 + K8.**

**Objective.** Add one tool to the MCP server: precise, precedence-ordered context
assembly by graph traversal, so an agent reasoning about one ruling loads a few hundred
relevant lines instead of the whole corpus.

**Steps.**
1. In `mcp/server.ts`, add `ermine_context(id: string, hops?: number)` (default
   `hops = 1`, maximum 2 — reject higher values with a clear error):
   a. Resolve `id` against `constitution/graph.generated.json`. Unknown ID → error listing the
      5 closest IDs by string distance (simple Levenshtein; no dependency).
   b. Collect the node plus its neighborhood to `hops` (BOTH edge directions — inbound
      edges are the "what depends on this" half that matters most).
   c. For each collected node, load its text: the heading-anchored block from its
      `file`/`anchor` (constitution/rationale) or the whole file (ADRs, which are small).
   d. **Order the output by the arbitration canon**: reuse `precedes()` from
      `constitution/arbitration.ts` — controlling sources first; sources that defer are emitted
      AFTER their controllers with the label `deferred to <ID> (scope: …)`; any
      incomparable pair is emitted with the label `UNRESOLVED conflict — treat neither
      as controlling`. Do not reimplement arbitration in the server; import it.
   e. Annotate every node that appears in `constitution/stale.json` with
      `⚠ stale since <date> (cause: <ID>)`.
   f. Enforce a hard output budget of 6,000 tokens (approximate by chars/4). If the
      neighborhood exceeds it, truncate WHOLE NODES from the far end of the precedence
      order — never mid-node — and end the output with
      `[truncated: N nodes omitted — request a specific ID for detail]`.
2. Update `mcp/README.md` with one worked example: the call, the ordered output shape,
   a stale annotation, and a truncation notice.
3. `test/mcp-context.test.ts` against a FIXTURE graph + fixture doc files (no dependence
   on the real corpus): asserts (a) neighborhood collection at hops 1 and 2; (b)
   controlling-first ordering with a Tier-1 and a Tier-3 fixture case; (c) the deferred
   and UNRESOLVED labels; (d) stale annotation; (e) whole-node truncation under a tiny
   budget; (f) unknown-ID suggestion list.

**Acceptance criteria.** `npm run check` exits 0; all six fixture assertions pass; the
server still refuses malformed input without crashing (A4 criterion re-verified).

**Out of scope.** Semantic/embedding retrieval (traversal only — the edges ARE the
relevance model); mutating any document or the ledger; hops > 2.

---

## SUBPROJECT B — THE VERIFIER ENGINE

Depends on: K complete (K6 in particular). B1 → B2 → B3; B4 after K6 + B1.

---

### B1 — Extract the vocabulary-independent core

**Objective.** The predicate machinery becomes a package that takes ANY registry
conforming to a schema and returns a linter; Ermine's registry becomes its first client
with zero special-casing.

**Steps.**
1. Create `engine/` containing: `engine/types.ts` (the registry schema: `AxisRecord`,
   `Token`, `StateMember`, `Alias`, `Scales`, `EnvironmentScope` — moved/re-exported, not
   duplicated), `engine/parse.ts` (a `makeParser(registry, scopes)` returning the
   current `parseWord` behavior), `engine/predicates.ts` (P1…P11 refactored to close over
   a registry argument instead of importing `REGISTRY` directly), `engine/index.ts`
   exporting `createLinter(registry, scopes) → { parseWord, lint }`.
2. Rewrite `src/lint.ts` as a thin client: it imports `createLinter` from `../engine`,
   instantiates it with Ermine's `REGISTRY`/`ENVIRONMENT_SCOPES`, and re-exports the same
   public names (`parseWord`, `lint`, `Parsed`, `Issue`, plus anything `emit.ts`
   imports). THE PUBLIC SURFACE OF `src/lint.ts` MUST NOT CHANGE — this is what keeps
   every existing test and `emit.ts` untouched.
3. Grep for any place a predicate hard-codes an Ermine-specific word or axis id (e.g. a
   special case mentioning `structure` or a literal word). Each such place is either
   (a) expressible as registry data — move it into the schema as a declared property and
   have Ermine's registry declare it; or (b) genuinely Ermine-specific judgment — Gap
   Report, because the constitution must rule where the law lives. List every instance
   found and its resolution in the commit body.
4. `npm run check` — all 95+ tests must pass UNMODIFIED. If a test needs modification,
   the extraction changed behavior: that is a failure; fix the extraction.

**Acceptance criteria.** Existing tests pass unmodified; `src/lint.ts` under ~40 lines;
`grep -rn "REGISTRY" engine/` returns nothing (the engine never imports Ermine's data);
commit body lists the step-3 findings.

**Out of scope.** Publishing; renaming predicates; performance work.

---

### B2 — Public schema contract

**Objective.** A registry author who has never seen Ermine can write a valid registry.

**Steps.**
1. `engine/SCHEMA.md`: every field of every type in `engine/types.ts` documented — name,
   type, required/optional, meaning in one sentence, one example value. Document the
   token-ordering discipline (valid-value tokens before fallback tokens) and the
   alias/dial exclusivity semantics, because these are behavioral contracts the types
   alone do not express.
2. `engine/validate-registry.ts`: `validateRegistry(reg) → string[]` checking structural
   well-formedness of a registry ITSELF: unique axis ids, unique words across closed
   vocabularies (token-pattern overlap on literal words), every alias `expands` string
   parseable by the registry's own tokens, every `entails` target a real word, scales
   referenced by tokens actually declared. These checks mirror what `test/registry.test.ts`
   asserts for Ermine — generalize those assertions, do not invent new laws.
3. Run `validateRegistry` against Ermine's registry in a test; it must return `[]`.

**Acceptance criteria.** `npm run check` exits 0; deliberately corrupting a fixture
registry (duplicate axis id) yields a non-empty, human-readable error list in the test.

**Out of scope.** JSON-schema export (nice-to-have; note as future work in SCHEMA.md).

---

### B3 — The Tailwind-subset demonstration client

**Objective.** Prove vocabulary-independence: a registry encoding a SUBSET of Tailwind's
vocabulary, on which the engine detects real conflicts with reasons.

**Steps.**
1. `clients/tailwind-subset/registry.ts`: encode ONLY these families, nothing more:
   display (`flex`, `grid`, `block`, `inline-flex`, `hidden`), flex-direction (`flex-row`,
   `flex-col`), gap (`gap-0`…`gap-12` as a parametric token over Tailwind's numeric
   scale), padding (`p-N`, `px-N`, `py-N` — model px/py as sub-dials of a padding axis,
   the same mechanism as Ermine's m2 dials), width (`w-N`, `w-full`, `w-auto`), and the
   responsive scope prefixes (`sm:`, `md:`, `lg:` as `ENVIRONMENT_SCOPES`-style patterns).
   Where Tailwind's semantics do not fit the schema (e.g. `p-4 px-2` is LEGAL in Tailwind
   via cascade order, but the engine would flag the px dial against the whole-axis `p-4`),
   DO NOT bend the engine: encode it the natural way and DOCUMENT the divergence in the
   client's README as a finding — "the engine's algebra rejects what Tailwind resolves by
   source order" is the demonstration's thesis, not a bug.
2. `clients/tailwind-subset/README.md`: what is encoded, what is deliberately absent,
   the divergence findings from step 1, and three worked examples where the engine
   produces a reasoned rejection for strings `tailwind-merge` must resolve heuristically
   (e.g. `flex-row flex-col`, `sm:gap-2 sm:gap-4`, `p-4 p-2`).
3. `test/tailwind-client.test.ts`: the three worked examples assert the exact rule ids
   fired; plus one well-formed string asserting zero errors; plus
   `validateRegistry(twRegistry)` returns `[]`.

**Acceptance criteria.** `npm run check` exits 0; the README's three examples are
verbatim reproducible from the tests.

**Out of scope.** Full Tailwind coverage (explicitly forbidden — subset only); emission
for the Tailwind client (judge-only); arbitrary-value syntax (`w-[13px]`).

---

### B4 — Authoritative property ownership

**Objective.** Each axis's owned-property set is DERIVED from what emission actually
produces, and the purity check (P7) runs against the derived sets — upgrading it from
indicative to authoritative.

**Depends on K6** (emission complete for all non-gap-reported axes).

**Steps.**
1. Create `src/derive-ownership.ts`: for every axis with an EMISSION entry, enumerate its
   emittable words (closed vocabularies fully; parametric tokens via one representative
   value per scale step / dial), run `emit()`, and collect the set of CSS property names
   produced per axis. Output `src/ownership.generated.json` (`{axis: string[]}`) with a
   generated-file header. Wire `ownership` / `ownership:check` scripts (same no-diff
   pattern as K2) into `check`.
2. Modify the P7 purity check to read the generated ownership sets for emitted axes,
   falling back to the registry's declared sets ONLY for gap-reported (non-emitted)
   axes, and to WARN (not error) that those axes are unverified.
3. If derivation reveals a collision the declared sets missed, or a declared property no
   emission produces: these are findings — record each in the commit body and, if fixing
   one requires choosing which axis owns the property, Gap Report.

**Acceptance criteria.** `npm run check` exits 0 including `ownership:check`; the P7 test
distinguishes verified/unverified axes; commit body lists derivation findings (zero is a
valid and reportable result).

**Out of scope.** Fixing any collision by re-assigning ownership without a ruling.

---

## SUBPROJECT C — THE MEASUREMENT INSTRUMENT

Depends on: nothing for C1–C3 (may start alongside K); C4 depends on K6; C5 last.
C3 (the survey) launches FIRST in calendar time — it has the longest external latency.

---

### C1 — `ermine-audit` CLI

**Objective.** One command wrapping `analysis/scope.ts` + `analysis/values.ts` into a
single report for any CSS input.

**Steps.**
1. `analysis/audit.ts`: accepts one or more arguments, each a local `.css` path or an
   `http(s)` URL. For URLs: fetch the page, extract `<link rel="stylesheet">` hrefs and
   inline `<style>` blocks, fetch same-origin stylesheets. (Plain fetch; no headless
   browser; note "computed styles not observed" as a stated limitation in the report
   header.)
2. Reuse — do not reimplement — the measurement logic of `scope.ts` and `values.ts`;
   refactor shared functions into `analysis/lib.ts` if needed, keeping both original
   CLIs working unchanged.
3. Output `AUDIT-<slug>.md` reproducing the FINDINGS.md table shapes exactly: layer-1
   family coverage + theme-custom-prop share; layer-2 spacing distribution (raw count,
   distinct, top-6, top-12, 4px-grid share, zero share) and size distribution (raw,
   distinct, top-6). Include the standing assumptions verbatim from FINDINGS ("rem→16px
   assumed; !important stripped").
4. npm script: `"audit": "tsx analysis/audit.ts"`.

**Acceptance criteria.** `npm run audit demo/ermine.css demo/theme.css` produces a
well-formed report; a test runs the pipeline on a small fixture CSS with known numbers
and asserts the computed coverage/top-k values exactly.

**Out of scope.** JS-injected styles; CSS-in-JS extraction; pretty HTML output.

---

### C2 — Widen the corpus to app UIs

**Objective.** Test FINDINGS' own stated weakness: the corpus was text-site-skewed. Run
the instrument on component-library-driven application CSS and record whether the
loose-cluster result holds.

**Steps.**
1. Select 4–6 publicly accessible app-style targets (open-source dashboards, admin UIs,
   documentation apps built on component libraries). Record for each: URL/source, date
   fetched, why it qualifies as "app UI". Store the raw CSS under
   `analysis/corpus/<slug>/` so results are reproducible offline.
2. Run C1's audit on each; collect into `analysis/FINDINGS-APPS.md` using the SAME table
   format as FINDINGS.md so the two documents are directly comparable, plus one
   comparison paragraph per layer. The paragraph states what the numbers show; it does
   NOT conclude what the grammar should do about it (rulings are not made here — R1).
3. Do not edit `analysis/FINDINGS.md` (it is a dated record). Cross-link the two.

**Acceptance criteria.** `FINDINGS-APPS.md` exists with ≥4 targets, tables matching the
original format, and a reproduction command per target; corpus files committed.

**Out of scope.** Drawing design conclusions; adjusting scales.

---

### C3 — The density-ordering survey (LAUNCH FIRST)

**Objective.** Measure human agreement on the ordering of
`tight, snug, comfortable, relaxed, loose, separated`, with the decision rule
pre-committed before data arrives.

**Steps.**
1. Create `survey/PROTOCOL.md` BEFORE building anything, containing verbatim:
   - Task shown to participants: the six words in RANDOMIZED order, instruction "Order
     these words from least space to most space." No other context, no mention of CSS.
   - Sample: minimum 30 complete responses; convenience sampling acceptable; note it.
   - Metric: mean pairwise agreement with the canonical order = for each of the 15
     unordered word pairs, the share of participants whose response orders that pair as
     the canonical order does; average the 15 shares.
   - DECISION RULE (pre-committed): mean pairwise agreement > 0.90 → names remain
     canonical, evidence attached to the constitution's density section. ≤ 0.90 →
     numeric steps become canonical and the six names become whole-axis-style aliases
     (mechanism per constitution §4.1); the ruling text is drafted for human sign-off,
     not self-executed (R1 — the DATA is gathered here; the RULING is applied to the
     constitution by its author).
2. Build the instrument: `survey/index.html` — a single static page, no backend: shuffled
   drag-to-order list (plain JS, no framework), and a "copy results" button producing a
   compact string the participant sends back through any channel. (No data collection
   infrastructure = no consent/storage complexity; state in PROTOCOL.md that responses
   are anonymous orderings only.)
3. `survey/tally.ts`: paste-in file of response strings → computes the metric, per-pair
   table, and the triggered branch of the decision rule. Test with fixture responses on
   both sides of the threshold.

**Acceptance criteria.** Protocol committed BEFORE the page (verify by commit order);
tally reproduces hand-computed values on fixtures; page works offline in a browser.

**Out of scope.** Recruiting (human's job); applying the resulting ruling (human's job).

---

### C4 — Translator spike (one real page)

**Objective.** Convert FINDINGS from viability study to working proof: one real page's
CSS → Ermine words + explicit residuals → both versions rendered side by side.

**Depends on K6.** Scope is intentionally minimal; failures are findings, not bugs.

**Steps.**
1. Pick ONE page from the C2 corpus with high layer-1 coverage. Record the choice and
   coverage number in the output report.
2. `analysis/translate.ts`: for each CSS rule, map declarations to grammar words ONLY
   where an EMISSION entry provides the inverse mapping (property+value → word). Spacing
   values snap to the nearest scale step; emit the word AND record the residual
   (`requested 15px → snapped comfortable(16px), residual −1px`). Every unmappable
   declaration is passed through verbatim into a `residual.css` file — the translator
   NEVER drops a declaration and NEVER coins a word (R2).
3. Output: `translated.html` (original markup with grammar classes + link to generated
   ermine CSS + residual.css) alongside the untouched original; plus
   `analysis/TRANSLATION-REPORT.md`: % declarations translated, residual histogram,
   category breakdown of pass-throughs, and honest side-by-side screenshots or a written
   visual-diff note.
4. Reuse the Playwright setup from `test/browser/` for ONE smoke assertion: both versions
   render without console errors and key elements have equal computed `display` values.

**Acceptance criteria.** Report exists with the three quantitative sections; the smoke
test passes; `grep`-able guarantee that translated+residual declaration count equals the
original count (assert it in the script).

**Out of scope.** Multi-page translation; fixing visual differences (they are data);
extending the grammar to raise the translation rate.

---

### C5 — The methodology write-up

**Objective.** A standalone document that survives even if the language does not: the
measurement method + framework/hand-authored/app-corpus results.

**Steps.** Create `docs/measuring-css-scale-adherence.md`: method (both layers, the
snap-and-residual model), instruments (with reproduction commands), results tables from
FINDINGS + FINDINGS-APPS + the C4 translation report, limitations copied honestly from
the caveats already recorded, and a related-work paragraph (Tailwind's scale design,
design-token practice). Cite every number to its generated source file. No conclusions
about Ermine adoption — the document is about the measurement.

**Acceptance criteria.** Every table in the write-up is traceable to a committed report
file; a reader with the repo can regenerate each number with a stated command.

---

## SUBPROJECT D — THE MULTI-SURFACE REGISTRY

Depends on: K complete, B1+B2 complete (typegen reads the engine schema, never Ermine
internals). D1 → D2 → D3; D4 after D1.

---

### D1 — Typed-props surface generation

**Objective.** Generate from the registry a TypeScript props API where one-word-per-axis
is enforced by the type system, and document honestly which laws each surface enforces
natively.

**Steps.**
1. `surfaces/typed/generate.ts` reading the registry THROUGH `engine/types.ts` and
   emitting `surfaces/typed/ermine-props.generated.ts`:
   - Plain closed axis → optional property, union of literal words:
     `structure?: "horizontal" | "vertical" | "rows" | "grid"`.
   - Scale-parametric axis → union over the scale steps: `gap?: "tight" | … | "separated"`.
   - Dialed axis (m2) → sub-dial properties (`grow?: number; shrink?: number`) PLUS the
     whole-axis aliases as a separate property whose type is the alias union; alias/dial
     mutual exclusion encoded with a discriminated-union or `never`-field pattern so the
     conflict is a COMPILE error. If the exclusion cannot be encoded soundly for some
     axis shape, that axis's exclusion stays runtime-checked and is listed in D1's
     enforcement table (step 3) — do not ship an unsound type.
   - State groups → per-group properties; enumerated members carry their value union.
   - Scope prefixes → a nested optional object per environment scope
     (`viewportMd?: Partial<ErmineProps>`), matching per-scope P1 semantics.
2. `surfaces/typed/toClassString.ts`: props object → canonical class string (the ONLY
   runtime piece). Every output string must be lawful; the function calls `lint()` in
   dev mode and throws on any error — reaching that throw means the typegen is wrong.
3. `surfaces/typed/ENFORCEMENT.md` — the honesty table, one row per law/predicate:
   columns = law, class-string surface (linter), typed surface (compile-time / runtime /
   not enforced), notes. P8 entailment and relational backing will land as
   runtime-or-unenforced on the typed surface; SAY SO PLAINLY. This document is a primary
   deliverable, not an appendix — it is the precise answer to "why not just Sprinkles."
4. Wire `typed` / `typed:check` no-diff scripts into `check` (same K2 pattern).
5. `test/typed-surface.test.ts`: (a) valid props compile and round-trip through
   `toClassString` → `lint` with zero errors, for one example per axis shape; (b) invalid
   combinations are compile errors — verify with `@ts-expect-error` lines, one per
   encoded exclusion.

**Acceptance criteria.** `npm run check` exits 0 (including typecheck of the
`@ts-expect-error` cases — a passing `@ts-expect-error` line proves the type rejects);
ENFORCEMENT.md has a row for every predicate P1–P11 plus the coining law.

**Out of scope.** React/framework bindings; CSS-in-JS runtime; styling API ergonomics
beyond the generated shape.

---

### D2 — Surface-equivalence CI property

**Objective.** The same intent authored on both surfaces emits byte-identical CSS,
enforced as a test, permanently.

**Steps.**
1. `test/equivalence.test.ts`: a fixture list of ≥10 paired authorings — each entry a
   class string AND the props object meaning the same thing (reuse A1's intent patterns
   where possible). For each pair: `emit(classString)` vs `emit(toClassString(props))` →
   serialize both through `src/css.ts` → assert byte equality.
2. Include at least: one dialed-axis case, one alias case, one scoped (responsive) case,
   one state case, one facet case (structure + m1), because these are the shapes where
   surfaces most plausibly diverge.

**Acceptance criteria.** `npm run check` exits 0; deliberately breaking `toClassString`
ordering makes the test fail (verify, revert).

---

### D3 — Build plugin (JIT emission)

**Objective.** A Vite plugin that scans source files for grammar words and emits ONLY the
authored subset as CSS, making the class-string surface usable in a real toolchain.

DEPENDENCY AUTHORIZED: `vite` as a devDependency of `surfaces/vite-plugin/` (own
package.json, keeping core at zero deps).

**Steps.**
1. `surfaces/vite-plugin/index.ts`: a plugin that (a) scans `.html`/`.jsx`/`.tsx`/`.vue`
   content for candidate class tokens (split on whitespace inside class/className
   attributes — a conservative regex is acceptable and its false-negative risk stated in
   the README); (b) resolves candidates through `parseWord` — unknown words are silently
   ignored (they belong to other systems on the page; the plugin NEVER errors on foreign
   classes); (c) collects resolved words, deduplicates, runs `emit` + the CSS serializer,
   and serves/writes a single `ermine.generated.css`; (d) in dev, re-emits on file change.
2. Lint diagnostics for RESOLVED-but-malformed compositions (e.g. `horizontal vertical`
   in one attribute) surface as build WARNINGS with the linter's reason text, never
   build failures (the page author may be mid-edit).
3. Rebuild the demo through the plugin: `demo/vite.config.ts`; the existing
   `demo/build.ts` remains as the no-toolchain path. Byte-compare plugin output against
   `demo/ermine.css` for the demo's word set — differences are findings for the commit
   body.
4. `surfaces/vite-plugin/README.md`: install, config, the scanning limitation, the
   warning behavior.

**Acceptance criteria.** `npm run check` exits 0; building the demo through the plugin
produces CSS that renders the demo identically (reuse one browser smoke assertion);
foreign classes in a fixture produce zero warnings; a same-axis conflict fixture produces
exactly one warning containing the linter's reason string.

**Out of scope.** PostCSS variant (note as future work); watch-mode performance tuning;
purging of theme variables.

---

### D4 — Editor tooling from the registry

**Objective.** VS Code completions and hover docs generated from the registry, so the
vocabulary explains itself at the point of use.

DEPENDENCY AUTHORIZED: `vscode` extension API types, inside `surfaces/vscode/` only.

**Steps.**
1. Generator `surfaces/vscode/generate-data.ts`: registry → `completions.generated.json`
   (every closed word + parametric shapes with placeholder syntax, grouped by axis) and
   `hovers.generated.json` (word → axis id, one-line meaning, and the constitution
   section reference — pull the one-liners from the registry's `note`/shape fields and
   the guide's generated word tables; do NOT write new descriptive prose, assemble
   existing strings).
2. Minimal extension `surfaces/vscode/extension.ts`: completion provider inside
   class/className attribute strings; hover provider for resolved words showing the axis
   and the reference. Same conservative attribute detection as D3, shared if practical.
3. No-diff scripts for the generated JSON, wired into `check`.

**Acceptance criteria.** Generated JSON regeneration is a no-op after generation; an
extension-host smoke test (or a documented manual test script `surfaces/vscode/TESTING.md`
with exact steps and expected screenshots-in-words) verifies one completion and one hover.
`npm run check` exits 0.

**Out of scope.** Publishing to the marketplace; diagnostics squiggles (the plugin's
warnings cover it); other editors.

---

## THREAD U — THE REAL-UI BUILD (continuous, human-led)

Not a delegated work order — recorded here so executors understand references to it.
The end-to-end application (the browser extension from the blog draft) is authored on
Ermine surfaces once D3 exists in minimal form. Executors touch it only when a work
order says so. Its artifact of record is `reports/GAP-U-*.md` files (§0.1 format) plus
a running `docs/gap-log.md` index. Any executor who is asked to "just add a word" to
unblock the UI must refuse and file the Gap Report instead (R1/R2 — no exceptions,
especially not this one).

---

## Sequencing summary (for the coordinating human)

```
Day 1        : C3 survey protocol + page (launch collection) ; K1
Days 1–5     : K2 → K3 → K4 → K5 → K6   (serial, one executor)
Days 2–7     : K7 (parallel executor — sole writer of constitution/ERMINE.md during this window;
               all Gap Report rulings queue until K7 lands, then apply via IDs)
Days 5–12    : A1→A2→A3 (executor 1) ∥ B1→B2→B3 (executor 2) ∥ C1→C2 (executor 3)
Days 7–10    : K8 (same executor as K7, immediately after it)
Days 8–14    : B4 (needs K6+B1) ; A4 ; C4 (needs K6) ; D1 starts when B2 lands
Days 12–20   : D2 → D3 → D4 ; A6 (needs A4+K8) ; A5 harvest as traces accumulate ;
               C5 write-up
Continuous   : Thread U from first working D3 build ; Gap Reports flow to the
               constitution's author for rulings; every ruling may trigger K2/K3
               regeneration and, after K8, an impact --mark pass (both one command).
```

Cross-cutting invariant for the coordinator: **Gap Reports are the only channel by which
delegated work changes the design.** If a subproject seems blocked and no Gap Report
exists, the executor improvised or stalled silently — both are process failures worth
catching early.
