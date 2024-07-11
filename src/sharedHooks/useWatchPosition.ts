import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";
import { useCallback, useEffect, useState } from "react";

export const TARGET_POSITIONAL_ACCURACY = 10;

export const TIMEOUT = 2000;

interface UserLocation {
  latitude: number,
  longitude: number,
  positional_accuracy: number
}

const geolocationOptions = {
  distanceFilter: 0,
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: TIMEOUT
};

const useWatchPosition = ( options: {
  shouldFetchLocation: boolean
} ) => {
  const [currentPosition, setCurrentPosition] = useState<string | null>( null );
  const [subscriptionId, setSubscriptionId] = useState<number | null>( null );
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );
  const { shouldFetchLocation } = options;

  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(
    shouldFetchLocation
  );

  const watchPosition = ( ) => {
    const success = ( position: GeolocationResponse ) => {
      setCurrentPosition( position );
    };

    const failure = ( error: GeolocationError ) => {
      console.warn( error, ": useWatchPosition error" );
      setIsFetchingLocation( false );
    };

    try {
      const watchID = Geolocation.watchPosition(
        success,
        failure,
        geolocationOptions
      );
      setSubscriptionId( watchID );
    } catch ( error ) {
      failure( error );
    }
  };

  const stopWatch = useCallback( id => {
    Geolocation.clearWatch( id );
    setSubscriptionId( null );
    setCurrentPosition( null );
    setIsFetchingLocation( false );
  }, [] );

  useEffect( ( ) => {
    if ( !currentPosition ) { return; }
    setUserLocation( {
      latitude: currentPosition?.coords?.latitude,
      longitude: currentPosition?.coords?.longitude,
      positional_accuracy: currentPosition?.coords?.accuracy
    } );
    if ( currentPosition?.coords?.accuracy < TARGET_POSITIONAL_ACCURACY ) {
      stopWatch( subscriptionId );
    }
  }, [currentPosition, stopWatch, subscriptionId] );

  useEffect( ( ) => {
    if ( shouldFetchLocation && !userLocation ) {
      watchPosition( );
    }
  }, [shouldFetchLocation, userLocation] );

  console.log( userLocation, "user location" );

  return {
    isFetchingLocation,
    userLocation
  };
};

export default useWatchPosition;
