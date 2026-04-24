import type {
  GeolocationError,
  GeolocationResponse,
} from "@react-native-community/geolocation";
import { useNavigation } from "@react-navigation/native";
import { hasOnlyCoarseLocation } from "components/SharedComponents/PermissionGateContainer";
import { useCallback, useEffect, useRef, useState } from "react";

// Please don't change this to an aliased path or the e2e mock will not get
// used in our e2e tests on Github Actions
import {
  clearWatch,
  getCurrentPositionWithOptions,
  lowAccuracyOptions,
  watchPosition,
} from "../sharedHelpers/geolocationWrapper";

export const TARGET_POSITIONAL_ACCURACY = 10;
const MAX_POSITION_AGE_MS = 60_000;

export interface UserLocation {
  latitude: number;
  longitude: number;
  positional_accuracy: number;
  altitude: number | null;
  altitudinal_accuracy: number | null;
}

const fineGeolocationOptions = {
  distanceFilter: 0,
  enableHighAccuracy: true,
  maximumAge: 0,
};

function toUserLocation( position: GeolocationResponse ): UserLocation {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    positional_accuracy: position.coords.accuracy,
    altitude: position.coords.altitude,
    altitudinal_accuracy: position.coords.altitudeAccuracy,
  };
}

const useWatchPosition = ( options: {
  shouldFetchLocation: boolean;
} ) => {
  const navigation = useNavigation( );
  const [subscriptionId, setSubscriptionId] = useState<number | null>( null );
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );
  const [isFetchingLocation, setIsFetchingLocation] = useState( false );
  const { shouldFetchLocation } = options;

  // Track whether we've already kicked off a fetch for the current
  // shouldFetchLocation=true cycle so the effect doesn't re-fire.
  const fetchStartedRef = useRef( false );

  const stopWatch = useCallback( ( id: number ) => {
    clearWatch( id );
    setSubscriptionId( null );
  }, [] );

  // Single effect: when shouldFetchLocation becomes true, check the
  // permission type once and pick the right strategy.
  //
  // Coarse-only: one getCurrentPosition call, set userLocation, done.
  // Fine:        start watchPosition, update userLocation on each fix,
  //              stop when accuracy target is met.
  useEffect( ( ) => {
    if ( !shouldFetchLocation ) {
      fetchStartedRef.current = false;
      return;
    }
    if ( fetchStartedRef.current ) return;
    fetchStartedRef.current = true;

    let cancelled = false;
    setIsFetchingLocation( true );

    ( async () => {
      const coarseOnly = await hasOnlyCoarseLocation();
      if ( cancelled ) return;

      if ( coarseOnly ) {
        // Coarse-only: fetch once. watchPosition doesn't reliably deliver
        // updates via the Fused Location Provider with coarse-only on Android.
        try {
          const position = await getCurrentPositionWithOptions( lowAccuracyOptions );
          if ( !cancelled ) {
            setUserLocation( toUserLocation( position ) );
          }
        } catch ( error ) {
          console.warn( "useWatchPosition coarse fetch error: ", error );
        }
        if ( !cancelled ) setIsFetchingLocation( false );
        return;
      }

      // Fine location: watch until accuracy target is met
      try {
        const watchID = watchPosition(
          ( position: GeolocationResponse ) => {
            if ( cancelled ) return;
            const age = Date.now() - position.timestamp;
            if ( age > MAX_POSITION_AGE_MS ) return;

            setUserLocation( toUserLocation( position ) );

            if ( position.coords.accuracy < TARGET_POSITIONAL_ACCURACY ) {
              clearWatch( watchID );
              setSubscriptionId( null );
              setIsFetchingLocation( false );
            }
          },
          ( error: GeolocationError ) => {
            console.warn( "useWatchPosition error: ", error );
            clearWatch( watchID );
            setSubscriptionId( null );
            setIsFetchingLocation( false );
          },
          fineGeolocationOptions,
        );
        if ( typeof ( watchID ) !== "number" ) {
          throw new Error( "watchPosition failed to return a watchID" );
        }
        if ( !cancelled ) {
          setSubscriptionId( watchID );
        } else {
          clearWatch( watchID );
        }
      } catch ( error ) {
        console.warn( "useWatchPosition start error: ", error );
        if ( !cancelled ) setIsFetchingLocation( false );
      }
    } )();

    return ( ) => {
      cancelled = true;
    };
  // shouldFetchLocation is the only meaningful trigger. The ref prevents
  // re-firing when other renders happen while it's true.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchLocation] );

  // Clean up watch and reset location when leaving the screen
  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      if ( subscriptionId !== null ) {
        stopWatch( subscriptionId );
      }
      setUserLocation( null );
      setIsFetchingLocation( false );
      fetchStartedRef.current = false;
    } );
    return unsubscribe;
  }, [navigation, stopWatch, subscriptionId] );

  return {
    isFetchingLocation,
    stopWatch,
    subscriptionId,
    userLocation,
  };
};

export default useWatchPosition;
