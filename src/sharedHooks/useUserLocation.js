// @flow

import Geolocation from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer";
import { useEffect, useState } from "react";
import {
  checkMultiple, RESULTS
} from "react-native-permissions";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";

// Max time to wait while fetching current location
const CURRENT_LOCATION_TIMEOUT_MS = 30000;

const useUserLocation = ( {
  skipPlaceGuess = false,
  permissionsGranted: permissionsGrantedProp = false
}: object ): object => {
  const [latLng, setLatLng] = useState( null );
  const [isLoading, setIsLoading] = useState( true );
  const [permissionsGranted, setPermissionsGranted] = useState( permissionsGrantedProp );

  useEffect( ( ) => {
    if ( permissionsGrantedProp === true && permissionsGranted === false ) {
      setPermissionsGranted( true );
    }
  }, [permissionsGranted, permissionsGrantedProp] );

  useEffect( ( ) => {
    async function checkPermissions() {
      const permissionsResult = permissionResultFromMultiple(
        await checkMultiple( LOCATION_PERMISSIONS )
      );
      if ( permissionsResult === RESULTS.GRANTED ) {
        setPermissionsGranted( true );
      } else {
        console.warn(
          "Location permissions have not been granted. You probably need to use a PermissionGate"
        );
      }
    }
    checkPermissions( );
  }, [] );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchLocation = async ( ) => {
      setIsLoading( true );

      const success = async ( { coords } ) => {
        if ( !isCurrent ) { return; }
        let placeGuess = null;
        if ( !skipPlaceGuess ) {
          placeGuess = await fetchPlaceName( coords.latitude, coords.longitude );
        }
        setLatLng( {
          place_guess: placeGuess,
          latitude: coords.latitude,
          longitude: coords.longitude,
          positional_accuracy: coords.accuracy
        } );
        setIsLoading( false );
      };

      // TODO: set geolocation fetch error
      const failure = error => {
        console.warn( `useUserLocation: ${error.message} (${error.code})` );
        setIsLoading( false );
      };

      const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: CURRENT_LOCATION_TIMEOUT_MS
      };

      Geolocation.getCurrentPosition( success, failure, options );
    };

    if ( permissionsGranted ) {
      fetchLocation( );
    } else {
      setIsLoading( false );
    }

    return ( ) => {
      isCurrent = false;
    };
  }, [permissionsGranted, skipPlaceGuess] );

  return {
    latLng,
    isLoading
  };
};

export default useUserLocation;
