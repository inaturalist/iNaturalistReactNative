# AGENTS.md

Guidance for AI coding agents working in this repository. Tool-agnostic on purpose — Claude
Code imports this file from `.claude/CLAUDE.md`, and Codex/Cursor users read it directly.

## The app

iNaturalist's official mobile client in React Native, replacing the legacy native iOS and
Android apps. Community science: people photograph organisms, upload observations, and get
AI-assisted species identifications. The audience is global and skews toward low-end Android
devices, often out of signal in the field. Every observation is written to Realm locally and
uploaded later, so a feature that only works online is a broken feature.

## Commands you cannot guess

- `npm start -- --reset-cache` — Metro caches the alias map and the compiled Tailwind CSS.
  After touching `babel.config.js`, `tailwind.config.js`, or adding a file, a plain
  `npm start` serves a stale bundle and the failure looks like a code bug.
- One test by name (paths relative to repo root):
  `node 'node_modules/.bin/jest' 'PATH_TO_FILE' -c './jest.config.ts' -t 'TEST NAME'`.
  Bare `npx jest` misses `jest.config.ts` and its setup.
- `npx jest --findRelatedTests <files>` — just the tests covering those files.
- `npm test` runs integration then unit; `npm run test:unit` / `test:integration` split them.
- `npm run lint` = ESLint + Flow + RuboCop (RuboCop covers the Ruby in `fastlane/`).
- `npm run lint:tsc` has a pre-existing baseline of 1,000+ errors, so a clean run is not the
  goal. The standard is **no new errors in the files you touch**: filter the output by your
  filenames and compare against the pre-change state. TS7016 implicit-`any` from importing
  untyped `.js` modules is part of the baseline — do not add `@ts-ignore` for it.
- `npm run translate` after editing `src/i18n/strings.ftl`. It validates Fluent syntax and
  builds the JSON; broken syntax fails the pre-commit hook, not your test run.
- `npm run icons` after changing `src/images/icons/`, then rebuild natively. Icon fonts are
  assets and do not hot reload.
- `npm run add-example-model` — the computer-vision model files are not in the repo, so the
  AI camera silently does nothing until you fetch them.
- `npx react-native clean-project` for build failures a cache reset does not fix.

## Hard rules

Each of these has cost real debugging time. They stay here, rather than only in the rule that
owns them, because the mistake is made where that rule does not load — a live Realm object is
consumed in a component, not in `src/realmModels/`.

- **Never pass a live Realm object between components.** It mutates under React without a
  re-render, and any access after its row is deleted throws. Convert to a plain object first.
- **Every API call goes through a wrapper in `src/api/`.** Calling `inatjs` directly skips the
  error logging and the response-to-Realm transformation the rest of the app assumes.
- **Never silence a type error you cannot honestly fix.** `as unknown as X`, non-null `!`, and
  widening to `object`/`Function` quiet `tsc` while shipping the mismatch. Leave a legitimate
  mismatch reported; it is an honest TODO and reviewers diff the baseline.
- **State that must survive a tab switch or a trip to the camera belongs in a Zustand slice**,
  not React context. Switching bottom tabs unmounts and resets the tab's whole tree.
- ESLint (Airbnb plus custom rules, `.eslintrc.js`) is the style authority — double quotes,
  spaces inside parens `if ( condition ) { }`, 100-column lines, module aliases instead of
  relative paths, no `console`. Run `npm run lint:fix` rather than hand-formatting.

## Repo etiquette

- Issues live in Linear with `MOB-` identifiers. Branch as `mob-{number}-{short-description}`.
- Commit messages are imperative and describe user impact. `Closes MOB-123` in the body
  auto-closes the issue.
- Main branch is `main`.
- `.husky/pre-commit` runs a `ggshield` secret scan, `lint-staged` (ESLint `--fix`) plus Flow,
  and `npm run translate` — then stages the regenerated `src/i18n/l10n/` files. Expect your
  commit to gain files.

## Where else to look

Path-scoped rules in `.claude/rules/` load automatically when a matching file is read, so you
usually do not need to open them by hand:

| Rule | Applies to |
| --- | --- |
| `realm.md` | `src/realmModels/`, `src/stores/` |
| `api.md` | `src/api/`, `src/sharedHooks/`, `src/uploaders/` |
| `i18n.md` | `src/i18n/strings.ftl`, components with user-facing text |
| `nativewind.md` | `src/components/`, `src/navigation/`, `src/appConstants/` |
| `accessibility.md` | `src/components/` |
| `performance.md` | `src/components/`, `src/api/`, `src/realmModels/` |
| `tests.md` | `tests/`, `e2e/` |

Reference docs in `agent-docs/` — read the relevant one *before* changing a subsystem:

| Doc | What it is for |
| --- | --- |
| `architecture/realm-and-zustand.md` | Realm/Zustand division of labor, migrations, live-object and `mapTo` gotchas, reducer-in-Zustand |
| `architecture/upload-system.md` | The four-step upload pipeline and its error-recovery table |
| `architecture/media-filesystem-lifecycle.md` | Where photos and sounds live, when they are copied, and what deletes them |
| `architecture/api-layer.md` | The wrapper pattern, query-key conventions, retry and field filtering |
| `architecture/navigation-patterns.md` | Navigator hierarchy, where a new screen goes, deep linking |
| `conventions/nativewind-v4.md` | The six ways NativeWind v4 silently drops your styles |
| `conventions/typescript.md` | Flow/TS coexistence, honest types, `interface` vs `type` |
| `conventions/i18n-conventions.md` | Fluent syntax, plurals, key naming |
| `conventions/component-conventions.md` | Component structure and accessibility conventions |
| `testing/test-core.md` | Realm/Zustand test setup, mock taxa, worked example |
| `testing/e2e.md` | Detox and Maestro, `testID` naming, verifying on a simulator |
| `testing/scroll-benchmarking.md` | Measuring list scroll performance on a physical Android device |
