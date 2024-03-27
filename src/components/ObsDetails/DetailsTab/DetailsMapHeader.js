// @flow

import {
  Body4,
  ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  observation: Object,
  obscured?: boolean
}

const DetailsMapHeader = ( {
  observation,
  obscured
}: Props ): Node => {
  const { t } = useTranslation( );
  return (
    <View className="flex-col">
      <ObservationLocation
        observation={observation}
        obscured={obscured}
        withCoordinates
      />
      {obscured && (
        <Body4 className="italic">
          {t( "Obscured-observation-location-map-description" )}
        </Body4>
      ) }
    </View>
  );
};

export default DetailsMapHeader;
