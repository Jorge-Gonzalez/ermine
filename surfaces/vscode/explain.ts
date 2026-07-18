import type { ExplanationData, ExplanationEmission, ExplanationEntry } from "./data.js";

interface ExplainedToken {
  token: string;
  scope: string;
  body: string;
  entry: ExplanationEntry | null;
}

function tokensOf(classString: string): string[] {
  return classString.trim().split(/\s+/).filter(Boolean);
}

function markdownEscape(value: string): string {
  return value.replace(/[\\`*_{}\[\]()#+.!|>-]/g, "\\$&");
}

function bodyStart(word: string, data: ExplanationData): number {
  const colon = word.indexOf(":");
  if (colon < 0) return 0;
  const prefix = word.slice(0, colon);
  return data.scopes.some((pattern) => new RegExp(pattern).test(prefix)) ? colon + 1 : 0;
}

function entryFor(body: string, data: ExplanationData): ExplanationEntry | null {
  return data.words[body] ?? data.patterns.find((entry) => new RegExp(entry.pattern).test(body)) ?? null;
}

function explainToken(token: string, data: ExplanationData): ExplainedToken {
  const start = bodyStart(token, data);
  const body = token.slice(start);
  return {
    token,
    scope: start ? token.slice(0, start - 1) : "base",
    body,
    entry: entryFor(body, data),
  };
}

function normalizedTokens(tokens: readonly ExplainedToken[], data: ExplanationData): ExplainedToken[] {
  const axisRank = new Map(data.axisOrder.map((axis, index) => [axis, index]));
  const rank = (token: ExplainedToken): [number, number, string, string] => token.entry
    ? [
        token.scope === "base" ? 1 : 2,
        axisRank.get(token.entry.axis) ?? Number.MAX_SAFE_INTEGER,
        token.scope,
        token.body,
      ]
    : [0, Number.MAX_SAFE_INTEGER, token.scope, token.body];
  return [...tokens].sort((left, right) => {
    const a = rank(left);
    const b = rank(right);
    for (let index = 0; index < a.length; index += 1) {
      if (a[index] === b[index]) continue;
      return a[index] < b[index] ? -1 : 1;
    }
    return 0;
  });
}

function emissionLines(emission: ExplanationEmission): string[] {
  if (emission.declarations) {
    return Object.entries(emission.declarations).map(([property, value]) => `\`${property}: ${markdownEscape(value)}\``);
  }
  if (emission.kind === "facet") return [`\`${emission.property}.${emission.facet}: ${markdownEscape(emission.value ?? "")}\``];
  if (emission.kind === "condition") return [`condition selector \`${markdownEscape(emission.selectorFragment ?? "")}\``];
  if (emission.kind === "mechanism") return [`mechanism \`${markdownEscape(emission.mechanism ?? "")}\``];
  return [];
}

function uniqueEmissionLines(tokens: readonly ExplainedToken[]): string[] {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const token of tokens) {
    for (const emission of token.entry?.emissions ?? []) {
      for (const line of emissionLines(emission)) {
        const rendered = `- \`${markdownEscape(token.token)}\` -> ${line}`;
        if (seen.has(rendered)) continue;
        seen.add(rendered);
        lines.push(rendered);
      }
    }
  }
  return lines;
}

export function explainClassParagraphMarkdown(classString: string, data: ExplanationData): string {
  const tokens = tokensOf(classString).map((token) => explainToken(token, data));
  const normalized = normalizedTokens(tokens, data);
  const known = normalized.filter((token) => token.entry);
  const unknown = normalized.filter((token) => !token.entry);
  const axes = [...new Set(known.map((token) => token.entry?.axis).filter((axis): axis is string => Boolean(axis)))];
  const emissions = uniqueEmissionLines(normalized);

  const wordRows = normalized.map((token) =>
    `| \`${markdownEscape(token.token)}\` | ${token.scope} | ${token.entry ? `\`${markdownEscape(token.entry.axis)}\`` : "(project)"} | ${token.entry ? markdownEscape(token.entry.meaning) : "outside Ermine vocabulary"} |`);
  const graphRows = known.map((token) =>
    `- paragraph -> \`${markdownEscape(token.token)}\` -> \`${markdownEscape(token.entry?.axis ?? "")}\``);

  return [
    "# Ermine Class Paragraph",
    "",
    `Source: \`${markdownEscape(classString)}\``,
    "",
    `Normalized: \`${markdownEscape(normalized.map((token) => token.token).join(" "))}\``,
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
    "_This VS Code command does not duplicate the core linter. The explanation cache is derived from the registry and emitter, and `npm run vscode:check` verifies it._",
    "",
    "## Graph",
    "",
    ...(graphRows.length ? graphRows : ["_No Ermine graph nodes for this paragraph._"]),
    "",
  ].join("\n");
}
