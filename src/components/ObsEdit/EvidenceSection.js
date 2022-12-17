// @flow

import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";

import DatePicker from "./DatePicker";

type Props = {
  handleSelection: Function,
  photoUris: Array<string>,
  handleAddEvidence?: Function
}

const INITIAL_POSITIONAL_ACCURACY = 99999;
const TARGET_POSITIONAL_ACCURACY = 10;

const EvidenceSection = ( {
  handleSelection,
  handleAddEvidence,
  photoUris
}: Props ): Node => {
  const {
    currentObservation,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const mountedRef = useRef( true );

  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;
  const hasLocation = latitude || longitude;

  const [shouldFetchLocation, setShouldFetchLocation] = useState(
    currentObservation
    && !currentObservation._created_at
    && !currentObservation._synced_at
    && !hasLocation
  );
  const [fetchingLocation, setFetchingLocation] = useState( false );
  const [positionalAccuracy, setPositionalAccuracy] = useState( INITIAL_POSITIONAL_ACCURACY );
  const [lastLocationFetchTime, setLastLocationFetchTime] = useState( 0 );

  const formatDecimal = coordinate => coordinate && coordinate.toFixed( 6 );

  // Hook version of componentWillUnmount. We use a ref to track mounted
  // state (not useState, which might get frozen in a closure for other
  // useEffects), and set it to false in the cleanup cleanup function. The
  // effect has an empty dependency array so it should only run when the
  // component mounts and when it unmounts, unlike in the cleanup effects of
  // other hooks, which will run when any of there dependency values change,
  // and maybe even before other hooks execute. If we ever need to do this
  // again we could probably wrap this into its own hook, like useMounted
  // ( ).
  useEffect( ( ) => {
    mountedRef.current = true;
    return function cleanup( ) {
      mountedRef.current = false;
    };
  }, [] );

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
    };

    if (
      // If we're already fetching we don't need to fetch again
      !fetchingLocation
      // We only need to fetch when we're above the target
      && positionalAccuracy >= TARGET_POSITIONAL_ACCURACY
      // Don't fetch location more than once a second
      && Date.now() - lastLocationFetchTime >= 1000
    ) {
      setFetchingLocation( true );
      setLastLocationFetchTime( Date.now() );
      fetchLocation();
    } else {
      setShouldFetchLocation( false );
    }
  }, [
    currentObservation,
    fetchingLocation,
    positionalAccuracy,
    setFetchingLocation,
    setShouldFetchLocation,
    shouldFetchLocation,
    updateObservationKeys,
    lastLocationFetchTime,
    setLastLocationFetchTime
  ] );

  const displayLocation = ( ) => {
    let location = "";
    if ( latitude ) {
      location += `Lat: ${formatDecimal( latitude )}`;
    }
    if ( longitude ) {
      location += `, Lon: ${formatDecimal( longitude )}`;
    }
    if ( currentObservation.positional_accuracy ) {
      location += `, Acc: ${formatDecimal( currentObservation.positional_accuracy )}`;
    }
    return location;
  };

  return (
    <View className="mx-5">
      <PhotoCarousel
        photoUris={photoUris}
        setSelectedPhotoIndex={handleSelection}
        showAddButton
        handleAddEvidence={handleAddEvidence}
      />
      <Text>{currentObservation.place_guess}</Text>
      <Text>{displayLocation( ) || t( "No-Location" )}</Text>
      <DatePicker currentObservation={currentObservation} />
    </View>
  );
};

export default EvidenceSection;
