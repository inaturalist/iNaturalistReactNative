// @flow

import { ObsStatus, UploadStatus } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  checkUserCanUpload: Function,
  classNameMargin?: string,
  layout?: "horizontal" | "vertical",
  observation: Object,
  showUploadStatus: boolean,
  white?: boolean
};

const ObsUploadStatus = ( {
  checkUserCanUpload,
  classNameMargin,
  layout,
  observation,
  showUploadStatus,
  white = false
}: Props ): Node => {
  const theme = useTheme( );
  const whiteColor = white && theme.colors.onPrimary;

  const obsStatus = (
    <ObsStatus
      observation={observation}
      layout={layout}
      white={white}
      classNameMargin={classNameMargin}
      testID={`ObsStatus.${observation.uuid}`}
    />
  );

  if ( !showUploadStatus ) {
    return obsStatus;
  }

  return (
    <UploadStatus
      checkUserCanUpload={checkUserCanUpload}
      color={whiteColor}
      completeColor={whiteColor}
      layout={layout}
      uuid={observation.uuid}
    >
      {obsStatus}
    </UploadStatus>
  );
};

export default ObsUploadStatus;
