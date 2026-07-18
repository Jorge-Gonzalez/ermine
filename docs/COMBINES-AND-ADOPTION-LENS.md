# Combines And Adoption Lens Implementation Plan

This document turns the post-Monky design conversation into implementation instructions. It
covers two linked features:

1. **Ermine combines**: named groups of Ermine classes that expand to ordinary Ermine class
   paragraphs.
2. **Ermine Adoption Lens**: editor and adoption tooling that explains paragraphs, combines,
   fragments, and residue categories as a graph.

The two features are related but separate. Combines are consumable project tooling. The
Adoption Lens is explanation and migration tooling that can suggest combines, explain them,
and distinguish them from semantic fragments.

## Vocabulary

| term | meaning | owns raw CSS? |
|---|---|---:|
| Ermine class / word | one application-agnostic style intention, emitted by Ermine | yes, through the Ermine emitter |
| combine | a named group of Ermine classes | no direct raw CSS; it expands before lint/emission |
| semantic fragment | authored CSS object or mechanism, such as `sf-keycap` or `sf-callout-arrow` | yes |
| project recipe | broader component/product contract that may use Ermine classes, combines, fragments, and JS behavior | maybe |
| boundary | substrate, authored content, browser adapter, app identity, or other non-Ermine word pressure | yes or external |

Combines are not semantic fragments. A semantic fragment is a CSS-bearing object. A combine is
a compact name for a class paragraph that remains fully accountable to Ermine's linter and
emitter.

## Combine Design Goals

- Make recurring Ermine paragraphs easier to author and read.
- Keep the body close to HTML class syntax, not fake CSS.
- Preserve Ermine's canonical linting and conflict model.
- Avoid cascade-style override semantics in v1.
- Support normal project consumption, not only adoption/migration projects.
- Give the Adoption Lens a stable structure for explaining repeated classlist patterns.

## Combine Syntax

Use `combine` as the syntax keyword. Use "group" in prose:

> A combine is a named group of Ermine classes.

### Short Form

```ermine
combine option-chip: [
  selectable ground-subtle ink rule-soft corner-md ruled
  padding-block-xs padding-inline-sm font-sm text-center
  pressable truncate tween-quick
]
```

The bracketed body is a class paragraph. Do not support quoted string bodies in v1; strings
hide tokens from editors, hovers, formatting, and token-level diagnostics.

### Long Form

```ermine
combine option-chip {
  intent: compact selectable option
  scope: project
  evidence: [
    monky suggestions command item
    monky delete option
    monky style option
  ]

  classes: [
    selectable ground-subtle ink rule-soft corner-md ruled
    padding-block-xs padding-inline-sm font-sm text-center
    pressable truncate tween-quick
  ]
}
```

The long form exists for adoption evidence and editor explanation. In v1, keep metadata keys
finite:

| key | required | meaning |
|---|---:|---|
| `intent` | no | short human explanation of the pattern |
| `scope` | no | `project`, `package`, or `shared`; default `project` |
| `evidence` | no | one item per source example or report reference |
| `classes` | yes | bracketed Ermine class paragraph |

The short form is exactly sugar for the long form with only `name` and `classes`.

## Naming Rules

The combine name is the class authors place in markup:

```html
<button class="option-chip selected:ink-accent">
```

Rules:

- Names must be lowercase class tokens: `[a-z][a-z0-9-]*`.
- Names must not collide with Ermine words or scoped word bodies.
- Names must not collide with another combine.
- Names must not start with `sf-`; that prefix is reserved for semantic fragments.
- Names must not use a condition scope prefix such as `hover:` or `selected:`.
- Names should describe the group intention, not the CSS implementation.

## Class Body Rules

`classes` may contain:

- Ermine classes;
- scoped Ermine classes, such as `hover:ground-defined`, if they lint cleanly in the final
  expanded paragraph.

`classes` must not contain:

- other combine names;
- semantic fragment classes such as `sf-keycap`;
- arbitrary project classes;
- CSS declarations;
- raw selectors;
- dynamic template expressions.

The final expanded paragraph must pass Ermine lint. In v1, combines do not nest. This keeps
the system honest: every combine definition is a direct named group of Ermine classes, not a
second macro language.

## Expansion Model

A combine is a collapsed ordered span in visible source and a normal expanded paragraph for
analysis.

