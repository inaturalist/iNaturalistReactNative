import {
  EXPLORE_ACTION,
  useExplore,
} from "providers/ExploreContext";
import { useCallback } from "react";

const useSelectNearbyLocation = ( ) => {
  const { dispatch, defaultExploreLocation } = useExplore( );

  return useCallback( async ( ) => {
    const exploreLocation = await defaultExploreLocation( );
    dispatch( { type: EXPLORE_ACTION.SET_EXPLORE_LOCATION, exploreLocation } );
  }, [defaultExploreLocation, dispatch] );
};

export default useSelectNearbyLocation;
