// C4 page provenance: config for generating the real Playwright HTML report
// that original.html snapshots. The output folder is injected by
// make-original.ts so nothing lands outside its temp dir.
import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: ".",
  reporter: [["html", { outputFolder: process.env.C4_REPORT_DIR ?? "html-report", open: "never" }]],
  use: { launchOptions: { args: ["--no-sandbox"] } },
});
