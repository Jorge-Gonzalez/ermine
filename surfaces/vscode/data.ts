export interface CompletionEntry {
  label: string;
  insertText: string;
  kind: "word" | "snippet";
  meaning: string;
}

export interface CompletionAxis {
  axis: string;
  reference: string;
  items: CompletionEntry[];
}

export interface CompletionData {
  _generated: string[];
  axes: CompletionAxis[];
}

export interface HoverEntry {
  axis: string;
  meaning: string;
  reference: string;
}

export interface PatternHover extends HoverEntry {
  pattern: string;
}

export interface HoverData {
  _generated: string[];
  scopes: string[];
  words: Record<string, HoverEntry>;
  patterns: PatternHover[];
}
