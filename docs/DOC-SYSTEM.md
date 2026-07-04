# DOC-SYSTEM — a governed documentation graph

> A system for document corpora that legislate something: three ranked registers,
> stable identifiers, typed references with machine-checked integrity, and a fixed
> arbitration canon over conflicting authorities — executable as scripts with exit
> codes, over plain markdown, in a repository.
>
> Sections are marked **[normative]** (they constrain implementations) or
> **[informative]** (they explain; nothing in them constrains). The system practices
> its own register discipline.

---

## 0. Introduction: the idea, its lineage, and what is new **[informative]**

### 0.1 The problem

Any project governed by written decisions accumulates three kinds of text that pull in
different directions: the *law* (what is decided, binding now), the *reasoning* (why it
was decided, what was rejected), and the *history* (how the decision evolved). Kept in
one document, they bloat each other: the law becomes hard to cite because it is buried
in explanation; the reasoning becomes hard to trust because editing it silently edits
the law; the history becomes unreliable because it is rewritten whenever the present
changes. Kept in separate documents connected only by prose mentions, they drift: a
ruling changes and nothing forces its rationale, its dependents, or the code that
implements it to notice.

The drift problem is the deeper one, and it has a shape: the connections between
decisions are not a hierarchy. A ruling in one area constrains a mechanism in another;
retiring one decision cascades into others; two live decisions can bear on the same
point and disagree. The reference structure is a directed graph, and any system that
models it as a tree misrepresents what actually happens when designs evolve.

### 0.2 What this system does

It separates the three registers, gives every decision a permanent identifier, connects
the registers (and the code) with a small closed set of typed references, and then
makes four commitments that are mechanical rather than aspirational:

1. **Integrity is checked, not trusted.** References are foreign keys; a linter fails
   the build on a dangling key, an unexplained ruling, or a forbidden cycle.
2. **Change routes attention through the graph.** When a decision changes, a reverse
   walk over the edges produces the review list, and reviewed-or-not is tracked in a
   ledger. The tool identifies what needs judgment; it never exercises judgment.
3. **Conflicts are arbitrated by a fixed canon or escalated — never guessed.** When
   multiple live sources bear on one node, a three-tier precedence order (register
   rank, recency, explicit deferral) decides which controls. Where the order cannot
   decide — mutually incomparable maximal sources — the system's output is an
   *unresolved conflict* flag addressed to a human, which is treated as the correct
   behavior, not a failure.
4. **The graph is a retrieval function.** For a language model (or a human) needing
   context about one decision, the edges select a small, structurally relevant,
   precedence-ordered neighborhood — retrieval that is *pre-resolved*, because the
   authority relationships were ruled on once by a human and are machine-readable
   thereafter.

### 0.3 Lineage — where each element comes from

None of the individual elements is new, and the system is stronger for that; each has
decades of precedent in a field that needed it badly enough to formalize it.

- **The three registers** descend from legal codification — statutes, commentary, and
  *travaux préparatoires* maintained as separate registers with different authority and
  different rates of change — and from standards practice, where ISO and IETF documents
  mark every section normative or informative and RFC 2119 (Bradner, 1997) reserves
  MUST/SHOULD/MAY for normative text. The history register in per-decision, append-only
  form is Nygard's Architecture Decision Records (2011).
- **The arbitration tiers** are the canonical legal conflict rules: *lex superior*
  (higher source wins → register rank), *lex posterior* (later ruling wins → recency via
  supersession chains). The third canon, *lex specialis* (specific beats general), is
  deliberately replaced here by explicit, scoped deferral edges — specificity computed
  from structure proved subtle and contested in the inheritance-networks literature
  (Touretzky, *The Mathematics of Inheritance Systems*, 1986), and a declared edge is
  checkable where inferred specificity is arguable.
- **The formal footing for arbitration over a graph** is the abstract argumentation
  line: Dung's frameworks (1995), in which arguments are nodes, attacks are directed
  edges, and semantics compute which sets survive; and its preference-aware
  refinements — preference-based argumentation (Amgoud & Cayrol, 2002) and value-based
  argumentation (Bench-Capon, 2003) — where an attack succeeds only if the attacker is
  not outranked. This system's canon is a deliberately restricted instance: the
  preference order is fixed at three tiers, and no extension semantics are computed —
  only maximal elements under the order.
- **The mathematics** is elementary order theory: the canon induces a strict partial
  order over the live sources bearing on a node (the acyclicity requirements on
  `supersedes` and `defers-to` are exactly what keeps it one); resolution is the set of
  maximal elements; a unique maximum controls; incomparable maximals trigger
  escalation. The refusal to proceed without a well-defined order is the same move as
  stratified negation in Datalog (Apt, Blair & Walker, 1988): stratify or reject.
  Cluster detection over permitted `depends-on` cycles is strongly-connected-component
  computation (Tarjan, 1972).
