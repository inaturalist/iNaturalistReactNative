import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "usePerformance" );

const SLOW_LOAD_THRESHOLD_MS = 5000;

interface PerformanceType {
  screenName?: string; // name of the screen to profile; helpful if not using logger
  isLoading: boolean | undefined; // indicate whether data finished loading
  slowLoadThresholdMs?: number;
}

const usePerformance = ( {
  screenName,
  isLoading,
  slowLoadThresholdMs = SLOW_LOAD_THRESHOLD_MS,
}: PerformanceType ) => {
  const [startTime, setStartTime] = useState( 0 );
  const [loadTime, setLoadTime] = useState( "" );
  const slowLoadFired = useRef( false );
  const { isConnected } = useNetInfo( );

  useEffect( ( ) => {
    const getPerformanceReport = ( ) => {
      const endTime = global.performance.now( );
      const timeToRender = endTime - startTime;
      const loadTimeMessage = `Load Time: ${timeToRender.toFixed( 0 )} milliseconds`;
      const logMessage = screenName
        ? `${screenName} ${loadTimeMessage}`
        : loadTimeMessage;

      setLoadTime( logMessage );

      if (
        !slowLoadFired.current
        && timeToRender >= slowLoadThresholdMs
      ) {
        slowLoadFired.current = true;
        const name = screenName || "Unknown";
        logger.warnWithExtra(
          `Slow load: ${name} ${timeToRender.toFixed( 0 )}ms`,
          {
            screen_name: name,
            load_time_ms: Math.round( timeToRender ),
            is_online: isConnected,
            trigger_type: "slow_load",
          },
        );
      }
    };
    if ( startTime === 0 ) {
      setStartTime( global.performance.now() );
    }
    if ( !isLoading ) {
      getPerformanceReport();
    }
  }, [isLoading, startTime, screenName, slowLoadThresholdMs, isConnected] );

  return {
    loadTime,
  };
};

export default usePerformance;
