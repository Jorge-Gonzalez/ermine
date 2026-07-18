import * as vscode from "vscode";

import completionsJson from "./completions.generated.json" with { type: "json" };
import hoversJson from "./hovers.generated.json" with { type: "json" };
import { classAttributeContextAt } from "./attributes.js";
import type { CompletionData, HoverData, HoverEntry } from "./data.js";
import { explainClassParagraphMarkdown } from "./explain.js";

const completions = completionsJson as CompletionData;
const hovers = hoversJson as HoverData;
const hoverPatterns = hovers.patterns.map((entry) => ({ ...entry, matcher: new RegExp(entry.pattern) }));
const scopePatterns = hovers.scopes.map((pattern) => new RegExp(pattern));

const DOCUMENTS: vscode.DocumentSelector = [
  "html",
  "javascriptreact",
  "typescriptreact",
  "vue",
];

function bodyStart(word: string): number {
  const colon = word.indexOf(":");
  if (colon < 0) return 0;
  const prefix = word.slice(0, colon);
  return scopePatterns.some((pattern) => pattern.test(prefix)) ? colon + 1 : 0;
}

function hoverFor(word: string): HoverEntry | undefined {
  const body = word.slice(bodyStart(word));
  return hovers.words[body] ?? hoverPatterns.find((entry) => entry.matcher.test(body));
}

function markdownEscape(value: string): string {
  return value.replace(/[\\`*_{}\[\]()#+.!|>-]/g, "\\$&");
}

const completionProvider: vscode.CompletionItemProvider = {
  provideCompletionItems(document, position) {
    const offset = document.offsetAt(position);
    const context = classAttributeContextAt(document.getText(), offset);
    if (!context) return undefined;

    const prefixLength = bodyStart(context.word);
    const range = new vscode.Range(
      document.positionAt(context.wordStart + prefixLength),
      document.positionAt(context.wordEnd),
    );
    const items: vscode.CompletionItem[] = [];

    completions.axes.forEach((axis, axisIndex) => {
      axis.items.forEach((entry) => {
        const item = new vscode.CompletionItem(
          entry.label,
          entry.kind === "snippet" ? vscode.CompletionItemKind.Snippet : vscode.CompletionItemKind.Value,
        );
        item.insertText = entry.kind === "snippet"
          ? new vscode.SnippetString(entry.insertText)
          : entry.insertText;
        item.range = range;
        item.filterText = entry.label;
        item.detail = `Ermine · ${axis.axis}`;
        item.documentation = new vscode.MarkdownString(
          `${markdownEscape(entry.meaning)}\n\nReference: \`${markdownEscape(axis.reference)}\``,
        );
        item.sortText = `${String(axisIndex).padStart(3, "0")}:${entry.label}`;
        items.push(item);
      });
    });

    return new vscode.CompletionList(items, false);
  },
};

const hoverProvider: vscode.HoverProvider = {
  provideHover(document, position) {
    const context = classAttributeContextAt(document.getText(), document.offsetAt(position));
    if (!context || !context.word) return undefined;
    const entry = hoverFor(context.word);
    if (!entry) return undefined;

    const body = context.word.slice(bodyStart(context.word));
    const contents = new vscode.MarkdownString(
      `\`${markdownEscape(body)}\`\n\n${markdownEscape(entry.meaning)}\n\n` +
      `Axis: \`${markdownEscape(entry.axis)}\`\n\nReference: \`${markdownEscape(entry.reference)}\``,
    );
    const range = new vscode.Range(
      document.positionAt(context.wordStart),
      document.positionAt(context.wordEnd),
    );
    return new vscode.Hover(contents, range);
  },
};

async function explainClassParagraph(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const document = editor.document;
  const context = classAttributeContextAt(document.getText(), document.offsetAt(editor.selection.active));
  if (!context) {
    await vscode.window.showInformationMessage("Place the cursor inside a literal class or className attribute.");
    return;
  }
  const classString = document.getText(new vscode.Range(
    document.positionAt(context.valueStart),
    document.positionAt(context.valueEnd),
  ));
  const markdown = explainClassParagraphMarkdown(classString);
  const explanationDocument = await vscode.workspace.openTextDocument({
    language: "markdown",
    content: markdown,
  });
  await vscode.window.showTextDocument(explanationDocument, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(DOCUMENTS, completionProvider),
    vscode.languages.registerHoverProvider(DOCUMENTS, hoverProvider),
    vscode.commands.registerCommand("ermine.explainClassParagraph", explainClassParagraph),
  );
}

export function deactivate(): void {}