```text
visible source:
  option-chip selected:ink-accent

analysis expansion:
  selectable ground-subtle ink rule-soft corner-md ruled
  padding-block-xs padding-inline-sm font-sm text-center
  pressable truncate tween-quick
  selected:ink-accent
```

After expansion, the compiler should canonicalize the expanded paragraph with the same order
used by `orderParagraph()`. This canonical expanded paragraph is what linting, emission, graph
explanation, and conflict detection consume.

Authors are not required to write the body in canonical order. Correct ordering is delegated to
the automated formatter/prettier phase. The parser should accept any whitespace-separated
Ermine class order, then the formatter should rewrite it into canonical form.

## Collisions, Not Overrides

Combines are not cascade override layers in v1. A contradiction between a direct class and a
class hidden inside a combine is a lint collision.

```html
<button class="option-chip padding-inline-md">
```

If `option-chip` expands to `padding-inline-sm`, lint should fail with a diagnostic that names
the hidden source:

```text
padding-inline-md conflicts with padding-inline-sm from combine 'option-chip'
```

Do not implement override semantics in v1. If a project needs variants, it should define
separate combines:

```ermine
combine option-chip-base: [
  selectable ground-subtle ink rule-soft corner-md ruled
  font-sm text-center pressable truncate tween-quick
]

combine option-chip-compact: [
  selectable ground-subtle ink rule-soft corner-md ruled
  font-sm text-center pressable truncate tween-quick
  padding-block-xs padding-inline-sm
]

combine option-chip-roomy: [
  selectable ground-subtle ink rule-soft corner-md ruled
  font-sm text-center pressable truncate tween-quick
  padding-block-sm padding-inline-md
]
```

Override syntax can remain a future question only after real projects prove the need.

## Ordering And Formatting

Ermine already expects class paragraphs to follow a canonical category order. Combines add a
visible abstraction that can contain non-contiguous categories.

Example:

```text
canonical categories:
  cat1 cat1 cat2 cat3 cat4

combine:
  compact-control = cat1 cat3

visible paragraph:
  compact-control cat2 cat4

expanded canonical paragraph:
  cat1 cat2 cat3 cat4
```

This is valid. The combine does not leave visible "slots" for skipped categories. Instead,
Ermine keeps two orders:

| order | used by | rule |
|---|---|---|
| visible order | source formatting | keep combine names collapsed; do not interleave direct classes into hidden bodies |
| expanded order | lint, emit, graph, reports | expand combines, then canonicalize all Ermine classes together |

Formatter instructions:

1. Format each combine definition's `classes` body with normal Ermine ordering.
2. In markup, classify tokens as combine, Ermine class, scoped Ermine class, or project identity.
3. Keep combine tokens collapsed in the visible paragraph.
4. Sort direct Ermine classes normally after combine tokens.
5. Sort direct scoped Ermine classes after direct base Ermine classes.
6. Do not expand combines in source as a formatting side effect.
7. Do not judge direct classes against the combine's visible position; judge them against the
   expanded canonical paragraph.

The visible paragraph is ergonomic. The expanded paragraph is canonical.

Do not require authors to manually maintain either order. Human-authored paragraphs may be
rough, partial, or naturally ordered while drafting. The formatter owns stable ordering for
combine definitions, markup class paragraphs, manifests, and any generated fixtures.

### Multi-Line Category Formatting

The formatter should eventually support a multi-line paragraph form that places different
axes or style categories on different lines. This is a readability feature for humans and a
navigation aid for machine tooling.

For combine definitions, the formatter may render the `classes` body as grouped canonical
lines:

```ermine
combine option-chip: [
  selectable
  padding-block-xs padding-inline-sm
  ground-subtle ink rule-soft corner-md ruled
  font-sm text-center
  pressable truncate tween-quick
  hover:ground-defined hover:rule
  selected:ground-defined selected:ink-accent selected:rule-accent
]
```

For markup, combines remain collapsed, but direct additions can be grouped after them:

```html
<button
  class="
    option-chip
    width-popover-md
    selected:ground-defined selected:ink-accent
  "
>
```

The grouping must be derived from Ermine metadata, not hand-maintained prose categories. The
first implementation can group by registry sibling and scope:

1. combine names;
2. project identity classes;
3. direct base Ermine classes, grouped by sibling/axis order;
4. direct scoped Ermine classes, grouped by scope and then sibling/axis order.

