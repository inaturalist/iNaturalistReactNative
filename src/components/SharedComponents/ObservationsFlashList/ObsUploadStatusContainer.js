// @flow

import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useContext, useMemo } from "react";
import { Alert } from "react-native";
import {
  useCurrentUser,
  useIsConnected,
  useTranslation
} from "sharedHooks";

import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  observation: Object,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
  setShowLoginSheet: Function
};

const ObsUploadStatusContainer = ( {
  observation,
  layout,
  white = false,
  classNameMargin,
  setShowLoginSheet
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const obsEditContext = useContext( ObsEditContext );
  const uploadObservation = obsEditContext?.uploadObservation;
  const uploadProgress = obsEditContext?.uploadProgress;
  const isConnected = useIsConnected( );
  const { t } = useTranslation( );

  const needsSync = item => !item._synced_at
    || item._synced_at <= item._updated_at;

  const currentProgress = useMemo(
    ( ) => uploadProgress?.[observation.uuid] || 0,
    [observation, uploadProgress]
  );
  const currentProgressIncrements = useMemo( ( ) => ( observation?.observationPhotos
    ? 1 + observation.observationPhotos.length
    : 1 ), [observation?.observationPhotos] );

  const progress = useMemo(
    ( ) => currentProgress / currentProgressIncrements || 0,
    [currentProgress, currentProgressIncrements]
  );

  const startUpload = useCallback( ( ) => {
    if ( !isConnected ) {
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
    uploadObservation( observation, { isSingleUpload: true } );
  }, [
    currentUser,
    isConnected,
    observation,
    setShowLoginSheet,
    t,
    uploadObservation
  ] );

  const showUploadStatus = useMemo(
    ( ) => !!( ( needsSync( observation ) || uploadProgress?.[observation.uuid] ) ),
    [observation, uploadProgress]
  );

  return (
    <ObsUploadStatus
      observation={observation}
      layout={layout}
      white={white}
      classNameMargin={classNameMargin}
      startUpload={startUpload}
      showUploadStatus={showUploadStatus}
      progress={progress}
    />
  );
};

export default ObsUploadStatusContainer;
