import { noop } from "lodash";
import { useEffect, useRef } from "react";

function useInterval( callback:() => void, delay: number | null ) {
  const savedCallback = useRef<() => void>( null );

  // Remember the latest callback function
  useEffect( () => {
    if ( delay === null ) return;
    savedCallback.current = callback;
  }, [callback, delay] );

  // Set up the interval
  useEffect( () => {
    function tick() {
      if ( savedCallback && savedCallback.current !== null ) {
        savedCallback.current();
      }
    }
    if ( delay === null ) {
      return noop;
    }
    const id = setInterval( tick, delay );
    return () => clearInterval( id );
  }, [delay] );
}

export default useInterval;
