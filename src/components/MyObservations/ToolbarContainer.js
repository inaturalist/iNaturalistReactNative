// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useCallback, useMemo } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { useTheme } from "react-native-paper";
import {
  useCurrentUser,
  useTranslation
} from "sharedHooks";
import {
  DELETE_AND_SYNC_COMPLETE,
  FETCHING_IN_PROGRESS,
  HANDLING_LOCAL_DELETIONS,
  SYNCING_REMOTE_DELETIONS,
  USER_TAPPED_BUTTON
} from "stores/createDeleteAndSyncObservationsSlice.ts";
import {
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import Toolbar from "./Toolbar";

const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get( );

const DELETION_STARTED_PROGRESS = 0.25;

type Props = {
  handleSyncButtonPress: Function,
  layout: string,
  toggleLayout: Function
}

const ToolbarContainer = ( {
  handleSyncButtonPress,
  layout,
  toggleLayout
}: Props ): Node => {
  const setExploreView = useStore( state => state.setExploreView );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const deletions = useStore( state => state.deletions );
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const deleteError = useStore( state => state.deleteError );
  const uploadMultiError = useStore( state => state.multiError );
  const uploadErrorsByUuid = useStore( state => state.errorsByUuid );
  const numObservationsInQueue = useStore( state => state.numObservationsInQueue );
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );
  const totalToolbarProgress = useStore( state => state.totalToolbarProgress );
  const uploadStatus = useStore( state => state.uploadStatus );
  const preUploadStatus = useStore( state => state.preUploadStatus );
  const syncType = useStore( state => state.syncType );

  const stopAllUploads = useStore( state => state.stopAllUploads );
  const numUploadsAttempted = useStore( state => state.numUploadsAttempted );

  // Note that numObservationsInQueue is the number of obs being uploaded in
  // the current upload session, so it might be 1 if a single obs is
  // being uploaded even though 5 obs need upload
  const translationParams = useMemo( ( ) => ( {
    total: numObservationsInQueue,
    currentUploadCount: Math.min( numUploadsAttempted, numObservationsInQueue )
  } ), [
    numObservationsInQueue,
    numUploadsAttempted
  ] );

  const navToExplore = useCallback(
    ( ) => {
      setExploreView( "observations" );
      navigation.navigate( "Explore", {
        user: currentUser,
        worldwide: true,
        resetStoredParams: true
      } );
    },
    [navigation, currentUser, setExploreView]
  );

  const { t } = useTranslation( );
  const theme = useTheme( );

  const totalDeletions = deletions.length;
  const syncing = [SYNCING_REMOTE_DELETIONS, HANDLING_LOCAL_DELETIONS, FETCHING_IN_PROGRESS];
  const deletionsComplete = preUploadStatus === DELETE_AND_SYNC_COMPLETE;
  const deletionsInProgress = totalDeletions > 0 && !deletionsComplete;

  const syncInProgress = syncType === USER_TAPPED_BUTTON
    && syncing.includes( preUploadStatus );
  const pendingUpload = uploadStatus === UPLOAD_PENDING && numUnuploadedObservations > 0;
  const uploadInProgress = uploadStatus === UPLOAD_IN_PROGRESS && numUploadsAttempted > 0;
  const uploadsComplete = uploadStatus === UPLOAD_COMPLETE && numObservationsInQueue > 0;
  const totalUploadErrors = Object.keys( uploadErrorsByUuid ).length;

  const setDeletionsProgress = ( ) => {
    // TODO: we should emit deletions progress like we do for uploads for an accurate progress
    // right now, a user can only delete a single local upload at a time from ObsEdit
    // so we don't need a more robust count here (20240607)
    if ( totalDeletions === 0 ) {
      return 0;
    }
    if ( !deletionsComplete ) {
      return currentDeleteCount * DELETION_STARTED_PROGRESS;
    }
    return 1;
  };
  const deletionsProgress = setDeletionsProgress( );

  const deletionParams = useMemo( ( ) => ( {
    total: totalDeletions,
    currentDeleteCount
  } ), [
    totalDeletions,
    currentDeleteCount
  ] );

  const showFinalUploadError = ( totalUploadErrors > 0 && uploadsComplete )
  || ( totalUploadErrors > 0 && ( numUploadsAttempted === numObservationsInQueue ) );
  const showsExclamation = pendingUpload || showFinalUploadError;

  const rotating = syncInProgress || uploadInProgress || deletionsInProgress;
  const showsCheckmark = ( uploadsComplete && !uploadMultiError )
  || ( deletionsComplete && !deleteError && totalDeletions > 0 );

  const getStatusText = useCallback( ( ) => {
    if ( syncInProgress ) { return t( "Syncing" ); }

    if ( totalDeletions > 0 ) {
      if ( deletionsComplete ) {
        return t( "X-observations-deleted", { count: totalDeletions } );
      }
      // iPhone 4 pixel width
      return screenWidth <= 640
        ? t( "Deleting-x-of-y", deletionParams )
        : t( "Deleting-x-of-y-observations", deletionParams );
    }

    if ( pendingUpload ) {
      return t( "Upload-x-observations", { count: numUnuploadedObservations } );
    }

    if ( uploadInProgress ) {
      // iPhone 4 pixel width
      return screenWidth <= 640
        ? t( "Uploading-x-of-y", translationParams )
        : t( "Uploading-x-of-y-observations", translationParams );
    }

    if ( uploadsComplete ) {
      return t( "X-observations-uploaded", { count: numUploadsAttempted } );
    }

    return "";
  }, [
    deletionParams,
    deletionsComplete,
    numUploadsAttempted,
    numUnuploadedObservations,
    pendingUpload,
    syncInProgress,
    t,
    totalDeletions,
    translationParams,
    uploadInProgress,
    uploadsComplete
  ] );

  const errorText = useMemo( ( ) => {
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
    t,
    totalUploadErrors,
    uploadMultiError
  ] );

  const getSyncIconColor = useCallback( ( ) => {
    if ( showFinalUploadError ) {
      return theme.colors.error;
    }
    if ( pendingUpload || uploadInProgress ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  }, [
    theme,
    showFinalUploadError,
    pendingUpload,
    uploadInProgress
  ] );

  const statusText = getStatusText( );
  const syncIconColor = getSyncIconColor( );

  return (
    <Toolbar
      error={errorText}
      handleSyncButtonPress={handleSyncButtonPress}
      layout={layout}
      navToExplore={navToExplore}
      progress={deletionsProgress || totalToolbarProgress}
      rotating={rotating}
      showsCancelUploadButton={uploadInProgress}
      showsCheckmark={showsCheckmark}
      showsExclamation={showsExclamation}
      showsExploreIcon={currentUser}
      statusText={statusText}
      stopAllUploads={stopAllUploads}
      syncIconColor={syncIconColor}
      toggleLayout={toggleLayout}
    />
  );
};

export default ToolbarContainer;
