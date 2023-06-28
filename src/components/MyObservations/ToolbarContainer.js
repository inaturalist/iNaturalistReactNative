// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect } from "react";
import { Alert, Dimensions, PixelRatio } from "react-native";
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
  const currentUploadIndex = obsEditContext?.currentUploadIndex;
  const progress = obsEditContext?.progress;
  const setUploads = obsEditContext?.setUploads;
  const uploads = obsEditContext?.uploads;
  const totalUploadCount = obsEditContext?.totalUploadCount;
  const uploadError = obsEditContext?.error;
  const singleUpload = obsEditContext?.singleUpload;
  const navigation = useNavigation( );
  const isOnline = useIsConnected( );

  const screenWidth = Dimensions.get( "window" ).width * PixelRatio.get();

  const { refetch } = useObservationsUpdates( false );

  const getStatusText = ( ) => {
    if ( progress === 1 ) {
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

  const statusText = getStatusText( );

  const needsSync = ( ) => (
    ( numUnuploadedObs > 0 && !uploadInProgress ) || uploadError
  );

  useEffect( ( ) => {
    if ( uploads?.length > 0 && !singleUpload ) {
      uploadMultipleObservations( );
    }
  }, [uploads, uploadMultipleObservations, singleUpload] );

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
      needsSync={needsSync}
    />
  );
};

export default ToolbarContainer;
