import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  ADOPTION_DISPOSITIONS,
  type AdoptionDisposition,
  type AdoptionLedger,
} from "./types.ts";
import { runRuleActionReview } from "./rule-action-review.ts";

type JsonObject = Record<string, unknown>;

export interface LedgerValidationResult {
  valid: boolean;
  errors: string[];
  ledger?: AdoptionLedger;
}

const ROOT_KEYS = new Set(["version", "project", "source", "records", "summary"]);
const SOURCE_KEYS = new Set(["ermineCommit", "monkyCommit", "projectCommit"]);
const RECORD_KEYS = new Set([
  "id", "file", "selector", "property", "value", "disposition", "axis", "words",
  "evidence", "gapReport", "pending",
]);
const SUMMARY_KEYS = new Set(["totalRecords", "byDisposition"]);
const DISPOSITION_SET = new Set<string>(ADOPTION_DISPOSITIONS);
const GRAMMAR_DISPOSITIONS = new Set<string>(["grammar-exact", "grammar-composition"]);
const COMMIT = /^[0-9a-f]{40}$/;
const GAP_REPORT = /^reports\/GAP-U-[^/]+\.md$/;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function own(object: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function rejectUnknown(object: JsonObject, allowed: Set<string>, path: string, errors: string[]): void {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) errors.push(`${path}.${key}: unknown ledger field`);
  }
}

