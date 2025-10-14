import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import _ from "lodash";

import { StoreSlice, UploadObservationsSlice, UploadStatus } from "./types";

export const UPLOAD_CANCELLED = "cancelled" as const;
export const UPLOAD_PENDING = "pending" as const;
export const UPLOAD_COMPLETE = "complete" as const;
export const UPLOAD_IN_PROGRESS = "in-progress" as const;

const DEFAULT_STATE = {
  abortController: null,
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

const createUploadObservationsSlice: StoreSlice<UploadObservationsSlice> = ( set, get ) => ( {
  ...DEFAULT_STATE,
  resetUploadObservationsSlice: ( ) => {
    // Preserve the abortController just in case something might try and use it
    const { abortController } = get( );
    const defaultStateWithController = {
      abortController,
      currentUpload: null,
      errorsByUuid: {},
      multiError: null,
      initialNumObservationsInQueue: 0,
      numUnuploadedObservations: 0,
      numUploadsAttempted: 0,
      totalToolbarIncrements: 0,
      totalToolbarProgress: 0,
      totalUploadProgress: [],
      uploadQueue: [],
      uploadStatus: UPLOAD_PENDING
    };

    return set( defaultStateWithController );
  },
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
  stopAllUploads: ( ) => {
    deactivateKeepAwake( );
    const { abortController } = get( );
    abortController?.abort();

    const cancelledStateWithController = {
      // Preserve the abort controller in case in might still get used. It
      // should only get regenerated when the uploads start
      abortController,
      currentUpload: null,
      errorsByUuid: {},
      multiError: null,
      initialNumObservationsInQueue: 0,
      numUnuploadedObservations: 0,
      numUploadsAttempted: 0,
      totalToolbarIncrements: 0,
      totalToolbarProgress: 0,
      totalUploadProgress: [],
      uploadQueue: [],
      uploadStatus: UPLOAD_CANCELLED
    };

    return set( cancelledStateWithController );
  },
  // Sets state to indicate that upload is needed without necessarily
  // resetting the state, as there might still be observations to upload
  setCannotUploadObservations: ( ) => set( { uploadStatus: UPLOAD_PENDING } ),
  // Sets the state to start uploading observations
  setStartUploadObservations: ( ) => {
    activateKeepAwake( );
    return set( {
      // Make a new abort controller for this upload session
      abortController: new AbortController( ),
      uploadStatus: UPLOAD_IN_PROGRESS
    } );
  },
  completeUploads: ( ) => {
    deactivateKeepAwake( );
    set( { uploadStatus: UPLOAD_COMPLETE } );
  },
  updateTotalUploadProgress: ( uuid: string, increment: number ) => set( state => {
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
  setUploadStatus: ( uploadStatus: UploadStatus ) => set( ( ) => ( {
    uploadStatus
  } ) ),
  addToUploadQueue: ( uuids: string | string[] ) => set( state => {
    let copyOfUploadQueue = state.uploadQueue;
    if ( typeof uuids === "string" ) {
      copyOfUploadQueue.unshift( uuids );
    } else {
      copyOfUploadQueue = copyOfUploadQueue.concat( uuids );
    }
    return ( {
      uploadQueue: copyOfUploadQueue,
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
        ? UPLOAD_COMPLETE
        : UPLOAD_IN_PROGRESS
    } );
  } ),
  getTotalUploadErrors: () => Object.keys( get().errorsByUuid ).length,
  getNumUploadedWithoutErrors: () => get().numUploadsAttempted - get().getTotalUploadErrors(),
  getCompletedUploads: () => {
    const uploads = get().numUploadsAttempted;
    const errors = get().getTotalUploadErrors();
    const inQueue = get().uploadQueue.length;

    // An upload is considered complete if:
    // 1. It was attempted (increments numUploadsAttempted)
    // 2. It's no longer in the queue (removed from uploadQueue)
    // 3. It didn't error (not counted in errorsByUuid)
    return Math.max( 0, uploads - inQueue - errors );
  }
} );

export default createUploadObservationsSlice;
