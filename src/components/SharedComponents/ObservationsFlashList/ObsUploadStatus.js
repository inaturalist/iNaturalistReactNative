// @flow

import { ObsStatus, UploadStatus } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  classNameMargin?: string,
  handleIndividualUploadPress: Function,
  layout?: "horizontal" | "vertical",
  observation: Object,
  showUploadStatus: boolean,
  white?: boolean,
};

const ObsUploadStatus = ( {
  classNameMargin,
  handleIndividualUploadPress,
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
      color={whiteColor}
      completeColor={whiteColor}
      handleIndividualUploadPress={handleIndividualUploadPress}
      layout={layout}
      uuid={observation.uuid}
    >
      {obsStatus}
    </UploadStatus>
  );
};

export default ObsUploadStatus;
