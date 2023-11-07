// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useContext, useEffect } from "react";
import {
  useCurrentUser,
  useObservationsUpdates
} from "sharedHooks";

import Toolbar from "./Toolbar";

type Props = {
  toggleLayout: Function,
  layout: string,
  numUnuploadedObs: number,
  allObsToUpload: Array<Object>,
  setShowLoginSheet: Function
}

const ToolbarContainer = ( {
  toggleLayout, layout, numUnuploadedObs,
  allObsToUpload,
  setShowLoginSheet
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const syncObservations = obsEditContext?.syncObservations;
  const stopUpload = obsEditContext?.stopUpload;
  const uploadInProgress = obsEditContext?.uploadInProgress;
  const uploadMultipleObservations = obsEditContext?.uploadMultipleObservations;
  const progress = obsEditContext?.progress;
  const setUploads = obsEditContext?.setUploads;
  const uploads = obsEditContext?.uploads;
  const uploadError = obsEditContext?.error;
  const singleUpload = obsEditContext?.singleUpload;
  const currentUploadIndex = obsEditContext?.currentUploadIndex;
  const clearUploadProgress = obsEditContext?.clearUploadProgress;
  const navigation = useNavigation( );

  const totalUploadCount = uploads?.length || 0;

  const { refetch } = useObservationsUpdates( false );

  const handleSyncButtonPress = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }

    if ( numUnuploadedObs > 0 ) {
      setUploads( allObsToUpload );
    } else {
      syncObservations( );
      refetch( );
    }
  }, [
    allObsToUpload,
    currentUser,
    numUnuploadedObs,
    syncObservations,
    refetch,
    setShowLoginSheet,
    setUploads
  ] );

  const navToExplore = ( ) => navigation.navigate( "Explore" );

  useEffect( ( ) => {
    if ( uploads?.length > 0 && !singleUpload && uploadInProgress ) {
      uploadMultipleObservations( );
    }
  }, [uploads, uploadMultipleObservations, singleUpload, uploadInProgress] );

  // clear upload status when leaving screen
  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        stopUpload( );
      } );
      navigation.addListener( "focus", ( ) => {
        clearUploadProgress( );
      } );
    },
    [navigation, stopUpload, clearUploadProgress]
  );

  return (
    <Toolbar
      handleSyncButtonPress={handleSyncButtonPress}
      uploadError={uploadError && !uploadInProgress
        ? uploadError
        : null}
      uploadInProgress={uploadInProgress}
      stopUpload={stopUpload}
      progress={progress}
      numUnuploadedObs={numUnuploadedObs}
      showsExploreIcon={currentUser}
      navToExplore={navToExplore}
      toggleLayout={toggleLayout}
      layout={layout}
      currentUploadIndex={currentUploadIndex}
      totalUploadCount={totalUploadCount}
    />
  );
};

export default ToolbarContainer;
