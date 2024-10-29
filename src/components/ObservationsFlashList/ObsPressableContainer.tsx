import { RealmContext } from "providers/contexts.ts";
import React, { useCallback } from "react";
import RealmObservation from "realmModels/Observation";
import useStore from "stores/useStore";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";
import ObsPressable from "./ObsPressable";

const { useRealm } = RealmContext;

// TODO remove when we figure out how to type the Realm models
interface Observation extends RealmObservation {
  uuid: string;
}

type Props = {
  explore: boolean,
  handleIndividualUploadPress: Function,
  gridItemStyle: Object,
  layout: "list" | "grid",
  observation: Observation,
  obsListKey: string
};

const ObsItem = ( {
  explore,
  handleIndividualUploadPress,
  gridItemStyle,
  layout,
  observation,
  obsListKey
}: Props ) => {
  const realm = useRealm( );
  // 20240529 amanda - filtering in realm is a fast way to look up sync status
  const obsNeedsSync = RealmObservation.filterUnsyncedObservations( realm )
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
