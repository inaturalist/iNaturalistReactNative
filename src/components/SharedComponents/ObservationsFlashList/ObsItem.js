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
  uploadObservation?: Function,
  uploadState: Object
};

const GUTTER = 15;

const ObsItem = ( {
  observation, layout, gridItemWidth, uploadState, uploadObservation
}: Props ): Node => (
  <MyObservationsPressable observation={observation} testID="MyObservationsPressable">
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
            uploadObservation={uploadObservation}
            uploadState={uploadState}
          />
        )
        : (
          <ObsListItem
            observation={observation}
            uploadObservation={uploadObservation}
            uploadState={uploadState}
          />
        )
    }
  </MyObservationsPressable>
);

export default ObsItem;
