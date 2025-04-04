import { useNavigation, useRoute } from "@react-navigation/native";
import useDeviceStorageFull from "components/Camera/hooks/useDeviceStorageFull";
import {
  useCallback
} from "react";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import fetchPlaceName from "sharedHelpers/fetchPlaceName";
import {
  useLayoutPrefs
} from "sharedHooks";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice.ts";
import useStore from "stores/useStore";

import savePhotosToPhotoLibrary from "../helpers/savePhotosToPhotoLibrary";

const usePrepareStoreAndNavigate = ( ): Function => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraUris = useStore( state => state.cameraUris );
  const currentObservation = useStore( state => state.currentObservation );
  const addCameraRollUris = useStore( state => state.addCameraRollUris );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const setSavingPhoto = useStore( state => state.setSavingPhoto );
  const setCameraState = useStore( state => state.setCameraState );
  const setSentinelFileName = useStore( state => state.setSentinelFileName );
  const { screenAfterPhotoEvidence, isDefaultMode } = useLayoutPrefs( );

  const { deviceStorageFull, showStorageFullAlert } = useDeviceStorageFull( );

  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  const handleSavingToPhotoLibrary = useCallback( async (
    uris,
    addPhotoPermissionResult,
    userLocation,
    logStageIfAICamera
  ) => {
    await logStageIfAICamera( "save_photos_to_photo_library_start" );
    if ( addPhotoPermissionResult !== "granted" ) {
      await logStageIfAICamera( "save_photos_to_photo_library_error" );
      return Promise.resolve( );
    }
    if ( deviceStorageFull ) {
      await logStageIfAICamera( "save_photos_to_photo_library_error" );
      showStorageFullAlert( );
      return Promise.resolve( );
    }
    setSavingPhoto( true );
    const savedPhotoUris = await savePhotosToPhotoLibrary( uris, userLocation );
    await logStageIfAICamera( "save_photos_to_photo_library_complete" );
    if ( savedPhotoUris.length > 0 ) {
      // Save these camera roll URIs, so later on observation editor can update
      // the EXIF metadata of these photos, once we retrieve a location.
      addCameraRollUris( savedPhotoUris );
    }
    // When we've persisted photos to the observation, we don't need them in
    // state anymore
    setCameraState( { evidenceToAdd: [], cameraUris: [], savingPhoto: false } );
    return null;
  }, [
    addCameraRollUris,
    deviceStorageFull,
    setCameraState,
    setSavingPhoto,
    showStorageFullAlert
  ] );

  const createObsWithCameraPhotos = useCallback( async (
    uris,
    addPhotoPermissionResult,
    userLocation,
    logStageIfAICamera,
    visionResult
  ) => {
    const newObservation = await Observation.new( );

    // 20240709 amanda - this is temporary since we'll want to move this code to
    // Suggestions after the changes to permissions github issue is complete, and
    // we'll be able to updateObservationKeys on the observation there
    if ( userLocation?.latitude ) {
      const placeName = await fetchPlaceName( userLocation.latitude, userLocation.longitude );
      newObservation.latitude = userLocation?.latitude;
      newObservation.longitude = userLocation?.longitude;
      newObservation.positional_accuracy = userLocation?.positional_accuracy;
      newObservation.place_guess = placeName;
    }
    newObservation.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( uris, {
        position: 0,
        local: true
      } );
    if ( !isDefaultMode
        && screenAfterPhotoEvidence === SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT
        && visionResult ) {
      console.log( visionResult.taxon, "ai camera suggestion" );
      newObservation.taxon = visionResult.taxon;
    }
    setObservations( [newObservation] );
    await handleSavingToPhotoLibrary(
      uris,
      addPhotoPermissionResult,
      userLocation,
      logStageIfAICamera
    );
  }, [
    isDefaultMode,
    screenAfterPhotoEvidence,
    setObservations,
    handleSavingToPhotoLibrary
  ] );

  const updateObsWithCameraPhotos = useCallback( async (
    addPhotoPermissionResult,
    userLocation,
    logStageIfAICamera
  ) => {
    const obsPhotos = await ObservationPhoto.createObsPhotosWithPosition(
      evidenceToAdd,
      {
        position: numOfObsPhotos,
        local: true
      }
    );
    const updatedCurrentObservation = Observation
      .appendObsPhotos( obsPhotos, currentObservation );
    observations[currentObservationIndex] = updatedCurrentObservation;
    updateObservations( observations );
    await handleSavingToPhotoLibrary(
      evidenceToAdd,
      addPhotoPermissionResult,
      userLocation,
      logStageIfAICamera
    );
  }, [
    evidenceToAdd,
    numOfObsPhotos,
    currentObservation,
    observations,
    currentObservationIndex,
    updateObservations,
    handleSavingToPhotoLibrary
  ] );

  const prepareStoreAndNavigate = useCallback( async ( {
    addPhotoPermissionResult,
    userLocation,
    newPhotoState,
    logStageIfAICamera,
    deleteStageIfAICamera,
    visionResult
  } ) => {
    if ( userLocation !== null ) {
      logStageIfAICamera( "fetch_user_location_complete" );
    }
    // when backing out from ObsEdit -> Suggestions -> Camera, create a
    // new observation
    const uris = newPhotoState?.cameraUris || cameraUris;
    if ( addEvidence ) {
      await updateObsWithCameraPhotos( addPhotoPermissionResult, userLocation, logStageIfAICamera );
      await deleteStageIfAICamera( );
      setSentinelFileName( null );
      return navigation.goBack( );
    }

    await createObsWithCameraPhotos(
      uris,
      addPhotoPermissionResult,
      userLocation,
      logStageIfAICamera,
      visionResult
    );
    await deleteStageIfAICamera( );
    setSentinelFileName( null );

    // Camera (multicapture and ai) in default mode should only go to Match screen
    if ( isDefaultMode ) {
      return navigation.push( "Match", {
        entryScreen: "CameraWithDevice",
        lastScreen: "CameraWithDevice"
      } );
    }
    // Camera navigates based on user settings to Match, Suggestions, or ObsEdit
    return navigation.push( screenAfterPhotoEvidence, {
      entryScreen: "CameraWithDevice",
      lastScreen: "CameraWithDevice"
    } );
  }, [
    cameraUris,
    addEvidence,
    createObsWithCameraPhotos,
    setSentinelFileName,
    navigation,
    updateObsWithCameraPhotos,
    screenAfterPhotoEvidence,
    isDefaultMode
  ] );

  return prepareStoreAndNavigate;
};

export default usePrepareStoreAndNavigate;
