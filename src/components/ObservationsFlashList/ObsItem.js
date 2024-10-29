// @flow
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useCallback } from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";
import ObsPressable from "./ObsPressable";

const { useRealm } = RealmContext;

type Props = {
  explore: boolean,
  handleIndividualUploadPress: Function,
  gridItemStyle: Object,
  layout: "list" | "grid",
  observation: Object,
  obsListKey: String
};

const ObsItem = ( {
  explore,
  handleIndividualUploadPress,
  gridItemStyle,
  layout,
  observation,
  obsListKey
}: Props ): Node => {
  const realm = useRealm( );
  // 20240529 amanda - filtering in realm is a fast way to look up sync status
  const obsNeedsSync = Observation.filterUnsyncedObservations( realm )
    .filtered( `uuid == '${observation.uuid}'` )
    .length > 0;

  const totalUploadProgress = useStore( state => state.totalUploadProgress );
  const obsUploadState = totalUploadProgress.find( o => o.uuid === observation.uuid );
  const uploadProgress = obsNeedsSync
    ? obsUploadState?.totalProgress || 0
    : obsUploadState?.totalProgress;

  const onPress = useCallback(
    ( ) => handleIndividualUploadPress( observation.uuid ),
    [handleIndividualUploadPress, observation.uuid]
  );

  return (
    <ObsPressable
      observation={observation}
      obsListKey={obsListKey}
      testID={`ObsPressable.${observation.uuid}`}
    >
      {
        layout === "grid"
          ? (
            <ObsGridItem
              explore={explore}
              onPress={onPress}
              observation={observation}
              // 03022023 it seems like Flatlist is designed to work
              // better with RN styles than with Tailwind classes
              style={gridItemStyle}
              uploadProgress={uploadProgress}
            />
          )
          : (
            <ObsListItem
              explore={explore}
              onPress={onPress}
              observation={observation}
              uploadProgress={uploadProgress}
            />
          )
      }
    </ObsPressable>
  );
};

export default ObsItem;
