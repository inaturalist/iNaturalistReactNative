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
  stopUploads: Function,
  syncObservations: Function,
  toolbarProgress: number
}

const ToolbarContainer = ( {
  toggleLayout,
  layout,
  numUnuploadedObs,
  uploadState,
  uploadMultipleObservations,
  stopUploads,
  syncObservations,
  toolbarProgress
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const navigation = useNavigation( );

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

  return (
    <Toolbar
      handleSyncButtonPress={handleSyncButtonPress}
      stopUploads={stopUploads}
      progress={toolbarProgress}
      numUnuploadedObs={numUnuploadedObs}
      showsExploreIcon={currentUser}
      navToExplore={navToExplore}
      toggleLayout={toggleLayout}
      layout={layout}
      uploadState={uploadState}
    />
  );
};

export default ToolbarContainer;
