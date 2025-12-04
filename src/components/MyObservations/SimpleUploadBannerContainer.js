// @flow

import type { Node } from "react";
import React, { useCallback, useMemo } from "react";
import { Dimensions, PixelRatio } from "react-native";
import {
  useTranslation
} from "sharedHooks";
import {
  AUTOMATIC_SYNC_IN_PROGRESS,
  MANUAL_SYNC_IN_PROGRESS
} from "stores/createSyncObservationsSlice";
import {
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice";
import useStore, { zustandStorage } from "stores/useStore";

import SimpleUploadBanner from "./SimpleUploadBanner";

const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get( );

const DELETION_STARTED_PROGRESS = 0.25;

type Props = {
  numUploadableObservations: number,
  handleSyncButtonPress: Function,
  currentUser: Object
};

const SimpleUploadBannerContainer = ( {
  handleSyncButtonPress,
  numUploadableObservations,
  currentUser
}: Props ): Node => {
  const numOfUserObservations = zustandStorage.getItem( "numOfUserObservations" );
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const deleteError = useStore( state => state.deleteError );
  const uploadMultiError = useStore( state => state.multiError );
  const initialNumObservationsInQueue = useStore( state => state.initialNumObservationsInQueue );
  const totalToolbarProgress = useStore( state => state.totalToolbarProgress );
  const uploadStatus = useStore( state => state.uploadStatus );
  const syncingStatus = useStore( state => state.syncingStatus );
  const initialNumDeletionsInQueue = useStore( state => state.initialNumDeletionsInQueue );

  const stopAllUploads = useStore( state => state.stopAllUploads );
  const numUploadsAttempted = useStore( state => state.numUploadsAttempted );
  const totalUploadErrors = useStore( state => state.getTotalUploadErrors() );
  const numUploadedWithoutErrors = useStore( state => state.getNumUploadedWithoutErrors() );

  // Note that initialNumObservationsInQueue is the number of obs being uploaded in
  // the current upload session, so it might be 1 if a single obs is
  // being uploaded even though 5 obs need upload
  const translationParams = useMemo( ( ) => ( {
    total: initialNumObservationsInQueue,
    currentUploadCount: Math.min( numUploadsAttempted, initialNumObservationsInQueue )
  } ), [
    initialNumObservationsInQueue,
    numUploadsAttempted
  ] );

  const { t } = useTranslation( );

  const deletionsComplete = initialNumDeletionsInQueue === currentDeleteCount;
  const deletionsInProgress = initialNumDeletionsInQueue > 0 && !deletionsComplete;

  const automaticSyncInProgress = syncingStatus === AUTOMATIC_SYNC_IN_PROGRESS;
  const manualSyncInProgress = syncingStatus === MANUAL_SYNC_IN_PROGRESS;
  const pendingUpload = uploadStatus === UPLOAD_PENDING && numUploadableObservations > 0;
  const uploadInProgress = uploadStatus === UPLOAD_IN_PROGRESS && numUploadsAttempted > 0;
  const uploadsComplete = uploadStatus === UPLOAD_COMPLETE && initialNumObservationsInQueue > 0;

  const setDeletionsProgress = ( ) => {
    // TODO: we should emit deletions progress like we do for uploads for an accurate progress
    // right now, a user can only delete a single local upload at a time from ObsEdit
    // so we don't need a more robust count here (20240607)
    if ( initialNumDeletionsInQueue === 0 ) {
      return 0;
    }
    if ( !deletionsComplete ) {
      return currentDeleteCount * DELETION_STARTED_PROGRESS;
    }
    return 1;
  };
  const deletionsProgress = setDeletionsProgress( );

  const rotating = manualSyncInProgress || uploadInProgress || deletionsInProgress;
  const showsCheckmark = ( uploadsComplete && !uploadMultiError )
    || ( deletionsComplete && !deleteError && initialNumDeletionsInQueue > 0 );

  const getStatus = useCallback( ( ) => {
    const status = {
      styling: "black-on-white",
      text: ""
    };

    if ( manualSyncInProgress ) {
      status.text = t( "Syncing" );
      return status;
    }

    const deletionParams = {
      total: initialNumDeletionsInQueue,
      currentDeleteCount
    };
    if ( initialNumDeletionsInQueue > 0 ) {
      if ( deletionsComplete ) {
        status.text = t( "X-observations-deleted", { count: initialNumDeletionsInQueue } );
        return status;
      }
      // iPhone 4 pixel width
      status.text = screenWidth <= 640
        ? t( "Deleting-x-of-y--observations", deletionParams )
        : t( "Deleting-x-of-y-observations-2", deletionParams );
      return status;
    }

    if ( pendingUpload ) {
      status.text = t( "Upload-x-observations", { count: numUploadableObservations } );
      status.styling = "white-on-green";
      return status;
    }

    if ( uploadInProgress ) {
      // iPhone 4 pixel width
      status.text = screenWidth <= 640
        ? t( "Uploading-x-of-y", translationParams )
        : t( "Uploading-x-of-y-observations", translationParams );
      return status;
    }

    if ( uploadsComplete && numUploadedWithoutErrors > 0 ) {
      status.text = t( "X-observations-uploaded", { count: numUploadedWithoutErrors } );
      return status;
    }

    return status;
  }, [
    currentDeleteCount,
    deletionsComplete,
    initialNumDeletionsInQueue,
    numUploadedWithoutErrors,
    numUploadableObservations,
    pendingUpload,
    manualSyncInProgress,
    t,
    translationParams,
    uploadInProgress,
    uploadsComplete
  ] );

  const errorText = useMemo( ( ) => {
    if ( automaticSyncInProgress ) {
      return null;
    }
    let error;
    if ( deleteError ) {
      error = deleteError;
    } else if ( totalUploadErrors > 0 ) {
      error = t( "x-uploads-failed", { count: totalUploadErrors } );
    } else {
      error = uploadMultiError;
    }
    return error;
  }, [
    deleteError,
    automaticSyncInProgress,
    t,
    totalUploadErrors,
    uploadMultiError
  ] );

  const status = getStatus( );

  const syncDisabled = rotating || showsCheckmark;
  const progress = totalToolbarProgress || deletionsProgress;

  // hide when there are less than two observations to upload
  // but make sure completed status is displayed when uploads are finished
  if ( !currentUser && numOfUserObservations < 2 && progress === 0 ) {
    return null;
  }
  return (
    <SimpleUploadBanner
      error={errorText}
      handleSyncButtonPress={handleSyncButtonPress}
      progress={progress}
      showsCancelUploadButton={uploadInProgress}
      showsCheckmark={showsCheckmark}
      status={status}
      stopAllUploads={stopAllUploads}
      syncDisabled={syncDisabled}
    />
  );
};

export default SimpleUploadBannerContainer;
