// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect } from "react";
import {
  Dimensions, PixelRatio
} from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useObservationsUpdates from "sharedHooks/useObservationsUpdates";
import useTranslation from "sharedHooks/useTranslation";

import Toolbar from "./Toolbar";

type Props = {
  setLayout: Function,
  layout: string,
  numUnuploadedObs: number,
  uploadStatus: Object,
  setShowLoginSheet: Function
}

const ToolbarContainer = ( {
  setLayout, layout, numUnuploadedObs,
  uploadStatus,
  setShowLoginSheet
}: Props ): Node => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const {
    stopUpload,
    uploadInProgress,
    startUpload,
    progress,
    error: uploadError,
    currentUploadIndex,
    totalUploadCount
  } = uploadStatus;
  const uploadComplete = progress === 1;

  const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get();

  const syncObservations = obsEditContext?.syncObservations;

  const { refetch } = useObservationsUpdates( );

  const getStatusText = ( ) => {
    if ( uploadComplete ) {
      return t( "X-observations-uploaded", { count: totalUploadCount } );
    }

    if ( numUnuploadedObs <= 0 ) {
      return null;
    }

    if ( !uploadInProgress ) {
      return t( "Upload-x-observations", { count: numUnuploadedObs } );
    }

    const translationParams = {
      total: totalUploadCount,
      uploadedCount: currentUploadIndex + 1
    };

    // iPhone 4 pixel width
    if ( screenWidth <= 640 ) {
      return t( "Uploading-x-of-y", translationParams );
    }

    return t( "Uploading-x-of-y-observations", translationParams );
  };

  const handleSyncButtonPress = ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }

    if ( numUnuploadedObs > 0 ) {
      startUpload( );
    } else {
      syncObservations( );
      refetch( );
    }
  };

  const navToExplore = ( ) => navigation.navigate( "Explore" );

  const toggleLayout = ( ) => setLayout( currentView => {
    if ( currentView === "list" ) {
      return "grid";
    }
    return "list";
  } );

  const statusText = getStatusText( );

  const getSyncIcon = ( ) => {
    if ( ( numUnuploadedObs > 0 && !uploadInProgress ) || uploadError ) {
      return "sync-unsynced";
    }
    return "sync";
  };

  // clear upload status when leaving screen
  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        uploadStatus.stopUpload( );
        obsEditContext?.setUploadProgress( { } );
      } );
    },
    [navigation, uploadStatus, obsEditContext]
  );

  return (
    <Toolbar
      statusText={statusText}
      handleSyncButtonPress={handleSyncButtonPress}
      uploadError={uploadError}
      uploadInProgress={uploadInProgress}
      stopUpload={stopUpload}
      progress={progress}
      numUnuploadedObs={numUnuploadedObs}
      currentUser={currentUser}
      navToExplore={navToExplore}
      toggleLayout={toggleLayout}
      layout={layout}
      getSyncIcon={getSyncIcon}
    />
  );
};

export default ToolbarContainer;
