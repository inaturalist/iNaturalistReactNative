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

  const totalDeletions = deletions.length;
  const deletionsProgress = totalDeletions > 0
    ? currentDeleteCount / totalDeletions
    : 0;

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

  const syncing = [SYNCING_REMOTE_DELETIONS, HANDLING_LOCAL_DELETIONS, FETCHING_IN_PROGRESS];

  const deletionsComplete = preUploadStatus === DELETE_AND_SYNC_COMPLETE;
  const syncInProgress = syncType === USER_TAPPED_BUTTON
    && syncing.includes( preUploadStatus );
  const pendingUpload = uploadStatus === UPLOAD_PENDING && numUnuploadedObservations > 0;
  const uploadInProgress = uploadStatus === UPLOAD_IN_PROGRESS && numUploadsAttempted > 0;
  const uploadsComplete = uploadStatus === UPLOAD_COMPLETE && numObservationsInQueue > 0;
  const totalUploadErrors = Object.keys( uploadErrorsByUuid ).length;

  const showFinalUploadError = ( totalUploadErrors > 0 && uploadsComplete )
    || ( totalUploadErrors > 0 && ( numUploadsAttempted === numObservationsInQueue ) );

  const rotating = syncInProgress || uploadInProgress;
  const showsCheckmark = ( uploadsComplete && !uploadMultiError )
    || ( deletionsComplete && !deleteError && totalDeletions > 0 );

  const showsExclamation = pendingUpload || showFinalUploadError;

  const getStatusText = useCallback( ( ) => {
    if ( syncInProgress ) { return t( "Syncing" ); }

    if ( deletionsComplete && totalDeletions > 0 ) {
      return t( "X-observations-deleted", { count: totalDeletions } );
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
