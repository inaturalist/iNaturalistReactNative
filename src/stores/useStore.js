// eslint-disable-next-line
import { create } from "zustand";
import ObservationPhoto from "realmModels/ObservationPhoto";
import _ from "lodash";

const removePhotoFromList = ( list, photo ) => {
  const i = list.findIndex( p => p === photo );
  list.splice( i, 1 );
  return list || [];
};

const removeObsPhotoFromObservation = ( currentObservation, uri ) => {
  if ( _.isEmpty( currentObservation ) ) { return []; }
  const updatedObs = currentObservation;
  const obsPhotos = Array.from( currentObservation?.observationPhotos );
  if ( obsPhotos.length > 0 ) {
    const updatedObsPhotos = ObservationPhoto
      .deleteObservationPhoto( obsPhotos, uri );
    updatedObs.observationPhotos = updatedObsPhotos;
    return updatedObs;
  }
  return [];
};

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
    photoEvidenceUris: [...removePhotoFromList( state.photoEvidenceUris, uri )],
    cameraPreviewUris: [...removePhotoFromList( state.cameraPreviewUris, uri )],
    evidenceToAdd: [...removePhotoFromList( state.evidenceToAdd, uri )],
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
  } ) )
} ) );

export default useStore;
