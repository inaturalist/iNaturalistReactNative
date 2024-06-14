// @flow

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useNavigation } from "@react-navigation/native";
import {
  useCallback
} from "react";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import { log } from "sharedHelpers/logger";
import { useUserLocation } from "sharedHooks";
import useStore from "stores/useStore";

const logger = log.extend( "usePrepareStoreAndNavigate" );

type Options = {
  addPhotoPermissionResult: ?string,
  addEvidence: ?boolean,
  checkmarkTapped: boolean,
  shouldFetchLocation: boolean
};

const usePrepareStoreAndNavigate = ( options: Options ): Function => {
  const {
    addPhotoPermissionResult,
    addEvidence,
    checkmarkTapped,
    shouldFetchLocation
  } = ( options || {} );
  const navigation = useNavigation( );
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const rotatedOriginalCameraPhotos = useStore( state => state.rotatedOriginalCameraPhotos );
  const currentObservation = useStore( state => state.currentObservation );
  const addCameraRollUri = useStore( state => state.addCameraRollUri );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const setSavingPhoto = useStore( state => state.setSavingPhoto );
  const { userLocation } = useUserLocation( { untilAcc: 5, enabled: !!shouldFetchLocation } );

  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  // Save URIs to camera gallery (if a photo was taken using the app,
  // we want it accessible in the camera's folder, as if the user has taken those photos
  // via their own camera app).
  const savePhotosToCameraGallery = useCallback( async uris => {
    if ( addPhotoPermissionResult !== "granted" ) return Promise.resolve( );
    // We use reduce to ensure promises execute in sequence. If we do this in
    // parallel with Promise.all CameraRoll will create new albums for every
    // photo.
    return uris.reduce( async ( _memo, uri ) => {
      logger.info( "saving rotated original camera photo: ", uri );
      try {
        const savedPhotoUri = await CameraRoll.save( uri, {
          type: "photo",
          album: "iNaturalist Next"
        } );
        logger.info( "saved to camera roll: ", savedPhotoUri );
        // Save these camera roll URIs, so later on observation editor can update
        // the EXIF metadata of these photos, once we retrieve a location.
        addCameraRollUri( savedPhotoUri );
      } catch ( cameraRollSaveError ) {
        logger.error( cameraRollSaveError );
        console.log( "couldn't save photo to iNaturalist Next album" );
      }
    } );
  }, [
    addCameraRollUri,
    addPhotoPermissionResult
  ] );

  const createObsWithCameraPhotos = useCallback( async ( localFilePaths, visionResult ) => {
    const newObservation = await Observation.new( );

    // location is needed for fetching online Suggestions on the next screen
    if ( userLocation?.latitude ) {
      newObservation.latitude = userLocation?.latitude;
      newObservation.longitude = userLocation?.longitude;
      newObservation.positional_accuracy = userLocation?.accuracy;
    }
    newObservation.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( localFilePaths, {
        position: 0,
        local: true
      } );

    if ( visionResult ) {
      // make sure taxon id is stored as a number, not a string, from AICamera
      visionResult.taxon.id = Number( visionResult.taxon.id );
      newObservation.taxon = visionResult.taxon;
      newObservation.owners_identification_from_vision = true;
      newObservation.score = visionResult.score;
    }
    setObservations( [newObservation] );
    logger.info(
      "calling savePhotosToCameraGallery with paths: ",
      rotatedOriginalCameraPhotos
    );

    return savePhotosToCameraGallery( rotatedOriginalCameraPhotos );
  }, [
    rotatedOriginalCameraPhotos,
    savePhotosToCameraGallery,
    setObservations,
    userLocation?.accuracy,
    userLocation?.latitude,
    userLocation?.longitude
  ] );

  const updateObsWithCameraPhotos = useCallback( async ( ) => {
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
    logger.info(
      "calling savePhotosToCameraGallery with evidence to add: ",
      evidenceToAdd
    );
    await savePhotosToCameraGallery( evidenceToAdd );
  }, [
    currentObservation,
    currentObservationIndex,
    evidenceToAdd,
    numOfObsPhotos,
    observations,
    savePhotosToCameraGallery,
    updateObservations
  ] );

  const prepareStoreAndNavigate = useCallback( async ( visionResult = null ) => {
    if ( !checkmarkTapped ) { return null; }

    setSavingPhoto( true );
    // save all to camera roll

    // handle case where user backs out from ObsEdit -> Suggestions -> Camera
    // and already has a taxon selected
    // TODO this isn't checking for a selected taxon, and why is it checking
    // for existing photos? If reached from addEvidence, you are always
    // updating an existing obs
    if ( addEvidence || currentObservation?.observationPhotos?.length > 0 ) {
      await updateObsWithCameraPhotos( );
    } else {
      await createObsWithCameraPhotos( rotatedOriginalCameraPhotos, visionResult );
    }
    if ( addEvidence ) {
      return navigation.goBack( );
    }
    return navigation.push( "Suggestions", {
      lastScreen: "CameraWithDevice",
      hasVisionSuggestion: visionResult
    } );
  }, [
    addEvidence,
    rotatedOriginalCameraPhotos,
    checkmarkTapped,
    createObsWithCameraPhotos,
    currentObservation,
    navigation,
    updateObsWithCameraPhotos,
    setSavingPhoto
  ] );

  return prepareStoreAndNavigate;
};

export default usePrepareStoreAndNavigate;
