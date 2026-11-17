import ObscurationExplanation
  from "components/ObsDetailsSharedComponents/DetailsTab/ObscurationExplanation";
import {
  ObservationLocation,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

interface Props {
  currentUser: { id: number } | null;
  observation: {
    obscured?: boolean;
    privateLatitude?: number;
    user: {
      id: number;
    };
  };
}

const DetailsMapHeader = ( {
  currentUser,
  observation,
}: Props ) => (
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
