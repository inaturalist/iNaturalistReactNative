// @flow

export const INITIAL_UPLOAD_STATE = {
  currentUploadIndex: 0,
  error: null,
  singleUpload: false,
  totalProgressIncrements: 0,
  uploadInProgress: false,
  // $FlowIgnore
  uploadProgress: { },
  // $FlowIgnore
  uploads: []
};

const startUploadState = uploads => ( {
  error: null,
  uploadInProgress: true,
  uploads,
  uploadProgress: { },
  totalProgressIncrements: uploads
    .reduce( ( count, current ) => count
      + current.observationPhotos.length, 1 )
} );

const uploadReducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "CONTINUE_UPLOADS":
      return {
        ...state,
        uploadInProgress: true
      };
    case "PAUSE_UPLOADS":
      return {
        ...state,
        uploadInProgress: false,
        currentUploadIndex: 0
      };
    case "SET_UPLOAD_ERROR":
      return {
        ...state,
        error: action.error
      };
    case "START_MULTIPLE_UPLOADS":
      return {
        ...state,
        ...startUploadState( action.uploads )
      };
    case "START_NEXT_UPLOAD":
      return {
        ...state,
        currentUploadIndex: Math.min( state.currentUploadIndex + 1, state.uploads.length - 1 )
      };
    case "STOP_UPLOADS":
      return {
        ...state,
        ...INITIAL_UPLOAD_STATE
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        uploadProgress: action.uploadProgress
      };
    case "UPLOAD_SINGLE_OBSERVATION":
      return {
        ...state,
        ...startUploadState( [action.observation] ),
        singleUpload: true
      };
    default:
      throw new Error( );
  }
};

export default uploadReducer;
