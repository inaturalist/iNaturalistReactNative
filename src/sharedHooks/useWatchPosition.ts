import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";
import { useEffect, useState } from "react";
import {
  RESULTS as PERMISSION_RESULTS
} from "react-native-permissions";
import useStore from "stores/useStore";

const TARGET_POSITIONAL_ACCURACY = 10;

const options = {
  distanceFilter: 0,
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 2000
};

const useWatchPosition = ( ) => {
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const currentObservation = useStore( state => state.currentObservation );
  const [currentPosition, setCurrentPosition] = useState<string | null>( null );
  const [subscriptionId, setSubscriptionId] = useState<number | null>( null );
  const [locationPermissionResult, setLocationPermissionResult] = useState( null );
  const [errorCode, setErrorCode] = useState( null );
  const hasLocation = currentObservation?.latitude && currentObservation?.longitude;

  const watchPosition = ( ) => {
    const success = ( position: GeolocationResponse ) => {
      setLocationPermissionResult( true );
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
        options
      );
      setSubscriptionId( watchID );
    } catch ( error ) {
      failure( error );
    }
  };

  useEffect( ( ) => {
    const positionalAccuracy = currentPosition?.coords?.accuracy;
    if ( !currentPosition || !positionalAccuracy ) { return; }
    if ( positionalAccuracy < TARGET_POSITIONAL_ACCURACY ) {
      updateObservationKeys( {
        latitude: currentPosition?.coords?.latitude,
        longitude: currentPosition?.coords?.longitude,
        positional_accuracy: positionalAccuracy
      } );
      Geolocation.clearWatch( subscriptionId );
      setSubscriptionId( null );
      setCurrentPosition( null );
    }
  }, [currentPosition, subscriptionId, updateObservationKeys] );

  useEffect( ( ) => {
    watchPosition( );
  }, [] );

  const locationDenied = locationPermissionResult === PERMISSION_RESULTS.DENIED;

  return {
    hasLocation,
    isFetchingLocation: ( !errorCode || !locationDenied ) && !hasLocation,
    locationPermissionNeeded: locationDenied
  };
};

export default useWatchPosition;
