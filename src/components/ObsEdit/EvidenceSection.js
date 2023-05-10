// @flow

import { useNavigation } from "@react-navigation/native";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera";
import {
  Body3, Body4, Heading4, INatIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import {
  differenceInCalendarYears,
  isFuture,
  parseISO
} from "date-fns";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext, useEffect, useRef, useState
} from "react";
import { useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";
import useLocationFetching from "sharedHooks/useLocationFetching";
import useTranslation from "sharedHooks/useTranslation";

import DatePicker from "./DatePicker";
import EvidenceList from "./EvidenceList";
import AddEvidenceSheet from "./Sheets/AddEvidenceSheet";

const DESIRED_LOCATION_ACCURACY = 4000000;

const EvidenceSection = ( ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const {
    currentObservation,
    setPassesEvidenceTest
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos ? Array.from( obsPhotos ).map(
    obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
  ) : [];
  const mountedRef = useRef( true );
  const navigation = useNavigation( );

  const navToLocationPicker = ( ) => {
    navigation.navigate( "LocationPicker", { goBackOnSave: true } );
  };

  const [showAddEvidenceSheet, setShowAddEvidenceSheet] = useState( false );
  const handleAddEvidence = ( ) => setShowAddEvidenceSheet( true );

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

  const {
    latitude,
    longitude,
    hasLocation,
    shouldFetchLocation
  } = useLocationFetching( mountedRef );

  const displayPlaceName = ( ) => {
    let placeName = "";
    if ( currentObservation.place_guess ) {
      placeName = currentObservation.place_guess;
    } else if ( shouldFetchLocation ) {
      placeName = t( "Fetching-location" );
    }
    return placeName ? <Body3>{placeName}</Body3> : null;
  };

  const displayLocation = ( ) => {
    if ( shouldFetchLocation && ( !latitude || !longitude ) ) {
      return t( "Stay-on-this-screen" );
    }
    if ( !latitude || !longitude ) {
      return t( "No-Location" );
    }
    return t( "Lat-Lon-Acc", {
      latitude: formatDecimal( latitude ),
      longitude: formatDecimal( longitude ),
      accuracy: currentObservation?.positional_accuracy?.toFixed( 0 ) || t( "none" )
    } );
  };

  const hasPhotoOrSound = useCallback( ( ) => {
    if ( currentObservation?.observationPhotos?.length > 0
      || currentObservation?.observationSounds?.length > 0 ) {
      return true;
    }
    return false;
  }, [currentObservation] );

  const hasValidLocation = useCallback( ( ) => {
    if ( hasLocation
      && ( latitude !== 0 && longitude !== 0 )
      && ( latitude >= -90 && latitude <= 90 )
      && ( longitude >= -180 && longitude <= 180 )
      && ( currentObservation.positional_accuracy === null || (
        currentObservation.positional_accuracy
        && currentObservation.positional_accuracy <= DESIRED_LOCATION_ACCURACY )
      )
    ) {
      return true;
    }
    return false;
  }, [currentObservation, longitude, latitude, hasLocation] );

  const hasValidDate = useCallback( ( ) => {
    const observationDate = parseISO(
      currentObservation?.observed_on_string || currentObservation?.time_observed_at
    );
    if ( observationDate
      && !isFuture( observationDate )
      && differenceInCalendarYears( observationDate, new Date( ) ) <= 130
    ) {
      return true;
    }
    return false;
  }, [currentObservation] );

  const passesEvidenceTest = useCallback( ( ) => {
    if ( shouldFetchLocation ) {
      return null;
    }
    if ( hasValidLocation( ) && hasValidDate( ) && hasPhotoOrSound( ) ) {
      return true;
    }
    return false;
  }, [shouldFetchLocation, hasValidLocation, hasValidDate, hasPhotoOrSound] );

  useEffect( ( ) => {
    // we're only showing the Missing Evidence Sheet if location/date are missing
    // but not if there is a missing photo or sound
    // so the ObsEditContext version of passing evidence test
    // will be different from what shows here with the red warning/green checkmark
    if ( hasValidLocation( ) && hasValidDate( ) ) {
      setPassesEvidenceTest( true );
    }
  }, [hasValidLocation, hasValidDate, setPassesEvidenceTest] );

  return (
    <View className="mx-6 mt-6">
      {showAddEvidenceSheet && (
        <AddEvidenceSheet
          setShowAddEvidenceSheet={setShowAddEvidenceSheet}
          disableAddingMoreEvidence={photoUris.length >= MAX_PHOTOS_ALLOWED}
        />
      )}
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
        handleAddEvidence={handleAddEvidence}
      />
      <View className="flex-row flex-nowrap my-4">
        <INatIcon size={14} name="map-marker-outline" />
        <Pressable accessibilityRole="button" className="ml-5" onPress={navToLocationPicker}>
          {displayPlaceName( )}
          {/* $FlowIgnore */}
          <Body4 className={( !latitude || !longitude ) && "color-warningRed"}>
            {displayLocation( )}
          </Body4>
        </Pressable>
      </View>
      <DatePicker currentObservation={currentObservation} />
    </View>
  );
};

export default EvidenceSection;
