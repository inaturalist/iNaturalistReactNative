export const DELETIONS_PENDING = "deletions-pending";
export const DELETIONS_COMPLETE = "deletions-complete";
export const DELETIONS_IN_PROGRESS = "deletions-in-progress";
export const FETCHING_REMOTE_OBSERVATIONS = "fetching-remote";
export const FETCHING_COMPLETE = "fetching-remote-complete";

const DEFAULT_STATE = {
  currentDeleteCount: 1,
  deletions: [],
  deletionsComplete: false,
  deletionsCompletedAt: null,
  deletionsInProgress: false,
  deleteError: null,
  preUploadStatus: FETCHING_REMOTE_OBSERVATIONS
};

interface DeleteObservationsSlice {
  currentDeleteCount: number,
  deletions: Array<Object>,
  deletionsComplete: boolean,
  deletionsCompletedAt: Date,
  deletionsInProgress: boolean,
  deleteError: string | null,
  preUploadStatus: typeof DELETIONS_PENDING
  | typeof DELETIONS_IN_PROGRESS
  | typeof DELETIONS_COMPLETE
  | typeof FETCHING_REMOTE_OBSERVATIONS
  | typeof FETCHING_COMPLETE
}

const createDeleteObservationsSlice: StateCreator<DeleteObservationsSlice> = set => ( {
  ...DEFAULT_STATE,
  setDeletions: deletions => set( ( ) => ( { deletions } ) ),
  startNextDeletion: ( ) => set( state => ( {
    currentDeleteCount: state.currentDeleteCount + 1,
    deletionsInProgress: true
  } ) ),
  finishDeletions: ( ) => set( ( ) => ( {
    deletionsInProgress: false,
    deletionsComplete: true,
    deletionsCompletedAt: new Date( )
  } ) ),
  resetDeleteObservationsSlice: ( ) => set( DEFAULT_STATE ),
  setDeletionError: message => set( ( ) => ( {
    deleteError: message
  } ) ),
  setPreUploadStatus: preUploadStatus => set( ( ) => ( {
    preUploadStatus
  } ) )
} );

export default createDeleteObservationsSlice;