Later, the formatter can expose finer display groups such as structure, spacing, constraints,
skin, type, state, motion, and affordance if the registry provides that display metadata.

This does not change lint or emission. A multi-line paragraph is only a presentation of the
same visible tokens, while analysis still expands combines and canonicalizes the complete
paragraph.

## CSS Generation Point

Combine CSS should be generated during the normal Ermine stylesheet build, not during adoption
reporting and not during metrics binding alone.

Normal project pipeline:

```text
project source scan or explicit manifest
project metric/theme variables
project combine file
        |
        v
Ermine build
  1. collect used Ermine classes and combine names
  2. parse and validate combine file
  3. expand combines for lint and analysis
  4. lint expanded paragraphs
  5. emit normal Ermine word CSS for directly used classes
  6. emit combine selector CSS for used combine names
  7. write final CSS
```

The Monky adoption manifest is one possible input to this build, but it is not the universal
model. A normal project may consume Ermine through a Vite/source scanner, a manifest, or a
precompiled static sheet plus project metrics.

## CSS Emission Semantics

The author should be able to write:

```html
<button class="option-chip">
```

and receive CSS attached to `.option-chip`, not only CSS attached to the hidden words.

Stage the implementation.

### Stage 1: Standalone Combine Emission

For each used combine name:

1. Expand its `classes` body.
2. Lint the expanded paragraph.
3. Emit the expanded paragraph.
4. Rewrite selectors owned only by the combine body to the combine selector.

Example:

```ermine
combine option-chip: [
  selectable ground-subtle ink padding-inline-sm pressable
]
```

Output should include declarations under:

```css
.option-chip { ... }
```

not only:

```css
.selectable { ... }
.padding-inline-sm { ... }
```

### Stage 2: Paragraph-Aware Combine Emission

When source uses a combine with direct classes:

```html
<button class="option-chip width-popover-md selected:ink-accent">
```

lint the full expanded paragraph:

```text
expanded(option-chip) width-popover-md selected:ink-accent
```

Then emit selectors from origin-aware tokens:

- declarations caused only by combine-hidden tokens attach to `.option-chip`;
- declarations caused only by direct classes attach to their direct class selectors;
- compound/facet declarations caused by both combine-hidden and direct classes attach to a
  compound selector containing the combine name plus the direct class names.

This origin-aware selector rewrite is necessary because Ermine sometimes emits compound
selectors for co-occurring words, such as display facets or state sinks. The combine compiler
must preserve those co-occurrence semantics without forcing hidden words into markup.

Implementation hint:

```ts
interface ExpandedToken {
  token: string;
  origin:
    | { kind: "direct"; sourceToken: string }
    | { kind: "combine"; combine: string; sourceToken: string };
}
```

The selector rewriter should map a hidden token's selector to its owning combine selector, and
map mixed-origin compound selectors to the smallest visible selector that proves the same
co-occurrence.

### Stage 3: Deferred Features

Do not implement these in v1:

- scoped combine tokens such as `hover:option-chip`;
- cascade override semantics;
- raw CSS in combine bodies;
- semantic fragments inside combine bodies;
- automatic combine extraction that rewrites source without review.

## Parser And Normalized Data

Use an Ermine-native source file such as:

```text
ermine.combines
```

The source format is human-authored. The compiler should normalize it to JSON for tooling:

```json
{
  "version": 1,
  "combines": [
    {
      "name": "option-chip",
      "intent": "compact selectable option",
      "scope": "project",
      "evidence": [
        "monky suggestions command item",
        "monky delete option",
        "monky style option"
      ],
      "classes": [
        "selectable",
        "ground-subtle",
        "ink",
        "rule-soft"
      ],
      "expandedClasses": [
        "selectable",
        "ground-subtle",
        "ink",
        "rule-soft"
      ]
    }
  ]
}
```

The generated JSON is the surface for VS Code, adoption reports, caching, and deterministic
checks. The source file remains the authoring surface.

## Core Implementation Batches

### Batch 1: Combine Model, Parser, Validator

- Add a combine parser module.
- Parse short and long forms.
- Normalize short form to the long-form data shape.
- Validate names, metadata keys, duplicate names, and class body tokenization.
- Reject combine references in `classes`; v1 combines contain Ermine classes only.
- Lint each expanded body using `src/lint.ts`.
- Add tests for valid short form, valid long form, duplicate names, unknown classes, `sf-*`
  rejection, combine-name rejection inside a body, and lint collisions inside a body.

