import { ObsStatus, UploadStatus } from "components/SharedComponents";
import React from "react";
import type { RealmObservation } from "realmModels/types";

interface Props {
  classNameMargin?: string;
  explore?: boolean;
  layout: "horizontal" | "vertical";
  observation: RealmObservation;
  onPress: ( ) => void;
  progress?: number;
  queued: boolean;
  showObsStatus?: boolean;
  white?: boolean;
  isSimpleObsStatus?: boolean;
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
  white = false,
  isSimpleObsStatus = false
}: Props ) => {
  const showUploadStatus = typeof ( progress ) === "number";
  const hideStatus = !showUploadStatus && !showObsStatus && !explore;
  const showObsStatusOnly = ( !showUploadStatus && showObsStatus ) || explore;

  const obsStatus = (
    <ObsStatus
      observation={observation}
      layout={layout}
      white={white}
      classNameMargin={classNameMargin}
      testID={`ObsStatus.${observation.uuid}`}
      isSimpleObsStatus={isSimpleObsStatus}
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
      needsEdit={observation?.missingBasics()}
      onPress={onPress}
      progress={progress}
      uniqueKey={observation.uuid}
      queued={queued}
      obsStatus={obsStatus}
    />
  );
};

export default ObsUploadStatus;
