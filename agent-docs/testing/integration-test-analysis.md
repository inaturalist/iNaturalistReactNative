# Integration Test Architecture and Strategy Analysis

## Overview

The iNaturalistReactNative codebase separates tests into three tiers:
- **Unit tests** (`tests/unit/`) — Isolated components, hooks, helpers with mocked dependencies
- **Integration tests** (`tests/integration/`) — Screen-level tests exercising real Realm, real Zustand, real navigation context, with mocked API layer
- **E2E tests** (`e2e/`) — Detox tests on real devices/simulators

This document focuses on integration tests: their intention, patterns, quality, and recommended strategy adjustments.

---

## Intention of Integration Tests

Integration tests in this project validate **cross-system behavior** — verifying that screens work correctly when multiple subsystems (Realm database, Zustand stores, navigation, i18n, React Query) interact together. They sit between unit tests (isolated components) and E2E tests (full device).

### What integration tests specifically validate:

1. **Data persistence flows** — Observations written to Realm render correctly in lists, detail screens, and edit forms
2. **Upload lifecycle** — The complete upload flow from button press through API calls to success/error status display
3. **Authentication gating** — Signed-in vs signed-out users see different UI states; API calls are suppressed when signed out
4. **Offline behavior** — Network failures are handled gracefully; geolocation still works offline
5. **Navigation flows** — Multi-screen journeys (ObsList → ObsDetails → TaxonDetails → Explore) with real navigators
6. **Sync behavior** — Deleted observations are cleaned up, updates trigger re-fetches, pull-to-refresh works
7. **Localization** — Language switching persists across sign-in/sign-out cycles
8. **Error recovery** — Upload failures show correct error states, then reset to actionable states

### The core question they answer:
> "When a user performs this action on this screen, does the data flow correctly through Realm, Zustand, API mocks, and back to the UI?"

---

## Test Inventory

All integration tests are active and run in CI — there is no `broken/` directory and `jest.config.ts` excludes no test paths. For the authoritative current list, run:

```bash
find tests/integration -name '*.test.js'
```

The suite spans three areas — screen-level tests at the top level, multi-screen flows under `navigation/`, and cross-system hook tests under `sharedHooks/`. Representative examples (not exhaustive):

| File | What it validates |
|------|------------------|
| `MyObservations.test.js` | Upload lifecycle (batch/individual), error handling, sync, deletion cleanup |
| `MyObservationsSimple.test.js` | Basic header display when signed out with unsynced observations |
| `MyObservationsLocalization.test.js` | Language settings persistence across auth state changes |
| `Explore.test.js` | Observations/species view switching, pull-to-refresh, filter application |
| `ObsDetails.test.js` | Comment display, automatic update fetching, realm object updates |
| `ObsEditOnline.test.js` / `ObsEditOffline.test.js` | Location display, upload progress, offline geolocation, button states |
| `Notifications.test.js` | Notification display, remote photo fetching, realm persistence |
| `SavedMatch.test.js` | Map visibility by latitude, Learn More button by network state |
| `PhotoSharing.test.js` | File sharing integration (iOS/Android ShareMenu) |
| `PhotoDeletion.test.js` / `PhotoDeletionExisting.test.js` / `PhotoImport.test.js` | Photo evidence management flows |
| `SuggestionsWithSyncedObs.test.js` / `SuggestionsWithUnsyncedObs.test.js` | AI suggestion flows |
| `LanguageSettings.test.js` | System locale vs server preference, language switching API calls |
| `navigation/Explore.test.js` | Full navigation flow across 4+ screens with real navigators |
| `navigation/AddObsButton.test.js` | Long-press vs press behavior, navigation dispatch payloads |
| `navigation/AICamera.test.js`, `navigation/Suggestions.test.js`, `navigation/TaxonDetails.test.js`, `navigation/ObsEdit.test.js`, `navigation/MediaViewer.test.js`, `navigation/StandardCamera.test.js`, `navigation/SoundRecorder.test.js`, `navigation/PhotoLibrary.test.js`, `navigation/MyObservations.test.js` | Per-screen navigation flows |
| `sharedHooks/useCurrentUser.test.js` | Hook returns signed-in user from Realm |
| `sharedHooks/useTaxon.test.js` | Local/remote taxon fallback, outdated refresh, error handling |
| `sharedHooks/useObservationsUpdates.test.js` | Observation update polling behavior |
| `ObsDetailsSharedComponents/ActivityTab/ActivityHeaderContainer.test.js` | ID withdrawal/restoration API calls |

---

## Key Patterns

### Unique Realm Setup (Boilerplate Block)
Every integration test uses a standardized setup block that creates an isolated in-memory Realm:

```javascript
// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", () => mockRealmModelsIndex );
jest.mock( "providers/contexts", () => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: () => global.mockRealms[mockRealmIdentifier],
      useQuery: () => [],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP
```

### API Mocking Strategy
- `inaturalistjs` methods are globally mocked in `jest.setup.js` with empty responses
- Per-test, mock implementations examine request params to return contextual data:
```javascript
inatjs.observations.create.mockImplementation( async ( params ) => {
  const mockObs = mockUnsyncedObservations.find( o => o.uuid === params.observation.uuid );
  return makeResponse( [{ id: faker.number.int(), uuid: mockObs.uuid }] );
} );
```

