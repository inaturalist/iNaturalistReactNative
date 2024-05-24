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
  const totalUploadProgress = useStore( state => state.totalUploadProgress );

  const needsSync = item => !item._synced_at
    || item._synced_at <= item._updated_at;

  const currentObservation = totalUploadProgress.find( o => o.uuid === observation.uuid );
  const showUploadStatus = !!( ( needsSync( observation ) || currentObservation ) );

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
    />
  );
};

export default ObsUploadStatusContainer;
