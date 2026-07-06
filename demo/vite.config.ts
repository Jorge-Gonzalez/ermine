// demo/vite.config.ts — D3: the demo built through the Ermine Vite plugin.
// The committed no-toolchain path (demo/build.ts → demo/ermine.css) remains;
// this config is the toolchain path, writing demo/ermine.generated.css from
// the same markup. Run via: node --import tsx surfaces/vite-plugin/build-demo.ts
//
// Deliberately no `import { defineConfig } from "vite"`: the repo root uses
// pnpm, and Vite bundles this file into node_modules/.vite-temp, from where a
// bare `vite` specifier cannot resolve back to the plugin package's isolated
// node_modules. A plain config object needs no vite import at runtime (the
// plugin's own vite import is type-only, erased at bundle time).

import { ermine } from "../surfaces/vite-plugin/index.ts";

export default {
  root: import.meta.dirname,
  plugins: [ermine({ content: ["index.html"] })],
  build: { outDir: "dist", emptyOutDir: true },
};
