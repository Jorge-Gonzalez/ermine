# Ermine Adoption Playbook

This playbook is the reusable memory extracted from the Monky adoption. The constitution
defines what Ermine words mean; this document defines how a real project is migrated into
those words without rediscovering every pattern.

The machine-readable recipes live in `adoption/playbook.ts`. `adoption/rule-action-review.ts`
uses them to annotate each current-ledger residue row with matching `playbookRecipes`.

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
4. Apply recipes in confidence order:
   - `mechanical` conversions and boundaries;
   - `review` conversions with visual/style tests;
   - `human` recipes only after a project-specific ruling.
5. Commit each completed batch in the project, then refresh Ermine reports.

This turns adoption into a queue of known transformations before it becomes exploratory
grammar design.

## Current Recipes

| recipe | kind | confidence | migration memory |
|---|---|---|---|
| `spacing-none-endpoints` | conversion | mechanical | Element-owned padding/margin zero becomes a matching `none` footprint word. |
| `spacing-edge-decomposition` | conversion | mechanical | Asymmetric spacing shorthands expand to physical edge words. |
| `spacing-logical-axis` | conversion | mechanical | Homogeneous inline/block spacing uses logical axis words. |
| `dimension-role-measure` | conversion | review | Repeated sizes become semantic measure/control/result/dialog roles after scale binding. |
| `edge-attachment` | conversion | review | Relational overlay placement becomes `attach-*` / `stretch-inline`. |
| `targeted-tween` | conversion | review | Repeated transition-property sets become targeted tween envelopes. |
| `rule-edge-facets` | conversion | review | Side line presence and side line colour become edge rule facets. |
| `side-corner-facets` | conversion | review | Joined/open side corners become side corner facets. |
| `state-backed-prefix` | conversion | mechanical | ARIA/platform-backed states become scoped skin words with required backing. |
| `root-and-structural-reset-boundary` | boundary | mechanical | Root resets and structural pseudo-class offsets stay local even when a word emits the same declaration. |
| `pseudo-drawing-boundary` | boundary | mechanical | Pseudo-element drawing stays local or enters as a recipe/molecule. |
| `user-content-molecule-boundary` | boundary | human | Rich-text descendants move only as a prose/editor-content molecule. |

## Batch Order

For the next project, start with recipes that have low semantic risk and high repeatability:

1. Existing-word and mechanical endpoint conversions: spacing `none`, logical spacing,
   physical spacing edges, backed state prefixes.
2. Role/measure conversions once project metrics are bound: control sizes, popover widths,
   result caps, dialog measures.
3. Relational layout conversions: edge attachment, fill/cover/push/centering if present.
4. Surface facets: rule edge presence/colour and side corner facets.
5. Motion: targeted tween envelopes; leave suppression and bespoke recipe timing local.
6. Boundary registration: root/substrate resets, pseudo drawing, user-content molecules,
   recipe bundles.

The goal is not to eliminate local CSS. The goal is to make the first pass mostly mechanical,
and to reserve human time for the small set of declarations that really need a ruling.

## Updating The Playbook

When a batch settles a repeatable adoption decision:

1. Add or refine a recipe in `adoption/playbook.ts`.
2. Cite the ADR, commit, test, or report that made the decision stable.
3. Add a small test if the recipe prevents a known false positive.
4. Regenerate `RULE-ACTION-REVIEW.md` so future projects inherit the memory.
5. Update this document only when the workflow or recipe catalog changes.

Recipes are allowed to be conservative. A missed suggestion is slower; a wrong mechanical
rewrite is dangerous.
