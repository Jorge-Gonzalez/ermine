import { explainParagraph, type ExplainedEmission, type ExplainedParagraph } from "../../src/paragraph-explainer.js";

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
    const source = emission.sourceWords.map((word) => word.token).join(", ") || emission.token || emission.axis || emission.kind;
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

export function explainClassParagraphMarkdown(classString: string): string {
  const explanation = explainParagraph(classString);
  const known = explanation.words.filter((word) => word.axis);
  const unknown = explanation.visibleTokens.filter((token) => token.kind === "class" && !token.axis);
  const axes = [...new Set(known.map((word) => word.axis).filter((axis): axis is string => Boolean(axis)))];
  const emissions = uniqueEmissionLines(explanation);

  const wordRows = explanation.words.map((word) =>
    `| \`${markdownEscape(word.token)}\` | ${word.scope} | ${word.axis ? `\`${markdownEscape(word.axis)}\`` : "(project)"} | ${word.meaning ? markdownEscape(word.meaning) : "outside Ermine vocabulary"} |`);

  return [
    "# Ermine Class Paragraph",
    "",
    `Source: \`${markdownEscape(classString)}\``,
    "",
    `Normalized: \`${markdownEscape(explanation.normalizedExpanded)}\``,
    "",
    `Known words: ${known.length}`,
    `Project words: ${unknown.length}`,
    `Axes: ${axes.length ? axes.map((axis) => `\`${markdownEscape(axis)}\``).join(", ") : "(none)"}`,
    "",
    "## Words",
    "",
    "| word | scope | axis | meaning |",
    "|---|---|---|---|",
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
