import { mkdir } from "node:fs/promises";

import { build } from "esbuild";

await mkdir(new URL("./dist/", import.meta.url), { recursive: true });

await build({
  entryPoints: [new URL("./extension.ts", import.meta.url).pathname],
  outfile: new URL("./dist/extension.js", import.meta.url).pathname,
  bundle: true,
  external: ["vscode"],
  format: "esm",
  platform: "node",
  target: "node22",
  sourcemap: false,
  logLevel: "info",
});
