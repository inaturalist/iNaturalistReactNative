// eslint-disable-next-line
import { Realm } from "@realm/react";
import _ from "lodash";
import Photo from "realmModels/Photo.ts";
import Sound from "realmModels/Sound";

const DEFAULT_STATE = {
  aICameraSuggestion: null,
  cameraRollUris: [],
  currentObservation: null,
  currentObservationIndex: 0,
  evidenceToAdd: [],
  photoLibraryUris: [],
  groupedPhotos: [],
  observations: [],
  // Track when any obs was last marked as viewed so we know when to update
  // the notifications indicator
  observationMarkedAsViewedAt: null,
  // Array of URIs of photos taken in the camera. These should be fully
  // processed, including rotation or any other transformations. It might
  // also include URIs of other photos that need to be visible as previews in
  // the camera
  cameraUris: [],
  savingPhoto: false,
  savedOrUploadedMultiObsFlow: false,
  unsavedChanges: false,
  totalSavedObservations: 0,
  sentinelFileName: null,
  newPhotoUris: []
};

const removeObsSoundFromObservation = ( currentObservation, uri ) => {
  if ( _.isEmpty( currentObservation ) ) { return []; }
  const updatedObservation = currentObservation;
  const obsSounds = Array.from( currentObservation?.observationSounds );
  if ( obsSounds.length > 0 ) {
    _.remove(
      obsSounds,
      obsSound => (
        obsSound.sound.file_url === uri
        || Sound.getLocalSoundUri( obsSound.sound.file_url ) === uri
      )
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

const createObservationFlowSlice = ( set, get ) => ( {
  ...DEFAULT_STATE,
  deletePhotoFromObservation: uri => set( state => {
    const newObservations = [...state.observations];
    let newObservation = null;

    if ( newObservations.length > 0 ) {
      newObservation = newObservations[state.currentObservationIndex];
      const index = newObservation.observationPhotos.findIndex(
        op => ( Photo.getLocalPhotoUri( op.photo?.localFilePath ) || op.photo?.url ) === uri
      );
      if ( index > -1 ) {
        newObservation.observationPhotos.splice( index, 1 );
      }
    }

    const newCameraUris = [..._.pull( state.cameraUris, uri )];
    return {
      cameraUris: newCameraUris,
      evidenceToAdd: [..._.pull( state.evidenceToAdd, uri )],
      observations: newObservations,
      currentObservation: newObservation
        ? observationToJSON( newObservation )
        : null
    };
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
  resetObservationFlowSlice: ( ) => set( DEFAULT_STATE ),
  addCameraRollUris: uris => set( state => {
    const savedUris = state.cameraRollUris;
    // A placeholder uri means we don't know the real URI, probably b/c we
    // only had write permission so we were able to write the photo to the
    // camera roll but not read anything about it. Keep in mind this is just
    // a hack around a bug in CameraRoll. See
    // patches/@react-native-camera-roll+camera-roll+7.5.2.patch
    uris.forEach( uri => {
      if ( uri && !uri.match( /placeholder/ ) ) savedUris.push( uri );
    } );

    return ( {
      cameraRollUris: savedUris,
      savingPhoto: false
    } );
  } ),
  setSavingPhoto: saving => set( { savingPhoto: saving } ),
  setCameraState: options => set( state => ( {
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    cameraUris:
      options?.cameraUris || state.cameraUris
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
    photoLibraryUris: options?.photoLibraryUris || state.photoLibraryUris,
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
  setSavedOrUploadedMultiObsFlow: ( ) => set( {
    savedOrUploadedMultiObsFlow: true
  } ),
  updateObservations: updatedObservations => set( state => ( {
    observations: updatedObservations.map( observationToJSON ),
    currentObservation: observationToJSON( updatedObservations[state.currentObservationIndex] )
  } ) ),
  updateObservationKeys: keysAndValues => set( state => ( {
    observations: updateObservationKeysWithState( keysAndValues, state ),
    currentObservation:
      updateObservationKeysWithState( keysAndValues, state )[state.currentObservationIndex],
    unsavedChanges: true
  } ) ),
  // For situations where a consumer needs access to this part of state
  // immediately, not after a couple render cycles
  getCurrentObservation: ( ) => get( ).currentObservation,
  // Prepare state for showing ObsEdit for a single observation
  prepareObsEdit: observation => {
    get( ).resetObservationFlowSlice( );
    get( ).updateObservations( [observation] );
  },
  prepareCamera: () => {
    const existingPhotoUris = get( )
      .currentObservation
      ?.observationPhotos
      ?.map( op => ( op.photo.url || Photo.getLocalPhotoUri( op.photo.localFilePath ) ) ) || [];
    return set( { evidenceToAdd: [], cameraUris: existingPhotoUris } );
  },
  incrementTotalSavedObservations: ( ) => set( state => {
    const {
      totalSavedObservations: existingTotalSavedObservations
    } = state;

    return ( {
      totalSavedObservations: existingTotalSavedObservations + 1
    } );
  } ),
  setSentinelFileName: sentinelFileName => set( {
    sentinelFileName
  } ),
  setNewPhotoUris: newPhotoUris => set( {
    newPhotoUris
  } ),
  setAICameraSuggestion: suggestion => set( {
    aICameraSuggestion: suggestion
  } )
} );

export default createObservationFlowSlice;