### Rendering Approaches
- `renderAppWithComponent(<Component />)` — Wraps in full app context (providers, navigation, query client)
- `renderApp()` — Renders the entire App (used in navigation tests with `jest.unmock("@react-navigation/native")`)
- `renderAppWithObservations(obs, realmId)` — Writes observations to Realm before rendering

### Auth Helpers
- `signIn(user, { realm })` — Sets JWT/tokens, creates User in Realm, mocks OAuth endpoints via nock
- `signOut({ realm })` — Clears tokens, deletes all Realm objects, resets i18next

### Animation/Timer Handling
- `global.withAnimatedTimeTravelEnabled()` — Enables controlled animation stepping
- `global.timeTravel(ms)` — Advances animation frames (used in navigation tests)
- `jest.useFakeTimers()` / `jest.useRealTimers()` — Timer control

---

## Strategic Recommendations

### 1. Clarify the Unit vs Integration Boundary

The current distinction is fuzzy in places:
- `SavedMatch.test.js` and `MyObservationsSimple.test.js` test simple element visibility — these could be unit tests
- `sharedHooks/useCurrentUser.test.js` tests a single hook return value — this is closer to a unit test
- Meanwhile, some unit tests (e.g., `useSyncObservations.test.js`) test complex multi-system behavior

**Recommendation**: Define the boundary explicitly:
- **Unit test** = Tests a single component/hook/function with ALL external dependencies mocked (including Realm, navigation, Zustand). Fast, isolated, tests implementation.
- **Integration test** = Tests a screen-level component with real Realm, real Zustand, mocked API. Tests user-observable behavior across system boundaries.

### 2. Reduce Async Timing Fragility

Replace `sleep()` and custom timeout padding with deterministic patterns:
- Use `findBy*` queries (which internally wait) instead of `waitFor` + `getBy*`
- Mock timers explicitly with `jest.advanceTimersByTime()` instead of relying on real delays
- For upload progress tests, consider flushing promises explicitly rather than using `sleep(500)` in mock implementations

### 3. Extract Realm Setup into a Jest Preset or Custom Environment

The 15-line boilerplate block could be:
- A Jest `setupFilesAfterFramework` for integration tests with a separate Jest config
- A test utility that handles the mock registration:
```javascript
// Possible improvement
const { realm } = useIntegrationRealm(__filename);
```

### 4. Prefer Accessibility Queries Over TestIDs

Shift from `getByTestId("UploadIcon.start.${uuid}")` toward `getByRole`, `getByLabelText`, `getByText` where possible. This:
- Validates accessibility as a side effect
- Couples tests to user-observable behavior rather than implementation
- Aligns with React Native Testing Library's recommended query priority

### 5. Consider Adding Integration Test Categories

The current flat structure makes it hard to prioritize test maintenance. Consider organizing by criticality:
```
tests/integration/
  critical/          # Core flows: upload, sync, auth
  screens/           # Individual screen rendering
  navigation/        # Multi-screen flows
  hooks/             # Cross-system hook behavior
```

### 6. Add a Smoke Integration Test

One test that renders the full app, signs in, and verifies all four bottom tabs render — a fast sanity check that the app boots. The existing `navigation/Explore.test.js` partially serves this purpose but is too complex to be a reliable smoke test.

---

## How Unit and Integration Tests Complement Each Other

| Aspect | Unit Tests (`tests/unit/`) | Integration Tests (`tests/integration/`) |
|--------|----------------------|-----------------------------------|
| **Speed** | Fast (<1s each) | Slow (5-50s each, 50s timeout) |
| **Scope** | One component/function | Full screen + Realm + Zustand |
| **API** | Mocked or not called | Mocked with realistic responses |
| **Realm** | Global shared mock | Per-file unique in-memory instance |
| **Navigation** | Mocked (useRoute, useNavigation stubs) | Real navigators (`jest.unmock`) or mocked |
| **Catches** | Prop/state bugs, rendering logic, edge cases | Data flow bugs, auth gating, sync issues |
| **Maintenance** | Low (isolated, few dependencies) | High (many systems, fragile timing) |

The integration tests are most valuable when they test **boundary behaviors** — what happens when data crosses from API → Realm → component, or when auth state changes propagate through the app. Tests that only verify static rendering should be unit tests.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `tests/helpers/uniqueRealm.js` | Creates isolated Realm per test file |
| `tests/helpers/render.js` | Provider wrappers: `renderAppWithComponent`, `renderApp`, `renderHookInApp` |
| `tests/helpers/user.js` | `signIn`/`signOut` with JWT tokens and nock mocks |
| `tests/helpers/setStoreStateLayout.js` | Zustand layout state helper |
| `tests/jest.setup.js` | Global mocks, animation helpers, inaturalistjs defaults |
| `tests/jest.post-setup.js` | Zustand store auto-reset after each test |
| `tests/realm.setup.js` | Global Realm mock (overridden by uniqueRealm in integration) |
| `tests/factory.js` | Factory loader + `makeResponse` helper |
| `tests/factories/` | Factory definitions (`Local*` for Realm, `Remote*` for API) |
| `__mocks__/zustand.ts` | Zustand reset mechanism via `storeResetFns` |
| `jest.config.ts` | Root Jest config (`transformIgnorePatterns` for RN modules; no test paths are excluded) |
