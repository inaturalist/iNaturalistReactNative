// @flow

import { ObsStatus, UploadStatus } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  observation: object,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
  uploadSingleObservation: ( ) => void,
  showUploadStatus: boolean,
  progress: number
};

const ObsUploadStatus = ( {
  observation,
  layout,
  white = false,
  classNameMargin,
  uploadSingleObservation,
  showUploadStatus,
  progress
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
      progress={progress}
      uploadObservation={uploadSingleObservation}
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
