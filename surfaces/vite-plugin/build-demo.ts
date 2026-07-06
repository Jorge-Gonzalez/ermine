// surfaces/vite-plugin/build-demo.ts — builds the demo through the plugin
// (D3 step 3). Lives in this package so `vite` resolves from its isolated
// node_modules; the core package keeps zero deps.
// Run from the repo root: node --import tsx surfaces/vite-plugin/build-demo.ts

import { fileURLToPath } from "node:url";

import { build } from "vite";

const demoRoot = fileURLToPath(new URL("../../demo/", import.meta.url));

await build({
  configFile: fileURLToPath(new URL("../../demo/vite.config.ts", import.meta.url)),
  root: demoRoot, // authoritative — the bundled config's import.meta.dirname is unreliable
});
