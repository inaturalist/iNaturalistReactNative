import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";

export const SYNC_PENDING = "sync-pending";
export const BEGIN_MANUAL_SYNC = "begin-manual-sync";
export const BEGIN_AUTOMATIC_SYNC = "begin-automatic-sync";
export const MANUAL_SYNC_IN_PROGRESS = "manual-sync-progress";
export const AUTOMATIC_SYNC_IN_PROGRESS = "automatic-sync-progress";

const DEFAULT_STATE = {
  currentDeleteCount: 1,
  deleteError: null,
  deleteQueue: [],
  deletionsCompletedAt: null,
  initialNumDeletionsInQueue: 0,
  syncingStatus: SYNC_PENDING
};

interface SyncObservationsSlice {
  currentDeleteCount: number,
  deleteError: string | null,
  deleteQueue: Array<string>,
  deletionsCompletedAt: Date,
  initialNumDeletionsInQueue: number,
  syncingStatus: typeof SYNC_PENDING
  | typeof AUTOMATIC_SYNC_IN_PROGRESS
  | typeof MANUAL_SYNC_IN_PROGRESS
}

const createSyncObservationsSlice: StateCreator<SyncObservationsSlice> = set => ( {
  ...DEFAULT_STATE,
  addToDeleteQueue: uuids => set( state => {
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
  resetSyncObservationsSlice: ( ) => set( DEFAULT_STATE ),
  setDeletionError: message => set( ( ) => ( {
    deleteError: message
  } ) ),
  setSyncingStatus: syncingStatus => set( ( ) => ( {
    syncingStatus
  } ) ),
  resetSyncToolbar: ( ) => set( ( ) => ( {
    currentDeleteCount: 1,
    deleteError: null,
    deleteQueue: [],
    initialNumDeletionsInQueue: 0
  } ) ),
  startManualSync: ( ) => set( ( ) => {
    activateKeepAwake( );
    return ( {
      syncingStatus: BEGIN_MANUAL_SYNC
    } );
  } ),
  startAutomaticSync: ( ) => set( ( ) => {
    activateKeepAwake( );
    return ( {
      syncingStatus: BEGIN_AUTOMATIC_SYNC
    } );
  } ),
  completeSync: ( ) => set( ( ) => {
    deactivateKeepAwake( );
    return ( {
      currentDeleteCount: 1,
      deleteError: null,
      deleteQueue: [],
      syncingStatus: SYNC_PENDING
    } );
  } )
} );

export default createSyncObservationsSlice;
