import { GeolocationResponse } from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer.tsx";
import { Platform } from "react-native";
import {
  checkMultiple,
  RESULTS
} from "react-native-permissions";

// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import { getCurrentPosition } from "./geolocationWrapper";

const highAccuracyOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  // Apply maximumAge only on iOS to avoid Android issues
  ...( Platform.OS === "ios" && { maximumAge: 0 } )
} as const;

export const lowAccuracyOptions = {
  enableHighAccuracy: false,
  timeout: 2000,
  // Apply maximumAge only on iOS to avoid Android issues
  ...( Platform.OS === "ios" && { maximumAge: 0 } )
} as const;

const getCurrentPositionWithOptions = (
  options: typeof highAccuracyOptions
): Promise<GeolocationResponse> => new Promise(
  ( resolve, reject ) => {
    getCurrentPosition( resolve, reject, options );
  }
);

const getPositionWithRetries = async (
  options: typeof highAccuracyOptions | typeof lowAccuracyOptions,
  retriesLeft = 3,
  attempt = 1
): Promise<GeolocationResponse> => {
  try {
    return await getCurrentPositionWithOptions( options );
  } catch ( error ) {
    console.warn( `Location attempt ${attempt}/${attempt + retriesLeft - 1} failed:`, error );

    if ( retriesLeft <= 1 ) {
      throw error;
    }

    await new Promise<void>( resolve => {
      setTimeout( () => { resolve(); }, 1000 );
    } );

    return getPositionWithRetries( options, retriesLeft - 1, attempt + 1 );
  }
};

interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
  altitude: number | null;
  altitudinal_accuracy: number | null;
}

const fetchAccurateUserLocation = async (): Promise<UserLocation | null> => {
  const permissionResult = permissionResultFromMultiple(
    await checkMultiple( LOCATION_PERMISSIONS )
  );

  if ( Platform.OS !== "android" && permissionResult !== RESULTS.GRANTED ) {
    console.warn( "Location permissions not granted" );
    return null;
  }

  try {
    const highAccuracyResult = await getPositionWithRetries( highAccuracyOptions )
      .catch( error => {
        console.warn( "High accuracy location failed, falling back to low accuracy", error );
        return null;
      } );

    if ( highAccuracyResult ) {
      return {
        latitude: highAccuracyResult.coords.latitude,
        longitude: highAccuracyResult.coords.longitude,
        positional_accuracy: highAccuracyResult.coords.accuracy,
        altitude: highAccuracyResult.coords.altitude,
        altitudinal_accuracy: highAccuracyResult.coords.altitudeAccuracy
      };
    }

    const lowAccuracyResult = await getPositionWithRetries( lowAccuracyOptions, 2 );

    return {
      latitude: lowAccuracyResult.coords.latitude,
      longitude: lowAccuracyResult.coords.longitude,
      positional_accuracy: lowAccuracyResult.coords.accuracy,
      altitude: lowAccuracyResult.coords.altitude,
      altitudinal_accuracy: lowAccuracyResult.coords.altitudeAccuracy
    };
  } catch ( e ) {
    console.warn( "All location attempts failed:", e );
  }

  return null;
};

export default fetchAccurateUserLocation;
