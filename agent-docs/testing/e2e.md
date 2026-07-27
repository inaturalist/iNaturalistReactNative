# End-to-End Testing (Detox & Maestro)

The app has **two coexisting E2E frameworks**. They are easy to conflate — know which one you're touching.

| | Detox | Maestro |
|---|---|---|
| Purpose | Full build + automated regression (CI) | Lightweight flows, quick local checks |
| Runner | `MOCK_MODE=e2e npx detox test …` | `maestro test …` (or the Maestro MCP tools) |
| Flows live in | `e2e/` (Jest specs) | `e2e/maestro/{ios,android}/*.yaml` |
| App under test | Purpose-built binary | Installed app on a booted device/sim |

App id (both platforms): **`org.inaturalist.iNaturalistMobile`**.

## Detox

Canonical commands are the npm scripts (see `package.json`), e.g.:

```bash
npm run e2e:ios         # build + test iOS (ios.release)
npm run e2e:test:ios    # test without rebuilding
npm run e2e:android     # build + test Android (android.release)
```

Key facts:

- **`MOCK_MODE=e2e` is mandatory** on both build and test — it activates the `.e2e-mock` file substitutions across the codebase (e.g. `src/sharedHelpers/geolocationWrapper.e2e-mock`; the switch lives in `metro.config.js` / `src/appConstants/e2e.ts`). Without it the app hits real device services.
- Detox needs **real network + real credentials** in `.env`: `E2E_TEST_USERNAME` / `E2E_TEST_PASSWORD`.
- Tests run **serially** — `e2e/jest.config.js` sets `maxWorkers: 1`.
- iOS binaries: `ios/build/Build/Products/{Debug,Release}-iphonesimulator/iNaturalistReactNative.app`. Android APK paths are derived in `.detoxrc.js`.
- No custom artifacts path is configured in `.detoxrc.js`, so Detox uses its default location (`artifacts/` at the repo root), not `e2e/artifacts/`.
- Android keyboard helpers: dismiss with `adb shell input keyevent 111`; check visibility with `adb shell dumpsys input_method | grep mInputShown`.

## Maestro

Flow files are YAML in `e2e/maestro/ios/` and `e2e/maestro/android/`, camelCase filenames. Each begins with `appId: org.inaturalist.iNaturalistMobile`.

Conventions:

- Prefer **`id:` selectors** over text where possible.
- Guard the first-time-user experience so flows are re-runnable:
  ```yaml
  - runFlow:
      when:
        visible: Continue
      commands:
        - tapOn: Close
  ```
- Use `extendedWaitUntil` + `waitForAnimationToEnd` around screen transitions.
- Metro hot-reload picks up new `testID`s immediately — no rebuild needed for Maestro.

### testID naming convention

`testID` is inert metadata; adding one must **not** change component logic, handlers, or styles.

| Kind | Pattern | Example |
|------|---------|---------|
| Static element | `ComponentName.elementName` | `ObsEdit.saveButton` |
| Dynamic list item | `` `ComponentName.${item.id}` `` | `` `ObsPressable.${observation.uuid}` `` |
| Nested | `` `${parentTestID}.child` `` | `ObsDetails.taxon.photo` |

## Verifying changes in the running iOS app (simulator)

Hard-won gotchas when driving the live app (e.g. via the Maestro MCP tools) rather than running a test suite:

- **Tap by resource-id, never by coordinates.** Maestro points are device points but screenshots are pixels (~2.29× on an iPhone 17), so coordinates read off a screenshot tap the wrong element. Always inspect the view hierarchy and tap by `id`/`text`.
- **`back` is a no-op on iOS** (no hardware back button) — tap the on-screen back chevron id instead (e.g. `header-back-button` / `BackButton`).
- **Resetting in-memory state** (e.g. React Query cache) = `stop_app` + `launch_app`. Realm and MMKV survive relaunch; JS memory does not.
- **`console.log` no longer reaches Metro stdout** (Metro 0.83+ moved JS logs to React Native DevTools). Use the app's file logger instead:
  ```javascript
  import { log } from "react-native-logs.config";
  const logger = log.extend( "MY_TAG" );
  ```
  Output is written under `<app-data-container>/Documents/logs/inaturalist-rn-log.<date>.txt` (`logFileDirectory` in `react-native-logs.config.ts`). Find the container with `xcrun simctl get_app_container booted org.inaturalist.iNaturalistMobile data`.
- Screenshots: `xcrun simctl io booted screenshot <path>.png`.

## Related

- Unit / component / integration testing: `test-core.md`, `test-components.md`, `integration-test-analysis.md` in this directory.