- **Impact analysis and staleness** are the invalidation discipline of build systems
  and spreadsheets — reverse-dependency walks marking dependents dirty, recomputation
  (here: human review) clearing them — and, in document form, the "impact analysis"
  sold by requirements-traceability tooling (DOORS and kin) to safety-critical
  industries.
- **Declared versus emergent authority.** Link-analysis measures — PageRank (Page &
  Brin, 1998), HITS (Kleinberg, 1999) — compute importance *from* link structure. This
  system is deliberately the opposite: authority is declared by ruling, never earned by
  citation count. For a constitutional corpus, a decision must not gain force because
  many documents happen to mention it.
- **Graph-guided context for language models** has recent precedent in GraphRAG (Edge
  et al., 2024) and, in spirit, in how LSP-based code navigation outperforms textual
  search: traversal over human-asserted structure beats similarity over text when the
  relevant connection is structural. This system's retrieval adds one element those
  lack: the neighborhood arrives *precedence-ordered*, with deferred and unresolved
  sources labeled, so the consumer does not re-derive who wins.

### 0.4 What is claimed as new

The claim is narrow and specific. Not the registers (old), not the precedence canons
(older), not typed links (DITA, wikis, traceability tools), not graph arbitration
theory (thirty years of it). What appears to be new is the **combination, made
executable at near-zero infrastructure cost**:

1. Relational referential integrity — dangling-key detection, mandatory
   rationale — enforced by a linter over plain markdown files in an ordinary
   repository, failing CI like any other check;
2. a legal-style precedence canon implemented as a pure comparator function whose
   partial-order properties are themselves tested;
3. honest incompleteness as a feature: incomparability is surfaced as a first-class
   output demanding human ruling, rather than resolved by heuristic; and
4. the resulting graph doubling as a context-selection function for LLM consumers,
   with arbitration pre-applied to the retrieved neighborhood.

Enterprise tools sell fragments of this behind licenses and servers; the argumentation
literature proves theorems about it without shipping a linter. The contribution, if it
turns out to be one, is the unglamorous middle: the whole discipline as a few hundred
lines of script, portable to any repo, with exit codes.

Provenance: the system emerged from the Ermine project (a machine-checkable style
registry for CSS), whose governing document accumulated all three registers in one
file and whose evolution exhibited the graph structure described above. It is defined
here without reference to that origin; Ermine is Binding #1 (§10).

---

## 1. Purpose and scope **[normative]**

This system governs a corpus of documents that legislate decisions for some project.
It is independent of the project's domain and vocabulary. It serves two consumers:
humans (stable navigation, review routing, conflict adjudication support) and language
models (bounded, structurally relevant, precedence-ordered context assembly).

The system governs *documents about decisions*. It does not govern the decisions'
subject matter, and nothing in it may edit content: every tool in §9 either checks,
reports, or assembles — none writes into a register.

## 2. Data model **[normative]**

A **node** is the unit of reference: a law, a ruling, a rationale entry, a decision
record, or a code symbol. Every node has:

- a **permanent ID** (§4) — its primary key;
- a **register** (§3) — its authority class;
- a **location** — file plus heading anchor (or file plus exported symbol, for code).

Two structures coexist and must not be conflated:

- **Containment is a tree**: files and headings. It answers *where does X live* and is
  allowed to change freely — location is not identity.
- **Meaning is a typed directed graph**: the edges of §5 over node IDs. It answers
  *what does X touch* and changes only by explicit edit of reference metadata.

The relational reading is definitional, not decorative: IDs are primary keys,
references are foreign keys, and §8's checks are the integrity constraints. A corpus
that fails them is invalid regardless of how sensible its prose is.

## 3. The three registers **[normative]**

Ranked; the rank is Tier 1 of arbitration (§6).

1. **Normative** — the law. Terse, present tense, binding. A sentence that constrains
   nothing does not belong in this register. Every normative ruling MUST have at least
   one rationale entry (§8, E03).
2. **Rationale** — the commentary. Why each ruling holds, what alternatives were
   rejected, what evidence exists. Explains; never binds. One entry per ruling ID.
3. **History** — the record. Append-only decision documents, one per decision event.
   A committed record is never edited; correction or reversal is a NEW record that
   `supersedes` the old. A ruling whose history has no recorded source states so
   explicitly (`history: unrecorded`) rather than acquiring an invented narrative.

