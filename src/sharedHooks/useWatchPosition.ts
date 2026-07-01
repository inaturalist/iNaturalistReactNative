import type {
  GeolocationError,
  GeolocationResponse,
} from "@react-native-community/geolocation";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";

// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import { clearWatch, watchPosition } from "../sharedHelpers/geolocationWrapper";

export const TARGET_POSITIONAL_ACCURACY = 10;
const MAX_POSITION_AGE_MS = 60_000;

export interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
  altitude: number | null;
  altitudinal_accuracy: number | null;
}

const geolocationOptions = {
  distanceFilter: 0,
  enableHighAccuracy: true,
  maximumAge: 0,
};

const useWatchPosition = ( options: {
  shouldFetchLocation: boolean;
} ) => {
  const { shouldFetchLocation } = options;
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );
  const [isWatching, setIsWatching] = useState( false );
  const watchIdRef = useRef<number | null>( null );
  const stopRef = useRef<( ) => void>( ( ) => {} );

  const stopWatch = useCallback( ( ) => stopRef.current( ), [] );

  useFocusEffect( useCallback( ( ) => {
    const effectCleanupNoop = () => {};
    if ( !shouldFetchLocation ) return effectCleanupNoop;

    let id: number | null = null;

    const stop = ( ) => {
      if ( id === null ) return;
      clearWatch( id );
      id = null;
      watchIdRef.current = null;
      setIsWatching( false );
    };
    stopRef.current = stop;

    const success = ( position: GeolocationResponse ) => {
      const age = Date.now() - position.timestamp;
      if ( age > MAX_POSITION_AGE_MS ) return;
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        positional_accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudinal_accuracy: position.coords.altitudeAccuracy,
      };
      setUserLocation( newLocation );
      if ( position.coords.accuracy < TARGET_POSITIONAL_ACCURACY ) {
        stop( );
      }
    };

    const failure = ( error: GeolocationError ) => {
      console.warn( "useWatchPosition error:", error );
      stop( );
    };

    const result = watchPosition( success, failure, geolocationOptions );
    if ( typeof result !== "number" ) {
      console.warn( "watchPosition failed to return a watchID" );
      return effectCleanupNoop;
    }
    id = result;
    watchIdRef.current = id;
    setIsWatching( true );

    return ( ) => {
      stop( );
      setUserLocation( null );
      stopRef.current = ( ) => {};
    };
  }, [shouldFetchLocation] ) );

  return {
    isFetchingLocation: isWatching,
    stopWatch,
    userLocation,
  };
};

export default useWatchPosition;
