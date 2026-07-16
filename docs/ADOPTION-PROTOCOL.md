# Ermine adoption protocol

This protocol defines how an existing project's styles are remodeled with Ermine without losing
declarations, inventing vocabulary, or treating a high conversion percentage as success. Monky is
the first case study; the method is reusable.

The Ermine constitution remains authoritative for grammar decisions. A project remains authoritative
for its component identity, product-specific behavior, and local skin.

## 1. Pipeline and gates

Run the stages in order. Each stage consumes committed evidence from the previous one.

| Stage | Work | Required output and gate |
|---|---|---|
| Baseline | Pin both repositories and the validation commands | Clean commit IDs and behavior checks |
| Inventory | Find every delivered style source, class consumer, injection path, and direct style write | Deterministic inventory with stated limitations |
| Classification | Give every parsed declaration exactly one disposition | Valid ledger; no missing or duplicated declaration IDs |
| Mapping | Resolve only supported structural declarations to existing Ermine axes and words | Every proposed class string passes the real linter |
| Rewrite | Change one bounded component surface at a time | Ledger updated before source; generated CSS regenerated |
| Browser comparison | Compare computed styles and interaction behavior against the baseline | Equal outcomes or an explicit, human-approved difference |
| Outcome | Re-run inventory and account for every baseline declaration | Conserved final ledger and reproducible report |
| Current boundary | Reconcile the live project CSS against emitted Ermine CSS | `CURRENT-LEDGER.md`, `BOUNDARY.md`, and a zero-assimilable/zero-review gate |

Do not skip classification because a mapping appears obvious. A class name is not evidence of the
declaration's intent, and a numerically equal value is not automatically the same semantic choice.

## 2. Declaration dispositions

Every declaration gets exactly one of these eight terminal or pending dispositions:

| Disposition | Meaning | Required ledger evidence |
|---|---|---|
| `grammar-exact` | One existing Ermine mapping preserves the declaration and its intent | `axis`, non-empty `words`, comparison evidence |
| `grammar-composition` | A lawful composition of existing Ermine words preserves the declaration as part of a larger intent | `axis`, non-empty `words`, comparison evidence |
| `skin-local` | Appearance remains application-owned pending or outside Ermine skin vocabulary | Why it is skin and where it remains |
| `identity-local` | The rule expresses component identity, product behavior, or exact application geometry | Why it cannot be generalized safely |
| `substrate` | Reset, font, platform normalization, or delivery infrastructure sits below grammar authoring | The mechanical substrate test it satisfies |
| `gap` | A needed decision is absent from the constitution | `gapReport` pointing to `reports/GAP-U-<order>-<slug>.md` |
| `dead` | The declaration has no live effect or consumer | Usage or computed-style evidence |
| `uncertain` | Classification requires a human choice that has not been made | `pending` naming the exact choice |

Only `grammar-exact` and `grammar-composition` may carry `axis` and `words`. A `gap` is not an
approximate grammar mapping, and `uncertain` is not permission to rewrite.

The baseline analyzer may assign `substrate` mechanically only when both conditions hold: the
physical source basename is `reset.css`, and the selector contains no class, ID, or attribute hook.
This admits universal/root/native-element normalization while leaving component-like reset rules
`uncertain` for human review. Later manual classification may use stronger application evidence.

## 3. Ledger contract and conservation

The TypeScript contract lives in `adoption/types.ts`. Version 1 used `source.monkyCommit`
because Monky was the first case study; version 2 uses `source.projectCommit`. The validator
accepts both spellings so old ledgers remain conserved. Case-study ledgers live at
`reports/adoption/<project>/ledger.json` and are checked by `adoption/validate-ledger.ts`.

Records are declaration-level. Their IDs are unique and stable inside the pinned baseline; the
recommended shape is:

```text
<relative-file>::<selector-or-rule>::<property>::<one-based-occurrence>
```

Conservation is an equality, not an estimate:

```text
summary.totalRecords
  = records.length
  = Σ summary.byDisposition[each of the eight dispositions]
```