### Batch 2: Combine-Aware Paragraph Expansion

- Add a pure function that accepts a class paragraph plus a combine registry.
- Return visible tokens, expanded tokens with origins, canonical expanded paragraph, and lint
  diagnostics.
- Ensure direct classes are checked against hidden combine classes.
- Add diagnostics that name the combine source of hidden collisions.
- Keep expansion independent of VS Code and adoption reports.

### Batch 3: Formatter Support

- Teach `orderParagraph()` or an adjacent API to accept a combine registry.
- Format combine definition bodies with normal Ermine ordering.
- Format visible markup while keeping combine names collapsed.
- Preserve project identity classes in their existing identity bucket.
- Add tests for combines that contain non-contiguous order categories.

### Batch 4: CSS Emission

- Add standalone combine CSS emission.
- Add origin-aware selector rewriting for paragraph-aware emission.
- Include combine sources in generated CSS metadata.
- Add tests for:
  - ordinary declarations under `.combine-name`;
  - facet/compound emission under `.combine-name`;
  - mixed combine/direct compound selectors;
  - no hidden word selectors required for combine-only markup.

### Batch 5: Consumer Tooling

- Add combine file flags to the normal Ermine consumer build surface.
- Integrate with the Vite/source scanner path if present.
- Keep adoption manifest support as a consumer of the same combine APIs, not the owner of the
  feature.
- Add stale-check support for normalized combine JSON and generated CSS.

## Ermine Adoption Lens

The Adoption Lens is editor/tooling, not core grammar. It should help users and AI see:

- which classes are present;
- which axes they belong to;
- what CSS they emit;
- whether the paragraph lints cleanly;
- what repeated cluster or semantic fragment it resembles;
- whether something is Ermine word pressure, semantic fragment, substrate, browser adapter,
  project recipe, app identity, or project-owned residue.

## Build A Pure Paragraph Explainer First

Add a reusable non-VS-Code module, likely under `analysis/` or `surfaces/shared/`, that accepts
a class string and optional combine registry:

```ts
explainParagraph("selectable ground-subtle pressable selected:ink-accent", {
  combines,
  backing,
  context,
});
```

Output shape:

```ts
interface ParagraphExplanation {
  source: string;
  visibleTokens: ExplainedToken[];
  expandedTokens: ExplainedToken[];
  normalizedVisible: string;
  normalizedExpanded: string;
  axes: ExplainedAxis[];
  lint: Issue[];
  emitted: ExplainedEmission[];
  graph: ExplanationGraph;
  matchedCombines: MatchedCombine[];
  matchedFragments: MatchedFragment[];
  residue?: ResidueStatus[];
}
```

Include:

- normalized classes;
- scopes like `selected:`;
- axis per class;
- meaning/reference from generated hover data;
- lint diagnostics from `src/lint.ts`;
- emitted declarations from `src/emit.ts` or `src/css.ts`;
- graph nodes and edges.

This keeps the intelligence testable before any UI exists.

## Extend Generated VS Code Data

Current VS Code data already has completions and hovers:

- `surfaces/vscode/generate-data.ts`
- `surfaces/vscode/data.ts`
- `surfaces/vscode/extension.ts`

Add generated metadata for explanation:

- class -> axis;
- class -> sibling/layer;
- class -> reference;
- class/pattern -> emitted declarations where finite;
- state/backing hints;
- ownership/control data from `src/ownership.generated.json` where useful;
- combine definitions loaded from normalized combine JSON.

## Add VS Code Command

Add an MVP command:

```text
Ermine: Explain Class Paragraph
```

It should work on the class paragraph under the cursor and open a Markdown or webview panel
showing:

- paragraph summary;
- visible and expanded forms when combines are present;
- axes represented;
- lint issues;
- emitted CSS;
- class table;
- initial graph as structured text.

This first version does not need a graphical canvas. A clear structured panel is already useful.

## Add Lightweight Graph View

Second UI pass: render the explanation as a graph.

Initial graph categories:

| colour | node kind |
|---|---|
| gray | element or class paragraph |
| blue | Ermine classes/words |
| purple | axes/facets |
| orange | declarations/sockets |
| green | combines and semantic fragments |

