// @flow
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React from "react";
import Observation from "realmModels/Observation";

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
  const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );
  // 20240529 amanda - filtering in realm is a fast way to look up sync status
  const needsSync = allUnsyncedObservations.filtered( `uuid == '${observation.uuid}'` );
  const showUploadStatus = needsSync.length > 0;

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
              handleIndividualUploadPress={handleIndividualUploadPress}
              observation={observation}
              showUploadStatus={showUploadStatus}
              // 03022023 it seems like Flatlist is designed to work
              // better with RN styles than with Tailwind classes
              style={gridItemStyle}

            />
          )
          : (
            <ObsListItem
              explore={explore}
              handleIndividualUploadPress={handleIndividualUploadPress}
              showUploadStatus={showUploadStatus}
              observation={observation}
            />
          )
      }
    </ObsPressable>
  );
};

export default ObsItem;
