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

const getCurrentPosition = ( ): Promise<GeolocationResponse> => new Promise(
  ( resolve, error ) => {
    Geolocation.getCurrentPosition( resolve, error, options );
  }
);

interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
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
      positional_accuracy: coords.accuracy
    };
    return userLocation;
  } catch ( e ) {
    console.warn( e, "couldn't get latLng" );
  }
  return null;
};

export default fetchCoarseUserLocation;
