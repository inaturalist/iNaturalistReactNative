import _ from "lodash";
import { RealmObservation } from "realmModels/types.d.ts";
import { StateCreator } from "zustand";

export const UPLOAD_CANCELLED = "cancelled";
export const UPLOAD_PENDING = "pending";
export const UPLOAD_COMPLETE = "complete";
export const UPLOAD_IN_PROGRESS = "in-progress";

const DEFAULT_STATE = {
  abortController: new AbortController( ),
  currentUpload: null,
  errorsByUuid: {},
  // Single error caught during multiple obs upload
  multiError: null,
  initialNumObservationsInQueue: 0,
  numUnuploadedObservations: 0,
  // Increments even if there was an error, so here "attempted" means we tried
  // to upload it, not that it succeeded
  numUploadsAttempted: 0,
  totalToolbarIncrements: 0,
  totalToolbarProgress: 0,
  totalUploadProgress: [],
  uploadQueue: [],
  uploadStatus: UPLOAD_PENDING
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
  initialNumObservationsInQueue: number,
  numUnuploadedObservations: number,
  numUploadsAttempted: number,
  totalToolbarIncrements: number,
  totalToolbarProgress: number,
  totalUploadProgress: Array<TotalUploadProgress>,
  uploadQueue: Array<string>,
  uploadStatus: typeof UPLOAD_PENDING
    | typeof UPLOAD_IN_PROGRESS
    | typeof UPLOAD_COMPLETE
    | typeof UPLOAD_CANCELLED
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

const setTotalToolbarProgress = ( totalToolbarIncrements, totalUploadProgress ) => (
  totalToolbarIncrements > 0
    ? setCurrentToolbarIncrements( totalUploadProgress ) / totalToolbarIncrements
    : 0
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
  stopAllUploads: ( ) => set( { ...DEFAULT_STATE, uploadStatus: UPLOAD_CANCELLED } ),
  completeUploads: ( ) => set( ( ) => ( {
    uploadStatus: UPLOAD_COMPLETE
  } ) ),
  updateTotalUploadProgress: ( uuid, increment ) => set( state => {
    const {
      currentUpload,
      totalToolbarIncrements,
      totalUploadProgress: existingTotalUploadProgress
    } = state;
    // Zustand does *not* make deep copies when making supposedly immutable
    // state changes, so for nested objects like this, we need to create a
    // new object explicitly.
    // https://github.com/pmndrs/zustand/blob/main/docs/guides/immutable-state-and-merging.md#nested-objects
    const totalUploadProgress = existingTotalUploadProgress
      ? [...existingTotalUploadProgress]
      : [];
    const currentObsProgressObj = totalUploadProgress.find( o => o.uuid === uuid );
    if ( !currentObsProgressObj && currentUpload ) {
      const progressObj = createUploadProgressObj(
        currentUpload,
        increment
      );
      totalUploadProgress.push( progressObj );
    } else if ( currentObsProgressObj ) {
      currentObsProgressObj.currentIncrements += increment;
    }
    const obsProgressObj = totalUploadProgress.find( o => o.uuid === uuid );
    if ( obsProgressObj ) {
      obsProgressObj.totalProgress = (
        obsProgressObj.currentIncrements / obsProgressObj.totalIncrements
      );
    }
    return {
      totalUploadProgress,
      totalToolbarProgress: setTotalToolbarProgress( totalToolbarIncrements, totalUploadProgress )
    };
  } ),
  setUploadStatus: uploadStatus => set( ( ) => ( {
    uploadStatus
  } ) ),
  addToUploadQueue: uuids => set( state => {
    let copyOfUploadQueue = state.uploadQueue;
    if ( typeof uuids === "string" ) {
      copyOfUploadQueue.unshift( uuids );
    } else {
      copyOfUploadQueue = copyOfUploadQueue.concat( uuids );
    }
    return ( {
      uploadQueue: copyOfUploadQueue,
      uploadStatus: UPLOAD_IN_PROGRESS,
      initialNumObservationsInQueue: state.initialNumObservationsInQueue
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
  addTotalToolbarIncrements: observation => set( state => {
    const { totalToolbarIncrements: previousToolbarIncrements } = state;

    const additionalToolbarIncrements = calculateTotalToolbarIncrements( [observation] );

    return ( {
      totalToolbarIncrements: previousToolbarIncrements + additionalToolbarIncrements
    } );
  } ),
  setNumUnuploadedObservations: numUnuploadedObservations => set( ( ) => ( {
    numUnuploadedObservations
  } ) ),
  newAbortController: ( ) => {
    const abc = new AbortController( );
    set( ( ) => ( { abortController: abc } ) );
    return abc;
  },
  removeDeletedObsFromUploadQueue: uuid => set( state => {
    const {
      initialNumObservationsInQueue,
      numUploadsAttempted,
      totalToolbarIncrements,
      totalUploadProgress: existingTotalUploadProgress,
      uploadQueue
    } = state;
    // Zustand does *not* make deep copies when making supposedly immutable
    // state changes, so for nested objects like this, we need to create a
    // new object explicitly.
    // https://github.com/pmndrs/zustand/blob/main/docs/guides/immutable-state-and-merging.md#nested-objects
    const totalUploadProgress = existingTotalUploadProgress
      ? [...existingTotalUploadProgress]
      : [];
    const observation = totalUploadProgress.find( o => o.uuid === uuid );
    observation.totalProgress = observation.totalIncrements;
    observation.currentIncrements = observation.totalIncrements;

    // return the new queue without the uuid of the object already deleted remotely
    const queueWithDeleted = _.remove( uploadQueue, uuidInQueue => uuidInQueue !== uuid );

    return ( {
      uploadQueue: queueWithDeleted,
      currentUpload: null,
      totalUploadProgress,
      totalToolbarProgress: setTotalToolbarProgress( totalToolbarIncrements, totalUploadProgress ),
      uploadStatus: numUploadsAttempted === initialNumObservationsInQueue
        ? "complete"
        : "uploadInProgress"
    } );
  } )
} );

export default createUploadObservationsSlice;