A stable column graph or nested DAG is preferable to a force graph in v1 because Ermine's
meaning is layered and typed, not arbitrary.

## Mine Composition Patterns

Add a project-level miner:

```text
npm run adoption:clusters -- --project ../monky
```

It should scan literal class paragraphs and report:

- common n-grams;
- near-identical paragraphs;
- repeated axis constellations;
- candidate combines;
- examples and counts;
- possible semantic fragments when the pattern requires selectors, pseudo-elements, browser
  hooks, or object mechanics.

This is where patterns such as `option-chip`, `icon-action`, `form-field`, and `command-row`
become visible.

The first miner is available as:

```sh
npm run adoption:clusters -- --project ../monky
```

It is intentionally read-only. It scans literal `class`/`className` paragraphs in app source,
skips common test/build directories, canonicalizes the Ermine tokens, and reports promotion
records (including count-one records when they help explain a family), repeated paragraphs,
common n-grams, axis constellations, near-identical paragraphs, and combine candidates. It
does not name combines automatically; naming remains a design act.

The promotion review is governed by ADR-0064: **promotion is vocabulary growth, not
compression** — a group earns a name only when the name says more than the words already say,
never merely shorter. A single-project corpus can prove local reuse but not generality, so the
mechanics never promote; they report what the corpus can actually know, and the naming review
(the grammar admission test, one level up) decides.

Each repeated paragraph is first reduced to its intrinsic core: scale-backed margin words
place an element in its parent's layout — context, not identity — and are stripped into a
per-candidate *context residue* report. Relational auto-margin words (`centered`,
`flush-block`, `push`) describe self-placement behavior and stay intrinsic. The core then
carries a typed evidence tuple instead of a score:

- context spread: distinct files and directories — the primary generality signal, ranked
  ahead of raw repetition;
- occurrence count;
- cohesion: median internal pair closure and near-closed pair share, reported only at or
  above an evidence floor (`cohesionMinCount`, default 4) — below it, rare pairs are
  trivially closed and closure would reward exactly the thinnest evidence;
- scoped words (`hover:`, `focus:`, …) and role-bound words (`popover`, `results`,
  `command`, `editor` measures) — the latter are sanctioned grammar, but a paragraph can be
  no more general than its most role-bound word, so they surface as review evidence.

Each candidate is classified by what the corpus can know about it:

| disposition | meaning |
|---|---|
| `candidate` | repeats across contexts; ready for the naming review |
| `stem` | compositional core — a correct phrase with no surplus meaning; stays spelled out and organizes families |
| `loose-bundle` | internal pairs travel apart more than together; likely coincidence |
| `local-evidence` | repeats in one file only; this corpus cannot show generality |
| `identity-shaped` | too large or stateful; belongs to the component identity plane |

Stems deserve emphasis: they point in the correct direction. `horizontal gap-md align-center`
is a perfectly grammatical phrase — it just paraphrases its own words, so naming it would add
a synonym, not a word. It stays spelled out, and serves as the trunk that named idioms branch
from.

Candidates and stems that overlap on a shared core are grouped into **combine families** with
an explicit core, kind, family spread, family usage, and per-member variant words. Count-one
members are retained: a component often absorbs the variant before the variant can repeat, so
singletons are still evidence when they orbit a reusable core. Short or divergent shared
cores may surface `fluency` families: the grammar is composing well, but a name is usually
unnecessary, so they are held structure in the review pack. Three-word-plus cores spread
across files surface stronger `idiom` families: these become the primary review targets. This
is the structure a flat candidate list hides: sibling chips, a control shell with and without
its outline, row variants — base-plus-variant vocabulary rather than accidental near-synonyms.

The report opens with the naming review contract so the judgment travels with the evidence:

1. **Surplus meaning** — the name must say more than the words already say; never merely
   shorter.
2. **Role noun** — nameable as one general role noun, optionally with a variant modifier.
3. **Project-agnostic** — the name would mean the same thing in a different product.

The algorithm still does not choose the name. It narrows the adoption work to a short,
explained list so humans or AI spend judgment on naming rather than pattern archaeology. A
promoted combine folds into the vocabulary, and the next mining pass treats it as one word —
specificity accretes one level per iteration, under the same admission test each time.

