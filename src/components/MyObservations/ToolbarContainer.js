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
import useStore from "stores/useStore";

import Toolbar from "./Toolbar";

const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get( );

type Props = {
  layout: string,
  numUnuploadedObs: number,
  syncObservations: Function,
  toggleLayout: Function,
  uploadMultipleObservations: Function,
  syncInProgress: boolean
}

const ToolbarContainer = ( {
  layout,
  numUnuploadedObs,
  syncObservations,
  toggleLayout,
  uploadMultipleObservations,
  syncInProgress
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );
  const deletions = useStore( state => state.deletions );
  const deletionsComplete = useStore( state => state.deletionsComplete );
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const deleteError = useStore( state => state.deleteError );
  const deletionsInProgress = useStore( state => state.deletionsInProgress );
  const toolbarProgress = useStore( state => state.toolbarProgress );
  const uploadMultiError = useStore( state => state.multiError );
  const uploadErrorsByUuid = useStore( state => state.errorsByUuid );
  const uploadInProgress = useStore( state => state.uploadInProgress );
  const uploadsComplete = useStore( state => state.uploadsComplete );
  const numToUpload = useStore( state => state.numToUpload );
  const numFinishedUploads = useStore( state => state.numFinishedUploads );
  const uploaded = useStore( state => state.uploaded );

  const totalDeletions = deletions.length;
  const deletionsProgress = totalDeletions > 0
    ? currentDeleteCount / totalDeletions
    : 0;

  const handleSyncButtonPress = useCallback( async ( ) => {
    if ( numUnuploadedObs > 0 ) {
      await uploadMultipleObservations( );
    } else {
      syncObservations( );
    }
  }, [
    numUnuploadedObs,
    syncObservations,
    uploadMultipleObservations
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
  const progress = toolbarProgress;
  const rotating = syncInProgress || uploadInProgress || deletionsInProgress;
  const showsCheckmark = ( uploadsComplete && !uploadMultiError )
    || ( deletionsComplete && !deleteError );
  const needsSync = !uploadInProgress
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

    if ( uploadInProgress ) {
      const translationParams = {
        total: numToUpload,
        currentUploadCount: Math.min( numFinishedUploads + 1, numToUpload )
      };
      // iPhone 4 pixel width
      if ( screenWidth <= 640 ) {
        return t( "Uploading-x-of-y", translationParams );
      }

      return t( "Uploading-x-of-y-observations", translationParams );
    }

    if ( uploadsComplete ) {
      // Note that numToUpload is kind of the number of obs being uploaded in
      // the current upload session, so it might be 1 if a single obs is
      // being uploaded even though 5 obs need upload
      return t( "X-observations-uploaded", { count: uploaded.length } );
    }

    if ( numUnuploadedObs && numUnuploadedObs !== 0 ) {
      return t( "Upload-x-observations", { count: numUnuploadedObs } );
    }

    return "";
  }, [
    currentDeleteCount,
    deletionsComplete,
    numUnuploadedObs,
    t,
    totalDeletions,
    numToUpload,
    numFinishedUploads,
    uploadsComplete,
    uploadInProgress,
    syncInProgress,
    uploaded.length
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
    if ( uploadInProgress ) {
      return theme.colors.secondary;
    }
    if ( errorText ) {
      return theme.colors.error;
    }
    if ( numUnuploadedObs > 0 ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  }, [
    errorText,
    numUnuploadedObs,
    theme,
    uploadInProgress
  ] );

  const statusText = getStatusText( );
  const syncIconColor = getSyncIconColor( );

  return (
    <Toolbar
      handleSyncButtonPress={handleSyncButtonPress}
      layout={layout}
      navToExplore={navToExplore}
      needsSync={needsSync}
      progress={deletionsProgress || progress}
      rotating={rotating}
      showsCancelUploadButton={uploadInProgress}
      showsCheckmark={showsCheckmark}
      showsExploreIcon={currentUser}
      statusText={statusText}
      syncIconColor={syncIconColor}
      toggleLayout={toggleLayout}
      error={errorText}
    />
  );
};

export default ToolbarContainer;
