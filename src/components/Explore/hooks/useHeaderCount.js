// @flow

import { searchObservations } from "api/observations";
import {
  useCallback, useEffect, useMemo, useState
} from "react";
import { useAuthenticatedQuery } from "sharedHooks";

const useHeaderCount = ( filteredParams: Object ): Object => {
  const [count, setCount] = useState( {
    observations: null,
    species: null,
    observers: null,
    identifiers: null
  } );

  const updateCount = useCallback( newCount => {
    setCount( {
      ...count,
      ...newCount
    } );
  }, [count] );

  const paramsTotalResults = {
    ...filteredParams,
    per_page: 0
  };

  // 011224 amanda - we might eventually want to fetch this from useInfiniteObservationsScroll
  // instead of making a separate query, but per_page = 0 should make this extra query a low
  // performance cost
  const { data } = useAuthenticatedQuery(
    ["searchObservations", paramsTotalResults],
    optsWithAuth => searchObservations( paramsTotalResults, optsWithAuth ),
    {
      enabled: !!filteredParams
    }
  );
  const totalResults = data && data.total_results;

  useEffect( ( ) => {
    if ( !totalResults ) { return; }
    if ( totalResults && count.observations !== totalResults ) {
      updateCount( { observations: totalResults } );
    }
  }, [totalResults, updateCount, count] );

  const memoizedCount = useMemo( ( ) => count, [count] );

  return {
    count: memoizedCount,
    updateCount
  };
};

export default useHeaderCount;
