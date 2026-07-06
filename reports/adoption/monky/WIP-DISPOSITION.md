# Monky pre-Ermine worktree disposition

This report is the U0 evidence boundary between Monky's early grammar playground and
Ermine's maintained implementation. It records the starting state before either repository is
cleaned. It does not make a new grammar ruling.

## Recorded repositories

| Repository | Recorded commit | Working state at capture |
|---|---|---|
| Ermine | `a26f59dab80c97375502a7212b1f0a7df7f3f5fb` | `M docs/ERMINE-WORK-ORDERS.md`; `?? docs/Monky-implementation.md` |
| Monky | `47a082bffeef40b6361f16340a0644cab3cef971` | `M package.json`; `M pnpm-lock.yaml`; `M src/styles/layout-semantic.css`; `M vite.config.ts`; `?? src/styles/grammar/`; `?? vitest.browser.config.ts` |

The Ermine documentation changes predate U0 and are preserved. Monky's tracked diff at capture was
`121 insertions, 25 deletions` across four files: most insertions were browser-harness lockfile
changes; the semantic stylesheet removed `.items`, `.sections`, `.equal-circle`, and `.spaced`.

## Completed U0 commits

| Repository | Commit | Result |
|---|---|---|
| Ermine | `c12809f` | Thread U work-order contract |
| Ermine | `94476e1` | Adapted browser evidence and initial disposition record |
| Monky | `fc2af45` | Grammar-playground cleanup with Ermine provenance in the commit body |

The Monky result was validated with 83 test files passing (1,146 tests passed, 1 skipped) and a
successful Vite production build. The Ermine result passed the complete `npm run check` gate (219
tests) and the complete browser gate (21 tests, including all 13 adapted U0 assertions).

## Captured artifact hashes

SHA-256 is over the unmodified Monky files at the recorded commit/worktree pair.

| Artifact | SHA-256 |
|---|---|
| `src/styles/grammar/flexCharacter.browser.test.ts` | `e43d6b84a6014823d528041c3f123a2e074b24b40ca0fd309892efa92aaaaf63` |
| `src/styles/grammar/flexPipeline.browser.test.ts` | `4eb602cca7558f4bc7bf17c69e79c06daa0963ff70417b9506b74e33a866bf2b` |
| `src/styles/grammar/flexCharacter.test.ts` | `74d080fec2e446509b32040af19ef7e5807ef024c924f324c7dceeea3ab81ce6` |
| `src/styles/grammar/flexCharacter.ts` | `b1e1c23cd746ee4b9555d273574457b2bbb6661de5ec5d6bfb53acb9815961f3` |
| `src/styles/grammar/layering.browser.test.ts` | `9bd183eada8c93afedf71e9bf172c45952f64465cfe636568dd490c8e5436a52` |
| `src/styles/grammar/layering.ts` | `5a60dda2bb6d82903a97448f6f26c40bb2bfaa74939bbb78473fc706a71e6537` |
| `src/styles/grammar/valueChannel.browser.test.ts` | `280d5166c932e7559a65bec89050a9aa4ec967be5622a55ce7a416a7f1c92531` |
| `src/styles/grammar/__screenshots__/flexCharacter.browser.test.ts/golden-tables---playground-scenarios--deterministic--resolution-pipeline---basis-min-clamps-up--then-grow-result-max-clamps---redistributes-1.png` | `0a157c250dcc942cb0f7ff7b76b82b83ead2517b136b5e9ec2ca4f08242cf3dd` |
| `vitest.browser.config.ts` | `28f659cfda15810bcc6128cca014d494452eee552be573f7876249cbd7166a52` |

## Dispositions

| Monky evidence/change | Disposition | Reason and destination |
|---|---|---|
| Flex outcome and pipeline browser tests | Adapt, then remove from Monky | Durable engine-level claims move to `test/browser/flex-negotiation.test.ts`, using canonical words and Ermine's real emitter. |
| `flexCharacter.ts` and its rule test | Do not port verbatim | They are a parallel compiler and accept raw `exact-N` plus alias/dial overrides. R-M2-01 and R-M3-03 reject those surfaces. Any browser claim not already covered is salvaged through Ermine emission. |
| Layering browser test | Adapt, then remove from Monky | Z1–Z5 move to `test/browser/stacking-context.test.ts`. Named tier-two checks use Ermine emission; raw boundary integers remain quarantined probes under R-LAYER-02. |
| `layering.ts` | Do not port | It is only the old test's DOM measurement helper; the maintained test uses the existing Ermine Playwright rig directly. |
| Value-channel browser test | Drop | R-DENSITY-04 and R-COMPILE-02 explicitly retire the runtime value channel in favor of independent per-property classes over one shared scale. |
| Generated screenshot | Drop after hash capture | The adapted Node/Playwright tests assert numerical outcomes and do not use Vitest screenshot state. |
| Monky Vitest-browser harness changes | Revert | They serve only the grammar playground. U0 ports that evidence to Ermine; no Monky-owned application smoke is added in this order. |
| `.sections`, `.equal-circle`, `.spaced` removals | Keep | The selectors are unused; `sections` and `spaced` also have controlling removals in Ermine (R-SPACE-02/R-SPACE-03 and R-DENSITY-02). |
| `.items` removal | Restore | Live Monky markup still consumes `.items`; removal belongs to the later component migration that rewrites those consumers. |
| `docs/session-value-channel-retirement.md` | Keep locally as history | Monky's `.gitignore` excludes `docs/`, so do not force-add it. Add a local header pointing normative and executable authority to Ermine; the governing record is already committed in Ermine. |

## Resulting ownership boundary

Ermine owns the grammar vocabulary, compiler, and engine-level browser laws. Monky retains its
application tests and local historical design record, but no longer contains a second grammar
compiler or grammar-only browser harness. Future Monky findings enter Ermine through the Thread U
ledger and Gap Report process.
