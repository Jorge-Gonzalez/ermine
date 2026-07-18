import type { CombineDocument } from "../../src/combines.js";
import { explainParagraph, type ExplainedEmission, type ExplainedParagraph } from "../../src/paragraph-explainer.js";

export interface ExplainClassParagraphMarkdownOptions {
  combines?: CombineDocument;
  combineSource?: string;
  combineLoadError?: string;
}

type GraphNodeKind = ExplainedParagraph["graph"]["nodes"][number]["kind"];

function markdownEscape(value: string): string {
  return value.replace(/[\\`*_{}\[\]()#+.!|>-]/g, "\\$&");
}

function htmlEscape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]!));
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

const GRAPH_COLUMNS: Array<{ kind: GraphNodeKind; title: string }> = [
  { kind: "paragraph", title: "Paragraph" },
  { kind: "combine", title: "Combines" },
  { kind: "word", title: "Words" },
  { kind: "axis", title: "Axes" },
  { kind: "declaration", title: "Declarations" },
  { kind: "condition", title: "Conditions" },
  { kind: "mechanism", title: "Mechanisms" },
];

export function explainClassParagraphGraphHtml(
  classString: string,
  options: ExplainClassParagraphMarkdownOptions = {},
): string {
  const explanation = explainParagraph(classString, { combines: options.combines });
  const nodesByKind = new Map<GraphNodeKind, ExplainedParagraph["graph"]["nodes"]>();
  for (const node of explanation.graph.nodes) {
    const nodes = nodesByKind.get(node.kind) ?? [];
    nodes.push(node);
    nodesByKind.set(node.kind, nodes);
  }
  const labels = new Map(explanation.graph.nodes.map((node) => [node.id, node.label]));

  const columns = GRAPH_COLUMNS.map(({ kind, title }) => {
    const nodes = nodesByKind.get(kind) ?? [];
    const cards = nodes.length
      ? nodes.map((node) => `
          <li class="node ${kind}" data-kind="${kind}">
            <span class="label">${htmlEscape(node.label)}</span>
            ${node.detail ? `<span class="detail">${htmlEscape(node.detail)}</span>` : ""}
          </li>`).join("")
      : `<li class="empty">None</li>`;
    return `
      <section class="column" aria-label="${htmlEscape(title)}">
        <h2>${htmlEscape(title)}</h2>
        <ul>${cards}</ul>
      </section>`;
  }).join("");

  const edges = explanation.graph.edges.map((edge) => `
    <li>
      <span>${htmlEscape(labels.get(edge.from) ?? edge.from)}</span>
      <strong>${htmlEscape(edge.label)}</strong>
      <span>${htmlEscape(labels.get(edge.to) ?? edge.to)}</span>
    </li>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ermine Class Paragraph Graph</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --muted: var(--vscode-descriptionForeground);
      --rule: var(--vscode-panel-border);
      --panel: var(--vscode-sideBar-background);
      --paragraph: #7a7f86;
      --combine: #2f8f5b;
      --word: #2878d4;
      --axis: #7b61d1;
      --declaration: #c77b24;
      --condition: #b15f8a;
      --mechanism: #6f7f2a;
    }
    body {
      margin: 0;
      padding: 24px;
      background: var(--bg);
      color: var(--fg);
      font: 13px/1.45 var(--vscode-font-family);
    }
    header { margin: 0 0 20px; }
    h1 { margin: 0 0 12px; font-size: 20px; font-weight: 600; }
    h2 { margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    code {
      display: block;
      overflow-wrap: anywhere;
      padding: 8px 10px;
      border: 1px solid var(--rule);
      background: var(--panel);
    }
    .meta { display: grid; gap: 8px; margin-top: 12px; }
    .graph {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      align-items: start;
    }
    .column {
      min-width: 0;
      padding: 10px;
      border: 1px solid var(--rule);
      background: color-mix(in srgb, var(--panel) 82%, transparent);
    }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .node, .empty {
      display: grid;
      gap: 2px;
      min-height: 44px;
      padding: 8px;
      border-left: 4px solid var(--paragraph);
      background: var(--bg);
      overflow-wrap: anywhere;
    }
    .node.combine { border-color: var(--combine); }
    .node.word { border-color: var(--word); }
    .node.axis { border-color: var(--axis); }
    .node.declaration { border-color: var(--declaration); }
    .node.condition { border-color: var(--condition); }
    .node.mechanism { border-color: var(--mechanism); }
    .label { font-weight: 650; }
    .detail { color: var(--muted); font-size: 12px; }
    .edges { margin-top: 20px; }
    .edges li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      border-bottom: 1px solid var(--rule);
    }
    .edges strong { color: var(--muted); font-size: 11px; text-transform: uppercase; }
  </style>
</head>
<body>
  <header>
    <h1>Ermine Class Paragraph Graph</h1>
    <div class="meta">
      <code>${htmlEscape(classString)}</code>
      ${options.combineSource ? `<div>Combine source: <code>${htmlEscape(options.combineSource)}</code></div>` : ""}
      ${options.combineLoadError ? `<div>Combine load error: ${htmlEscape(options.combineLoadError)}</div>` : ""}
      <div>Visible: <code>${htmlEscape(explanation.normalizedVisible)}</code></div>
      <div>Expanded: <code>${htmlEscape(explanation.normalizedExpanded)}</code></div>
    </div>
  </header>
  <main>
    <section class="graph" aria-label="Paragraph graph">
      ${columns}
    </section>
    <section class="edges" aria-label="Graph edges">
      <h2>Edges</h2>
      <ul>${edges || `<li><span>No graph edges</span></li>`}</ul>
    </section>
  </main>
</body>
</html>`;
}
