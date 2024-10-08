// @flow
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React from "react";
import Observation from "realmModels/Observation";

import MyObservationsPressable from "./MyObservationsPressable";
import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

const { useRealm } = RealmContext;

type Props = {
  explore: boolean,
  handleIndividualUploadPress: Function,
  gridItemStyle: Object,
  layout: "list" | "grid",
  observation: Object
};

const ObsItem = ( {
  explore,
  handleIndividualUploadPress,
  gridItemStyle,
  layout,
  observation
}: Props ): Node => {
  const realm = useRealm( );
  const allUnsyncedObservations = Observation.filterUnsyncedObservations( realm );
  // 20240529 amanda - filtering in realm is a fast way to look up sync status
  const needsSync = allUnsyncedObservations.filtered( `uuid == '${observation.uuid}'` );
  const showUploadStatus = needsSync.length > 0;

  return (
    <MyObservationsPressable
      observation={observation}
      testID={`MyObservationsPressable.${observation.uuid}`}
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
    </MyObservationsPressable>
  );
};

export default ObsItem;
