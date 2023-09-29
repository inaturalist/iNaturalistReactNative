// @flow

import { useNavigation } from "@react-navigation/native";
import { DESIRED_LOCATION_ACCURACY } from "components/LocationPicker/LocationPicker";
import {
  differenceInCalendarYears,
  isFuture,
  parseISO
} from "date-fns";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useContext, useEffect,
  useMemo,
  useRef, useState
} from "react";
import Photo from "realmModels/Photo";
import useCurrentObservationLocation from "sharedHooks/useCurrentObservationLocation";

import EvidenceSection from "./EvidenceSection";

const EvidenceSectionContainer = ( ): Node => {
  const {
    currentObservation,
    setPassesEvidenceTest,
    savingPhoto,
    setMediaViewerUris,
    setSelectedPhotoIndex,
    updateObservationKeys
  } = useContext( ObsEditContext );
  const obsPhotos = useMemo(
    ( ) => currentObservation?.observationPhotos || [],
    [currentObservation]
  );
  const mountedRef = useRef( true );
  const navigation = useNavigation( );
  const [takePhoto, setTakePhoto] = useState( false );
  const [importPhoto, setImportPhoto] = useState( false );
  const [recordSound, setRecordSound] = useState( false );
  const [deletePhotoMode, setDeletePhotoMode] = useState( false );

  const [showAddEvidenceSheet, setShowAddEvidenceSheet] = useState( false );

  useEffect( () => {
    // We do this navigation indirectly (vs doing it directly in AddEvidenceSheet),
    // since we need for the bottom sheet of add-evidence to first finish dismissing,
    // only then we can do the navigation - otherwise, this causes the bottom sheet
    // to sometimes pop back up on the next screen - see GH issue #629
    if ( !showAddEvidenceSheet ) {
      if ( takePhoto ) {
        navigation.navigate( "CameraNavigator", {
          screen: "Camera",
          params: { addEvidence: true, camera: "Standard" }
        } );
      } else if ( importPhoto ) {
        navigation.navigate( "CameraNavigator", {
          screen: "PhotoGallery",
          params: { skipGroupPhotos: true }
        } );
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

  const latitude = currentObservation?.latitude;
  const longitude = currentObservation?.longitude;

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
      && ( currentObservation?.positional_accuracy === null
        || currentObservation?.positional_accuracy === undefined
        || (
          currentObservation?.positional_accuracy
        && currentObservation?.positional_accuracy <= DESIRED_LOCATION_ACCURACY )
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

  const showMediaViewer = index => {
    setSelectedPhotoIndex( index - 1 );
    setMediaViewerUris(
      obsPhotos
        ? Array.from( obsPhotos ).map(
          obsPhoto => Photo.displayLocalOrRemoteSquarePhoto( obsPhoto.photo )
        )
        : []
    );
    navigation.navigate( "MediaViewer" );
  };

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
    if ( obsPhotos?.length === 0 && deletePhotoMode ) {
      setDeletePhotoMode( false );
    }
  }, [obsPhotos, deletePhotoMode] );

  useEffect( ( ) => {
    // we're only showing the Missing Evidence Sheet if location/date are missing
    // but not if there is a missing photo or sound
    // so the ObsEditContext version of passing evidence test
    // will be different from what shows here with the red warning/green checkmark
    if ( hasValidLocation( ) && hasValidDate( ) ) {
      setPassesEvidenceTest( true );
    }
  }, [hasValidLocation, hasValidDate, setPassesEvidenceTest] );

  const locationTextClassNames = ( !latitude || !longitude ) && ["color-warningRed"];

  const handleDragAndDrop = ( { data } ) => {
    data.forEach( ( obsPhoto, index ) => {
      obsPhoto.position = index;
    } );

    updateObservationKeys( {
      observationPhotos: data
    } );
  };

  return (
    <EvidenceSection
      locationTextClassNames={locationTextClassNames}
      handleDragAndDrop={handleDragAndDrop}
      showMediaViewer={showMediaViewer}
      passesEvidenceTest={passesEvidenceTest}
      isFetchingLocation={isFetchingLocation}
      evidenceList={obsPhotos}
      setShowAddEvidenceSheet={setShowAddEvidenceSheet}
      showAddEvidenceSheet={showAddEvidenceSheet}
      setTakePhoto={setTakePhoto}
      setImportPhoto={setImportPhoto}
      setRecordSound={setRecordSound}
      savingPhoto={savingPhoto}
    />
  );
};

export default EvidenceSectionContainer;
