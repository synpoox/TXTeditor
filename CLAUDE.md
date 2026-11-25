# TXTeditor

Tauri v2 desktop editor for Diablo II / D2R tab-separated `.txt`, `animdata.d2`, and D2R JSON string files. Canvas-rendered virtual grid. Plain ES modules, no framework. See `README.md` for features.

## Git: fork only

- `origin` = `synpoox/TXTeditor` (our fork). Default branch: `next`. Commit and push here only.
- Upstream is `yinyin333333/TXTeditor`. **Never push, open PRs, or add a remote to it.** PRs target `synpoox/TXTeditor` `next` (`gh pr create --repo synpoox/TXTeditor --base next`).
- Work on a branch, never directly on `next`.

## Commands

- `npm test` — all tests (`node --test tests/*.test.js`); run one: `node --test tests/<file>.test.js`
- `npm run dev` — dev server; `npm run build:web`, `npm run build:json-editor`
- `npm run perf:20k` / `perf:200k`, `npm run fixture:20k` — perf checks / fixtures
- `npm run tauri` — native build (`src-tauri/`)

## Where things live

- `src/app.js` — entry; wires controllers.
- `src/core/` — UI-free logic: table parse/model/selection/undo/search, file IO, i18n, game versions.
  - `lint-*.js` — Legacy Lint engine (rules per file type: item, cube, level, monster, treasure, misc; `lint-rule-registry.js`, `lint-runner.js`).
  - `lsp-*.js`, `vector-hover*.js` — Vector-LSP session/hover logic.
  - `platform/` — Tauri vs web bridge (config, file IO, LSP client, workers).
- `src/ui/` — `canvas-grid.js` + `grid/` (renderer, hover), `grid-*-policy.js`, `command-registry.js`, `*-policy.js` pure decision helpers.
  - `controllers/` — one controller per feature (document, diagnostics, search, lsp, dock, settings, shortcuts, json editor…).
- `src-tauri/src/` — Rust backend (native file read, LSP process).
- `scripts/` — dev server, builds, fixtures, perf, smoke tests.
- `tests/` — one `*.test.js` per feature/regression (`issue-NN-*` = bug regressions); `tests/helpers/` shared.

## Conventions

- Put decisions in pure `*-policy.js` / `core` modules and test them; controllers stay thin.
- User-visible strings go through `src/core/i18n.js` (`i18n-source-audit` test enforces it).
- Add a regression test for each bug fix.
