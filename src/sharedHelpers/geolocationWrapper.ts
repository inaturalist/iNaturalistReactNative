// This wraps the Geolocation methods we use so we can mock them for e2e tests
// that tend to have problems with locations and timezones

import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";

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
  const watchID = Geolocation.watchPosition( success, error, options );
  console.log( "[DEBUG geolocationWrapper.ts] watchPosition, watchID: ", watchID );
  return watchID;
}

export function clearWatch( watchID: number ) {
  Geolocation.clearWatch( watchID );
}
