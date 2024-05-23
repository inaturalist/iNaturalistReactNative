// @flow
import type { Node } from "react";
import React from "react";

import MyObservationsPressable from "./MyObservationsPressable";
import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

type Props = {
  observation: Object,
  gridItemWidth: number,
  layout: "list" | "grid",
  uploadSingleObservation?: Function,
  explore: boolean
};

const GUTTER = 15;

const ObsItem = ( {
  observation, layout, gridItemWidth, uploadSingleObservation, explore
}: Props ): Node => (
  <MyObservationsPressable
    observation={observation}
    testID={`MyObservationsPressable.${observation.uuid}`}
  >
    {
      layout === "grid"
        ? (
          <ObsGridItem
            observation={observation}
            // 03022023 it seems like Flatlist is designed to work
            // better with RN styles than with Tailwind classes
            style={{
              height: gridItemWidth,
              width: gridItemWidth,
              margin: GUTTER / 2
            }}
            uploadSingleObservation={uploadSingleObservation}
            explore={explore}
          />
        )
        : (
          <ObsListItem
            observation={observation}
            uploadSingleObservation={uploadSingleObservation}
            explore={explore}
          />
        )
    }
  </MyObservationsPressable>
);

export default ObsItem;
