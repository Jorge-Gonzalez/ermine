import {
  expandCombineParagraph,
  type CombineDocument,
  type ExpandedCombineToken,
  type VisibleCombineToken,
} from "./combines.ts";
import { emit } from "./emit.ts";
import type { EmittedRule } from "./emitter-types.ts";
import { orderParagraph } from "./format-paragraph.ts";
import { lint, parseWord, type Issue, type LintContext, type Parsed } from "./lint.ts";
import { REGISTRY } from "./registry.ts";

import type { AxisRecord } from "../engine/types.ts";

export interface ExplainParagraphOptions {
  combines?: CombineDocument;
  context?: LintContext;
}

export interface ExplainedWord {
  token: string;
  normalizedToken: string;
  kind: "class";
  scope: string;
  body: string;
  axis: string | null;
  sibling: string | null;
  role: string | null;
  signature: string | null;
  member: string | null;
  value?: string | number;
  dial?: string | null;
  reference?: string;
  meaning?: string;
  origin:
    | { kind: "direct"; sourceToken: string }
    | { kind: "combine"; combine: string; sourceToken: string };
}

export interface ExplainedVisibleToken extends VisibleCombineToken {
  axis: string | null;
  sibling: string | null;
  reference?: string;
  meaning?: string;
}

export interface ExplainedEmission {
  kind: EmittedRule["kind"];
  axis?: string;
  token?: string;
  scope?: string;
  selector?: string;
  declarations?: Record<string, string>;
  reads?: string[];
  property?: string;
  facet?: string;
  value?: string;
  selectorFragment?: string;
  mechanism?: string;
  sourceWords: Array<{ token: string; origin: ExplainedWord["origin"] }>;
  origins: ExplainedWord["origin"][];
}

export interface ParagraphGraphNode {
  id: string;
  kind: "paragraph" | "combine" | "word" | "axis" | "declaration" | "condition" | "mechanism";
  label: string;
  detail?: string;
}

export interface ParagraphGraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface ExplainedParagraph {
  source: string;
  normalizedVisible: string;
  normalizedExpanded: string;
  visibleTokens: ExplainedVisibleToken[];
  words: ExplainedWord[];
  lint: Issue[];
  emitted: ExplainedEmission[];
  graph: {
    nodes: ParagraphGraphNode[];
    edges: ParagraphGraphEdge[];
  };
}

const EMPTY_COMBINES: CombineDocument = { version: 1, combines: [] };
const SECTION_BY_SIBLING: Record<AxisRecord["sibling"], string> = {
  layout: "2.1",
  layering: "2.2",
  motion: "2.3",
  state: "2.4",
  skin: "2.5",
};
const AXIS_BY_ID = new Map(REGISTRY.map((axis) => [axis.axis, axis]));

function tokensOf(classString: string): string[] {
  return classString.trim().split(/\s+/).filter(Boolean);
}

function bodyOf(parsed: Parsed): string {
  return parsed.scope === "base" ? parsed.raw : parsed.raw.slice(parsed.scope.length + 1);
}

function tokenShape(axis: AxisRecord | undefined, body: string): string | undefined {
  return axis?.tokens.find((token) => !token.fallback && token.pattern.test(body))?.shape;
}

function referenceFor(axis: AxisRecord): string {
  return `src/ERMINE-SPEC.md §${SECTION_BY_SIBLING[axis.sibling]} — ${axis.axis}`;
}

function meaningFor(axis: AxisRecord | undefined, parsed: Parsed): string | undefined {
  if (!axis) return undefined;
  const stateNote = parsed.stateMember?.note;
  if (stateNote) return stateNote;
  return axis.notes ?? tokenShape(axis, bodyOf(parsed)) ?? axis.axis;
}

function explainVisibleToken(token: VisibleCombineToken): ExplainedVisibleToken {
  if (token.kind === "combine") return { ...token, axis: null, sibling: null };
  const parsed = parseWord(token.token);
  const axis = parsed.axis ? AXIS_BY_ID.get(parsed.axis) : undefined;
  return {
    ...token,
    axis: parsed.axis,
    sibling: axis?.sibling ?? null,
    ...(axis ? { reference: referenceFor(axis), meaning: meaningFor(axis, parsed) } : {}),
  };
}

