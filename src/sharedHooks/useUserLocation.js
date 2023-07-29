// @flow

import Geolocation from "@react-native-community/geolocation";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { PERMISSIONS, request } from "react-native-permissions";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";

const useUserLocation = ( { skipPlaceGuess = false }: Object ): Object => {
  const [latLng, setLatLng] = useState( null );
  const [isLoading, setIsLoading] = useState( true );

  // TODO: wrap this in PermissionsGate so permissions aren't requested at odd times
  const requestiOSPermissions = async ( ): Promise<?string> => {
    // TODO: test this on a real device
    try {
      const permission = await request( PERMISSIONS.IOS.LOCATION_WHEN_IN_USE );
      return permission;
    } catch ( e ) {
      console.warn( e, ": error requesting iOS permissions" );
    }
    return null;
  };

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLocation = async ( ) => {
      setIsLoading( true );
      if ( Platform.OS === "ios" ) {
        const permissions = await requestiOSPermissions( );
        // TODO: handle case where iOS permissions are not granted
        if ( permissions !== "granted" ) { return; }
      }

      const success = async ( { coords } ) => {
        if ( !isCurrent ) { return; }
        let placeGuess = null;
        if ( !skipPlaceGuess ) {
          placeGuess = await fetchPlaceName( coords.latitude, coords.longitude );
        }
        setLatLng( {
          place_guess: placeGuess,
          latitude: coords.latitude,
          longitude: coords.longitude,
          positional_accuracy: coords.accuracy
        } );
        setIsLoading( false );
      };

      // TODO: set geolocation fetch error
      const failure = error => {
        console.warn( error.code, error.message );
        setIsLoading( false );
      };

      const options = { enableHighAccuracy: true, maximumAge: 0 };

      Geolocation.getCurrentPosition( success, failure, options );
    };
    fetchLocation( );

    return ( ) => {
      isCurrent = false;
    };
  }, [skipPlaceGuess] );

  return {
    latLng,
    isLoading
  };
};

export default useUserLocation;
