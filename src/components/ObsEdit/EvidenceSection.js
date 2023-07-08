// @flow

import { useNavigation } from "@react-navigation/native";
import { MAX_PHOTOS_ALLOWED } from "components/Camera/StandardCamera";
import { DESIRED_LOCATION_ACCURACY } from "components/LocationPicker/LocationPicker";
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
import { ActivityIndicator, useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";
import useCurrentObservationLocation from "sharedHooks/useCurrentObservationLocation";
import useTranslation from "sharedHooks/useTranslation";

import DatePicker from "./DatePicker";
import EvidenceList from "./EvidenceList";
import AddEvidenceSheet from "./Sheets/AddEvidenceSheet";

const EvidenceSection = ( ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const {
    currentObservation,
    setPassesEvidenceTest
  } = useContext( ObsEditContext );
  const obsPhotos = currentObservation?.observationPhotos;
  const photoUris = obsPhotos
    ? Array.from( obsPhotos ).map(
      obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
    )
    : [];
  const mountedRef = useRef( true );
  const navigation = useNavigation( );
  const [takePhoto, setTakePhoto] = useState( false );
  const [importPhoto, setImportPhoto] = useState( false );
  const [recordSound, setRecordSound] = useState( false );

  const navToLocationPicker = ( ) => {
    navigation.navigate( "LocationPicker", { goBackOnSave: true } );
  };

  const [showAddEvidenceSheet, setShowAddEvidenceSheet] = useState( false );
  const handleAddEvidence = ( ) => setShowAddEvidenceSheet( true );

  useEffect( () => {
    // We do this navigation indirectly (vs doing it directly in AddEvidenceSheet),
    // since we need for the bottom sheet of add-evidence to first finish dismissing,
    // only then we can do the navigation - otherwise, this causes the bottom sheet
    // to sometimes pop back up on the next screen - see GH issue #629
    if ( !showAddEvidenceSheet ) {
      if ( takePhoto ) {
        navigation.navigate( "StandardCamera", { addEvidence: true } );
      } else if ( importPhoto ) {
        navigation.navigate( "PhotoGallery", { skipGroupPhotos: true } );
      } else if ( recordSound ) {
        // TODO - need to implement
      }
    }
  }, [takePhoto, importPhoto, recordSound, showAddEvidenceSheet, navigation] );

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
    hasLocation,
    isFetchingLocation
  } = useCurrentObservationLocation( mountedRef );

  const { latitude, longitude } = currentObservation;

  const displayPlaceName = ( ) => {
    let placeName = "";
    if ( currentObservation.place_guess ) {
      placeName = currentObservation.place_guess;
    } else if ( isFetchingLocation ) {
      placeName = t( "Fetching-location" );
    } else if ( !latitude || !longitude ) {
      return t( "Add-Location" );
    }
    return placeName;
  };

  const displayLocation = ( ) => {
    if ( isFetchingLocation && ( !latitude || !longitude ) ) {
      return t( "Stay-on-this-screen" );
    }
    if ( !latitude || !longitude ) {
      return t( "No-Location" );
    }
    return t( "Lat-Lon-Acc", {
      latitude,
      longitude,
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
    if ( isFetchingLocation ) {
      return null;
    }
    if ( hasValidLocation( ) && hasValidDate( ) && hasPhotoOrSound( ) ) {
      return true;
    }
    return false;
  }, [isFetchingLocation, hasValidLocation, hasValidDate, hasPhotoOrSound] );

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
      <AddEvidenceSheet
        setShowAddEvidenceSheet={setShowAddEvidenceSheet}
        disableAddingMoreEvidence={photoUris.length >= MAX_PHOTOS_ALLOWED}
        hide={!showAddEvidenceSheet}
        onTakePhoto={() => { setTakePhoto( true ); }}
        onImportPhoto={() => { setImportPhoto( true ); }}
        onRecordSound={() => { setRecordSound( true ); }}
      />
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
      <Pressable
        accessibilityRole="button"
        className="flex-row flex-nowrap my-3"
        onPress={navToLocationPicker}
      >
        <View className="w-[30px] items-center mr-1">
          {isFetchingLocation && <ActivityIndicator />}
          <View className={isFetchingLocation && "bottom-5"}>
            <INatIcon size={14} name="map-marker-outline" />
          </View>
        </View>
        <View>
          {displayPlaceName( ) && (
            <Body3 className={( !latitude || !longitude ) && "color-warningRed"}>
              {displayPlaceName( )}
            </Body3>
          )}
          {/* $FlowIgnore */}
          <Body4 className={( !latitude || !longitude ) && "color-warningRed"}>
            {displayLocation( )}
          </Body4>
        </View>

      </Pressable>
      <DatePicker currentObservation={currentObservation} />
    </View>
  );
};

export default EvidenceSection;
