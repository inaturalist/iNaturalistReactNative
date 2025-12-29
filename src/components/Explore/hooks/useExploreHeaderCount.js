// @flow

import {
  useCallback, useMemo, useState,
} from "react";

const useExploreHeaderCount = ( ): Object => {
  const [count, setCount] = useState( {
    observations: null,
    species: null,
    observers: null,
    identifiers: null,
  } );
  const [isFetching, setIsFetching] = useState( false );

  const updateCount = useCallback( newCount => {
    setCount( {
      ...count,
      ...newCount,
    } );
    setIsFetching( false );
  }, [count] );

  const memoizedCount = useMemo( ( ) => count, [count] );

  const handleUpdateCount = ( exploreView, totalResults ) => {
    if ( totalResults === null ) {
      return;
    }
    if ( count[exploreView] !== totalResults ) {
      updateCount( { [exploreView]: totalResults } );
    } else if ( count[exploreView] === totalResults && isFetching ) {
      setIsFetching( false );
    }
  };

  return {
    count: memoizedCount,
    isFetching,
    handleUpdateCount,
    setIsFetching,
  };
};

export default useExploreHeaderCount;
