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
  const totalToolbarProgress = useStore( state => state.totalToolbarProgress );
  const uploadStatus = useStore( state => state.uploadStatus );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const stopAllUploads = useStore( state => state.stopAllUploads );
  const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );
  const numUnuploadedObs = allUnsyncedObservations.length;
  const numUploadsAttempted = useStore( state => state.numUploadsAttempted );

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

  const handleSyncButtonPress = useCallback( async ( ) => {
    if ( numUnuploadedObs > 0 ) {
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
    numUnuploadedObs,
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
  const progress = totalToolbarProgress;
  const rotating = syncInProgress || uploadStatus === "uploadInProgress" || deletionsInProgress;
  const showsCheckmark = ( uploadStatus === "complete" && !uploadMultiError )
    || ( deletionsComplete && !deleteError );
  const needsSync = uploadStatus !== "uploadInProgress"
    && ( numUnuploadedObs > 0 || uploadMultiError );

  const getStatusText = useCallback( ( ) => {
    const deletionParams = {
      total: totalDeletions,
      currentDeleteCount
    };

    if ( syncInProgress ) {
      return t( "Syncing" );
    }

    if ( totalDeletions > 0 ) {
      if ( deletionsComplete ) {
        return t( "X-observations-deleted", { count: totalDeletions } );
      }
      // iPhone 4 pixel width
      if ( screenWidth <= 640 ) {
        return t( "Deleting-x-of-y", deletionParams );
      }

      return t( "Deleting-x-of-y-observations", deletionParams );
    }

    if ( uploadStatus === "pending" && numUnuploadedObs > 0 ) {
      return t( "Upload-x-observations", { count: numUnuploadedObs } );
    }

    // Note that numObservationsInQueue is kind of the number of obs being uploaded in
    // the current upload session, so it might be 1 if a single obs is
    // being uploaded even though 5 obs need upload
    if ( uploadStatus === "uploadInProgress" ) {
      // iPhone 4 pixel width
      if ( screenWidth <= 640 ) {
        return t( "Uploading-x-of-y", translationParams );
      }

      return t( "Uploading-x-of-y-observations", translationParams );
    }

    if ( uploadStatus === "complete" ) {
      return t( "X-observations-uploaded", { count: numUploadsAttempted } );
    }

    return "";
  }, [
    currentDeleteCount,
    deletionsComplete,
    numUnuploadedObs,
    numUploadsAttempted,
    syncInProgress,
    t,
    totalDeletions,
    translationParams,
    uploadStatus
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
      needsSync={needsSync}
      progress={deletionsProgress || progress}
      rotating={rotating}
      showsCancelUploadButton={uploadStatus === "uploadInProgress"}
      showsCheckmark={showsCheckmark}
      showsExploreIcon={currentUser}
      statusText={statusText}
      stopAllUploads={stopAllUploads}
      syncIconColor={syncIconColor}
      toggleLayout={toggleLayout}
    />
  );
};

export default ToolbarContainer;
