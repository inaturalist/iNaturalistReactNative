// @flow

import type { Node } from "react";
import React from "react";
import useStore from "stores/useStore";

import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  observation: Object,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
  uploadSingleObservation?: Function
};

const ObsUploadStatusContainer = ( {
  observation,
  layout,
  white = false,
  classNameMargin,
  uploadSingleObservation
}: Props ): Node => {
  const uploadProgress = useStore( state => state.uploadProgress );

  const needsSync = item => !item._synced_at
    || item._synced_at <= item._updated_at;

  const currentProgress = uploadProgress?.[observation.uuid] || 0;
  const currentProgressIncrements = observation?.observationPhotos
    ? 1 + observation.observationPhotos.length
    : 1;

  const progress = currentProgress / currentProgressIncrements || 0;

  const showUploadStatus = !!( ( needsSync( observation ) || uploadProgress?.[observation.uuid] ) );

  return (
    <ObsUploadStatus
      observation={observation}
      layout={layout}
      white={white}
      classNameMargin={classNameMargin}
      uploadSingleObservation={( ) => {
        if ( uploadSingleObservation ) {
          uploadSingleObservation( observation );
        }
      }}
      showUploadStatus={showUploadStatus}
      progress={progress}
    />
  );
};

export default ObsUploadStatusContainer;
