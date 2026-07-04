# Ermine benchmark — results

- date: 2026-07-04
- generator: `fake`
- intent set: `bench/intents.json` (frozen; 30 intents)

| metric | ermine-loop | ermine-oneshot | tailwind-oneshot |
|---|---|---|---|
| first-emission validity | 93% | 93% | 100% |
| gap rate | 3% | 3% | n/a |
| semantic-check pass rate | 97% | 93% | n/a |

Rounds-to-valid (loop arm): 1 round: 28 · 2 rounds: 1

## How to read these numbers

- **Validity is not comparable across the last column.** The ermine arms are judged by the
  reason-bearing linter (`lint()`, with each intent's declared backing). The tailwind arm is judged
  by a permissive shape check only, because Tailwind has no reason-bearing validator — that absence
  is the point of the comparison, not an oversight.
- **Semantic checks** (axis ids / scope shapes a correct answer must touch) are defined in Ermine's
  vocabulary and are therefore not applicable to the tailwind arm. Semantic pass requires a `valid`
  terminal AND all checks satisfied.
- **Gap rate** counts emissions of the structured GAP block — a lawful terminal, not a failure.
  The tailwind arm has no gap protocol.

## Limitations

- Visual/rendered fidelity is NOT judged — that requires the browser rig and is a later extension.
- When `generator: fake`, the numbers exercise the pipeline deterministically and say nothing
  about any model.
