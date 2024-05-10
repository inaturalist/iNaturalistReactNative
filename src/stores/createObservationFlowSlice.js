// eslint-disable-next-line
import { Realm } from "@realm/react";
import _ from "lodash";

const DEFAULT_STATE = {
  cameraRollUris: [],
  comment: "",
  currentObservation: {},
  currentObservationIndex: 0,
  evidenceToAdd: [],
  galleryUris: [],
  groupedPhotos: [],
  observations: [],
  // Track when any obs was last marked as viewed so we know when to update
  // the notifications indicator
  observationMarkedAsViewedAt: null,
  photoEvidenceUris: [],
  rotatedOriginalCameraPhotos: [],
  savingPhoto: false,
  unsavedChanges: false
};

const removeObsPhotoFromObservation = ( currentObservation, uri ) => {
  if ( _.isEmpty( currentObservation ) ) { return []; }
  const updatedObservation = currentObservation;
  const obsPhotos = Array.from( currentObservation?.observationPhotos );
  if ( obsPhotos.length > 0 ) {
    // FYI, _.remove edits the array in place and returns the items you
    // removed
    _.remove(
      obsPhotos,
      obsPhoto => obsPhoto.photo.localFilePath === uri || obsPhoto.originalPhotoUri === uri
    );
    updatedObservation.observationPhotos = obsPhotos;
    return [updatedObservation];
  }
  return [];
};

const removeObsSoundFromObservation = ( currentObservation, uri ) => {
  if ( _.isEmpty( currentObservation ) ) { return []; }
  const updatedObservation = currentObservation;
  const obsSounds = Array.from( currentObservation?.observationSounds );
  if ( obsSounds.length > 0 ) {
    _.remove(
      obsSounds,
      obsSound => obsSound.sound.file_url === uri
    );
    updatedObservation.observationSounds = obsSounds;
    return [updatedObservation];
  }
  return [currentObservation];
};

const observationToJSON = observation => ( observation instanceof Realm.Object
  ? observation.toJSON( )
  : observation );

const updateObservationKeysWithState = ( keysAndValues, state ) => {
  const {
    observations,
    currentObservation,
    currentObservationIndex
  } = state;
  const updatedObservations = observations;
  const updatedObservation = {
    ...observationToJSON( currentObservation ),
    ...keysAndValues
  };
  updatedObservations[currentObservationIndex] = updatedObservation;
  return updatedObservations;
};

const createObservationFlowSlice = set => ( {
  ...DEFAULT_STATE,
  deletePhotoFromObservation: uri => set( state => ( {
    photoEvidenceUris: [..._.pull( state.photoEvidenceUris, uri )],
    rotatedOriginalCameraPhotos: [..._.pull( state.rotatedOriginalCameraPhotos, uri )],
    evidenceToAdd: [..._.pull( state.evidenceToAdd, uri )],
    observations: removeObsPhotoFromObservation(
      state.observations[state.currentObservationIndex],
      uri
    )
  } ) ),
  deleteSoundFromObservation: uri => set( state => {
    const newObservations = removeObsSoundFromObservation(
      state.observations[state.currentObservationIndex],
      uri
    );
    // FWIW, i don't really understand why this *isn't* necessary in
    // deletePhotoFromObservation ~~~kueda20240222
    const newObservation = removeObsSoundFromObservation( state.currentObservation, uri )[0];
    return {
      observations: newObservations,
      currentObservation: newObservation
    };
  } ),
  resetEvidenceToAdd: ( ) => set( { evidenceToAdd: [] } ),
  resetObservationFlowSlice: ( ) => set( DEFAULT_STATE ),
  addCameraRollUri: uri => set( state => {
    const savedUris = state.cameraRollUris;
    savedUris.push( uri );
    return ( {
      cameraRollUris: savedUris,
      savingPhoto: false
    } );
  } ),
  setCameraState: options => set( state => ( {
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    rotatedOriginalCameraPhotos:
      options?.rotatedOriginalCameraPhotos || state.rotatedOriginalCameraPhotos,
    savingPhoto: options?.evidenceToAdd?.length > 0 || state.savingPhoto
  } ) ),
  setCurrentObservationIndex: index => set( state => ( {
    currentObservationIndex: index,
    currentObservation: observationToJSON( state.observations[index] )
  } ) ),
  setGroupedPhotos: photos => set( {
    groupedPhotos: photos
  } ),
  setObservationMarkedAsViewedAt: date => set( {
    observationMarkedAsViewedAt: date
  } ),
  setObservations: updatedObservations => set( state => ( {
    observations: updatedObservations.map( observationToJSON ),
    currentObservation: observationToJSON( updatedObservations[state.currentObservationIndex] )
  } ) ),
  setPhotoEvidenceUris: uris => set( {
    photoEvidenceUris: uris
  } ),
  setPhotoImporterState: options => set( state => ( {
    galleryUris: options?.galleryUris || state.galleryUris,
    savingPhoto: options?.savingPhoto || state.savingPhoto,
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    groupedPhotos: options?.groupedPhotos || state.groupedPhotos,
    observations: options?.observations || state.observations,
    currentObservation: observationToJSON(
      options?.observations?.[state.currentObservationIndex]
      || state.observations?.[state.currentObservationIndex]
    ),
    firstObservationDefaults: options?.firstObservationDefaults
  } ) ),
  updateComment: newComment => set( { comment: newComment } ),
  updateObservations: updatedObservations => set( state => ( {
    observations: updatedObservations,
    currentObservation: observationToJSON( updatedObservations[state.currentObservationIndex] ),
    unsavedChanges: true
  } ) ),
  updateObservationKeys: keysAndValues => set( state => ( {
    observations: updateObservationKeysWithState( keysAndValues, state ),
    currentObservation:
      updateObservationKeysWithState( keysAndValues, state )[state.currentObservationIndex],
    unsavedChanges: true
  } ) )
} );

export default createObservationFlowSlice;
