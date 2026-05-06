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
  const [hasFetchedCoarse, setHasFetchedCoarse] = useState( false );
  const coarseCancelledRef = useRef( false );

  useEffect( ( ) => {
    if ( !shouldFetchLocation ) {
      setIsCoarseOnly( null );
      return ( ) => undefined;
    }
    let cancelled = false;
    hasOnlyCoarseLocation( ).then( result => {
      if ( !cancelled ) setIsCoarseOnly( result );
    } );
    return ( ) => { cancelled = true; };
  }, [shouldFetchLocation] );

  useEffect( ( ) => {
    if ( !shouldFetchLocation || isCoarseOnly !== true || hasFetchedCoarse ) return;
    coarseCancelledRef.current = false;
    setIsFetchingCoarse( true );
    fetchCoarseUserLocation( ).then( location => {
      if ( coarseCancelledRef.current ) return;
      if ( location ) setCoarseLocation( location );
      setIsFetchingCoarse( false );
      setHasFetchedCoarse( true );
    } );
  }, [shouldFetchLocation, isCoarseOnly, hasFetchedCoarse] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      coarseCancelledRef.current = true;
      setIsFetchingCoarse( false );
      setHasFetchedCoarse( false );
      setCoarseLocation( null );
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
    isFetchingLocation: isFetchingFine || isFetchingCoarse,
    stopWatch,
    subscriptionId,
    userLocation: coarseLocation ?? fineLocation,
  };
};

export default useObservationLocation;
