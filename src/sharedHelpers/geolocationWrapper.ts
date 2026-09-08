// This wraps the Geolocation methods we use so we can mock them for e2e tests
// that tend to have problems with locations and timezones

import type {
  GeolocationError,
  GeolocationOptions,
  GeolocationResponse,
} from "@react-native-community/geolocation";
import Geolocation from "@react-native-community/geolocation";
import { Platform } from "react-native";
import {
  checkMultiple,
  RESULTS,
} from "react-native-permissions";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple,
} from "sharedHelpers/permissions";

export function getCurrentPosition(
  success: ( position: GeolocationResponse ) => void,
  error?: ( error: GeolocationError ) => void,
  options?: GeolocationOptions,
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
  },
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
// we also need to provide Android a max age here which can impact `getLastLocation` calls
const ANDROID_MAXIMUM_AGE_MS = 5000;

export const highAccuracyOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: Platform.OS === "ios"
    ? 0
    : ANDROID_MAXIMUM_AGE_MS,
} as const;

export const lowAccuracyOptions = {
  enableHighAccuracy: false,
  timeout: 2000,
  maximumAge: Platform.OS === "ios"
    ? 0
    : ANDROID_MAXIMUM_AGE_MS,
} as const;

export const getCurrentPositionWithOptions = (
  options: GeolocationOptions,
): Promise<GeolocationResponse> => new Promise(
  ( resolve, reject ) => {
    getCurrentPosition( resolve, reject, options );
  },
);

export const checkLocationPermissions = async ( ) => {
  const permissionResult = permissionResultFromMultiple(
    await checkMultiple( LOCATION_PERMISSIONS ),
  );

  if ( permissionResult !== RESULTS.GRANTED ) {
    return null;
  }
  return permissionResult;
};
