import type { Issue } from "../src/lint.ts";

export type Generator = (prompt: string) => Promise<string>;

export interface RoundTrace {
  promptHash: string;
  emission: string;
  issues: Issue[];
  ms: number;
}

export type TerminalState = "valid" | "gap" | "exhausted";

export interface Trace {
  intent: string;
  rounds: RoundTrace[];
  terminalState: TerminalState;
  finalString: string;
}
