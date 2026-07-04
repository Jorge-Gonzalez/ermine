import { readFile } from "node:fs/promises";

const AUTHORING_PATH = new URL("../src/LLM-AUTHORING.md", import.meta.url);
const SHARED_SPEC_PATH = new URL("../src/ERMINE-SPEC.md", import.meta.url);
const LINT_SPEC_PATH = new URL("../src/LINT-SPEC.md", import.meta.url);

function sectionStart(source: string, section: string, label: string): number {
  const match = new RegExp(`^## ${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.`, "m").exec(source);
  if (!match || match.index === undefined) {
    throw new Error(`Could not assemble authoring context: ${label} has no §${section} heading`);
  }
  return match.index;
}

export function extractNumberedSection(source: string, section: string, label: string): string {
  const start = sectionStart(source, section, label);
  const rest = source.slice(start);
  const nextHeading = /^## \d+\./gm;
  nextHeading.lastIndex = rest.indexOf("\n") + 1;
  const next = nextHeading.exec(rest);
  let end = next?.index ?? rest.length;

  if (section === "2") {
    const marker = "<!-- END GENERATED: registry -->";
    const markerIndex = rest.indexOf(marker);
    if (markerIndex < 0) {
      throw new Error(`Could not assemble authoring context: ${label} §2 has no generated-registry end marker`);
    }
    end = Math.min(end, markerIndex + marker.length);
  }

  return rest.slice(0, end).trim();
}

export async function loadAuthoringContext(): Promise<string> {
  const [authoring, shared, lintSpec] = await Promise.all([
    readFile(AUTHORING_PATH, "utf8"),
    readFile(SHARED_SPEC_PATH, "utf8"),
    readFile(LINT_SPEC_PATH, "utf8"),
  ]);
  const schema = extractNumberedSection(shared, "1", "src/ERMINE-SPEC.md");
  const registry = extractNumberedSection(shared, "2", "src/ERMINE-SPEC.md");
  const negotiated = extractNumberedSection(lintSpec, "6", "src/LINT-SPEC.md");

  return [
    "# AUTHORING CONTRACT",
    authoring.trim(),
    "# SHARED SPEC §1",
    schema,
    "# SHARED SPEC §2",
    registry,
    "# NEGOTIATED-REGIME INVARIANTS",
    negotiated,
  ].join("\n\n");
}
