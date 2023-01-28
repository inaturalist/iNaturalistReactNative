// @flow
import Geolocation from "@react-native-community/geolocation";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { PERMISSIONS, request } from "react-native-permissions";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";

type Props = {
  skipPlaceGuess?: bool
}

type LatLng = {
  place_guess: string | null | typeof undefined,
  latitude: number,
  longitude: number,
  positional_accuracy: any
}

const useUserLocation = ( { skipPlaceGuess = false }: Props ): Object => {
  const [latLng, setLatLng] = useState<LatLng | null>( null );
  const [isLoading, setIsLoading] = useState( true );

  // TODO: wrap this in PermissionsGate so permissions aren't requested at odd times
  const requestiOSPermissions = ( ): string | null => {
    // TODO: test this on a real device
    try {
      return request( PERMISSIONS.IOS.LOCATION_WHEN_IN_USE );
    } catch ( e ) {
      console.warn( e, ": error requesting iOS permissions" );
    }
    return null;
  };

  // TODO: set geolocation fetch error
  const failure = error => {
    console.warn( error.code, error.message );
    setIsLoading( false );
  };

  const success = ( { coords } ) => {
    setLatLng( {
      place_guess: null,
      latitude: coords.latitude,
      longitude: coords.longitude,
      positional_accuracy: coords.accuracy
    } );
  };

  const fetchLocation = useCallback( async ( ) => {
    if ( Platform.OS === "ios" ) {
      const permissions = await requestiOSPermissions( );
      // TODO: handle case where iOS permissions are not granted
      if ( permissions !== "granted" ) { return; }
    }

    const options = { enableHighAccuracy: true, maximumAge: 0 };

    Geolocation.getCurrentPosition( success, failure, options );
  }, [] );

  const fetchPlaceGuess = useCallback( async ( ) => {
    if ( latLng ) {
      const placeGuess = await fetchPlaceName( latLng.latitude, latLng.longitude );
      setLatLng( currentLatLng => currentLatLng && {
        ...currentLatLng, place_guess: placeGuess
      } );
    }
  }, [latLng] );

  useEffect( () => {
    fetchLocation();
  }, [fetchLocation] );

  useEffect( ( ) => {
    setIsLoading( true );
    if ( !skipPlaceGuess ) {
      fetchPlaceGuess();
    }
    setIsLoading( false );
  }, [fetchPlaceGuess, skipPlaceGuess] );

  return {
    latLng,
    isLoading
  };
};

export default useUserLocation;
