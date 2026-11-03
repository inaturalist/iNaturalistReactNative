# Scroll Performance Benchmarking (Android)

How to measure scrolling performance of a list screen, such as My Observations' small grid, in a way that reflects what users feel. It's the procedure behind the MOB-1748 spike ([ADR: Small Grid Performance Investigation](https://linear.app/inaturalist/document/adr-small-grid-performance-investigation-05cf18dfca66)) and the MOB-1900 fix's acceptance numbers.

Nothing here ships in the app. The sampler below is pasted in for a measurement and deleted afterwards.

## What to measure

- **JS FPS while flinging natively.** The number to report is **p10** (the 10th-percentile one-second sample), not the mean. Stalls are what users notice, and a mean hides them.
- **UI jank** from `dumpsys gfxinfo` (janky frames, 90th/99th percentile frame times). This covers the UI thread and image pipeline, which JS FPS doesn't see.
- **Rows reached** in a fixed number of flings. A list that stalls falls behind, so it reaches fewer rows.

Reference results (Galaxy S9, release build, 10k-observation staging account, small grid, 90 flings):

| | JS FPS mean / p10 / min | Rows reached |
|---|---|---|
| `useObject` in tiles (before MOB-1900) | 35.4 / 1.9 / 0.8 | 468 |
| `useListItemObservation` (MOB-1900), median of three runs | 33.0 / 19.7 / 13.6 | 1,474–1,954 |

Results get worse as Realm holds more observations: in MOB-1900's three back-to-back runs, p10 fell from 25.6 to 18.0 as Realm grew from 74 to about 1,900 observations. Record how many observations are in Realm (or start from fresh local data) when comparing runs.

## Traps

- **Release builds on physical hardware only.** The iOS Simulator runs JS on the Mac's CPU and inverts results, and emulated-GPU debug builds produce symptoms of their own (such as cells flashing).
- **Use native flings (`adb shell input swipe`), not FlashList's `useBenchmark`.** `useBenchmark` scrolls with JS `scrollToOffset` jumps, which grow FlashList's pool of mounted cells in a way native scrolling doesn't. A single `useBenchmark` pass over a short list also lasts about half a second, so its average is noise.
- **The Hermes sampling profiler shows native work on the JS thread as idle `[root]`.** That includes Realm and React Native's C++. To see where JS-thread time goes, use a system trace and `simpleperf` (see "Profiling").
- **Thermals.** Back-to-back runs heat the device. Let it cool between runs you intend to compare, and run the comparison in an interleaved order (A, B, A, B) rather than all of A then all of B.
- **One run isn't a result.** Run each configuration at least three times and report the median p10.

## Setup

1. **A release build that installs over your debug build.** Without the release keystore, temporarily sign release builds with the debug key in `android/app/build.gradle`, under `buildTypes { release { … } }`:
   ```groovy
   signingConfig signingConfigs.debug
   ```
   Then build and install with `ANDROID_HOME` set:
   ```bash
   ANDROID_HOME=$HOME/Library/Android/sdk npm run android:release -- --no-packager
   ```
   Because both builds are signed with the debug key, this keeps your login.
2. **An account with enough observations** for the screen to keep paging, such as the 10k-observation staging account (Developer screen → environment).
3. **No startup dialogs.** A build without a computer vision model shows a "No model found" alert on every cold start, which interrupts the run. `add-example-model` installs the model for debug builds only by default, so install it for release before building:
   ```bash
   npm run add-example-model -- --androidFlavor release
   ```
4. **The screen under test is showing** before the run starts. The run cold-starts the app, so it opens on whatever screen and layout were last used.
5. **The sampler is pasted in** (next section).

## The sampler

Paste this hook into the screen under test, and call it once per render with the current row count. For example, in `MyObservationsGroupedByIconicTaxaView`, after `rows` is computed:

```ts
useFpsSampler( "smallGrid", rows.length );
```

In `MyObservationsSimple` (grid and list), use `useFpsSampler( layout, dataFilledWithEmptyBoxes.length );`.

```ts
// TEMPORARY benchmark sampler: see agent-docs/testing/scroll-benchmarking.md. Don't commit.
/* global requestAnimationFrame, cancelAnimationFrame */
import * as RNFS from "@dr.pogodin/react-native-fs";
import { useEffect, useRef } from "react";

// Android only: adb can read and write this directory without the app being debuggable
const BENCH_FILE = `${RNFS.ExternalDirectoryPath}/fps-bench.jsonl`;

// Counts JS-thread frames (requestAnimationFrame callbacks, the same measure as FlashList's
// JSFPSMonitor) and appends one line per second: { label, t, fps, rows }
const useFpsSampler = ( label: string, rowCount: number ) => {
  const rowCountRef = useRef( rowCount );
  useEffect( ( ) => {
    rowCountRef.current = rowCount;
  }, [rowCount] );

  useEffect( ( ) => {
    if ( !RNFS.ExternalDirectoryPath ) return ( ) => undefined;
    const mountedAt = Date.now( );
    let sampleStartedAt = mountedAt;
    let frames = 0;
    let frameRequest = 0;
    const countFrame = ( ) => {
      const now = Date.now( );
      frames += 1;
      // Divide by the real elapsed time: a stalled JS thread closes a sample late
      if ( now - sampleStartedAt >= 1000 ) {
        const line = JSON.stringify( {
          label,
          t: Math.round( ( now - mountedAt ) / 100 ) / 10,
          fps: Math.round( ( frames / ( ( now - sampleStartedAt ) / 1000 ) ) * 10 ) / 10,
          rows: rowCountRef.current,
        } );
        RNFS.appendFile( BENCH_FILE, `${line}\n`, "utf8" ).catch( ( ) => undefined );
        sampleStartedAt = now;
        frames = 0;
      }
      frameRequest = requestAnimationFrame( countFrame );
    };
    frameRequest = requestAnimationFrame( countFrame );
    return ( ) => cancelAnimationFrame( frameRequest );
  }, [label] );
};
```

Delete the sampler (and the signing change) once you're done.

## Running

Save this as `fling-run.sh` somewhere outside the repo, and run it with the device unlocked and connected over USB. It cold-starts the app, waits for the screen to load, flings, and pulls the samples and `gfxinfo` into `runs/`.

```bash
#!/bin/bash
# Usage: ./fling-run.sh <label> [flings] [gap seconds]
set -euo pipefail
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"

PKG=org.inaturalist.iNaturalistMobile
FILE=/sdcard/Android/data/$PKG/files/fps-bench.jsonl
LABEL=${1:?label}
FLINGS=${2:-90}
GAP=${3:-0.5}
mkdir -p runs

adb shell input keyevent KEYCODE_WAKEUP
adb shell rm -f "$FILE"
adb shell am force-stop $PKG
sleep 2
adb shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep 12
adb shell dumpsys gfxinfo $PKG reset >/dev/null

# A fast swipe is a fling: 1100px in 120ms, then let it coast
for _ in $(seq 1 "$FLINGS"); do
  adb shell input swipe 540 1500 540 400 120
  sleep "$GAP"
done
sleep 3
adb shell dumpsys gfxinfo $PKG > "runs/$LABEL-gfxinfo.txt"
adb shell input keyevent KEYCODE_HOME
adb pull "$FILE" "runs/$LABEL.jsonl" >/dev/null
grep -E "Janky frames|90th percentile|99th percentile" "runs/$LABEL-gfxinfo.txt"
```

The swipe coordinates assume a 1080×2220 screen (the S9's default). Check yours with `adb shell wm size`, and scale them if it differs.

Then summarise each run with this script (save as `fps-summary.py`):

```python
# Usage: python3 fps-summary.py runs/<label>.jsonl
import json, statistics, sys

samples = [json.loads(line) for line in open(sys.argv[1]) if line.strip()]
fps = sorted(s["fps"] for s in samples)
print(f"{samples[0]['label']}: {len(samples)}s, rows {samples[0]['rows']} -> {samples[-1]['rows']}")
print(f"  JS FPS mean {statistics.mean(fps):.1f}  p10 {fps[int(len(fps) * 0.1)]}  min {fps[0]}")
by_rows = {}
for s in samples:
    by_rows.setdefault(s["rows"] // 250 * 250, []).append(s["fps"])
print("  mean JS FPS by rows:", {k: round(statistics.mean(v), 1) for k, v in sorted(by_rows.items())})
```

## Profiling

To find where JS-thread time goes rather than how much there is:

- **System trace** with scheduling, to see what each thread is doing (running, runnable or blocked). Start it before the flings and stop it after:
  ```bash
  adb shell atrace --async_start -a org.inaturalist.iNaturalistMobile -b 16384 sched freq gfx view input dalvik binder_driver
  # ... fling ...
  adb shell atrace --async_stop -o /data/local/tmp/run.atrace
  adb pull /data/local/tmp/run.atrace
  ```
  Open it in [Perfetto](https://ui.perfetto.dev).
- **`simpleperf`** for native stacks on the JS thread (Realm, React Native's C++). A release build isn't debuggable, so it needs `<profileable android:shell="true" />` inside `<application>` in `android/app/src/main/AndroidManifest.xml`, temporarily. Then record with the `app_profiler.py` script that ships in the Android NDK's `simpleperf` directory:
  ```bash
  python3 $ANDROID_NDK_HOME/simpleperf/app_profiler.py -p org.inaturalist.iNaturalistMobile -r "-g --duration 20"
  ```
  It writes `perf.data` locally. Load it in Perfetto, or report it with the NDK's `report_html.py`.
