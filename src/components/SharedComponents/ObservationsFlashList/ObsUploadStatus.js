// @flow

import { ObsStatus, UploadStatus } from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";

const { useRealm } = RealmContext;

type Props = {
  checkUserCanUpload: Function,
  classNameMargin?: string,
  layout?: "horizontal" | "vertical",
  observation: Object,
  white?: boolean,
};

const ObsUploadStatus = ( {
  checkUserCanUpload,
  classNameMargin,
  layout,
  observation,
  white = false
}: Props ): Node => {
  const realm = useRealm( );
  const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );
  // 20240529 amanda - filtering in realm is a fast way to look up sync status
  const needsSync = allUnsyncedObservations.filtered( `uuid == '${observation.uuid}'` );
  const showUploadStatus = needsSync.length > 0;
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
