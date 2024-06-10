export const SYNC_PENDING = "sync-pending";
export const SYNCING_REMOTE_DELETIONS = "fetching-remote-deletions";
export const HANDLING_LOCAL_DELETIONS = "handling-local-deletions";
export const FETCHING_REMOTE_OBSERVATIONS = "fetching-remote-observations";
export const USER_INITIATED_SYNC_COMPLETE = "user-sync-complete";
export const AUTOMATIC_SYNC_COMPLETE = "automatic-sync-complete";

export const USER_TAPPED_BUTTON = "button";
export const AUTOMATIC_SYNC = "automatic";

const DEFAULT_STATE = {
  currentDeleteCount: 1,
  deleteError: null,
  deletions: [],
  deletionsCompletedAt: null,
  preUploadStatus: SYNC_PENDING,
  syncType: AUTOMATIC_SYNC
};

interface DeleteSyncObservationsSlice {
  currentDeleteCount: number,
  deleteError: string | null,
  deletions: Array<Object>,
  deletionsCompletedAt: Date,
  preUploadStatus: typeof SYNC_PENDING
  | typeof SYNCING_REMOTE_DELETIONS
  | typeof HANDLING_LOCAL_DELETIONS
  | typeof FETCHING_REMOTE_OBSERVATIONS
  | typeof USER_INITIATED_SYNC_COMPLETE
  | typeof AUTOMATIC_SYNC_COMPLETE,
  syncType: typeof USER_TAPPED_BUTTON
  | typeof AUTOMATIC_SYNC
}

const createDeleteAndSyncObservationsSlice: StateCreator<DeleteSyncObservationsSlice> = set => ( {
  ...DEFAULT_STATE,
  setDeletions: deletions => set( ( ) => ( { deletions } ) ),
  startNextDeletion: ( ) => set( state => ( {
    currentDeleteCount: state.currentDeleteCount + 1
  } ) ),
  finishLocalDeletions: ( ) => set( ( ) => ( {
    preUploadStatus: FETCHING_REMOTE_OBSERVATIONS,
    deletionsCompletedAt: new Date( )
  } ) ),
  resetDeleteAndSyncObservationsSlice: ( ) => set( DEFAULT_STATE ),
  setDeletionError: message => set( ( ) => ( {
    deleteError: message
  } ) ),
  setPreUploadStatus: preUploadStatus => set( ( ) => ( {
    preUploadStatus
  } ) ),
  setSyncType: syncType => set( ( ) => ( {
    syncType
  } ) ),
  resetSyncToolbar: ( ) => set( ( ) => ( {
    currentDeleteCount: 1,
    deleteError: null,
    deletions: []
  } ) )
} );

export default createDeleteAndSyncObservationsSlice;
