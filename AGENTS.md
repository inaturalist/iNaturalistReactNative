# AGENTS.md

This file provides guidance for AI coding agents working with code in this repository.

## Project Overview

iNaturalistReactNative is the official iNaturalist mobile client written in React Native, replacing the legacy iOS and Android native apps. It's a community science platform where users photograph organisms, upload observations, and get AI-powered species identifications.

## Development Commands

### Running the App
```bash
# Start Metro bundler (with cache reset recommended to avoid build issues)
npm start -- --reset-cache

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run release builds
npm run ios:release
npm run android:release
```

### Testing
```bash
# Run all tests (integration + unit)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run individual test by name
npx jest

# E2E tests (requires Detox setup)
npm run e2e              # Build and test both iOS + Android (use e2e:ios for iOS-only)
npm run e2e:android      # Build and test Android
npm run e2e:test         # Run tests without rebuilding
```

### Linting
```bash
# Run all linters (eslint, flow, rubocop)
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run individual linters
npm run lint:eslint
npm run lint:flow       # Flow type checking
npm run lint:rubocop    # Ruby linting (fastlane)
npm run lint:tsc        # TypeScript checking
```

**Note on `lint:tsc`:** The repo has a large pre-existing TypeScript error baseline (over 1,000 errors), so a clean run is not expected. The standard is to add no new errors in files you touch — verify by filtering the tsc output for your filenames and comparing against the pre-change state. TS7016 implicit-`any` errors from importing untyped `.js` modules are part of the accepted baseline; do not add `@ts-ignore` comments for them.

### Translations
```bash
# Build translation JSON from Fluent files
npm run translate

# Prepare fastlane metadata for app stores
npm run prepare-fastlane-metadata
```

### Icons & Assets
```bash
# Rebuild icon font from SVG files in src/images/icons/
npm run icons

# Add example AI model files
npm run add-example-model
```

### Cleanup
```bash
# Clean project (interactive menu for caches, builds, pods, node_modules)
npx react-native clean-project

# Full clean and restart
npm run clean-start
```

## Code Architecture

### Navigation Structure

The app uses React Navigation 7 with `@react-navigation/native-stack` and `@react-navigation/bottom-tabs` in a nested hierarchy:

1. **RootStackNavigator** (NativeStack, top level) - `src/navigation/RootStackNavigator.tsx`
   - **OnboardingStackNavigator** - Shown conditionally when `!onboardingShown` (modal presentation)
   - **BottomTabNavigator** - Shown when `onboardingShown`. Contains four tabs:
     - `MenuTab` → TabStackNavigator (initialRouteName: "Menu")
     - `ExploreTab` → TabStackNavigator (initialRouteName: "RootExplore")
     - `ObservationsTab` → TabStackNavigator (initialRouteName: "ObsList")
     - `NotificationsTab` → TabStackNavigator (initialRouteName: "Notifications")
   - **NoBottomTabStackNavigator** - Camera, PhotoLibrary, GroupPhotos, SoundRecorder, plus SharedStackScreens
   - **LoginStackNavigator** - Login, SignUp, ForgotPassword, etc.

Key design patterns:
- All four bottom tabs share the **same `TabStackNavigator` component** (`src/navigation/StackNavigators/TabStackNavigator.tsx`) with different `initialRouteName` values, giving every tab access to the full screen catalog.
- **`SharedStackScreens`** (`src/navigation/StackNavigators/SharedStackScreens.tsx`) is a `Stack.Group` rendered in both `TabStackNavigator` and `NoBottomTabStackNavigator`, so screens like ObsEdit, TaxonDetails, Match, and Suggestions work from either context.
- The `NavigationContainer` lives in `src/navigation/OfflineNavigationGuard.tsx` with a global `navigationRef` from `src/navigation/navigationUtils.ts`.
- Deep linking is handled manually via React Native's `Linking` API in `src/components/hooks/useLinking.ts` (no React Navigation `linking` config).

