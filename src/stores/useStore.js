// eslint-disable-next-line
import { create } from "zustand";
import _ from "lodash";

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

const updateObservationKeysWithState = ( keysAndValues, state ) => {
  const {
    observations,
    currentObservation,
    currentObservationIndex
  } = state;
  const updatedObservations = observations;
  const updatedObservation = {
    ...( currentObservation.toJSON
      ? currentObservation.toJSON( )
      : currentObservation ),
    ...keysAndValues
  };
  updatedObservations[currentObservationIndex] = updatedObservation;
  return updatedObservations;
};

// Note: this store is currently only for the observation flow (camera, gallery, obs edit,
// suggestions, taxon search, obs details, etc.)
// If we end up wanting to replace reducers move local state into global state from other screens
// (like MyObservations or Explore), we should use the slices pattern documented here:
// https://docs.pmnd.rs/zustand/guides/slices-pattern
const useStore = create( set => ( {
  cameraPreviewUris: [],
  cameraRollUris: [],
  comment: "",
  currentObservation: {},
  currentObservationIndex: 0,
  evidenceToAdd: [],
  galleryUris: [],
  groupedPhotos: [],
  observations: [],
  originalCameraUrisMap: {},
  photoEvidenceUris: [],
  savingPhoto: false,
  unsavedChanges: false,
  deletePhotoFromObservation: uri => set( state => ( {
    photoEvidenceUris: [..._.pull( state.photoEvidenceUris, uri )],
    cameraPreviewUris: [..._.pull( state.cameraPreviewUris, uri )],
    evidenceToAdd: [..._.pull( state.evidenceToAdd, uri )],
    observations: removeObsPhotoFromObservation(
      state.observations[state.currentObservationIndex],
      uri
    )
  } ) ),
  resetStore: ( ) => set( {
    cameraPreviewUris: [],
    cameraRollUris: [],
    comment: "",
    currentObservation: {},
    currentObservationIndex: 0,
    evidenceToAdd: [],
    galleryUris: [],
    groupedPhotos: [],
    observations: [],
    originalCameraUrisMap: {},
    photoEvidenceUris: [],
    savingPhoto: false,
    unsavedChanges: false
  } ),
  setCameraRollUris: uris => set( {
    cameraRollUris: uris,
    savingPhoto: false
  } ),
  setCameraState: options => set( state => ( {
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    cameraPreviewUris: options?.cameraPreviewUris || state.cameraPreviewUris,
    savingPhoto: options?.evidenceToAdd?.length > 0 || state.savingPhoto,
    originalCameraUrisMap: options?.originalCameraUrisMap || state.originalCameraUrisMap
  } ) ),
  setCurrentObservationIndex: index => set( state => ( {
    currentObservationIndex: index,
    currentObservation: state.observations[index]
  } ) ),
  setGroupedPhotos: photos => set( {
    groupedPhotos: photos
  } ),
  setObservations: updatedObservations => set( state => ( {
    observations: updatedObservations,
    currentObservation: updatedObservations[state.currentObservationIndex]
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
    currentObservation: options?.observations?.[state.currentObservationIndex]
    || state.observations?.[state.currentObservationIndex]
  } ) ),
  updateComment: newComment => set( { comment: newComment } ),
  updateObservations: updatedObservations => set( state => ( {
    observations: updatedObservations,
    currentObservation: updatedObservations[state.currentObservationIndex],
    unsavedChanges: true
  } ) ),
  updateObservationKeys: keysAndValues => set( state => ( {
    observations: updateObservationKeysWithState( keysAndValues, state ),
    currentObservation:
      updateObservationKeysWithState( keysAndValues, state )[state.currentObservationIndex],
    unsavedChanges: true
  } ) )
} ) );

export default useStore;
