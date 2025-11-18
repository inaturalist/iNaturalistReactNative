import type { RealmObservation } from "realmModels/types";
import { StateCreator } from "zustand";

import {
  OBS_DETAILS_TAB,
  SCREEN_AFTER_PHOTO_EVIDENCE
} from "./createLayoutSlice";
import {
  AUTOMATIC_SYNC_IN_PROGRESS,
  BEGIN_AUTOMATIC_SYNC,
  BEGIN_MANUAL_SYNC,
  MANUAL_SYNC_IN_PROGRESS,
  SYNC_PENDING
} from "./createSyncObservationsSlice";
import {
  UPLOAD_CANCELLED,
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "./createUploadObservationsSlice";

export interface ExploreSlice {
  exploreView: string;
  setExploreView: ( _view: string ) => void;
}

export interface LayoutSlice {
  isAdvancedUser: boolean;
  obsDetailsTab: OBS_DETAILS_TAB;
  setObsDetailsTab: ( newValue: OBS_DETAILS_TAB ) => void;
  loggedInWhileInDefaultMode?: boolean;
  setLoggedInWhileInDefaultMode: ( newValue: boolean ) => void;
  layout: {
    isDefaultMode: boolean;
    setIsDefaultMode: ( newValue: boolean ) => void;
    isAdvancedSuggestionsMode: null;
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE;
    setScreenAfterPhotoEvidence: ( newScreen: SCREEN_AFTER_PHOTO_EVIDENCE ) => void;
    isAllAddObsOptionsMode: boolean;
    setIsAllAddObsOptionsMode: ( newValue: boolean ) => void;
    shownOnce: { [key: string]: boolean };
    setShownOnce: ( key: string ) => void;
    resetShownOnce: () => void;
    loginBannerDismissed: boolean;
    setLoginBannerDismissed: () => void;
    justFinishedSignup: boolean;
    setJustFinishedSignup: ( newValue: boolean ) => void;
  };
}

export interface MyObsSlice {
  myObsOffset: number;
  myObsOffsetToRestore: number;
  resetMyObsOffsetToRestore: () => void;
  setMyObsOffset: ( newOffset: number ) => void;
  setMyObsOffsetToRestore: () => void;
  numOfUserObservations: number;
  setNumOfUserObservations: ( newNum: number ) => void;
  numOfUserSpecies: number;
  setNumOfUserSpecies: ( newNum: number ) => void;
}

export interface ObservationFlowSlice {
  aICameraSuggestion: unknown;
  cameraRollUris: string[];
  currentObservation: RealmObservation | null;
  currentObservationIndex: number;
  evidenceToAdd: string[];
  photoLibraryUris: string[];
  groupedPhotos: unknown[];
  observations: RealmObservation[];
  observationMarkedAsViewedAt: Date | null;
  cameraUris: string[];
  savingPhoto: boolean;
  savedOrUploadedMultiObsFlow: boolean;
  unsavedChanges: boolean;
  totalSavedObservations: number;
  sentinelFileName: string | null;
  newPhotoUris: string[];
  deletePhotoFromObservation: ( uri: string ) => void;
  deleteSoundFromObservation: ( uri: string ) => void;
  resetObservationFlowSlice: () => void;
  addCameraRollUris: ( uris: string[] ) => void;
  setSavingPhoto: ( saving: boolean ) => void;
  setCameraState: ( options: {
    evidenceToAdd?: string[],
    cameraUris?: string[]
  } ) => void;
  setCurrentObservationIndex: ( index: number ) => void;
  setGroupedPhotos: ( photos: unknown[] ) => void;
  setObservationMarkedAsViewedAt: ( date: Date ) => void;
  setObservations: ( updatedObservations: RealmObservation[] ) => void;
  setPhotoImporterState: ( options: {
    photoLibraryUris?: string[],
    savingPhoto?: boolean,
    evidenceToAdd?: string[],
    groupedPhotos?: unknown[],
    observations?: RealmObservation[],
    firstObservationDefaults?: unknown
  } ) => void;
  setSavedOrUploadedMultiObsFlow: () => void;
  updateObservations: ( updatedObservations: RealmObservation[] ) => void;
  updateObservationKeys: ( keysAndValues: unknown ) => void;
  getCurrentObservation: () => RealmObservation | null;
  prepareObsEdit: ( observation: RealmObservation ) => void;
  prepareCamera: () => void;
  incrementTotalSavedObservations: () => void;
  setSentinelFileName: ( sentinelFileName: string ) => void;
  setNewPhotoUris: ( newPhotoUris: string[] ) => void;
  setAICameraSuggestion: ( suggestion: unknown ) => void;
}

export interface RootExploreSlice {
  rootStoredParams: object;
  setRootStoredParams: ( _params: object ) => void;
  rootExploreView: string;
  setRootExploreView: ( _view: string ) => void;
}

export type SyncingStatus =
  | typeof SYNC_PENDING
  | typeof BEGIN_MANUAL_SYNC
  | typeof BEGIN_AUTOMATIC_SYNC
  | typeof MANUAL_SYNC_IN_PROGRESS
  | typeof AUTOMATIC_SYNC_IN_PROGRESS;

export interface SyncObservationsSlice {
  autoSyncAbortController: AbortController | null;
  currentDeleteCount: number;
  deleteError: string | null;
  deleteQueue: Array<string>;
  deletionsCompletedAt: Date | null;
  initialNumDeletionsInQueue: number;
  syncingStatus: SyncingStatus;
  addToDeleteQueue: ( uuids: string[] ) => void;
  removeFromDeleteQueue: () => void;
  startNextDeletion: () => void;
  completeLocalDeletions: () => void;
  resetSyncObservationsSlice: () => void;
  setDeletionError: ( message: string ) => void;
  setSyncingStatus: ( syncingStatus: SyncingStatus ) => void;
  resetSyncToolbar: () => void;
  startManualSync: () => void;
  startAutomaticSync: () => void;
  completeSync: () => void;
}

export type UploadStatus =
  | typeof UPLOAD_PENDING
  | typeof UPLOAD_IN_PROGRESS
  | typeof UPLOAD_COMPLETE
  | typeof UPLOAD_CANCELLED;

interface TotalUploadProgress {
  uuid: string;
  currentIncrements: number;
  totalIncrements: number;
  totalProgress: number;
}

export interface UploadObservationsSlice {
  abortController: AbortController | null;
  currentUpload: RealmObservation | null;
  errorsByUuid: object;
  multiError: string | null;
  initialNumObservationsInQueue: number;
  numUnuploadedObservations: number;
  numUploadsAttempted: number;
  totalToolbarIncrements: number;
  totalToolbarProgress: number;
  totalUploadProgress: Array<TotalUploadProgress>;
  uploadQueue: Array<string>;
  uploadStatus: UploadStatus;
  resetUploadObservationsSlice: () => void;
  addUploadError: ( error: string, obsUUID: string ) => void;
  stopAllUploads: () => void;
  setCannotUploadObservations: () => void;
  setStartUploadObservations: () => void;
  completeUploads: () => void;
  updateTotalUploadProgress: ( uuid: string, increment: number ) => void;
  setUploadStatus: ( uploadStatus: UploadStatus ) => void;
  addToUploadQueue: ( uuids: string | string[] ) => void;
  removeFromUploadQueue: () => void;
  setCurrentUpload: ( observation: RealmObservation ) => void;
  setTotalToolbarIncrements: ( queuedObservations: RealmObservation[] ) => void;
  addTotalToolbarIncrements: ( observation: RealmObservation ) => void;
  setNumUnuploadedObservations: ( numUnuploadedObservations: number ) => void;
  removeDeletedObsFromUploadQueue: ( uuid: string ) => void;
  getTotalUploadErrors: () => number;
  getNumUploadedWithoutErrors: () => number;
  getCompletedUploads: () => number;
}

export type StoreState = ExploreSlice &
  LayoutSlice &
  MyObsSlice &
  ObservationFlowSlice &
  RootExploreSlice &
  SyncObservationsSlice &
  UploadObservationsSlice;

export type StoreSlice<T> = StateCreator<
  StoreState,
  [["zustand/persist", unknown]],
  [],
  T
>;