Each declared disposition count must also equal the count computed from `records`. Moving a
declaration into generated CSS does not remove it from the ledger. Deletion is lawful only with a
`dead` record and evidence. Split and merged declarations retain traceable baseline IDs; the outcome
report explains the relationship.

Run:

```sh
npm run adoption:check
```

The command checks every `reports/adoption/*/ledger.json`. It succeeds with an explicit message when
no baseline ledger exists yet.

The live current-ledger loop is separate from this conserved baseline. It scans the current project
CSS, compiles Ermine's emitted vocabulary, and classifies every current declaration by reason code:

```sh
npm run adoption:current -- --project ../<project> --name <project> --write --gate
npm run adoption:current -- --project ../<project> --name <project> --check --gate
```

`--gate` fails when any declaration is currently assimilable or when any review bucket remains
non-empty. When the gate is closed, the generator emits `BOUNDARY.md` beside
`CURRENT-LEDGER.md`.

After the declaration work list is empty, switch units from declarations/classes to authored CSS
rules:

```sh
npm run adoption:rules -- --write
npm run adoption:rules -- --check
```

This derives `RULE-RESIDUE-ANALYSIS.md` from `rule-action-review.json`. It groups residue by
`file + selector` so the next question is "which authored systems remain?" rather than "which
tokens are still local?" The normal `adoption:check` gate verifies this report when present.

## 4. Provenance and cross-repository commits

Every ledger pins full 40-character lowercase hexadecimal Ermine and project commits. Record the
commands, theme values, browser/runtime versions when relevant, and known inventory limitations in
the surrounding baseline or outcome report.

For coordinated changes:

1. Commit Ermine infrastructure or human-approved rulings first.
2. Record that Ermine commit in the application provenance and commit the application change.
3. If Ermine stores the outcome report, commit it last with the application commit it measured.

Never rely on an uncommitted file in one repository as evidence for the other. Generated application
CSS records the Ermine commit and generation command in its header or adjacent manifest.

## 5. Automation and human authority

Automation may:

- inventory files, imports, selectors, declarations, and static class consumers;
- calculate counts, ownership candidates, duplicate definitions, and compatibility diagnostics;
- validate existing words with Ermine's linter and emit their real declarations;
- suggest a disposition or mapping with cited mechanical evidence;
- regenerate derived artifacts and compare browser outcomes.

Automation may not decide:

- whether a declaration's product meaning is structural, identity, or skin when evidence is
  ambiguous;
- whether a recurring skin pattern deserves shared vocabulary;
- whether to admit a new word, alias, scale step, state, or spelling;
- whether an unexplained visual or behavioral difference is acceptable.

Those cases remain `uncertain` or become neutral Gap Reports. A human ruling must amend Ermine before
the new decision is applied.

## 6. Mapping and rewrite discipline

- Never coin or silently reinterpret an Ermine word.
- Validate the complete proposed class string, not isolated tokens.
- Prove token equivalence against the pinned project theme; do not infer it from names such as
  `gap-2`.
- Preserve per-element composition. Atomic declarations that participate in a facet or sink are
  generated from the complete authored class string.
- Update ledger records before changing application markup or CSS.
- Keep product-specific selectors and temporary `ui-*` skin recipes application-owned.
- Rewrite one bounded surface at a time and run its unit, build, and browser comparisons before
  proceeding.

Class paragraphs are formatted mechanically, not by author memory. The paragraph formatter derives
canonical order from the registry: unresolved identity hooks stay first in source order, base words
then follow by registry plane and axis order, and scoped words group by the imported scope-prefix
tables before their inner words use the same base order. Adoption projects run
`adoption/format-paragraphs.ts --check` beside their other generated-artifact checks.

### Theme and scale binding gate

Scale values and breakpoint values are late-bound project parameters, not values that adoption may
silently infer. Before generated CSS uses a project binding, follow this sequence:

