// @flow

import {
  useCallback, useMemo, useState
} from "react";

const useExploreHeaderCount = ( ): Object => {
  const [count, setCount] = useState( {
    observations: null,
    species: null,
    observers: null,
    identifiers: null
  } );
  const [fetchingStatus, setFetchingStatus] = useState( null );

  const updateCount = useCallback( newCount => {
    setCount( {
      ...count,
      ...newCount
    } );
    setFetchingStatus( false );
  }, [count] );

  const memoizedCount = useMemo( ( ) => count, [count] );

  const handleUpdateCount = ( exploreView, totalResults ) => {
    if ( totalResults === null ) {
      return;
    }
    if ( count[exploreView] !== totalResults ) {
      updateCount( { [exploreView]: totalResults } );
    } else if ( count[exploreView] === totalResults && fetchingStatus === true ) {
      setFetchingStatus( false );
    }
  };

  return {
    count: memoizedCount,
    fetchingStatus,
    handleUpdateCount,
    setFetchingStatus
  };
};

export default useExploreHeaderCount;
