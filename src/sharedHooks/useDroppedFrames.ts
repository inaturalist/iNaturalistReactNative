import NetInfo from "@react-native-community/netinfo";
import { getCurrentRoute } from "navigation/navigationUtils";
import { useEffect } from "react";
import { AppState } from "react-native";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "useDroppedFrames" );

const FRAME_DROP_THRESHOLD_MS = 100;
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
            const dropCountInSession = dropCount;
            const msSinceLastReport = Math.round( msSinceLast );
            const sessionDurationMs = Math.round( now - sessionStartTime );
            NetInfo.fetch( ).then( state => {
              logger.warnWithExtra( "dropped_frames", {
                screen_name: screenName,
                frame_delta_ms: frameDropMs,
                is_online: state.isConnected,
                drop_count_in_session: dropCountInSession,
                ms_since_last_report: msSinceLastReport,
                session_duration_ms: sessionDurationMs,
              } );
            } );
          }
        }
      }
      lastFrameTime = timestamp;
      rafId = global.requestAnimationFrame( frameCallback );
    };

    const startLoop = () => {
      stopLoop( );
      lastFrameTime = 0;
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
