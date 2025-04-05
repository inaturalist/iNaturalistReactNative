// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import {
  checkLocationPermissions,
  getCurrentPositionWithOptions,
  lowAccuracyOptions
} from "./geolocationWrapper";

interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
  altitude: number | null;
  altitudinal_accuracy: number | null;
}

const fetchCoarseUserLocation = async ( ): Promise<UserLocation | null> => {
  const permissionResult = await checkLocationPermissions( );
  if ( permissionResult === null ) {
    return null;
  }

  try {
    const { coords } = await getCurrentPositionWithOptions( lowAccuracyOptions );
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
