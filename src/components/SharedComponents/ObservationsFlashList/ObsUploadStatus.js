// @flow

import { ObsStatus, UploadStatus } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  classNameMargin?: string,
  explore?: boolean,
  handleIndividualUploadPress: ( ) => void,
  layout?: "horizontal" | "vertical",
  observation: Object,
  showObsStatus?: boolean,
  showUploadStatus?: boolean,
  white?: boolean
};

const ObsUploadStatus = ( {
  classNameMargin,
  explore = false,
  handleIndividualUploadPress,
  layout,
  observation,
  showObsStatus = false,
  showUploadStatus = false,
  white = false
}: Props ): Node => {
  const hideStatus = !showUploadStatus && !showObsStatus && !explore;
  const showObsStatusOnly = ( !showUploadStatus && showObsStatus ) || explore;
  const obsStatus = (
    <ObsStatus
      observation={observation}
      layout={layout}
      white={white}
      classNameMargin={classNameMargin}
      testID={`ObsStatus.${observation.uuid}`}
    />
  );

  if ( hideStatus ) {
    return null;
  }

  if ( showObsStatusOnly ) {
    return obsStatus;
  }

  return (
    <UploadStatus
      white={white}
      handleIndividualUploadPress={handleIndividualUploadPress}
      layout={layout}
      uuid={observation.uuid}
    >
      {obsStatus}
    </UploadStatus>
  );
};

export default ObsUploadStatus;
