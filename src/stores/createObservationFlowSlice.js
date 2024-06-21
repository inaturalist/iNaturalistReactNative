// eslint-disable-next-line
import { Realm } from "@realm/react";
import _ from "lodash";
import Photo from "realmModels/Photo";

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
  rotatedOriginalCameraPhotos: [],
  savingPhoto: false,
  unsavedChanges: false
};

const removeObsPhotoFromObservation = ( currentObservation, uri ) => {
  if ( _.isEmpty( currentObservation ) ) { return []; }
  const updatedObservation = currentObservation;
  const obsPhotos = Array.from( currentObservation?.observationPhotos || [] );
  if ( obsPhotos.length > 0 ) {
    // FYI, _.remove edits the array in place and returns the items you
    // removed
    _.remove(
      obsPhotos,
      obsPhoto => Photo.accessLocalPhoto(
        obsPhoto.photo.localFilePath
      ) === uri || obsPhoto.originalPhotoUri === uri
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
  deletePhotoFromObservation: uri => set( state => {
    const newObservations = removeObsPhotoFromObservation(
      state.observations[state.currentObservationIndex],
      uri
    );
    const newObservation = newObservations[state.currentObservationIndex];
    if ( !newObservation ) return {};
    const index = newObservation.observationPhotos.findIndex(
      op => ( op.photo?.localFilePath || op.photo?.url ) === uri
    );
    if ( index > -1 ) {
      newObservation.observationPhotos.splice( index, 1 );
    }

    return ( {
      rotatedOriginalCameraPhotos: [..._.pull( state.rotatedOriginalCameraPhotos, uri )],
      evidenceToAdd: [..._.pull( state.evidenceToAdd, uri )],
      observations: newObservations,
      currentObservation: observationToJSON( newObservation )
    } );
  } ),
  deleteSoundFromObservation: uri => set( state => {
    const newObservations = removeObsSoundFromObservation(
      state.observations[state.currentObservationIndex],
      uri
    );
    const newObservation = newObservations[state.currentObservationIndex];
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
  setSavingPhoto: saving => set( { savingPhoto: saving } ),
  setCameraState: options => set( state => ( {
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    rotatedOriginalCameraPhotos:
      options?.rotatedOriginalCameraPhotos || state.rotatedOriginalCameraPhotos
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