function orderedExpandedTokens(tokens: ExpandedCombineToken[], normalizedExpanded: string): ExpandedCombineToken[] {
  const remaining = [...tokens];
  return tokensOf(normalizedExpanded).map((token) => {
    const index = remaining.findIndex((item) => item.token === token);
    if (index < 0) return { token, origin: { kind: "direct", sourceToken: token } };
    return remaining.splice(index, 1)[0];
  });
}

function explainWord(item: ExpandedCombineToken): ExplainedWord {
  const parsed = parseWord(item.token);
  const axis = parsed.axis ? AXIS_BY_ID.get(parsed.axis) : undefined;
  return {
    token: item.token,
    normalizedToken: item.token,
    kind: "class",
    scope: parsed.scope,
    body: bodyOf(parsed),
    axis: parsed.axis,
    sibling: axis?.sibling ?? null,
    role: axis?.role ?? null,
    signature: axis?.signature ?? null,
    member: parsed.member,
    ...(parsed.value !== undefined ? { value: parsed.value } : {}),
    ...(parsed.dial !== undefined ? { dial: parsed.dial } : {}),
    ...(axis ? { reference: referenceFor(axis), meaning: meaningFor(axis, parsed) } : {}),
    origin: item.origin,
  };
}

function sourceWordsFor(rule: EmittedRule, words: ExplainedWord[]): Array<{ token: string; origin: ExplainedWord["origin"] }> {
  const tokens = rule.kind === "reads"
    ? rule.composesFrom.map((item) => item.token).filter((token): token is string => token !== undefined)
    : "token" in rule ? [rule.token] : [];
  const sources = tokens.flatMap((token) =>
    words
      .filter((word) => word.body === token || word.token === token)
      .map((word) => ({ token: word.token, origin: word.origin })));
  return [...new Map(sources.map((source) => [JSON.stringify(source), source])).values()];
}

function explainEmission(rule: EmittedRule, words: ExplainedWord[]): ExplainedEmission {
  const sourceWords = sourceWordsFor(rule, words);
  const base = {
    kind: rule.kind,
    scope: "scope" in rule ? rule.scope : undefined,
    sourceWords,
    origins: [...new Map(sourceWords.map((source) => [JSON.stringify(source.origin), source.origin])).values()],
  };
  if (rule.kind === "declares") {
    return { ...base, axis: rule.axis, token: rule.token, selector: rule.selector, declarations: rule.declarations };
  }
  if (rule.kind === "reads") {
    return { ...base, selector: rule.selector, declarations: rule.declarations, reads: rule.reads };
  }
  if (rule.kind === "facet") {
    return {
      ...base,
      axis: rule.axis,
      token: rule.token,
      selector: rule.selector,
      property: rule.property,
      facet: rule.facet,
      value: rule.value,
    };
  }
  if (rule.kind === "condition") {
    return { ...base, axis: rule.axis, token: rule.token, selectorFragment: rule.selectorFragment };
  }
  return { ...base, axis: rule.axis, token: rule.token, mechanism: rule.mechanism };
}

function originsByToken(expandedTokens: ExpandedCombineToken[]): Map<string, string[]> {
  const origins = new Map<string, string[]>();
  for (const item of expandedTokens) {
    if (item.origin.kind !== "combine") continue;
    const current = origins.get(item.token) ?? [];
    current.push(item.origin.combine);
    origins.set(item.token, current);
  }
  return origins;
}

