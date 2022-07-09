// @flow

import { Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS } from "react-native-permissions";
import fetchPlaceName from "./fetchPlaceName";

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

const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 };

const getCurrentPosition = ( ) => new Promise(
  ( resolve, error ) => { Geolocation.getCurrentPosition( resolve, error, options ); }
);

const fetchUserLocation = async ( ): ?Object => {
  const permissions = await requestiOSPermissions( );
  // TODO: handle case where iOS permissions are not granted
  if ( permissions !== "granted" ) { return null; }

  try {
    const { coords } = await getCurrentPosition( );
    const placeGuess = await fetchPlaceName( coords.latitude, coords.longitude );
    return {
      place_guess: placeGuess,
      latitude: coords.latitude,
      longitude: coords.longitude,
      positional_accuracy: coords.accuracy
    };
  } catch ( e ) {
    console.log( e, "couldn't get latLng" );
  }
  return null;
};

export default fetchUserLocation;
