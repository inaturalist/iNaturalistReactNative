// @flow

import { ObsEditContext } from "providers/contexts";
import {
  useContext,
  useEffect, useState
} from "react";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";

const INITIAL_POSITIONAL_ACCURACY = 99999;
const TARGET_POSITIONAL_ACCURACY = 10;
const LOCATION_FETCH_INTERVAL = 1000;

const useLocationFetching = ( mountedRef: any ): Object => {
  const {
    currentObservation,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;
  const hasLocation = latitude || longitude;

  const [shouldFetchLocation, setShouldFetchLocation] = useState(
    currentObservation
        && !currentObservation._created_at
        && !currentObservation._synced_at
        && !hasLocation
  );
  const [numLocationFetches, setNumLocationFetches] = useState( 0 );
  const [fetchingLocation, setFetchingLocation] = useState( false );
  const [positionalAccuracy, setPositionalAccuracy] = useState( INITIAL_POSITIONAL_ACCURACY );
  const [lastLocationFetchTime, setLastLocationFetchTime] = useState( 0 );

  useEffect( ( ) => {
    if ( !currentObservation ) return;
    if ( !shouldFetchLocation ) return;
    if ( fetchingLocation ) return;

    const fetchLocation = async () => {
      // If the component is gone, you won't be able to updated it
      if ( !mountedRef.current ) return;
      if ( !shouldFetchLocation ) return;

      setFetchingLocation( false );

      const location = await fetchUserLocation( );

      // If we're still receiving location updates and location is blank,
      // then we don't know where we are any more and the obs should update
      // to reflect that
      updateObservationKeys( {
        place_guess: location?.place_guess,
        latitude: location?.latitude,
        longitude: location?.longitude,
        positional_accuracy: location?.positional_accuracy
      } );

      // The local state version of positionalAccuracy needs to be a number,
      // so don't set it to
      const newPositionalAccuracy = location?.positional_accuracy || INITIAL_POSITIONAL_ACCURACY;
      setPositionalAccuracy( newPositionalAccuracy );
      if ( newPositionalAccuracy > TARGET_POSITIONAL_ACCURACY ) {
        // This is just here to make absolutely sure the effect runs again in a second
        setTimeout(
          ( ) => setNumLocationFetches( numFetches => numFetches + 1 ),
          LOCATION_FETCH_INTERVAL
        );
      }
    };

    if (
      // If we're already fetching we don't need to fetch again
      !fetchingLocation
      // We only need to fetch when we're above the target
      && positionalAccuracy >= TARGET_POSITIONAL_ACCURACY
      // Don't fetch location more than once a second
      && Date.now() - lastLocationFetchTime >= LOCATION_FETCH_INTERVAL
    ) {
      setFetchingLocation( true );
      setLastLocationFetchTime( Date.now() );
      fetchLocation( );
    } else if ( positionalAccuracy < TARGET_POSITIONAL_ACCURACY ) {
      setShouldFetchLocation( false );
    }
  }, [
    currentObservation,
    fetchingLocation,
    lastLocationFetchTime,
    numLocationFetches,
    positionalAccuracy,
    setFetchingLocation,
    setLastLocationFetchTime,
    setNumLocationFetches,
    setShouldFetchLocation,
    shouldFetchLocation,
    updateObservationKeys,
    mountedRef
  ] );

  return {
    latitude,
    longitude,
    hasLocation,
    shouldFetchLocation,
    numLocationFetches
  };
};

export default useLocationFetching;
