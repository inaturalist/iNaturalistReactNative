// @flow

import { useNavigation } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useMemo } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";
import {
  useCurrentUser,
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";

import Toolbar from "./Toolbar";

const { useRealm } = RealmContext;

const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get( );

type Props = {
  checkUserCanUpload: Function,
  layout: string,
  syncInProgress: boolean,
  syncObservations: Function,
  toggleLayout: Function
}

const ToolbarContainer = ( {
  checkUserCanUpload,
  layout,
  syncInProgress,
  syncObservations,
  toggleLayout
}: Props ): Node => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const deletions = useStore( state => state.deletions );
  const deletionsComplete = useStore( state => state.deletionsComplete );
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const deleteError = useStore( state => state.deleteError );
  const deletionsInProgress = useStore( state => state.deletionsInProgress );
  const uploadMultiError = useStore( state => state.multiError );
  const uploadErrorsByUuid = useStore( state => state.errorsByUuid );
  const numObservationsInQueue = useStore( state => state.numObservationsInQueue );
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );
  const totalToolbarProgress = useStore( state => state.totalToolbarProgress );
  const uploadStatus = useStore( state => state.uploadStatus );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const stopAllUploads = useStore( state => state.stopAllUploads );
  const numUploadsAttempted = useStore( state => state.numUploadsAttempted );
  const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );

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
  const deletionParams = useMemo( ( ) => ( {
    total: totalDeletions,
    currentDeleteCount
  } ), [
    totalDeletions,
    currentDeleteCount
  ] );

  const handleSyncButtonPress = useCallback( async ( ) => {
    if ( numUnuploadedObservations > 0 ) {
      const uploadUuids = allUnsyncedObservations.map( o => o.uuid );
      addToUploadQueue( uploadUuids );
      checkUserCanUpload( );
    } else {
      syncObservations( );
    }
  }, [
    addToUploadQueue,
    allUnsyncedObservations,
    checkUserCanUpload,
    numUnuploadedObservations,
    syncObservations
  ] );

  const navToExplore = useCallback(
    ( ) => navigation.navigate( "Explore", {
      user: currentUser,
      worldwide: true,
      resetStoredParams: true
    } ),
    [navigation, currentUser]
  );

  const { t } = useTranslation( );
  const theme = useTheme( );
  const rotating = syncInProgress || uploadStatus === "uploadInProgress" || deletionsInProgress;
  const showsCheckmark = ( uploadStatus === "complete" && !uploadMultiError )
    || ( deletionsComplete && !deleteError );
  const showsExclamation = ( uploadStatus === "pending" && numUnuploadedObservations > 0 )
    || uploadMultiError;
  const pendingUpload = uploadStatus === "pending" && numUnuploadedObservations > 0;
  const uploadInProgress = uploadStatus === "uploadInProgress" && numUploadsAttempted > 0;
  const uploadsComplete = uploadStatus === "complete" && numObservationsInQueue > 0;

  const getStatusText = useCallback( ( ) => {
    if ( syncInProgress ) { return t( "Syncing" ); }

    if ( deletionParams.total > 0 ) {
      if ( deletionsComplete ) {
        return t( "X-observations-deleted", { count: deletionParams.total } );
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
    translationParams,
    uploadInProgress,
    uploadsComplete
  ] );

  const errorText = useMemo( ( ) => {
    let error;
    if ( deleteError ) {
      error = deleteError;
    } else if ( Object.keys( uploadErrorsByUuid ).length > 0 ) {
      error = t( "x-uploads-failed", { count: Object.keys( uploadErrorsByUuid ).length } );
    } else {
      error = uploadMultiError;
    }
    return error;
  }, [
    deleteError,
    t,
    uploadErrorsByUuid,
    uploadMultiError
  ] );

  const getSyncIconColor = useCallback( ( ) => {
    if ( uploadStatus === "uploadInProgress" ) {
      return theme.colors.secondary;
    }
    if ( errorText ) {
      return theme.colors.error;
    }
    if ( uploadStatus === "pending" ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  }, [
    errorText,
    theme,
    uploadStatus
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
      showsCancelUploadButton={uploadStatus === "uploadInProgress"}
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
