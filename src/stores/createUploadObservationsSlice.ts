import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import _ from "lodash";
import type { RealmObservation } from "realmModels/types.d.ts";
import { StateCreator } from "zustand";

export const UPLOAD_CANCELLED = "cancelled";
export const UPLOAD_PENDING = "pending";
export const UPLOAD_COMPLETE = "complete";
export const UPLOAD_IN_PROGRESS = "in-progress";

type UploadStatus = typeof UPLOAD_PENDING
  | typeof UPLOAD_IN_PROGRESS
  | typeof UPLOAD_COMPLETE
  | typeof UPLOAD_CANCELLED;

interface TotalUploadProgress {
  uuid: string,
  currentIncrements: number,
  totalIncrements: number,
  progress: number // Calculated as currentIncrements / totalIncrements
}

interface UploadObservationsSlice {
  abortController: AbortController | null,
  currentUpload: RealmObservation | null,
  errorsByUuid: Object,
  multiError: string | null,
  initialNumObservationsInQueue: number,
  numUnuploadedObservations: number,
  numUploadsAttempted: number,
  totalToolbarProgress: number,
  totalUploadProgress: Array<TotalUploadProgress>,
  uploadQueue: Array<string>,
  uploadStatus: UploadStatus
}

const DEFAULT_STATE: UploadObservationsSlice = {
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
  totalToolbarProgress: 0,
  totalUploadProgress: [],
  uploadQueue: [],
  uploadStatus: UPLOAD_PENDING
};

const countTotalIncrements = upload => {
  const baseIncrement = 1; // Always count the observation upload itself
  const photoIncrements = upload?.observationPhotos
    ? upload.observationPhotos.filter( p => !p.wasSynced() ).length
    : 0;
  const soundIncrements = upload?.observationSounds
    ? upload.observationSounds.filter( s => !s.wasSynced() ).length
    : 0;

  return baseIncrement + photoIncrements + soundIncrements;
};

const calculateTotalToolbarProgress = totalUploadProgress => {
  if ( totalUploadProgress.length === 0 ) return 0;

  const totalIncrements = totalUploadProgress
    .reduce( ( sum, progress ) => sum + progress.totalIncrements, 0 );
  const currentIncrements = totalUploadProgress
    .reduce( ( sum, progress ) => sum + progress.currentIncrements, 0 );

  return currentIncrements / totalIncrements;
};

const createUploadObservationsSlice: StateCreator<UploadObservationsSlice> = ( set, get ) => ( {
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
  stopAllUploads: async ( ) => {
    deactivateKeepAwake( );
    const { abortController } = get( );
    abortController?.abort( );

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
    set( {

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
    const { totalUploadProgress } = state;

    const updatedProgress = totalUploadProgress.map( progress => {
      // Only update the progress for the matching UUID
      if ( progress.uuid === uuid ) {
        const newCurrentIncrements = progress.currentIncrements + increment;
        const newProgress = Math.min(
          newCurrentIncrements / progress.totalIncrements,
          1
        );

        return {
          ...progress,
          currentIncrements: newCurrentIncrements,
          progress: newProgress
        };
      }
      return progress;
    } );

    const totalToolbarProgress = calculateTotalToolbarProgress( updatedProgress );

    const progressState = {
      totalUploadProgress: updatedProgress,
      totalToolbarProgress
    };

    // console.log(
    //   `Progress update for ${uuid}:`,
    //   {
    //     increment,
    //     updatedProgress,
    //     totalToolbarProgress
    //   }
    // );
    return progressState;
  } ),
  setUploadStatus: ( uploadStatus: UploadStatus ) => set( ( ) => ( {
    uploadStatus
  } ) ),
  removeFromUploadQueue: ( ) => set( state => {
    const copyOfUploadQueue = state.uploadQueue;
    copyOfUploadQueue.pop( );
    return ( {
      uploadQueue: copyOfUploadQueue,
      currentUpload: null
    } );
  } ),
  addObservationsToUploadQueue: ( observations: RealmObservation[] ) => set( state => {
    const copyOfUploadQueue = state.uploadQueue;

    const observationsToAdd = observations.map( obs => obs.uuid );
    const newUploadQueue = copyOfUploadQueue.concat( observationsToAdd );

    // Create upload progress items with proper type checking
    const newUploadProgressItems = observations.map( obs => ( {
      uuid: obs.uuid,
      currentIncrements: 0,
      totalIncrements: countTotalIncrements( obs ),
      progress: 0
    } ) ).filter( item => item.uuid ); // Filter out any potentially undefined UUIDs

    const uploadQueueState = {
      uploadQueue: newUploadQueue,
      initialNumObservationsInQueue: state.initialNumObservationsInQueue + observations.length,
      totalUploadProgress: [...state.totalUploadProgress, ...newUploadProgressItems]
    };

    return uploadQueueState;
  } ),
  setNumUnuploadedObservations: numUnuploadedObservations => set( ( ) => ( {
    numUnuploadedObservations
  } ) ),
  removeDeletedObsFromUploadQueue: uuid => set( state => {
    const {
      initialNumObservationsInQueue,
      numUploadsAttempted,
      totalUploadProgress,
      uploadQueue
    } = state;

    const updatedProgress = totalUploadProgress.filter( progress => progress.uuid !== uuid );

    // return the new queue without the uuid of the object already deleted remotely
    const queueWithDeleted = _.remove( uploadQueue, uuidInQueue => uuidInQueue !== uuid );

    return ( {
      uploadQueue: queueWithDeleted,
      currentUpload: null,
      totalUploadProgress: updatedProgress,
      totalToolbarProgress: calculateTotalToolbarProgress( updatedProgress ),
      uploadStatus: numUploadsAttempted === initialNumObservationsInQueue
        ? UPLOAD_COMPLETE
        : UPLOAD_IN_PROGRESS
    } );
  } ),
  setCurrentUpload: observation => set( state => ( {
    currentUpload: observation,
    numUploadsAttempted: state.numUploadsAttempted + 1
  } ) )
} );

export default createUploadObservationsSlice;
