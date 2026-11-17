import ObscurationExplanation
  from "components/ObsDetailsSharedComponents/DetailsTab/ObscurationExplanation";
import {
  ObservationLocation,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import type { Geoprivacy } from "realmModels/geoprivacy";

interface Props {
  currentUser: { id: number } | null;
  observation: {
    // Read by DetailsMapHeader and ObscurationExplanation
    obscured?: boolean | null;
    privateLatitude?: number | null;
    user: {
      id: number;
    };
    // Read by ObservationLocation
    geoprivacy?: Geoprivacy;
    taxon_geoprivacy?: Geoprivacy;
    // checkCamelAndSnakeCase looks up both casings
    placeGuess?: string | null;
    place_guess?: string | null;
    privatePlaceGuess?: string | null;
    private_place_guess?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    privateLongitude?: number | null;
    positional_accuracy?: number | null;
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
