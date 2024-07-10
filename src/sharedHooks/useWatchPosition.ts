import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
  RESULTS as PERMISSION_RESULTS
} from "react-native-permissions";
import {
  checkLocationPermission,
  shouldFetchObservationLocation,
  TARGET_POSITIONAL_ACCURACY
} from "sharedHelpers/shouldFetchObservationLocation.ts";
import useStore from "stores/useStore";

interface UserLocation {
  latitude: number,
  longitude: number,
  positional_accuracy: number
}

interface WatchPosition {
  hasLocation: boolean,
  isFetchingLocation: boolean,
  locationPermissionNeeded: boolean,
  userLocation: UserLocation
}

const geolocationOptions = {
  distanceFilter: 0,
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 2000
};

const useWatchPosition = ( options: {
  retry: boolean
} ): WatchPosition => {
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const currentObservation = useStore( state => state.currentObservation );
  const [currentPosition, setCurrentPosition] = useState<GeolocationResponse | null>( null );
  const [subscriptionId, setSubscriptionId] = useState<number | null>( null );
  const [locationPermissionResult, setLocationPermissionResult] = useState<string | null>( null );
  const [errorCode, setErrorCode] = useState<number | null>( null );
  const hasLocation = currentObservation?.latitude && currentObservation?.longitude;
  const [shouldFetchLocation, setShouldFetchLocation] = useState<boolean>( true );
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );

  const watchPosition = ( ) => {
    const success = ( position: GeolocationResponse ) => {
      setLocationPermissionResult( "granted" );
      setCurrentPosition( position );
    };

    const failure = ( error: GeolocationError ) => {
      console.warn( `useWatchPosition: ${error.message} (${error.code})` );
      if ( error.code === 1 ) {
        setLocationPermissionResult( PERMISSION_RESULTS.DENIED );
      } else {
        setErrorCode( error.code );
      }
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

  useEffect( ( ) => {
    const accuracy = currentPosition?.coords?.accuracy;
    const newLocation = {
      latitude: currentPosition?.coords?.latitude,
      longitude: currentPosition?.coords?.longitude,
      positional_accuracy: accuracy
    };
    if ( !currentPosition || !accuracy ) { return; }
    // right now, we're returning a userLocation for the Projects and Camera
    // screens, and we're updating observation keys in ObsEdit so the location
    // is added directly to the observation. once changes to permissions flow are
    // done, we'll want to also update observation keys via Suggestions (instead of
    // adding location in the Camera)
    if ( !_.isEmpty( currentObservation ) ) {
      updateObservationKeys( newLocation );
    }
    setUserLocation( newLocation );
    if ( accuracy < TARGET_POSITIONAL_ACCURACY ) {
      Geolocation.clearWatch( subscriptionId );
      setSubscriptionId( null );
      setCurrentPosition( null );
    }
  }, [currentPosition, subscriptionId, updateObservationKeys, currentObservation] );

  useEffect( ( ) => {
    const beginLocationFetch = async ( ) => {
      const permissionResult = await checkLocationPermission( );
      setLocationPermissionResult( permissionResult );
      const startFetchLocation = await shouldFetchObservationLocation( currentObservation );
      if ( _.isEmpty( currentObservation ) || startFetchLocation ) {
        watchPosition( );
      } else {
        setShouldFetchLocation( false );
      }
    };
    beginLocationFetch( );
  }, [currentObservation, options?.retry] );

  const locationDenied = locationPermissionResult === PERMISSION_RESULTS.DENIED;

  return {
    hasLocation,
    isFetchingLocation: ( !errorCode || !locationDenied ) && shouldFetchLocation,
    locationPermissionNeeded: locationDenied,
    userLocation
  };
};

export default useWatchPosition;
