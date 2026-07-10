// lint.ts — Ermine's linter: the vocabulary-independent engine (engine/)
// instantiated with this project's axis registry. Predicate substance lives in
// engine/predicates.ts; the three formerly-hardcoded rules (P6b, P10, P11) are
// now declared data in registry.ts. This file only binds the two and preserves
// the public surface (B1) — it is also the doc system's citation surface for
// the predicate symbols, so the implements comments live on the bindings.

import { createLinter } from "../engine/index.ts";
import { ENVIRONMENT_SCOPES, REGISTRY } from "./registry.ts";

export type { Issue, LintContext, Parsed } from "../engine/types.ts";

const linter = createLinter(REGISTRY, ENVIRONMENT_SCOPES);

// implements: R-STATE-07, R-STATE-10
export const parseWord = linter.parseWord;
// implements: LAW-2
export const p1_oneWordPerAxisPerScope = linter.p1;
// implements: LAW-6, R-VOCAB-03
export const p2_unknownWord = linter.p2;
// implements: R-M3-03
export const p3_badParameter = linter.p3;
export const p4_enumArity = linter.p4;
export const p6_arityMisuse = linter.p6;
// implements: LAW-6B, R-STATE-05
export const p8_stateEntailment = linter.p8;
// implements: R-STATE-05
export const p8b_relationalEntailment = linter.p8b;
// implements: R-DIVIDER-02
export const p10_dividerWrap = linter.p10;
// implements: R-M1-01
export const p11_m1OnFlexItem = linter.p11;

export const lint = linter.lint;
