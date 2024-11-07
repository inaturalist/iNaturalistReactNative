import { useEffect, useState } from "react";

type PerformanceType = {
  screenName: string; // name of the screen we're doing performace profiling
  isLoading: boolean | undefined; // indicating if data loading is finished
};

const usePerformance = ( {
  screenName,
  isLoading
}: PerformanceType ) => {
  const [startTime, setStartTime] = useState( 0 );
  const [loadTime, setLoadTime] = useState( "" );

  useEffect( ( ) => {
    const getPerformanceReport = ( ) => {
      const endTime = global.performance.now( );
      const timeToRender = endTime - startTime;
      const logMessage = `${screenName} Load Time: ${timeToRender.toFixed( 0 )} milliseconds`;

      setLoadTime( logMessage );
      console.log( logMessage );
      // Send data to any logging tool such as Amplitude
    };
    if ( startTime === 0 ) {
      setStartTime( global.performance.now() );
    }
    if ( !isLoading ) {
      getPerformanceReport();
    }
  }, [isLoading, startTime, screenName] );

  return {
    loadTime
  };
};

export default usePerformance;
