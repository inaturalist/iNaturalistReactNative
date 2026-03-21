import type { PerformanceEntry } from "react-native-performance";
import performance from "react-native-performance";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "StartupPerformanceTracker" );

interface ScreenMeta {
  targetScreen: "MyObservations" | "OnboardingCarousel";
  loggedIn: boolean;
}

// Module-level state — the module itself is the singleton
let startupServiceDone = false;
// null = no sync expected (e.g. new user), false = pending, true = done
let syncDone: boolean | null = null;
let screenMeta: ScreenMeta | null = null;
let emitted = false;

const getMark = ( name: string ): PerformanceEntry | undefined => (
  performance.getEntriesByName( name, "react-native-mark" )[0]
);

const isReady = () => startupServiceDone && syncDone !== false && screenMeta !== null;

const tryEmit = () => {
  if ( emitted || !isReady() || !screenMeta ) { return; }
  emitted = true;

  try {
    const nativeLaunchStart = getMark( "nativeLaunchStart" );
    const nativeLaunchEnd = getMark( "nativeLaunchEnd" );
    const runJsBundleStart = getMark( "runJsBundleStart" );
    const runJsBundleEnd = getMark( "runJsBundleEnd" );
    const contentAppeared = getMark( "contentAppeared" );

    // All elapsed times are relative to nativeLaunchStart so they form a
    // directly comparable timeline. "NA" if the native mark is unavailable
    const originMs = nativeLaunchStart?.startTime;

    const nativeLaunchMs = ( nativeLaunchStart && nativeLaunchEnd )
      ? Math.round( nativeLaunchEnd.startTime - nativeLaunchStart.startTime )
      : "NA";

    const jsBundleLoadedMs = ( runJsBundleStart && runJsBundleEnd )
      ? Math.round( runJsBundleEnd.startTime - runJsBundleStart.startTime )
      : "NA";

    const contentAppearedMs = ( contentAppeared && originMs !== undefined )
      ? Math.round( contentAppeared.startTime - originMs )
      : "NA";

    // performance.now() is in the same time domain as the native marks
    // (ms since performance.timeOrigin ≈ native launch)
    const screenInteractiveMs = originMs !== undefined
      ? Math.round( performance.now() - originMs )
      : "NA";

    logger.infoWithExtra( "startup_tti", {
      screenInteractiveMs,
      contentAppearedMs,
      jsBundleLoadedMs,
      nativeLaunchMs,
      startType: "cold",
      targetScreen: screenMeta.targetScreen,
      loggedIn: screenMeta.loggedIn,
    } );
  } catch ( e ) {
    logger.info( "startup_tti collection failed", e );
  }
};

// Called from index.js to reset state at the start of each cold launch
export const beginColdStart = () => {
  emitted = false;
  startupServiceDone = false;
  syncDone = null;
  screenMeta = null;
};

// Called from StartupService after initializeApp() completes (success or error)
export const markStartupServiceComplete = () => {
  if ( emitted ) { return; }
  startupServiceDone = true;
  tryEmit();
};

// Called in MyObservationsContainer useFocusEffect before startAutomaticSync(),
// so syncDone is false before markScreenReached's tryEmit runs
export const expectSync = () => {
  if ( emitted ) { return; }
  syncDone = false;
};

// Called in useSyncObservations after completeSync()
export const markSyncComplete = () => {
  if ( emitted ) { return; }
  if ( syncDone === false ) {
    syncDone = true;
  }
  tryEmit();
};

// Called from landing screens to register screen metadata.
// For MyObservations: always called after expectSync() in the same useFocusEffect,
// so syncDone is already false when tryEmit runs here and isReady() returns false.
// For OnboardingCarousel: no sync is expected, so syncDone stays null and isReady()
// is satisfied as soon as the startup service completes.
export const markScreenReached = ( meta: ScreenMeta ) => {
  if ( emitted ) { return; }
  screenMeta = meta;
  tryEmit();
};
