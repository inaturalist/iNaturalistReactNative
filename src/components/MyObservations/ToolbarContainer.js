// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useCallback } from "react";
import { Dimensions, PixelRatio } from "react-native";
import { useTheme } from "react-native-paper";
import {
  useCurrentUser,
  useObservationsUpdates,
  useTranslation
} from "sharedHooks";

import useDeleteObservations from "./hooks/useDeleteObservations";
import Toolbar from "./Toolbar";

const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get( );

type Props = {
  layout: string,
  numUnuploadedObs: number,
  stopUploads: Function,
  syncObservations: Function,
  toggleLayout: Function,
  toolbarProgress: number,
  uploadMultipleObservations: Function,
  uploadState: Object
}

const ToolbarContainer = ( {
  layout,
  numUnuploadedObs,
  stopUploads,
  syncObservations,
  toggleLayout,
  toolbarProgress,
  uploadMultipleObservations,
  uploadState
}: Props ): Node => {
  const deletionState = useDeleteObservations( );
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );

  const {
    currentDeleteCount,
    deletions,
    deletionsInProgress,
    deletionsComplete,
    error: deleteError
  } = deletionState;
  const totalDeletions = deletions.length;
  const deletionsProgress = totalDeletions > 0
    ? currentDeleteCount / totalDeletions
    : 0;

  console.log( deletionsProgress, "deletions progress" );

  const {
    uploads,
    error: uploadError,
    uploadInProgress,
    uploadsComplete,
    currentUploadCount
  } = uploadState;

  const { refetch } = useObservationsUpdates( false );

  const handleSyncButtonPress = useCallback( ( ) => {
    if ( numUnuploadedObs > 0 ) {
      uploadMultipleObservations( );
    } else {
      syncObservations( );
      refetch( );
    }
  }, [
    numUnuploadedObs,
    syncObservations,
    refetch,
    uploadMultipleObservations
  ] );

  const navToExplore = useCallback( ( ) => navigation.navigate( "Explore" ), [navigation] );

  const { t } = useTranslation( );
  const theme = useTheme( );
  const progress = toolbarProgress;
  const rotating = uploadInProgress || deletionsInProgress;
  const showsCheckmark = ( uploadsComplete && !uploadError )
    || ( deletionsComplete && !deleteError );
  const needsSync = !uploadInProgress
    && ( numUnuploadedObs > 0 || uploadError );

  const getStatusText = useCallback( ( ) => {
    const totalUploadCount = uploads?.length || 0;

    const deletionParams = {
      total: totalDeletions,
      currentDeleteCount
    };
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
        total: totalUploadCount,
        currentUploadCount
      };
      // iPhone 4 pixel width
      if ( screenWidth <= 640 ) {
        return t( "Uploading-x-of-y", translationParams );
      }

      return t( "Uploading-x-of-y-observations", translationParams );
    }

    if ( uploadsComplete ) {
      return t( "X-observations-uploaded", { count: totalUploadCount } );
    }

    return numUnuploadedObs !== 0
      ? t( "Upload-x-observations", { count: numUnuploadedObs } )
      : "";
  }, [
    currentDeleteCount,
    currentUploadCount,
    deletionsComplete,
    numUnuploadedObs,
    t,
    totalDeletions,
    uploads,
    uploadsComplete,
    uploadInProgress
  ] );

  const getSyncIconColor = useCallback( ( ) => {
    if ( uploadError ) {
      return theme.colors.error;
    } if ( uploadInProgress || numUnuploadedObs > 0 ) {
      return theme.colors.secondary;
    }
    return theme.colors.primary;
  }, [theme, uploadInProgress, uploadError, numUnuploadedObs] );

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
      stopUploads={stopUploads}
      syncIconColor={syncIconColor}
      toggleLayout={toggleLayout}
      error={deletionsInProgress
        ? deleteError
        : uploadError}
    />
  );
};

export default ToolbarContainer;
