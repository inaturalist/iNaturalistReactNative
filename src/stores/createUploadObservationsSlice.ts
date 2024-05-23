const DEFAULT_STATE = {
  uploadError: null,
  // Single error caught during multiple obs upload
  multiError: null,
  errorsByUuid: {},
  uploaded: [],
  singleUpload: true,
  totalProgressIncrements: 0,
  uploadInProgress: false,
  uploadProgress: { },
  uploads: [],
  numToUpload: 0,
  // Increments even if there was an error, so here "finished" means we tried
  // to upload it, not that it succeeded
  numFinishedUploads: 0,
  uploadsComplete: false,
  toolbarProgress: 0
};

interface UploadObservationsSlice {
  uploadError: string | null,
  multiError: string | null,
  errorsByUuid: Object,
  uploaded: Array<Object>,
  singleUpload: boolean,
  totalProgressIncrements: number,
  uploadInProgress: boolean,
  uploadProgress: Object,
  uploads: Array<Object>,
  numToUpload: number,
  numFinishedUploads: number,
  uploadsComplete: boolean,
  toolbarProgress: number
}

const startUploadState = uploads => ( {
  multiError: null,
  errorsByUuid: {},
  uploaded: [],
  uploadInProgress: true,
  uploadsComplete: false,
  uploads,
  numToUpload: uploads.length,
  numFinishedUploads: 0,
  uploadProgress: { },
  totalProgressIncrements: uploads.reduce(
    ( count, current ) => count
      + ( current?.observationPhotos?.length || 0 )
      + ( current?.observationSounds?.length || 0 ),
    uploads.length
  )
} );

const setToolbarProgress = ( uploadProgress, state ) => {
  const { uploadInProgress, totalProgressIncrements } = state;
  const currentUploadProgress = Object.values( uploadProgress ).reduce(
    ( count, current ) => count + Number( current ),
    0
  );

  let toolbarProgress = 0;
  if ( uploadInProgress && totalProgressIncrements > 0 ) {
    toolbarProgress = 0.1 / totalProgressIncrements;
  }
  if ( totalProgressIncrements > 0 && currentUploadProgress > 0 ) {
    toolbarProgress = currentUploadProgress / totalProgressIncrements;
  }
  return toolbarProgress;
};

const createUploadObservationsSlice: StateCreator<UploadObservationsSlice> = set => ( {
  ...DEFAULT_STATE,
  startSingleUpload: observation => set( ( ) => ( {
    ...startUploadState( [observation] ),
    singleUpload: true
  } ) ),
  startMultipleUploads: ( ) => set( state => ( {
    ...startUploadState( state.uploads ),
    singleUpload: state.uploads.length === 1
  } ) ),
  resetUploadObservationsSlice: ( ) => set( DEFAULT_STATE ),
  setMultiUploadError: uploadError => set( ( ) => ( {
    uploadError,
    uploadInProgress: false
  } ) ),
  addUploadError: ( error, obsUUID ) => set( state => ( {
    errorsByUuid: {
      ...state.errorsByUuid,
      [obsUUID]: [
        ...( state.errorsByUuid[obsUUID] || [] ),
        error
      ]
    }
  } ) ),
  addUploaded: obsUUID => set( state => ( {
    uploaded: [
      ...state.uploaded,
      obsUUID
    ]
  } ) ),
  setUploads: uploads => set( ( ) => ( {
    uploads
  } ) ),
  startNextUpload: ( ) => set( state => ( {
    numFinishedUploads: state.numFinishedUploads + 1
  } ) ),
  stopAllUploads: ( ) => set( DEFAULT_STATE ),
  completeUploads: ( ) => set( ( ) => ( {
    uploadInProgress: false,
    uploadsComplete: true
  } ) ),
  updateUploadProgress: uploadProgress => set( state => ( {
    uploadProgress,
    toolbarProgress: setToolbarProgress( uploadProgress, state )
  } ) )
} );

export default createUploadObservationsSlice;
