import type { CombineDocument } from "../../src/combines.js";
import { explainParagraph, type ExplainedEmission, type ExplainedParagraph } from "../../src/paragraph-explainer.js";

export interface ExplainClassParagraphMarkdownOptions {
  combines?: CombineDocument;
  combineSource?: string;
  combineLoadError?: string;
}

function markdownEscape(value: string): string {
  return value.replace(/[\\`*_{}\[\]()#+.!|>-]/g, "\\$&");
}

function emissionLines(emission: ExplainedEmission): string[] {
  if (emission.declarations) {
    return Object.entries(emission.declarations).map(([property, value]) => `\`${property}: ${markdownEscape(value)}\``);
  }
  if (emission.kind === "facet") return [`\`${emission.property}.${emission.facet}: ${markdownEscape(emission.value ?? "")}\``];
  if (emission.kind === "condition") return [`condition selector \`${markdownEscape(emission.selectorFragment ?? "")}\``];
  if (emission.kind === "mechanism") return [`mechanism \`${markdownEscape(emission.mechanism ?? "")}\``];
  return [];
}

function uniqueEmissionLines(explanation: ExplainedParagraph): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const emission of explanation.emitted) {
    const source = [...new Set(emission.sourceWords.map((word) => {
      if (word.origin.kind === "combine") return word.origin.combine;
      return word.origin.sourceToken || word.token;
    }))].join(", ") || emission.token || emission.axis || emission.kind;
    for (const line of emissionLines(emission)) {
      const rendered = `- \`${markdownEscape(source)}\` -> ${line}`;
      if (seen.has(rendered)) continue;
      seen.add(rendered);
      lines.push(rendered);
    }
  }
  return lines;
}

function diagnosticLines(explanation: ExplainedParagraph): string[] {
  if (!explanation.lint.length) return ["_No lint diagnostics._"];
  return explanation.lint.map((issue) =>
    `- ${issue.level.toUpperCase()} ${issue.rule}: ${markdownEscape(issue.msg)}${issue.target ? ` (${markdownEscape(issue.target)})` : ""}`);
}

function graphRows(explanation: ExplainedParagraph): string[] {
  if (!explanation.graph.edges.length) return ["_No Ermine graph nodes for this paragraph._"];
  const labels = new Map(explanation.graph.nodes.map((node) => [node.id, node.label]));
  return explanation.graph.edges.map((edge) =>
    `- ${markdownEscape(labels.get(edge.from) ?? edge.from)} -> ${markdownEscape(labels.get(edge.to) ?? edge.to)} (${markdownEscape(edge.label)})`);
}

function originText(origin: ExplainedParagraph["words"][number]["origin"]): string {
  if (origin.kind === "combine") return `combine \`${markdownEscape(origin.combine)}\``;
  return "direct";
}

function visibleRows(explanation: ExplainedParagraph): string[] {
  return explanation.visibleTokens.map((token) => {
    const axis = token.kind === "combine"
      ? "(combine)"
      : token.axis ? `\`${markdownEscape(token.axis)}\`` : "(project)";
    return `| \`${markdownEscape(token.token)}\` | ${token.kind} | ${axis} | ${token.meaning ? markdownEscape(token.meaning) : ""} |`;
  });
}

export function explainClassParagraphMarkdown(
  classString: string,
  options: ExplainClassParagraphMarkdownOptions = {},
): string {
  const explanation = explainParagraph(classString, { combines: options.combines });
  const known = explanation.words.filter((word) => word.axis);
  const unknown = explanation.visibleTokens.filter((token) => token.kind === "class" && !token.axis);
  const combines = explanation.visibleTokens.filter((token) => token.kind === "combine");
  const axes = [...new Set(known.map((word) => word.axis).filter((axis): axis is string => Boolean(axis)))];
  const emissions = uniqueEmissionLines(explanation);

  const wordRows = explanation.words.map((word) =>
    `| \`${markdownEscape(word.token)}\` | ${originText(word.origin)} | ${word.scope} | ${word.axis ? `\`${markdownEscape(word.axis)}\`` : "(project)"} | ${word.meaning ? markdownEscape(word.meaning) : "outside Ermine vocabulary"} |`);

  return [
    "# Ermine Class Paragraph",
    "",
    `Source: \`${markdownEscape(classString)}\``,
    "",
    ...(options.combineSource ? [`Combine source: \`${markdownEscape(options.combineSource)}\``, ""] : []),
    ...(options.combineLoadError ? [`Combine load error: ${markdownEscape(options.combineLoadError)}`, ""] : []),
    `Normalized visible: \`${markdownEscape(explanation.normalizedVisible)}\``,
    `Expanded: \`${markdownEscape(explanation.normalizedExpanded)}\``,
    "",
    `Known words: ${known.length}`,
    `Combines: ${combines.length}`,
    `Project words: ${unknown.length}`,
    `Axes: ${axes.length ? axes.map((axis) => `\`${markdownEscape(axis)}\``).join(", ") : "(none)"}`,
    "",
    "## Visible Tokens",
    "",
    "| token | kind | axis | meaning |",
    "|---|---|---|---|",
    ...visibleRows(explanation),
    "",
    "## Words",
    "",
    "| word | origin | scope | axis | meaning |",
    "|---|---|---|---|---|",
    ...wordRows,
    "",
    "## Emitted CSS",
    "",
    ...(emissions.length ? emissions : ["_No emitted declarations in the verified editor cache._"]),
    "",
    "## Diagnostics",
    "",
    ...diagnosticLines(explanation),
    "",
    "## Graph",
    "",
    ...graphRows(explanation),
    "",
  ].join("\n");
}
