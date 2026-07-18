# Manual extension-host smoke test

The extension-host path is manual on purpose: D4 does not add the VS Code test
harness or download a second VS Code build.

## Data Contract

The extension ships generated JSON caches for completions and hovers. These files
are not a second source of truth. They are derived from the registry and generated
guide prose by:

```sh
npm run vscode
```

Every update must pass:

```sh
npm run vscode:check
```

That check compares the committed JSON byte-for-byte against freshly rendered
data. If the registry or guide changes, the check fails until the cache is
regenerated.

The `Ermine: Explain Class Paragraph` command is different: it is bundled with
the core paragraph explainer, so lint diagnostics, emitted CSS, and graph data
come from the same `parseWord()`, `lint()`, and `emit()` implementation used by
the rest of Ermine.

1. From the repository root, regenerate the editor data:

   ```sh
   npm run vscode
   ```

   Expected: both generated JSON files report `is current` (or are updated on
   the first run).

2. Install the extension-local API types and compile the extension:

   ```sh
   npm --prefix surfaces/vscode install
   npm --prefix surfaces/vscode run build
   ```

   Expected: TypeScript exits without diagnostics and writes
   `surfaces/vscode/dist/`.

3. Launch an Extension Development Host with the committed fixture:

   ```sh
   code --extensionDevelopmentPath="$PWD/surfaces/vscode" "$PWD/surfaces/vscode/manual-fixture"
   ```

4. In `index.html`, put the cursor immediately after `gap-c` and invoke
   completion (`Ctrl+Space`, or `Cmd+Space` where that shortcut is available).

   Expected screenshot-in-words: the completion popup includes
   `gap-comfortable`; its right-hand detail reads `Ermine · density`; selecting
   it replaces `gap-c`, and its documentation shows “space between children
   (the default for rhythm)” plus `src/ERMINE-SPEC.md §2.1 — density`.

5. Hover `horizontal` in the same attribute.

   Expected screenshot-in-words: a hover card headed `horizontal`, followed by
   “a row”, `Axis: structure`, and
   `Reference: src/ERMINE-SPEC.md §2.1 — structure`.

6. Put the cursor inside the same `class` attribute and run
   `Ermine: Explain Class Paragraph`.

   Expected screenshot-in-words: a Markdown document opens beside the editor. It
   shows the source paragraph, normalized paragraph, word table, emitted CSS,
   diagnostics note, and a simple paragraph -> word -> axis graph.

7. Move the same text outside the `class` string and invoke completion again.

   Expected: Ermine offers no completion and no hover. Literal `className`
   strings behave like `class`; interpolated template strings remain invisible,
   matching D3's conservative boundary.