Each occurrence also carries usage context — the element tag, a trimmed content sample, and
the nearest classed ancestor — because the surplus-meaning test needs the role, not just the
recipe: `ground-subtle ink rule corner-sm ruled font-xs font-mono` on eight `<kbd>` elements
is a keycap, which no amount of word-level evidence can reveal.

The admission pass is delegated across a file boundary — **Ermine defines the contract; the
model runs outside it.** Ermine never calls a model and carries no AI dependency; it owns the
two endpoints and validates what crosses them:

```sh
# Outbound: one self-contained prompt for any AI reviewer
npm run adoption:review-pack -- --project ../monky [--budget N] [--combines <file>]

# Inbound: validate the reviewer's verdicts and render the draft review
npm run adoption:admission -- --project ../monky --verdicts admission-verdicts.json
```

The **pack** assembles idiom family cores as the primary review targets, fluency families as
held structure, individual paragraph candidates as supporting evidence, everything the
mechanics held (as context), the entire existing vocabulary, any existing combines, and the
operative protocol. The protocol is structured against the reviewer's yes-bias: the default
verdict is hold-as-stem, admission runs proposer-then-gatekeeper, every surviving name gets a
back-translation expansion produced in a fresh conversation, and at most `--budget` combines
(default 3) may be admitted per pass. The required output is a single JSON verdicts document
whose schema the pack itself carries.

The **intake** re-mines the project and holds the verdicts to what mechanics can guarantee:
every paragraph or family core exists, the budget holds, admitted names are kebab-case, don't
use the reserved `sf-` prefix, and collide with neither a grammar word (anything `parseWord`
recognizes) nor an existing combine. It scores the back-translation overlap itself — the
model's expansions, Ermine's math — flagging names that recover less than half their
paragraph as opaque. The output is `ADMISSION-REVIEW.md`: validation results, verdicts, and
a ready-to-commit draft ADR with the combine definitions. A human ratifies in commit review;
neither endpoint changes the grammar by itself.

Who fills the gap between the endpoints is deliberately open: a Claude Code session working
in the repo, a pack pasted into any model, or external tooling — the verdicts file is the
interface, and it can be committed alongside the ADR as the review's evidence.

## Distinguish Fragment Vs Combine

The miner and lens must classify candidates into the right layer:

| category | use when |
|---|---|
| Ermine word | a broad application-agnostic intention is missing |
| combine | a repeated pattern is only Ermine classes |
| semantic fragment | a repeated pattern owns authored CSS, pseudo-elements, browser hooks, or object mechanics |
| project recipe | a broader component/product contract is being named |
| boundary | the rule is substrate, authored content, browser adapter, app identity, or otherwise not word pressure |

This classification is the adoption accelerator. It prevents the next project from asking
humans or AI to rediscover the same categories by hand.

## Connect To Reports

The first report connection is `ADOPTION-LENS.md`, generated beside each current adoption
ledger by:

```sh
npm run adoption:lens
npm run adoption:lens:check
```

It indexes existing generated reports without changing strict declaration accounting:

- `RULE-ACTION-REVIEW.md`;
- `RULE-RESIDUE-ANALYSIS.md`;
- `BOUNDARY.md`;
- `current-ledger.json`;
- the classlist corpus fixture, when present.

The lens could then show:

```text
This rule is classified as semantic fragment.
This paragraph matches candidate combine 'option-chip'.
This residue is still word pressure.
This declaration is browser-adapter boundary.
```

## Suggested Delivery Order

1. Done: document and ratify combines as a consumer-tooling feature.
2. Done: implement parser, normalized JSON, and validation.
3. Done: implement combine-aware paragraph expansion and lint diagnostics.
4. Done: teach the formatter the visible-order versus expanded-order distinction.
5. Done: emit standalone combine CSS.
6. Done: emit paragraph-aware combine/direct compound CSS.
7. Done: build the pure paragraph explainer.
8. Done: add the adoption cluster miner.
9. Done: add the VS Code command with structured Markdown output.
10. Done: load workspace combine source in the VS Code paragraph explanation.
11. Done: add the static VS Code graph view.
12. Done: connect explanations to generated adoption reports through `ADOPTION-LENS.md`.

The implementation should stay conservative: combines are named groups, collisions remain
collisions, and semantic fragments remain CSS-bearing objects outside Ermine's flat word
grammar.
