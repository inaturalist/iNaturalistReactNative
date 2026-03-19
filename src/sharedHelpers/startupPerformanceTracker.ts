import type { PerformanceEntry } from "react-native-performance";
import performance from "react-native-performance";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "StartupPerformanceTracker" );

const getMark = ( name: string ): PerformanceEntry | undefined => (
  performance.getEntriesByName( name, "react-native-mark" )[0]
);

interface ScreenMeta {
  target_screen: "MyObservations" | "OnboardingCarousel";
  auth_state: "signed_in" | "signed_out";
}

class StartupPerformanceTracker {
  private startupServiceDone: boolean = false;

  // null = no sync expected (e.g. new user), false = pending, true = done
  private syncDone: boolean | null = null;

  private screenMeta: ScreenMeta | null = null;

  private emitted: boolean = false;

  // Called from index.js to reset state at the start of each cold launch
  beginColdStart(): void {
    this.emitted = false;
    this.startupServiceDone = false;
    this.syncDone = null;
    this.screenMeta = null;
  }

  // Called from StartupService after initializeApp() completes (success or error)
  markStartupServiceComplete(): void {
    if ( this.emitted ) { return; }
    this.startupServiceDone = true;
    this.tryEmit();
  }

  // Called in MyObservationsContainer useFocusEffect before startAutomaticSync(),
  // so syncDone is false before markScreenReached's tryEmit runs
  expectSync(): void {
    if ( this.emitted ) { return; }
    this.syncDone = false;
  }

  // Called in useSyncObservations after completeSync()
  markSyncComplete(): void {
    if ( this.emitted ) { return; }
    if ( this.syncDone === false ) {
      this.syncDone = true;
    }
    this.tryEmit();
  }

  // Called from landing screens to register screen metadata.
  // For MyObservations: always called after expectSync() in the same useFocusEffect,
  // so syncDone is already false when tryEmit runs here and isReady() returns false.
  // For OnboardingCarousel: no sync is expected, so syncDone stays null and isReady()
  // is satisfied as soon as the startup service completes.
  markScreenReached( meta: ScreenMeta ): void {
    if ( this.emitted ) { return; }
    this.screenMeta = meta;
    this.tryEmit();
  }

  private isReady(): boolean {
    return (
      this.startupServiceDone
      && this.syncDone !== false
      && this.screenMeta !== null
    );
  }

  private tryEmit(): void {
    if ( this.emitted || !this.isReady() ) { return; }
    this.emitted = true;

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
        targetScreen: this.screenMeta!.target_screen,
        authState: this.screenMeta!.auth_state,
      } );
    } catch ( e ) {
      logger.info( "startup_tti collection failed", e );
    }
  }
}

const startupPerformanceTracker = new StartupPerformanceTracker();
export default startupPerformanceTracker;
