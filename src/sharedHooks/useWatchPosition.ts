// Please don't change fetchAccurateUserLocation/fetchCoarseUserLocation imports
// to aliased paths or the e2e mocks will not get used in our e2e tests on
// Github Actions
import { hasOnlyCoarseLocation } from "components/SharedComponents/PermissionGateContainer";
import {
  useCallback, useEffect, useRef, useState,
} from "react";

import fetchAccurateUserLocation from "../sharedHelpers/fetchAccurateUserLocation";
import fetchCoarseUserLocation from "../sharedHelpers/fetchCoarseUserLocation";

export const TARGET_POSITIONAL_ACCURACY = 10;

const MAX_ATTEMPTS = 5;

export interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
  altitude: number | null;
  altitudinal_accuracy: number | null;
}

const fetchObservationLocation = async (
  isCancelled?: ( ) => boolean,
): Promise<UserLocation | null> => {
  // On Android, if only coarse location was granted, skip the high-accuracy attempt
  if ( await hasOnlyCoarseLocation() ) {
    return fetchCoarseUserLocation();
  }

  // Retry until we reach target accuracy or exhaust attempts.
  // Each call to fetchAccurateUserLocation tries high-accuracy first
  // (10s timeout), then falls back to low-accuracy.
  let bestLocation = null;
  for ( let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1 ) {
    if ( isCancelled?.() ) return bestLocation;

    // eslint-disable-next-line no-await-in-loop
    const location = await fetchAccurateUserLocation();
    if ( !location ) break;

    if (
      !bestLocation
      || location.positional_accuracy < bestLocation.positional_accuracy
    ) {
      bestLocation = location;
    }

    if ( bestLocation.positional_accuracy < TARGET_POSITIONAL_ACCURACY ) {
      break;
    }
  }

  return bestLocation;
};

const useWatchPosition = ( options: {
  shouldFetchLocation: boolean;
} ) => {
  const { shouldFetchLocation } = options;
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );
  const [isFetchingLocation, setIsFetchingLocation] = useState( false );
  const cancelRef = useRef<( () => void ) | null>( null );

  const cancel = useCallback( ( ) => {
    if ( cancelRef.current ) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setIsFetchingLocation( false );
  }, [] );

  useEffect( ( ) => {
    if ( !shouldFetchLocation ) {
      return ( ) => {};
    }

    let cancelled = false;
    cancelRef.current = ( ) => { cancelled = true; };
    setIsFetchingLocation( true );

    fetchObservationLocation( ( ) => cancelled ).then( location => {
      if ( cancelled ) return;
      setUserLocation( location );
      setIsFetchingLocation( false );
    } );

    return ( ) => { cancelled = true; };
  }, [shouldFetchLocation] );

  return {
    userLocation,
    isFetchingLocation,
    cancel,
  };
};

export default useWatchPosition;
