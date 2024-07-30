import {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import { clearWatch, watchPosition } from "../sharedHelpers/geolocationWrapper";

export const TARGET_POSITIONAL_ACCURACY = 10;
const MAX_POSITION_AGE_MS = 60_000;

interface UserLocation {
  latitude: number,
  longitude: number,
  positional_accuracy: number
}

const geolocationOptions = {
  distanceFilter: 0,
  enableHighAccuracy: true,
  maximumAge: 0
};

const useWatchPosition = ( options: {
  shouldFetchLocation: boolean
} ) => {
  const navigation = useNavigation( );
  const [currentPosition, setCurrentPosition] = useState<GeolocationResponse | null>( null );
  const [subscriptionId, setSubscriptionId] = useState<number | null>( null );
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );
  const { shouldFetchLocation } = options;

  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(
    shouldFetchLocation
  );

  const startWatch = ( ) => {
    setIsFetchingLocation( true );
    const success = ( position: GeolocationResponse ) => {
      const age = Date.now() - position.timestamp;
      if ( age > MAX_POSITION_AGE_MS ) return;
      setCurrentPosition( position );
    };

    const failure = ( error: GeolocationError ) => {
      console.warn( "useWatchPosition error: ", error );
      setIsFetchingLocation( false );
    };

    try {
      const watchID = watchPosition(
        success,
        failure,
        geolocationOptions
      );
      setSubscriptionId( watchID );
    } catch ( error ) {
      failure( error as GeolocationError );
    }
  };

  const stopWatch = useCallback( ( id: number ) => {
    clearWatch( id );
    setSubscriptionId( null );
    setCurrentPosition( null );
    setIsFetchingLocation( false );
  }, [] );

  useEffect( ( ) => {
    if ( !currentPosition ) { return; }
    const newLocation = {
      latitude: currentPosition?.coords?.latitude,
      longitude: currentPosition?.coords?.longitude,
      positional_accuracy: currentPosition?.coords?.accuracy
    };
    setUserLocation( newLocation );
    if (
      subscriptionId !== null
      && currentPosition?.coords?.accuracy < TARGET_POSITIONAL_ACCURACY
    ) {
      stopWatch( subscriptionId );
    }
  }, [currentPosition, stopWatch, subscriptionId] );

  useEffect( ( ) => {
    if ( shouldFetchLocation ) {
      startWatch( );
    }
  }, [shouldFetchLocation] );

  useEffect( ( ) => {
    // When we leave the screen this hook was used on...
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      // ...stop watching for location updates if we were...
      if ( subscriptionId !== null ) stopWatch( subscriptionId );
      // ...and wipe the current location so we don't pick up a stale one later
      setUserLocation( null );
    } );
    return unsubscribe;
  }, [navigation, stopWatch, subscriptionId] );

  return {
    isFetchingLocation,
    userLocation
  };
};

export default useWatchPosition;
