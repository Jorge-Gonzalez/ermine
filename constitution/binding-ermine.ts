export const ERMINE_AREAS = [
  "DOC",
  "PLANE",
  "SCOPE",
  "GRAMMAR",
  "AXIS",
  "VOCAB",
  "ROLE",
  "STRUCTURE",
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "MEMBER",
  "SPACE",
  "DENSITY",
  "PADDING",
  "PROPORTION",
  "ALIGN",
  "DIVIDER",
  "WRAP",
  "OVERFLOW",
  "CONSTRAINT",
  "SIZE",
  "TYPE",
  "STATE",
  "MOTION",
  "LAYER",
  "SKIN",
  "SCALE",
  "COMPILE",
  "IMPL",
  "TEST",
] as const;

export type ErmineArea = (typeof ERMINE_AREAS)[number];
export type RegisterClass = "normative" | "rationale" | "history";

const AREA_SOURCE = ERMINE_AREAS.join("|");

export const ID_PATTERNS = {
  law: /^LAW-(?:[1-9]\d*|6B)$/,
  ruling: new RegExp(`^R-(?:${AREA_SOURCE})-\\d{2}$`),
  history: /^ADR-\d{4}$/,
  predicate: /^P(?:[1-9]|1[01])$/,
} as const;

export const NORMATIVE_ID_SOURCE = `(?:LAW-(?:[1-9]\\d*|6B)|R-(?:${AREA_SOURCE})-\\d{2})`;
export const NORMATIVE_ID_PATTERN = new RegExp(`^${NORMATIVE_ID_SOURCE}$`);
export const RATIONALE_ID_PATTERN = new RegExp(`^RAT:${NORMATIVE_ID_SOURCE}$`);

export interface CodeReference {
  advisoryFile: string;
  symbol: string;
}

export interface Footer {
  rationale: string;
  history: "unrecorded" | string[];
  code: CodeReference[];
  defersTo?: { id: string; scope: string };
}

export const FOOTER_GRAMMAR =
  "→ rationale: RAT:<ID> · history: ADR-NNNN[, …] | unrecorded · code: <file>#<symbol>[, …] [· defers-to: <ID> (scope: <one line>)]";

const FOOTER_PATTERN = new RegExp(
  `^→ rationale: (RAT:${NORMATIVE_ID_SOURCE}) · history: (unrecorded|ADR-\\d{4}(?:, ADR-\\d{4})*)` +
    `(?: · code: ([^·]+?))?` +
    `(?: · defers-to: (${NORMATIVE_ID_SOURCE}) \\(scope: ([^)\\n]+)\\))?$`,
);

export function isNormativeId(value: string): boolean {
  return NORMATIVE_ID_PATTERN.test(value);
}

export function parseFooter(line: string): Footer | undefined {
  const match = FOOTER_PATTERN.exec(line.trim());
  if (!match) return undefined;

  const [, rationale, historyValue, codeValue, defersTo, scope] = match;
  const code = codeValue
    ? codeValue.split(", ").map((reference): CodeReference => {
        const hash = reference.lastIndexOf("#");
        return { advisoryFile: reference.slice(0, hash), symbol: reference.slice(hash + 1) };
      })
    : [];

  if (code.some(({ advisoryFile, symbol }) => !advisoryFile || !symbol)) return undefined;

  return {
    rationale,
    history: historyValue === "unrecorded" ? "unrecorded" : historyValue.split(", "),
    code,
    ...(defersTo && scope ? { defersTo: { id: defersTo, scope } } : {}),
  };
}

