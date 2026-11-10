---
paths:
  - "**/tests/**"
  - "**/e2e/**"
---

# Tests

Realm and Zustand setup, mock taxa and a worked example: `agent-docs/testing/test-core.md`.
Detox and Maestro: `agent-docs/testing/e2e.md`.

## What to test

- Assert on user-visible behavior, not implementation. Prefer a few meaningful cases over
  coverage: a test that restates the implementation fails on every refactor and catches
  nothing. Group one public method or behavior per `describe`, and hold to one or two
  comments per file.

## How to write it

- Pair every query with a semantic RNTL matcher — `toBeVisible()`, `toBeDisabled()`,
  `toBeChecked()`, `toBeExpanded()`. Never `toBeTruthy()` on an element: `getBy*`/`findBy*`
  already throw when nothing matches, so it asserts nothing. Use `queryBy*` only for
  non-existence. `toBeTruthy()` stays correct for plain values in helper and hook tests.
- Pass factory overrides as the **second argument** — `factory( "RemoteTaxon", { id: 745 } )`.
  Spreading the result skips the factory's `afterBuild` and derived fields. `Local*` factories
  persist to Realm; `Remote*` factories produce API-shaped data.
- `beforeAll( async () => { await initI18next(); } );` in any test that renders translated UI.
- `const actor = userEvent.setup()` for presses and taps. `fireEvent` only for `changeText`,
  focus, and timing-controlled cases such as debounce with fake timers.
- Mock API services and third-party libraries. Do not mock React features, your own models or
  helpers, or child components.
