// @flow

import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useContext } from "react";
import {
  useCurrentUser
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

  const needsSync = item => !item._synced_at
    || item._synced_at <= item._updated_at;

  const currentProgress = uploadProgress?.[observation.uuid] || 0;
  const currentProgressIncrements = observation?.observationPhotos
    ? 1 + observation.observationPhotos.length
    : 1;

  const progress = currentProgress / currentProgressIncrements || 0;

  const startUpload = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }
    uploadObservation( observation, { isSingleUpload: true } );
  }, [
    currentUser,
    observation,
    setShowLoginSheet,
    uploadObservation
  ] );

  const showUploadStatus = !!( ( needsSync( observation ) || uploadProgress?.[observation.uuid] ) );

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
