import Geolocation, { GeolocationResponse } from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer.tsx";
import { Platform } from "react-native";
import {
  checkMultiple,
  RESULTS
} from "react-native-permissions";

const options = {
  enableHighAccuracy: false,
  timeout: 2000,
  // Setting maximumAge to 0 always causes errors on Android.
  // Therefore, we conditionally apply it only if the platform is iOS.
  ...( Platform.OS === "ios" && { maximumAge: 0 } )
} as const;

// Issue reference for getCurrentPosition bug on Android:
// Known bug in react-native-geolocation: getCurrentPosition does not work on
// Android when enableHighAccuracy: true and maximumAge: 0.
// See: https://github.com/michalchudziak/react-native-geolocation/issues/272
// Added OS-specific conditions to handle this issue and make it work properly on Android.
const getCurrentPosition = ( ): Promise<GeolocationResponse> => new Promise(
  ( resolve, error ) => {
    Geolocation.getCurrentPosition( resolve, error, options );
  }
);

interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
  altitude: number | null;
  altitudinal_accuracy: number | null;
}

const fetchCoarseUserLocation = async ( ): Promise<UserLocation | null> => {
  const permissionResult = permissionResultFromMultiple(
    await checkMultiple( LOCATION_PERMISSIONS )
  );

  // TODO: handle case where iOS permissions are not granted
  if ( Platform.OS !== "android" && permissionResult !== RESULTS.GRANTED ) {
    return null;
  }

  try {
    const { coords } = await getCurrentPosition( );
    const userLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      positional_accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudinal_accuracy: coords.altitudeAccuracy
    };
    return userLocation;
  } catch ( e ) {
    console.warn( e, "couldn't get latLng" );
  }
  return null;
};

export default fetchCoarseUserLocation;
