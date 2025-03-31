// This wraps the Geolocation methods we use so we can mock them for e2e tests
// that tend to have problems with locations and timezones

import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";

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
