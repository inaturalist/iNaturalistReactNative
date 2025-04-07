// This wraps the Geolocation methods we use so we can mock them for e2e tests
// that tend to have problems with locations and timezones

import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer.tsx";
import { Platform } from "react-native";
import {
  checkMultiple,
  RESULTS
} from "react-native-permissions";

export function getCurrentPosition(
  success: ( position: GeolocationResponse ) => void,
  error?: ( error: GeolocationError ) => void,
  options?: {
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
  }
) {
  return Geolocation.getCurrentPosition( success, error, options );
}

export function watchPosition(
  success: ( position: GeolocationResponse ) => void,
  error?: ( error: GeolocationError ) => void,
  options?: {
    interval?: number;
    fastestInterval?: number;
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
    distanceFilter?: number;
    useSignificantChanges?: boolean;
  }
) {
  return Geolocation.watchPosition( success, error, options );
}

export function clearWatch( watchID: number ) {
  Geolocation.clearWatch( watchID );
}

// Issue reference for getCurrentPosition bug on Android:
// Known bug in react-native-geolocation: getCurrentPosition does not work on
// Android when enableHighAccuracy: true and maximumAge: 0.
// See: https://github.com/michalchudziak/react-native-geolocation/issues/272
// Added OS-specific conditions to both options below
// to handle this issue and make it work properly on Android.
export const highAccuracyOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  ...( Platform.OS === "ios" && { maximumAge: 0 } )
} as const;

export const lowAccuracyOptions = {
  enableHighAccuracy: false,
  timeout: 2000,
  ...( Platform.OS === "ios" && { maximumAge: 0 } )
} as const;

export const getCurrentPositionWithOptions = (
  options
): Promise<GeolocationResponse> => new Promise(
  ( resolve, reject ) => {
    getCurrentPosition( resolve, reject, options );
  }
);

export const checkLocationPermissions = async ( ) => {
  const permissionResult = permissionResultFromMultiple(
    await checkMultiple( LOCATION_PERMISSIONS )
  );

  // TODO: handle case where iOS permissions are not granted
  if ( Platform.OS !== "android" && permissionResult !== RESULTS.GRANTED ) {
    return null;
  }
  return permissionResult;
};
