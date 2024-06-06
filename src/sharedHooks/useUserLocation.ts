import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer";
import { useEffect, useState } from "react";
import {
  checkMultiple,
  Permission,
  RESULTS
} from "react-native-permissions";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";

// Max time to wait while fetching current location
const CURRENT_LOCATION_TIMEOUT_MS = 30000;

interface UserLocation {
  name?: string,
  latitude: number,
  longitude: number,
  accuracy?: number
}

interface UserLocationResponse {
  userLocation?: UserLocation,
  isLoading: boolean
}

function useUserLocation(
  options?: {
    skipName?: boolean,
    permissionsGranted?: boolean
  }
): UserLocationResponse {
  const {
    skipName = false,
    permissionsGranted: permissionsGrantedProp = false
  } = options || {};
  const [userLocation, setUserLocation] = useState<UserLocation | undefined>( undefined );
  const [isLoading, setIsLoading] = useState( true );
  const [permissionsGranted, setPermissionsGranted] = useState( permissionsGrantedProp );
  const [permissionsChecked, setPermissionsChecked] = useState( false );

  useEffect( ( ) => {
    if ( permissionsGrantedProp === true && permissionsGranted === false ) {
      setPermissionsGranted( true );
    }
  }, [permissionsGranted, permissionsGrantedProp] );

  useEffect( ( ) => {
    async function checkPermissions() {
      const permissionsResult = permissionResultFromMultiple(
        await checkMultiple( LOCATION_PERMISSIONS as Permission[] )
      );
      if ( permissionsResult === RESULTS.GRANTED ) {
        setPermissionsGranted( true );
      } else {
        console.warn(
          "Location permissions have not been granted. You probably need to use a PermissionGate"
        );
      }
      setPermissionsChecked( true );
    }
    checkPermissions( );
  }, [] );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLocation = async ( ) => {
      setIsLoading( true );

      const success = async ( position: GeolocationResponse ) => {
        if ( !isCurrent ) { return; }
        const { coords } = position;
        let locationName;
        if ( !skipName ) {
          locationName = await fetchPlaceName( coords.latitude, coords.longitude );
        }
        setUserLocation( {
          name: locationName || undefined,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy
        } );
        setIsLoading( false );
      };

      // TODO: set geolocation fetch error
      const failure = ( error: GeolocationError ) => {
        console.warn( `useUserLocation: ${error.message} (${error.code})` );
        setIsLoading( false );
      };

      const gcpOptions = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: CURRENT_LOCATION_TIMEOUT_MS
      };

      Geolocation.getCurrentPosition( success, failure, gcpOptions );
    };

    if ( permissionsGranted ) {
      fetchLocation( );
    } else if ( permissionsChecked ) {
      setIsLoading( false );
    }

    return ( ) => {
      isCurrent = false;
    };
  }, [
    permissionsChecked,
    permissionsGranted,
    skipName
  ] );

  return {
    userLocation,
    isLoading
  };
}

export default useUserLocation;
