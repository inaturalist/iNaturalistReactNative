// @flow

import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS } from "react-native-permissions";
import fetchPlaceName from "../sharedHelpers/fetchPlaceName";

const useUserLocation = ( ): Object => {
  const [latLng, setLatLng] = useState( null );

  // TODO: wrap this in PermissionsGate so permissions aren't requested at odd times
  const requestiOSPermissions = async ( ): Promise<?string> => {
    // TODO: test this on a real device
    if ( Platform.OS === "ios" ) {
      try {
        const permission = await request( PERMISSIONS.IOS.LOCATION_WHEN_IN_USE );
        return permission;
      } catch ( e ) {
        console.log( e, ": error requesting iOS permissions" );
      }
    }
    return null;
  };

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLocation = async ( ) => {
      const permissions = await requestiOSPermissions( );
      // TODO: handle case where iOS permissions are not granted
      if ( permissions !== "granted" ) { return; }

      const success = async ( { coords } ) => {
        if ( !isCurrent ) { return; }
        const placeGuess = await fetchPlaceName( coords.latitude, coords.longitude );
        setLatLng( {
          place_guess: placeGuess,
          latitude: coords.latitude,
          longitude: coords.longitude,
          positional_accuracy: coords.accuracy
        } );
      };

      // TODO: set geolocation fetch error
      const failure = error => console.log( error.code, error.message );

      const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 };

      Geolocation.getCurrentPosition( success, failure, options );
    };
    fetchLocation( );

    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return latLng;
};

export default useUserLocation;
