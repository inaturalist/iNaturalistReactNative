// @flow

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import {
  useCallback
} from "react";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

const logger = log.extend( "usePrepareStateForObsEdit" );

const usePrepareStateForObsEdit = (
  permissionGranted: ?string,
  addEvidence: ?boolean
): Object => {
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );
  const currentObservation = useStore( state => state.currentObservation );
  const setCameraRollUris = useStore( state => state.setCameraRollUris );
  const originalCameraUrisMap = useStore( state => state.originalCameraUrisMap );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );

  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  // Save URIs to camera gallery (if a photo was taken using the app,
  // we want it accessible in the camera's folder, as if the user has taken those photos
  // via their own camera app).
  const savePhotosToCameraGallery = useCallback( async uris => {
    if ( permissionGranted !== "granted" ) { return; }
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
  }, [originalCameraUrisMap, setCameraRollUris, permissionGranted] );

  const createObsWithCameraPhotos = useCallback( async ( localFilePaths, localTaxon ) => {
    const newObservation = await Observation.new( );
    newObservation.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( localFilePaths, {
        position: 0,
        local: true
      } );

    if ( localTaxon ) {
      newObservation.taxon = localTaxon;
      newObservation.owners_identification_from_vision = true;
    }
    setObservations( [newObservation] );
    logger.info(
      "createObsWithCameraPhotos, calling savePhotosToCameraGallery with paths: ",
      localFilePaths
    );

    return savePhotosToCameraGallery( localFilePaths );
  }, [savePhotosToCameraGallery, setObservations] );

  const prepareStateForObsEdit = useCallback( async localTaxon => {
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
    return createObsWithCameraPhotos( cameraPreviewUris, localTaxon );
  }, [
    addEvidence,
    cameraPreviewUris,
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
    prepareStateForObsEdit: localTaxon => prepareStateForObsEdit( localTaxon )
  };
};

export default usePrepareStateForObsEdit;
