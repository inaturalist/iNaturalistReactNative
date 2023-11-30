// @flow

export const INITIAL_CREATE_OBS_STATE = {
  // $FlowIgnore
  cameraPreviewUris: [],
  // $FlowIgnore
  cameraRollUris: [],
  currentObservationIndex: 0,
  // $FlowIgnore
  evidenceToAdd: [],
  // $FlowIgnore
  galleryUris: [],
  // $FlowIgnore
  groupedPhotos: [],
  loading: false,
  // $FlowIgnore
  observations: [],
  // $FlowIgnore
  photoEvidenceUris: [],
  savingPhoto: false,
  unsavedChanges: false
};

const createObsReducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "DELETE_PHOTO":
      return {
        ...state,
        photoEvidenceUris: action.photoEvidenceUris,
        cameraPreviewUris: action.cameraPreviewUris,
        evidenceToAdd: action.evidenceToAdd
      };
    case "RESET_OBS_CREATE":
      return {
        ...state,
        cameraPreviewUris: [],
        cameraRollUris: [],
        currentObservationIndex: 0,
        evidenceToAdd: [],
        galleryUris: [],
        groupedPhotos: [],
        observations: [],
        photoEvidenceUris: [],
        savingPhoto: false,
        unsavedChanges: false
      };
    case "SET_CAMERA_ROLL_URIS":
      return {
        ...state,
        cameraRollUris: action.cameraRollUris,
        savingPhoto: false
      };
    case "SET_CAMERA_STATE":
      return {
        ...state,
        evidenceToAdd: action.evidenceToAdd,
        cameraPreviewUris: action.cameraPreviewUris,
        savingPhoto: action.evidenceToAdd.length > 0
      };
    case "SET_DISPLAYED_OBSERVATION":
      return {
        ...state,
        currentObservationIndex: action.currentObservationIndex,
        observations: action.observations || [],
        loading: false
      };
    case "SET_GROUPED_PHOTOS":
      return {
        ...state,
        groupedPhotos: action.groupedPhotos
      };
    case "SET_OBSERVATIONS":
      return {
        ...state,
        observations: action.observations,
        unsavedChanges: action.unsavedChanges || false,
        loading: false,
        evidenceToAdd: [],
        savingPhoto: false
      };
    case "SET_PHOTO_EVIDENCE_URIS":
      return {
        ...state,
        photoEvidenceUris: action.photoEvidenceUris
      };
    default:
      return state;
  }
};

export default createObsReducer;