function annotateHiddenOrigins(issue: Issue, expandedTokens: ExpandedCombineToken[]): Issue {
  const origins = originsByToken(expandedTokens);
  const quoted = [...issue.msg.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  const notes = quoted.flatMap((token) => (origins.get(token) ?? []).map((combine) => `${token} from combine '${combine}'`));
  const unique = [...new Set(notes)];
  if (!unique.length) return issue;
  return { ...issue, msg: `${issue.msg} Hidden combine source: ${unique.join(", ")}.` };
}

function addNode(nodes: Map<string, ParagraphGraphNode>, node: ParagraphGraphNode): void {
  if (!nodes.has(node.id)) nodes.set(node.id, node);
}

function wordNodeId(token: string, origin: ExplainedWord["origin"]): string {
  return `word:${token}:${origin.kind === "combine" ? origin.combine : "direct"}`;
}

function emitExpanded(tokens: ExpandedCombineToken[], context: LintContext): EmittedRule[] {
  const groups = new Map<string, string[]>();
  for (const item of tokens) {
    const parsed = parseWord(item.token);
    const body = bodyOf(parsed);
    (groups.get(parsed.scope) ?? groups.set(parsed.scope, []).get(parsed.scope)!).push(body);
  }
  return [...groups].flatMap(([scope, words]) =>
    emit(words.join(" "), context, scope === "base" ? undefined : scope));
}

function graphFor(explanation: Omit<ExplainedParagraph, "graph">): ExplainedParagraph["graph"] {
  const nodes = new Map<string, ParagraphGraphNode>();
  const edges: ParagraphGraphEdge[] = [];
  addNode(nodes, { id: "paragraph", kind: "paragraph", label: explanation.normalizedVisible || "(empty)" });

  for (const token of explanation.visibleTokens) {
    const id = token.kind === "combine" ? `combine:${token.token}` : `visible:${token.token}`;
    addNode(nodes, { id, kind: token.kind === "combine" ? "combine" : "word", label: token.token });
    edges.push({ from: "paragraph", to: id, label: "contains" });
  }

  for (const word of explanation.words) {
    const wordId = wordNodeId(word.token, word.origin);
    addNode(nodes, { id: wordId, kind: "word", label: word.token, detail: word.meaning });
    if (word.origin.kind === "combine") {
      edges.push({ from: `combine:${word.origin.combine}`, to: wordId, label: "expands" });
    } else {
      edges.push({ from: "paragraph", to: wordId, label: "uses" });
    }
    if (word.axis) {
      const axisId = `axis:${word.axis}`;
      addNode(nodes, { id: axisId, kind: "axis", label: word.axis, detail: word.sibling ?? undefined });
      edges.push({ from: wordId, to: axisId, label: "belongs-to" });
    }
  }

  for (const emission of explanation.emitted) {
    const sources = emission.sourceWords.map((source) => wordNodeId(source.token, source.origin)).filter((id) => nodes.has(id));
    if (emission.declarations) {
      for (const [property, value] of Object.entries(emission.declarations)) {
        const id = `declaration:${emission.selector ?? emission.kind}:${property}`;
        addNode(nodes, { id, kind: "declaration", label: property, detail: value });
        for (const source of sources) edges.push({ from: source, to: id, label: "emits" });
      }
    } else if (emission.kind === "condition" && emission.token) {
      const id = `condition:${emission.token}`;
      addNode(nodes, { id, kind: "condition", label: emission.token, detail: emission.selectorFragment });
      for (const source of sources) edges.push({ from: source, to: id, label: "conditions" });
    } else if (emission.kind === "mechanism" && emission.token) {
      const id = `mechanism:${emission.token}`;
      addNode(nodes, { id, kind: "mechanism", label: emission.token, detail: emission.mechanism });
      for (const source of sources) edges.push({ from: source, to: id, label: "requires" });
    }
  }

  return { nodes: [...nodes.values()], edges };
}

export function explainParagraph(classString: string, options: ExplainParagraphOptions = {}): ExplainedParagraph {
  const document = options.combines ?? EMPTY_COMBINES;
  const expansion = expandCombineParagraph(classString, document);
  const normalizedExpanded = orderParagraph(expansion.expandedTokens.map((token) => token.token).join(" "));
  const orderedTokens = orderedExpandedTokens(expansion.expandedTokens, normalizedExpanded);
  const words = orderedTokens.map(explainWord);
  const emitted = emitExpanded(orderedTokens, options.context ?? {}).map((rule) => explainEmission(rule, words));
  const lintIssues = lint(normalizedExpanded, new Set(), options.context ?? {})
    .map((issue) => annotateHiddenOrigins(issue, expansion.expandedTokens));
  const withoutGraph = {
    source: classString,
    normalizedVisible: expansion.normalizedVisible,
    normalizedExpanded,
    visibleTokens: expansion.visibleTokens.map(explainVisibleToken),
    words,
    lint: lintIssues,
    emitted,
  };
  return { ...withoutGraph, graph: graphFor(withoutGraph) };
}
