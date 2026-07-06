export const ADOPTION_DISPOSITIONS = [
  "grammar-exact",
  "grammar-composition",
  "skin-local",
  "identity-local",
  "substrate",
  "gap",
  "dead",
  "uncertain",
] as const;

export type AdoptionDisposition = typeof ADOPTION_DISPOSITIONS[number];
export type GrammarDisposition = Extract<
  AdoptionDisposition,
  "grammar-exact" | "grammar-composition"
>;

export interface AdoptionSource {
  ermineCommit: string;
  monkyCommit: string;
}

export interface AdoptionMapping {
  axis: string;
  words: string[];
}

export interface AdoptionRecordBase {
  id: string;
  file: string;
  selector: string;
  property: string;
  value: string;
  evidence: string;
}

export type GrammarAdoptionRecord = AdoptionRecordBase & AdoptionMapping & {
  disposition: GrammarDisposition;
  gapReport?: never;
  pending?: never;
};

export type GapAdoptionRecord = AdoptionRecordBase & {
  disposition: "gap";
  gapReport: string;
  axis?: never;
  words?: never;
  pending?: never;
};

export type UncertainAdoptionRecord = AdoptionRecordBase & {
  disposition: "uncertain";
  pending: string;
  axis?: never;
  words?: never;
  gapReport?: never;
};

export type LocalAdoptionRecord = AdoptionRecordBase & {
  disposition: Exclude<AdoptionDisposition, GrammarDisposition | "gap" | "uncertain">;
  axis?: never;
  words?: never;
  gapReport?: never;
  pending?: never;
};

export type AdoptionRecord =
  | GrammarAdoptionRecord
  | GapAdoptionRecord
  | UncertainAdoptionRecord
  | LocalAdoptionRecord;

export interface AdoptionSummary {
  totalRecords: number;
  byDisposition: Record<AdoptionDisposition, number>;
}

export interface AdoptionLedgerV1 {
  version: 1;
  project: string;
  source: AdoptionSource;
  records: AdoptionRecord[];
  summary: AdoptionSummary;
}
