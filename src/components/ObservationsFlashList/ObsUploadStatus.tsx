import { ObsStatus, UploadStatus } from "components/SharedComponents";
import React from "react";
import { useDebugMode } from "sharedHooks";

interface Props {
  classNameMargin?: string;
  explore?: boolean;
  layout?: "horizontal" | "vertical";
  observation: Object;
  onPress: Function;
  progress?: number;
  queued: boolean;
  showObsStatus?: boolean;
  white?: boolean;
}

const ObsUploadStatus = ( {
  classNameMargin,
  explore = false,
  onPress,
  layout,
  observation,
  progress,
  queued,
  showObsStatus = false,
  white = false
}: Props ) => {
  const showUploadStatus = typeof ( progress ) === "number";
  const hideStatus = !showUploadStatus && !showObsStatus && !explore;
  const showObsStatusOnly = ( !showUploadStatus && showObsStatus ) || explore;
  const { isDebug } = useDebugMode( );

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
      layout={layout}
      needsEdit={isDebug && !!observation?.missingBasics()}
      onPress={onPress}
      progress={progress}
      uniqueKey={observation.uuid}
      queued={queued}
    >
      {obsStatus}
    </UploadStatus>
  );
};

export default ObsUploadStatus;
