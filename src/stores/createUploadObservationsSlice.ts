const DEFAULT_STATE = {
  uploadError: null,
  // Single error caught during multiple obs upload
  multiError: null,
  errorsByUuid: {},
  uploaded: [],
  singleUpload: true,
  uploads: [],
  numToUpload: 0,
  // Increments even if there was an error, so here "finished" means we tried
  // to upload it, not that it succeeded
  numFinishedUploads: 0,
  totalToolbarProgress: 0,
  totalUploadProgress: [],
  uploadStatus: "pending",
  totalToolbarIncrements: 0
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
  uploaded: Array<string>,
  singleUpload: boolean,
  uploads: Array<Object>,
  numToUpload: number,
  numFinishedUploads: number,
  totalToolbarProgress: number,
  totalUploadProgress: Array<TotalUploadProgress>,
  uploadStatus: string | null,
  totalToolbarIncrements: number
}

const startUploadState = uploads => ( {
  multiError: null,
  errorsByUuid: {},
  uploaded: [],
  uploadInProgress: true,
  uploads,
  numToUpload: uploads.length,
  numFinishedUploads: 0
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

const setCurrentToolbarIncrements = totalUploadProgress => countMappedIncrements(
  totalUploadProgress.map( u => u.currentIncrements )
);

const calculateTotalToolbarIncrements = uploads => countMappedIncrements(
  uploads.map( u => countTotalIncrements( u ) )
);

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
    ],
    numFinishedUploads: state.uploaded.length + 1
  } ) ),
  setUploads: uploads => set( ( ) => ( {
    uploads,
    totalToolbarIncrements: calculateTotalToolbarIncrements( uploads )
  } ) ),
  startNextUpload: ( ) => set( ( ) => ( {
    uploadStatus: "uploadInProgress"
  } ) ),
  stopAllUploads: ( ) => set( DEFAULT_STATE ),
  completeUploads: ( ) => set( ( ) => ( {
    uploadStatus: "complete"
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
      totalToolbarProgress:
        setCurrentToolbarIncrements( totalUploadProgress ) / state.totalToolbarIncrements
    } );
  } ),
  setUploadStatus: uploadStatus => set( ( ) => ( {
    uploadStatus
  } ) )
} );

export default createUploadObservationsSlice;
