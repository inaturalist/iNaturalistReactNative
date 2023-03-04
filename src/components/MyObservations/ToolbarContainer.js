// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import {
  Dimensions, PixelRatio
} from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";

import Toolbar from "./Toolbar";

type Props = {
  setLayout: Function,
  layout: string,
  numUnuploadedObs: number
}

const ToolbarContainer = ( {
  setLayout, layout, numUnuploadedObs
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const { allObsToUpload } = useLocalObservations( );
  const navigation = useNavigation( );
  const {
    stopUpload,
    uploadInProgress,
    startUpload,
    progress,
    error: uploadError,
    currentUploadIndex,
    totalUploadCount
  } = useUploadObservations( allObsToUpload );
  const uploadComplete = progress === 1;

  const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get();

  const loading = obsEditContext?.loading;
  const syncObservations = obsEditContext?.syncObservations;
  const setShowLoginSheet = obsEditContext?.setShowLoginSheet;

  const getStatusText = ( ) => {
    if ( numUnuploadedObs <= 0 ) {
      return null;
    }

    if ( !uploadInProgress ) {
      return t( "Upload-x-observations", { count: numUnuploadedObs } );
    }

    if ( uploadComplete ) {
      return t( "X-observations-uploaded", { count: totalUploadCount } );
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
    }
  };

  const navToExplore = ( ) => navigation.navigate( "MainStack", { screen: "Explore" } );

  const toggleLayout = ( ) => setLayout( currentView => {
    if ( currentView === "list" ) {
      return "grid";
    }
    return "list";
  } );

  const statusText = getStatusText( );

  return (
    <Toolbar
      statusText={statusText}
      handleSyncButtonPress={handleSyncButtonPress}
      syncDisabled={loading || uploadInProgress}
      uploadError={uploadError}
      uploadInProgress={uploadInProgress}
      stopUpload={stopUpload}
      progress={progress}
      numUnuploadedObs={numUnuploadedObs}
      currentUser={currentUser}
      navToExplore={navToExplore}
      toggleLayout={toggleLayout}
      layout={layout}
    />
  );
};

export default ToolbarContainer;