Code participates as a fourth node class (not a register): source locations that
implement rulings carry `implements` edges to them and rank below all three registers
for arbitration purposes — code is evidence of the law, never a source of it.

## 4. Identifiers and reference syntax **[normative]**

- IDs are permanent: never renumbered, never reused, surviving any restructuring,
  renaming, or relocation of their node.
- ID shapes are binding-defined (§10) but MUST be short, upper-case-rooted, and
  register-distinguishing (e.g. laws, rulings, and history records visibly differ).
- Every normative node ends with one machine-parseable reference footer line carrying
  its typed outbound edges. The footer grammar (field names, separators) is fixed by
  the binding and consumed verbatim by the toolchain.
- Positional references — section numbers, line numbers, "the previous ruling" — are
  FORBIDDEN in any machine-read location (code comments, footers, rationale headings).
  Positions break under restructuring; that is precisely what IDs exist to survive.

## 5. The edge canon **[normative]**

Exactly six edge types. Adding a type is a constitutional change to this system, not a
convenience:

| Edge | From → to | Meaning |
|---|---|---|
| `depends-on` | node → node | The source's validity assumes the target as ruled |
| `constrains` | node → node | The source restricts the target's permissible content |
| `supersedes` | history → history (or ruling → ruling) | The source replaces the target |
| `rationale-of` | rationale → normative | The source explains the target |
| `implements` | code → normative | The source realizes the target |
| `defers-to` | node → node, with mandatory `scope` | Within the scope, the target controls on conflict |

**Admission test** (applies to every edge, enforced by review, stated here so it can be
cited): *if the target changed, would this node genuinely need review?* If not, no
edge — however related the topics. There is deliberately no `see-also`; associative
links inflate the graph until impact analysis returns everything, which is worse than
returning nothing.

Every `defers-to` edge is itself a recorded ruling: it carries a one-line scope and a
history record, because deciding who wins is a judgment like any other.

## 6. Arbitration **[normative]**

When more than one **live** source bears on a node (multiple inbound `constrains` /
`defers-to`-relevant authorities), precedence is decided by exactly three tiers,
applied in order:

- **Tier 1 — register rank**: normative > rationale > history > code.
- **Tier 2 — recency within a register**: the live end of a `supersedes` chain
  outranks everything it transitively supersedes.
- **Tier 3 — explicit deferral**: a `defers-to` edge, within its stated scope.

The tiers induce a strict partial order over the bearing sources. **Resolution is the
set of maximal elements of that order.** Exactly one maximal element → it controls.
Two or more mutually incomparable maximal elements → the conflict is **UNRESOLVED**:
the toolchain MUST surface it for human ruling and MUST NOT pick a winner by any other
criterion (recency across registers, textual similarity, citation count, or anything
else). The eventual human resolution enters the system as a new `defers-to` edge or a
supersession — through the same door as every other decision.

The comparator implementing the tiers MUST be a pure function, and its induced
relation MUST be verified irreflexive and transitive on test fixtures (i.e. actually a
strict partial order).

## 7. Cycle policy **[normative]**

- `supersedes` MUST be acyclic. A supersession cycle is incoherent (nothing is live).
- `defers-to` MUST be acyclic. A deferral cycle is incoherent (nothing controls).
- `depends-on` cycles are PERMITTED. Mutual dependency among decisions is a fact about
  a design, not an error. The toolchain detects strongly-connected components and
  reports each as a named **cluster** — "these decisions must be reviewed together" —
  at informational severity. Clusters are the corpus's load-bearing walls; knowing
  them is part of the system's value.

## 8. Integrity rules **[normative]**

Checked by the linter (§9.1); each violation has a distinct code. The canonical set:

| Code | Violation | Severity |
|---|---|---|
| E01 | Duplicate ID | error |
| E02 | Reference to an ID that resolves to no node | error |
| E03 | Normative ruling with no rationale entry | error |
| E04 | Normative ruling with no history field (the explicit token `unrecorded` satisfies the field; its count is reported) | error |
| E05 | `implements`/code reference to a nonexistent file or symbol | error |
| E06 | Cycle in `supersedes` | error |
| E07 | Edit to a committed history record (where version control makes this checkable) | error |
| E08 | Cycle in `defers-to` | error |
| E09 | Staleness-ledger entry whose node or cause no longer resolves | error |
| — | `depends-on` SCC clusters | info |
| — | Count of `unrecorded` histories | info |
| — | Stale-node count | warning (never fails CI: review is human-paced) |

Bindings may add codes; they may not remove or weaken these.

## 9. Toolchain contract **[normative]**

Three tools; all read-only with respect to register content.

