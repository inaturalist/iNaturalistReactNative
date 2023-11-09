// @flow

import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React, { useCallback } from "react";
import {
  useCurrentUser,
  useObservationsUpdates
} from "sharedHooks";

import Toolbar from "./Toolbar";

type Props = {
  toggleLayout: Function,
  layout: string,
  numUnuploadedObs: number,
  uploadState: Object,
  uploadMultipleObservations: Function,
  stopUpload: Function,
  syncObservations: Function,
  toolbarProgress: number
}

const ToolbarContainer = ( {
  toggleLayout,
  layout,
  numUnuploadedObs,
  uploadState,
  uploadMultipleObservations,
  stopUpload,
  syncObservations,
  toolbarProgress
}: Props ): Node => {
  const {
    uploads,
    error: uploadError,
    currentUploadIndex,
    uploadInProgress,
    uploadsComplete
  } = uploadState;
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );

  const totalUploadCount = uploads?.length || 0;

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

  const navToExplore = ( ) => navigation.navigate( "Explore" );

  return (
    <Toolbar
      handleSyncButtonPress={handleSyncButtonPress}
      uploadError={uploadError && !uploadInProgress
        ? uploadError
        : null}
      uploadInProgress={uploadInProgress}
      stopUpload={stopUpload}
      progress={toolbarProgress}
      numUnuploadedObs={numUnuploadedObs}
      showsExploreIcon={currentUser}
      navToExplore={navToExplore}
      toggleLayout={toggleLayout}
      layout={layout}
      currentUploadIndex={currentUploadIndex}
      totalUploadCount={totalUploadCount}
      uploadsComplete={uploadsComplete}
    />
  );
};

export default ToolbarContainer;
