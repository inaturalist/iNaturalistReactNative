import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "usePerformance" );

const SLOW_LOAD_THRESHOLD_MS = 5000;

interface PerformanceType {
  screenName?: string; // name of the screen to profile; helpful if not using logger
  isLoading: boolean | undefined; // indicate whether data finished loading
}

const usePerformance = ( {
  screenName,
  isLoading,
}: PerformanceType ): void => {
  const startTime = useRef( 0 );
  const slowLoadFired = useRef( false );

  useEffect( ( ) => {
    if ( startTime.current === 0 ) {
      startTime.current = global.performance.now( );
    }
    if ( isLoading ) return;

    const endTime = global.performance.now( );
    const timeToRender = endTime - startTime.current;

    if ( !slowLoadFired.current && timeToRender >= SLOW_LOAD_THRESHOLD_MS ) {
      slowLoadFired.current = true;
      const name = screenName || "Unknown";
      NetInfo.fetch( ).then( state => {
        logger.warnWithExtra(
          `Slow load: ${name} ${timeToRender.toFixed( 0 )}ms`,
          {
            screen_name: name,
            load_time_ms: Math.round( timeToRender ),
            is_online: state.isConnected,
            trigger_type: "slow_load",
          },
        );
      } );
    }
  }, [isLoading, screenName] );
};

export default usePerformance;
