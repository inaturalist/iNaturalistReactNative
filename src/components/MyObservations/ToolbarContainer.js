// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect } from "react";
import { Alert } from "react-native";
import {
  useCurrentUser,
  useIsConnected,
  useObservationsUpdates,
  useTranslation
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
  const { t } = useTranslation( );
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
  const totalUploadCount = obsEditContext?.totalUploadCount;
  const navigation = useNavigation( );
  const isOnline = useIsConnected( );

  const { refetch } = useObservationsUpdates( false );

  const handleSyncButtonPress = ( ) => {
    if ( !isOnline ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
      return;
    }

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
  };

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
    },
    [navigation, stopUpload]
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
      currentUser={currentUser}
      navToExplore={navToExplore}
      toggleLayout={toggleLayout}
      layout={layout}
      currentUploadIndex={currentUploadIndex}
      totalUploadCount={totalUploadCount}
    />
  );
};

export default ToolbarContainer;
