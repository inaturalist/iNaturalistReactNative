// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Dimensions, PixelRatio } from "react-native";
import { EventRegister } from "react-native-event-listeners";
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
  const navigation = useNavigation( );
  const isOnline = useIsConnected( );
  const {
    stopUpload,
    uploadInProgress,
    uploadMultipleObservations,
    error: uploadError,
    currentUploadIndex
  } = obsEditContext;
  const [totalUploadCount, setTotalUploadCount] = useState( allObsToUpload.length );
  const [totalProgressIncrements, setTotalProgressIncrements] = useState(
    allObsToUpload.length + allObsToUpload
      .reduce( ( count, current ) => count
       + current.observationPhotos.length, 0 )
  );
  const [totalUploadProgress, setTotalUploadProgress] = useState( 0 );

  const progress = totalProgressIncrements > 0
    ? totalUploadProgress / totalProgressIncrements
    : 0;

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
      setTotalUploadCount( allObsToUpload.length );
      setTotalProgressIncrements( allObsToUpload.length + allObsToUpload
        .reduce( ( count, current ) => count
         + current.observationPhotos.length, 0 ) );
      uploadMultipleObservations( allObsToUpload );
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

  // clear upload status when leaving screen
  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        stopUpload( );
        obsEditContext?.setUploadProgress( { } );
        setTotalUploadProgress( 0 );
        setTotalProgressIncrements( 0 );
        setTotalUploadCount( 0 );
      } );
    },
    [navigation, obsEditContext, stopUpload]
  );

  useEffect( ( ) => {
    const progressListener = EventRegister.addEventListener(
      "INCREMENT_TOTAL_UPLOAD_PROGRESS",
      currentProgress => {
        const updatedProgress = totalUploadProgress + currentProgress;
        setTotalUploadProgress( updatedProgress );
      }
    );
    return ( ) => {
      EventRegister.removeEventListener( progressListener );
    };
  }, [totalUploadProgress] );

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
