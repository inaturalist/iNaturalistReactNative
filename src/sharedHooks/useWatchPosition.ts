import type {
  GeolocationError,
  GeolocationResponse,
} from "@react-native-community/geolocation";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import { clearWatch, watchPosition } from "../sharedHelpers/geolocationWrapper";

export const TARGET_POSITIONAL_ACCURACY = 10;

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

  useFocusEffect( useCallback( ( ) => {
    if ( !shouldFetchLocation ) return ( ) => {};

    let id: number | null = null;

    const stop = ( ) => {
      if ( id !== null ) {
        clearWatch( id );
        id = null;
      }
      setIsWatching( false );
    };

    const success = ( position: GeolocationResponse ) => {
      setUserLocation( {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        positional_accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudinal_accuracy: position.coords.altitudeAccuracy,
      } );
      if ( position.coords.accuracy < TARGET_POSITIONAL_ACCURACY ) {
        stop( );
      }
    };

    const failure = ( error: GeolocationError ) => {
      console.warn( "useWatchPosition error:", error );
      stop( );
    };

    id = watchPosition( success, failure, geolocationOptions );
    setIsWatching( true );

    return ( ) => {
      stop( );
      setUserLocation( null );
    };
  }, [shouldFetchLocation] ) );

  return { isFetchingLocation: isWatching, userLocation };
};

export default useWatchPosition;
