const DEFAULT_STATE = {
  uploadError: null,
  // Single error caught during multiple obs upload
  multiError: null,
  errorsByUuid: {},
  uploaded: [],
  singleUpload: true,
  uploadInProgress: false,
  uploads: [],
  numToUpload: 0,
  // Increments even if there was an error, so here "finished" means we tried
  // to upload it, not that it succeeded
  numFinishedUploads: 0,
  uploadsComplete: false,
  totalToolbarProgress: 0,
  totalUploadProgress: [],
  numUnuploadedObs: 0
};

interface TotalUploadProgress {
  uuid: string,
  totalIncrements: number,
  currentIncrements: number,
  totalProgress: number
}

interface UploadObservationsSlice {
  uploadError: string | null,
  multiError: string | null,
  errorsByUuid: Object,
  uploaded: Array<Object>,
  singleUpload: boolean,
  uploadInProgress: boolean,
  uploads: Array<Object>,
  numToUpload: number,
  numFinishedUploads: number,
  uploadsComplete: boolean,
  totalToolbarProgress: number,
  totalUploadProgress: Array<TotalUploadProgress>,
  numUnuploadedObs: number
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
  numUnuploadedObs: uploads.length
} );

const countEvidenceIncrements = ( upload, evidence ) => {
  const evidenceToUpload = upload?.[evidence];
  if ( evidenceToUpload && evidenceToUpload.length > 0 ) {
    const evidenceNeedsUpdate = evidenceToUpload
      .filter( e => e.wasSynced( ) ).length;
    const evidenceNeedsSync = evidenceToUpload
      .filter( e => !e.wasSynced( ) ).length;
    // since we're incrementing by half when evidence is attached to
    // an observation, we also want to count half the total increments for previously
    // synced evidence
    return evidenceNeedsSync + ( evidenceNeedsUpdate / 2 );
  }
  return 0;
};

const countTotalIncrements = upload => 1
  + countEvidenceIncrements( upload, "observationPhotos" )
  + countEvidenceIncrements( upload, "observationSounds" );

const createUploadProgressObj = ( upload, increment ) => ( {
  uuid: upload.uuid,
  currentIncrements: increment,
  totalIncrements: countTotalIncrements( upload )
} );

const countMappedIncrements = list => list.reduce(
  ( count, current ) => count + Number( current ),
  0
);

const setTotalToolbarProgress = totalUploadProgress => {
  const currentProgress = countMappedIncrements(
    totalUploadProgress.map( u => u.currentIncrements )
  );
  const totalProgress = countMappedIncrements(
    totalUploadProgress.map( u => u.totalIncrements )
  );
  return ( currentProgress / totalProgress ) || 0;
};

const calculateNumberOfObsToUpload = state => state.uploads.length - state.uploaded.length;

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
    numFinishedUploads: state.numFinishedUploads + 1,
    numUnuploadedObs: calculateNumberOfObsToUpload( state )
  } ) ),
  stopAllUploads: ( ) => set( DEFAULT_STATE ),
  completeUploads: ( ) => set( ( ) => ( {
    uploadInProgress: false,
    uploadsComplete: true
  } ) ),
  updateTotalUploadProgress: ( uuid, increment ) => set( state => {
    const { totalUploadProgress, uploads } = state;
    const currentObservation = totalUploadProgress.find( o => o.uuid === uuid );
    if ( !currentObservation ) {
      const progressObj = createUploadProgressObj(
        uploads.find( o => o.uuid === uuid ),
        increment
      );
      totalUploadProgress.push( progressObj );
    } else {
      currentObservation.currentIncrements += increment;
    }
    const observation = totalUploadProgress.find( o => o.uuid === uuid );
    observation.totalProgress
      = observation.currentIncrements / observation.totalIncrements;
    return ( {
      totalUploadProgress,
      totalToolbarProgress: setTotalToolbarProgress( totalUploadProgress )
    } );
  } )
} );

export default createUploadObservationsSlice;