function requireObject(value: unknown, path: string, errors: string[]): JsonObject | undefined {
  if (!isObject(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  return value;
}

function requireString(object: JsonObject, key: string, path: string, errors: string[]): string | undefined {
  const value = object[key];
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path}.${key}: expected a non-empty string`);
    return undefined;
  }
  return value;
}

function validateCommit(value: unknown, path: string, errors: string[]): boolean {
  if (typeof value !== "string" || !COMMIT.test(value)) {
    errors.push(`${path}: expected a 40-character lowercase hexadecimal commit`);
    return false;
  }
  return true;
}

function validateSource(value: unknown, errors: string[]): void {
  const source = requireObject(value, "source", errors);
  if (!source) return;
  rejectUnknown(source, SOURCE_KEYS, "source", errors);
  validateCommit(source.ermineCommit, "source.ermineCommit", errors);
  const hasMonky = own(source, "monkyCommit");
  const hasProject = own(source, "projectCommit");
  if (!hasMonky && !hasProject) {
    errors.push("source.projectCommit: expected a 40-character lowercase hexadecimal commit");
  }
  if (hasMonky) validateCommit(source.monkyCommit, "source.monkyCommit", errors);
  if (hasProject) validateCommit(source.projectCommit, "source.projectCommit", errors);
  if (hasMonky && hasProject && source.monkyCommit !== source.projectCommit) {
    errors.push("source.projectCommit: must match source.monkyCommit when both compatibility fields are present");
  }
}

function validateWords(record: JsonObject, path: string, errors: string[]): void {
  const words = record.words;
  if (!Array.isArray(words) || words.length === 0) {
    errors.push(`${path}.words: required non-empty string array for a grammar disposition`);
    return;
  }
  const seen = new Set<string>();
  words.forEach((word, index) => {
    if (typeof word !== "string" || word.trim() === "") {
      errors.push(`${path}.words[${index}]: expected a non-empty string`);
    } else if (seen.has(word)) {
      errors.push(`${path}.words[${index}]: duplicate word '${word}'`);
    } else {
      seen.add(word);
    }
  });
}

function validateRecord(
  value: unknown,
  index: number,
  ids: Map<string, number>,
  actual: Record<AdoptionDisposition, number>,
  errors: string[],
): void {
  const path = `records[${index}]`;
  const record = requireObject(value, path, errors);
  if (!record) return;
  rejectUnknown(record, RECORD_KEYS, path, errors);

  const id = requireString(record, "id", path, errors);
  requireString(record, "file", path, errors);
  requireString(record, "selector", path, errors);
  requireString(record, "property", path, errors);
  requireString(record, "value", path, errors);
  requireString(record, "evidence", path, errors);

  if (id) {
    const first = ids.get(id);
    if (first !== undefined) errors.push(`${path}.id: duplicate id '${id}' (first used at records[${first}])`);
    else ids.set(id, index);
  }

  const dispositionValue = record.disposition;
  const disposition = typeof dispositionValue === "string" && DISPOSITION_SET.has(dispositionValue)
    ? dispositionValue as AdoptionDisposition
    : undefined;
  if (!disposition) {
    errors.push(`${path}.disposition: expected one of ${ADOPTION_DISPOSITIONS.join(", ")}`);
    return;
  }
  actual[disposition] += 1;

  if (GRAMMAR_DISPOSITIONS.has(disposition)) {
    requireString(record, "axis", path, errors);
    validateWords(record, path, errors);
  } else {
    if (own(record, "axis")) errors.push(`${path}.axis: allowed only for a grammar disposition`);
    if (own(record, "words")) errors.push(`${path}.words: allowed only for a grammar disposition`);
  }

  if (disposition === "gap") {
    const report = typeof record.gapReport === "string" && record.gapReport.trim()
      ? record.gapReport
      : undefined;
    if (!report) errors.push(`${path}.gapReport: required when disposition is gap`);
    else if (!GAP_REPORT.test(report)) {
      errors.push(`${path}.gapReport: expected reports/GAP-U-<order>-<slug>.md`);
    }
  } else if (own(record, "gapReport")) {
    errors.push(`${path}.gapReport: allowed only when disposition is gap`);
  }

  if (disposition === "uncertain") {
    if (typeof record.pending !== "string" || record.pending.trim() === "") {
      errors.push(`${path}.pending: required when disposition is uncertain`);
    }
  } else if (own(record, "pending")) {
    errors.push(`${path}.pending: allowed only when disposition is uncertain`);
  }
}

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function validateSummary(
  value: unknown,
  recordCount: number,
  actual: Record<AdoptionDisposition, number>,
  errors: string[],
): void {
  const summary = requireObject(value, "summary", errors);
  if (!summary) return;
  rejectUnknown(summary, SUMMARY_KEYS, "summary", errors);

  const total = summary.totalRecords;
  if (!nonNegativeInteger(total)) {
    errors.push("summary.totalRecords: expected a non-negative integer");
  } else if (total !== recordCount) {
    errors.push(`summary.totalRecords: conservation failed: expected ${recordCount}, got ${total}`);
  }

  const counts = requireObject(summary.byDisposition, "summary.byDisposition", errors);
  if (!counts) return;
  rejectUnknown(counts, new Set(ADOPTION_DISPOSITIONS), "summary.byDisposition", errors);

  let declaredSum = 0;
  let complete = true;
  for (const disposition of ADOPTION_DISPOSITIONS) {
    const declared = counts[disposition];
    if (!nonNegativeInteger(declared)) {
      errors.push(`summary.byDisposition.${disposition}: expected a non-negative integer`);
      complete = false;
      continue;
    }
    declaredSum += declared;
    if (declared !== actual[disposition]) {
      errors.push(
        `summary.byDisposition.${disposition}: conservation failed: expected ${actual[disposition]}, got ${declared}`,
      );
    }
  }
  if (complete && nonNegativeInteger(total) && declaredSum !== total) {
    errors.push(`summary.byDisposition: conservation failed: counts sum to ${declaredSum}, totalRecords is ${total}`);
  }
}

export function validateLedger(value: unknown): LedgerValidationResult {
  const errors: string[] = [];
  const root = requireObject(value, "ledger", errors);
  if (!root) return { valid: false, errors };
  rejectUnknown(root, ROOT_KEYS, "ledger", errors);

  if (root.version !== 1 && root.version !== 2) errors.push("ledger.version: expected 1 or 2");
  requireString(root, "project", "ledger", errors);
  validateSource(root.source, errors);

  const actual = Object.fromEntries(
    ADOPTION_DISPOSITIONS.map((disposition) => [disposition, 0]),
  ) as Record<AdoptionDisposition, number>;
  const records = root.records;
  if (!Array.isArray(records)) {
    errors.push("ledger.records: expected an array");
  } else {
    const ids = new Map<string, number>();
    records.forEach((record, index) => validateRecord(record, index, ids, actual, errors));
  }
  validateSummary(root.summary, Array.isArray(records) ? records.length : 0, actual, errors);

  return errors.length
    ? { valid: false, errors }
    : { valid: true, errors, ledger: root as unknown as AdoptionLedger };
}

export async function findLedgerPaths(repositoryRoot: string): Promise<string[]> {
  const adoptionRoot = resolve(repositoryRoot, "reports/adoption");
  const entries = await readdir(adoptionRoot, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const paths: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = resolve(adoptionRoot, entry.name, "ledger.json");
    try {
      await access(candidate, constants.R_OK);
      paths.push(candidate);
    } catch (error) {
      // A case-study directory is allowed to exist before its baseline ledger.
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return paths.sort();
}

export async function checkAdoptionLedgers(
  repositoryRoot: string,
  log: (message: string) => void = console.log,
): Promise<boolean> {
  const paths = await findLedgerPaths(repositoryRoot);
  if (paths.length === 0) {
    log("adoption:check: no reports/adoption/*/ledger.json files found; nothing to validate");
    return true;
  }

  let valid = true;
  for (const path of paths) {
    const display = relative(repositoryRoot, path).replaceAll("\\", "/");
    let value: unknown;
    try {
      value = JSON.parse(await readFile(path, "utf8"));
    } catch (error) {
      valid = false;
      log(`ERROR ${display}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    const result = validateLedger(value);
    if (!result.valid) {
      valid = false;
      for (const error of result.errors) log(`ERROR ${display}: ${error}`);
    } else {
      const missingReports: string[] = [];
      for (const record of result.ledger!.records) {
        if (record.disposition !== "gap") continue;
        try {
          await access(resolve(repositoryRoot, record.gapReport), constants.R_OK);
        } catch {
          missingReports.push(`${record.id}: referenced Gap Report is missing or unreadable: ${record.gapReport}`);
        }
      }
      if (missingReports.length) {
        valid = false;
        for (const error of missingReports) log(`ERROR ${display}: ${error}`);
      } else {
        log(`valid ${display} (${result.ledger!.summary.totalRecords} records)`);
      }
    }
  }
  const currentLedgerReportsValid = await checkCurrentLedgerReportDrift(repositoryRoot, log);
  const ruleActionReportsValid = await runRuleActionReview(repositoryRoot, true);
  return valid && currentLedgerReportsValid && ruleActionReportsValid;
}

