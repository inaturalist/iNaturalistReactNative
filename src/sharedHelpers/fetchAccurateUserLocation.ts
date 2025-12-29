// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import {
  checkLocationPermissions,
  getCurrentPositionWithOptions,
  highAccuracyOptions,
  lowAccuracyOptions,
} from "./geolocationWrapper";

interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
  altitude: number | null;
  altitudinal_accuracy: number | null;
}

const fetchAccurateUserLocation = async (): Promise<UserLocation | null> => {
  const permissionResult = await checkLocationPermissions( );
  if ( permissionResult === null ) {
    return null;
  }

  try {
    const highAccuracyResult = await getCurrentPositionWithOptions( highAccuracyOptions )
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
        altitudinal_accuracy: highAccuracyResult.coords.altitudeAccuracy,
      };
    }

    const lowAccuracyResult = await getCurrentPositionWithOptions( lowAccuracyOptions, 2 );

    return {
      latitude: lowAccuracyResult.coords.latitude,
      longitude: lowAccuracyResult.coords.longitude,
      positional_accuracy: lowAccuracyResult.coords.accuracy,
      altitude: lowAccuracyResult.coords.altitude,
      altitudinal_accuracy: lowAccuracyResult.coords.altitudeAccuracy,
    };
  } catch ( e ) {
    console.warn( "All location attempts failed:", e );
  }

  return null;
};

export default fetchAccurateUserLocation;
