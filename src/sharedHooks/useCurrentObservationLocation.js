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

// Primarily fetches the current location for a new observation and returns
// isFetchingLocation to tell the consumer whether this process is happening.
// If currentObservation is not new, it will not fetch location and return
// information about the current observation's location
const useCurrentObservationLocation = ( mountedRef: any ): Object => {
  const {
    currentObservation,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;
  const hasLocation = latitude || longitude;
  const originalPhotoUri = currentObservation?.observationPhotos
    && currentObservation?.observationPhotos[0]?.originalPhotoUri;
  const isGalleryPhoto = originalPhotoUri && !originalPhotoUri?.includes( "photoUploads" );

  const [shouldFetchLocation, setShouldFetchLocation] = useState(
    currentObservation
      && !currentObservation?._created_at
      && !currentObservation?._synced_at
      && !hasLocation
      && !isGalleryPhoto
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

      setFetchingLocation( false );

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
    positionalAccuracy: currentObservation?.positional_accuracy,
    hasLocation,
    // Internally we're tracking isFetching when one of potentially many
    // location requests is in flight, but this tells the external consumer
    // whether the overall location fetching process is happening
    isFetchingLocation: shouldFetchLocation
  };
};

export default useCurrentObservationLocation;
