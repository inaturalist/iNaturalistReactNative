// @flow

import {
  useCallback, useMemo, useState
} from "react";

const useHeaderCount = ( ): object => {
  const [count, setCount] = useState( {
    observations: null,
    species: null,
    observers: null,
    identifiers: null
  } );
  const [loadingStatus, setLoadingStatus] = useState( true );

  const updateCount = useCallback( ( newCount, status = false ) => {
    setCount( {
      ...count,
      ...newCount
    } );
    if ( status ) {
      setLoadingStatus( status );
    }
  }, [count] );

  const memoizedCount = useMemo( ( ) => count, [count] );

  return {
    count: memoizedCount,
    loadingStatus,
    updateCount
  };
};

export default useHeaderCount;
