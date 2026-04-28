import { useNavigation } from "@react-navigation/native";
import { hasOnlyCoarseLocation } from "components/SharedComponents/PermissionGateContainer";
import {
  useCallback, useEffect, useRef, useState,
} from "react";
import fetchAccurateUserLocation from "sharedHelpers/fetchAccurateUserLocation";
import fetchCoarseUserLocation from "sharedHelpers/fetchCoarseUserLocation";

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
  let bestLocation = null;
  for ( let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1 ) {
    if ( isCancelled?.() ) return bestLocation;
    // We do indeed want to fetch location sequentially here
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
  const navigation = useNavigation( );
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
      setIsFetchingLocation( false );
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

  // Cancel any in-flight fetch when we lose focus
  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", cancel );
    return unsubscribe;
  }, [navigation, cancel] );

  return {
    userLocation,
    isFetchingLocation,
    cancel,
  };
};

export default useWatchPosition;
