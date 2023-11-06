// @flow

import Geolocation from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer";
import { Platform } from "react-native";
import { checkMultiple, RESULTS } from "react-native-permissions";

import fetchPlaceName from "./fetchPlaceName";

const options = {
  enableHighAccuracy: true,
  maximumAge: 0
};

const getCurrentPosition = ( ) => new Promise(
  ( resolve, error ) => {
    Geolocation.getCurrentPosition( resolve, error, options );
  }
);

type UserLocation = {
  latitude: number,
  longitude: number,
  positional_accuracy: number,
  place_guess: ?string

}
const fetchUserLocation = async ( ): Promise<?UserLocation> => {
  // const permissions = await checkLocationPermissions( );
  const permissionResult = permissionResultFromMultiple(
    await checkMultiple( LOCATION_PERMISSIONS )
  );

  // TODO: handle case where iOS permissions are not granted
  if ( Platform.OS !== "android" && permissionResult !== RESULTS.GRANTED ) {
    return null;
  }

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
    console.warn( e, "couldn't get latLng" );
  }
  return null;
};

export default fetchUserLocation;
