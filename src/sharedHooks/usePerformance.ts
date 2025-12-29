import { useEffect, useState } from "react";

type PerformanceType = {
  screenName?: string; // name of the screen to profile; helpful if not using logger
  isLoading: boolean | undefined; // indicate whether data finished loading
};

const usePerformance = ( {
  screenName,
  isLoading,
}: PerformanceType ) => {
  const [startTime, setStartTime] = useState( 0 );
  const [loadTime, setLoadTime] = useState( "" );

  useEffect( ( ) => {
    const getPerformanceReport = ( ) => {
      const endTime = global.performance.now( );
      const timeToRender = endTime - startTime;
      const loadTimeMessage = `Load Time: ${timeToRender.toFixed( 0 )} milliseconds`;
      const logMessage = screenName
        ? `${screenName} ${loadTimeMessage}`
        : loadTimeMessage;

      setLoadTime( logMessage );
    };
    if ( startTime === 0 ) {
      setStartTime( global.performance.now() );
    }
    if ( !isLoading ) {
      getPerformanceReport();
    }
  }, [isLoading, startTime, screenName] );

  return {
    loadTime,
  };
};

export default usePerformance;
