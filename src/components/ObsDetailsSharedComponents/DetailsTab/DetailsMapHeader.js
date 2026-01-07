// @flow

import ObscurationExplanation from "components/ObsDetailsSharedComponents/DetailsTab/ObscurationExplanation";
import {
  ObservationLocation,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  currentUser: { id: number },
  observation: Object
}

const DetailsMapHeader = ( {
  currentUser,
  observation,
}: Props ): Node => (
  <View className="flex-1 flex-col">
    <ObservationLocation
      observation={observation}
      withCoordinates
    />
    {observation.obscured && (
      <ObscurationExplanation
        textClassName="mt-3"
        observation={observation}
        currentUser={currentUser}
      />
    ) }
  </View>
);

export default DetailsMapHeader;
