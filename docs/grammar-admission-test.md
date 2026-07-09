# The grammar admission test

Ermine's product is the **class composition** — the words a person writes on an element,
read as a paragraph. A proposed word earns a place in the shared grammar only if its
paragraph passes three metrics, in priority order. The first is the bar; the next two are
what distinguish a grammar word from an implementation detail and from a domain fact.

## The three metrics

1. **Coherent** — does the combination parse as a paragraph in a *CSS implementor's mental
   model*? The words compose into something an implementer recognizes as one intent, not a
   pile of unrelated tokens.
2. **What, not how** — does it describe *what it is*, not *how it is implemented*? Names the
   choice, never the mechanism. (This is R-SKIN-01 promoted to an authoring test.)
3. **General, not specific** — does it name a *transferable behavior/pattern*, or a *domain
   application*? The grammar wants the transferable one.

## Why three, not one — they catch different failures

The same rendered result can be said several ways; only one is grammar:

| Paragraph | Fails | Because |
|---|---|---|
| `background-tone-2` | #2 | it's the mechanism, not the intent |
| `search-suggestion-active` | #3 | it's *what* (passes #2) but bound to a domain |
| `selected` | — | *what*, and a behavior any element can exhibit |

Metric 3 is orthogonal to metric 2: a word can be perfectly *what-not-how* and still be
too *specific* to be grammar. That is the failure a single "is it semantic?" test misses.

## What metric 3 is, structurally

It is the **grammar/identity boundary seen from the authoring side** — the same line the
adoption ledger draws between a `grammar` disposition and `identity-local`, and the same
line U-R2 draws ("do not force a project-specific fact into the grammar"). Stated as a
test you apply *while writing the paragraph*, it catches the mistake before it reaches the
ledger:

- passes all three → **grammar** (shared vocabulary; transfers to any project)
- fails #3 (too specific) → **identity** (component-qualified, project-owned; U-R10)
- fails #2 (mechanism) → not a word at all; it's a raw declaration

## How to use it

Hold every candidate class word to all three, in order. Use it in word-games (does the
proposed word read as a coherent, what-not-how, *general* paragraph?) and in adoption
classification (a residual that only fails #3 is identity, not a gap). The socket or
variable a word compiles to lives *below this line* — hidden implementation, named for the
compiler's convenience, never competing with the paragraph's expressiveness.
