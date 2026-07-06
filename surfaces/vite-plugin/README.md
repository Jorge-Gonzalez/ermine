# @ermine/vite-plugin

JIT Ermine emission for Vite: scans your markup for grammar words and writes
ONLY the authored subset as one stylesheet — the class-string surface in a real
toolchain. Judge-and-emit only; it never mutates the registry.

## Install

The plugin lives in this repository and keeps its one dev dependency (`vite`)
in its own package, so the core stays at zero runtime dependencies:

```sh
npm --prefix surfaces/vite-plugin install
```

## Configure

```ts
// vite.config.ts
import { ermine } from "../surfaces/vite-plugin/index.ts";

export default {
  plugins: [
    ermine({
      content: ["index.html"],          // files to scan, relative to the Vite root
      outFile: "ermine.generated.css",  // default; written relative to the root
    }),
  ],
};
```

Link the output from your page (`<link rel="stylesheet" href="ermine.generated.css">`)
alongside a theme that defines the scale variables. In dev, the plugin watches
the `content` files and re-emits on change with a full reload; in build, it
writes the file at `buildStart`.

The demo builds through the plugin via `demo/vite.config.ts`:

```sh
node --import tsx surfaces/vite-plugin/build-demo.ts
```

If the repo root uses pnpm, keep vite configs free of bare `vite` imports
(see the note in `demo/vite.config.ts`) — Vite bundles configs into the root's
`node_modules/.vite-temp`, from where the plugin package's isolated
`node_modules` is not reachable.

## Scanning limitation (stated, by design)

The scanner is conservative: it reads literal `class="…"` / `className="…"` /
`` className={`…`} `` attribute values and splits on whitespace. Dynamically
constructed class names (interpolated template literals, `clsx(...)`,
concatenation) are **invisible** — a false-NEGATIVE risk: a word only your
runtime composes will be missing from the emitted CSS. Put such words in a
literal attribute somewhere, or accept the gap.

Candidates resolve through the real parser (`parseWord`); words that resolve to
no axis are **silently ignored** — they belong to other systems on the page and
never produce output or noise.

## Warning behavior

Each class attribute is one element's word set (facet compounds like
`horizontal inline` depend on that). Resolved-but-malformed compositions —
`horizontal vertical` in one attribute — surface as build **warnings** carrying
the linter's reason text, never build failures: the page author may be
mid-edit. Entailment rules (P8/P8b) are not warned on: they assert runtime DOM
truths a static scan cannot see (same filter as the typed surface's dev gate —
`surfaces/typed/ENFORCEMENT.md`).

## Future work

A PostCSS variant of the same scan-and-emit pipeline (not yet needed by any
consumer).
