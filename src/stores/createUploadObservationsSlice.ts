import { RealmObservation } from "realmModels/types.d.ts";

const DEFAULT_STATE = {
  currentUpload: null,
  errorsByUuid: {},
  // Single error caught during multiple obs upload
  multiError: null,
  numObservationsInQueue: 0,
  numUnuploadedObservations: 0,
  // Increments even if there was an error, so here "attempted" means we tried
  // to upload it, not that it succeeded
  numUploadsAttempted: 0,
  totalToolbarIncrements: 0,
  totalToolbarProgress: 0,
  totalUploadProgress: [],
  uploadQueue: [],
  uploadStatus: "pending"
};

interface TotalUploadProgress {
  uuid: string,
  currentIncrements: number,
  totalIncrements: number,
  totalProgress: number
}

interface UploadObservationsSlice {
  currentUpload: RealmObservation,
  errorsByUuid: Object,
  multiError: string | null,
  numObservationsInQueue: number,
  numUnuploadedObservations: number,
  numUploadsAttempted: number,
  totalToolbarIncrements: number,
  totalToolbarProgress: number,
  totalUploadProgress: Array<TotalUploadProgress>,
  uploadQueue: Array<string>,
  uploadStatus: "pending" | "beginUploads" | "uploadInProgress" | "complete"
}

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
  resetUploadObservationsSlice: ( ) => set( DEFAULT_STATE ),
  addUploadError: ( error, obsUUID ) => set( state => ( {
    errorsByUuid: {
      ...state.errorsByUuid,
      [obsUUID]: [
        ...( state.errorsByUuid[obsUUID] || [] ),
        error
      ]
    },
    multiError: error
  } ) ),
  stopAllUploads: ( ) => set( DEFAULT_STATE ),
  completeUploads: ( ) => set( ( ) => ( {
    uploadStatus: "complete"
  } ) ),
  updateTotalUploadProgress: ( uuid, increment ) => set( state => {
    const { totalUploadProgress, currentUpload } = state;
    const currentObservation = totalUploadProgress.find( o => o.uuid === uuid );
    if ( !currentObservation ) {
      const progressObj = createUploadProgressObj(
        currentUpload,
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
  } ) ),
  addToUploadQueue: uuids => set( state => {
    let copyOfUploadQueue = state.uploadQueue;
    if ( typeof uuids === "string" ) {
      copyOfUploadQueue.push( uuids );
    } else {
      copyOfUploadQueue = copyOfUploadQueue.concat( uuids );
    }
    return ( {
      uploadQueue: copyOfUploadQueue,
      uploadStatus: "uploadInProgress",
      numObservationsInQueue: state.numObservationsInQueue
        + ( typeof uuids === "string"
          ? 1
          : uuids.length )
    } );
  } ),
  removeFromUploadQueue: ( ) => set( state => {
    const copyOfUploadQueue = state.uploadQueue;
    copyOfUploadQueue.pop( );
    return ( {
      uploadQueue: copyOfUploadQueue,
      currentUpload: null
    } );
  } ),
  setCurrentUpload: observation => set( state => ( {
    currentUpload: observation,
    numUploadsAttempted: state.numUploadsAttempted + 1
  } ) ),
  setTotalToolbarIncrements: queuedObservations => set( ( ) => ( {
    totalToolbarIncrements: calculateTotalToolbarIncrements( queuedObservations )
  } ) ),
  setNumUnuploadedObservations: numUnuploadedObservations => set( ( ) => ( {
    numUnuploadedObservations
  } ) )
} );

export default createUploadObservationsSlice;
