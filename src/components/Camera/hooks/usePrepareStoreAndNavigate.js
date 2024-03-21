// @flow

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useNavigation } from "@react-navigation/native";
import {
  useCallback
} from "react";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

const logger = log.extend( "usePrepareStoreAndNavigate" );

const usePrepareStoreAndNavigate = (
  permissionGranted: ?string,
  addEvidence: ?boolean,
  checkmarkTapped: boolean
): Object => {
  const navigation = useNavigation( );
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );
  const currentObservation = useStore( state => state.currentObservation );
  const setCameraRollUris = useStore( state => state.setCameraRollUris );
  const originalCameraUrisMap = useStore( state => state.originalCameraUrisMap );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );

  const hasVisionSuggestion = currentObservation?.owners_identification_from_vision === true
    && currentObservation?.taxon !== null;

  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  // Save URIs to camera gallery (if a photo was taken using the app,
  // we want it accessible in the camera's folder, as if the user has taken those photos
  // via their own camera app).
  const savePhotosToCameraGallery = useCallback( async uris => {
    if ( permissionGranted === "granted" ) {
      const savedUris = await Promise.all( uris.map( async uri => {
      // Find original camera URI of each scaled-down photo
        const cameraUri = originalCameraUrisMap[uri];

        if ( !cameraUri ) {
          console.error( `Couldn't find original camera URI for: ${uri}` );
        }
        logger.info( "savePhotosToCameraGallery, saving cameraUri: ", cameraUri );
        return CameraRoll.save( cameraUri, { type: "photo", album: "Camera" } );
      } ) );

      logger.info( "savePhotosToCameraGallery, savedUris: ", savedUris );
      // Save these camera roll URIs, so later on observation editor can update
      // the EXIF metadata of these photos, once we retrieve a location.
      setCameraRollUris( savedUris );
    }
    navigation.push( "Suggestions", { lastScreen: "CameraWithDevice", hasVisionSuggestion } );
  }, [
    hasVisionSuggestion,
    navigation,
    originalCameraUrisMap,
    permissionGranted,
    setCameraRollUris
  ] );

  const createObsWithCameraPhotos = useCallback( async ( localFilePaths, visionResult ) => {
    const newObservation = await Observation.new( );

    // location is needed for fetching online Suggestions on the next screen
    const location = await fetchUserLocation( );
    if ( location?.latitude ) {
      newObservation.latitude = location?.latitude;
      newObservation.longitude = location?.longitude;
    }
    newObservation.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( localFilePaths, {
        position: 0,
        local: true
      } );

    if ( visionResult ) {
      // make sure taxon id is stored as a number, not a string, from ARCamera
      visionResult.taxon.id = Number( visionResult.taxon.id );
      newObservation.taxon = visionResult.taxon;
      newObservation.owners_identification_from_vision = true;
      newObservation.score = visionResult.score;
    }
    setObservations( [newObservation] );
    logger.info(
      "createObsWithCameraPhotos, calling savePhotosToCameraGallery with paths: ",
      localFilePaths
    );

    return savePhotosToCameraGallery( localFilePaths );
  }, [savePhotosToCameraGallery, setObservations] );

  const prepareStateForObsEdit = useCallback( async visionResult => {
    if ( !checkmarkTapped ) { return null; }
    // handle case where user backs out from ObsEdit -> Suggestions -> Camera
    // and already has a taxon selected
    if ( addEvidence ) {
      const obsPhotos = await ObservationPhoto
        .createObsPhotosWithPosition( evidenceToAdd, {
          position: numOfObsPhotos,
          local: true
        } );
      const updatedCurrentObservation = Observation
        .appendObsPhotos( obsPhotos, currentObservation );
      observations[currentObservationIndex] = updatedCurrentObservation;
      updateObservations( observations );
      logger.info(
        "addCameraPhotosToCurrentObservation, calling savePhotosToCameraGallery with paths: ",
        evidenceToAdd
      );
      return savePhotosToCameraGallery( evidenceToAdd );
    }
    return createObsWithCameraPhotos( cameraPreviewUris, visionResult );
  }, [
    addEvidence,
    cameraPreviewUris,
    checkmarkTapped,
    createObsWithCameraPhotos,
    currentObservation,
    currentObservationIndex,
    evidenceToAdd,
    numOfObsPhotos,
    observations,
    savePhotosToCameraGallery,
    updateObservations
  ] );

  return {
    prepareStateForObsEdit: visionResult => prepareStateForObsEdit( visionResult )
  };
};

export default usePrepareStoreAndNavigate;