To add a new screen, place it in the appropriate navigator: `TabStackNavigator` if it needs bottom tabs visible, `NoBottomTabStackNavigator` if not, or `SharedStackScreens` if it needs to be reachable from both contexts.

**Details:** the full navigator hierarchy, screen-param typing, and deep-linking are in `knowledge-base/architecture/navigation-patterns.md`.

### State Management

The app uses a hybrid state management approach:

- **Zustand stores** (`src/stores/`) - Global app state slices. Key examples include:
  - `createObservationFlowSlice` - Observation creation/editing flow
  - `createUploadObservationsSlice` - Upload queue and status
  - `createSyncObservationsSlice` - Syncing observations from server
  - `createLayoutSlice` - UI layout state (sidebar, etc.)
  - `createExploreSlice` / `createRootExploreSlice` - Explore screen filters and state
  - `createMyObsSlice` - My Observations filters
  - `createFeatureFlagSlice` - Feature flag state
  - See `src/stores/` for the complete list of slices.

- **React Query** - Server state management and API caching (uses `@tanstack/react-query`)

- **React Context** - Feature-specific state:
  - `ExploreContext` - Complex explore screen state
  - `RealmContext` - Realm database access

**Details:** store architecture, MMKV persistence, and the Realm/Zustand division of responsibilities are in `knowledge-base/architecture/realm-and-zustand.md`.

### Data Persistence

- **Realm Database** (`src/realmModels/`) - Primary local data store
  - Key models include `Observation`, `Photo`, `ObservationPhoto`, `Sound`, `ObservationSound`, `Taxon`, `TaxonPhoto`, `User`, `Identification`, `Comment`, `Vote`, `Flag`, `Application`, and `QueueItem` (see `src/realmModels/` for the full set)
  - Bump `schemaVersion` in `realmModels/index.ts` whenever the schema changes, and add a migration — see that file for the current version
  - Migration logic for schema updates is in `realmModels/index.ts`
  - All observations are stored locally first, then uploaded asynchronously

- **MMKV** - Fast key-value storage via `zustandStorage` for Zustand persistence

**Details:** working with Realm objects in the React layer (live-object gotchas, the missing Realm→API converter, `mapTo` field-name debt) is documented in `knowledge-base/architecture/realm-and-zustand.md`.

### API Layer

API calls are organized in `src/api/`:
- Uses `inaturalistjs` library as the primary API client
- Wrapper functions in `src/api/*.{js,ts}` handle error logging and data transformation (the layer is mid-migration to TypeScript)
- API responses are transformed to match local Realm schema
- Base API URL configured via `.env` file (`API_URL`)

**Details:** the wrapper-only rule and the `useAuthenticatedQuery`/`useAuthenticatedMutation` base hooks are covered in `knowledge-base/architecture/api-layer.md`.

### Upload System

The upload system (`src/uploaders/`) handles offline-first observation uploads:
- `observationUploader.ts` - Uploads observation data to API
- `mediaUploader.ts` - Uploads photos/sounds to S3, then associates with observations
- Upload queue stored in Realm (`QueueItem` model)
- Zustand slice `createUploadObservationsSlice` manages upload state and progress
- Background processing continues even when app is backgrounded

**Details:** the four-step pipeline, error-recovery table, and timeout/keep-awake rules are in `knowledge-base/architecture/upload-system.md`.

### AI Camera & Computer Vision

The AI Camera uses on-device computer vision models:
- Vision Camera plugin: `vision-camera-plugin-inatvision`
- Model files: `.tflite` (Android) and `.mlmodel` (iOS) for species prediction
- Taxonomy files: `taxonomy.csv` (Android) / `taxonomy.json` (iOS)
- Geomodel files for location-based filtering
- Model file paths configured in `.env` via `ANDROID_MODEL_FILE_NAME`, `IOS_MODEL_FILE_NAME`, etc.
- Models not in repo - downloaded via `npm run add-example-model` or from releases in `inaturalist/model-files` repo

