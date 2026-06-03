import { useCallback, useEffect, useRef } from "react";
import performance from "react-native-performance";
import isDebugMode from "sharedHelpers/isDebugMode";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "usePerformance" );

interface PerformanceOptions {
  screenName?: string;
  isLoading?: boolean;
}

const usePerformance = ( {
  screenName,
  isLoading,
}: PerformanceOptions = {} ) => {
  const startTime = useRef( 0 );

  useEffect( ( ) => {
    startTime.current = performance.now( );
  }, [] );

  const stop = useCallback( ( ) => {
    if ( !isDebugMode( ) ) { return; }
    const endTime = performance.now( );
    const elapsed = endTime - startTime.current;
    const loadTimeMessage = `Load Time: ${elapsed.toFixed( 0 )} milliseconds`;
    const logMessage = screenName
      ? `${screenName} ${loadTimeMessage}`
      : loadTimeMessage;
    logger.info( logMessage );
  }, [screenName] );

  useEffect( ( ) => {
    if ( isLoading === false ) {
      stop( );
    }
  }, [isLoading, stop] );

  return stop;
};

export default usePerformance;
