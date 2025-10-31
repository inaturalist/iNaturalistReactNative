import { StoreSlice, SyncingStatus, SyncObservationsSlice } from "./types";

export const SYNC_PENDING = "sync-pending" as const;
export const BEGIN_MANUAL_SYNC = "begin-manual-sync" as const;
export const BEGIN_AUTOMATIC_SYNC = "begin-automatic-sync" as const;
export const MANUAL_SYNC_IN_PROGRESS = "manual-sync-progress" as const;
export const AUTOMATIC_SYNC_IN_PROGRESS = "automatic-sync-progress" as const;

const DEFAULT_STATE = {
  autoSyncAbortController: null,
  currentDeleteCount: 1,
  deleteError: null,
  deleteQueue: [],
  deletionsCompletedAt: null,
  initialNumDeletionsInQueue: 0,
  syncingStatus: SYNC_PENDING
};

const createSyncObservationsSlice: StoreSlice<SyncObservationsSlice> = ( set, get ) => ( {
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
