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

export interface ExplanationEmission {
  kind: "declares" | "reads" | "facet" | "condition" | "mechanism";
  axis?: string;
  token?: string;
  selector?: string;
  declarations?: Record<string, string>;
  reads?: string[];
  property?: string;
  facet?: string;
  value?: string;
  selectorFragment?: string;
  mechanism?: string;
}

export interface ExplanationEntry extends HoverEntry {
  sibling: string;
  role: string;
  signature: string;
  member: string | null;
  dial?: string | null;
  emissions: ExplanationEmission[];
}

export interface PatternExplanation extends ExplanationEntry {
  pattern: string;
}

export interface ExplanationData {
  _generated: string[];
  scopes: string[];
  axisOrder: string[];
  words: Record<string, ExplanationEntry>;
  patterns: PatternExplanation[];
}
