export const DELETIONS_PENDING = "deletions-pending";
export const SYNCING_REMOTE_DELETIONS = "deletions-in-progress";
export const HANDLING_LOCAL_DELETIONS = "local-deletions-in-progress";
export const FETCHING_IN_PROGRESS = "fetching-remote";
export const DELETE_AND_SYNC_COMPLETE = "delete-sync-complete";

export const USER_TAPPED_BUTTON = "button";
export const AUTOMATIC_SYNC = "automatic";

const DEFAULT_STATE = {
  currentDeleteCount: 0,
  deletions: [],
  deletionsCompletedAt: null,
  deleteError: null,
  preUploadStatus: DELETIONS_PENDING,
  syncType: AUTOMATIC_SYNC
};

interface DeleteSyncObservationsSlice {
  currentDeleteCount: number,
  deletions: Array<Object>,
  deletionsCompletedAt: Date,
  deleteError: string | null,
  preUploadStatus: typeof DELETIONS_PENDING
  | typeof SYNCING_REMOTE_DELETIONS
  | typeof HANDLING_LOCAL_DELETIONS
  | typeof FETCHING_IN_PROGRESS
  | typeof DELETE_AND_SYNC_COMPLETE,
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
    preUploadStatus: FETCHING_IN_PROGRESS,
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
  } ) )
} );

export default createDeleteAndSyncObservationsSlice;
