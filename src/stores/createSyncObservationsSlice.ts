import type { StateCreator } from "zustand";

export const SYNC_PENDING = "sync-pending";
export const BEGIN_MANUAL_SYNC = "begin-manual-sync";
export const BEGIN_AUTOMATIC_SYNC = "begin-automatic-sync";
export const MANUAL_SYNC_IN_PROGRESS = "manual-sync-progress";
export const AUTOMATIC_SYNC_IN_PROGRESS = "automatic-sync-progress";

type SyncingStatus = typeof SYNC_PENDING
  | typeof BEGIN_MANUAL_SYNC
  | typeof BEGIN_AUTOMATIC_SYNC
  | typeof MANUAL_SYNC_IN_PROGRESS
  | typeof AUTOMATIC_SYNC_IN_PROGRESS;

interface SyncObservationsSlice {
  autoSyncAbortController: AbortController | null;
  currentDeleteCount: number;
  deleteError: string | null;
  deleteQueue: Array<string>;
  deletionsCompletedAt: Date | null;
  initialNumDeletionsInQueue: number;
  syncingStatus: SyncingStatus;
}

const DEFAULT_STATE: SyncObservationsSlice = {
  autoSyncAbortController: null,
  currentDeleteCount: 1,
  deleteError: null,
  deleteQueue: [],
  deletionsCompletedAt: null,
  initialNumDeletionsInQueue: 0,
  syncingStatus: SYNC_PENDING
};

const createSyncObservationsSlice: StateCreator<SyncObservationsSlice> = ( set, get ) => ( {
  ...DEFAULT_STATE,
  addToDeleteQueue: ( uuids: string[] ) => set( state => {
    let copyOfDeleteQueue = state.deleteQueue;
    if ( typeof uuids === "string" ) {
      copyOfDeleteQueue.push( uuids );
    } else {
      copyOfDeleteQueue = copyOfDeleteQueue.concat( uuids );
    }
    return ( {
      deleteQueue: copyOfDeleteQueue,
      initialNumDeletionsInQueue: state.initialNumDeletionsInQueue
        + ( typeof uuids === "string"
          ? 1
          : uuids.length )
    } );
  } ),
  removeFromDeleteQueue: ( ) => set( state => {
    const copyOfDeleteQueue = state.deleteQueue;
    copyOfDeleteQueue.pop( );
    return ( {
      deleteQueue: copyOfDeleteQueue
    } );
  } ),
  startNextDeletion: ( ) => set( state => ( {
    currentDeleteCount: state.currentDeleteCount + 1
  } ) ),
  completeLocalDeletions: ( ) => set( ( ) => ( {
    deletionsCompletedAt: new Date( )
  } ) ),
  resetSyncObservationsSlice: ( ) => {
    // Preserve the autoSyncAbortController just in case something might try and use it
    const { autoSyncAbortController } = get( );
    return set( { ...DEFAULT_STATE, autoSyncAbortController } );
  },
  setDeletionError: ( message: string ) => set( ( ) => ( {
    deleteError: message
  } ) ),
  setSyncingStatus: ( syncingStatus: SyncingStatus ) => set( ( ) => ( {
    syncingStatus
  } ) ),
  resetSyncToolbar: ( ) => set( ( ) => ( {
    currentDeleteCount: 1,
    deleteError: null,
    deleteQueue: [],
    initialNumDeletionsInQueue: 0
  } ) ),
  startManualSync: ( ) => set( { syncingStatus: BEGIN_MANUAL_SYNC } ),
  startAutomaticSync: ( ) => set( {
    // Make a new abort controller for this automatic syncing session
    autoSyncAbortController: new AbortController( ),
    syncingStatus: BEGIN_AUTOMATIC_SYNC
  } ),
  completeSync: ( ) => {
    const { autoSyncAbortController } = get( );
    autoSyncAbortController?.abort();
    return set( {
      autoSyncAbortController,
      currentDeleteCount: 1,
      deleteError: null,
      deleteQueue: [],
      syncingStatus: SYNC_PENDING
    } );
  }
} );

export default createSyncObservationsSlice;
