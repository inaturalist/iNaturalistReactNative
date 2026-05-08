import { useNavigation } from "@react-navigation/native";
import { hasOnlyCoarseLocation } from "components/SharedComponents/PermissionGateContainer";
import { useEffect, useRef, useState } from "react";
import fetchCoarseUserLocation from "sharedHelpers/fetchCoarseUserLocation";

import type { UserLocation } from "./useWatchPosition";
import useWatchPosition from "./useWatchPosition";

const useObservationLocation = ( options: {
  shouldFetchLocation: boolean;
} ) => {
  const navigation = useNavigation( );
  const { shouldFetchLocation } = options;

  const [isCoarseOnly, setIsCoarseOnly] = useState<boolean | null>( null );
  const [coarseLocation, setCoarseLocation] = useState<UserLocation | null>( null );
  const [isFetchingCoarse, setIsFetchingCoarse] = useState( false );
  const cancelledRef = useRef( false );

  useEffect( ( ) => {
    if ( !shouldFetchLocation ) return ( ) => undefined;
    cancelledRef.current = false;

    ( async ( ) => {
      setIsFetchingCoarse( true );
      try {
        const coarseOnly = await hasOnlyCoarseLocation( );
        if ( cancelledRef.current ) return;
        setIsCoarseOnly( coarseOnly );

        if ( coarseOnly ) {
          const location = await fetchCoarseUserLocation( );
          if ( cancelledRef.current ) return;
          if ( location ) setCoarseLocation( location );
        }
      } finally {
        if ( !cancelledRef.current ) setIsFetchingCoarse( false );
      }
    } )( );

    return ( ) => { cancelledRef.current = true; };
  }, [shouldFetchLocation] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      cancelledRef.current = true;
      setIsFetchingCoarse( false );
      setCoarseLocation( null );
      setIsCoarseOnly( null );
    } );
    return unsubscribe;
  }, [navigation] );

  const shouldWatchFine = shouldFetchLocation && isCoarseOnly === false;

  const {
    isFetchingLocation: isFetchingFine,
    stopWatch,
    subscriptionId,
    userLocation: fineLocation,
  } = useWatchPosition( { shouldFetchLocation: shouldWatchFine } );

  return {
    isFetchingLocation: isFetchingFine
      || isFetchingCoarse
      // cover first frame where shouldFetchLocation = true but both isFetching values are false
      || ( shouldFetchLocation && isCoarseOnly === null ),
    stopWatch,
    subscriptionId,
    userLocation: coarseLocation ?? fineLocation,
  };
};

export default useObservationLocation;
