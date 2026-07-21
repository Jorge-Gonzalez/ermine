import * as vscode from "vscode";

import completionsJson from "./completions.generated.json" with { type: "json" };
import hoversJson from "./hovers.generated.json" with { type: "json" };
import { classAttributeContextAt, classAttributeValues } from "./attributes.js";
import type { CompletionData, HoverData, HoverEntry } from "./data.js";
import { explainClassParagraphGraphHtml, explainClassParagraphMarkdown } from "./explain.js";
import { parseAndNormalizeCombines, type CombineDocument } from "../../src/combines.js";
import { orderParagraph, paragraphMaySpanLines } from "../../src/format-paragraph.js";

const completions = completionsJson as CompletionData;
const hovers = hoversJson as HoverData;
const hoverPatterns = hovers.patterns.map((entry) => ({ ...entry, matcher: new RegExp(entry.pattern) }));
const scopePatterns = hovers.scopes.map((pattern) => new RegExp(pattern));
const DEFAULT_COMBINES_FILE = "ermine.combines";

const DOCUMENTS: vscode.DocumentSelector = [
  "html",
  "javascriptreact",
  "typescriptreact",
  "vue",
];

interface LoadedCombines {
  document?: CombineDocument;
  source?: string;
  error?: string;
}

interface ActiveClassParagraph {
  editor: vscode.TextEditor;
  document: vscode.TextDocument;
  classString: string;
}

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

function configuredCombinesFile(document: vscode.TextDocument): string | undefined {
  const value = vscode.workspace
    .getConfiguration("ermine", document.uri)
    .get<string>("combinesFile", DEFAULT_COMBINES_FILE)
    .trim();
  return value || undefined;
}

function workspaceFileUri(folder: vscode.WorkspaceFolder, file: string): vscode.Uri {
  return vscode.Uri.joinPath(folder.uri, ...file.replace(/\\/g, "/").replace(/^\/+/, "").split("/").filter(Boolean));
}

async function loadCombinesFor(document: vscode.TextDocument): Promise<LoadedCombines> {
  const file = configuredCombinesFile(document);
  const folder = vscode.workspace.getWorkspaceFolder(document.uri) ?? vscode.workspace.workspaceFolders?.[0];
  if (!file || !folder) return {};

  const uri = workspaceFileUri(folder, file);
  const source = vscode.workspace.asRelativePath(uri, false);
  try {
    const bytes = await vscode.workspace.fs.readFile(uri);
    const text = new TextDecoder().decode(bytes);
    return {
      source,
      document: parseAndNormalizeCombines(text, { sourceName: source }),
    };
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code === "FileNotFound") return {};
    return {
      source,
      error: error instanceof Error ? error.message : String(error),
    };
  }
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

async function activeClassParagraph(): Promise<ActiveClassParagraph | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;
  const document = editor.document;
  const context = classAttributeContextAt(document.getText(), document.offsetAt(editor.selection.active));
  if (!context) {
    await vscode.window.showInformationMessage("Place the cursor inside a literal class or className attribute.");
    return undefined;
  }
  const classString = document.getText(new vscode.Range(
    document.positionAt(context.valueStart),
    document.positionAt(context.valueEnd),
  ));
  return { editor, document, classString };
}

async function explainClassParagraph(): Promise<void> {
  const active = await activeClassParagraph();
  if (!active) return;
  const { document, classString } = active;
  const combines = await loadCombinesFor(document);
  const markdown = explainClassParagraphMarkdown(classString, {
    combines: combines.document,
    combineSource: combines.source,
    combineLoadError: combines.error,
  });
  const explanationDocument = await vscode.workspace.openTextDocument({
    language: "markdown",
    content: markdown,
  });
  await vscode.window.showTextDocument(explanationDocument, { preview: true, viewColumn: vscode.ViewColumn.Beside });
}

async function showClassParagraphGraph(context: vscode.ExtensionContext): Promise<void> {
  const active = await activeClassParagraph();
  if (!active) return;
  const combines = await loadCombinesFor(active.document);
  const panel = vscode.window.createWebviewPanel(
    "ermineClassParagraphGraph",
    "Ermine Class Paragraph Graph",
    vscode.ViewColumn.Beside,
    {
      enableScripts: false,
      localResourceRoots: [context.extensionUri],
    },
  );
  panel.webview.html = explainClassParagraphGraphHtml(active.classString, {
    combines: combines.document,
    combineSource: combines.source,
    combineLoadError: combines.error,
  });
}

// The visible editor's options carry VS Code's *detected* indentation for the file;
// the "editor" configuration only knows the setting, which detection overrides.
function indentUnit(document: vscode.TextDocument): string {
  const options = vscode.window.visibleTextEditors.find((editor) => editor.document === document)?.options;
  const configuration = vscode.workspace.getConfiguration("editor", document.uri);
  const insertSpaces = typeof options?.insertSpaces === "boolean"
    ? options.insertSpaces
    : configuration.get<boolean>("insertSpaces", true);
  const tabSize = typeof options?.tabSize === "number"
    ? options.tabSize
    : configuration.get<number>("tabSize", 2);
  return insertSpaces ? " ".repeat(tabSize) : "\t";
}

function wantsPlaneLines(document: vscode.TextDocument): boolean {
  return vscode.workspace
    .getConfiguration("ermine", document.uri)
    .get<string>("paragraphLayout", "single-line") === "plane-per-line";
}

function paragraphEdits(document: vscode.TextDocument): vscode.TextEdit[] {
  const lines = wantsPlaneLines(document);
  const unit = indentUnit(document);
  const text = document.getText();
  const edits: vscode.TextEdit[] = [];

  for (const attribute of classAttributeValues(text)) {
    const start = document.positionAt(attribute.valueStart);
    const line = document.lineAt(start.line);
    const indent = `${line.text.slice(0, line.firstNonWhitespaceCharacterIndex)}${unit}`;
    const ordered = orderParagraph(attribute.value, {
      // Templates stay single-line to match the rewriter, which never lays them out.
      lines: lines && attribute.delimiter !== "`" && paragraphMaySpanLines(text, attribute.attributeStart),
      indent,
    });
    if (ordered === attribute.value) continue;
    edits.push(vscode.TextEdit.replace(
      new vscode.Range(start, document.positionAt(attribute.valueEnd)),
      ordered,
    ));
  }
  return edits;
}

async function formatClassParagraphs(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const edits = paragraphEdits(editor.document);
  if (!edits.length) return;
  const edit = new vscode.WorkspaceEdit();
  edit.set(editor.document.uri, edits);
  await vscode.workspace.applyEdit(edit);
}

function formatOnSave(event: vscode.TextDocumentWillSaveEvent): void {
  const enabled = vscode.workspace
    .getConfiguration("ermine", event.document.uri)
    .get<boolean>("formatOnSave", false);
  if (!enabled || vscode.languages.match(DOCUMENTS, event.document) === 0) return;
  event.waitUntil(Promise.resolve(paragraphEdits(event.document)));
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(DOCUMENTS, completionProvider),
    vscode.languages.registerHoverProvider(DOCUMENTS, hoverProvider),
    vscode.commands.registerCommand("ermine.explainClassParagraph", explainClassParagraph),
    vscode.commands.registerCommand("ermine.showClassParagraphGraph", () => showClassParagraphGraph(context)),
    vscode.commands.registerCommand("ermine.formatClassParagraphs", formatClassParagraphs),
    vscode.workspace.onWillSaveTextDocument(formatOnSave),
  );
}

export function deactivate(): void {}
