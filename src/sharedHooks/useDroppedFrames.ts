import NetInfo from "@react-native-community/netinfo";
import { getCurrentRoute } from "navigation/navigationUtils";
import { useEffect } from "react";
import { AppState } from "react-native";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "useDroppedFrames" );

// How many dropped frames this will cover depends on the phone's refresh rate
// either 60Hz (16.67ms per frame) or 120Hz (8.33ms per frame) is typical
// On my iPhone 17, normal navigation that didn't appear sluggish to me could show up to 300ms
// That in mind, 600 might still be a bit low for older devices
const FRAME_DROP_THRESHOLD_MS = 600;
const REPORTING_COOLDOWN_MS = 10_000;

const useDroppedFrames = (): void => {
  useEffect( () => {
    const sessionStartTime = global.performance.now( );
    let lastFrameTime = 0;
    // Initialize to -REPORTING_COOLDOWN_MS so the first drop is always reported
    let lastReportTime = -REPORTING_COOLDOWN_MS;
    let dropCount = 0;
    let rafId: number | null = null;

    const stopLoop = () => {
      if ( rafId !== null ) {
        global.cancelAnimationFrame( rafId );
        rafId = null;
      }
    };

    const frameCallback = ( timestamp: number ) => {
      if ( lastFrameTime !== 0 ) {
        const delta = timestamp - lastFrameTime;
        if ( delta > FRAME_DROP_THRESHOLD_MS ) {
          dropCount += 1;
          const now = global.performance.now( );
          const msSinceLast = now - lastReportTime;
          if ( msSinceLast >= REPORTING_COOLDOWN_MS ) {
            lastReportTime = now;
            const screenName = getCurrentRoute( )?.name ?? "Unknown";
            const frameDropMs = Math.round( delta );
            const dropCountSinceForeground = dropCount;
            const msSinceLastReport = Math.round( msSinceLast );
            const sessionDurationMs = Math.round( now - sessionStartTime );
            NetInfo.fetch( ).then( state => {
              logger.infoWithExtra( "dropped_frames", {
                screen_name: screenName,
                frame_delta_ms: frameDropMs,
                is_online: state.isConnected,
                drop_count_since_foreground: dropCountSinceForeground,
                ms_since_last_report: msSinceLastReport,
                session_duration_ms: sessionDurationMs,
              } );
            } ).catch( e => logger.warn( "useDroppedFrames NetInfo fetch failed", e ) );
          }
        }
      }
      lastFrameTime = timestamp;
      rafId = global.requestAnimationFrame( frameCallback );
    };

    const startLoop = () => {
      stopLoop( );
      lastFrameTime = 0;
      dropCount = 0;
      // Reset so the first drop after each foreground resumption is always reported
      lastReportTime = -REPORTING_COOLDOWN_MS;
      rafId = global.requestAnimationFrame( frameCallback );
    };

    startLoop( );

    const subscription = AppState.addEventListener( "change", nextState => {
      if ( nextState === "active" ) {
        startLoop( );
      } else {
        stopLoop( );
      }
    } );

    return () => {
      stopLoop( );
      subscription.remove( );
    };
  }, [] );
};

export default useDroppedFrames;
