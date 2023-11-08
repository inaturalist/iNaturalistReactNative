// @flow

import type { Node } from "react";
import React, { useCallback } from "react";

import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  observation: Object,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
  uploadObservation: Function,
  uploadState: Object
};

const ObsUploadStatusContainer = ( {
  observation,
  layout,
  white = false,
  classNameMargin,
  uploadObservation,
  uploadState
}: Props ): Node => {
  const { uploadProgress } = uploadState;

  const needsSync = item => !item._synced_at
    || item._synced_at <= item._updated_at;

  const currentProgress = uploadProgress?.[observation.uuid] || 0;
  const currentProgressIncrements = observation?.observationPhotos
    ? 1 + observation.observationPhotos.length
    : 1;

  const progress = currentProgress / currentProgressIncrements || 0;

  const startUpload = useCallback( ( ) => {
    uploadObservation( observation );
  }, [
    observation,
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
