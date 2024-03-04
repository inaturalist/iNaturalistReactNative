// @flow

import {
  useCallback, useMemo, useState
} from "react";

const useHeaderCount = ( ): Object => {
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

  const memoizedCount = useMemo( ( ) => count, [count] );

  return {
    count: memoizedCount,
    updateCount
  };
};

export default useHeaderCount;
