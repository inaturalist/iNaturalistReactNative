// @flow
import type { Node } from "react";
import React from "react";

import MyObservationsPressable from "./MyObservationsPressable";
import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

type Props = {
  checkUserCanUpload: Function,
  explore: boolean,
  gridItemWidth: number,
  layout: "list" | "grid",
  observation: Object
};

const GUTTER = 15;

const ObsItem = ( {
  checkUserCanUpload,
  explore,
  gridItemWidth,
  layout,
  observation
}: Props ): Node => (
  <MyObservationsPressable
    observation={observation}
    testID={`MyObservationsPressable.${observation.uuid}`}
  >
    {
      layout === "grid"
        ? (
          <ObsGridItem
            checkUserCanUpload={checkUserCanUpload}
            explore={explore}
            observation={observation}
            // 03022023 it seems like Flatlist is designed to work
            // better with RN styles than with Tailwind classes
            style={{
              height: gridItemWidth,
              width: gridItemWidth,
              margin: GUTTER / 2
            }}

          />
        )
        : (
          <ObsListItem
            checkUserCanUpload={checkUserCanUpload}
            explore={explore}
            observation={observation}
          />
        )
    }
  </MyObservationsPressable>
);

export default ObsItem;
