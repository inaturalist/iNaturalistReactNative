import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";

export const SYNC_PENDING = "sync-pending";
export const BEGIN_MANUAL_SYNC = "begin-manual-sync";
export const BEGIN_AUTOMATIC_SYNC = "begin-automatic-sync";
export const MANUAL_SYNC_IN_PROGRESS = "manual-sync-progress";
export const AUTOMATIC_SYNC_IN_PROGRESS = "automatic-sync-progress";

const DEFAULT_STATE = {
  currentDeleteCount: 1,
  deleteError: null,
  deletions: [],
  deletionsCompletedAt: null,
  syncingStatus: SYNC_PENDING
};

interface SyncObservationsSlice {
  currentDeleteCount: number,
  deleteError: string | null,
  deletions: Array<Object>,
  deletionsCompletedAt: Date,
  syncingStatus: typeof SYNC_PENDING
  | typeof AUTOMATIC_SYNC_IN_PROGRESS
  | typeof MANUAL_SYNC_IN_PROGRESS
}

const createSyncObservationsSlice: StateCreator<SyncObservationsSlice> = set => ( {
  ...DEFAULT_STATE,
  setDeletions: deletions => set( ( ) => ( { deletions } ) ),
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
    deletions: []
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
      syncingStatus: SYNC_PENDING,
      currentDeleteCount: 1,
      deleteError: null,
      deletions: []
    } );
  } )
} );

export default createSyncObservationsSlice;
