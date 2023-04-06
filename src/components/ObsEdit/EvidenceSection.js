// @flow

import {
  Body3, Body4, Heading4, INatIcon
} from "components/SharedComponents";
import { ActivityIndicator, View } from "components/styledComponents";
import {
  differenceInCalendarYears,
  isFuture,
  parseISO
} from "date-fns";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useRef, useState
} from "react";
import { useTheme } from "react-native-paper";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";

import DatePicker from "./DatePicker";
import EvidenceList from "./EvidenceList";

type Props = {
  handleSelection: Function,
  photoUris: Array<string>,
  handleAddEvidence?: Function
}

const INITIAL_POSITIONAL_ACCURACY = 99999;
const TARGET_POSITIONAL_ACCURACY = 10;
const LOCATION_FETCH_INTERVAL = 1000;

const EvidenceSection = ( {
  handleSelection,
  handleAddEvidence,
  photoUris
}: Props ): Node => {
  const theme = useTheme( );
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
  const [numLocationFetches, setNumLocationFetches] = useState( 0 );
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
    updateObservationKeys
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
      location += `, Acc: ${currentObservation.positional_accuracy.toFixed( 0 )}`;
    }
    return location;
  };

  const hasValidLocation = ( ) => {
    if ( hasLocation
      && ( latitude !== 0 && longitude !== 0 )
      && ( latitude >= -90 && latitude <= 90 )
      && ( longitude >= -180 && longitude <= 180 )
      && (
        currentObservation.positional_accuracy > 0
        && currentObservation.positional_accuracy <= 4000 )
    ) {
      return true;
    }
    return false;
  };

  const hasValidDate = ( ) => {
    const observationDate = parseISO( currentObservation?.observed_on_string );
    if ( observationDate
      && !isFuture( observationDate )
      && differenceInCalendarYears( observationDate, new Date( ) ) <= 130
    ) {
      return true;
    }
    return false;
  };

  const passesEvidenceTest = ( ) => {
    if ( shouldFetchLocation ) {
      return null;
    }
    if ( hasValidLocation( ) && hasValidDate( ) ) {
      return true;
    }
    return false;
  };

  return (
    <View className="mx-6 mt-6">
      <View className="flex-row">
        <Heading4>{t( "EVIDENCE" )}</Heading4>
        <View className="ml-3">
          {passesEvidenceTest( ) && (
            <INatIcon name="checkmark-circle" size={19} color={theme.colors.secondary} />
          )}
          {passesEvidenceTest( ) === false && (
            <INatIcon name="triangle-exclamation" size={19} color={theme.colors.error} />
          )}
        </View>
      </View>
      <EvidenceList
        photoUris={photoUris}
        setSelectedPhotoIndex={handleSelection}
        handleAddEvidence={handleAddEvidence}
      />
      <View className="flex-row flex-nowrap my-4">
        <INatIcon size={14} name="map-marker-outline" />
        <View className="ml-5">
          <Body3>{currentObservation.place_guess}</Body3>
          {shouldFetchLocation && <ActivityIndicator className="mx-1" />}
          {shouldFetchLocation && <Body4 className="mx-1">{`(${numLocationFetches})`}</Body4>}
          <Body4>{displayLocation( ) || t( "No-Location" )}</Body4>
        </View>
      </View>
      <DatePicker currentObservation={currentObservation} />
    </View>
  );
};

export default EvidenceSection;