```text
measure existing project values
  -> propose a semantic binding
  -> obtain human approval
  -> commit the project theme binding
  -> compile generated Ermine CSS
```

Automation may identify repeated values and propose candidates. It may not decide that a number
means `comfortable`, `md`, or another semantic step. Ordered bindings must preserve their declared
ordering constraints. Ambiguous candidates remain `uncertain`; missing constitutional decisions
produce Gap Reports. A compiler must fail when a used value or condition has no committed binding,
rather than guessing it. An optional reference profile may seed a new project, but it does not
override this project-owned approval step.

## 7. Reporting without a conversion target

Adoption percentage is descriptive evidence:

```text
(grammar-exact + grammar-composition) / totalRecords
```

It is never an optimization target. Moving legitimate skin, identity, or substrate declarations into
grammar merely to raise the number is a protocol failure. Report the complete disposition table,
including gaps and uncertainty, alongside the percentage. Success means that ownership is explicit,
declarations are conserved, behavior is preserved, and every result is reproducible.

## 8. Explicit manifest CSS generation

Use `adoption/build-css.ts` when an application constructs class strings dynamically, delivers CSS
to a Shadow Root, or otherwise cannot rely on D3's literal-source scanner. This is the conservative
alternative, not a replacement for D3: the scanner remains convenient for literal `class` and
`className` attributes, while the manifest makes runtime element compositions reviewable and
complete by declaration.

Manifest version 1 records one complete composition per element:

```json
{
  "version": 1,
  "elements": [
    {
      "id": "modal-navigation",
      "classString": "horizontal align-center justify-between gap-snug",
      "backing": []
    }
  ]
}
```

IDs and normalized class strings are unique. `backing` supplies the real P8 evidence for state
words; an optional `context` object may supply `elementId`, `containerAttrs`, and `parentClasses`
using `LintContext`. The compiler lints every complete composition before writing anything. Lint
errors and GAP blocks stop generation rather than producing partial CSS.

Generate and verify with:

```sh
node --import tsx adoption/build-css.ts \
  --manifest elements.json --out ermine.generated.css
node --import tsx adoption/build-css.ts \
  --manifest elements.json --out ermine.generated.css --check
```

The adjacent `.meta.json` file pins the Ermine compiler commit, input and output SHA-256 hashes,
entry and distinct-word counts, and the reproduction command. Entries are compiled in canonical ID
order, so JSON entry order cannot change the CSS. Keep both generated files together and run
`--check` in application CI.

Orientation and preference scopes have fully determined platform queries and serialize to `@media`
rules. Named viewport and container breakpoints deliberately do not: Ermine fixes the names but
leaves their numeric values project-measured. Until the application supplies that binding in a
later integration step, the serializer emits an explicit integration hint and no guessed rule.

## 9. Repeatable onboarding path

For a second project, follow the full arc rather than copying Monky-specific judgments:

1. Run the baseline analyzer (`adoption/analyze.ts`) to freeze the starting ledger and inventory.
2. Run `npm run adoption:review` and read the playbook matches before opening individual files.
   `docs/ADOPTION-PLAYBOOK.md` records the reusable conversion and boundary recipes extracted
   from Monky; `adoption/playbook.ts` applies those recipes to current-ledger rows.
3. Run bounded pilot loops: classify, map only existing words, rewrite, regenerate emitted CSS, and
   preserve behavior.
4. Introduce a project profile at `reports/adoption/<project>/project.json` for recipe classes,
   user-content roots, bridge files, scan roots, and file strata that are project-specific.
5. Use the current-ledger loop to consume existing vocabulary until `assimilable = 0`.
6. Run `npm run adoption:rules -- --write` to read the residue as authored CSS rules before
   proposing more vocabulary.
7. Empty review buckets through project-profile rules or explicit overrides, not by inventing words.
8. Publish `BOUNDARY.md`, wire the project's local reconcile command to `--check --gate`, and leave
   remaining work only in Gap Reports.

Monky's reports under `reports/adoption/monky/` are the worked example, not hidden defaults.