### Internationalization (i18n)

Translation system using Fluent and i18next:
- Source strings: `src/i18n/strings.ftl` (US English only)
- Translations: `src/i18n/l10n/` (pulled from Crowdin, do not edit directly)
- Use `useTranslation()` hook in components: `const { t } = useTranslation();`
- For complex interpolation with components, use `<Trans>` component
- Run `npm run translate` after modifying `strings.ftl` to validate and build JSON
- Fluent syntax: https://projectfluent.org/fluent/guide/

**Key translation guidelines:**
- Labels should match content (max 100 chars)
- Change label when content changes (don't reuse keys for different meanings)
- Add comments for context unless self-explanatory
- Use double-dashes for disambiguation (e.g., `Unknown--rank`, `Unknown--taxon`)
- Avoid variables when possible - create separate strings for each case
- Pluralize with selectors: `{ $count } { $count -> [one] observation *[other] observations }`

**Details:** `knowledge-base/conventions/i18n-conventions.md`.

### Styling

- **Nativewind** (Tailwind CSS for React Native) - Primary styling system
- Uses Tailwind utility classes via `className` prop
- Custom Tailwind config: `tailwind.config.js`
- Some legacy components use StyleSheet.create()
- **React Native Paper** - Material Design components for some UI elements

**Details:** component structure, styling, and accessibility conventions are in `knowledge-base/conventions/component-conventions.md`.

### Module Aliases

Babel module resolver provides import aliases (defined in `babel.config.js`):
```javascript
import Component from "components/MyComponent";  // instead of ../../../components/MyComponent
import { useObservation } from "sharedHooks";
import { formatDate } from "sharedHelpers";
import { Observation } from "realmModels";
```

Available aliases: `api`, `appConstants`, `components`, `dictionaries`, `i18n`, `images`, `navigation`, `providers`, `realmModels`, `sharedHelpers`, `sharedHooks`, `stores`, `styles`, `tests`, `uploaders`

**Details:** full alias table with example imports in `knowledge-base/conventions/import-aliases.md`.

### Key Directories

- `src/components/` - React components organized by feature (Camera, Explore, MyObservations, etc.)
- `src/sharedHooks/` - Reusable React hooks across features
- `src/sharedHelpers/` - Pure utility functions
- `src/navigation/` - React Navigation configuration and navigators
- `src/realmModels/` - Realm database schemas and model logic
- `src/api/` - API wrapper functions
- `src/uploaders/` - Upload queue and processing logic
- `tests/unit/` - Unit tests for individual modules
- `tests/integration/` - Integration tests with mocked APIs and Realm
- `e2e/` - End-to-end Detox tests

## Testing Guidelines

- Jest + React Native Testing Library for unit/integration tests; `factoria` + `@faker-js/faker` for mock data (`Local*` = locally persisted, `Remote*` = API/external)
- Initialize i18next in test files: `beforeAll( async () => { await initI18next(); } );`
- Test user behavior, not implementation details
- E2E tests require real iNaturalist credentials in `.env` (`E2E_TEST_USERNAME`, `E2E_TEST_PASSWORD`)
- **Details:** unit/component/integration conventions — factory overrides, `userEvent` vs `fireEvent`, mocking, running a single test — in `knowledge-base/testing/` (start with `test-core.md`); end-to-end (Detox + Maestro) in `knowledge-base/testing/e2e.md`

## Code Style & Conventions

- ESLint config extends Airbnb with custom rules (`.eslintrc.js`)
- Double quotes for strings
- Spaces inside parentheses: `if ( condition ) { }`
- Max line length: 100 characters
- No console statements in production (removed via Babel plugin)
- Arrow functions for React components: `const MyComponent = () => { };`
- i18next string literal checking enforced - use `t()` for all user-facing text
- Prefer TypeScript for new files (partial adoption, not required)
- Husky pre-commit hook (`.husky/pre-commit`) runs `lint-staged` (eslint `--fix` on staged files), regenerates i18n translations, and runs a GitGuardian (`ggshield`) secrets scan

**Details:** TypeScript conventions (interface-vs-type, Flow coexistence) in `knowledge-base/conventions/typescript.md`.

## Authentication & OAuth

- OAuth flow uses `inaturalistjs` library
- JWT tokens stored in react-native-sensitive-info (secure storage)
- Support for Apple Sign-In, Google Sign-In, and email/password
- User state managed in Zustand and persisted to MMKV
- JWT included in API requests via custom headers

## Logging & Error Handling

- Custom logger: `react-native-logs.config.ts`
- Sentry-style error tracking with Grafana integration
- **Sentinel files** (`sharedHelpers/sentinelFiles.ts`) - Debug difficult hardware issues:
  - Created at flow start, deleted on success
  - Log stages during flow (e.g., camera permissions, save photo, location fetch)
  - Orphaned files logged as errors to Grafana on next app launch
  - Example: Camera flow tracks freezing, location stalls, photo save failures

## Environment Configuration

- `.env` files contain secrets and config (not in repo)
  - `.env` - Production
  - `.env.staging` - Staging environment
  - `env.example` - Template with all required variables
- Key variables: `API_URL`, OAuth client IDs, Firebase configs, model file names
- Platform-specific configs:
  - iOS: `GoogleService-Info.plist`
  - Android: `google-services.json`, `keystore.properties`

## Git Workflow

- Issues are tracked in Linear with `MOB-` identifiers
- Branch naming: `mob-{number}-{short-description}` (e.g., `mob-123-fix-upload-crash`)
- Commit messages: Imperative mood, describe user impact
- Include `Closes MOB-123` in the commit body to auto-close issues
- Husky pre-commit hook runs linters automatically
- Main branch: `main`

## Release Process

Managed via fastlane (requires additional setup):
```bash
bundle exec fastlane tag      # Create tag, bump build number, prompt for changelog
bundle exec fastlane release  # Build and create GitHub release
bundle exec fastlane internal # Upload to internal testing (TestFlight/Play Store)
bundle exec fastlane beta     # Promote to public beta testing
bundle exec fastlane prod     # Prepare App Store release (manual submission required)
```

## Accessibility

- eslint-plugin-react-native-a11y enforces accessibility rules
- Use `accessibilityLabel`, `accessibilityHint`, `accessibilityRole` props
- Hints written in third person singular ending with period: "Opens the camera."
- Test with VoiceOver (iOS) and TalkBack (Android)

## Knowledge Base (`knowledge-base/`)

In-depth architecture and convention docs for both humans and AI agents. Read the relevant doc before exploring or modifying a subsystem — it captures patterns that aren't obvious from the code alone.

- `architecture/` — `upload-system.md`, `navigation-patterns.md`, `api-layer.md`, `realm-and-zustand.md` (includes working with Realm objects in the React layer)
- `conventions/` — `component-conventions.md`, `i18n-conventions.md`, `import-aliases.md`, `typescript.md`
- `testing/` — `test-core.md`, `test-components.md`, `test-integrations.md`, `integration-test-analysis.md`, `e2e.md` (Detox + Maestro + iOS verification)

## Common Pitfalls

1. **Build issues:** Run `npm start -- --reset-cache` or `npx react-native clean-project`
2. **Realm schema changes:** Always increment `schemaVersion` and provide migration
3. **Translation missing:** Run `npm run translate` after updating `strings.ftl`
4. **Import paths:** Use module aliases, not relative paths (enforced by `module-resolver/use-alias` rule)
5. **Icon changes:** Run `npm run icons` and rebuild (can't hot reload assets)
6. **M-series Mac Android builds:** May need specific NDK version (see `android/build.gradle`)
7. **i18next in tests:** Must initialize with `await initI18next()` in `beforeAll`
8. **Detox simulator:** Create simulator matching `.detoxrc.js` config in Xcode