interface CurrentLedgerHead {
  project: string;
  source?: { projectCommit?: string };
  summary?: {
    totalDeclarations?: number;
    residueDeclarations?: number;
    assimilable?: number;
    byCode?: Record<string, number>;
  };
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function requireSnippet(
  source: string,
  snippet: string,
  display: string,
  errors: string[],
): void {
  if (!source.includes(snippet)) errors.push(`${display}: missing current-ledger snippet: ${snippet}`);
}

function requireNormalizedSnippet(
  source: string,
  snippet: string,
  display: string,
  errors: string[],
): void {
  if (!normalizeWhitespace(source).includes(snippet)) {
    errors.push(`${display}: missing current-ledger summary phrase: ${snippet}`);
  }
}

async function readOptional(path: string): Promise<string | undefined> {
  try {
    await access(path, constants.R_OK);
    return readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function findCurrentLedgerPaths(repositoryRoot: string): Promise<string[]> {
  const adoptionRoot = resolve(repositoryRoot, "reports/adoption");
  const entries = await readdir(adoptionRoot, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const paths: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = resolve(adoptionRoot, entry.name, "current-ledger.json");
    try {
      await access(candidate, constants.R_OK);
      paths.push(candidate);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return paths.sort();
}

export async function checkCurrentLedgerReportDrift(
  repositoryRoot: string,
  log: (message: string) => void = console.log,
): Promise<boolean> {
  const paths = await findCurrentLedgerPaths(repositoryRoot);
  let valid = true;
  for (const path of paths) {
    const display = relative(repositoryRoot, path).replaceAll("\\", "/");
    let ledger: CurrentLedgerHead;
    try {
      ledger = JSON.parse(await readFile(path, "utf8")) as CurrentLedgerHead;
    } catch (error) {
      valid = false;
      log(`ERROR ${display}: invalid current-ledger JSON: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const total = asNumber(ledger.summary?.totalDeclarations);
    const residue = asNumber(ledger.summary?.residueDeclarations);
    const assimilable = asNumber(ledger.summary?.assimilable);
    const byCode = ledger.summary?.byCode ?? {};
    if (total === undefined || residue === undefined || assimilable === undefined) {
      valid = false;
      log(`ERROR ${display}: missing numeric summary.totalDeclarations/residueDeclarations/assimilable`);
      continue;
    }
    const adopted = total - residue;
    const reviewCoded = (byCode["skin-review"] ?? 0) + (byCode["identity-review"] ?? 0) + (byCode["state-review"] ?? 0);
    const reportRoot = dirname(path);
    const errors: string[] = [];

    const currentReport = await readOptional(resolve(reportRoot, "CURRENT-LEDGER.md"));
    if (currentReport !== undefined) {
      const currentDisplay = relative(repositoryRoot, resolve(reportRoot, "CURRENT-LEDGER.md")).replaceAll("\\", "/");
      requireSnippet(currentReport, `| current declarations | ${total} |`, currentDisplay, errors);
      requireSnippet(currentReport, `| adopted/infrastructure (generated grammar, substrate, theme metrics, config) | ${adopted} |`, currentDisplay, errors);
      requireSnippet(currentReport, `| **residue — project-owned declarations** | **${residue}** |`, currentDisplay, errors);
      requireSnippet(currentReport, `| assimilable now (work list below) | ${assimilable} |`, currentDisplay, errors);
    }

    const boundary = await readOptional(resolve(reportRoot, "BOUNDARY.md"));
    if (boundary !== undefined) {
      const boundaryDisplay = relative(repositoryRoot, resolve(reportRoot, "BOUNDARY.md")).replaceAll("\\", "/");
      requireSnippet(boundary, `| assimilable declarations | ${assimilable} |`, boundaryDisplay, errors);
      requireSnippet(boundary, `| review-coded declarations | ${reviewCoded} |`, boundaryDisplay, errors);
      requireSnippet(boundary, `| project-owned residue | ${residue} |`, boundaryDisplay, errors);
    }

    const residueDetail = await readOptional(resolve(reportRoot, "RESIDUE-DETAIL.md"));
    if (residueDetail?.includes("Generated from `reports/adoption/monky/current-ledger.json`")) {
      const detailDisplay = relative(repositoryRoot, resolve(reportRoot, "RESIDUE-DETAIL.md")).replaceAll("\\", "/");
      requireSnippet(residueDetail, `- Current declarations: ${total}`, detailDisplay, errors);
      requireSnippet(residueDetail, `- Adopted/infrastructure declarations: ${adopted}`, detailDisplay, errors);
      requireSnippet(residueDetail, `- Project-owned residue declarations: ${residue}`, detailDisplay, errors);
      requireSnippet(residueDetail, `- Assimilable declarations: ${assimilable}`, detailDisplay, errors);
    }

    const coverage = await readOptional(resolve(reportRoot, "COVERAGE.md"));
    if (coverage !== undefined) {
      const coverageDisplay = relative(repositoryRoot, resolve(reportRoot, "COVERAGE.md")).replaceAll("\\", "/");
      requireNormalizedSnippet(coverage, `${total} current declarations`, coverageDisplay, errors);
      requireNormalizedSnippet(coverage, `${adopted} adopted/infrastructure`, coverageDisplay, errors);
      requireNormalizedSnippet(coverage, `${residue} project-owned`, coverageDisplay, errors);
      requireNormalizedSnippet(coverage, `assimilable = ${assimilable}`, coverageDisplay, errors);
    }

    if (errors.length) {
      valid = false;
      for (const error of errors) log(`ERROR ${display}: ${error}`);
    } else {
      log(`current ${display} reports agree with headline counts (${total}/${adopted}/${residue})`);
    }
  }
  return valid;
}

async function main(): Promise<void> {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  if (!await checkAdoptionLedgers(repositoryRoot)) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
