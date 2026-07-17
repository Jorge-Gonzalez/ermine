# Ermine Adoption Playbook

This playbook is the reusable memory extracted from the Monky adoption. The constitution
defines what Ermine words mean; this document defines how a real project is migrated into
those words without rediscovering every pattern.

The machine-readable recipes live in `adoption/playbook.ts`. `adoption/rule-action-review.ts`
uses them to annotate each current-ledger residue row with matching `playbookRecipes`.
`adoption/rule-residue-analysis.ts` then groups those reviewed declarations by authored CSS rule
so recipe and boundary decisions can be carried forward at the selector/system level.

## Recipe Shape

Each recipe records:

| field | purpose |
|---|---|
| `id` | stable recipe identifier used in reports |
| `kind` | `conversion`, `boundary`, or `review` |
| `confidence` | `mechanical`, `review`, or `human` |
| `decision` | the reusable ruling learned from adoption |
| `before` / `after` | representative source CSS and target words or boundary |
| `conversion` | the repeatable migration step |
| `boundary` | when not to apply the recipe |
| `evidence` | ADRs, commits, tests, or reports that justify the rule |

## Fast Path For A New Project

1. Run the baseline and current-ledger pipeline from `docs/ADOPTION-PROTOCOL.md`.
2. Run `npm run adoption:review`.
3. Read `RULE-ACTION-REVIEW.md` by playbook recipe first, not by file first.
4. Once `assimilable = 0`, run `npm run adoption:rules -- --write` and read
   `RULE-RESIDUE-ANALYSIS.md` before proposing new vocabulary.
5. Apply recipes in confidence order:
   - `mechanical` conversions and boundaries;
   - `review` conversions with visual/style tests;
   - `human` recipes only after a project-specific ruling.
6. Commit each completed batch in the project, then refresh Ermine reports.

This turns adoption into a queue of known transformations before it becomes exploratory
grammar design.

## Semantic Fragments

Some residue is too object-shaped to become an Ermine word, but too portable to dismiss as
project identity. The Monky adoption exposed this middle layer as semantic fragments: compact
style units such as keycaps, callout arrows, segmented-control pills, generated placeholders,
and engine scrollbar adapters.

Fragments are application-shaped but not application-bound. They preserve designer control over
the internal style structure of a component without importing a broad component-library model.
The detailed model and current Monky-discovered fragments are documented in
[`SEMANTIC-FRAGMENTS.md`](SEMANTIC-FRAGMENTS.md). The historical decision is ADR-0057.

## Current Recipes

| recipe | kind | confidence | migration memory |
|---|---|---|---|
| `existing-scale-word` | conversion | review | Existing spacing/type scale values become their already-admitted Ermine words before new grammar is considered. |
| `spacing-none-endpoints` | conversion | mechanical | Element-owned padding/margin zero becomes a matching `none` footprint word. |
| `spacing-edge-decomposition` | conversion | mechanical | Asymmetric spacing shorthands expand to physical edge words. |
| `spacing-logical-axis` | conversion | mechanical | Homogeneous inline/block spacing uses logical axis words. |
| `dimension-role-measure` | conversion | review | Repeated sizes become semantic measure/control/result/dialog roles after scale binding. |
| `edge-attachment` | conversion | review | Relational overlay placement becomes `attach-*` / `stretch-inline`. |
| `targeted-tween` | conversion | review | Repeated transition-property sets become targeted tween envelopes. |
| `rule-edge-facets` | conversion | review | Side line presence and side line colour become edge rule facets. |
| `side-corner-facets` | conversion | review | Joined/open side corners become side corner facets. |
| `state-backed-prefix` | conversion | mechanical | ARIA/platform-backed states become scoped skin words with required backing. |
| `control-state-recipe-boundary` | boundary | review | Disabled/selectable/min-selection/radio-label mechanics stay recipe-local unless a component molecule is admitted. |
| `root-and-structural-reset-boundary` | boundary | mechanical | Root resets and structural pseudo-class offsets stay local even when a word emits the same declaration. |
| `keycap-drawing-boundary` | boundary | review | Keyboard-cap bevel, shadow, and micro-geometry stay local or become a keycap recipe. |
| `callout-arrow-boundary` | boundary | review | CSS triangle arrows stay local or become a callout-arrow recipe. |
| `segmented-pill-boundary` | boundary | review | Segmented-control active-pill pseudo geometry and coordinate motion stay recipe-local. |
| `engine-scrollbar-boundary` | boundary | mechanical | Vendor scrollbar pseudo-elements stay project/post-process owned after standard socket integration. |
| `generated-placeholder-boundary` | boundary | mechanical | Generated placeholder pseudo content stays local or becomes an editor placeholder recipe. |
| `pseudo-drawing-boundary` | boundary | mechanical | Pseudo-element drawing stays local or enters as a recipe/molecule. |
| `authored-content-substrate-boundary` | boundary | human | Rich-text descendants remain an authored-HTML substrate, not flat utility gaps. |

## Batch Order

For the next project, start with recipes that have low semantic risk and high repeatability:

1. Existing-word and mechanical endpoint conversions: scale words, spacing `none`,
   logical spacing, physical spacing edges, backed state prefixes.
2. Role/measure conversions once project metrics are bound: control sizes, popover widths,
   result caps, dialog measures.
3. Relational layout conversions: edge attachment, fill/cover/push/centering if present.
4. Surface facets: rule edge presence/colour and side corner facets.
5. Motion: targeted tween envelopes; leave suppression and bespoke recipe timing local.
6. Boundary registration: root/substrate resets, control-state recipes, private drawing,
   engine pseudo-elements, authored-content substrate, recipe bundles.

The goal is not to eliminate local CSS. The goal is to make the first pass mostly mechanical,
and to reserve human time for the small set of declarations that really need a ruling.

## Updating The Playbook

When a batch settles a repeatable adoption decision:

1. Add or refine a recipe in `adoption/playbook.ts`.
2. Cite the ADR, commit, test, or report that made the decision stable.
3. Add a small test if the recipe prevents a known false positive.
4. Regenerate `RULE-ACTION-REVIEW.md` and `RULE-RESIDUE-ANALYSIS.md` so future projects inherit
   both declaration-level and rule-level memory.
5. Update this document only when the workflow or recipe catalog changes.

Recipes are allowed to be conservative. A missed suggestion is slower; a wrong mechanical
rewrite is dangerous.
