// @flow

export const INITIAL_CREATE_OBS_STATE = {
  // $FlowIgnore
  cameraPreviewUris: [],
  // $FlowIgnore
  cameraRollUris: [],
  comment: "",
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
  originalCameraUrisMap: {},
  // $FlowIgnore
  photoEvidenceUris: [],
  savingPhoto: false,
  selectedPhotoIndex: 0,
  unsavedChanges: false
};

const createObsReducer = ( state: Object, action: Function ): Object => {
  console.log( action, "action in create obs reducer" );
  switch ( action.type ) {
    case "CLEAR_ADDITIONAL_EVIDENCE": {
      return {
        ...state,
        evidenceToAdd: [],
        unsavedChanges: true
      };
    }
    case "RESET_OBS_CREATE":
      return {
        ...state,
        cameraPreviewUris: [],
        cameraRollUris: [],
        comment: "",
        currentObservationIndex: 0,
        evidenceToAdd: [],
        galleryUris: [],
        groupedPhotos: [],
        observations: [],
        originalCameraUrisMap: {},
        photoEvidenceUris: [],
        unsavedChanges: false
      };
    case "SET_CAMERA_PREVIEW_URIS":
      return {
        ...state,
        cameraPreviewUris: action.cameraPreviewUris
      };
    case "SET_CAMERA_ROLL_URIS":
      return {
        ...state,
        cameraRollUris: action.cameraRollUris
      };
    case "SET_COMMENT":
      return {
        ...state,
        comment: action.comment
      };
    case "SET_DISPLAYED_OBSERVATION":
      return {
        ...state,
        currentObservationIndex: action.currentObservationIndex,
        observations: action.observations || []
      };
    case "SET_EVIDENCE_TO_ADD":
      return {
        ...state,
        evidenceToAdd: action.evidenceToAdd
      };
    case "SET_GALLERY_URIS":
      return {
        ...state,
        galleryUris: action.galleryUris
      };

    case "SET_GROUPED_PHOTOS":
      return {
        ...state,
        groupedPhotos: action.groupedPhotos
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading
      };
    case "SET_ORIGINAL_CAMERA_URIS_MAP":
      return {
        ...state,
        originalCameraUrisMap: action.originalCameraUrisMap
      };
    case "SET_OBSERVATIONS":
      return {
        ...state,
        observations: action.observations,
        unsavedChanges: action.unsavedChanges || false,
        loading: false
      };
    case "SET_PHOTO_EVIDENCE_URIS":
      return {
        ...state,
        photoEvidenceUris: action.photoEvidenceUris
      };
    case "SET_SAVING_PHOTO":
      return {
        ...state,
        savingPhoto: action.savingPhoto
      };
    case "SET_SELECTED_PHOTO_INDEX":
      return {
        ...state,
        selectedPhotoIndex: action.selectedPhotoIndex
      };
    case "DELETE_PHOTO":
      return {
        ...state,
        photoEvidenceUris: action.photoEvidenceUris,
        cameraPreviewUris: action.cameraPreviewUris,
        evidenceToAdd: action.evidenceToAdd
      };
    default:
      return state;
  }
};

export default createObsReducer;
