# Notes — how Ermine has outgrown its README

Status: **notes for a future README revision.** Not the revision itself. Captured while
the conceptual expansion (skin grammar + the plane model) was fresh, so a later rewrite
has the delta and its rationale ready. Do not rewrite the README from these until the
skin/theme rulings land — the README should describe ruled reality, not direction.

## Drift 1 — from "structural grammar" to a four-plane grammar

The README's tagline is "a *structural* style grammar," and all its examples are
structural. The grammar now spans **four orthogonal planes**: structure, skin, animation,
interaction/state (see `docs/plane-model.md`). A revision should:

- Lead with the plane model, not just structure.
- Add a skin example beside the structural one (`ink-accent font-mono`,
  `ground-warn-faint`) once skin is ruled.
- Keep the ermine metaphor — it is *more* apt now (words constant, theme re-skins) — but
  make it the consequence of the skin plane, not a footnote.

## Drift 2 — AI-legibility is the spine, not "face A"

The README frames LLM-native authoring as one of four co-equal faces. The distinctive
claim is larger: Ermine is **decidable context deliberately built for human+AI
collaboration** — closed vocabulary, citable constitution IDs, conservation-checked
ledgers, `--check` generators, a structured escalation path (Gap Reports). That governance
model *is* the differentiator. A revision should raise it to the top-line thesis; the four
faces become consequences of a legible, decidable core rather than the headline itself.
(See memory: ai-legible-by-design.)

## Drift 3 — status understates progress

Current status says "not yet proven by a full application… that build is the critical
path." Now true instead:

- U0–U8 are a real, multi-surface, conservation-checked migration of Monky (modal/search,
  settings/editor, suggestions/delete, extension pages), with measured before/after
  ledgers and browser-probe parity.
- The adoption *method* is extracted and reusable (protocol, declaration-level ledger,
  eight dispositions, evidence gates) — arguably a fifth deliverable the repository map
  omits.
- Empirical adequacy has moved from "audited, partial" to "demonstrated on one real
  adoption, with honest residuals indexed." State it as such; keep the honesty (one
  application, not a population).

## Also worth refreshing

- Axis count ("33 axes") — verify against the current registry before restating.
- The conceptual foundations (plane ontology, state-as-membrane, design-for-the-regularity,
  contrast-with-prior-art practice) have no home in the README; a short "foundations"
  pointer to `docs/plane-model.md` would carry the depth without bloating the front page.

## On authorship — the "not a daily CSS writer" question

Worth addressing head-on rather than hiding, because it is a strength more than a weakness
and the methodology already answers the risk:

- **Why it is mostly a strength.** Ermine's whole purpose is to describe *intent* above CSS
  implementation. Designing from the intent layer is easier, not harder, for someone who
  is not over-fit to current CSS quirks. The plane model, the carrier/role/intensity color
  grammar, and the state-membrane insight are architecture, not CSS trivia.
- **The real risk.** Some rulings are CSS-implementation-sensitive and a non-daily
  practitioner can get them subtly wrong (e.g. `overflow: clip` ≠ `overflow: hidden`;
  flex free-space negotiation; stacking contexts; pill-radius clamping). These are exactly
  the places to slow down.
- **Why it is mitigated.** The project already runs browser-level rendering checks,
  emits axis-by-axis with recorded gaps, and verifies emission against computed styles.
  That discipline catches implementation errors regardless of the author's CSS mileage.
  The division of labor is sound: human owns architecture/intent; verification + AI +
  (eventually) community fill implementation correctness and prior-art detail. It is the
  same shape as the learning-barrier method (derive, then verify the load-bearing 20% at
  the source).
