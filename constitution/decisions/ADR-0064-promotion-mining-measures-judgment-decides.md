---
register: history
---

# ADR-0064 — Promotion mining measures; the naming review decides

source: the first live Monky promotion run (`adoption/clusters.ts` semantic promotion review)
and the analysis of its scored promote/hold list.

## Objective

Ermine's words are project-agnostic because they say what an element *is doing*, not how.
Group promotion is the next linguistic level of the same idea: repeated word groups should be
able to become new vocabulary — one level more specific, still general, still readable as
intent. This level only exists because the words carry meaning; a mechanism-level vocabulary
has no such level, which is why utility-CSS extraction always collapses into project identity
(`btn-primary`). The promotion miner exists to grow the grammar along that direction, and its
design decides whether the model holds.

The governing principle:

> **Promotion is vocabulary growth, not compression. A group earns a name only when the name
> says more than the words already say — never merely shorter.**

Replacing transparent words with an opaque one is always a paragraph-readability loss; it is
justified only by surplus meaning (`mono-chip` states a role its seven words never state;
`center-row` merely paraphrases its three). A corollary sets the mechanical boundary: a
single-project corpus can prove local reuse, but it cannot prove generality — that is a
judgment about the design language. So the mechanics must propose and the naming review must
decide; no score should simulate the decision.

## What the first miner got wrong

The scored promotion review approximated the semantic judgment with arithmetic, and the live
Monky run showed the systematic distortions:

- raw repetition outweighed context spread, so 8x markup duplication inside one file outranked
  a control shell used across three directories;
- pair closure was trivially ~1.0 exactly when evidence was thinnest (2x paragraphs with rare
  words), rewarding the least-proven candidates;
- the scorer was word-blind: scale-backed margins (placement context) and role-bound measure
  words were counted as identity like any other word;
- candidates were judged independently, so sibling variants of one emerging family surfaced as
  unrelated near-synonyms;
- the score's sweet-spot bonuses kept growing in complexity without capturing the judgment
  they approximated.

## Options weighed

- Keep refining the scalar score with more features. Rejected: every feature encodes a piece
  of semantic judgment into arithmetic; complexity grows and the judgment stays uncaptured.
- Automate promotion end-to-end (LLM names and admits combines inside the miner). Rejected:
  naming is a design act and admission is a grammar ruling; both belong to the review plane
  that already exists (word-games, ADRs, the adoption ledger).
- Split the planes. Chosen: the mechanics report what a corpus can actually know — evidence,
  counter-evidence, and structure — and the naming review applies the grammar admission test
  one level up.

## The shape chosen

`adoption/clusters.ts` now mines promotion material in three planes:

1. **Evidence, not score.** Each repeated paragraph carries a typed evidence tuple — context
   spread (files, directories), occurrence count, cohesion (median internal pair closure and
   closed-pair share), scoped words, role-bound words, context residue. Ordering is
   transparent and generality-first: spread before repetition. The scalar score is retired.
2. **Evidence floor for cohesion.** Below `cohesionMinCount` occurrences, cohesion is reported
   as unavailable rather than computed, so thin data cannot masquerade as closure.
3. **Intrinsic core and context residue.** Scale-backed margin words place an element in its
   parent and are stripped into per-candidate residue before grouping; the reusable unit is
   the intrinsic core. Relational auto-margin words (`centered`, `flush-block`, `push`)
   describe self-placement behavior and stay intrinsic — the regular case is stripped, the
   exception stays visible as evidence.
4. **Role binding surfaces.** Words carrying a role segment (`popover`, `results`, `command`,
   `editor`) are sanctioned grammar, but a paragraph containing one can be no more general
   than that word; the miner flags them for the review instead of vetoing.
5. **Dispositions name what the corpus can know.** `candidate` (repeats across contexts, ready
   for review), `stem` (compositional core — correct phrase, no surplus meaning, stays spelled
   out and organizes families), `loose-bundle` (words travel apart more than together),
   `local-evidence` (one file; this corpus cannot show generality), `identity-shaped` (too
   large or stateful; component identity plane). None of these is a promotion — the mechanics
   never promote.
6. **Families.** Candidates and stems overlapping on a stem-sized shared core (≥ 3 words, via
   subset or Jaccard) are grouped into families with an explicit core and per-member variant
   words. This is the structure the flat list hid: sibling chips, control shells with and
   without their outline, row variants — base-plus-variant vocabulary rather than
   near-synonyms.
7. **The naming review contract travels with the report.** Every promotion review renders the
   admission test one level up: surplus meaning; one general role noun (optional variant
   modifier); project-agnostic meaning. A useful AI-assisted check for the third test is
   back-translation — ask a model that has not seen the definition what words the name
   expands to; low overlap exposes opaque or project-bound names.
8. **The greedy compression pass is retired.** Its gain formula (`occurrences × (words − 1) −
   words`) optimized exactly the thing promotion is not.

## Iteration

A promoted combine folds into the vocabulary, and the next mining pass treats it as a single
word — so later runs can discover phrases *containing* it, and specificity accretes one level
per iteration under the same admission test. When a second project adopts Ermine, the same
paragraph emerging independently in both corpora becomes the mechanical proof of generality
that a single corpus cannot provide; promotion records should keep their source corpus for
that comparison.

## Validation on the live corpus

Re-running Monky under the new shape: the control shell
(`control-size-lg rule corner-sm ruled pressable focus:ring`, 3 files, 3 directories) moved
from 11th to first; the former 52-point `inline-meta-group` was exposed as 8x repetition in a
single file with `margin-right-xl` reported 8x as context residue; the results cluster carries
its `max-height-results-md` role binding as explicit review evidence; and three families
surfaced with meaningful cores instead of sibling candidates.

Out of scope: automatic naming, multi-corpus ledger mechanics, and folding promoted combines
back into the scanner's vocabulary (needs the combine definitions to exist first).

## Addendum — the delegated admission pass

The naming review is delegated to an AI reviewer, structured against its yes-bias rather
than trusted with it — and delegated **across a file boundary**: Ermine defines the
contract and owns both endpoints, but never calls a model and carries no AI dependency.
Three additions carry this:

- The miner captures **usage context** per occurrence — element tag, content sample, nearest
  classed ancestor — because surplus meaning is a judgment about role, and role lives in
  usage, not in the word list (the eight-occurrence chip candidate is `<kbd>` keycaps).
- `adoption/review-pack.ts` (outbound) assembles one self-contained admission input:
  candidates with evidence and usage, families, held paragraphs as context, the full
  vocabulary, existing combines, and the operative protocol — default verdict hold-as-stem,
  proposer-then-gatekeeper passes, back-translation expansions from a fresh conversation,
  an admission budget per pass (default 3), and the JSON schema the verdicts must follow.
- `adoption/admission-intake.ts` (inbound) validates the returned verdicts mechanically —
  paragraphs exist, budget holds, names are kebab-case, non-`sf-`, and collide with neither
  grammar words nor existing combines — scores the back-translation overlap with Ermine's
  own math, and renders `ADMISSION-REVIEW.md` with a ready-to-commit draft ADR. A human
  ratifies in commit review; neither endpoint changes the grammar by itself.

Options weighed for the bridge: an in-repo API integration (SDK dependency, keys, a chosen
model hard-wired into Ermine) was rejected — the reviewer should be pluggable, and the
verdicts file is a committable artifact that makes each review reproducible evidence. The
gap between the endpoints is filled by whatever agent the user chooses: a Claude Code
session in the repo, a pasted pack, or external tooling.
