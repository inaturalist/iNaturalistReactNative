import type {
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

export interface UserLocation {
  latitude: number,
  longitude: number,
  positional_accuracy: number,
  altitude: number | null,
  altitudinal_accuracy: number | null
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
  const [hasFocus, setHasFocus] = useState( true );

  const shouldStartWatch = shouldFetchLocation
    && subscriptionId === null
    && hasFocus
    && ( !userLocation || userLocation.positional_accuracy >= TARGET_POSITIONAL_ACCURACY );

  const shouldStopWatch = subscriptionId !== null
    && currentPosition?.coords?.accuracy < TARGET_POSITIONAL_ACCURACY;

  const stopWatch = useCallback( ( id: number ) => {
    clearWatch( id );
    setSubscriptionId( null );
    setCurrentPosition( null );
  }, [] );

  const startWatch = useCallback( ( ) => {
    const success = ( position: GeolocationResponse ) => {
      const age = Date.now() - position.timestamp;
      if ( age > MAX_POSITION_AGE_MS ) return;
      setCurrentPosition( position );
    };

    const failure = ( error: GeolocationError ) => {
      console.warn( "useWatchPosition error: ", error );
      if ( subscriptionId ) {
        stopWatch( subscriptionId );
      }
    };

    try {
      const watchID = watchPosition(
        success,
        failure,
        geolocationOptions
      );
      if ( typeof ( watchID ) !== "number" ) {
        throw new Error( "watchPosition failed to return a watchID" );
      }
      setSubscriptionId( watchID );
    } catch ( error ) {
      failure( error as GeolocationError );
    }
  }, [stopWatch, subscriptionId] );

  useEffect( ( ) => {
    if ( !currentPosition ) { return; }
    const newLocation = {
      latitude: currentPosition?.coords?.latitude,
      longitude: currentPosition?.coords?.longitude,
      positional_accuracy: currentPosition?.coords?.accuracy,
      altitude: currentPosition?.coords?.altitude,
      altitudinal_accuracy: currentPosition?.coords?.altitudeAccuracy
    };
    setUserLocation( newLocation );
    if ( shouldStopWatch ) {
      stopWatch( subscriptionId );
    }
  }, [currentPosition, stopWatch, subscriptionId, shouldStopWatch] );

  useEffect( ( ) => {
    if ( shouldStartWatch ) {
      startWatch( );
    }
  }, [shouldStartWatch, startWatch] );

  useEffect( ( ) => {
    // When we leave the screen this hook was used on...
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      // ...stop watching for location updates if we were...
      if ( subscriptionId !== null ) {
        stopWatch( subscriptionId );
      }
      // ...and wipe the current location so we don't pick up a stale one later
      setUserLocation( null );
      setHasFocus( false );
    } );
    return unsubscribe;
  }, [navigation, stopWatch, subscriptionId] );

  // Listen for focus. We only want to fetch location when this screen has focus.
  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      setHasFocus( true );
    } );
    return unsubscribe;
  }, [navigation] );

  return {
    isFetchingLocation: subscriptionId !== null,
    stopWatch,
    subscriptionId,
    userLocation
  };
};

export default useWatchPosition;