### 9.1 Lint
Validates §8 over the corpus and exports the graph as a derived artifact
(`graph.generated.json`: nodes with id/register/location, typed edges, SCC clusters)
under a regeneration-is-a-no-op CI check. Humans never read the export; tools do.

### 9.2 Impact
Given an ID: the reverse transitive closure over the semantic graph, grouped by hop
distance and register, each entry showing its arriving edge type, and — for any
affected node with multiple live inbound authorities — the arbitration verdict
(`controls: <ID>` or `UNRESOLVED: {…} — human ruling required`). A `--mark` mode
writes the direct (one-hop) dependents into the staleness ledger; `--clear <ID>`
records that a human reviewed the node. Staleness routes attention; it never edits
content.

### 9.3 Context assembly
Given an ID and a hop bound (default 1, small maximum): the node plus its neighborhood
in BOTH edge directions, each node's text loaded from its location, ordered by the
arbitration canon — controlling sources first, deferring sources after their
controllers and labeled as deferred, incomparable pairs labeled UNRESOLVED — with
stale nodes annotated from the ledger, under a hard output budget that truncates
whole nodes only (never mid-node) and says so. Retrieval is traversal over the edges;
the edges ARE the relevance model. No similarity search substitutes for a missing
edge — a needed-but-absent edge is a corpus bug to fix, not a gap to paper over.

## 10. Binding #1 — Ermine **[normative for Ermine; informative otherwise]**

The Ermine project instantiates this system as follows:

- **Registers**: `src/ERMINE.md` (normative), `docs/ERMINE-RATIONALE.md` (rationale),
  `docs/decisions/ADR-NNNN-<slug>.md` (history). Code nodes: exported symbols in
  `src/registry.ts`, `src/lint.ts`, `src/emit.ts`, cited by ID in comments.
- **ID shapes**: `LAW-<n>`; `R-<AREA>-<nn>` with the AREA token list derived from the
  constitution's existing section structure and recorded in the binding; `ADR-<nnnn>`;
  predicate identifiers `P1…P11` continue as code-side IDs.
- **Footer grammar**:
  `→ rationale: RAT:<ID> · history: ADR-NNNN[, …] | unrecorded · code: <file>#<symbol>[, …] [· defers-to: <ID> (scope: <one line>)]`
- **Toolchain**: `docs/lint-docs.ts` (§9.1), `docs/impact.ts` + `docs/stale.json`
  (§9.2), the `ermine_context` MCP tool (§9.3), with the arbitration comparator in
  `docs/arbitration.ts` shared by 9.2 and 9.3.
- **Implementation orders**: K7 (registers, IDs, integrity), K8 (graph export, impact,
  staleness, arbitration), A6 (context assembly) in `ERMINE-WORK-ORDERS.md`, which
  implement this document and defer to it on any discrepancy.

Further bindings would replicate this section's shape: file mapping, ID shapes, footer
grammar, toolchain locations — and nothing else, because everything else above is
already general.

---

## References **[informative]**

- Dung, P. M. (1995). *On the acceptability of arguments and its fundamental role in
  nonmonotonic reasoning, logic programming and n-person games.* Artificial
  Intelligence 77(2).
- Amgoud, L. & Cayrol, C. (2002). *A reasoning model based on the production of
  acceptable arguments.* Annals of Mathematics and Artificial Intelligence 34.
- Bench-Capon, T. (2003). *Persuasion in practical argument using value-based
  argumentation frameworks.* Journal of Logic and Computation 13(3).
- Touretzky, D. (1986). *The Mathematics of Inheritance Systems.* Morgan Kaufmann.
- Apt, K., Blair, H. & Walker, A. (1988). *Towards a theory of declarative knowledge.*
  In Foundations of Deductive Databases and Logic Programming.
- Tarjan, R. (1972). *Depth-first search and linear graph algorithms.* SIAM Journal on
  Computing 1(2).
- Bradner, S. (1997). *RFC 2119: Key words for use in RFCs to Indicate Requirement
  Levels.* IETF.
- Nygard, M. (2011). *Documenting Architecture Decisions.* (The ADR pattern.)
- Page, L., Brin, S., Motwani, R. & Winograd, T. (1998). *The PageRank citation
  ranking.* Stanford InfoLab.
- Kleinberg, J. (1999). *Authoritative sources in a hyperlinked environment.* Journal
  of the ACM 46(5).
- Edge, D. et al. (2024). *From Local to Global: A Graph RAG Approach to
  Query-Focused Summarization.* Microsoft Research.
- Classical conflict canons: *lex superior derogat legi inferiori*, *lex posterior
  derogat legi priori*, *lex specialis derogat legi generali* — see any treatise on
  statutory interpretation; their graph-theoretic treatment runs through the
  argumentation literature above.
