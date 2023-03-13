// @flow
import { UploadStatus } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useUploadProgress from "sharedHooks/useUploadProgress";

import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadButton";

type Props = {
  observation: Object,
  obsStatusLayout: "vertical" | "horizontal",
  hideUploadInfo?: boolean,
  obsStatusWhite?: boolean
};

const ObservationInfo = ( {
  observation,
  obsStatusWhite = false,
  obsStatusLayout,
  hideUploadInfo = false
}: Props ): Node => {
  const needsSync = observation?.needsSync?.();
  const { uploadProgress } = useUploadProgress();

  const obsStatus = (
    <ObsStatus observation={observation} layout={obsStatusLayout} white={obsStatusWhite} />
  );

  if ( hideUploadInfo ) {
    return obsStatus;
  }

  const obsProgress = uploadProgress?.[observation.uuid];
  if ( needsSync && typeof obsProgress !== "number" ) {
    return <UploadButton observation={observation} />;
  } if ( typeof obsProgress === "number" ) {
    return <UploadStatus progress={obsProgress} />;
  }

  return obsStatus;
};

export default ObservationInfo;
