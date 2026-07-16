// residue-detail.ts — detailed current-ledger residue report.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { CODE_MEANING, REASON_CODES, type CurrentLedgerV2, type CurrentRecord, type ReasonCode } from "./current-ledger.ts";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const INFRASTRUCTURE_CODES = new Set<ReasonCode>([
  "ermine-emitted",
  "substrate",
  "theme-metric",
  "config-departure",
]);

function slash(path: string): string {
  return path.replaceAll("\\", "/");
}

function title(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function mdEscape(text: string): string {
  return text.replaceAll("|", "\\|");
}

function declaration(record: CurrentRecord): string {
  return `${record.property}: ${record.value}`;
}

function groupByFile(records: CurrentRecord[]): Map<string, CurrentRecord[]> {
  const groups = new Map<string, CurrentRecord[]>();
  for (const record of records) {
    const group = groups.get(record.file);
    if (group) group.push(record);
    else groups.set(record.file, [record]);
  }
  return new Map([...groups.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

export function renderResidueDetail(ledger: CurrentLedgerV2): string {
  const project = title(ledger.project);
  const adopted = ledger.summary.totalDeclarations - ledger.summary.residueDeclarations;
  const residue = ledger.records.filter((record) => !INFRASTRUCTURE_CODES.has(record.code));
  const codeSections = REASON_CODES
    .filter((code) => !INFRASTRUCTURE_CODES.has(code) && ledger.summary.byCode[code] > 0)
    .map((code) => {
      const records = residue.filter((record) => record.code === code);
      const files = [...groupByFile(records).entries()]
        .map(([file, fileRecords]) => `### ${file} (${fileRecords.length})

| line | selector | declaration |
|---:|---|---|
${fileRecords.map((record) =>
  `| ${record.line} | \`${mdEscape(record.selector)}\` | \`${mdEscape(declaration(record))}\` |`).join("\n")}`)
        .join("\n\n");
      return `## ${code} (${records.length})

${CODE_MEANING[code]}

${files}`;
    })
    .join("\n\n");
  const codeRows = REASON_CODES
    .filter((code) => !INFRASTRUCTURE_CODES.has(code) && ledger.summary.byCode[code] > 0)
    .map((code) => `| \`${code}\` | ${ledger.summary.byCode[code]} | ${CODE_MEANING[code]} |`)
    .join("\n");

  return `# ${project} Residue Detail

Generated from \`reports/adoption/${ledger.project}/current-ledger.json\`. This lists every current ${project} declaration counted as project-owned residue, excluding adopted/infrastructure and zero review buckets.

Regenerate with:

\`\`\`sh
node --import tsx adoption/residue-detail.ts --name ${ledger.project} --write
\`\`\`

## Provenance

| source | commit |
|---|---|
| Ermine | \`${ledger.source.ermineCommit}\` |
| ${ledger.project} | \`${ledger.source.projectCommit}\` |

## Summary

- Current declarations: ${ledger.summary.totalDeclarations}
- Adopted/infrastructure declarations: ${adopted}
- Project-owned residue declarations: ${ledger.summary.residueDeclarations}
- Assimilable declarations: ${ledger.summary.assimilable}
- Shadowed words: ${ledger.shadowedWords.length}

| code | declarations | meaning |
|---|---:|---|
${codeRows}

${codeSections}
`;
}

async function writeOrCheck(output: string, expected: string, check: boolean): Promise<void> {
  if (check) {
    const current = await readFile(output, "utf8").catch(() => "");
    if (current !== expected) throw new Error(`${slash(relative(REPOSITORY_ROOT, output))} is stale; run with --write`);
    console.log(`current ${slash(relative(REPOSITORY_ROOT, output))}`);
    return;
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, expected);
  console.log(`wrote ${slash(relative(REPOSITORY_ROOT, output))}`);
}

interface CliOptions { name: string; check: boolean }

function parseCli(args: string[]): CliOptions {
  const nameIndex = args.indexOf("--name");
  const name = nameIndex >= 0 ? args[nameIndex + 1] : undefined;
  const write = args.includes("--write");
  const check = args.includes("--check");
  if (!name || write === check || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error("usage: residue-detail.ts --name <slug> (--write|--check)");
  }
  return { name, check };
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const reportRoot = resolve(REPOSITORY_ROOT, "reports/adoption", options.name);
  const ledger = JSON.parse(await readFile(resolve(reportRoot, "current-ledger.json"), "utf8")) as CurrentLedgerV2;
  await writeOrCheck(resolve(reportRoot, "RESIDUE-DETAIL.md"), renderResidueDetail(ledger), options.check);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
