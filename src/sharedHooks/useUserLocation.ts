import Geolocation, {
  GeolocationError,
  GeolocationResponse
} from "@react-native-community/geolocation";
import {
  LOCATION_PERMISSIONS,
  permissionResultFromMultiple
} from "components/SharedComponents/PermissionGateContainer.tsx";
import { useEffect, useRef, useState } from "react";
import {
  checkMultiple,
  Permission,
  RESULTS
} from "react-native-permissions";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
// import { log } from "sharedHelpers/logger";

// const logger = log.extend( "userUserLocation" );

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
    enabled?: boolean,
    skipName?: boolean,
    permissionsGranted?: boolean,
    untilAcc?: number | undefined
  }
): UserLocationResponse {
  const {
    enabled: enabledOpt,
    skipName = false,
    permissionsGranted: permissionsGrantedProp = false,
    untilAcc
  } = options || {};
  const enabled = enabledOpt !== false;
  const [userLocation, setUserLocation] = useState<UserLocation | undefined>( undefined );
  // logger.debug( `userLocation?.latitude: ${userLocation?.latitude}` );
  const [isLoading, setIsLoading] = useState( true );
  const [permissionsGranted, setPermissionsGranted] = useState( permissionsGrantedProp );
  const [permissionsChecked, setPermissionsChecked] = useState( false );
  const fetchingLocation = useRef<Boolean>( false );
  const [accGoodEnough, setAccGoodEnough] = useState( false );

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
    const fetchLocation = async ( ) => {
      fetchingLocation.current = true;
      setIsLoading( true );

      const success = async ( position: GeolocationResponse ) => {
        // logger.debug(
        //   `getCurrentPosition success, position?.coords?.latitude: ${position?.coords?.latitude}`
        // );
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
        fetchingLocation.current = false;
        setAccGoodEnough( true );
        if ( typeof ( untilAcc ) === "number" && coords?.accuracy && coords?.accuracy > untilAcc ) {
          setTimeout( ( ) => setAccGoodEnough( false ), 1000 );
        }
      };

      // TODO: set geolocation fetch error
      const failure = ( error: GeolocationError ) => {
        console.warn( `useUserLocation: ${error.message} (${error.code})` );
        setIsLoading( false );
        fetchingLocation.current = false;
        setAccGoodEnough( true );
      };

      const gcpOptions = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: CURRENT_LOCATION_TIMEOUT_MS
      };

      // TODO refactor to use fetchUserLocation, which is promise-ified and
      // mockable in an e2e context
      Geolocation.getCurrentPosition( success, failure, gcpOptions );
    };

    if ( permissionsChecked && !permissionsGranted ) {
      setIsLoading( false );
      fetchingLocation.current = false;
    } else if (
      // we have permission
      permissionsGranted
      // and we're not already fetching
      && !fetchingLocation.current
      // and we're not waiting OR we are and acc is above threshold
      && !accGoodEnough
      && enabled
    ) {
      fetchingLocation.current = true;
      fetchLocation( );
    }
  }, [
    accGoodEnough,
    enabled,
    permissionsChecked,
    permissionsGranted,
    skipName,
    untilAcc
  ] );

  // When the consumer tells us we no longer need to fetch location, reset the
  // user location so it's not stale the next time we need to fetch
  useEffect( ( ) => {
    // logger.debug( "enabled effect" );
    if ( enabled === false ) {
      // logger.debug( "enabled effect, disabled resetting" );
      setUserLocation( undefined );
      setAccGoodEnough( false );
    }
  }, [enabled] );

  return {
    userLocation,
    isLoading
  };
}

export default useUserLocation;
