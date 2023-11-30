// eslint-disable-next-line
import { create } from "zustand";

const useStore = create( set => ( {
  cameraPreviewUris: [],
  cameraRollUris: [],
  comment: "",
  currentObservation: {},
  currentObservationIndex: 0,
  evidenceToAdd: [],
  galleryUris: [],
  groupedPhotos: [],
  loading: false,
  observations: [],
  photoEvidenceUris: [],
  savingPhoto: false,
  unsavedChanges: false,
  resetStore: ( ) => set( {
    cameraPreviewUris: [],
    cameraRollUris: [],
    comment: "",
    currentObservation: {},
    currentObservationIndex: 0,
    evidenceToAdd: [],
    galleryUris: [],
    groupedPhotos: [],
    loading: false,
    observations: [],
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
    savingPhoto: options?.evidenceToAdd?.length > 0 || state.savingPhoto
  } ) ),
  setCurrentObservationIndex: index => set( state => ( {
    currentObservationIndex: index,
    currentObservation: state.observations[index]
  } ) ),
  setGroupedPhotos: photos => set( {
    groupedPhotos: photos
  } ),
  setObservations: updatedObservations => set( {
    observations: updatedObservations
  } ),
  setPhotoEvidenceUris: uris => set( {
    photoEvidenceUris: uris
  } ),
  setPhotoImporterState: options => set( state => ( {
    galleryUris: options?.galleryUris || state.galleryUris,
    savingPhoto: options?.savingPhoto || state.savingPhoto,
    evidenceToAdd: options?.evidenceToAdd || state.evidenceToAdd,
    groupedPhotos: options?.groupedPhotos || state.groupedPhotos,
    observations: options?.observations || state.observations
  } ) ),
  updateComment: newComment => set( { comment: newComment } ),
  updateObservations: updatedObservations => set( {
    observations: updatedObservations,
    unsavedChanges: true
  } )
} ) );

export default useStore;
