import { readFile, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import { renderAudit } from "./audit.ts";
import { measureCss, type CssSource } from "./lib.ts";

interface AppTarget {
  slug: string;
  files: string[];
}

const REPOSITORY_ROOT = fileURLToPath(new URL("../", import.meta.url));
const CORPUS_ROOT = resolve(REPOSITORY_ROOT, "analysis/corpus");

export const APP_TARGETS: readonly AppTarget[] = [
  {
    slug: "firefox-about-debugging",
    files: [
      "aboutdebugging.css",
      "dependencies/devtools-variables.css",
      "dependencies/tokens-brand.css",
      "dependencies/tokens-shared.css",
      "src/base.css",
      "src/components/App.css",
      "src/components/ProfilerDialog.css",
      "src/components/RuntimeActions.css",
      "src/components/RuntimeInfo.css",
      "src/components/connect/ConnectPage.css",
      "src/components/connect/ConnectSection.css",
      "src/components/connect/ConnectSteps.css",
      "src/components/connect/NetworkLocationsForm.css",
      "src/components/connect/NetworkLocationsList.css",
      "src/components/debugtarget/DebugTargetItem.css",
      "src/components/debugtarget/DebugTargetList.css",
      "src/components/debugtarget/DebugTargetPane.css",
      "src/components/debugtarget/ExtensionDetail.css",
      "src/components/debugtarget/FieldPair.css",
      "src/components/debugtarget/ServiceWorkerAction.css",
      "src/components/debugtarget/TemporaryExtensionInstallSection.css",
      "src/components/shared/IconLabel.css",
      "src/components/shared/Message.css",
      "src/components/sidebar/Sidebar.css",
      "src/components/sidebar/SidebarFixedItem.css",
      "src/components/sidebar/SidebarItem.css",
      "src/components/sidebar/SidebarRuntimeItem.css",
    ],
  },
  {
    slug: "playwright-dashboard",
    files: ["index-BY2S1tHT.css"],
  },
  {
    slug: "playwright-html-report",
    files: ["report.css"],
  },
  {
    slug: "playwright-recorder",
    files: ["codeMirrorModule-DYBRYzYX.css", "index-4ZiSSCmn.css"],
  },
  {
    slug: "playwright-trace-viewer",
    files: [
      "codeMirrorModule.DYBRYzYX.css",
      "defaultSettingsView.CjdS-WJx.css",
      "index.CzXZzn5A.css",
      "uiMode.BZQ54Kgt.css",
      "xtermModule.DYP7pi_n.css",
    ],
  },
  {
    slug: "swagger-ui",
    files: ["swagger-ui.css"],
  },
];

function displayPath(path: string): string {
  return relative(REPOSITORY_ROOT, path).replaceAll("\\", "/");
}

async function renderTarget(target: AppTarget): Promise<{ output: string; markdown: string }> {
  const directory = resolve(CORPUS_ROOT, target.slug);
  const sources: CssSource[] = await Promise.all(target.files.map(async (file) => {
    const path = resolve(directory, file);
    return {
      label: file,
      location: displayPath(path),
      css: await readFile(path, "utf8"),
    };
  }));
  const measurements = measureCss(sources, target.slug);
  return {
    output: resolve(directory, `AUDIT-${target.slug}.md`),
    markdown: renderAudit(target.slug, sources, measurements),
  };
}

export async function generateAppAudits(slugs: readonly string[] = [], check = false): Promise<void> {
  const requested = new Set(slugs);
  const unknown = [...requested].filter((slug) => !APP_TARGETS.some((target) => target.slug === slug));
  if (unknown.length) throw new Error(`Unknown app corpus target: ${unknown.join(", ")}`);

  const selected = requested.size
    ? APP_TARGETS.filter((target) => requested.has(target.slug))
    : APP_TARGETS;

  for (const target of selected) {
    const { output, markdown } = await renderTarget(target);
    if (check) {
      const committed = await readFile(output, "utf8").catch(() => "");
      if (committed !== markdown) throw new Error(`${displayPath(output)} is stale; run npm run audit:apps`);
      console.log(`current ${displayPath(output)}`);
    } else {
      await writeFile(output, markdown);
      console.log(`wrote ${displayPath(output)}`);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  await generateAppAudits(args.filter((arg) => arg !== "--check"), check);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
